import Link from "next/link";
import {PageIntro,Note} from "../ui";

const lessons=[
  ["01","Mutual fund fundamentals","What a mutual fund is, how units work and what an AMC does.","6 min","mutual-fund-fundamentals"],
  ["02","SIP, explained simply","How instalments work, what rupee-cost averaging means and what a SIP does not guarantee.","5 min","sip-explained"],
  ["03","Know the categories","Equity, debt, hybrid, life-cycle and solution-oriented categories.","7 min","mutual-fund-categories"],
  ["04","Understand risk","Volatility, credit risk, interest-rate risk, liquidity and the Riskometer.","8 min","understand-risk"],
  ["05","Read a scheme page","NAV, scheme category, ISIN, benchmark, expense ratio and scheme information documents.","6 min","read-a-scheme-page"],
  ["06","Before you take action","Direct vs Regular, Growth vs IDCW, exit load, KYC and official scheme documents.","7 min","before-you-take-action"]
] as const;

export default function Learn(){
  return <main className="page-shell">
    <PageIntro eyebrow="THE EASYFOLIO LEARNING CENTRE" title="Build knowledge, one idea at a time." description="Short, structured lessons designed for people who are new to mutual funds. Start with the language, understand the risks, then move into research."/>
    <div className="lesson-grid">
      {lessons.map(([number,title,description,time,slug])=><article className="lesson-card" key={slug}>
        <span className="lesson-no" aria-hidden="true">{number}</span>
        <h2 className="content-title" style={{fontSize:23,margin:"6px 0 0"}}>{title}</h2>
        <p>{description}</p><span className="pill pill-neutral">{time} read</span>
        <Link href={"/learn/"+slug} className="text-link">Read lesson <span aria-hidden="true">→</span></Link>
      </article>)}
    </div>
    <div style={{marginTop:28}}><Note title="A lesson should leave you with a better question."><p>When you finish the learning path, use the category explorer and scheme pages to continue your research. Keep the risks and source dates in view.</p><Link href="/categories" className="text-link">Continue to fund categories →</Link></Note></div>
  </main>;
}
