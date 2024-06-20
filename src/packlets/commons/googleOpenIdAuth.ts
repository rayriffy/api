import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { JWTPayload } from "../walletPasses/types";

interface Options {
  audiences: string[];
  allowedEmails: string[];
}

export const googleOpenIdAuth = ({ audiences, allowedEmails }: Options) => {
  return (app: Elysia) => {
    const plugin = new Elysia({
      name: "google-openid-auth",
    })
      .use(bearer())
      .onBeforeHandle(async ({ bearer, set }) => {
        const result = await jwtVerify<JWTPayload>(
          bearer!,
          createRemoteJWKSet(
            new URL("https://www.googleapis.com/oauth2/v3/certs"),
          ),
          {
            issuer: "https://accounts.google.com",
            audience: audiences,
          },
        ).catch(() => null);

        if (
          process.env.NODE_ENV === "production" &&
          (result === null ||
            !result.payload.email_verified ||
            !allowedEmails.includes(result.payload.email))
        ) {
          set.status = 400;
          set.headers["WWW-Authenticate"] =
            `Bearer realm='sign', error="invalid_request"`;

          return "Unauthorized";
        }
      });

    return app.use(plugin);
  };
};
