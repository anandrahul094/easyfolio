"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

const links=[
  ["/learn","Learn"],["/basics","Investing basics"],["/categories","Categories"],
  ["/funds","Explore funds"],["/compare","Compare"],["/calculators/sip","Calculators"],["/glossary","Glossary"]
] as const;

function isActive(pathname:string,href:string){
  if(href==="/") return pathname==="/";
  if(href==="/calculators/sip") return pathname.startsWith("/calculators");
  return pathname===href || pathname.startsWith(href+"/");
}

export function SiteHeader(){
  const pathname=usePathname();
  return <header className="site-header"><div className="nav-wrap">
    <Link href="/" className="brand" aria-label="EasyFolio home"><span className="brand-mark" aria-hidden="true">e</span>easyfolio<span style={{color:"#c99a4b"}} aria-hidden="true">.</span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">
      {links.map(([href,label])=><Link key={href} href={href} aria-current={isActive(pathname,href)?"page":undefined}>{label}</Link>)}
    </nav>
    <Link href="/discover" className="nav-cta">Find your starting point <span aria-hidden="true">↗</span></Link>
  </div></header>;
}

export function MobileBottomNav(){
  const pathname=usePathname();
  const quick=[["/","⌂","Home"],["/learn","▤","Learn"],["/funds","◫","Funds"],["/calculators/sip","⌁","Tools"]] as const;
  return <nav className="mobile-bottom-nav" aria-label="Quick navigation">
    {quick.map(([href,icon,label])=><Link key={href} href={href} aria-current={isActive(pathname,href)?"page":undefined}><span aria-hidden="true">{icon}</span>{label}</Link>)}
  </nav>;
}
