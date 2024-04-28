import jwt from "jsonwebtoken";

const { APPLE_PRIVATE_KEY = "", APPLE_KEY_ID, APPLE_TEAM_ID } = process.env;

export const generateMapKitToken = (keyDuration = 60 * 60) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const age = 30 * 60; // 30 minutes
  const expiredAt = issuedAt + age;

  return jwt.sign(
    {
      alg: "ES256",
      iss: APPLE_TEAM_ID,
      iat: issuedAt,
      exp: expiredAt,
      origin: "https://javascriptbangkok.com",
    },
    APPLE_PRIVATE_KEY.replaceAll(/\\n/g, "\n"),
    {
      issuer: APPLE_TEAM_ID,
      expiresIn: 60 * 60, // 1 hour
      algorithm: "ES256",
      header: {
        alg: "ES256",
        kid: APPLE_KEY_ID,
        typ: "JWT",
      },
    },
  );
};
