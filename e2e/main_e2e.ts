import * as puppeteer from 'puppeteer';
import {Browser, ClickOptions, ElementHandle, HTTPRequest, JSHandle, Page} from "puppeteer";

// @ts-ignore
import {expect} from "chai";
import {badData} from "./data/bugData";
import {allExpenses} from "./data/allExpenses";
import {from, Subject} from "rxjs";
import {filter, first} from "rxjs/operators";
import {flatMap} from "rxjs/internal/operators";
import {Expense} from "../src/app/models/expense";
import {CreateBrowsers, honor10} from "./e2e_utils";
import * as https from 'https';

import * as fs from "fs";
// import {badData} from "./data/bugData";

// see https://stackoverflow.com/a/69199854/3482730
// process.on('beforeExit', (code) => {
//   //beforeExit will run if out of callbacks, but not on an exit()
//   console.log('We seem to be exiting purely because there are no more awaits scheduled instead of having reached and exit.  Assuming this is bad behavior from the browser process. previous exit code: ', code);
//   process.exit(1);
// });

const userData = {
  email: "a",
  username: "a",
  pass: "a"
};

const userData1 = {
  email: "s",
  username: "s",
  pass: "s"
};

const xpeopleMarseille = [
  {
    name: "Dju",
    dayCount: 2
  },
  {
    name: "Max",
    dayCount: 2
  },
  {
    name: "Suzie",
    dayCount: 2
  },
  {
    name: "Elyan",
    dayCount: 2
  }
];

async function clickAndDelay(e: ElementHandle, opt?: ClickOptions, delayMs = 300): Promise<null> {
  return e.click(opt).then(() => {
    return waitForMS(delayMs);
  })
}

async function waitForMS(number: number): Promise<null> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, number);
  });
}

// class ElementHandle extends puppeteer.ElementHandle<Element> {
//   click(options?: ClickOptions): Promise<void> {
//     return super.click(options).then(() => waitForMS(500));
//   }
// }

async function scrollAndClick(elm: ElementHandle, pag: Page) {
  await pag.evaluate((selector, eee) => {
    eee.scrollIntoView();
  }, "#addTravel", elm);

  await pag.waitForTimeout(1000); // TODO add "travel search"
  return elm.click();
}

async function clearAndType(e: ElementHandle, s: string) {
  await waitForMS(200);
  return clickAndDelay(e, { clickCount: 3 }).then(() => {
    return e.type(s);
  });

  // return e.clea
}

async function handleSecrutiyStuff(page: Page, doThrow = false) {
  await page.waitForTimeout(500);
  const hasErrorXpath = "#details-button";
  const hasError = await page.waitForSelector(hasErrorXpath, {visible: true})
    .then((e: ElementHandle) => e, () => null);

  if (hasError) {
    await hasError.click();
    // await page.waitForSelector(hasErrorXpath, {hidden: true})

    const proceedXpath = "#proceed-link";
    const e = await page.waitForSelector(proceedXpath, {visible: true});
    await page.waitForTimeout(200);
    await e.click();
    // await page.waitForSelector(proceedXpath, {hidden: true});

    // await page.waitForFunction((sel: string) => {
    //   return document.querySelector(sel) === null;
    // }, {timeout: 5000}, proceedXpath);
  }
}

async function getTravelList(page: Page): Promise<string[]> {
  return page.$$(".travel-card .row:first-child .col")
    .then((res: ElementHandle[]) => {
      return Promise.all(res.map((e: ElementHandle) => e.getProperty("innerText")))
        .then((res: JSHandle[]) => {
          return res.map(r => r.remoteObject().value as string);
        });
    });
}

async function getExpenseList(page: Page): Promise<string[]> {
  return page.$$(".expense-card")
    .then((res: ElementHandle[]) => {
      return Promise.all(res.map((e: ElementHandle) => e.getProperty("innerText")))
        .then((res: JSHandle[]) => {
          return res.map(r => r.remoteObject().value as string);
        });
    });
}

async function testCommonTravels(pages: puppeteer.Page[]) {
  const [travelList0, travelList1]: string[][] = await Promise.all(
  // return Promise.all(
    pages.map(page => {
      return getTravelList(page)
    })
  );

  const intersec: string[] = travelList0.filter((n: string) => travelList1.includes(n));

  for(const travel of intersec) {
    // open travel
    await Promise.all(
      pages.map(page => page.waitForXPath(`//app-travel-card//h6[contains(text(), '${travel}')]`, {visible: true})
        .then((e: ElementHandle) => e ? Promise.all([e.click(), page.waitForNavigation({timeout: 10000})]) : null))
    );

    await Promise.all(
      pages.map(page => page.waitForXPath("//h3[contains(text(), 'Expenses')]"))
    );

    // get expenses

    const [expenseList0, expenseList1]: string[][] = await Promise.all(
      // return Promise.all(
      pages.map(page => {
        return getExpenseList(page);
      })
    );

    // compare expenses
    expect(expenseList0.length).to.equal(expenseList1.length);
    for(const ex of expenseList0) {
      expect(expenseList1).to.include(ex);
      expect(expenseList0.indexOf(ex)).to.equal(expenseList1.indexOf(ex));
    }

    // back
    await Promise.all(
      pages.map(page => page.waitForSelector("div.iconWrapper > i.fa-arrow-left")
        .then((e: ElementHandle) => e ? Promise.all([e.click(), page.waitForNavigation({timeout: 10000})]) : null))
    );
  }
  console.log("okff");
}

async function handleLogout(pag: Page) {
  // try {
    // await pag.waitForSelector(".fa-user", {visible: true})
    //   .then((e: ElementHandle) => e ? e.click() : null);

    const userIcon: ElementHandle = await pag.waitForSelector(".fa-user", {visible: true});
    console.log("1");
    const userIconColor: string = await pag.evaluate((eee) => {
      return window.getComputedStyle(eee).color;
    }, userIcon);
    console.log("2");

    // logged out "rgb(255, 255, 255)"
    // logged in "rgb(0, 128, 0)"

    if(userIconColor === "rgb(255, 255, 255)") {
      console.log("Already logged out.");
      return;
    }

    await pag.evaluate(() => {window.scrollTo(0, 0);});

    await userIcon.click();
    await pag.waitForTimeout(300);

    await pag.waitForXPath("//a[contains(text(), 'Log out')]", {visible: true})
      .then((e: ElementHandle) => e ? Promise.all([e.click(), pag.waitForNavigation({timeout: 10000})]) : null);

    await pag.waitForTimeout(1000);

    expect(pag.url()).to.contain("/login");
    await pag.waitForTimeout(500);
  // } catch (e) {
  //   console.log("Logout errorm should be ok");
  //   // console.log(e);
  // }
}

