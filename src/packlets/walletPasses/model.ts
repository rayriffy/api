import { t } from "elysia";

export const gartenPassModel = t.Object({
  user: t.Object({
    name: t.String(),
    ticket: t.Object({
      type: t.String(),
      ref: t.String(),
    }),
  }),
  event: t.Object({
    id: t.String(),
    name: t.String(),
    date: t.Date(),
    image: t.String(),
    location: t.String(),
  }),
});
