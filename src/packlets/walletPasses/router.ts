import { Elysia } from "elysia";

import { garten } from "./garten";

export const router = new Elysia({
  prefix: "/walletPasses",
}).use(garten);
