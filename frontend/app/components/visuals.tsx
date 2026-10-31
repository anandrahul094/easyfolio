"use client";

import {Fragment,useEffect,useId,useRef,useState} from "react";
import {
  Area,AreaChart,CartesianGrid,Cell,Pie,Legend,PieChart,
  ResponsiveContainer,Tooltip,XAxis,YAxis
} from "recharts";
import {calculateSip,formatInr} from "../lib/finance";

export type ProjectionPoint={year:number;invested:number;projected:number;growth:number};

export function buildProjectionSeries(monthly:number,annualRate:number,years:number):ProjectionPoint[]{
  return Array.from({length:years+1},(_,year)=>{
    const result=year===0?{investedAmount:0,futureValue:0,growth:0}:calculateSip(monthly,annualRate,year);
    return {year,invested:result.investedAmount,projected:result.futureValue,growth:result.growth};
  });
}

function useRevealed(){
  const ref=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  const [reducedMotion,setReducedMotion]=useState(false);
  useEffect(()=>{
    const node=ref.current;
    if(!node)return;
    const media=window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if(media){
      setReducedMotion(media.matches);
      const onChange=(event:MediaQueryListEvent)=>setReducedMotion(event.matches);
      media.addEventListener?.("change",onChange);
      return()=>media.removeEventListener?.("change",onChange);
    }
  },[]);
  useEffect(()=>{
    const node=ref.current;
    if(!node)return;
    if(typeof IntersectionObserver==="undefined"){setVisible(true);return;}
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}
    },{threshold:.18});
    observer.observe(node);
    return()=>observer.disconnect();
  },[]);
  return {ref,visible,animate:visible&&!reducedMotion};
}

const moneyTick=(value:number)=>value>=10000000?"₹"+(value/10000000).toFixed(1)+"Cr":value>=100000?"₹"+(value/100000).toFixed(0)+"L":"₹"+Math.round(value/1000)+"k";

export function ProjectionCurve({data,compact=false}:{data:ProjectionPoint[];compact?:boolean}){
  const {ref,visible,animate}=useRevealed();
  const gradientId=useId().replace(/:/g,"");
  const tickInterval=Math.max(1,Math.floor(data.length/6));
  return <div ref={ref} className={"chart-frame "+(compact?"compact":"")+" "+(visible?"reveal-chart":"")}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart key={visible?"revealed":"waiting"} data={data} margin={{top:12,right:10,left:0,bottom:0}}>
        <defs>
          <linearGradient id={"projectedFill-"+gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a28aff" stopOpacity={.42}/>
            <stop offset="100%" stopColor="#a28aff" stopOpacity={.015}/>
          </linearGradient>
          <linearGradient id={"investedFill-"+gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#49d6ad" stopOpacity={.22}/>
            <stop offset="100%" stopColor="#49d6ad" stopOpacity={.01}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(211,218,255,.09)" strokeDasharray="3 5" vertical={false}/>
        <XAxis dataKey="year" tick={{fill:"#9da8ca",fontSize:10}} tickLine={false} axisLine={false} tickFormatter={value=>value===0?"Now":"Y"+value} interval={tickInterval}/>
        <YAxis tick={{fill:"#9da8ca",fontSize:9}} tickLine={false} axisLine={false} width={52} tickFormatter={moneyTick}/>
        <Tooltip contentStyle={{background:"#171e3b",border:"1px solid rgba(195,181,255,.25)",borderRadius:12,color:"#fff",fontSize:11}} labelStyle={{color:"#c9baff",fontWeight:800}} formatter={value=>formatInr(Number(value))} labelFormatter={value=>Number(value)===0?"Starting point":"Year "+value}/>
        <Area type="monotone" dataKey="projected" name="Illustrative value" stroke="#a993ff" strokeWidth={3} fill={"url(#projectedFill-"+gradientId+")"} isAnimationActive={animate} animationDuration={850} animationEasing="ease-out"/>
        <Area type="monotone" dataKey="invested" name="Amount invested" stroke="#43d6a9" strokeWidth={2} fill={"url(#investedFill-"+gradientId+")"} isAnimationActive={animate} animationDuration={1000} animationEasing="ease-out"/>
        <Legend wrapperStyle={{display:"none"}}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}

const allocation=[
  {name:"Equity",value:55,color:"#9b7cff",description:"A hypothetical growth-oriented portion. Market values can fluctuate."},
  {name:"Debt",value:30,color:"#5ebdff",description:"A hypothetical fixed-income portion. Interest-rate and credit risks apply."},
  {name:"Cash",value:10,color:"#3bd6a8",description:"A hypothetical liquidity reserve. This is not a product allocation."},
  {name:"Gold",value:5,color:"#ffc978",description:"A hypothetical diversifier. Gold values can also move up or down."}
];

export function AllocationRing(){
  const [active,setActive]=useState(0);
  const selected=allocation[active];
  return <div className="allocation-wrap">
    <div className="donut-frame" role="img" aria-label="Illustrative allocation only: Equity 55 percent, Debt 30 percent, Cash 10 percent and Gold 5 percent">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="61%" outerRadius="83%" paddingAngle={4} stroke="none" isAnimationActive animationDuration={900} onMouseEnter={(_,index)=>setActive(index)} onClick={(_,index)=>setActive(index)}>
            {allocation.map((entry,index)=><Cell key={entry.name} fill={entry.color} fillOpacity={index===active?1:.68}/>)}
          </Pie>
          <Tooltip formatter={value=>String(value)+"% (illustrative)"} contentStyle={{background:"#171e3b",border:"1px solid rgba(195,181,255,.25)",borderRadius:10,color:"#fff",fontSize:11}}/>
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center"><strong>{selected.value}%</strong><span>{selected.name.toUpperCase()}</span></div>
    </div>
    <div>
      <div className="allocation-list">
        {allocation.map((entry,index)=><button key={entry.name} type="button" className="allocation-item" onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)} aria-pressed={active===index}>
          <span className="allocation-dot" style={{background:entry.color}}/><span>{entry.name}</span><strong>{entry.value}%</strong>
        </button>)}
      </div>
      <p aria-live="polite" className="mt-4 text-[10px] leading-5 text-slate-300">{selected.description}</p>
    </div>
  </div>;
}

