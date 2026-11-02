"use client";

import Link from "next/link";
import {useMemo,useState} from "react";
import {Activity,ArrowUpRight,BookOpen,ChartNoAxesCombined,Compass,Globe2,Info,Lightbulb,Scale,ShieldCheck,TrendingUp,Wallet} from "lucide-react";

const assets=[
  {id:"nifty-50",name:"NIFTY 50",kind:"Broad-market benchmark",symbol:"N",colour:"violet",summary:"A benchmark designed to represent the performance of 50 large, liquid companies listed on NSE.",drivers:["Company earnings and valuations","Interest rates and inflation","Domestic and global investor flows"],learn:"Understand how a diversified basket can represent a broad market without representing every listed company.",question:"Why can an index rise even when some of its companies fall?",lesson:"/learn"},
  {id:"sensex",name:"SENSEX",kind:"Large-cap benchmark",symbol:"S",colour:"blue",summary:"A widely followed BSE benchmark that tracks a selected group of large, established companies.",drivers:["Constituent company performance","Sector weights and concentration","Economic and policy expectations"],learn:"Compare index composition, weighting and methodology before comparing headline performance.",question:"What makes two large-cap indices behave differently?",lesson:"/learn"},
  {id:"bank-nifty",name:"BANK NIFTY",kind:"Banking-sector benchmark",symbol:"B",colour:"cyan",summary:"A sector-focused benchmark representing major listed banking companies. It can behave differently from a broad-market index.",drivers:["Credit growth and asset quality","Net interest margins","RBI policy and liquidity"],learn:"Banking indices can be sensitive to interest rates, loan growth, deposit costs and bad-loan trends.",question:"Why might banks react differently to a rate change?",lesson:"/learn"},
  {id:"gold",name:"GOLD",kind:"Precious metal",symbol:"Au",colour:"amber",summary:"A globally traded precious metal often discussed as a store of value and portfolio diversifier.",drivers:["Global real interest rates","US dollar strength and currency moves","Central-bank demand and risk sentiment"],learn:"Gold does not generate company earnings or interest. Its role and risks differ from equity and fixed income.",question:"Why can gold move even when Indian demand is unchanged?",lesson:"/basics"},
  {id:"silver",name:"SILVER",kind:"Precious + industrial metal",symbol:"Ag",colour:"slate",summary:"Silver has both investment demand and substantial industrial uses, giving it a different demand profile from gold.",drivers:["Industrial activity and manufacturing","Investment demand and precious-metal sentiment","Mining supply and recycling"],learn:"Industrial demand can make silver respond to economic cycles as well as precious-metal market forces.",question:"Why can silver be more cyclical than gold?",lesson:"/basics"},
  {id:"usd-inr",name:"USD / INR",kind:"Currency relationship",symbol:"FX",colour:"emerald",summary:"The exchange rate expresses how many Indian rupees correspond to one US dollar.",drivers:["Inflation and interest-rate differentials","Trade and capital flows","Oil prices and global risk appetite"],learn:"A currency quote is a relationship between two currencies. A change can affect imports, exports and overseas investments.",question:"Who benefits and who pays more when the rupee weakens?",lesson:"/basics"}
] as const;

const scenarioLabels=["Broad equity index","Banking sector","Gold","Silver","USD / INR"] as const;
type ScenarioKey=typeof scenarioLabels[number];
const scenarioNotes:Record<ScenarioKey,string>={
  "Broad equity index":"A hypothetical index-level change. It does not predict returns for any particular fund or portfolio.",
  "Banking sector":"A hypothetical sector move. Actual banks can respond differently depending on margins, credit quality and valuations.",
  "Gold":"A hypothetical gold-price move. Local prices can also be affected by currency, taxes and local premiums.",
  "Silver":"A hypothetical silver-price move. Industrial demand and supply conditions can amplify movements.",
  "USD / INR":"A hypothetical change in the rupee value per US dollar. A higher quote means a weaker rupee."
};

