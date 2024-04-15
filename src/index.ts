import puppeteer from "puppeteer";
import env from "dotenv";

async function siipi() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  // nagigate to page
  await page.goto("https://siipi.izt.uam.mx/login");

  env.config({ path: "./.env", override: true });

  // username and password
  const username = process.env.USER;
  const password = process.env.PASSWORD;

  // TODO: create a function to close the modal
  // close the modal
  await page.waitForSelector("a[data-dismiss='modal']", { visible: true }); // wait for the modal to appear
  const loginModalBtn = await page.$('a[data-dismiss="modal"]');
  if (loginModalBtn) await loginModalBtn.click();

  // TODO: handle the case when values are not provided
  // login
  await page.type("#username", username ?? "");
  await page.type("#password", password ?? "");
  await page.click('input[name="login"]');

  // wait for the page loading
  await new Promise((r) => setTimeout(r, 1000));
  await page.click('input[name="login"]');

  // wait for the page loading... again
  await new Promise((r) => setTimeout(r, 1000));

  // close the modal... again
  await page.waitForSelector("button[class='aviso btn btn-primary']", {
    visible: true,
  });
  const modalBtn = await page.$("button[class='aviso btn btn-primary']");
  if (modalBtn) await modalBtn.click();

  await new Promise((r) => setTimeout(r, 1000));

  // NOTE: is this necessary?
  // onclick in student information accordion
  await page.click('h4[data-target="#basica"]');

  const childHTML = await page.$$eval("#basica > .panel-body > .row", (nodes) =>
    nodes.flatMap((node) =>
      Array.from(node.children).map((child) => child.innerHTML)
    )
  );

  // convert to object
  let studentInfo = [];
  for (const child of childHTML) {
    if (child.includes("<b>"))
      studentInfo.push(child.replace(/<b>|<\/b>/g, "").split(":"));
  }

  let studentInfoObject = [];
  for (const element of studentInfo) {
    studentInfoObject.push({ [element[0].trim()]: element[1].trim() });
  }

  console.log(studentInfoObject);
}

siipi();
