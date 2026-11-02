import {NextResponse} from "next/server";
import {EDUCATION_MARKET_DATA_LAG_DAYS} from "../../lib/market-data";

/**
 * Deliberately fail closed until a provider contract, public-display licence,
 * and server-side credentials are configured. Do not proxy unlicensed quotes.
 */
export async function GET(){
  return NextResponse.json({
    status:"provider_not_configured",
    mode:"investor_education",
    requiredLagDays:EDUCATION_MARKET_DATA_LAG_DAYS,
    assets:["nifty-50","sensex","bank-nifty","gold","silver","usd-inr"],
    observations:[],
    message:"Historical observations will appear here after an approved provider and display licence are configured."
  },{status:503,headers:{"Cache-Control":"no-store"}});
}
