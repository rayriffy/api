import { Elysia } from "elysia";

import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

import { router as appleMaps } from "./packlets/appleMaps/router";
import { router as walletPasses } from "./packlets/walletPasses/router";

export const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/", ({ redirect }) => redirect("/swagger"))
  .use(appleMaps)
  .use(walletPasses)
  .listen(3000);

console.log(
  `🦊 Swagger is running at http://${app.server?.hostname}:${app.server?.port}/swagger`,
);
