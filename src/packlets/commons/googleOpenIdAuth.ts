import { Context } from "elysia";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { JWTPayload } from "../walletPasses/types";

interface Options {
  audiences: string[];
  allowedEmails: string[];
}

export const googleOpenIdAuthHandler =
  ({ audiences, allowedEmails }: Options) =>
  async ({ headers, set }: Context) => {
    const match = (headers["authorization"] ?? "").match(/^Bearer (.+)$/);

    if (match === null) {
      set.status = 400;
      set.headers["WWW-Authenticate"] =
        `Bearer realm='sign', error="invalid_request"`;

      return "Unauthorized";
    }

    const [_, token] = match;

    const result = await jwtVerify<JWTPayload>(
      token,
      createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs")),
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
  };
