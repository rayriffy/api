import jwt from "jsonwebtoken";
import memoize from "memoize";

const { MAP_PRIVATE_KEY = "", MAP_KEY_ID, APPLE_TEAM_ID } = process.env;

export const generateMapKitToken = memoize(() => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const age = 30 * 60; // key expires in 30 minutes
  const expiredAt = issuedAt + age;

  return jwt.sign(
    {
      alg: "ES256",
      iss: APPLE_TEAM_ID,
      iat: issuedAt,
      exp: expiredAt,
      origin: "javascriptbangkok.com",
    },
      MAP_PRIVATE_KEY.replaceAll(/\\n/g, "\n"),
    {
      algorithm: "ES256",
      header: {
        alg: "ES256",
        kid: MAP_KEY_ID,
        typ: "JWT",
      },
    },
  );
}, {
    maxAge: 1000 * 60 * 20, // 20 minutes
});
