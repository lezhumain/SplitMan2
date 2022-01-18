import {Browser, Viewport} from "puppeteer";
import * as puppeteer from "puppeteer";

const honor10Viewport: Viewport = {
  width: 360,
  height: 631,
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
  isLandscape: false
}

export const honor10 = {
  name: "Honor 10",
  userAgent: "",
  viewport: honor10Viewport
};

function getHeadlessParam(): boolean {
  const regex = /-headless[= ](\w+)/;
  const param = process.argv.find(a => regex.test(a));
  const target = param?.replace(regex, "$1");

  return target
    ? target === "true"
    : true;
}

export async function CreateBrowsers(): Promise<[Browser, Browser]> {
  const isHeadless: boolean = getHeadlessParam();

  const pupArgs = {
    headless: isHeadless,
    defaultViewport: null,
    args: [
      '--disable-web-security',
      '--start-maximized',
      '--no-sandbox', // discouraged, see https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
      '--window-size=1920,978'
    ],
    // executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    // executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  };

  const browser = await puppeteer.launch(pupArgs),
        browser1 = await puppeteer.launch(JSON.parse(JSON.stringify(pupArgs)));

  return Promise.resolve([browser, browser1]);
}