export default function MarketDashboard(){
  const [selected,setSelected]=useState<ScenarioKey>("Broad equity index");
  const [change,setChange]=useState(5);
  const [base,setBase]=useState("100");
  const numericBase=Number(base);
  const scenarioValue=useMemo(()=>Number.isFinite(numericBase)?numericBase*(1+change/100):0,[numericBase,change]);

  return <main className="market-page">
    <section className="market-hero">
      <div className="market-hero-copy">
        <span className="eyebrow"><ChartNoAxesCombined size={13}/> MARKET LEARNING CENTRE</span>
        <h1>Understand the markets.<br/><span>Not just the numbers.</span></h1>
        <p>Explore the forces behind India's key market benchmarks, precious metals and currency movements. Learn what moves them, how they differ and where they fit into a diversified financial plan.</p>
        <div className="market-hero-pills"><span><ShieldCheck size={14}/> Education-first</span><span><BookOpen size={14}/> Learn the drivers</span><span><Compass size={14}/> Explore scenarios</span></div>
      </div>
      <div className="market-policy-card">
        <div className="market-policy-icon"><ShieldCheck size={20}/></div>
        <span className="metric-label">OUR DATA PRINCIPLE</span>
        <strong>Clarity before quotes</strong>
        <p>Easyfolio will not present scraped, simulated or unlicensed prices as market observations. Historical price data will be added only when its source, permitted use and display rights are verified.</p>
        <a href="https://www.sebi.gov.in/legal/circulars/may-2026/norms-for-sharing-and-usage-of-price-data-for-educational-purposes_101293.html" target="_blank" rel="noreferrer">Read SEBI's educational price-data circular <ArrowUpRight size={13}/></a>
      </div>
    </section>

    <section className="market-section">
      <div className="market-section-heading"><div><span className="eyebrow">SIX MARKET LENSES</span><h2>Explore what moves each market</h2><p>Start with the key drivers, then explore the questions that matter to long-term investors.</p></div><span className="market-status market-status-education"><i/> Learning guides available</span></div>
      <div className="market-assets-grid">
        {assets.map(asset=><article className="market-asset-card market-learning-card" key={asset.id}>
          <div className="market-asset-top"><span className={"market-asset-symbol "+({"violet":"market-violet","blue":"market-blue","cyan":"market-cyan","amber":"market-amber","slate":"market-slate","emerald":"market-emerald"} as Record<string,string>)[asset.colour]}>{asset.symbol}</span><span className="market-asset-kind">{asset.kind}</span></div>
          <h3>{asset.name}</h3>
          <p>{asset.summary}</p>
          <div className="market-driver-block"><strong>What moves it</strong><ul>{asset.drivers.map(driver=><li key={driver}>{driver}</li>)}</ul></div>
          <div className="market-question"><Lightbulb size={14}/><span>{asset.question}</span></div>
          <div className="market-asset-footer"><span><BookOpen size={12}/> Learning guide</span><Link href={asset.lesson}>Explore <ArrowUpRight size={12}/></Link></div>
        </article>)}
      </div>
    </section>

    <section className="market-lower-grid">
      <article className="market-panel market-scenario-panel">
        <div className="market-panel-title"><div className="market-panel-icon"><Activity size={17}/></div><div><h2>Hypothetical market scenario lab</h2><p>Change an illustrative starting value and see the arithmetic impact of a hypothetical move.</p></div></div>
        <div className="scenario-controls">
          <label className="scenario-field"><span>Market lens</span><select value={selected} onChange={event=>setSelected(event.target.value as ScenarioKey)}>{scenarioLabels.map(label=><option key={label}>{label}</option>)}</select></label>
          <label className="scenario-field"><span>Illustrative starting value</span><input type="number" min="0" step="any" value={base} onChange={event=>setBase(event.target.value)}/></label>
        </div>
        <div className="scenario-result">
          <div><span>Hypothetical change</span><strong className={change>0?"scenario-positive":change<0?"scenario-negative":""}>{change>0?"+":""}{change}%</strong></div>
          <div className="scenario-result-arrow"><ArrowUpRight size={18}/></div>
          <div><span>Illustrative result</span><strong>{Number.isFinite(scenarioValue)?scenarioValue.toLocaleString("en-IN",{maximumFractionDigits:2}):"—"}</strong></div>
        </div>
        <label className="scenario-slider-label"><span>Adjust scenario</span><span>{change>0?"+":""}{change}%</span></label>
        <input className="scenario-slider" type="range" min="-20" max="20" step="1" value={change} onChange={event=>setChange(Number(event.target.value))}/>
        <div className="scenario-slider-ends"><span>-20%</span><span>0%</span><span>+20%</span></div>
        <p className="scenario-explainer">{scenarioNotes[selected]}</p>
        <p className="scenario-disclaimer">Illustrative calculation only. The starting value is user-entered; no live, delayed or historical market quote is used.</p>
      </article>

      <article className="market-panel">
        <div className="market-panel-title"><div className="market-panel-icon"><Scale size={17}/></div><div><h2>Connect markets to your money</h2><p>Market movements matter differently depending on the asset and your time horizon.</p></div></div>
        <div className="market-insight-row"><TrendingUp size={17}/><div><strong>Risk is not the same as return</strong><p>Volatility describes how widely values move. It does not tell you whether an investment suits your goals.</p></div></div>
        <div className="market-insight-row"><Wallet size={17}/><div><strong>Asset roles are different</strong><p>Equity, debt, gold and cash can serve different purposes. Diversification does not remove risk.</p></div></div>
        <div className="market-insight-row"><Globe2 size={17}/><div><strong>Global forces reach local portfolios</strong><p>Rates, currencies, commodity prices and global sentiment can influence Indian investments.</p></div></div>
        <Link href="/learn" className="market-inline-link">Explore investor learning paths <ArrowUpRight size={13}/></Link>
      </article>
    </section>

    <section className="market-education-note"><Info size={18}/><div><strong>About market data on Easyfolio</strong><p>This page currently provides original educational explanations and user-controlled hypothetical calculations, not market quotes. Any future price series will be shown only after verifying the provider's licence, public-display permission, applicable regulatory requirements, source and observation date. A 30-day delay alone does not grant redistribution rights.</p></div></section>

    <section className="market-next-step"><div><span className="eyebrow"><BookOpen size={12}/> KEEP LEARNING</span><h2>Build the context behind every investment.</h2><p>Learn about risk, diversification, interest rates and how markets connect to mutual funds.</p></div><Link href="/learn" className="button-primary">Explore learning paths <ArrowUpRight size={15}/></Link></section>
    <p className="market-disclaimer">Educational information only. Not investment advice, a recommendation, or a solicitation to trade. Scenario results are hypothetical and are not forecasts.</p>
  </main>;
}