async function handleLogin(pag: Page, userData: { pass: string; email: string; username: string }) {
  if(pag.url().endsWith("/travels")) {
    return;
  }

  try {
    await pag.waitForSelector("#username", {visible: true, timeout: 20000})
      .then((e: ElementHandle) => e ? e.type(userData.username) : null);

    await pag.waitForSelector("#password", {visible: true})
      .then((e: ElementHandle) => e ? e.type(userData.pass) : null);
  } catch (e) {
    console.log("login pass error:");
    console.log(e);

    // take screenshot
    // await takeScreenshot(pag, true);

    // upload screenshot to filebin

    throw new Error("login pass error:");
  }

  await pag.waitForTimeout(500);

  await pag.waitForXPath("//button[contains(text(), 'Login')]", {visible: true})
    .then((e: ElementHandle) => e ? Promise.all([e.click(), pag.waitForNavigation({timeout: 10000})]) : null);

  // await pag.waitForNavigation();

  await pag.waitForTimeout(500);

  // const toastSel = ".toast_SUCCESS#toast";
  // await pag.waitForSelector(toastSel, {visible: true, timeout: 10000});

  // const toastSel = "#toast";
  const toastSel = "#toast.toast_0";
  const elm = await pag.waitForSelector(toastSel, {visible: true, timeout: 10000});
  const classfg = await elm.getProperty("className").then((e: JSHandle) => e.remoteObject().value);
  console.log("\t" + classfg);

  console.log("a1")
  await pag.waitForSelector(toastSel, {hidden: true, timeout: 10000});
  console.log("a2")
}

let browser: Browser, browser1: Browser;

// async function MainTest0() {
//   browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     args: [
//       '--start-maximized',
//       '--no-sandbox' // discouraged, see https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
//     ],
//     // executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
//   });
//
//   // Wait for creating the new page.
//   const page = await browser.newPage();
//
//   page.setDefaultNavigationTimeout(5 * 60 * 1000);
//   page.setDefaultTimeout(5 * 60 * 1000);
//
//   await page.goto("https://www.speedtest.net/fr");
//
//   await page.waitForSelector("#_evidon-banner-acceptbutton").then((e: ElementHandle) => e?.click());
//
//   await page.waitForSelector(".js-start-test").then((e: ElementHandle) => e?.click());
//
//   await page.waitForNavigation({timeout: 120000});
//   expect(page.url()).to.contain("/result", "Didn't navigate to result");
//
//   const [ping, desc, asdc] = await page.waitForSelector(".result-container-data", {visible: true})
//     .then((e: ElementHandle) => {
//       return e?.getProperty("innerText");
//     }).then((e: JSHandle | undefined) => {
//       const value: string = e?.remoteObject().value;
//       const match = /PING ms\n ?(\d+)\n ?DESCENDANT Mbps\n ?(\d+\.\d+)\n ?ASCENDANT Mbps\n ?(\d+\.\d+)/.exec(value);
//
//       if(!match || match.length !== 4) {
//         return [];
//       }
//
//       return [match[1], match[2], match[3]];
//     });
//   // debugger;
// }

async function checkRepartition(thePage: Page, repart: string) {
  // check repartition
  await thePage.waitForSelector("#profile-tab", {visible: true, timeout: 10000})
    .then((e: ElementHandle) => e ? scrollAndClick(e, thePage) : null);

  const res0 = await thePage.$("app-repartition > div > div:last-child")

  const res1: ElementHandle[] = await thePage.$$("app-repartition > div > div").then((allLines: ElementHandle[]) => {
    return allLines.filter((l: ElementHandle, lIndex: number) => {
      return lIndex < allLines.length - 1; // remove last
    });
  });

  const res: string = await Promise.all(
    res1.map(e => {
      return e?.getProperty("innerText")
        .then((e: ElementHandle) => {
          return e?.remoteObject().value;
        });
    })
  ).then((allText: string[]) => {
    return allText.join(" ");
  });


  // const res: string = await thePage.waitForSelector ("app-repartition", {visible: true})
  //   .then((e: ElementHandle) => e?.getProperty("innerText"))
  //   .then((e: ElementHandle) => {
  //     return e?.remoteObject().value;
  //   });

  const trimedRes = res.replace(/\n/g, " ").replace(/ +/g, " ").trim();


  if(trimedRes !== repart) {
    // throw "Wrong repartition!: " + res;
    throw `Wrong repartition!: ${trimedRes} - ${repart}`;
  }

  const url = thePage.url();
  await thePage.reload();

  await thePage.waitForNavigation({timeout: 5000}).then(() => {}, () => {});
  await thePage.setDefaultTimeout(5000);

  const currentURL = thePage.url();
  const lastBit = currentURL.replace(host, "");

  try {
    expect(currentURL).to.equal(url);
  } catch (e) {
    expect(currentURL).to.contain(`returnUrl=${encodeURIComponent(lastBit)}`);
  }
}

// const host = `https://86.18.16.122:8083`; // TODO cmd line arg to switch
// const host = `http://127.0.0.1:4200`;
const host = "https://192.168.0.19:8081";

const url = `${host}/login`;


let getCount = 0,
  // inviteGetCountFor: {[key: string]: number} = null
  inviteGetCount = 1, inviteTravelName = "";

