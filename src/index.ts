import { Elysia } from "elysia";

import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

import { router as appleMaps } from "./packlets/appleMaps/router";
import { router as walletPasses } from "./packlets/walletPasses/router";

export const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/", ({ set }) => (set.redirect = "/swagger"))
  .use(appleMaps)
  .use(walletPasses);

export type App = typeof app;
