import type {Metadata} from "next";
import MarketDashboard from "./market-dashboard";

export const metadata:Metadata={
  title:"Market learning dashboard",
  description:"Explore Indian market benchmarks and precious metals through a source-transparent educational dashboard."
};

export default function MarketPage(){return <MarketDashboard/>;}