async function addInviteHandler(page1: Page, userDatum: any) {
  await page1.setRequestInterception(true);
  // inviteGetCountFor[userDatum.username] = 0;
  const handler = async (request: puppeteer.HTTPRequest) => {
    // console.log(request);
    try {
      if (/\/get$/.test(request.url())) {
        // inviteGetCountFor[userDatum.username] += 1;
        // const inviteGetCount = inviteGetCountFor[userDatum.username];

        const bd: any[] = badData.slice();
        const travels = bd.filter(b => b.type === "travel");
        const travel = travels[0];

        inviteTravelName = travel.name;

        // remove travels but one
        let newbd: any[] = bd.filter(b => b.type !== "travel");
        newbd.push(travel);

        // TODO use a single reduce loop

        // remove expenses
        newbd = newbd.filter(nn => nn.type !== "expense" || nn.tripID == travel.id);

        // remove invites
        const users = newbd.filter(n => n.type === "user"); // looks like these are references

        // debugger;
        // let inviteObj: {userName: string, inv: any[]} = {userName: "s", []};

        let sInvites: any[] = [], aInvites: any[] = [];

        // if(getCount === 1) {
        //   const sInv = {tripID: travel.tripID, isAccpeted: false},
        //         aInv = {tripID: travel.tripID, isAccpeted: true};
        //   invites = [{tripID: travel.tripID, isAccpeted: false}];
        // }

        if (inviteGetCount === 1) {
          aInvites = [{tripID: travel.id, isAccepted: true}];
        }
        else if (inviteGetCount === 2) {
            sInvites = [{tripID: travel.id, isAccepted: false}];
            aInvites = [{tripID: travel.id, isAccepted: true}];
          }
        else {
          sInvites = [{tripID: travel.id, isAccepted: true}];
          aInvites = [{tripID: travel.id, isAccepted: true}];
        }

        users.forEach(u => {
          if(u.username === "s") {
            u.invites = sInvites.slice();
          }
          else if(u.username === "a") {
            u.invites = aInvites.slice();
          }
          else {
            u.invites = [];
          }
          // u.invites = invites.slice()
        });

        // debugger;

        await request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": "true"},
          body: JSON.stringify(newbd)
        });
      } else {
        await request.continue();
      }
    } catch (e) {
      // debugger;
      // await request.continue();

      if(!e.toString().includes("Request is already handled")) {
        console.error(e);
        throw e;
      }
    }
  };

  page1.on('request', handler);

  // const ts = getTestState();
  // page1.on('response', async (response) => {
  //   // console.log(response);
  //   if (/\/get$/.test(response.url())) {
  //     debugger;
  //   }
  // });

  return Promise.resolve(handler);
}

async function addHamdler(page1: Page, userDatum: any) {
  await page1.setRequestInterception(true);
  const handler = async (request: puppeteer.HTTPRequest) => {
    // console.log(request);
    try {
      if (/\/get$/.test(request.url())) {
        getCount += 1;
        const bd = badData;
        await request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify(badData)
        });
      } else if (/\/login$/.test(request.url())) {
        // getCount += 1;
        const bd = JSON.parse(JSON.stringify(badData));
        const user = bd.find(a => a.type === "user"
          && a.password === userDatum.pass
          && a.email === userDatum.email
          && a.username === userDatum.username);

        await request.respond({
          status: 200,
          contentType: 'application/json',
          headers: {"Access-Control-Allow-Origin": "*"},
          body: JSON.stringify(user)
        });
      } else {
        await request.continue();
      }
    } catch (e) {
      // debugger;
      // await request.continue();
    }
  };

  page1.on('request', handler);

  // const ts = getTestState();
  // page1.on('response', async (response) => {
  //   // console.log(response);
  //   if (/\/get$/.test(response.url())) {
  //     debugger;
  //   }
  // });

  return Promise.resolve(handler);
}

async function checkTravelCount(number: number, page: Page) {
  const travelElems = await page.$$(".travel-card");
  expect(travelElems.length).to.equal(number);
  await travelElems[0].click();

  await page.waitForXPath("//h3[contains(text(), 'Expenses')]");

  await page.waitForSelector("div.iconWrapper > i.fa-arrow-left")
    .then((e: ElementHandle) => e ? Promise.all([e.click(), page.waitForNavigation({timeout: 10000})]) : null);

  await page.waitForTimeout(1000);

  const travelElems1 = await page.$$(".travel-card");
  expect(travelElems1.length).to.equal(number, "Wrong travel count.");
}

let handlers = null;
let remHandlers: () => void = null;

async function testBackBug(pages: Page[]) {
  const page0 = pages[0],
    page1 = pages[1];

  const usersData = [userData, userData1];

  handlers = await Promise.all(
    pages.map((page: Page, index: number) => addHamdler(page, usersData[index]))
  );

  await Promise.all(
    [
      handleLogin(page0, userData),
      handleLogin(page1, userData1)
    ]
  );
  // await Promise.all(
  //   pages.map((page: Page, index: number) => handleLogin(page, usersData[index]))
  // );

  await Promise.all(
    [
      checkTravelCount(4, page0),
      checkTravelCount(3, page1)
    ]
  );

  // expect(getCount).to.equal(1);

  const [handler0, handler1] = handlers;
  remHandlers = async() => {
    await page0.setRequestInterception(false);
    page0.off('request', handler0);

    await page1.setRequestInterception(false);
    page1.off('request', handler1);
  }
}

async function testInvite(pages: Page[]) {
  const page0 = pages[0],
    page1 = pages[1];

  const usersData = [userData, userData1];

  handlers = await Promise.all(
    pages.map((page: Page, index: number) => addInviteHandler(page, usersData[index]))
  );

  await Promise.all(
    [
      handleLogin(page0, userData),
      // page1.waitForTimeout(300).then(() => handleLogin(page1, userData1))
      waitForMS(3000).then(() => handleLogin(page1, userData1))
    ]
  );
  // await Promise.all(
  //   pages.map((page: Page, index: number) => handleLogin(page, usersData[index]))
  // );

  // await Promise.all(
  //   [
  //     checkTravelCount(4, page0),
  //     checkTravelCount(3, page1)
  //   ]
  // );

  // expect(getCount).to.equal(1);

  // only page sees it

  // await Promise.all([
  //   page0.waitForXPath(`//h6[contains(text(), '${inviteTravelName}')]`, {visible: true, timeout: 10000}),
  //   page1.waitForSelector("i.notif", {visible: true, timeout: 5000})
  // ]);
  await page0.waitForXPath(`//h6[contains(text(), '${inviteTravelName}')]`, {visible: true, timeout: 10000});

  inviteGetCount = 2;
  await Promise.all([
    page0.reload(),
    page1.reload()
  ]);

  debugger;

  await Promise.all([
    page0.waitForXPath(`//h6[contains(text(), '${inviteTravelName}')]`, {visible: true, timeout: 10000}),
    page1.waitForSelector("i.notif", {visible: true, timeout: 5000})
  ]);

  inviteGetCount = 3;
  await Promise.all([
    page0.reload(),
    page1.reload()
  ]);

  await Promise.all([
    page0.waitForXPath(`//h6[contains(text(), '${inviteTravelName}')]`, {visible: true, timeout: 10000}),
    page1.waitForXPath(`//h6[contains(text(), '${inviteTravelName}')]`, {visible: true, timeout: 10000})
  ]);

  debugger;

  // await page0.waitForXPath(`//h6[contains(text(), '${inviteTravelName}')]`, {visible: true, timeout: 10000});
  // await page1.waitForSelector("i.notif", {visible: true, timeout: 5000});

  const [handler0, handler1] = handlers;
  remHandlers = async() => {
    await page0.setRequestInterception(false);
    page0.off('request', handler0);

    await page1.setRequestInterception(false);
    page1.off('request', handler1);
  }

  inviteTravelName = "";
}

