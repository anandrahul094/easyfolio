"use client";
import {useState} from "react";
import {PageIntro,Note} from "../ui";
import {calculateCompound,calculateSip,formatInr} from "../lib/finance";

function Slider({label,value,min,max,step,unit,onChange}:{label:string;value:number;min:number;max:number;step:number;unit:string;onChange:(v:number)=>void}){
  const fmt=(v:number)=>unit==="₹"?formatInr(v):v.toLocaleString("en-IN")+unit;
  return <label>
    <span className="input-value-row"><span>{label}</span><strong>{fmt(value)}</strong></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={event=>onChange(Number(event.target.value))}/>
    <span className="small-muted"><span>{fmt(min)}</span><span>{fmt(max)}</span></span>
  </label>;
}

export function SipCalculator(){
  const [monthly,setMonthly]=useState(5000);
  const [rate,setRate]=useState(10);
  const [years,setYears]=useState(10);
  const {investedAmount:invested,futureValue:future,growth,investedSharePercent:pct}=calculateSip(monthly,rate,years);
  return <main className="page-shell">
    <PageIntro eyebrow="INTERACTIVE LEARNING TOOL" title="See how a monthly SIP can add up."
      description="Explore an illustrative SIP calculation. Change the amount, assumed return and time to understand the formula — not to predict market performance."/>
    <div className="detail-grid">
      <section className="form-panel">
        <h2 className="content-title" style={{fontSize:25}}>Your SIP assumptions</h2>
        <Slider label="Monthly investment" value={monthly} min={500} max={100000} step={500} unit="₹" onChange={setMonthly}/>
        <Slider label="Assumed annual return" value={rate} min={-20} max={20} step={.5} unit="%" onChange={setRate}/>
        <Slider label="Investment period" value={years} min={1} max={40} step={1} unit=" years" onChange={setYears}/>
        <p className="small-muted">The annual return is an assumption for the calculation only. It is not a forecast, benchmark or expected return.</p>
      </section>
      <section className="result-panel" aria-live="polite" aria-atomic="true">
        <span className="eyebrow">ILLUSTRATIVE FUTURE VALUE</span>
        <div className="result-number">{formatInr(future)}</div>
        <p>{formatInr(monthly)} per month · {rate}% assumed annual return · {years} years</p>
        <div className="result-pair">
          <div><span>TOTAL INVESTED</span><strong>{formatInr(invested)}</strong></div>
          <div><span>{growth<0?"ILLUSTRATIVE LOSS":"ILLUSTRATIVE GROWTH"}</span><strong>{formatInr(growth)}</strong></div>
        </div>
        <span className="micro-label" style={{color:"var(--sage)"}}>COMPOSITION OF THE ILLUSTRATION</span>
        <div className="bar-track"><div className="bar-invested" style={{width:pct+"%"}}/><div className="bar-growth" style={{width:100-pct+"%"}}/></div>
        <p>Assumes end-of-month instalments and monthly compounding of the assumed annual rate. A negative assumed rate can produce an illustrative loss. Fees, taxes and inflation are excluded.</p>
      </section>
    </div>
    <div style={{marginTop:24}}><Note title="An illustration is not a forecast">
      <p>Mutual fund returns are market-linked and not guaranteed. Actual outcomes can be higher or lower, including loss of capital. This calculator does not model a specific scheme or include scheme-specific costs, exit loads, taxes or inflation.</p>
    </Note></div>
  </main>;
}

export function CompoundCalculator(){
  const [principal,setPrincipal]=useState(100000);
  const [rate,setRate]=useState(10);
  const [years,setYears]=useState(10);
  const [frequency,setFrequency]=useState(1);
  const {investedAmount,futureValue:future,growth,investedSharePercent:pct}=calculateCompound(principal,rate,years,frequency);
  const options:[string,number][]=[["Annually",1],["Half-yearly",2],["Quarterly",4],["Monthly",12]];
  return <main className="page-shell">
    <PageIntro eyebrow="UNDERSTAND COMPOUNDING" title="Time changes the shape of growth."
      description="Explore how an initial amount changes under a hypothetical annual compounding assumption. This is a mathematical illustration, not an investment return prediction."/>
    <div className="detail-grid">
      <section className="form-panel">
        <h2 className="content-title" style={{fontSize:25}}>Set your assumptions</h2>
        <Slider label="Initial amount" value={principal} min={1000} max={5000000} step={1000} unit="₹" onChange={setPrincipal}/>
        <Slider label="Assumed annual rate" value={rate} min={-20} max={20} step={.5} unit="%" onChange={setRate}/>
        <Slider label="Duration" value={years} min={1} max={50} step={1} unit=" years" onChange={setYears}/>
        <label>Compounding frequency
          <select className="select" value={frequency} onChange={event=>setFrequency(Number(event.target.value))}>
            {options.map(([label,value])=><option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </section>
      <section className="result-panel" aria-live="polite" aria-atomic="true">
        <span className="eyebrow">ILLUSTRATIVE FUTURE VALUE</span>
        <div className="result-number">{formatInr(future)}</div>
        <p>{formatInr(principal)} principal · {rate}% assumed annual rate · {years} years · {options.find(option=>option[1]===frequency)?.[0]}</p>
        <div className="result-pair">
          <div><span>INITIAL AMOUNT</span><strong>{formatInr(investedAmount)}</strong></div>
          <div><span>{growth<0?"ILLUSTRATIVE LOSS":"ILLUSTRATIVE GROWTH"}</span><strong>{formatInr(growth)}</strong></div>
        </div>
        <span className="micro-label" style={{color:"var(--sage)"}}>GROWTH COMPOSITION</span>
        <div className="bar-track"><div className="bar-invested" style={{width:pct+"%"}}/><div className="bar-growth" style={{width:100-pct+"%"}}/></div>
        <p>Formula: principal × (1 + rate / compounding periods)^(periods × years).</p>
      </section>
    </div>
    <div style={{marginTop:24}}><Note title="Compounding describes a formula — not a guaranteed outcome">
      <p>Market-linked investment returns are uneven and may be negative. This calculator does not represent returns of any mutual fund or asset class. Fees, taxes and inflation are excluded.</p>
    </Note></div>
  </main>;
}
