import * as puppeteer from 'puppeteer';
import {Browser, ClickOptions, ElementHandle, JSHandle, Page} from "puppeteer";

// @ts-ignore
import {expect} from "chai";
import {badData} from "./data/bugData";
import {allExpenses} from "./data/allExpenses";
// import {badData} from "./data/bugData";

const userData = {
  email: "le_zhumain@msn.com",
  username: "a",
  pass: "a"
};

const userData1 = {
  email: "hatsune.miku.asb@wspt.co.uk",
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

async function scrollAndClick(elm: ElementHandle, page: Page) {
  await page.evaluate((selector, eee) => {
    // console.log(eee);
    // debugger;
    // document.querySelector(selector).scrollIntoView();
    eee.scrollIntoView();
  }, "#addTravel", elm);

  await page.waitForTimeout(500);
  return elm.click();
}

async function clearAndType(e: ElementHandle, s: string) {
  return clickAndDelay(e, { clickCount: 3 }).then(() => {
    return e.type(s);
  })
}

async function handleSecrutiyStuff(page: Page) {
  const hasError = await page.waitForSelector("#details-button", {visible: true})
    .then(e => e, () => null);

  if (hasError) {
    await hasError.click();
    await page.waitForSelector("#proceed-link", {visible: true})
      .then(e => e ? e.click() : null);
  }
}


async function getTravelList(page: Page): Promise<string[]> {
  return page.$$(".travel-card .row:first-child .col")
    .then((res: ElementHandle[]) => {
      return Promise.all(res.map((e: ElementHandle) => e.getProperty("innerText")))
        .then((res: JSHandle[]) => {
          return res.map(r => r._remoteObject.value as string);
        });
    });
}

async function getExpenseList(page: Page): Promise<string[]> {
  return page.$$(".expense-card")
    .then((res: ElementHandle[]) => {
      return Promise.all(res.map((e: ElementHandle) => e.getProperty("innerText")))
        .then((res: JSHandle[]) => {
          return res.map(r => r._remoteObject.value as string);
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
        .then(e => e ? Promise.all([e.click(), page.waitForNavigation()]) : null))
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
        .then(e => e ? Promise.all([e.click(), page.waitForNavigation()]) : null))
    );
  }
  console.log("okff");
}

async function handleLogout(page: Page) {
  await page.waitForSelector(".fa-user", {visible: true})
    .then(e => e ? e.click() : null);

  await page.waitForXPath("//a[contains(text(), 'Log out')]", {visible: true})
    .then(e => e ? Promise.all([scrollAndClick(e, page), page.waitForNavigation()]) : null);

  expect(page.url()).to.contain("/login");
  await page.waitForTimeout(500);
}

async function handleLogin(page: Page, userData: { pass: string; email: string; username: string }) {
  try {
    await page.waitForSelector("#username", {visible: true, timeout: 20000})
      .then(e => e ? e.type(userData.username) : null);

    await page.waitForSelector("#password", {visible: true})
      .then(e => e ? e.type(userData.pass) : null);
  } catch (e) {
    debugger;
  }

  await page.waitForTimeout(500);

  await page.waitForXPath("//button[contains(text(), 'Login')]", {visible: true})
    .then(e => e ? Promise.all([e.click(), page.waitForNavigation()]) : null);

  // await page.waitForNavigation();

  await page.waitForTimeout(500);
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
//   await page.waitForSelector("#_evidon-banner-acceptbutton").then(e => e?.click());
//
//   await page.waitForSelector(".js-start-test").then(e => e?.click());
//
//   await page.waitForNavigation({timeout: 120000});
//   expect(page.url()).to.contain("/result", "Didn't navigate to result");
//
//   const [ping, desc, asdc] = await page.waitForSelector(".result-container-data", {visible: true})
//     .then(e => {
//       return e?.getProperty("innerText");
//     }).then((e: JSHandle | undefined) => {
//       const value: string = e?._remoteObject.value;
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
  await thePage.waitForSelector("#profile-tab", {visible: true})
    .then(e => e ? scrollAndClick(e, thePage) : null);

  const res = await thePage.waitForSelector("app-repartition", {visible: true})
    .then(e => e?.getProperty("innerText"))
    .then(e => {
      return e?._remoteObject.value;
    });

  // if(res !== "Elyan\ndoit a\n17.30€\nDju") {
  // if(res !== "Dju\ndoit a\n8.56€\nSuzie\nMax\ndoit a\n8.56€\nSuzie\nElyan\ndoit a\n8.56€\nSuzie") {
  if(res !== repart) {
    throw "Wrong repartition!: " + res;
  }

  const url = thePage.url();
  await thePage.reload();

  await thePage.waitForNavigation({timeout: 1000}).then(() => {}, () => {});
  await thePage.setDefaultTimeout(1000);

  const currentURL = thePage.url();
  const lastBit = currentURL.replace(host, "");

  try {
    expect(currentURL).to.equal(url);
  } catch (e) {
    expect(currentURL).to.contain(`returnUrl=${encodeURIComponent(lastBit)}`);
  }
}

// const host = `https://86.18.16.122:8083`; // TODO cmd line arg to switch
const host = `http://127.0.0.1:4200`;
const url = `${host}/login`;

function getHeadlessParam(): boolean {
  const regex = /-headless[= ](\w+)/;
  const param = process.argv.find(a => regex.test(a));
  const target = param?.replace(regex, "$1");

  return target
    ? target === "true"
    : true;
}

let getCount = 0;

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
    .then(e => e ? Promise.all([e.click(), page.waitForNavigation()]) : null);

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

  if(remHandlers) {
    await remHandlers();
  }
}