const horizons=[1,3,5,10,15];
const rates=[-10,-5,0,5,10,15];
function cellStyle(rate:number,growth:number){
  if(rate<0)return {background:"rgba(251,113,133,"+Math.min(.38,.12+Math.abs(growth)*.14)+")",borderColor:"rgba(251,113,133,.2)",color:"#ffc0cb"};
  if(rate===0)return {background:"rgba(148,163,184,.13)",borderColor:"rgba(148,163,184,.18)",color:"#d8def7"};
  return {background:"rgba(52,211,153,"+Math.min(.38,.11+Math.abs(growth)*.075)+")",borderColor:"rgba(52,211,153,.2)",color:"#b5ffe5"};
}

export function ProjectionHeatmap({monthly=5000}:{monthly?:number}){
  const [selected,setSelected]=useState({rate:10,years:10});
  const value=calculateSip(monthly,selected.rate,selected.years);
  const relative=value.investedAmount?value.growth/value.investedAmount*100:0;
  return <div>
    <div className="heatmap-grid" role="group" aria-label="Illustrative SIP scenario heatmap. Choose an assumed annual rate and time horizon.">
      <span className="heatmap-head">RATE</span>
      {horizons.map(year=><span className="heatmap-head" key={year}>{year}Y</span>)}
      {rates.map(rate=><Fragment key={rate}>
        <span className="heatmap-row-label">{rate}%</span>
        {horizons.map(year=>{
          const result=calculateSip(monthly,rate,year);
          const growth=result.investedAmount?result.growth/result.investedAmount*100:0;
          const chosen=selected.rate===rate&&selected.years===year;
          return <button key={year} type="button" className="heatmap-cell" style={{...cellStyle(rate,growth),outline:chosen?"2px solid #c5b5ff":"none",outlineOffset:chosen?1:0}} onClick={()=>setSelected({rate,years:year})} onFocus={()=>setSelected({rate,years:year})} aria-pressed={chosen} aria-label={"Assumed annual rate "+rate+" percent over "+year+" years: "+growth.toFixed(1)+" percent growth relative to contributions"}>
            {(growth>=0?"+":"")+growth.toFixed(0)}%<small>{formatInr(result.futureValue)}</small>
          </button>;
        })}
      </Fragment>)}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.04] p-3">
      <div><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Selected scenario</span><div className="mt-1 text-sm font-bold text-white">{selected.rate}% · {selected.years} years</div></div>
      <div className="text-right"><span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Illustrative value</span><div className="mt-1 font-['Space_Grotesk'] text-lg font-bold text-white">{formatInr(value.futureValue)}</div></div>
    </div>
    <p className="mt-3 text-[10px] leading-5 text-slate-400">Selected growth relative to contributions: {relative.toFixed(1)}%. Hypothetical scenarios using monthly end-of-month contributions of {formatInr(monthly)}. These are calculator outputs, not historical fund returns or forecasts.</p>
  </div>;
}


