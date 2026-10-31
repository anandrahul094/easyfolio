import {defineConfig,devices} from "@playwright/test";

const baseURL=process.env.PLAYWRIGHT_BASE_URL??"http://127.0.0.1:3000";

export default defineConfig({
  testDir:"./e2e",
  fullyParallel:true,
  forbidOnly:!!process.env.CI,
  retries:process.env.CI?2:0,
  workers:process.env.CI?2:undefined,
  reporter:process.env.CI?[["list"],["html",{outputFolder:"playwright-report",open:"never"}]]:"list",
  outputDir:"test-results",
  use:{
    baseURL,
    trace:"retain-on-failure",
    screenshot:"only-on-failure",
    video:"retain-on-failure"
  },
  projects:[
    {
      name:"chromium-desktop",
      use:{...devices["Desktop Chrome"],viewport:{width:1440,height:960}}
    },
    {
      name:"chromium-mobile",
      use:{...devices["iPhone 13"],browserName:"chromium",defaultBrowserType:"chromium",viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true}
    }
  ],
  webServer:{
    command:"npm run start",
    url:baseURL,
    reuseExistingServer:!process.env.CI,
    timeout:120_000
  }
});