async function removeHandlers(pages: Page[]) {
  // await Promise.all(
  //   pages.map((page: Page, index: number) => {
  //     return page.setRequestInterception(false)
  //       .then(() => {
  //         if(handlers && handlers[index]) {
  //           page.off('request', handlers[index])
  //         }
  //       });
  //   })
  // );

  if (remHandlers) {
    await remHandlers();
  }
}

async function MainTestInviteShows(params: any[]) {
  const page = await browser.pages().then((e: Page[]) => e[0]),
    page1 = await browser1.pages().then((e: Page[]) => e[0]);

  await page1.emulate(honor10);


  // try {
  const pages = [page, page1];

  await goToAndSecurity(pages);

  // logout
  await Promise.all(
    pages.map((pagee: Page) => handleLogout(pagee))
  );

  await testInvite(pages);

  await removeHandlers(pages);
}

async function MainTestBackBug(params: any[]) {
  const page = await browser.pages().then((e: Page[]) => e[0]),
    page1 = await browser1.pages().then((e: Page[]) => e[0]);

  await page1.emulate(honor10);

  // try {
    const pages = [page, page1];

    await goToAndSecurity(pages);

    // logout
    await Promise.all(
      pages.map((pagee: Page) => handleLogout(pagee))
    );

    await goToAndSecurity(pages);

    await testBackBug(pages);

    await testCommonTravels(pages);

    await removeHandlers(pages);

    // // logout
    // await Promise.all(
    //   pages.map((pagee: Page) => handleLogout(pagee))
    // );

  // } catch (e) {
  //   await Promise.all(
  //     [page, page1].map(thePage => takeScreenshot(thePage).then(link => console.log("Screenshot link : " + link)))
  //   );
  //
  //   throw e;
  // }
}

async function MainTestSQLLogin(params: any[]) {
  const page = await browser.pages().then((e: Page[]) => e[0]),
    page1 = await browser1.pages().then((e: Page[]) => e[0]);

  await page1.emulate(honor10);

  const pages = [page, page1];

  await goToAndSecurity(pages);

  const da = JSON.parse(JSON.stringify(userData));
  da.pass = "";

  // await Promise.all(
  //   [
  //     handleLoginSQL(page, userData),
  //     handleLoginSQL(page1, userData1)
  //   ]
  // );

  // logout
  await Promise.all(
    pages.map((pagee: Page) => handleLogout(pagee))
  );
}

async function goToAndSecurity(pages: Page[], target?: string) {
  let theURL = url;
  if(target) {
    theURL = theURL.replace("/login", target);
  }

  await Promise.all(
    pages.map(p => p.goto(theURL).then(() => {
    }, () => {
    }))
  );

  if (theURL.startsWith("https")) { // SSL security stuff
    await Promise.all(
      pages.map(p => handleSecrutiyStuff(p))
    );
  }
}

let pageDialogHandled = false;

const checkInvite$: Subject<any> = new Subject<any>();
// checkInvite$.pipe(
//   tak
// )

async function startCheckInviteCall(pag: Page) {
  // await pag.setRequestInterception(true);

  const handler = async(resp: puppeteer.HTTPResponse) => {
    // console.log(request);
    try {
      if (/\/get$/.test(resp.url())) {
        console.log("/get called");
        const result = await resp.json();
        // console.log(result);
        console.log("After invite:");
        const inv = result.find(a => a.type === "user" && a.username === "s").invites;
        console.log(inv);

        // let currentName = "";
        if(!inv.find(e => e.tripName === currentName)) {
          console.error("Couldn't find invite");
        }

        // debugger;
      }
    } catch (e) {
      // debugger;
    }
    finally {
      return Promise.resolve(resp);
    }
  };

  pag.on('response', async (r) => {
    return handler(r);
  });

  checkInvite$.pipe(
    filter(e => e === null),
    first(),
    flatMap(() => {
      return from(pag.setRequestInterception(true));
    })
  ).subscribe(() => {
    pag.off('response', handler);
  });

  checkInvite$.next(handler);


}

function stopCheckInviteCall(page: Page) {
  if(checkInvite$) {
    return;
  }

  checkInvite$.next(null);
}

let currentName = "";
function getTravelName() {
  currentName = `Test ${new Date().toUTCString()}`;
  return currentName;
}

async function addTravel(pag: Page): Promise<string> {
  // add travel
  // await page.waitForXPath("//button[contains(text(), 'Add travel')]", {visible: true})
  //   .then((e: ElementHandle) => e ? e.click() : null);
  const xpath = "//button[contains(text(), 'Add travel')]";
  const elm: ElementHandle | null = await pag.waitForXPath(xpath, {visible: true}).then((e: ElementHandle) => e, () => null);
  if (!elm) {
    throw "Couldn't get button";
  }
  // await page.evaluate((selector, eee) => {
  //   // console.log(eee);
  //   // debugger;
  //   // document.querySelector(selector).scrollIntoView();
  //   eee.scrollIntoView();
  // }, "#addTravel", elm);
  //
  // await elm.click();
  await Promise.all([
    scrollAndClick(elm, pag),
    pag.waitForNavigation({timeout: 10000})
  ]);

  const travelNAme = getTravelName();
  await pag.waitForSelector("#name", {visible: true})
    .then((e: ElementHandle) => e ? e.type(travelNAme, {delay: 30}) : null);

  await pag.waitForSelector("#description", {visible: true})
    .then((e: ElementHandle) => e ? e.type("E2E test travel", {delay: 30}) : null);

  await pag.waitForXPath("//button[contains(text(), 'Save Travel')]", {visible: true})
    .then((e: ElementHandle) => e ? Promise.all([e.click(), pag.waitForNavigation({timeout: 10000})]) : null);

  // await page.waitForNavigation();
  return Promise.resolve(travelNAme);
}

