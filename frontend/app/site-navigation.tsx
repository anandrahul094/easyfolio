"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {BookOpen,Calculator,Compass,Home,Layers} from "lucide-react";

const links=[
  ["/learn","Learn"],["/basics","Foundations"],["/categories","Categories"],
  ["/funds","Explore"],["/compare","Compare"],["/calculators/sip","Calculators"],["/glossary","Glossary"]
] as const;
function isActive(pathname:string,href:string){
  if(href==="/")return pathname==="/";
  if(href==="/calculators/sip")return pathname.startsWith("/calculators");
  return pathname===href||pathname.startsWith(href+"/");
}
export function SiteHeader(){
  const pathname=usePathname();
  return <header className="site-header"><div className="nav-wrap">
    <Link href="/" className="brand" aria-label="EasyFolio home"><span className="brand-mark">e</span><span>easyfolio</span><span className="text-violet-300">.</span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{links.map(([href,label])=><Link key={href} href={href} aria-current={isActive(pathname,href)?"page":undefined}>{label}</Link>)}</nav>
    <Link href="/discover" className="nav-cta"><Compass size={14}/> Discover</Link>
  </div></header>;
}
export function MobileBottomNav(){
  const pathname=usePathname();
  const quick=[["/","Home",Home],["/learn","Learn",BookOpen],["/funds","Explore",Layers],["/calculators/sip","Tools",Calculator]] as const;
  return <nav className="mobile-bottom-nav" aria-label="Quick navigation">{quick.map(([href,label,Icon])=><Link key={href} href={href} aria-current={isActive(pathname,href)?"page":undefined}><span><Icon size={17}/></span>{label}</Link>)}</nav>;
}
