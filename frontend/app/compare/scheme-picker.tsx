"use client";

import type {ChangeEvent} from "react";

export type ComparableFund = {
  scheme_code:number;
  scheme_name:string;
  nav:string|number;
  nav_date:string;
  isin_growth:string;
  category:string|null;
  subcategory:string|null;
  plan?:string;
  option?:string;
  amc_name?:string|null;
};

type Props={
  query:string;
  selected:ComparableFund[];
  results:ComparableFund[];
  busy:boolean;
  error:string;
  onQueryChange:(value:string)=>void;
  onAdd:(fund:ComparableFund)=>void;
  onRemove:(schemeCode:number)=>void;
};

export function SchemePicker({
  query,selected,results,busy,error,onQueryChange,onAdd,onRemove
}:Props){
  const changeQuery=(event:ChangeEvent<HTMLInputElement>)=>onQueryChange(event.target.value);
  return <section className="content-card" aria-label="Scheme selection">
    <label htmlFor="compare-search" className="micro-label">ADD A DIRECT GROWTH SCHEME (UP TO 3)</label>
    <input id="compare-search" type="search" className="field" style={{marginTop:9}}
      value={query} onChange={changeQuery} placeholder="Search scheme name or code"/>
    {busy&&<p className="small-muted" role="status">Searching schemes…</p>}
    {error&&<p className="error-state" role="alert">{error}</p>}
    {results.length>0&&<div style={{display:"grid",gap:6,marginTop:8}} aria-label="Search results">
      {results.map(fund=>{
        const alreadySelected=selected.some(item=>item.scheme_code===fund.scheme_code);
        const full=selected.length>=3;
        return <button key={fund.scheme_code} type="button" className="wizard-option"
          aria-label={"Add "+fund.scheme_name}
          disabled={full||alreadySelected}
          onClick={()=>onAdd(fund)}>
          {fund.scheme_name} <span className="small-muted">· {fund.scheme_code}</span>
          {alreadySelected?" · Added":full?" · Maximum reached":""}
        </button>;
      })}
    </div>}
    <div className="compare-controls" aria-label="Selected schemes" style={{marginTop:18}}>
      {[0,1,2].map(index=>{
        const fund=selected[index];
        return <article className="content-card" key={index}
          aria-label={fund?"Scheme "+String.fromCharCode(65+index)+": "+fund.scheme_name:"Empty scheme slot "+String.fromCharCode(65+index)}>
          <span className="micro-label">SCHEME {String.fromCharCode(65+index)}</span>
          {fund?<>
            <p style={{fontSize:12,fontWeight:800,marginTop:12}}>{fund.scheme_name}</p>
            <button type="button" className="button-text"
              aria-label={"Remove "+fund.scheme_name}
              onClick={()=>onRemove(fund.scheme_code)}>Remove</button>
          </>:<p className="small-muted" style={{marginTop:12}}>Search above to add a scheme.</p>}
        </article>;
      })}
    </div>
  </section>;
}