async function MainTestBackBug(params: any[]) {
  const page = await browser.pages().then(e => e[0]),
    page1 = await browser1.pages().then(e => e[0]);

  const pages = [page, page1];

  await goToAndSecurity(pages);

  await testBackBug(pages);

  await testCommonTravels(pages);

  await removeHandlers(pages);

  // logout
  await Promise.all(
    pages.map((pagee: Page) => handleLogout(pagee))
  );
}

async function MainTestSQLLogin(params: any[]) {
  const page = await browser.pages().then(e => e[0]),
    page1 = await browser1.pages().then(e => e[0]);

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

async function CreateBrowsers(): Promise<[Browser, Browser]> {
  const isHeadless: boolean = getHeadlessParam();

  const pupArgs = {
    headless: isHeadless,
    defaultViewport: null,
    args: [
      '--disable-web-security',
      '--start-maximized',
      '--no-sandbox' // discouraged, see https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
    ],
    // executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    // executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  };

  browser = await puppeteer.launch(pupArgs);
  browser1 = await puppeteer.launch(JSON.parse(JSON.stringify(pupArgs)));

  return Promise.resolve([browser, browser1]);
}

async function goToAndSecurity(pages: Page[]) {
  await Promise.all(
    pages.map(p => p.goto(url).then(() => {
    }, () => {
    }))
  );

  if (url.startsWith("https")) { // SSL security stuff
    await Promise.all(
      pages.map(p => handleSecrutiyStuff(p))
    );
  }
}

let pageDialogHandled = false;

async function MainTest(params: any[]) {
  let isError = null;

  const targetExepense = params[0];
  const targetReparttion = params[1];

  let pages = [];

  try {

    // Wait for creating the new page.
    const page = await browser.pages().then(e => e[0]),
      page1 = await browser1.pages().then(e => e[0]);

      pages = [page, page1];

    // await page.goto(url).then(() => {}, () => {});
    await goToAndSecurity(pages);

    // login
    await Promise.all(
      [
        handleLogin(page, userData),
        waitForMS(3000).then(() => handleLogin(page1, userData1))
      ]
    );

    // add travel
    // await page.waitForXPath("//button[contains(text(), 'Add travel')]", {visible: true})
    //   .then(e => e ? e.click() : null);
    const xpath = "//button[contains(text(), 'Add travel')]";
    const elm: ElementHandle | null = await page.waitForXPath(xpath, {visible: true}).then(e => e, () => null);
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
      scrollAndClick(elm, page),
      page.waitForNavigation()
    ]);

    const travelNAme = `Test ${new Date().toUTCString()}`;
    await page.waitForSelector("#name", {visible: true})
      .then(e => e ? e.type(travelNAme, {delay: 30}) : null);

    await page.waitForSelector("#description", {visible: true})
      .then(e => e ? e.type("E2E test travel", {delay: 30}) : null);

    await page.waitForXPath("//button[contains(text(), 'Save Travel')]", {visible: true})
      .then(e => e ? Promise.all([e.click(), page.waitForNavigation()]) : null);

    // await page.waitForNavigation();

    await page.reload(); // TODO remove me

    await page.waitForXPath(`//h6[contains(text(), '${travelNAme}')]`, {visible: true})
      .then(e => e ? scrollAndClick(e, page) : null);
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
    const allPeople: { name: string, dayCount: number }[] = xpeopleMarseille.slice();
    for (const people of allPeople) {
      await page.waitForSelector("#profile-tab1", {visible: true, timeout: 10000})
        .then(e => e ? e.click() : null);

      await page.waitForXPath("//button[contains(text(), 'Add people')]", {visible: true})
        .then(e => e ? e.click() : null);

      await page.waitForSelector("#name", {visible: true})
        .then(e => e ? e.type(people.name, {delay: 30}) : null);

      await page.waitForSelector("#dayCount", {visible: true})
        .then(e => e ? clearAndType(e, people.dayCount.toString()) : null);

      await page.waitForXPath("//button[contains(text(), 'Save')]", {visible: true})
        .then(e => e ? e.click() : null);

      await page.waitForTimeout(200);
    }

    await page.waitForSelector("#profile-tab1", {visible: true})
      .then(e => e ? e.click() : null);

    await page.waitForTimeout(1000);

    const targetXXpath = "//h3[contains(text(), 'Participants')]//following-sibling::div//div[contains(@class, 'row')]";
    await page.waitForXPath(targetXXpath);
    const allPeopleRes: ElementHandle[] = await page.$x(targetXXpath);
    expect(allPeopleRes.length).to.equal(allPeople.length);


    await page.waitForSelector("#payer", {visible: true})
      .then(e => e ? e.type("Dju", {delay: 30}) : null);


    await page.waitForSelector("#savePayer", {visible: true})
      .then(e => e ? e.click() : null);

    // add expenses
    await page.waitForSelector("#home-tab", {visible: true})
      .then(e => e ? scrollAndClick(e, page) : null);

    const expenses = targetExepense;

    for (const expense of expenses) {
      // TODO add expense with page or page1 randomly

      await page.waitForXPath("//button[contains(text(), 'Add expense')]", {visible: true})
        .then(e => e ? scrollAndClick(e, page) : null);

      // await page.waitForNavigation();

      await page.waitForSelector("#name", {visible: true})
        .then(e => e ? e.type(expense.name, {delay: 30}) : null);

      await page.waitForTimeout(800);

      await page.waitForSelector("#amount", {visible: true})
        .then(e => e ? clearAndType(e, expense.amount.toString()) : null);

      // await page.waitForSelector("#payer", {visible: true})
      //   .then(e => e ? e.click() : null);
      //
      // await page.waitForXPath(`//option[contains(text(), '${expense.payer}')]`, {visible: true})
      //   .then(e => e ? e.click() : null);

      await page.waitForSelector("#payer", {visible: true})
        .then(e => e ? e.type(expense.payer, {delay: 30}) : null);

      for (const payee of expense.payees) {
        const line = await page.waitForXPath(`//span[contains(text(), '${payee.name}')]//ancestor::div[contains(@class, 'form-check')]`,
          {visible: true});

        await line?.$x(".//span[contains(@class, 'perc-sign')]//preceding-sibling::input")
          .then(e => e.length > 0 ? e[0].type(payee.e4xpenseRatio.toString(), {delay: 30}) : null);
      }

      await page.waitForXPath("//button[contains(text(), 'Save Expense')]", {visible: true})
        .then(e => e ? Promise.all([scrollAndClick(e, page), page.waitForNavigation()]) : null);

      // await page.waitForNavigation();
      await page.waitForTimeout(500);
    }

    // edit last expense
    // debugger;
    const lastTitle = expenses[expenses.length - 1].name;
    await page.waitForXPath(`//div[contains(@class, 'expense-card')]//h6[contains(text(), '${lastTitle}')]`, {visible: true})
      .then(e => e ? scrollAndClick(e, page) : null);

    await page.waitForXPath("//button[contains(text(), 'Edit expense')]", {visible: true})
      .then(e => e ? scrollAndClick(e, page) : null);

    await page.waitForSelector("#amount", {visible: true})
      .then(e => e ? clearAndType(e, "34.23") : null);

    await page.waitForXPath("//button[contains(text(), 'Save Expense')]")
      .then(e => e ? scrollAndClick(e, page) : null);


    await checkRepartition(page, targetReparttion);

    // debugger;
    await page.waitForTimeout(200);

    // send invite
    await page.waitForXPath("//button[contains(text(), 'Invite')]", {visible: true})
      .then(e => e ? scrollAndClick(e, page) : null);

    // await page.waitForNavigation();
    await page.waitForTimeout(500);

    // send invite
    await page.waitForSelector("#email", {visible: true})
      .then(e => e ? clearAndType(e, userData1.email) : null);

    if (!pageDialogHandled) {
      page.on("dialog", (dialog) => {
        console.log("dialog");
        try {
          dialog.accept();
        } catch (e) {
          if (!e.toString().includes("Cannot accept dialog which is already handled")) {
            throw e;
          }
        }
      });
      pageDialogHandled = true;
    }

    await page.waitForXPath("//button[contains(text(), 'Save')]", {visible: true})
      .then(e => e ? scrollAndClick(e, page) : null);

    // await page.waitForTimeout(1000);
    // await page.keyboard.press('Enter');
    // // await page.waitForNavigation();

    // respond to invite
    // debugger;

    await Promise.all(
      pages.map(page => page.waitForTimeout(1000))
    );

    await page1.reload();
    await page1.waitForTimeout(3000);
    // await page1.waitForNavigation();

    // debugger;
    let skipNotif = false;

    // await page1.waitForSelector("i.notif", {visible: true})
    //   .then(e => e?.click());
    const elmeu: ElementHandle | null = await page1.waitForSelector("i.notif", {visible: true, timeout: 5000})
      .then(e => e, () => null);

    if (elmeu) {
      await elmeu.click();

      await page1.waitForTimeout(500);

      await page1.waitForSelector("i.accept", {visible: true})
        .then(e => e?.click());

      await page1.waitForTimeout(500);

      await page1.waitForSelector(".iconWrapper i.fa-arrow-left", {visible: true})
        .then(e => e?.click());

      await page1.waitForTimeout(1000);
      await page1.reload();
      await page1.waitForTimeout(3000);
    }

    await page1.waitForXPath(`//h6[contains(text(), '${travelNAme}')]`, {visible: true})
      // .then(e => e ? Promise.all([e.click(), page.waitForNavigation({timeout: 20000})]) : null);
        .then(e => e?.click());

    await page1.waitForTimeout(1000);

    if (elmeu) {
      await page1.waitForSelector("#payer", {visible: true})
        .then(e => e ? e.type("Max", {delay: 30}) : null);


      await page1.waitForSelector("#savePayer", {visible: true})
        .then(e => e ? e.click() : null);
    }

    await page1.waitForTimeout(1000);
    await checkRepartition(page1, targetReparttion);

    // TODO say who we are
  } catch (e) {
    console.error(e);
    isError = e;
  } finally {
    // logout
    await Promise.all(
      pages.map((pagee: Page) => handleLogout(pagee))
    );

    if(isError) {
      throw isError;
    }
  }
}

