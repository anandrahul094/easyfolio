import Link from "next/link";
import {notFound} from "next/navigation";
import {PageIntro,Note} from "../../ui";

type Section={heading:string;paragraphs?:string[];bullets?:string[]};
type Lesson={title:string;summary:string;read:string;sections:Section[];takeaway:string;related:string;relatedHref:string};
const lessons:Record<string,Lesson>={
  "mutual-fund-fundamentals":{
    title:"Mutual fund fundamentals",summary:"Understand the pooled structure, the role of the fund house and what it means to own units in a scheme.",read:"6 min",
    sections:[
      {heading:"What is a mutual fund?",paragraphs:["A mutual fund pools money from multiple investors and invests it according to a stated investment objective and scheme mandate. The investments may include shares, bonds, money-market instruments or a mix, depending on the scheme.","Investors hold units in the scheme. Each unit represents a proportionate interest in the scheme's portfolio, rather than direct ownership of each security held by the fund."]},
      {heading:"Who does what?",paragraphs:["An Asset Management Company (AMC) manages the scheme and its investments. A fund manager and investment team make portfolio decisions within the scheme mandate. Other service providers support functions such as custody, recordkeeping and distribution.","The scheme's official documents explain its objective, permitted investments, risks, fees and operating rules. Read those documents rather than relying only on a short description."]},
      {heading:"How is a unit valued?",paragraphs:["Net Asset Value (NAV) is the per-unit value calculated from the scheme's assets and liabilities. NAV changes as the value of the portfolio and scheme liabilities change.","A lower NAV does not automatically mean a scheme is cheaper or better. Compare scheme objectives, holdings, costs and relevant disclosures—not NAV in isolation."]}
    ],
    takeaway:"A mutual fund is a pooled investment structure. Understand the scheme mandate and risks before focusing on its NAV or past performance.",related:"Explore the glossary",relatedHref:"/glossary"
  },
  "sip-explained":{
    title:"SIP, explained simply",summary:"Learn how regular instalments work, what rupee-cost averaging means and what a SIP cannot guarantee.",read:"5 min",
    sections:[
      {heading:"What is a SIP?",paragraphs:["A Systematic Investment Plan (SIP) is a facility that allows an investor to invest a fixed amount into a mutual fund scheme at regular intervals. It describes the timing and process of investing; it is not a separate type of mutual fund.","The number of units purchased at each instalment depends on the applicable NAV and the amount invested."]},
      {heading:"What is rupee-cost averaging?",paragraphs:["When a fixed amount is invested regularly, the number of units purchased may vary with the NAV. More units may be purchased when the NAV is lower and fewer when it is higher.","This averaging effect does not prevent losses or guarantee a profit. The value of the units can fall, and the outcome depends on the scheme and market path."]},
      {heading:"What to check",bullets:["Understand the scheme objective, portfolio and risk level.","Check the minimum instalment, frequency, dates and applicable scheme rules.","Review exit loads, taxes and the possibility of loss before redeeming."]}
    ],
    takeaway:"A SIP is a regular-investment facility, not a return guarantee and not a way to remove market risk.",related:"Try the illustrative SIP calculator",relatedHref:"/calculators/sip"
  },
  "mutual-fund-categories":{
    title:"Know the mutual fund categories",summary:"Learn what broad scheme categories describe—and why a category label alone is not enough to judge risk.",read:"7 min",
    sections:[
      {heading:"Equity schemes",paragraphs:["Equity-oriented schemes invest primarily in shares and related equity instruments. Their values can fluctuate with markets, sectors and individual companies. Different equity categories can have very different portfolios and risk characteristics."]},
      {heading:"Debt schemes",paragraphs:["Debt schemes invest in instruments such as government securities, corporate bonds and money-market instruments. Interest-rate changes, issuer credit quality and liquidity can affect their value. A debt label does not mean capital is guaranteed."]},
      {heading:"Hybrid and other structures",paragraphs:["Hybrid schemes combine asset classes under a defined mandate. Life-cycle and solution-oriented schemes may have time-based objectives or scheme-specific restrictions. Index funds and ETFs can follow an index; fund-of-funds schemes invest in other funds.","The exact mandate, asset allocation, investment strategy and risk disclosures are more informative than a broad category name."]}
    ],
    takeaway:"Use categories to organise research. Then read the individual scheme mandate, portfolio and current risk disclosures.",related:"Explore mutual fund categories",relatedHref:"/categories"
  },
  "understand-risk":{
    title:"Understand investment risk",summary:"Explore the different ways a mutual fund scheme can lose value or behave differently from what you expect.",read:"8 min",
    sections:[
      {heading:"Market and concentration risk",paragraphs:["Market prices can fall because of economic conditions, interest rates, company developments or investor sentiment. A scheme concentrated in a small number of holdings, sectors or themes may be more exposed to a particular event.","Diversification can reduce concentration in individual holdings, but it cannot eliminate broad market risk."]},
      {heading:"Interest-rate and credit risk",paragraphs:["Debt-security prices can change as interest rates move. The effect depends on factors including maturity and duration. Credit risk is the possibility that an issuer may not meet its payment obligations or that its perceived credit quality may deteriorate."]},
      {heading:"Liquidity and scheme-specific risks",paragraphs:["Liquidity risk arises when an investment is difficult to sell promptly at a fair price. Schemes may also have specific risks linked to derivatives, overseas exposure, commodities, small-cap securities or their investment strategy.","The Riskometer is one useful disclosure, but it is not a complete substitute for reading the scheme information document and portfolio disclosures."]}
    ],
    takeaway:"Risk is multi-dimensional. Read the current Riskometer, scheme mandate, portfolio and disclosures; do not treat a category label as a full risk assessment.",related:"Read about investing basics",relatedHref:"/basics"
  },
  "read-a-scheme-page":{
    title:"How to read a scheme page",summary:"Learn how to interpret the key identity and NAV fields shown in a mutual fund scheme listing.",read:"6 min",
    sections:[
      {heading:"Start with the scheme identity",paragraphs:["Read the complete scheme name, AMC, plan and option. Direct and Regular plans use different distribution arrangements. Growth and IDCW options describe different ways scheme income may be reflected or distributed.","Check the scheme code and ISIN to distinguish a specific scheme and option. Small differences in a name can represent materially different options."]},
      {heading:"Understand NAV and its date",paragraphs:["NAV is the per-unit value for the stated NAV date. Always read the date alongside the value. A NAV number without a date or source can be misleading.","NAV alone does not tell you whether the scheme has performed well, whether it is low-cost or whether it is appropriate for a particular investor."]},
      {heading:"Find information beyond the listing",paragraphs:["A basic NAV feed may not contain expense ratio, assets under management, benchmark, portfolio holdings, Riskometer or historical returns. Those details need separate, dated and trustworthy sources.","Use the latest scheme information document, factsheet and other AMC disclosures to verify the investment mandate, costs, benchmark and risks."]}
    ],
    takeaway:"Read scheme name, plan, option, scheme identifiers, NAV and NAV date together. Verify additional metrics from their own dated sources.",related:"Open the fund explorer",relatedHref:"/funds"
  },
  "before-you-take-action":{
    title:"Before you take action",summary:"A practical checklist for understanding scheme terms and finding the original documents.",read:"7 min",
    sections:[
      {heading:"Compare the plan and option",paragraphs:["Direct and Regular plans reflect different distribution arrangements and can have different expenses. Growth and IDCW options treat income and distributions differently. Check the precise option before comparing schemes.","A distribution under an IDCW option is not an extra return on top of the scheme's value. Review the scheme's documents to understand how it works."]},
      {heading:"Check costs, restrictions and taxes",paragraphs:["Review the current expense ratio, exit load, lock-in provisions where applicable and tax treatment. These details may change and depend on the scheme and the investor's circumstances.","Use current official scheme documents and consider independent professional advice for tax or personal financial questions."]},
      {heading:"Use original sources",bullets:["Read the latest Scheme Information Document and Key Information Memorandum.","Check the latest AMC factsheet, portfolio and Riskometer.","Confirm NAV values and dates against the published source.","Do not rely on past returns, a single metric or a third-party summary alone."]}
    ],
    takeaway:"Before making any decision, verify the exact scheme and option, read its current documents and understand the risks, costs and conditions.",related:"Compare available scheme information",relatedHref:"/compare"
  }
};
const order=Object.keys(lessons);
export function generateStaticParams(){return order.map(slug=>({slug}));}
export const dynamicParams=false;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  return {title:lessons[slug]?.title??"Learning lesson"};
}
export default async function LessonPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const lesson=lessons[slug];
  if(!lesson) notFound();
  const index=order.indexOf(slug);
  const previous=index>0?order[index-1]:null;
  const next=index<order.length-1?order[index+1]:null;
  return <main className="page-shell">
    <p className="small-muted"><Link href="/learn">Learning centre</Link> / Lesson {String(index+1).padStart(2,"0")} of {order.length}</p>
    <PageIntro eyebrow={"LESSON "+String(index+1).padStart(2,"0")+" · "+lesson.read+" READ"} title={lesson.title} description={lesson.summary}/>
    <article className="lesson-article">
      {lesson.sections.map(section=><section key={section.heading}>
        <h2>{section.heading}</h2>
        {section.paragraphs?.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
        {section.bullets&&<ul>{section.bullets.map(item=><li key={item}>{item}</li>)}</ul>}
      </section>)}
      <Note title="Key takeaway"><p>{lesson.takeaway}</p></Note>
      <p><Link className="text-link" href={lesson.relatedHref}>{lesson.related} →</Link></p>
    </article>
    <nav className="lesson-nav" aria-label="Lesson navigation">
      {previous?<Link href={"/learn/"+previous}><small>← PREVIOUS LESSON</small>{lessons[previous].title}</Link>:<Link href="/learn"><small>BACK TO LEARNING CENTRE</small>All lessons</Link>}
      {next?<Link href={"/learn/"+next}><small>NEXT LESSON →</small>{lessons[next].title}</Link>:<Link href="/learn"><small>COURSE COMPLETE</small>Return to learning centre</Link>}
    </nav>
  </main>;
}
