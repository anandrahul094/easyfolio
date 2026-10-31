import type {Metadata} from "next";
import Link from "next/link";
import "./globals.css";
import {MobileBottomNav,SiteHeader} from "./site-navigation";

export const metadata:Metadata={
  title:{default:"EasyFolio — Understand money, visually",template:"%s | EasyFolio"},
  description:"Explore mutual fund concepts through interactive projections, visual learning paths and source-led scheme information.",
  metadataBase:new URL("https://easyfolio-beta.vercel.app")
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <SiteHeader/><div id="main-content">{children}</div><MobileBottomNav/>
    <footer className="site-footer"><div className="footer-inner">
      <div><Link href="/" className="footer-brand">easyfolio.</Link><p style={{marginTop:8}}>Learn the numbers. Understand the story.</p></div>
      <nav className="footer-links" aria-label="Footer navigation"><Link href="/learn">Learning</Link><Link href="/basics">Foundations</Link><Link href="/categories">Categories</Link><Link href="/funds">Explore funds</Link><Link href="/compare">Compare</Link><Link href="/calculators/sip">Calculators</Link><Link href="/glossary">Glossary</Link><Link href="/resources">Resources</Link><Link href="/about">About</Link></nav>
      <p className="disclaimer">EasyFolio is an educational and research tool, not investment advice. Mutual fund investments are subject to market risks. Projection charts and allocation examples are illustrations, not forecasts or actual scheme holdings. Scheme NAV facts are shown with their source and date. Verify scheme information with the relevant AMC before making an investment decision.</p>
    </div></footer>
  </body></html>;
}