async function AddPeople(pag: Page) {
  const allPeople: { name: string, dayCount: number }[] = xpeopleMarseille.slice();
  for (const people of allPeople) {
    await pag.waitForSelector("#profile-tab1", {visible: true, timeout: 10000})
      .then((e: ElementHandle) => e ? e.click() : null);

    await pag.waitForTimeout(200);

    await pag.waitForXPath("//button[contains(text(), 'Add people')]", {visible: true})
      .then((e: ElementHandle) => e ? e.click() : null);

    await pag.waitForSelector("#name", {visible: true})
      .then((e: ElementHandle) => e ? e.type(people.name, {delay: 30}) : null);

    await pag.waitForSelector("#dayCount", {visible: true})
      .then((e: ElementHandle) => e ? clearAndType(e, people.dayCount.toString()) : null);

    await pag.waitForTimeout(200);

    const saveBtnXPath = "//button[contains(text(), 'Save')]";
    await pag.waitForXPath(saveBtnXPath, {visible: true})
      // .then((e: ElementHandle) => e ? e.click() : null);
      .then((e: ElementHandle) => e ? Promise.all([e.click(), pag.waitForNavigation({timeout: 10000})]) : null);

    console.log("a11")
    await pag.waitForXPath(saveBtnXPath, {hidden: true});
    console.log("a22")

    // await pag.waitForResponse("saveOne");
    // await pag.waitForTimeout(200);

    // await pag.waitForResponse("saveOne");

    await pag.waitForSelector("#payer", {timeout: 10000});

    await pag.waitForTimeout(2000);

  }

  await pag.waitForTimeout(2000);

  await pag.waitForSelector("#profile-tab1", {visible: true})
    .then((e: ElementHandle) => e ? e.click() : null);

  await pag.waitForTimeout(1000);

  const targetXXpath = "//h3[contains(text(), 'Participants')]//following-sibling::div//div[contains(@class, 'row')]";
  await pag.waitForXPath(targetXXpath);
  const allPeopleRes: ElementHandle[] = await pag.$x(targetXXpath) as ElementHandle[];
  expect(allPeopleRes.length).to.equal(allPeople.length);

}

async function SaveWhoWeAre(page: Page, dju: string) {
  // await page.waitForSelector("#payer", {visible: true})
  //   .then((e: ElementHandle) => e ? e.type(dju, {delay: 30}) : null);

  const sel = "#payer";
  await select(sel, dju, page);

  await page.waitForTimeout(300);

  const selSave = "#savePayer";
  await page.waitForSelector(selSave, {visible: true})
    .then((e: ElementHandle) => e ? e.click() : null);

  // await Promise.all([
  //   page.waitForSelector(sel, {hidden: true}),
  //   page.waitForSelector(selSave, {hidden: true})
  // ]);
}

async function AddExpenses(pag: Page, expenses: Expense[]) {
  for (const expense of expenses) {
    // TODO add expense with pag or page1 randomly

    await pag.waitForTimeout(1000);

    // await pag.waitForXPath("//button[contains(text(), 'Add expense')]", {visible: true})
    //   .then((e: ElementHandle) => e ? Promise.all([scrollAndClick(e, pag), pag.waitForNavigation({timeout: 10000})]) : null);
    const addExpBtn: ElementHandle =
      await pag.waitForXPath("//button[contains(text(), 'Add expense')]", {visible: true}) as ElementHandle;

    await scrollAndClick(addExpBtn, pag);
    await pag.waitForNavigation({timeout: 10000});


    await pag.waitForTimeout(1000);

    // await pag.waitForNavigation();

    await pag.waitForSelector("#name", {visible: true})
      .then((e: ElementHandle) => e ? e.type(expense.name, {delay: 30}) : null);

    await pag.waitForTimeout(800);

    await pag.waitForSelector("#amount", {visible: true})
      .then((e: ElementHandle) => e ? clearAndType(e, expense.amount.toString()) : null);

    // await pag.waitForSelector("#payer", {visible: true})
    //   .then((e: ElementHandle) => e ? e.click() : null);
    //
    // await pag.waitForXPath(`//option[contains(text(), '${expense.payer}')]`, {visible: true})
    //   .then((e: ElementHandle) => e ? e.click() : null);

    await pag.waitForSelector("#payer", {visible: true})
      .then((e: ElementHandle) => e ? e.type(expense.payer, {delay: 30}) : null);

    for (const payee of expense.payees) {
      const line = await pag.waitForXPath(`//span[contains(text(), '${payee.name}')]//ancestor::div[contains(@class, 'form-check')]`,
        {visible: true});

      await line?.$x(".//span[contains(@class, 'perc-sign')]//preceding-sibling::input")
        .then((e: ElementHandle[]) => e.length > 0 ? e[0].type(payee.e4xpenseRatio.toString(), {delay: 30}) : null);
    }

    await pag.waitForXPath("//button[contains(text(), 'Save Expense')]", {visible: true})
      .then((e: ElementHandle) => e ? Promise.all([scrollAndClick(e, pag), pag.waitForNavigation({timeout: 10000})]) : null);

    // await pag.waitForNavigation();
    await pag.waitForNetworkIdle();
    await pag.waitForTimeout(1000);
  }
}

async function EditLast(pag: Page, expenses: Expense[]) {
  // debugger;
  const lastTitle = expenses[expenses.length - 1].name;
  await pag.waitForXPath(`//div[contains(@class, 'expense-card')]//h6[contains(text(), '${lastTitle}')]`, {visible: true})
    .then((e: ElementHandle) => e ? Promise.all([scrollAndClick(e, pag), pag.waitForNavigation({timeout: 10000})]) : null);

  await pag.waitForXPath("//button[contains(text(), 'Edit expense')]", {visible: true})
    .then((e: ElementHandle) => e ? Promise.all([scrollAndClick(e, pag), pag.waitForNavigation({timeout: 10000})]) : null);

  await pag.waitForTimeout(300);

  await pag.waitForSelector("#amount", {visible: true})
    .then((e: ElementHandle) => e ? clearAndType(e, 34.23.toString()) : null);

  // debugger;

  await pag.waitForXPath("//button[contains(text(), 'Save Expense')]")
    .then((e: ElementHandle) => e ? scrollAndClick(e, pag) : null);
}

async function select(selector: string, email: string, page: Page) {
  // await sel.select(email);

  // await sel.click();
  // await page.waitForTimeout(200);
  // const option = await sel.$(`option[value=\"${email}\"]`)
  // await option.click();

  // const sel = await page.waitForSelector(selector, {visible: true});
  // await page.evaluate((e: HTMLSelectElement, em: string) => {
  //   // debugger;
  //   e.value = em;
  // }, sel, email);

  // await page.waitForSelector("#payer", {visible: true})
  //   .then((e: ElementHandle) => e ? e.type(dju, {delay: 30}) : null);

  // debugger;
  await page.select(selector, email);
  // debugger;
}

