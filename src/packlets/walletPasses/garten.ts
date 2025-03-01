import { Elysia } from "elysia";

import { PKPass } from "passkit-generator";
import sharp from "sharp";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { assetLoader, certs } from "./fileLoader";
import { gartenPassModel } from "./model";
import { googleOpenIdAuthHandler } from "../commons/googleOpenIdAuth";
import { downloadImage } from "./downloadImage";
import { getMapHandler } from "./getMapHandler";

const { APPLE_TEAM_ID, PASS_GARDEN_SIGNER_KEY } = process.env;

dayjs.extend(utc);

const parseDate = (date: Date) => dayjs(date).utcOffset(7);

export const garten = new Elysia({
  prefix: "/garten",
})
  .onBeforeHandle(
    googleOpenIdAuthHandler({
      allowedEmails: ["creatorsgarten@rayriffy-api.iam.gserviceaccount.com"],
      audiences: ["https://github.com/rayriffy/api"],
    }),
  )
  // .get("/map", getMapHandler)
  .get(
    "/apple",
    async ({ query, set }) => {
      const { event, user } = query;

      // download an image
      const image = await downloadImage(event.image);

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

      const parsedDate = parseDate(event.date);
      const parsedEndDate = event.endDate ? parseDate(event.endDate) : null;

      // building the pass
      const asset = assetLoader("garten.pass");
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
          backgroundColor: "rgb(0, 168, 253)",
          labelColor: "rgb(255, 255, 255)",
          semantics: {
            eventName: event.name,
            eventType: "PKEventTypeConference",
            eventStartDate: parsedDate.startOf("day").toISOString(),
            eventEndDate: (parsedEndDate ?? parsedDate)
              .endOf("day")
              .toISOString(),
          },
        },
      );

      pass.setRelevantDate(parsedDate.startOf("day").toDate());

      pass.setBarcodes({
        format: "PKBarcodeFormatQR",
        message: user.ticket.ref,
        altText: user.ticket.ref,
      });

      pass.type = "eventTicket";
      pass.headerFields.push({
        key: "date",
        label: "DATE",
        value: `${parsedDate.format("DD MMM")}${parsedEndDate ? ` - ${parsedEndDate.format("DD MMM")}` : ""}`,
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
      pass.backFields.push({
        key: "notes",
        value: "Beta",
      });

      set.headers["Content-Type"] = pass.mimeType;
      set.headers["Content-disposition"] =
        `attachment; filename=${event.id}.pkpass`;

      return pass.getAsStream();
    },
    {
      query: gartenPassModel,
    },
  )
  .get(
    "/google",
    ({ set }) => (set.redirect = "https://www.apple.com/iphone/"),
  );
