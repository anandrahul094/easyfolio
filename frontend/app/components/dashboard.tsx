"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {ArrowDownRight,ArrowRight,ArrowUpRight,BookOpen,ChartLine,CircleHelp,Compass,Database,GraduationCap,Layers,ShieldCheck,Sparkles,TrendingUp} from "lucide-react";
import {calculateSip,formatInr} from "../lib/finance";
import {AllocationRing,PerformanceHeatmap,ProjectionCurve,ProjectionHeatmap,buildProjectionSeries} from "./visuals";

const journey=[
  {title:"Mutual fund fundamentals",desc:"Understand units, fund houses and NAV.",href:"/learn/mutual-fund-fundamentals",time:"6 min"},
  {title:"SIP, explained simply",desc:"See how recurring contributions work.",href:"/learn/sip-explained",time:"5 min"},
  {title:"Know the categories",desc:"Explore equity, debt and hybrid structures.",href:"/learn/mutual-fund-categories",time:"7 min"},
  {title:"Understand investment risk",desc:"Explore market, credit and liquidity risks.",href:"/learn/understand-risk",time:"8 min"}
];

function Slider({label,value,min,max,step,format,onChange}:{label:string;value:number;min:number;max:number;step:number;format:(n:number)=>string;onChange:(n:number)=>void}){
  return <label className="block">
    <span className="slider-line"><span>{label}</span><strong>{format(value)}</strong></span>
    <input className="glass-input" type="range" min={min} max={max} step={step} value={value} onChange={event=>onChange(Number(event.target.value))}/>
  </label>;
}

