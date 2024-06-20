export interface JWTPayload {
  aud: string;
  azp: string;
  email: string;
  email_verified: boolean;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
}
