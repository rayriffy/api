import { app } from "./index";

const server = app.listen(3000, () => {
  console.log(
    `🦊 Swagger is running at https://${app.server?.hostname}:${app.server?.port}/swagger`,
  );
});