export type PerformanceMonth={year:number;month:number;returnPercent:number};
const MONTH_LABELS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function performanceCellStyle(value:number){
  const intensity=Math.min(.5,.14+Math.abs(value)*.035);
  if(value>0)return {background:"rgba(52,211,153,"+intensity+")",borderColor:"rgba(52,211,153,.24)",color:"#b5ffe5"};
  if(value<0)return {background:"rgba(251,113,133,"+intensity+")",borderColor:"rgba(251,113,133,.24)",color:"#ffc0cb"};
  return {background:"rgba(148,163,184,.13)",borderColor:"rgba(148,163,184,.2)",color:"#d8def7"};
}

/**
 * Historical performance density map.
 * The dashboard intentionally renders an unavailable state until verified,
 * dated monthly-return records are supplied by a trusted source.
 */
export function PerformanceHeatmap({data=[]}:{data?:PerformanceMonth[]}){
  const validData=data.filter(item=>
    Number.isInteger(item.year)&&Number.isInteger(item.month)&&item.month>=1&&item.month<=12&&Number.isFinite(item.returnPercent)
  );
  const years=[...new Set(validData.map(item=>item.year))].sort((a,b)=>a-b);
  const lookup=new Map(validData.map(item=>[item.year*100+item.month,item.returnPercent]));
  const [selected,setSelected]=useState<PerformanceMonth|null>(null);

  if(validData.length===0){
    return <div className="performance-empty" role="status" aria-label="Historical performance data is not connected">
      <div className="performance-months" aria-hidden="true">
        {MONTH_LABELS.map(month=><span key={month}>{month}</span>)}
      </div>
      <div className="performance-empty-cells" aria-hidden="true">
        {MONTH_LABELS.map(month=><span key={month}>—</span>)}
      </div>
      <div className="performance-empty-message">
        <Database size={18}/>
        <div><strong>Historical return data is not connected</strong><p>Monthly fund returns will appear here when a verified, dated performance source is integrated.</p></div>
      </div>
    </div>;
  }

  return <div className="performance-heatmap" aria-label="Historical monthly fund returns">
    <div className="performance-months" aria-hidden="true">
      <span>YEAR</span>{MONTH_LABELS.map(month=><span key={month}>{month}</span>)}
    </div>
    {years.map(year=><div className="performance-row" key={year}>
      <span className="performance-year">{year}</span>
      {MONTH_LABELS.map((month,index)=>{
        const monthNumber=index+1;
        const value=lookup.get(year*100+monthNumber);
        const chosen=selected?.year===year&&selected.month===monthNumber;
        return value===undefined
          ? <span key={month} className="performance-cell is-missing" aria-label={month+" "+year+": no data"}>—</span>
          : <button key={month} type="button" className="performance-cell" style={performanceCellStyle(value)} aria-label={month+" "+year+": "+value.toFixed(2)+" percent"} aria-pressed={chosen} title={month+" "+year+": "+value.toFixed(2)+"%"} onClick={()=>setSelected({year,month:monthNumber,returnPercent:value})}>{value>0?"+":""}{value.toFixed(1)}%</button>;
      })}
    </div>)}
    <div className="performance-legend"><span><i className="legend-dot" style={{background:"#39d9a1"}}/>Positive month</span><span><i className="legend-dot" style={{background:"#fb7185"}}/>Negative month</span><span><i className="legend-dot" style={{background:"#64748b"}}/>No record</span></div>
    <p className="performance-source" aria-live="polite">{selected?MONTH_LABELS[selected.month-1]+" "+selected.year+": "+selected.returnPercent.toFixed(2)+"%": "Select a month to inspect its return."} Historical values require a source and reporting date.</p>
  </div>;
}
