import 'dotenv/config';
import fs from 'fs';
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import GetClients, { sleep, getCookies } from '../helpers.js';
import DownloadPhotos from '../download-photos.js';

chromium.use(stealth());

const {
  EMAIL: userEmail,
  PASSWORD: userPassword,
  PROXY_SETTINGS: proxySettings,
  downloadPhotos
} = process.env;


(async () => {
  let browser;
  let context;
  try {
    //launch the browser in non-headless mode
    console.log({
      userEmail,
      proxySettings,
      downloadPhotos
    })
    const {
      ip,
      port,
      userName,
      password
    } = JSON.parse(proxySettings);
    const browserOpts = {
      headless: true,
      proxy: {
        server: `https://${ip}:${port}`,
        username: userName,
        password,
      },
      args: [
        '--headless=new',
        '--no-sandbox',
        '--disable-web-security',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-features=IsolateOrigins,site-per-process',
        '--start-maximized',
        `--proxy-server=${ip}:${port}`
      ]
    };
    browser = await chromium.launch(browserOpts);

    const context = await browser.newContext();

    //create a new page
    // const page = await context.newPage();

    // go to the pixieset login page
    // await page.goto('https://accounts.pixieset.com/login/', { waitUntil: 'networkidle' });

    await sleep(10);

    // Load cookies from the JSON file
    // const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));

    const sessionCookies = [
      {
        "name": "IDP_SID",
        "value": "s86ecpolqcpncss9p9b5ods2dn",
        "domain": ".accounts.pixieset.com",
        "path": "/",
        "expiration": "Session",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "IDP_SID",
        "value": "mhb8mhho9p2ksv4s0gd77nevbg",
        "domain": "static-idp.pixieset.com",
        "path": "/",
        "expiration": "Session",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "NID",
        "value": "518=hq5wzOfCTtjNne0LUbvVCGIy6FWbI-DVtNk5XHfOMzLP6lVImX2468P84A7g8EGczv7VcN_V6Vn1ng19UtKnO32lTJqJDQa3bLxaiYlswgpV7-K9h_i-bDeCYQJQNhhzIwKe7R-7HDxn27rj7hMbMeUnr1PpR903Xq2Qi3kse8f21YMcGD1PYCz__sRj2ThQJr_pKtfFFCKwjEeIE3wYM14whXDJ8KiJj_nHU31ALo6o97FIKLeMo-oZawaT8qCPCTVJzFp1ZtMCKTYlTUJvov_8_MmSD0qoCE-SJd7zkUebPWGIkF5bmuImjla_KsYAkOxjGjy-2xuXtrCs9B9lv9zv4xp_92tGrmtCdQ",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-04-24T09:21:17.882Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "None"
      },
      {
        "name": "PHPSESSID",
        "value": "7evaspfvr25oce7cc0s066neam",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "Session",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "SAPISID",
        "value": "627-Jra82NV4wsqA/AhoMpn727_yzNKzzM",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-11-18T07:52:43.759Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "SEARCH_SAMESITE",
        "value": "CgQIiZwB",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-03-10T13:26:14.696Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "Lax"
      },
      {
        "name": "SID",
        "value": "g.a000pAhQMXYZTexFRHLzjmGjZW02MHSR2WL-bsmdNQX9YU9Nsr-dOIVOF2dawAzOVpfC8grgJgACgYKAfkSARISFQHGX2MiCjrEgu9b7G8moySassdLsxoVAUF8yKqNgRbsvV1-T-Ybvm6TEyIh0076",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-11-18T07:52:43.759Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "SIDCC",
        "value": "AKEyXzUmq2RQqNMb03N8gudbchTMw028wGb1SXq1Xcs750w59-C5FbkfgxWwNTTn4K9VIMIM3I4",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-10-23T09:41:37.776Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "SOCS",
        "value": "CAISHAgCEhJnd3NfMjAyNDAxMTYtMF9SQzEaAmVuIAEaBgiA4LatBg",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-02-20T09:30:29.522Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "SSID",
        "value": "ASwvCcsNVI2GWe4Fd",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-11-18T07:52:43.759Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__Secure-1PAPISID",
        "value": "627-Jra82NV4wsqA/AhoMpn727_yzNKzzM",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-11-18T07:52:43.759Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__Secure-1PSID",
        "value": "g.a000pAhQMXYZTexFRHLzjmGjZW02MHSR2WL-bsmdNQX9YU9Nsr-d2Kqpw9zj0l6RlaeOrLrCkgACgYKAUISARISFQHGX2MieF3EdmcWMQAc3ujTCwUn_RoVAUF8yKoPY03zcJ-oKpCMKZmLILiG0076",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-11-18T07:52:43.760Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__Secure-1PSIDCC",
        "value": "AKEyXzVmPiPtgIsIzSM3zNv0Do57MBiVeQmhgkPpvBugzxYKqsZCMgfSlNPaswfi522P_O_KLYk",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-10-23T09:41:37.776Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__Secure-1PSIDTS",
        "value": "sidts-CjEBQlrA-BuIKqd7GrhQL879tFTXVpNaNE_9HoU26w9xAwynqPIrdVOcDPsk2GurwZ07EAA",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-10-23T09:35:46.303Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__Secure-3PAPISID",
        "value": "627-Jra82NV4wsqA/AhoMpn727_yzNKzzM",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-11-18T07:52:43.759Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "None"
      },
      {
        "name": "__Secure-3PSID",
        "value": "g.a000pAhQMXYZTexFRHLzjmGjZW02MHSR2WL-bsmdNQX9YU9Nsr-drBM_lWUIFaAubzbdcgkIpwACgYKAXYSARISFQHGX2Mi6aakFhkj5HvA-T1UAxLHExoVAUF8yKq5_G3d2e0VLMsUo6RUfUwL0076",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-11-18T07:52:43.760Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__Secure-3PSIDCC",
        "value": "AKEyXzUmEAYCRIH42KZXE2oXByuxqkQt5ULJHyFzRIummzmhupZcfhgpZduMRgM6FtshWM2DZA",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-10-23T09:41:47.485Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__Secure-3PSIDTS",
        "value": "sidts-CjEBQlrA-BuIKqd7GrhQL879tFTXVpNaNE_9HoU26w9xAwynqPIrdVOcDPsk2GurwZ07EAA",
        "domain": ".google.com",
        "path": "/",
        "expiration": "2025-10-23T09:35:46.303Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__auid",
        "value": "BWo3cMTqMFFCC6EzFmcyk63B8RW29TR1EG8GBcZT23rvW-u7ygolvQ8vvYY1-g4yCcxntmUwJ2YHSDw_iv5VxCBgQF7bvItNsgdJbpgmGLLHOR7kdVdmEWW2JkRRo8oj968uoW7ibiNYngCU7MYEdXqbu1Yl7EBzsjb4H40NPVg",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2024-11-22T09:41:43.614Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__cf_bm",
        "value": "EpBskt8.fZ1d5NSpU08CZpI6.4tdxZ19Xo2xo9.T.TE-1729676497-1.0.1.1-dXOBj3QBcHJ3uR4AiYlxaXz2LPqwivWI5sFsI4oDVqJmaW2jOGjmwWNcX3XeCgY1DJPlXFmajDLd9QChGhLnsQ",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2024-10-23T10:11:37.077Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "__fuid",
        "value": "6TiqquamXI6Uafym5tJIOC65KiudNkmjekUvCA_UZonstuNxcIyqGjc8yELMx0ZAKCHcgV11ZzhiWUGbx9XwkxWE8MPu-OsYyHsOFOpKw4PM7oBwoxFt-cyo8ue3lTQ1",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2024-11-20T18:45:23.421Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "_fbp",
        "value": "fb.1.1729243176224.194712800804474663",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-01-21T09:41:46.000Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "Lax"
      },
      {
        "name": "_ga",
        "value": "GA1.1.837148434.1729243176",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-11-27T09:41:46.802Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "_ga_GK2BPX3RKZ",
        "value": "GS1.1.1729676355.8.1.1729676508.50.0.0",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-11-27T09:41:48.170Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "_ga_HWRH7SB5HL",
        "value": "GS1.2.1729254364.1.0.1729254364.0.0.0",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-11-22T12:26:04.446Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "_ga_RNV26HP0SG",
        "value": "GS1.1.1729254363.1.0.1729254366.0.0.0",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-11-22T12:26:06.085Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "_gcl_au",
        "value": "1.1.1781567946.1729243176",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-01-16T09:19:36.000Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "ar_debug",
        "value": "1",
        "domain": ".doubleclick.net",
        "path": "/",
        "expiration": "2024-11-22T09:40:01.511Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "cf_clearance",
        "value": "U.U75HwfTLunxfKOHPN6gprvj4aOZ3YGPZxSVqmYP2o-1729676497-1.2.1.1-7Yv1RJNqm5vAeRLrw6B.QZ.qd45wzoC9UuQX2PgZ1598UmLX_9_CNNfmpPkObY8vhMPUeOPGvbh9VP6W5O4xkMfSWENHltiO8kwEUA81sPHjz4EAaPNgaJv13fM976Og1ZhQztx1DBe23bNvZFl2FdsIBa3eljTUP5u9pReE3xCyDd3atPSA9V61B_ZuAfiRVogJilpSPWNvC_AFbq4EV_iaymycpO_.rP3acZh1BsMZMw0yL0kzQqteTjc.9PdU91Z86ko.2YCUWNB37oxQNhfDXulFFMBod2maCVKdI6V9SARq5Oi3XEU8R7n8ln3tgPSri1jf1sJw8iDD7vf5j.oag2MaxAW0mOCgS1M4IG7_ngy46HdK7wVAZk7dL.xfHNS1ot7sr3DfljnUqhhGdg",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-10-23T09:41:37.841Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "csrftoken",
        "value": "Z3pMR3NTQks4fmZDdFRLdkFJaGpfSUJWN3g0aFJja0xiY3hQeb0mJ03K2xbK_38ECQbu6PHzmyu9wofihiDI0g%3D%3D",
        "domain": "accounts.pixieset.com",
        "path": "/",
        "expiration": "Session",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "datr",
        "value": "UCzIZvFxOml67Bstf7facVmQ",
        "domain": ".facebook.com",
        "path": "/",
        "expiration": "2025-09-27T06:29:38.472Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "ed09c6d03b065d3323176f59c2522db3",
        "value": "92d25f207c81cdc6445d00de7d85c23fffc08207a%3A4%3A%7Bi%3A0%3Bi%3A480718%3Bi%3A1%3Bs%3A17%3A%22courtneycopemedia%22%3Bi%3A2%3Bi%3A2592000%3Bi%3A3%3Ba%3A1%3A%7Bs%3A10%3A%22logintoken%22%3Bs%3A40%3A%22c38436a5edb03e58f2b47182f45466f3dc0e87eb%22%3B%7D%7D",
        "domain": "accounts.pixieset.com",
        "path": "/",
        "expiration": "2024-11-22T09:41:43.615Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "Lax"
      },
      {
        "name": "gallery_dashboard_session",
        "value": "eyJpdiI6IitrMEg1T1F3dDd3RWN2VXJGOVk5OWc9PSIsInZhbHVlIjoiUDdxZkpoR3pXRVAwWno4a3V5OVk4NmJhSGIyRkM2K1V2Ris4bWJJYkxkNjdRL2hHbHdKZmFSU0tHbnBNSGFlZWhCVU82cXpQdmVyY3ZiT2RvTkEvNjNHeWxBeEFkczg4WmE5MDA0R2lCNGpNRWRJcmVidEYwUmZLTFdlQWR6RjAiLCJtYWMiOiI4N2UwOWY1Y2Q1MDRkNmQzMWUyMWM0ZTM4NTA4ZmM0YWQ5OTExNjIyMzAyNmQ1MzFiOTg0ODY1ODk2ZGVlZDFiIiwidGFnIjoiIn0%3D",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "Session",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "gd_ca",
        "value": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxOTkyMDE5LCJleHAiOjE3Mjk1MzY5NDh9.TtEE5aOga4_xianubvRMeIMuAToeALirIToybE5qgYI",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "Session",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "intercom-device-id-bvdpeh8u",
        "value": "90aad0bf-52c5-4c86-b857-d24cd36375ed",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-07-20T10:15:13.000Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "Lax"
      },
      {
        "name": "intercom-session-bvdpeh8u",
        "value": "QVlSeWRSU3NWczFVZll6dWx6WXUvOXNxbWRIYloyV3VwVHl0VVBPTnphS2QrbHpTc0F4WFhuMjFjbUs0OEhkcy0tb3ZIdnk1ajR3NkNuOUJCbXpQMTJ0UT09--23f0daf4ff6c9776817f58989ba3a0e419ed37e9",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2024-10-30T09:41:53.000Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "Lax"
      },
      {
        "name": "ph_phc_c48UlgK2OgHNMyCVi05Vlqq7Or3fUWt1FKmvhkMA1WR_posthog",
        "value": "%7B%22distinct_id%22%3A%22480718%22%2C%22%24sesid%22%3A%5B1729676505934%2C%220192b8c0-dd15-7129-9d0f-106f10db1b2f%22%2C1729676500245%5D%2C%22%24epp%22%3Atrue%7D",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-10-23T09:41:46.000Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "pixieset_analytics",
        "value": "granted",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-04-16T14:19:35.000Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "pixieset_marketing",
        "value": "granted",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2025-04-21T02:41:41.000Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "ps_l",
        "value": "1",
        "domain": ".facebook.com",
        "path": "/",
        "expiration": "2025-10-01T08:56:09.152Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "ps_n",
        "value": "1",
        "domain": ".facebook.com",
        "path": "/",
        "expiration": "2025-10-01T08:56:09.152Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "sb",
        "value": "2PIIZ_3NxtEoMpMxfh3XXqRL",
        "domain": ".facebook.com",
        "path": "/",
        "expiration": "2025-11-15T09:41:44.096Z",
        "httpOnly": false,
        "secure": true,
        "sameSite": "Lax"
      },
      {
        "name": "user2faDeviceToken1dc61b9800ec6dbe3bb5726bc9e9e7a0",
        "value": "A5zAXXYdGBWj",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "2024-11-17T13:49:22.529Z",
        "httpOnly": false,
        "secure": false,
        "sameSite": "Lax"
      },
      {
        "name": "workspace_id",
        "value": "1989876",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "Session",
        "httpOnly": false,
        "secure": false,
        "sameSite": "None"
      },
      {
        "name": "wsid",
        "value": "ws_e6HZMIM6qwtJIjDhWzjrW3AyADiK",
        "domain": ".pixieset.com",
        "path": "/",
        "expiration": "Session",
        "httpOnly": false,
        "secure": false,
        "sameSite": "Lax"
      }
    ];
  
    // Set the cookies in the context
    await context.addCookies(sessionCookies);
  
    const page = await context.newPage();
  
    // Go to the collections page
    await page.goto('https://galleries.pixieset.com/collections');
  
  
    // After logging in, save cookies
    // const cookies = await context.cookies();
    // await fs.writeFile('cookies.json', JSON.stringify(cookies, null, 2));
  
    // Save local storage
    
    // console.log('Cookies and local storage saved.');

    // console.log('Logged In!');


    //select email & password selectors from the page
    // const email = await page.waitForSelector('#UserLogin_username');
    // const passwordSelector = await page.waitForSelector('#UserLogin_password');

    // // enter email & password
    // await email.type(userEmail, { delay: 300 });

    // await sleep(10);

    // await passwordSelector.type(userPassword, { delay: 400 });

    // // click on login button
    // const loginButton = await page.waitForSelector('#login-button');
    // // await loginButton.hover();
    // // await page.mouse.move(10, 10);
    // // await page.waitForTimeout(1000 + Math.floor(Math.random() * 2000));

    // await loginButton.click();

    await sleep(20);

    console.log('Logged In!');

    // go to collections page
    // await page.goto('https://galleries.pixieset.com/collections');

    // get cookies to authenticate requests
    const cookies = await context.cookies();

    //filter cookies
    const filteredCookies = getCookies({ cookies });

    // call helper method to scrape the data
    if (!downloadPhotos) {
      await GetClients({ page, filteredCookies });
    }
    console.log('calling Download photos');
    await DownloadPhotos({
      filteredCookies
    });
  } catch (err) {
    console.log('An Unexpected Error occurred', err);
  } finally {
    if (context) await context.close();
  }
})();