export default function Dashboard(){
  const [monthly,setMonthly]=useState(5000);
  const [rate,setRate]=useState(10);
  const [years,setYears]=useState(12);
  const [completed,setCompleted]=useState<string[]>([]);
  useEffect(()=>{
    try{
      const saved=JSON.parse(window.localStorage.getItem("easyfolio:learning-progress:v1")??"[]");
      if(Array.isArray(saved)){
        setCompleted(saved.filter((value):value is string=>typeof value==="string"&&journey.some(item=>item.href===value)));
      }
    }catch{setCompleted([]);}
  },[]);
  const projection=useMemo(()=>calculateSip(monthly,rate,years),[monthly,rate,years]);
  const series=useMemo(()=>buildProjectionSeries(monthly,rate,years),[monthly,rate,years]);
  const done=journey.filter(item=>completed.includes(item.href)).length;
  const nextJourney=journey.find(item=>!completed.includes(item.href));
  const progress=Math.round(done/journey.length*100);
  return <main>
    <section className="mx-auto grid max-w-[1380px] gap-5 px-5 pb-5 pt-8 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pt-12">
      <div className="flex flex-col justify-center py-4">
        <span className="eyebrow"><Sparkles size={13}/> FINANCIAL CLARITY, VISUALLY</span>
        <h1 className="mt-4 max-w-[760px] font-['Space_Grotesk'] text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[62px]">See the bigger picture. <span className="bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">Learn as you go.</span></h1>
        <p className="mt-5 max-w-[620px] text-sm leading-7 text-slate-300">A visual space to understand mutual funds, explore the maths behind projections and make sense of the information that is actually available.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/learn" className="button-primary"><GraduationCap size={16}/> Continue learning</Link>
          <Link href="/funds" className="button-secondary"><Compass size={16}/> Explore schemes</Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-4 text-[10px] font-semibold text-slate-400"><span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-300"/> Source-led scheme facts</span><span className="inline-flex items-center gap-1.5"><Sparkles size={13} className="text-violet-300"/> Interactive learning tools</span></div>
      </div>
      <div className="relative min-h-[330px] overflow-hidden rounded-[28px] border border-violet-200/15 bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-cyan-400/10 p-5 shadow-glow sm:p-7">
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl"/>
        <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"/>
        <div className="relative flex items-start justify-between gap-4"><div><span className="metric-label">YOUR LEARNING DASHBOARD</span><h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">Build your money map</h2><p className="mt-1 text-xs text-slate-300">A guided space to explore one idea at a time.</p></div><div className="icon-chip"><Layers size={19}/></div></div>
        <div className="relative mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 backdrop-blur-xl"><span className="text-[9px] font-bold tracking-wider text-slate-400">LEARNING NODES</span><div className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-white">{done}<span className="text-lg text-slate-500"> / 4</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-emerald-300 transition-all duration-500" style={{width:progress+"%"}}/></div></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 backdrop-blur-xl"><span className="text-[9px] font-bold tracking-wider text-slate-400">EXPLORE NEXT</span><div className="mt-2 text-sm font-semibold text-white">{nextJourney?.title??"All foundational nodes complete"}</div><Link href={nextJourney?.href??"/learn"} className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-violet-200">{nextJourney?"Open lesson":"Review learning path"} <ArrowUpRight size={12}/></Link></div>
        </div>
        <div className="relative mt-5 flex items-center gap-2">{journey.map((item,index)=><span key={item.title} className={"h-2 flex-1 rounded-full transition-all duration-500 "+(completed.includes(item.href)?"bg-emerald-300":"bg-white/15")}/>)}</div>
        <div className="relative mt-3 flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400"><span>Start</span><span>Build confidence</span></div>
      </div>
    </section>

    <section className="mx-auto max-w-[1380px] px-5 pb-8 lg:px-8">
      <div className="mb-4 flex items-end justify-between gap-4"><div><span className="eyebrow">YOUR VISUAL OVERVIEW</span><h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">Explore the moving parts</h2></div><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Interactive · Illustrative</span></div>
      <div className="bento-grid">
        <article className="bento-card bento-span-8">
          <div className="bento-card-head"><div><span className="eyebrow"><TrendingUp size={12}/> PROJECTION LAB</span><h2 className="mt-2">Watch assumptions take shape</h2><p>Change the inputs and see an illustrative SIP curve update instantly.</p></div><div className="icon-chip"><ChartLine size={18}/></div></div>
          <div className="grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
            <div className="grid content-start gap-5">
              <Slider label="Monthly contribution" value={monthly} min={500} max={50000} step={500} format={formatInr} onChange={setMonthly}/>
              <Slider label="Assumed annual rate" value={rate} min={-10} max={20} step={.5} format={n=>n.toFixed(1)+"%"} onChange={setRate}/>
              <Slider label="Time horizon" value={years} min={1} max={30} step={1} format={n=>n+" years"} onChange={setYears}/>
              <div className="rounded-2xl border border-violet-200/15 bg-violet-400/[.08] p-4">
                <span className="metric-label">ILLUSTRATIVE FUTURE VALUE</span><div className="metric-number">{formatInr(projection.futureValue)}</div>
                <div className={"metric-trend "+(projection.growth<0?"text-rose-300":"text-emerald-300")}>{projection.growth<0?<ArrowDownRight size={13}/>:<ArrowUpRight size={13}/>} {formatInr(Math.abs(projection.growth))} {projection.growth<0?"illustrative loss":"illustrative growth"}</div>
                <p className="mt-3 text-[10px] leading-5 text-slate-400">Total contributions: {formatInr(projection.investedAmount)}. Assumes end-of-month instalments and monthly compounding.</p>
              </div>
            </div>
            <div className="min-w-0"><div className="mb-3 flex items-center justify-between"><span className="metric-label">VALUE OVER TIME</span><span className="text-[9px] text-slate-500">₹ INR</span></div><ProjectionCurve data={series} compact/><div className="chart-caption"><span className="chart-legend"><i className="legend-dot" style={{background:"#a993ff"}}/>Illustrative value</span><span className="chart-legend"><i className="legend-dot" style={{background:"#43d6a9"}}/>Contributions</span></div></div>
          </div>
        </article>

        <article className="bento-card bento-span-4">
          <div className="bento-card-head"><div><span className="eyebrow">EDUCATIONAL MODEL</span><h2 className="mt-2">Asset allocation ring</h2><p>A selectable example to understand allocation categories.</p></div><div className="icon-chip"><Database size={18}/></div></div>
          <AllocationRing/>
          <p className="mt-3 rounded-xl border border-amber-200/15 bg-amber-300/[.06] p-3 text-[10px] leading-5 text-amber-100/80">Illustrative allocation only. This is not a real mutual fund portfolio or a suggested asset mix.</p>
        </article>

        <article className="bento-card bento-span-7">
          <div className="bento-card-head"><div><span className="eyebrow">SCENARIO EXPLORER</span><h2 className="mt-2">Projection sensitivity map</h2><p>See how different rate and time assumptions change a hypothetical SIP result.</p></div><div className="icon-chip"><ChartLine size={18}/></div></div>
          <ProjectionHeatmap monthly={monthly}/>
        </article>

        <article className="bento-card bento-span-5">
          <div className="bento-card-head"><div><span className="eyebrow">DATA TRANSPARENCY</span><h2 className="mt-2">What the feed can show</h2><p>Live scheme facts are separated from metrics that need other sources.</p></div><div className="icon-chip"><Database size={18}/></div></div>
          <div className="data-status-row"><span className="status-ok">●</span><span>Scheme identity and plan/option</span><strong className="ml-auto text-emerald-300">Available</strong></div>
          <div className="data-status-row"><span className="status-ok">●</span><span>Published NAV and NAV date</span><strong className="ml-auto text-emerald-300">Available</strong></div>
          <div className="data-status-row"><span className="status-pending">●</span><span>Historical return series</span><strong className="ml-auto text-amber-200">Not connected</strong></div>
          <div className="data-status-row"><span className="status-pending">●</span><span>Portfolio and allocation holdings</span><strong className="ml-auto text-amber-200">Not connected</strong></div>
          <div className="data-status-row"><span className="status-pending">●</span><span>Official Riskometer history</span><strong className="ml-auto text-amber-200">Not connected</strong></div>
          <Link href="/funds" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-violet-200">Browse source-backed scheme facts <ArrowRight size={14}/></Link>
        </article>

        <article className="bento-card bento-span-12">
          <div className="bento-card-head"><div><span className="eyebrow"><GraduationCap size={12}/> LEARNING JOURNEY</span><h2 className="mt-2">Small steps. Clearer concepts.</h2><p>Follow the learning route in order, or open the topic that interests you.</p></div><Link href="/learn" className="button-secondary">View all lessons <ArrowRight size={14}/></Link></div>
          <div className="grid gap-1 md:grid-cols-4">
            {journey.map((item,index)=><Link key={item.title} href={item.href} className={"group rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 "+(completed.includes(item.href)?"border-emerald-300/20 bg-emerald-300/[.05]":"border-white/10 bg-white/[.025] hover:border-violet-200/30")}>
              <div className="mb-3 flex items-center justify-between"><span className={"grid h-9 w-9 place-items-center rounded-full "+(completed.includes(item.href)?"bg-emerald-300/15 text-emerald-200":"bg-violet-300/10 text-violet-200")}>{completed.includes(item.href)?<ShieldCheck size={16}/>:<BookOpen size={16}/>}</span><span className="text-[9px] text-slate-500">{item.time}</span></div>
              <h3 className="text-sm font-bold text-white">{item.title}</h3><p className="mt-2 text-[10px] leading-5 text-slate-400">{item.desc}</p><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-violet-200 group-hover:text-white">Open node <ArrowUpRight size={12}/></span>
            </Link>)}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3"><div className="flex items-center gap-2 text-[11px] text-slate-300"><CircleHelp size={15} className="text-violet-200"/>Learning progress is stored locally in this browser.</div><Link href="/learn" className="text-[10px] font-bold text-violet-200">Update learning progress <ArrowRight size={13}/></Link></div>
        </article>
      </div>
      <article className="bento-card mt-4">
        <div className="bento-card-head"><div><span className="eyebrow">HISTORICAL PERFORMANCE</span><h2 className="mt-2">Monthly return heatmap</h2><p>A compact view of positive and negative months, populated only from verified performance records.</p></div><div className="icon-chip"><ChartLine size={18}/></div></div>
        <PerformanceHeatmap/>
      </article>
    </section>

    <section className="mx-auto max-w-[1380px] px-5 pb-10 lg:px-8"><div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-violet-200/15 bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-cyan-400/10 p-6 sm:p-8"><div><span className="eyebrow">READY FOR THE NEXT STEP?</span><h2 className="mt-2 font-['Space_Grotesk'] text-2xl font-semibold text-white">Turn curiosity into understanding.</h2><p className="mt-2 max-w-xl text-xs leading-6 text-slate-300">Use the guided discovery route to find the right learning topics for your questions — not an investment recommendation.</p></div><Link href="/discover" className="button-primary"><Compass size={15}/> Find your starting point</Link></div></section>
  </main>;
}
