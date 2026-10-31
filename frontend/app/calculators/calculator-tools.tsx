"use client";
import {useMemo,useState} from "react";
import {ArrowDownRight,ArrowUpRight,ChartLine,Info,SlidersHorizontal} from "lucide-react";
import {PageIntro,Note} from "../ui";
import {calculateCompound,calculateSip,formatInr} from "../lib/finance";
import {ProjectionCurve,buildProjectionSeries,type ProjectionPoint} from "../components/visuals";

function Slider({label,value,min,max,step,unit,onChange}:{label:string;value:number;min:number;max:number;step:number;unit:"money"|"percent"|"years";onChange:(v:number)=>void}){
  const fmt=(v:number)=>unit==="money"?formatInr(v):unit==="percent"?v.toFixed(1)+"%":v.toLocaleString("en-IN")+" years";
  return <label className="block">
    <span className="slider-line"><span>{label}</span><strong>{fmt(value)}</strong></span>
    <input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={event=>onChange(Number(event.target.value))} className="glass-input"/>
    <span className="mt-1 flex justify-between text-[9px] text-slate-500"><span>{fmt(min)}</span><span>{fmt(max)}</span></span>
  </label>;
}

function ProjectionResult({invested,future,growth}:{invested:number;future:number;growth:number}){
  return <section className="result-panel" aria-live="polite" aria-atomic="true">
    <span className="eyebrow">ILLUSTRATIVE FUTURE VALUE</span>
    <div className="result-number">{formatInr(future)}</div>
    <div className={"metric-trend "+(growth<0?"text-rose-200":"text-emerald-200")}>{growth<0?<ArrowDownRight size={13}/>:<ArrowUpRight size={13}/>} {formatInr(Math.abs(growth))} {growth<0?"illustrative loss":"illustrative growth"}</div>
    <div className="result-pair">
      <div><span>TOTAL INVESTED</span><strong>{formatInr(invested)}</strong></div>
      <div><span>{growth<0?"LOSS":"GROWTH"}</span><strong>{formatInr(growth)}</strong></div>
    </div>
    <div className="bar-track"><div className="bar-invested" style={{width:(future>0?Math.min(100,invested/future*100):100)+"%"}}/><div className="bar-growth" style={{width:(future>invested?(future-invested)/future*100:0)+"%"}}/></div>
    <p>Illustrative calculation only. Fees, taxes and inflation are excluded.</p>
  </section>;
}

export function SipCalculator(){
  const [monthly,setMonthly]=useState(5000);
  const [rate,setRate]=useState(10);
  const [years,setYears]=useState(10);
  const result=useMemo(()=>calculateSip(monthly,rate,years),[monthly,rate,years]);
  const series=useMemo(()=>buildProjectionSeries(monthly,rate,years),[monthly,rate,years]);
  return <main className="page-shell">
    <PageIntro eyebrow="INTERACTIVE PROJECTION LAB" title="See how a monthly SIP can add up." description="Move the sliders and watch the curve respond. This is a mathematical illustration using a fixed assumed rate, not a prediction of mutual fund returns."/>
    <div className="bento-grid">
      <section className="bento-card bento-span-4">
        <div className="bento-card-head"><div><span className="eyebrow"><SlidersHorizontal size={12}/> YOUR ASSUMPTIONS</span><h2 className="mt-2">Tune the inputs</h2></div><div className="icon-chip"><ChartLine size={18}/></div></div>
        <div className="grid gap-6">
          <Slider label="Monthly investment" value={monthly} min={500} max={100000} step={500} unit="money" onChange={setMonthly}/>
          <Slider label="Assumed annual return" value={rate} min={-20} max={20} step={.5} unit="percent" onChange={setRate}/>
          <Slider label="Investment period" value={years} min={1} max={40} step={1} unit="years" onChange={setYears}/>
        </div>
        <div className="mt-6 rounded-2xl border border-violet-200/15 bg-violet-300/[.07] p-4"><span className="metric-label">TOTAL CONTRIBUTIONS</span><div className="metric-number">{formatInr(result.investedAmount)}</div><p className="text-[10px] leading-5 text-slate-400">{years*12} monthly instalments, assumed at the end of each month.</p></div>
      </section>
      <section className="bento-card bento-span-8">
        <div className="bento-card-head"><div><span className="eyebrow">PROJECTION CURVE</span><h2 className="mt-2">Your money over time</h2><p>Change any assumption to recalculate this curve instantly.</p></div><span className="pill">Illustrative</span></div>
        <ProjectionCurve data={series}/>
        <div className="chart-caption"><span className="chart-legend"><i className="legend-dot" style={{background:"#a993ff"}}/>Illustrative value</span><span className="chart-legend"><i className="legend-dot" style={{background:"#43d6a9"}}/>Contributions</span></div>
        <div className="mt-5"><ProjectionResult invested={result.investedAmount} future={result.futureValue} growth={result.growth}/></div>
      </section>
    </div>
    <div className="mt-6"><Note title="An illustration is not a forecast"><p>End-of-month instalments and monthly compounding of the assumed annual rate. Actual investment returns vary and may be negative. A SIP does not guarantee returns or eliminate market risk.</p></Note></div>
  </main>;
}

