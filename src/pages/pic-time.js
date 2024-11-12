import 'dotenv/config';
import chrome from 'puppeteer-extra';

import { sleep, getCookies, parseProxyUrl } from '../helpers/common.js';

import { GetSetsAndPhotos } from '../helpers/pic-time-helpers.js';

import DownloadPhotos from '../download-services/download-pic-time-photos.js';

(async () => {

  const {
    userEmail,
    userPassword,
    proxy: proxyUrl,
    platform,
    downloadPhotos
  } = process.env;

  const proxyObject = parseProxyUrl(proxyUrl);

  console.log(proxyObject)

  const {
    host: ip,
    port,
    username,
    password
  } = proxyObject;

  let browser;
  try {
    const rootDirectory = process.cwd();
    const folderPath = `${rootDirectory}/public/sessions/${platform}/${userEmail}/report`;
  
      const browserOpts = {
        headless: true,
        ignoreHTTPSErrors: true,
        defaultViewport: null,
        userDataDir: folderPath,
        args: [
          '--headless=new',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-gpu',
          '--disable-features=IsolateOrigins,site-per-process',
          '--start-maximized',
          `--proxy-server=${ip}:${port}`
        ]
      };
    
      const browser = await chrome.launch(browserOpts);
    
      const page = await browser.newPage();
    
      await page.authenticate({ username, password });
      console.log('Proxy Authenticated!');

      await page.goto('https://us.pic-time.com/professional#dash', { timeout: 60000 });

      if (page.url().includes('/login')) {

        const emailSelector = await page.$('input[type=email]');

        console.log({ emailSelector });
        
        await emailSelector.type(userEmail, { delay: 300 });
        await sleep(10);

        const continueButton1 = await page.$('::-p-xpath(//button[@type="submit"])');
        console.log({ continueButton1 });
  
        const continueButton = await page.$('button[type=submit]')

        await continueButton.click();
        await sleep(10);
        const passwordSelector = await page.$('input[type=password]');
        await passwordSelector.type(userPassword, { delay: 300 });

        await sleep(10);

        const loginButton = await page.$('::-p-xpath(//button[text()="Login"])')
        await loginButton.click();

        await sleep(30);

        console.log('button clicked')
        await sleep(10);
      }

      const url = page.url();
      const baseUrl =  new URL(url).origin;

      console.log({ baseUrl });

      await page.goto(`${baseUrl}/professional#dash`);

      const cookies = await page.cookies();

      const filteredCookies = getCookies({ cookies });

      if (!downloadPhotos) {
        await GetSetsAndPhotos({ baseUrl, filteredCookies });
      }

      await DownloadPhotos({
        baseUrl,
        filteredCookies,
        userEmail
      });
   
  } catch (error) {
    console.log({ error });
  } finally {
    console.log('Finally Block Called:');
    if (browser) await browser.close();
    return;
  }
})();
