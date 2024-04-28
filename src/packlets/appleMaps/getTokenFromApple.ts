import { load } from "cheerio";
import memoize from "memoize";

export const getTokenFromApple = memoize(
  async () => {
    const content = await fetch("https://developer.apple.com/maps/web/").then(
      (o) => {
        if (o.ok) return o.text();
        else throw new Error("failed to fetch");
      },
    );

    const $ = load(content);

    const jwtToken = $("span#mapkit-token").attr()?.["data-token"];

    if (jwtToken === undefined) throw new Error("failed to get token");

    return jwtToken;
  },
  {
    maxAge: 1000 * 60 * 20, // 20 minutes
  },
);
