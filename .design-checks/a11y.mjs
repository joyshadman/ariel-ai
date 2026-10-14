import { chromium } from "playwright-core";

const base = "http://localhost:3000";
const exe =
  "C:/Users/joysh/AppData/Local/ms-playwright/chromium-1194/chrome-win/chrome.exe";

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const snap = async (route) => {
  await page.goto(base + route, { waitUntil: "networkidle" });
  const yaml = await page.locator("body").ariaSnapshot();
  console.log(`\n========== ${route} ==========`);
  console.log(yaml.slice(0, 2600));
};

for (const route of ["/", "/Pricing", "/About", "/Login", "/Settings"]) {
  await snap(route);
}

await browser.close();
