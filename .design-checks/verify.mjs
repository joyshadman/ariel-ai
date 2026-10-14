import { chromium } from "playwright-core";

const base = "http://localhost:3000";
const out = ".design-checks";
const exe =
  "C:/Users/joysh/AppData/Local/ms-playwright/chromium-1194/chrome-win/chrome.exe";

const errors = [];
const watch = (page, tag) => {
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${tag} console] ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`[${tag} pageerror] ${e.message}`));
};
const shot = async (page, name) => {
  await page.waitForTimeout(650);
  await page.screenshot({ path: `${out}/${name}.png` });
  console.log("captured", name);
};
const overflow = (page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );

const browser = await chromium.launch({ executablePath: exe });

// ---------- desktop ----------
const d = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(d, "desktop");
await d.goto(base, { waitUntil: "networkidle" });
await shot(d, "01-home-desktop");
await d.screenshot({ path: `${out}/01b-home-desktop-full.png`, fullPage: true });

await d.getByRole("button", { name: "See pricing" }).click();
await shot(d, "02-pricing-desktop");
await d.getByRole("button", { name: "yearly" }).click();
await shot(d, "02b-pricing-yearly-desktop");

await d.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: "About", exact: true }).click();
await shot(d, "03-about-desktop");

await d.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: "Chat", exact: true }).click();
await shot(d, "04-chat-welcome-desktop");
await d.getByPlaceholder("Ask Ariel anything…").fill("Help me plan a calm week");
await d.getByLabel("Send message").click();
await shot(d, "04b-chat-typing-desktop");
await d.waitForTimeout(1500);
await shot(d, "04c-chat-reply-desktop");

await d.getByLabel("Open settings").click();
await shot(d, "05-settings-desktop");
await d.getByLabel("API key").fill("sk-test-1234567890d01a");
await d.getByRole("button", { name: "Save key" }).click();
await shot(d, "05b-settings-saved-desktop");

await d.getByRole("button", { name: "Ariel home" }).click();
await d.getByRole("button", { name: "Sign in" }).first().click();
await shot(d, "06-login-desktop");
await d.close();

// ---------- mobile 390 ----------
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
watch(m, "mobile");
await m.goto(base, { waitUntil: "networkidle" });
await shot(m, "10-home-mobile");
console.log("390 home overflow:", await overflow(m));
await m.getByLabel("Open menu").click();
await shot(m, "10b-home-mobile-menu");
await m.getByRole("navigation", { name: "Mobile" }).getByRole("button", { name: "Chat", exact: true }).click();
await shot(m, "11-chat-mobile");
await m.getByLabel("Back to home").click();
await m.getByRole("navigation", { name: "Product" }).getByRole("button", { name: "Settings" }).click();
await shot(m, "13-settings-mobile");
await m.getByRole("button", { name: "Ariel home" }).click();
await m.getByLabel("Open menu").click();
await m.getByRole("navigation", { name: "Mobile" }).getByRole("button", { name: "Sign in" }).click();
await shot(m, "12-login-mobile");
await m.close();

// ---------- tiny 320 overflow sweep via SPA ----------
const t = await browser.newPage({ viewport: { width: 320, height: 700 } });
watch(t, "tiny");
const check = async (label) => {
  const o = await overflow(t);
  console.log(`320 overflow ${label}: ${o}`);
};
await t.goto(base, { waitUntil: "networkidle" });
await check("home");
await t.getByRole("button", { name: "See pricing" }).click();
await check("pricing");
await t.getByLabel("Open menu").click();
await t.getByRole("navigation", { name: "Mobile" }).getByRole("button", { name: "About", exact: true }).click();
await check("about");
await t.getByLabel("Open menu").click();
await t.getByRole("navigation", { name: "Mobile" }).getByRole("button", { name: "Chat", exact: true }).click();
await check("chat");
await t.getByLabel("Back to home").click();
await t.getByRole("navigation", { name: "Product" }).getByRole("button", { name: "Settings" }).click();
await check("settings");
await t.getByRole("button", { name: "Ariel home" }).click();
await t.getByLabel("Open menu").click();
await t.getByRole("navigation", { name: "Mobile" }).getByRole("button", { name: "Sign in" }).click();
await check("login");
await t.close();

// ---------- reduced motion ----------
const r = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
watch(r, "reduced");
await r.goto(base, { waitUntil: "networkidle" });
await shot(r, "20-home-reduced-motion");
await r.close();

await browser.close();
console.log("\n=== console/page errors ===");
console.log(errors.length ? errors.join("\n") : "none");
