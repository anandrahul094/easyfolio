import {expect,test,type Page} from "@playwright/test";

const schemes=[
  {
    scheme_code:100201,isin_growth:"INF000000201",scheme_name:"Alpha Large Cap Fund",
    nav:"25.4200",nav_date:"2026-10-30",category:"Equity",subcategory:"Large Cap Fund",
    plan:"direct",option:"growth",amc_name:"Alpha Mutual Fund"
  },
  {
    scheme_code:100202,isin_growth:"INF000000202",scheme_name:"Beta Liquid Fund",
    nav:"12.3400",nav_date:"2026-10-30",category:"Debt",subcategory:"Liquid Fund",
    plan:"direct",option:"growth",amc_name:"Beta Asset Management"
  },
  {
    scheme_code:100203,isin_growth:"INF000000203",scheme_name:"Gamma Hybrid Fund",
    nav:"18.7500",nav_date:"2026-10-30",category:"Hybrid",subcategory:"Aggressive Hybrid Fund",
    plan:"direct",option:"growth",amc_name:"Gamma Mutual Fund"
  },
  {
    scheme_code:100204,isin_growth:"INF000000204",scheme_name:"Delta Index Fund",
    nav:"32.1000",nav_date:"2026-10-30",category:"Equity",subcategory:"Index Fund",
    plan:"direct",option:"growth",amc_name:"Delta Mutual Fund"
  }
];

async function mockSchemeApi(page:Page){
  await page.route("**/api/v1/schemes**",async route=>{
    const url=new URL(route.request().url());
    const query=(url.searchParams.get("q")??"").toLowerCase();
    const category=url.searchParams.get("category");
    const pageNumber=Number(url.searchParams.get("page")??"1");
    const limit=Number(url.searchParams.get("limit")??"24");
    const filtered=schemes.filter(fund=>
      (!query||fund.scheme_name.toLowerCase().includes(query)||String(fund.scheme_code)===query||fund.isin_growth.toLowerCase().includes(query))&&
      (!category||category==="All categories"||(category==="Unclassified"?!fund.category:fund.category===category))
    );
    const data=filtered.slice((pageNumber-1)*limit,pageNumber*limit);
    await route.fulfill({
      status:200,
      contentType:"application/json",
      body:JSON.stringify({
        data,page:pageNumber,limit,total:filtered.length,
        metadata:{
          source:"AMFI",latest_nav_date:"2026-10-30",future_nav_record_count:0,
          fetched_at:"2026-10-31T08:00:00Z",status:"ready",record_count:filtered.length
        }
      })
    });
  });
}

const coreRoutes=[
  ["/","Understand money."],
  ["/learn","Build knowledge"],
  ["/learn/mutual-fund-fundamentals","Mutual fund fundamentals"],
  ["/learn/sip-explained","SIP, explained simply"],
  ["/learn/mutual-fund-categories","Know the mutual fund categories"],
  ["/learn/understand-risk","Understand investment risk"],
  ["/learn/read-a-scheme-page","How to read a scheme page"],
  ["/learn/before-you-take-action","Before you take action"],
  ["/basics","Before the numbers"],
  ["/categories","First understand the category"],
  ["/funds","Research funds"],
  ["/compare","Compare with context"],
  ["/discover","What would you like to understand first"],
  ["/calculators/sip","See how a monthly SIP"],
  ["/calculators/compound","Time changes the shape"],
  ["/glossary","The language of investing"],
  ["/resources","Keep learning beyond"],
  ["/about","Clarity before decisions"]
] as const;

test.describe("EasyFolio screen route smoke checks",()=>{
  for(const [path,heading] of coreRoutes){
    test(`${path} loads its primary screen`,async({page})=>{
      await mockSchemeApi(page);
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.getByRole("heading",{level:1}).first()).toContainText(heading);
      await expect(page.locator("body")).not.toContainText("Application error");
    });
  }
});

test("learning path opens lessons and supports next/previous navigation",async({page})=>{
  await page.goto("/learn");
  await page.getByRole("link",{name:/Read lesson/}).first().click();
  await expect(page.getByRole("heading",{level:1})).toContainText("Mutual fund fundamentals");
  await page.getByRole("link",{name:/NEXT LESSON/}).click();
  await expect(page.getByRole("heading",{level:1})).toContainText("SIP, explained simply");
  await page.getByRole("link",{name:/PREVIOUS LESSON/}).click();
  await expect(page.getByRole("heading",{level:1})).toContainText("Mutual fund fundamentals");
});

test("guided discovery completes all four educational steps and allows edits",async({page})=>{
  await page.goto("/discover");
  const answers=[
    "How mutual funds work",
    "Long-term goals",
    "Why fund values fluctuate",
    "I'm completely new"
  ];
  for(let index=0;index<answers.length;index++){
    await page.getByRole("button",{name:answers[index]}).click();
    await page.getByRole("button",{name:/Continue|See my learning route/}).click();
  }
  await expect(page.getByRole("heading",{name:"A useful place to continue."})).toBeVisible();
  await page.getByRole("button",{name:"Change"}).first().click();
  await expect(page.locator(".page-intro h1")).toHaveText("What would you like to understand first?");
  await expect(page.getByRole("button",{name:"How mutual funds work"})).toHaveAttribute("aria-pressed","true");
});

