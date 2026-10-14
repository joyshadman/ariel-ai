import { chromium } from "playwright-core";

const base = "http://localhost:3000";
const exe =
  "C:/Users/joysh/AppData/Local/ms-playwright/chromium-1194/chrome-win/chrome.exe";

const browser = await chromium.launch({ executablePath: exe });
const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
await page.goto(base, { waitUntil: "networkidle" });

const offenders = await page.evaluate(() => {
  const vw = window.innerWidth;
  const out = [];
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.right > vw + 0.5 || r.left < -0.5) {
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString().slice(0, 70)) || "",
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        text: (el.textContent || "").trim().slice(0, 40),
      });
    }
  });
  return out.slice(0, 30);
});

console.log(JSON.stringify(offenders, null, 2));
await browser.close();
