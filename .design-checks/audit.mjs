import { chromium } from "playwright-core";

const base = "http://localhost:3000";
const exe =
  "C:/Users/joysh/AppData/Local/ms-playwright/chromium-1194/chrome-win/chrome.exe";

const browser = await chromium.launch({ executablePath: exe });

const audit = async (width, height, label) => {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(base, { waitUntil: "networkidle" });

  const info = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const h1 = document.querySelector("h1");
    const h1Style = h1 ? getComputedStyle(h1) : null;
    const em = document.querySelector("h1 em");
    const emStyle = em ? getComputedStyle(em) : null;
    const logo = document.querySelector('[aria-label="Ariel home"] span:last-child');
    const logoStyle = logo ? getComputedStyle(logo) : null;
    return {
      bodyBg: body.backgroundColor,
      bodyColor: body.color,
      bodyFont: body.fontFamily,
      h1Text: h1 ? h1.textContent.trim() : null,
      h1Size: h1Style ? h1Style.fontSize : null,
      h1Font: h1Style ? h1Style.fontFamily : null,
      emColor: emStyle ? emStyle.color : null,
      emStyleTag: emStyle ? `${emStyle.fontStyle} ${emStyle.fontFamily}` : null,
      logoFont: logoStyle ? logoStyle.fontFamily : null,
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });
  console.log(`\n--- ${label} (${width}x${height}) ---`);
  console.log(JSON.stringify(info, null, 2));
  await page.close();
};

await audit(1440, 900, "home desktop");
await audit(390, 844, "home mobile");
await audit(320, 700, "home tiny");

// horizontal overflow across all top-level pages at mobile
const checkOverflow = async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
  const routes = ["/", "/Pricing", "/About", "/Chat", "/Login", "/Settings"];
  for (const route of routes) {
    await page.goto(base + route, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`320px overflow on ${route}: ${overflow} (scrollWidth ${sw})`);
  }
  await page.close();
};
await checkOverflow();

await browser.close();
