import puppeteer from "puppeteer";

export const login = async (username: string, password: string) => {
  // handle invalid credentials
  if (
    username === undefined ||
    password === undefined ||
    username === "" ||
    password === ""
  ) {
    return JSON.stringify({ error: "Invalid credentials" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
    });
  } catch (error) {
    console.log("Error launching browser", error);
    return JSON.stringify({ error: "Error launching browser" });
  }

  const page = await browser.newPage();

  // nagigate to page
  await page.goto("https://siipi.izt.uam.mx/login");

  // clse modal
  await closeModal(page, 'a[data-dismiss="modal"]');

  // login
  await page.type("#username", username ?? "");
  await page.type("#password", password ?? "");
  await page.click('input[name="login"]');

  // wait for the page loading
  await new Promise((r) => setTimeout(r, 1000));

  // handle invalid credentials
  const currentUrl = page.url();
  if (currentUrl === "https://siipi.izt.uam.mx/login") {
    return JSON.stringify({ error: "Invalid credentials" });
  }

  // close the modal... again
  await closeModal(page, "button[class='aviso btn btn-primary']");

  // wait for the page loading.. again
  await new Promise((r) => setTimeout(r, 1000));

  // get student info
  const studentInfoHTML = await page.$$eval(
    "#basica > .panel-body > .row",
    (nodes) =>
      nodes.flatMap((node) =>
        Array.from(node.children).map((child) => child.innerHTML)
      )
  );

  // convert to object
  let studentInfoKey: string[] = [];
  let studentInfoValue: string[] = [];

  studentInfoHTML.forEach((child) => {
    // clean the data
    if (child.includes("<b>")) {
      const auxArray = child.replace(/<b>|<\/b>/g, "").split(":");
      studentInfoKey.push(auxArray[0].trim());
      studentInfoValue.push(auxArray[1].trim());
    }
  });

  // convert to JSON
  let studentInfoJSON: { [key: string]: string } = {};
  studentInfoKey.forEach((key: any, i: any) => {
    studentInfoJSON[key] = studentInfoValue[i];
  });

  // clean the CLAVE DEL PLAN and E-MAIL
  studentInfoJSON["CLAVE DEL PLAN"] =
    RegExp(/\d+/).exec(studentInfoJSON["CLAVE DEL PLAN"])?.[0] ?? "";
  studentInfoJSON["E-MAIL"] = studentInfoJSON["E-MAIL"].replace(
    /<a>|<\/a>/g,
    ""
  );

  // close the browser
  await browser.close();

  return JSON.stringify(studentInfoJSON);
};

// TODO: change any to the correct type
const closeModal = async (page: any, element: string) => {
  // wait for the modal to appear
  await new Promise((r) => setTimeout(r, 1000));
  const loginModalBtn = await page.$(element);
  if (loginModalBtn) await loginModalBtn.click();
};