async function runAll() {
// const testList = [MainTest0/*, MainTest*/];
  await CreateBrowsers();

  const testList = [
    {
      fn: MainTestBackBug,
      msg: "Test back bug",
      params: []
    },
    {
      fn: MainTest,
      msg: "E2E with 1 expense",
      params: [
        allExpenses.slice(0, 1),
        "Dju\ndoit a\n8.56€\nSuzie\nMax\ndoit a\n8.56€\nSuzie\nElyan\ndoit a\n8.56€\nSuzie"
      ]
    },
    {
      fn: MainTest,
      msg: "E2E with all expenses",
      params: [
        allExpenses.slice(),
        "Elyan\ndoit a\n17.30€\nDju"
      ]
    }
  ];

  const allRes: string[] = [];
  for(const testFn of testList) {
    let msg = `${testFn.msg}: `;
    const res = await testFn.fn(testFn.params)
      .then(e => true, () => false);
    allRes.push(msg + (res ? "passed" : "failed") + ".");
  }

  console.log(allRes.join("\n"));

  await Promise.all(
    [browser, browser1].map(b => b.close())
  );

  if(allRes.some(a => a.endsWith("failed."))) {
    // process.exit(1);
    throw "Some errors";
  }
}

async function runMiny() {
  const isHeadless: boolean = getHeadlessParam();
  console.log(`isHeadless: ${isHeadless}`);
  const pupArgs = {
    headless: isHeadless,
    defaultViewport: null,
    args: [
      '--disable-web-security',
      '--start-maximized',
      '--no-sandbox' // discouraged, see https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
    ],
    // executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    // executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
  };

  const br = await puppeteer.launch(pupArgs);
  const pa = await br.pages().then(e => e[0])

  await pa.goto("https://puppeteer.github.io/puppeteer/");

  await pa.waitForXPath("//h1[contains(text(), 'Puppeteer')]", {visible: true, timeout: 10000});

  await br.close();
}

runMiny().then(e => console.log("Done."));
