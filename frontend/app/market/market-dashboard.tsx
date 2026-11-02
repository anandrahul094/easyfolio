"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {Activity,ArrowUpRight,BookOpen,CalendarClock,ChartNoAxesCombined,Clock3,Database,Info,ShieldCheck} from "lucide-react";

type ApiState={status:string;mode:string;requiredLagDays:number;observations:unknown[];message:string};

const assets=[
  {id:"nifty-50",name:"NIFTY 50",kind:"Equity benchmark",description:"A broad snapshot of 50 large Indian listed companies.",unit:"Index points",colour:"violet",lesson:"/learn"},
  {id:"sensex",name:"SENSEX",kind:"Equity benchmark",description:"A long-running benchmark of large companies listed on BSE.",unit:"Index points",colour:"blue",lesson:"/learn"},
  {id:"bank-nifty",name:"BANK NIFTY",kind:"Sector benchmark",description:"Tracks the performance of a basket of major banking stocks.",unit:"Index points",colour:"cyan",lesson:"/learn"},
  {id:"gold",name:"GOLD",kind:"Precious metal",description:"Explore how gold prices can respond to rates, currency and demand.",unit:"INR / 10 grams",colour:"amber",lesson:"/basics"},
  {id:"silver",name:"SILVER",kind:"Precious metal",description:"A precious metal with both investment and industrial demand.",unit:"INR / kilogram",colour:"slate",lesson:"/basics"},
  {id:"usd-inr",name:"USD / INR",kind:"Currency reference",description:"Understand how many Indian rupees correspond to one US dollar.",unit:"INR per USD",colour:"emerald",lesson:"/basics"}
] as const;

const colourClasses:Record<string,string>={violet:"market-violet",blue:"market-blue",cyan:"market-cyan",amber:"market-amber",slate:"market-slate",emerald:"market-emerald"};

export default function MarketDashboard(){
  const [api,setApi]=useState<ApiState|null>(null);
  const [checkedAt,setCheckedAt]=useState<string>("");
  useEffect(()=>{
    let active=true;
    fetch("/api/market",{cache:"no-store"}).then(async response=>{
      const body=await response.json();
      if(active){setApi(body);setCheckedAt(new Date().toISOString());}
    }).catch(()=>{
      if(active)setApi({status:"unavailable",mode:"investor_education",requiredLagDays:30,observations:[],message:"Market data service is currently unavailable."});
    });
    return()=>{active=false;};
  },[]);

  return <main className="market-page">
    <section className="market-hero">
      <div className="market-hero-copy">
        <span className="eyebrow"><ChartNoAxesCombined size={13}/> MARKET LEARNING CENTRE</span>
        <h1>Understand the markets.<br/><span>Beyond the daily noise.</span></h1>
        <p>Explore the benchmarks, commodities and currency movements that shape the financial world. Built for learning, with transparent sources and clearly dated historical data.</p>
        <div className="market-hero-pills"><span><ShieldCheck size={14}/> Education-first</span><span><CalendarClock size={14}/> Historical data only</span><span><Database size={14}/> Source transparent</span></div>
      </div>
      <div className="market-policy-card">
        <div className="market-policy-icon"><ShieldCheck size={20}/></div>
        <span className="metric-label">DATA POLICY</span>
        <strong>30-day minimum lag</strong>
        <p>For market-price data used in investor education, Easyfolio will only display observations that meet the applicable 30-day lag and provider licensing requirements.</p>
        <a href="https://www.sebi.gov.in/legal/circulars/may-2026/norms-for-sharing-and-usage-of-price-data-for-educational-purposes_101293.html" target="_blank" rel="noreferrer">Read SEBI circular <ArrowUpRight size={13}/></a>
      </div>
    </section>

    <section className="market-section">
      <div className="market-section-heading"><div><span className="eyebrow">SIX MARKET LENSES</span><h2>Explore key indicators</h2><p>Each card explains what the indicator represents and what its data unit means.</p></div><span className="market-status"><i/> Provider connection pending</span></div>
      <div className="market-assets-grid">
        {assets.map(asset=><article className="market-asset-card" key={asset.id}>
          <div className="market-asset-top"><span className={"market-asset-symbol "+colourClasses[asset.colour]}>{asset.name==="USD / INR"?"FX":asset.name==="GOLD"?"Au":asset.name==="SILVER"?"Ag":"↗"}</span><span className="market-asset-kind">{asset.kind}</span></div>
          <h3>{asset.name}</h3>
          <p>{asset.description}</p>
          <div className="market-value-placeholder"><span>Historical data not connected</span><strong>—</strong><small>{asset.unit}</small></div>
          <div className="market-asset-footer"><span><Clock3 size={12}/> No verified observation</span><Link href={asset.lesson}>Learn the basics <ArrowUpRight size={12}/></Link></div>
        </article>)}
      </div>
    </section>

    <section className="market-lower-grid">
      <article className="market-panel">
        <div className="market-panel-title"><div className="market-panel-icon"><Activity size={17}/></div><div><h2>Historical market explorer</h2><p>Charts will use licensed, dated observations—not live or simulated quotes.</p></div></div>
        <div className="market-chart-empty"><div className="market-chart-grid"><span/><span/><span/><span/></div><div className="market-chart-empty-content"><ChartNoAxesCombined size={28}/><strong>Historical series awaiting approval</strong><p>Once a provider agreement is in place, this space will show 1M, 3M, 6M, 1Y and 5Y educational views using eligible historical data.</p></div></div>
        <div className="market-range-pills"><span>1M</span><span>3M</span><span>6M</span><span>1Y</span><span>5Y</span></div>
      </article>
      <article className="market-panel">
        <div className="market-panel-title"><div className="market-panel-icon"><Database size={17}/></div><div><h2>Data connection status</h2><p>We show the source and observation date when a dataset is available.</p></div></div>
        <div className="market-source-row"><span>Equity indices</span><strong>Awaiting licensed feed</strong></div>
        <div className="market-source-row"><span>Gold &amp; silver</span><strong>Awaiting licensed feed</strong></div>
        <div className="market-source-row"><span>USD / INR</span><strong>Awaiting reference-rate permission</strong></div>
        <div className="market-api-state"><i/><div><strong>{api?.status==="provider_not_configured"?"No provider configured":"Checking data service"}</strong><p>{api?.message??"Verifying market data connection…"}</p></div></div>
        {checkedAt&&<p className="market-checked-at">Connection checked: {new Date(checkedAt).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}</p>}
      </article>
    </section>

    <section className="market-education-note"><Info size={18}/><div><strong>Why are prices not shown yet?</strong><p>Easyfolio is an investor education platform, not a live trading terminal. The applicable SEBI framework requires a 30-day lag for market-price data shared and used for educational purposes. A separate written data agreement and public-display permission are also required from each relevant provider. We will not substitute scraped, unofficial or fabricated prices.</p></div></section>

    <section className="market-next-step"><div><span className="eyebrow"><BookOpen size={12}/> KEEP LEARNING</span><h2>Learn what moves the market.</h2><p>Build a foundation in risk, diversification, interest rates and the relationship between markets and mutual funds.</p></div><Link href="/learn" className="button-primary">Explore learning paths <ArrowUpRight size={15}/></Link></section>
    <p className="market-disclaimer">Educational information only. Not investment advice, a recommendation, or a solicitation to trade. Market data will be displayed only after source, licence, date and applicable-use checks.</p>
  </main>;
}
