import Link from "next/link";
import {ArrowRight,BookOpen,Clock3,Sparkles} from "lucide-react";
import {PageIntro,Note} from "../ui";
import {LearningPath} from "../components/learning-path";

const lessons=[
  ["01","Mutual fund fundamentals","Understand pooled investments, units and the role of an AMC.","6 min","mutual-fund-fundamentals"],
  ["02","SIP, explained simply","Explore recurring contributions, rupee-cost averaging and its limits.","5 min","sip-explained"],
  ["03","Know the categories","Understand equity, debt, hybrid and other structures.","7 min","mutual-fund-categories"],
  ["04","Understand investment risk","Explore market, credit, interest-rate and liquidity risks.","8 min","understand-risk"],
  ["05","Read a scheme page","Decode NAV, plan, option, ISIN and official disclosures.","6 min","read-a-scheme-page"],
  ["06","Before you take action","Check costs, scheme documents and important conditions.","7 min","before-you-take-action"]
] as const;

const pathLessons=lessons.map(([,title,description,time,slug])=>({title,description,time,href:"/learn/"+slug}));

export default function Learn(){
  return <main className="page-shell">
    <PageIntro eyebrow="THE EASYFOLIO LEARNING CENTRE" title="Build knowledge, one node at a time." description="A visual learning path for people who are new to mutual funds. Move through the concepts, mark milestones and return whenever you want."/>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="bento-card md:col-span-2">
        <span className="eyebrow"><Sparkles size={12}/> START WITH THE FOUNDATIONS</span>
        <h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">Small lessons. Better questions.</h2>
        <p className="mt-2 max-w-xl text-xs leading-6 text-slate-300">The course is designed to build understanding before you move into scheme research. Complete the nodes in sequence or jump directly to a topic.</p>
        <div className="mt-5 flex flex-wrap gap-3"><Link className="button-primary" href="/learn/mutual-fund-fundamentals"><BookOpen size={15}/> Begin the path</Link><Link className="button-secondary" href="/glossary">Open glossary <ArrowRight size={14}/></Link></div>
      </div>
      <div className="bento-card flex flex-col justify-between bg-gradient-to-br from-violet-500/20 to-cyan-500/10">
        <div><span className="metric-label">COURSE MAP</span><div className="mt-2 font-['Space_Grotesk'] text-4xl font-semibold text-white">06</div><p className="mt-1 text-xs text-slate-300">Short learning milestones</p></div>
        <div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-violet-100"><Clock3 size={14}/> Around 37 minutes of reading</div>
      </div>
    </div>
    <LearningPath lessons={pathLessons}/>
    <section className="mt-7 grid gap-4 md:grid-cols-2">
      {lessons.map(([number,title,description,time,slug])=><article key={slug} className="bento-card flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet-200/15 bg-violet-300/10 font-['Space_Grotesk'] text-sm font-bold text-violet-200">{number}</span>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-['Space_Grotesk'] text-base font-semibold text-white">{title}</h2><span className="inline-flex items-center gap-1 text-[9px] text-slate-400"><Clock3 size={11}/>{time}</span></div><p className="mt-2 text-xs leading-6 text-slate-400">{description}</p><Link href={"/learn/"+slug} className="text-link">Open lesson <ArrowRight size={13}/></Link></div>
      </article>)}
    </section>
    <div className="mt-7"><Note title="Learning progress stays private"><p>Milestones are stored in local browser storage only. There is no account tracking or public leaderboard.</p></Note></div>
  </main>;
}