export function CompoundCalculator(){
  const [principal,setPrincipal]=useState(100000);
  const [rate,setRate]=useState(10);
  const [years,setYears]=useState(10);
  const [frequency,setFrequency]=useState(1);
  const result=useMemo(()=>calculateCompound(principal,rate,years,frequency),[principal,rate,years,frequency]);
  const options:[string,number][]=[["Annually",1],["Half-yearly",2],["Quarterly",4],["Monthly",12]];
  const series=useMemo<ProjectionPoint[]>(()=>Array.from({length:years+1},(_,year)=>{
    const future=year===0?principal:calculateCompound(principal,rate,year,frequency).futureValue;
    return {year,invested:principal,projected:future,growth:future-principal};
  }),[principal,rate,years,frequency]);
  return <main className="page-shell">
    <PageIntro eyebrow="INTERACTIVE PROJECTION LAB" title="Time changes the shape of growth." description="Explore how a starting amount changes under a hypothetical annual compounding assumption. The curve is a mathematical scenario, not a return forecast."/>
    <div className="bento-grid">
      <section className="bento-card bento-span-4">
        <div className="bento-card-head"><div><span className="eyebrow"><SlidersHorizontal size={12}/> YOUR ASSUMPTIONS</span><h2 className="mt-2">Tune the inputs</h2></div><div className="icon-chip"><ChartLine size={18}/></div></div>
        <div className="grid gap-6">
          <Slider label="Initial amount" value={principal} min={1000} max={5000000} step={1000} unit="money" onChange={setPrincipal}/>
          <Slider label="Assumed annual rate" value={rate} min={-20} max={20} step={.5} unit="percent" onChange={setRate}/>
          <Slider label="Duration" value={years} min={1} max={50} step={1} unit="years" onChange={setYears}/>
          <label className="block"><span className="slider-line"><span>Compounding frequency</span><strong>{options.find(option=>option[1]===frequency)?.[0]}</strong></span><select aria-label="Compounding frequency" className="select" value={frequency} onChange={event=>setFrequency(Number(event.target.value))}>{options.map(([label,value])=><option key={value} value={value}>{label}</option>)}</select></label>
        </div>
      </section>
      <section className="bento-card bento-span-8">
        <div className="bento-card-head"><div><span className="eyebrow">COMPOUNDING CURVE</span><h2 className="mt-2">See compounding unfold</h2><p>Frequency and time horizon change the projection path.</p></div><span className="pill">Illustrative</span></div>
        <ProjectionCurve data={series}/>
        <div className="mt-5"><ProjectionResult invested={result.investedAmount} future={result.futureValue} growth={result.growth}/></div>
      </section>
    </div>
    <div className="mt-6"><Note title="Compounding describes a formula — not a guaranteed outcome"><p>Actual market-linked investment returns are uneven and may be negative. This calculator does not represent returns of any mutual fund or asset class. Fees, taxes and inflation are excluded.</p></Note></div>
  </main>;
}
