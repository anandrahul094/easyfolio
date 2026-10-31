"use client";
import {useState} from "react";
import Link from "next/link";
import {PageIntro,Note} from "../ui";

const qs=[
  {q:"What would you like to understand first?",opts:["How mutual funds work","How to understand risk","How categories differ","How to read scheme information"]},
  {q:"Which time-horizon concept would you like to understand?",opts:["Short-term goals","Medium-term goals","Long-term goals","I am not sure yet"]},
  {q:"Which risk topic would you like to learn about?",opts:["Why fund values fluctuate","How interest rates affect debt schemes","How issuer credit quality matters","I am not sure yet"]},
  {q:"How familiar are you with mutual funds?",opts:["I'm completely new","I know the basics","I have some experience"]}
];

export default function Discover(){
  const[answers,setAnswers]=useState<string[]>([]);
  const[step,setStep]=useState(0);
  const done=step===qs.length;
  const choose=(value:string)=>{const next=[...answers];next[step]=value;setAnswers(next);};
  return <main className="page-shell">
    <PageIntro eyebrow="YOUR LEARNING STARTING POINT" title="What would you like to understand first?" description="Answer a few educational questions. EasyFolio will suggest topics and explainers — not recommend a scheme or assess investment suitability."/>
    <section className="content-card" style={{maxWidth:820}}>
      {!done?<>
        <span className="micro-label">QUESTION {step+1} OF {qs.length}</span>
        <div className="progress-track" role="progressbar" aria-label="Question progress" aria-valuemin={0} aria-valuemax={qs.length} aria-valuenow={step+1}>
          <div className="progress-fill" style={{width:(step+1)/qs.length*100+"%"}}/>
        </div>
        <h2 className="content-title" style={{fontSize:29,marginTop:18}}>{qs[step].q}</h2>
        <div className="wizard-options">{qs[step].opts.map(option=><button key={option} type="button" className="wizard-option" aria-pressed={answers[step]===option} onClick={()=>choose(option)}>{option}</button>)}</div>
        <div className="wizard-actions">
          <button className="button-secondary" type="button" disabled={step===0} onClick={()=>setStep(value=>value-1)}>← Back</button>
          <button className="button-primary" type="button" disabled={!answers[step]} onClick={()=>setStep(value=>value+1)}>{step===qs.length-1?"See my learning route":"Continue →"}</button>
        </div>
      </>:<>
        <span className="eyebrow">YOUR LEARNING ROUTE</span>
        <h2 className="content-title" style={{fontSize:30}}>A useful place to continue.</h2>
        <p className="muted-copy">Your choices are saved only in this page session and are used to organise educational topics, not to assess financial suitability.</p>
        <div className="content-card" style={{marginTop:18}}>
          <h3>Your learning preferences</h3>
          <ul className="list-clean">{qs.map((question,index)=><li key={question.q}><strong>{question.q}</strong>: {answers[index]} <button className="button-text" type="button" onClick={()=>setStep(index)}>Change</button></li>)}</ul>
        </div>
        <ul className="list-clean">
          <li>Start with the mutual fund fundamentals and NAV lesson.</li>
          <li>Read the lesson related to your selected time-horizon and risk topics.</li>
          <li>Explore category definitions and scheme documents before comparing schemes.</li>
        </ul>
        <div className="hero-actions">
          <Link className="button-primary" href="/learn">Start learning</Link>
          <Link className="button-secondary" href="/categories">Explore categories</Link>
          <button className="button-text" type="button" onClick={()=>{setStep(0);setAnswers([])}}>Start again</button>
        </div>
      </>}
    </section>
    <div style={{marginTop:22,maxWidth:820}}><Note title="A learning route, not a recommendation"><p>Your answers help prioritise educational topics. They do not identify the “right” fund, predict returns or determine whether an investment is suitable for you.</p></Note></div>
  </main>;
}
