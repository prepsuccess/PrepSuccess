// Builds the prep guides: guides/<name>.html → public/guides/<name>.pdf (A4),
// printed by Playwright's Chromium. Run `npm run guides:build` after editing a guide.
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const source = resolve("guides");
const out = resolve("public/guides");
const files = readdirSync(source).filter((f) => f.endsWith(".html"));

const footer =
  '<div style="width:100%;font-size:8px;color:#5b6270;padding:0 16mm;' +
  'display:flex;justify-content:space-between;font-family:Arial">' +
  "<span>PrepSuccess · prep guide</span>" +
  '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>';

const browser = await chromium.launch();
const page = await browser.newPage();
for (const file of files) {
  await page.goto(pathToFileURL(resolve(source, file)).href, { waitUntil: "load" });
  const pdf = resolve(out, file.replace(/\.html$/, ".pdf"));
  await page.pdf({
    path: pdf,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: footer,
  });
  console.log(`Built ${pdf}`);
}
await browser.close();
