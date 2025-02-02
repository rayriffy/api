import { Elysia, t } from "elysia";
import { googleOpenIdAuthHandler } from "../commons/googleOpenIdAuth";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export const router = new Elysia({
  name: "scraper",
  prefix: "/scraper",
})
  .decorate('browser', await puppeteer
    .use(StealthPlugin())
    .launch({
      args: ['--disable-blink-features=PrettyPrintJSONDocument'],
      headless: false,
      defaultViewport: {
        width: 1190,
        height: 700
      },
      targetFilter: target => target.type() !== 'other'
    })
  )
  .onBeforeHandle(
    googleOpenIdAuthHandler({
      allowedEmails: ["actions-hdata@rayriffy-api.iam.gserviceaccount.com"],
      audiences: ["https://github.com/rayriffy/api"],
    }),
  )
  .get('/puppet', async ({ browser, query: { url } }) => {
    const page = await browser.newPage()
    await page.goto(url, {
      waitUntil: 'networkidle0',
    })

    // if hit cloudflare, then maybe wait faster?
    if ((await page.title()).toLowerCase().includes('just a moment'))
      await page.waitForNetworkIdle()

    const content = await page.content()
    await page.close()
    return content
  }, {
    query: t.Object({
      url: t.String(),
    }),
  })
  .onStop(() => {})
