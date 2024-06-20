import { Elysia } from "elysia";
import { getTokenFromApple } from "./getTokenFromApple";

export const router = new Elysia({
  name: "appleMaps",
  prefix: "/appleMaps",
}).get("/token", ({ set }) => {
  set.headers["CDN-Cache-Control"] = "max-age=" + 60 * 20;
  return getTokenFromApple();
});
