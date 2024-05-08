import {Browser, ElementHandle, Frame, Page} from 'puppeteer';

import * as randomUseragent from 'random-useragent';

// import * as puppeteer from "puppeteer-extra";
// import * as StealthPlugin from "puppeteer-extra-plugin-stealth";

//Enable stealth mode
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// const randomUseragent = require('random-useragent');
//
// //Enable stealth mode
// const puppeteer = require('puppeteer-extra')
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';

async function createPage (browser,url): Promise<Page> {

  //Randomize User agent or Set a valid one
  const userAgent = randomUseragent.getRandom();
  const UA = userAgent || USER_AGENT;
  const page = await browser.newPage();
  // const [page] = await browser.pages();

  //Randomize viewport size
  await page.setViewport({
    width: 1920 + Math.floor(Math.random() * 100),
    height: 3000 + Math.floor(Math.random() * 100),
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: false,
    isMobile: false,
  });

  await page.setUserAgent(UA);
  await page.setJavaScriptEnabled(true);
  await page.setDefaultNavigationTimeout(0);

  //Skip images/styles/fonts loading for performance
  // await page.setRequestInterception(true);
  // page.on('request', (req) => {
  //   if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });

  await page.evaluateOnNewDocument(() => {
    // Pass webdriver check
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  await page.evaluateOnNewDocument(() => {
    // Pass chrome check
    // @ts-ignore
    window.chrome = {
      runtime: {},
      // etc.
    };
  });

  await page.evaluateOnNewDocument(() => {
    //Pass notifications check
    const originalQuery = window.navigator.permissions.query;
    return window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission }) as Promise<PermissionStatus>
        : originalQuery(parameters)
    );
  });

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, 'plugins', {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5],
    });
  });

  await page.evaluateOnNewDocument(() => {
    // Overwrite the `languages` property to use a custom getter.
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });

  await page.goto(url, { waitUntil: 'networkidle2',timeout: 0 } );
  return Promise.resolve(page);
}

// const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
// const userAgent = randomUseragent.getRandom();
// const UA = userAgent || USER_AGENT;

async function splitWiseTest(page: Page, browser?: Browser) {
  const url = 'https://secure.splitwise.com/#/groups/64402115';

  // await page.setUserAgent(USER_AGENT);
  if(browser) {
    page = await createPage(browser, url);
  }
  else {
    // Navigate the page to a URL
    await page.goto(url);
    // Set screen size
    await page.setViewport({width: 1080, height: 1024});
  }

  // // Type into search box
  // await page.type('.devsite-search-field', 'automate beyond recorder');
  //
  // // Wait and click on first result
  // const searchResultSelector = '.devsite-result-item-link';
  // await page.waitForSelector(searchResultSelector);
  // await page.click(searchResultSelector);
  //
  // // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector(
  //   'text/Customize and automate'
  // );
  // const fullTitle = await textSelector?.evaluate(el => el.textContent);
  //
  // // Print the full title
  // console.log('The title of this blog post is "%s".', fullTitle);

  try {
    await page.waitForSelector("xpath///a[contains(text(), \"or continue to the Splitwise website\")]", { timeout: 3000 })
      .then(e => e.click());
  } catch (e) {
    console.warn("no mobile check");
  }

  await page.waitForSelector("xpath///a[contains(text(), \"Connexion\") or contains(text(), \"Log in\")]")
    .then(e => e.click());

  const emailIn = await page.waitForSelector("input[type=email]");
  await emailIn.click();
  await emailIn.type("lezzhumain@gmail.com");

  const passIn = await page.waitForSelector("input[type=password]");
  await passIn.click();
  await passIn.type("nIlgSNDmjZUc");


  const elementHandle: ElementHandle = await page.waitForSelector("iframe[title=reCAPTCHA]");
  const frame: Frame = await elementHandle.contentFrame();
  const el = await frame.waitForSelector("#recaptcha-anchor");
  await el.click();

  // const re = await page.$("#recaptcha-anchor");
  // await page.waitForSelector("#recaptcha-anchor").then(e => e.click());

  // capcha here...

  await page.waitForSelector("input[value=Connexion]").then(e => e.click());
}

function delay(time: number) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time)
  });
}

async function captureScreenshot(page: Page, screenshotPath = "example.png") {
  try {
    // Capture screenshot and save it
    await page.screenshot({ path: screenshotPath });
    console.log("\n🎉 Screenshot captured successfully. Saved as:", screenshotPath);
  } catch (err) {
    console.error("❌ Error:", err.message);
    throw err;
  }
}

