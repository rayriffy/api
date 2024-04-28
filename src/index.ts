import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

import { router as appleMaps } from "./packlets/appleMaps/router";

const app = new Elysia().use(swagger()).use(cors()).use(appleMaps).listen(3000);

console.log(
  `🦊 Swagger is running at https://${app.server?.hostname}:${app.server?.port}/swagger`,
);
