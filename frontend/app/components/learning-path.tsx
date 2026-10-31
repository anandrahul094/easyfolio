"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {ArrowUpRight,BookOpen,Check,RefreshCw,Sparkles} from "lucide-react";

type Lesson={title:string;description:string;time:string;href:string};
const KEY="easyfolio:learning-progress:v1";

export function LearningPath({lessons}:{lessons:Lesson[]}){
  const [completed,setCompleted]=useState<string[]>([]);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    try{
      const saved=JSON.parse(window.localStorage.getItem(KEY)??"[]");
      if(Array.isArray(saved))setCompleted(saved.filter((value):value is string=>typeof value==="string"&&lessons.some(lesson=>lesson.href===value)));
    }catch{setCompleted([]);}
    setReady(true);
  },[]);
  const activeIndex=useMemo(()=>lessons.findIndex(item=>!completed.includes(item.href)),[lessons,completed]);
  const progress=lessons.length?Math.round(completed.length/lessons.length*100):0;
  const toggle=(href:string)=>{
    const next=completed.includes(href)?completed.filter(item=>item!==href):[...completed,href];
    setCompleted(next);
    try{window.localStorage.setItem(KEY,JSON.stringify(next));}catch{/* Private browsing may block storage. */}
  };
  const reset=()=>{
    setCompleted([]);
    try{window.localStorage.removeItem(KEY);}catch{/* Storage is optional. */}
  };
  return <section className="bento-card mt-6" aria-labelledby="learning-path-title">
    <div className="bento-card-head">
      <div><span className="eyebrow"><Sparkles size={12}/> GAMIFIED LEARNING PATH</span><h2 id="learning-path-title" className="mt-2">Your path to clarity</h2><p>Mark lessons as complete as you go. Progress is saved only in this browser; no lesson is locked.</p></div>
      <div className="icon-chip"><BookOpen size={18}/></div>
    </div>
    <div className="mb-5 rounded-2xl border border-white/10 bg-white/[.035] p-4">
      <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Learning progress</span><strong className="font-['Space_Grotesk'] text-lg text-white">{completed.length} / {lessons.length}</strong></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 via-sky-300 to-emerald-300 transition-all duration-700" style={{width:progress+"%"}}/></div>
      <div className="mt-2 flex items-center justify-between text-[9px] text-slate-500"><span>{progress}% complete</span><span>{ready?"Saved on this device":"Loading progress…"}</span></div>
    </div>
    <div>
      {lessons.map((lesson,index)=>{
        const isComplete=completed.includes(lesson.href);
        const isActive=index===activeIndex;
        const isSuggestedNext=isActive;
        return <div key={lesson.href} className={"path-node "+(isComplete?"is-complete ":isActive?"is-active ":"")}>
          <span className="path-node-dot" aria-hidden="true">{isComplete?<Check size={17}/>:isSuggestedNext?<Sparkles size={15}/>:<span className="text-xs font-bold">{String(index+1).padStart(2,"0")}</span>}</span>
          <div className="min-w-0">
            <div className="path-node-title">{lesson.title}</div>
            <div className="path-node-desc">{lesson.description} · {lesson.time}</div>
            <Link href={lesson.href} className="path-node-action inline-flex items-center gap-1">Open lesson <ArrowUpRight size={12}/></Link>
          </div>
          <button type="button" className="rounded-full border border-white/10 px-3 py-2 text-[9px] font-bold text-slate-300 transition hover:border-emerald-300/30 hover:text-emerald-200" aria-pressed={isComplete} onClick={()=>toggle(lesson.href)}>{isComplete?"Completed":"Mark done"}</button>
        </div>;
      })}
    </div>
    <div className="mt-4 flex justify-end"><button type="button" className="button-text inline-flex items-center gap-2" onClick={reset}><RefreshCw size={12}/> Reset progress</button></div>
  </section>;
}