async function DoInvite(pag: Page, email: string) {

  const theHandler = async (r: HTTPRequest) => {
    if (/\/invite$/.test(r.url())) {
      console.warn("Calling /invite");
      // debugger;
    }
  };
  pag.on('request', theHandler);

  const inviteBtn: ElementHandle = await pag.waitForXPath(
    "//button[contains(text(), 'Invite')]", {visible: true}) as ElementHandle;
  await Promise.all([
    pag.waitForNavigation({waitUntil: "networkidle2"}),
    scrollAndClick(inviteBtn, pag)
  ]);

  // await pag.waitForNavigation();
  await pag.waitForTimeout(500);

  // send invite
  // await pag.waitForSelector("#email", {visible: true})
  //   .then((e: ElementHandle) => e ? clearAndType(e, email) : null);

  // await sel.select(email);
  await select("#payer", email, pag);

  // if (!pageDialogHandled) {
  //   pag.on("dialog", (dialog) => {
  //     console.log("dialog");
  //     try {
  //       dialog.accept();
  //     } catch (e) {
  //       if (!e.toString().includes("Cannot accept dialog which is already handled")) {
  //         throw e;
  //       }
  //     }
  //   });
  //   pageDialogHandled = true;
  // }

  await pag.waitForXPath("//button[contains(text(), 'Save')]", {visible: true})
    .then((e: ElementHandle) => e ? scrollAndClick(e, pag) : null);

  // await pag.waitForTimeout(1000);
  // await pag.keyboard.press('Enter');
  // // await pag.waitForNavigation();

  // respond to invite
  // debugger;

  const tosterMsg: string = await pag.waitForSelector("#toast", {visible: true, timeout: 20000})
    .then((e: ElementHandle) => e.getProperty("innerText"))
    .then((e: ElementHandle) => {
      return e.remoteObject().value;
    });

  console.log("Toaster msg: " + tosterMsg);
  expect(tosterMsg.toLowerCase()).to.contain("success");

  pag.off('request', theHandler);
}

async function doRegister(pag: Page) {
  // await pag.waitForXPath("//button[contains(text(), 'Save Travel')]", {visible: true})
  //   .then((e: ElementHandle) => e ? Promise.all([e.click(), pag.waitForNavigation({timeout: 10000})]) : null);

  await pag.waitForXPath("//button[contains(text(), 'Register')]", {visible: true})
    .then((e: ElementHandle) => e ? Promise.all([e.click(), pag.waitForNavigation({timeout: 10000})]) : null);

  const tstamp = (new Date()).getTime();
  const name = `Dju_${tstamp}`, email = `dju_${tstamp}@lol.com`, pass ="secretPASS";

  await pag.waitForSelector("#email", {visible: true, timeout: 20000})
    .then((e: ElementHandle) => e ? e.type(email) : null);

  await pag.waitForSelector("#username", {visible: true, timeout: 20000})
    .then((e: ElementHandle) => e ? e.type(name) : null);

  await pag.waitForSelector("#password", {visible: true, timeout: 20000})
    .then((e: ElementHandle) => e ? e.type(pass) : null);

  await pag.waitForSelector("#password1", {visible: true, timeout: 20000})
    .then((e: ElementHandle) => e ? e.type(pass) : null);

  await pag.waitForXPath("//button[contains(text(), 'Register')]", {visible: true})
    .then((e: ElementHandle) => e ? Promise.all([e.click(), pag.waitForNavigation({timeout: 10000})]) : null);

  expect(pag.url()).to.contain("/login");

  await handleLogin(pag, {pass: pass, email: email, username: name})

  debugger;
}


async function MainRegister(params: any[]) {
  let isError = null;

  try {

    // Wait for creating the new page.
    const page = await browser.pages().then((e: Page[]) => e[0]),
      page1 = await browser1.pages().then((e: Page[]) => e[0]);

    await page1.emulate(honor10);

    const pages = [page, page1];

    // await page.goto(url).then(() => {}, () => {});
    await goToAndSecurity(pages/*, "/register"*/);

    // logout
    await Promise.all(
      pages.map((pagee: Page) => handleLogout(pagee))
    );

    await doRegister(page);
    debugger;
  } catch (e) {
    console.error(e);
    isError = e;
  } finally {
    // // logout
    // await Promise.all(
    //   pages.map((pagee: Page) => handleLogout(pagee))
    // );

    const [page] = await getPagse();
    stopCheckInviteCall(page);

    if(isError) {
      throw isError;
    }
  }
}

