import { Context } from "elysia";

/*
body {
  app: 'hostmanager'
}

derived: {
  foo: string
}
 */

export const getMapHandler = ({
  set,
  body,
  foo,
}: Context<
  {
    body: {
      app: string;
    };
  },
  {
    decorator: {
      foo: string;
    };
    store: {};
    derive: {};
    resolve: {};
  }
>) => {};