async function pixelCanvasIO(page: Page) {
  // let minX = -1000000;
  let minX = 0;
  // let minX = 99990;

  // let maxX = minX * -1;
  let maxX = 1010000;

  let x = minX;
  let width = 0;

  let minY = 0;
  let y = 0;

  let count = 0;

  let maxXset = false;

  // // Chrome Devtools Protocol session
  // const session = await page.target().createCDPSession()
  // const { windowId } = await session.send("Browser.getWindowForTarget")
  //
  // await delay(1000) // Delay for illustrative purposes
  //
  // // Fullscreen - different from maximize
  // await session.send("Browser.setWindowBounds", {
  //   windowId,
  //   bounds: { windowState: "maximized" },
  // });

  const canvHandled = [];
  while (y < maxX) {
    while (x < maxX) {
      // Navigate the page to a URL
      await page.goto(`https://pixelcanvas.io/@${x},${y},-1`, {waitUntil: "networkidle2"});
      if (width === 0) {
        await page.waitForSelector("canvas");
        await page.waitForFunction(() => {
          const res = Math.max(...Array.from(document.querySelectorAll("canvas")).map(e => Number(e.style.transform.replace(/.+\((-?\d+)px.+/, "$1"))));
          return !!res;
        });
        const allCan = await page.$$eval("canvas", (canvases: HTMLCanvasElement[]) => {
          const values: number[] = canvases.map(e => Number(e.style.transform.replace(/.+\((-?\d+)px.+/, "$1")));
          return Math.max(...values);
        });
        width = allCan;
        count = Math.round((maxX - minX) / 400);
      }

      // const canvasHTMLs: string[] = await page.$$eval("canvas", (cans: HTMLCanvasElement[]) => {
      //   // function isCanvasBlank(canvas) {
      //   //   const context = canvas.getContext('2d');
      //   //   const pixelBuffer = new Uint32Array(
      //   //     context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
      //   //   );
      //   //   return !pixelBuffer.some(color => color !== 0);
      //   // }
      //
      //   function checkCanvasBlank(canvas, offset = 4) {
      //     const context = canvas.getContext('2d');
      //     const pixelBuffer = new Uint32Array(
      //       context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
      //     );
      //
      //     //const cols = pixelBuffer.map(color => color);
      //     const pixelBufferFiltered = pixelBuffer.filter((c, index) => pixelBuffer.indexOf(c) === index);
      //
      //     return pixelBufferFiltered.length <= offset;
      //   }
      //
      //   const targets = cans.filter(c => !checkCanvasBlank(c));
      //   return targets.map(t => t.outerHTML);
      // });
      //
      // const filtered: string[] = canvasHTMLs.filter(c => !canvHandled.includes(c));
      //
      // const notBlank: boolean = filtered.length > 0;

      const notBlank: boolean = await page.$$eval("canvas", (cans: HTMLCanvasElement[]) => {
        function isCanvasBlank(canvas) {
          const context = canvas.getContext('2d');
          const pixelBuffer = new Uint32Array(
            context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
          );
          // return !pixelBuffer.some(color => color !== 0);
          return pixelBuffer.filter(color => color !== 4294967295).length < 10;
        }

        return cans.some(c => !isCanvasBlank(c));
      });

      if (notBlank) {
        // canvHandled.push(...filtered);
        await captureScreenshot(page, `tile_${x}_${y}.png`);
      } else {
        console.log("Max x: " + x);
        if (!maxXset) {
          maxX = x;
          maxXset = true;
        }
        break;
      }
      x += width * 4; // 1600
    }
    y += 1200;
    x = minX;
  }

  console.log("Done");
}

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--start-maximized',
      '--no-sandbox', // discouraged, see https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
      '--window-size=1920,978',
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials'
    ]
  });

  // await splitWiseTest(null, browser);
  const page = await browser.newPage();
  await pixelCanvasIO(page);

  await browser.close();
})();

//const puppeteer = require('puppeteer');
// const puppeteerExtra = require('puppeteer-extra');
// const pluginStealth = require('puppeteer-extra-plugin-stealth');
// const randomUseragent = require('random-useragent');
//
// class PuppeteerService {
//
//   constructor() {
//     this.browser = null;
//     this.page = null;
//     this.pageOptions = null;
//     this.waitForFunction = null;
//     this.isLinkCrawlTest = null;
//   }
//
//   async initiate(countsLimitsData, isLinkCrawlTest) {
//     this.pageOptions = {
//       waitUntil: 'networkidle2',
//       timeout: countsLimitsData.millisecondsTimeoutSourceRequestCount
//     };
//     this.waitForFunction = 'document.querySelector("body")';
//     puppeteerExtra.use(pluginStealth());
//     //const browser = await puppeteerExtra.launch({ headless: false });
//     this.browser = await puppeteerExtra.launch({ headless: false });
//     this.page = await this.browser.newPage();
//     await this.page.setRequestInterception(true);
//     this.page.on('request', (request) => {
//       if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
//         request.abort();
//       } else {
//         request.continue();
//       }
//     });
//     this.isLinkCrawlTest = isLinkCrawlTest;
//   }
//
//   async crawl(link) {
//     const userAgent = randomUseragent.getRandom();
//     const crawlResults = { isValidPage: true, pageSource: null };
//     try {
//       await this.page.setUserAgent(userAgent);
//       await this.page.goto(link, this.pageOptions);
//       await this.page.waitForFunction(this.waitForFunction);
//       crawlResults.pageSource = await this.page.content();
//     }
//     catch (error) {
//       crawlResults.isValidPage = false;
//     }
//     if (this.isLinkCrawlTest) {
//       this.close();
//     }
//     return crawlResults;
//   }
//
//   close() {
//     if (!this.browser) {
//       this.browser.close();
//     }
//   }
// }
//
// const puppeteerService = new PuppeteerService();
// module.exports = puppeteerService;
