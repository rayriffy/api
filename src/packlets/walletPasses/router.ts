import { Elysia } from "elysia";

import { PKPass } from "passkit-generator";
import sharp from "sharp";

import { asset, certs, load } from "./fileLoader";
import { gartenPassModel } from "./model";

const { APPLE_TEAM_ID, PASS_GARDEN_SIGNER_KEY } = process.env;

export const router = new Elysia({
  prefix: "/walletPasses",
}).get(
  "/garten",
  async ({ query, set }) => {
    const { event, user } = query;

    // download an image
    const image = await fetch(event.image).then((o) => o.arrayBuffer());

    // process image into 2 sizes
    const sharpenImage = sharp(image).png({
      compressionLevel: 7,
    });

    const [thumbnail, thumbnail2x, wwdr, signerCert, signerKey] =
      await Promise.all([
        sharpenImage.resize(150, 150).toBuffer(),
        sharpenImage.resize(300, 300).toBuffer(),
        certs("wwdr"),
        certs("garten/cert"),
        certs("garten/key"),
      ]);

    // building the pass
    const pass = new PKPass(
      Object.fromEntries(
        await Promise.all([
          asset("background.png"),
          asset("background@2x.png"),
          asset("icon.png"),
          asset("icon@2x.png"),
          asset("logo.png"),
          asset("logo@2x.png"),
          asset("secondaryLogo.png"),
          asset("secondaryLogo@2x.png"),
          ["thumbnail.png", thumbnail],
          ["thumbnail@2x.png", thumbnail2x],
        ]),
      ),
      {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: PASS_GARDEN_SIGNER_KEY,
      },
      {
        formatVersion: 1,
        passTypeIdentifier: "pass.org.creatorsgarten.events",
        teamIdentifier: APPLE_TEAM_ID,
        organizationName: "Creatorsgarten",
        description: "Creatorsgarten Event Ticket",
        serialNumber: `${event.id}-${user.ticket.ref}`,
        foregroundColor: "rgb(255, 255, 255)",
        backgroundColor: "rgb(0, 0, 0)",
        labelColor: "rgb(255, 255, 255)",
        logoText: "Text",
      },
    );

    pass.setRelevantDate(new Date("2024-07-13T08:00+07:00"));

    pass.setBarcodes({
      format: "PKBarcodeFormatQR",
      message: user.ticket.ref,
      altText: user.ticket.ref,
    });

    pass.type = "eventTicket";
    pass.headerFields.push({
      key: "date",
      label: "DATE",
      value: "13 Jul",
    });
    pass.primaryFields.push({
      key: "event",
      label: "EVENT",
      value: event.name,
    });
    pass.secondaryFields.push({
      key: "loc",
      label: "LOCATION",
      value: event.location,
    });
    pass.auxiliaryFields.push(
      {
        key: "name",
        label: "NAME",
        value: user.name,
      },
      {
        key: "ticket",
        label: "TICKET",
        value: user.ticket.type,
      },
    );

    set.headers["Content-Type"] = pass.mimeType;
    set.headers["Content-disposition"] =
      `attachment; filename=${event.id}.pkpass`;

    return pass.getAsStream();
  },
  {
    query: gartenPassModel,
  },
);