test("fund explorer searches and filters mocked AMFI records",async({page})=>{
  await mockSchemeApi(page);
  await page.goto("/funds");
  await expect(page.getByText("4 matching schemes")).toBeVisible();
  await page.getByLabel("Filter schemes by category").selectOption("Debt");
  await expect(page.getByText("1 matching schemes")).toBeVisible();
  await expect(page.getByRole("heading",{name:"Beta Liquid Fund"})).toBeVisible();
  await expect(page.getByRole("heading",{name:"Alpha Large Cap Fund"})).toHaveCount(0);
  await page.getByRole("button",{name:"Clear search and filters"}).click();
  const search=page.getByRole("searchbox",{name:"Search schemes by name, ISIN or scheme code"});
  await search.fill("Alpha");
  await expect(page.getByText("1 matching schemes")).toBeVisible();
  await expect(page.getByRole("heading",{name:"Alpha Large Cap Fund"})).toBeVisible();
  await expect(page.getByRole("link",{name:/View scheme details/})).toHaveAttribute("href","/funds/100201");
});

test("comparison supports add, remove and renders available scheme facts",async({page})=>{
  await mockSchemeApi(page);
  await page.goto("/compare");
  const search=page.getByPlaceholder("Search scheme name or code");
  await search.fill("Alpha");
  await page.getByRole("button",{name:"Add Alpha Large Cap Fund"}).click();
  await expect(page.getByRole("article",{name:"Scheme A: Alpha Large Cap Fund"})).toBeVisible();
  await expect(page.getByRole("cell",{name:"Alpha Mutual Fund"})).toBeVisible();
  await search.fill("Beta");
  await page.getByRole("button",{name:"Add Beta Liquid Fund"}).click();
  await expect(page.getByText("2 selected")).toBeVisible();
  await expect(page.getByRole("cell",{name:"INF000000202"})).toBeVisible();
  await page.getByRole("button",{name:"Remove Alpha Large Cap Fund"}).click();
  await expect(page.getByRole("article",{name:"Scheme A: Beta Liquid Fund"})).toBeVisible();
  await expect(page.getByRole("article",{name:"Empty scheme slot B"})).toBeVisible();
  await expect(page.getByRole("cell",{name:"Alpha Mutual Fund"})).toHaveCount(0);
  await expect(page.getByRole("cell",{name:"Beta Asset Management"})).toBeVisible();
});

test("SIP and compound calculators expose their assumptions and update results",async({page})=>{
  await page.goto("/calculators/sip");
  const sipResult=page.locator(".result-panel");
  await expect(sipResult).toContainText("ILLUSTRATIVE FUTURE VALUE");
  await expect(sipResult).toContainText("TOTAL INVESTED");
  const before=await sipResult.locator(".result-number").textContent();
  const monthlySlider=page.locator('input[type="range"]').first();
  await monthlySlider.focus();
  await monthlySlider.press("ArrowRight");
  await expect(monthlySlider).toHaveValue("5500");
  await expect(sipResult.locator(".result-number")).not.toHaveText(before??"");

  await page.goto("/calculators/compound");
  const compoundResult=page.locator(".result-panel");
  await page.getByLabel("Compounding frequency").selectOption("12");
  await expect(compoundResult).toContainText("Monthly");
  await expect(compoundResult).toContainText("ILLUSTRATIVE FUTURE VALUE");
});

test("glossary search returns matching terms and a useful empty state",async({page})=>{
  await page.goto("/glossary");
  const search=page.getByRole("textbox",{name:"Search glossary terms"});
  await search.fill("XIRR");
  await expect(page.getByRole("heading",{name:"XIRR"})).toBeVisible();
  await expect(page.getByText("1 terms")).toBeVisible();
  await search.fill("term-that-does-not-exist");
  await expect(page.getByText("No matching terms. Try another word.")).toBeVisible();
});

test("mobile navigation remains usable and pages do not overflow horizontally",async({page})=>{
  test.skip((page.viewportSize()?.width??1440)>600,"mobile viewport only");
  await mockSchemeApi(page);
  await page.goto("/");
  const quickNav=page.getByRole("navigation",{name:"Quick navigation"});
  await expect(quickNav).toBeVisible();
  await expect(quickNav.getByRole("link",{name:"Home"})).toHaveAttribute("aria-current","page");
  await quickNav.getByRole("link",{name:"Learn"}).click();
  await expect(page.getByRole("heading",{level:1})).toContainText("Build knowledge");
  await expect(quickNav.getByRole("link",{name:"Learn"})).toHaveAttribute("aria-current","page");
  for(const path of ["/learn","/funds","/compare","/calculators/sip","/glossary","/resources"]){
    await page.goto(path);
    const widths=await page.evaluate(()=>({
      viewport:document.documentElement.clientWidth,
      scroll:document.documentElement.scrollWidth
    }));
    expect(widths.scroll, `horizontal overflow on ${path}`).toBeLessThanOrEqual(widths.viewport+1);
  }
});