async function MainTest(params: any[]) {
  let isError = null;

  // const targetExepense = params[0];
  // const targetReparttion = params[1];
  const [targetExepense, targetReparttion, inviteOnly] = params;



  let pages = [];

  try {

    // Wait for creating the new page.
    const page = await browser.pages().then((e: Page[]) => e[0]),
      page1 = await browser1.pages().then((e: Page[]) => e[0]);

    await page1.emulate(honor10);

    pages = [page, page1];

    // await page.goto(url).then(() => {}, () => {});
    await goToAndSecurity(pages);

    // logout
    try {
      await Promise.all(
        pages.map((pagee: Page) => handleLogout(pagee))
      );
    } catch (e) {
      console.log("Log out failed");
    }

    // login
    await Promise.all(
      [
        handleLogin(page, userData),
        waitForMS(3000).then(() => handleLogin(page1, userData1))
      ]
    );

    const travelNAme = await addTravel(page);

    await page.screenshot({path: "gogogo.png"});


    await page.reload(); // TODO remove me
    await page.waitForTimeout(10000);

    const sizes = await page.evaluate(() => {
      return `${window.outerHeight} ${window.outerWidth}`;
    });
    console.log(sizes);

    await page.screenshot({path: "gogogo.png"});


    // // await page.waitForXPath(`//h6[contains(text(), '${travelNAme}')]`, {visible: true, timeout: 10000})
    // //   .then((e: ElementHandle) => e ? scrollAndClick(e, page) : null);
    // const titleTravel =  await page.waitForXPath(`//h6[contains(text(), '${travelNAme}')]`, {visible: true, timeout: 10000});
    // if(!titleTravel) {
    //   throw "Couldn't find travel " + travelNAme;
    // }
    // await Promise.all([
    //   scrollAndClick(titleTravel, page),
    //   page.waitForNavigation({timeout: 10000})
    // ]);

    // if(!eeee) {
    //   throw "EEEError";
    // }
    // await page.evaluate((selector, eee) => {
    //   // console.log(eee);
    //   // debugger;
    //   // document.querySelector(selector).scrollIntoView();
    //   eee.scrollIntoView();
    // }, "#addTravel", eeee);
    //
    // await eeee.click();

    // Add people
    await AddPeople(page);

    await SaveWhoWeAre(page, "Dju");

    // add expenses
    await page.waitForSelector("#home-tab", {visible: true})
      .then((e: ElementHandle) => e ? scrollAndClick(e, page) : null);

    if (!inviteOnly) {
      const expenses = targetExepense;

      await AddExpenses(page, expenses);

      // edit last expense
      await EditLast(page, expenses);

      await checkRepartition(page, targetReparttion);
    }
    else {
      await page.waitForTimeout(1000);
      // debugger;
      await startCheckInviteCall(page);
      await Promise.all([
        page.reload({timeout: 3000}),
        page.waitForNavigation({timeout: 5000})
      ]);
      // debugger;
      await page.waitForSelector("#home-tab", {visible: true})
        .then((e: ElementHandle) => e ? scrollAndClick(e, page) : null);
    }

    // debugger;
    await page.waitForTimeout(200);

    // send invite
    await DoInvite(page, userData1.email);

    await Promise.all(
      pages.map(page => page.waitForTimeout(2000))
    );

    await page1.reload();
    await page1.waitForTimeout(3000);
    // await page1.waitForNavigation();

    // debugger;
    let skipNotif = false;

    // await page1.waitForSelector("i.notif", {visible: true})
    //   .then((e: ElementHandle) => e?.click());
    const elmeu: ElementHandle | null = await page1.waitForSelector("i.notif", {visible: true, timeout: 10000})
      .then((e: ElementHandle) => e, () => null);

    if(inviteOnly && !elmeu) {
      throw "/invite error: couldn't find notif element";
    }

    if (elmeu) {
      await elmeu.click();

      await page1.waitForTimeout(500);

      await page1.waitForSelector("i.accept", {visible: true})
        .then((e: ElementHandle) => e?.click());

      await page1.waitForTimeout(500);

      // await page1.waitForSelector(".iconWrapper i.fa-arrow-left", {visible: true})
      //   .then((e: ElementHandle) => e?.click());
      const backBtn = await page1.waitForSelector(".iconWrapper i.fa-arrow-left", {visible: true});
      await Promise.all([
        backBtn.click(),
        page1.waitForNavigation({timeout: 10000})
      ]);

      await page1.waitForTimeout(1000);
      await page1.reload();
      await page1.waitForTimeout(3000);
    }

    // await page1.waitForXPath(`//h6[contains(text(), '${travelNAme}')]`, {visible: true})
    //   .then((e: ElementHandle) => e ? scrollAndClick(e, page) : null);

    console.log("Waiting for travel " + travelNAme);
    await page.screenshot({path: "p1travel.png"});
    // debugger;
    const travelEl: ElementHandle =
      await page1.waitForXPath(`//h6[contains(text(), '${travelNAme}')]`, {visible: true}) as ElementHandle;
    console.log("Got travel " + travelNAme);

    await Promise.all([
      scrollAndClick(travelEl, page1),
      page1.waitForNavigation()
    ]);

    await page1.waitForTimeout(2000);

    if (elmeu) {
      await page1.waitForSelector("#payer", {visible: true})
        .then((e: ElementHandle) => e ? e.type("Max", {delay: 30}) : null);

      console.log("Saving who we are");

      await page1.waitForSelector("#savePayer", {visible: true})
        .then((e: ElementHandle) => e ? scrollAndClick(e, page1) : null);
    }

    await page1.waitForTimeout(1000);

    if (!inviteOnly) {
      await checkRepartition(page1, targetReparttion);
    }

    // TODO say who we are

  } catch (e) {
    console.error(e);
    isError = e;
  } finally {
    // // logout
    // await Promise.all(
    //   pages.map((pagee: Page) => handleLogout(pagee))
    // );

    const [page] = await getPagse();
    stopCheckInviteCall(page);

    if(isError) {
      throw isError;
    }
  }
}

async function runMiny(_: string[]) {
  const [pa] = await getPagse();

  await pa.goto("https://puppeteer.github.io/puppeteer/");

  await pa.waitForXPath("//h1[contains(text(), 'Puppeteer')]", {visible: true, timeout: 10000});
}


async function takeScreenshot(page: Page, doPrivNote = true) {
  const brow = page.browser();
  const pa = await brow.newPage();

  const fileName = "./screen.jpeg";
  const data: string = await page.screenshot({path: fileName, type: "jpeg", encoding: "base64", quality: 33})
    .then((e: Buffer) => e.toString());

  if (doPrivNote) {
    return doPrivNoteFn(pa, data);
    // await uploadToFilebin(data, fileName);
  } else {
    return Promise.resolve("");
  }
}

async function httpPOSTFile(url: string, data: string, fileName: string) {
  const u = new URL(url);
  const filecomtet = fs.readFileSync(fileName);
  const bytes = new TextEncoder().encode(fileName);
  // debugger;
  return new Promise((resolve, reject) => {
    const options = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname,
      method: 'POST',
      headers: {
        'X-Custom': 'xxx',
        'Content-Length': filecomtet.length,
        'Content-Type': "image/png"
      }
    };

    const req = https.request(options, (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);

      res.on('data', (d) => {
        // process.stdout.write(d);
        resolve(d.toString());
      });
    });

    req.on('error', (e) => {
      // console.error(e);
      reject(e);
    });
    // req.write(bytes);
    req.write(filecomtet);
    req.end();
  });
}

async function httpGET(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
      let resu = "";

      res.on('data', (d) => {
        resu += d.toString();
        resolve(resu);
      });

      res.on('response', (resp) => {
        debugger;
        resolve("resp");
      });

      res.on('finish', (resp) => {
        debugger;
        resolve("resp");
      });

    }).on('error', (e) => {
      console.error(e);
      reject(e);
    });
  });
}

