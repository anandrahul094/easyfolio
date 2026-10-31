"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {PageIntro,Note,Pill} from "../ui";
import {SchemePicker,type ComparableFund} from "./scheme-picker";

const API=process.env.NEXT_PUBLIC_API_BASE_URL??"http://localhost:8000";

export default function Compare(){
  const [query,setQuery]=useState("");
  const [results,setResults]=useState<ComparableFund[]>([]);
  const [selected,setSelected]=useState<ComparableFund[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    const id=new URLSearchParams(window.location.search).get("scheme");
    if(!id) return;
    const controller=new AbortController();
    fetch(API+"/api/v1/schemes/"+encodeURIComponent(id),{signal:controller.signal})
      .then(response=>response.ok?response.json():null)
      .then(value=>{if(value?.data)setSelected([value.data]);})
      .catch(()=>{});
    return ()=>controller.abort();
  },[]);

  useEffect(()=>{
    if(query.trim().length<2){setResults([]);return;}
    const controller=new AbortController();
    const timer=setTimeout(async()=>{
      setBusy(true);
      setError("");
      try{
        const response=await fetch(API+"/api/v1/schemes?q="+encodeURIComponent(query.trim())+"&limit=20",{signal:controller.signal});
        if(!response.ok) throw new Error("Search unavailable");
        const body=await response.json();
        setResults(body.data??[]);
      }catch(caught){
        if(!controller.signal.aborted) setError(caught instanceof Error?caught.message:"Unable to search.");
      }finally{
        if(!controller.signal.aborted) setBusy(false);
      }
    },250);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[query]);

  const add=(fund:ComparableFund)=>{
    setSelected(current=>{
      if(current.length>=3||current.some(item=>item.scheme_code===fund.scheme_code)) return current;
      return [...current,fund];
    });
    setQuery("");
    setResults([]);
  };
  const remove=(schemeCode:number)=>setSelected(current=>current.filter(fund=>fund.scheme_code!==schemeCode));

  const metrics:[string,(fund:ComparableFund)=>string][]=[
    ["Scheme name",fund=>fund.scheme_name],
    ["AMC",fund=>fund.amc_name??"Not supplied"],
    ["Category",fund=>fund.category??"Unclassified"],
    ["Subcategory",fund=>fund.subcategory??"Not supplied"],
    ["Plan / option",fund=>(fund.plan??"Direct")+" · "+(fund.option??"Growth")],
    ["Latest NAV",fund=>"₹"+Number(fund.nav).toLocaleString("en-IN",{maximumFractionDigits:4})],
    ["NAV date",fund=>fund.nav_date],
    ["Scheme code",fund=>String(fund.scheme_code)],
    ["ISIN Growth",fund=>fund.isin_growth]
  ];

  return <main className="page-shell">
    <PageIntro eyebrow="SIDE-BY-SIDE RESEARCH" title="Compare with context, not rankings."
      description="Compare scheme facts that are available and comparable. This view explains differences; it does not declare a universal winner."/>
    <SchemePicker query={query} selected={selected} results={results} busy={busy} error={error}
      onQueryChange={setQuery} onAdd={add} onRemove={remove}/>
    {selected.length>0&&<>
      <div className="results-head"><h2>Available scheme information</h2><Pill>{selected.length} selected</Pill></div>
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead><tr><th>INFORMATION</th>{selected.map(fund=><th key={fund.scheme_code}>{fund.scheme_name}</th>)}</tr></thead>
          <tbody>{metrics.map(([label,get])=><tr key={label}><td>{label}</td>{selected.map(fund=><td key={fund.scheme_code}>{get(fund)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </>}
    <div style={{marginTop:24}}><Note title="Metrics not yet in the data source">
      <p>Expense ratio, AUM, benchmark, Riskometer, portfolio holdings and historical returns are not supplied by the current AMFI NAV API. They should remain unavailable until separately verified, dated sources are integrated.</p>
    </Note></div>
    <p className="small-muted" style={{marginTop:18}}>Need to browse first? <Link className="text-link" href="/funds">Open the fund explorer →</Link></p>
  </main>;
}