async function getBinID(): Promise<string> {
  // const binID: string = await httpGET("https://filebin.net");
  // const match = /filebin.net\/([^"]+)"/.exec(binID);
  // return Promise.resolve(match && match.length >= 2 ? match[1] : null);

  return httpGET("https://filebin.net").then((binID) => {
    const match = /filebin.net\/([^"]+)"/.exec(binID);
    return match && match.length >= 2 ? match[1] : null;
  });
}

async function uploadToFilebin(data: string, filePath: string) {
  const binID: string = await getBinID();
  console.log("Using bin " + binID);
  const bits = filePath.replace(/\\|\//g, "===").split("===");
  const fileName = bits[bits.length - 1];
  const postURL = "https://filebin.net/" + binID + "/" + fileName;
  console.log("postURL: " + postURL);
  return httpPOSTFile(postURL, data, filePath);
}

async function doPrivNoteFn(pa, data: string) {
  await pa.goto("https://privnote.com/#");

  const el = await pa.waitForSelector("#note_raw", {visible: true, timeout: 10000});

  const result = data;

  // faster than .type(data)
  await pa.evaluate((pData: string, pEl: HTMLInputElement) => {
    pEl.value = pData;
  }, data, el);
  // await el.type(result);

  await pa.waitForSelector("#encrypt_note").then((e: ElementHandle) => e.click());

  await pa.waitForResponse("https://privnote.com/legacy/");

  // let v = null;
  // while(!v) {
  //   v = await pa.waitForSelector("#note_link_input")
  //     .then((e: ElementHandle) => e.getProperty("value"))
  //     .then((e: ElementHandle) => {
  //       return e.remoteObject().value;
  //     });
  //
  //   if(!v) {
  //     await pa.waitForTimeout(500);
  //   }
  // }

  await pa.waitForTimeout(500);
  const v = await pa.waitForSelector("#note_link_input")
    .then((e: ElementHandle) => e.getProperty("value"))
    .then((e: ElementHandle) => {
      return e.remoteObject().value;
    });

  return pa.close().then(() => v);
}

async function runPrivNote(_: string[]) { //: Promise<string> {
  // const isHeadless: boolean = getHeadlessParam();
  // console.log(`isHeadless: ${isHeadless}`);
  // const pupArgs = {
  //   headless: isHeadless,
  //   defaultViewport: null,
  //   args: [
  //     '--disable-web-security',
  //     '--start-maximized',
  //     '--no-sandbox' // discouraged, see https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
  //   ],
  //   // executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  //   // executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  // };
  //
  // const br = await puppeteer.launch(pupArgs);
  // const pa = await br.pages().then((e: ElementHandle) => e[0]);

  const pa = await browser.pages().then((e: Page[]) => e[0]);

  const link = await takeScreenshot(pa);
  console.log("Screenshot link: " + link);

  // await br.close();
}

async function getPagse(): Promise<Page[]> {
  return Promise.all([browser, browser1].map(b => b? b.pages().then((e: Page[]) => e[0]) : null));
}

async function runAll() {
// const testList = [MainTest0/*, MainTest*/];
  const res = await CreateBrowsers();
  browser = res[0];
  browser1 = res[1];

  const testList = [
    // // {
    // //   fn: runPrivNote,
    // //   msg: "PrivNote test",
    // //   params: undefined
    // // },
    // // {
    // //   fn: runMiny,
    // //   msg: "Mini test",
    // //   params: undefined
    // // },

    // {
    //   fn: MainTestBackBug,
    //   msg: "Test back bug",
    //   params: []
    // },
    // {
    //   fn: MainTestInviteShows,
    //   msg: "Test invite shows",
    //   params: []
    // },

    //
    // {
    //   fn: MainTest,
    //   msg: "Test invite only",
    //   params: [
    //     allExpenses.slice(0, 1),
    //     "Dju doit a 8.56€ Suzie Max doit a 8.56€ Suzie Elyan doit a 8.56€ Suzie",
    //     true
    //   ]
    // },
    //
    // {
    //   fn: MainRegister,
    //   msg: "Register",
    //   params: [
    //     [],
    //     ""
    //   ]
    // },
    {
      fn: MainTest,
      msg: "E2E with 1 expense",
      params: [
        allExpenses.slice(0, 1),
        "Dju doit a 8.56€ Suzie Max doit a 8.56€ Suzie Elyan doit a 8.56€ Suzie"
      ]
    },
    // {
    //   fn: MainTest,
    //   msg: "E2E with all expenses",
    //   params: [
    //     allExpenses.slice(),
    //     "Elyan doit a 17.30€ Dju"
    //   ]
    // }
  ];

  const allRes: {msg: string, errorMsg?: string, hasError: boolean, links?: string[]}[] = [];
  for(const testFn of testList) {
    let msg = `${testFn.msg}: `;
    const res: string = await testFn.fn(testFn.params)
      .then((e: any) => "", (e) => {
        return e.toString();
      });

    // allRes.push(msg + (res ? "passed" : "failed") + ".");
    // allRes.push(msg + (!!res ? "passed" : "failed") + `:\n${res || ""}`);

    const resOO: {msg: string, errorMsg?: string, hasError: boolean, links?: string[]} = {
      msg: msg,
      errorMsg: res,
      hasError: !!res
    };

    if(resOO.hasError) {
      // take screenshot
      const pages = await getPagse();

      resOO.links = await Promise.all(
        pages.map((thePage: Page, index: number) => takeScreenshot(thePage, true)
          // .then((link: string) => console.log(`Screenshot link ${index} : ${link}`))
        )
      );

      // upload file somewhere
    }

    allRes.push(resOO);
  }

  console.log("====================");
  for(const resPart of allRes) {
    // console.log("Test:" + resPart.msg);
    // console.log("Status:" + (resPart.hasError ? "failed" : "passed"));
    // if (resPart.errorMsg) {
    //   console.log("Error:" + resPart.errorMsg);
    // }
    console.log(JSON.stringify(resPart, null, 2));
    console.log("");
  }
  console.log("=====================");
  console.log("Closing browsers");

  // await Promise.all(
  //   [browser, browser1].map(b => b.close())
  // );

  await Promise.all(
    [browser, browser1].map(
      b => b.close().then(() => {}, (err) => {
        console.log(err);
      })
    )
  );


  // await Promise.all(
  //   [browser, browser1].map(
  //     b => {
  //       return b.close().then(() => {
  //         console.log("ok");
  //       }, (err) => {
  //         console.log(err);
  //       });
  //     }
  // )


  console.log("Browsers closed");

  // [browser, browser1].map(b => b.process().kill());

  // const allRes = ["ok"];

  if(allRes.some(a => a.hasError)) {
    // process.exit(1);
    throw "Some errors";
  }
  else {
    console.log("No errors");
  }

  // execSync("dir");
  // execSync("npm run clear-chromium");
}


// runMiny().then((e: ElementHandle) => console.log("Done."));
runAll()
// uploadToFilebin("", "C:\\Users\\djuuu\\OneDrive\\Pictures\\MerionGenea.png")
  .then((e: any) => {
    console.log("Done.");
    // process.exit(0);
}, (e) => {
  console.error(e);
  // process.exit(1);
  throw e;
});
