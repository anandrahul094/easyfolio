/**
 * Market-data policy boundary for Easyfolio.
 *
 * Easyfolio is an investor-education product. SEBI circular
 * HO/47/17/12(11)2025-MRD-POD3/I/11107/2026 requires a 30-day lag
 * for sharing and usage of market-price data for educational purposes.
 * Provider agreements and any other applicable rules still apply.
 *
 * Never put provider credentials in NEXT_PUBLIC_* variables.
 */

export const EDUCATION_MARKET_DATA_LAG_DAYS = 30;

export type MarketAssetId =
  | "nifty-50"
  | "sensex"
  | "bank-nifty"
  | "gold"
  | "silver"
  | "usd-inr";

export type MarketObservation = {
  assetId: MarketAssetId;
  value: number;
  currency: "INR";
  unit: "index-points" | "INR-per-10g" | "INR-per-kg" | "INR-per-USD";
  observedAt: string;
  publishedAt: string;
  sourceName: string;
  sourceUrl: string;
  licenceId: string;
};

export type MarketProvider = {
  id: string;
  name: string;
  getLatest(assetIds: MarketAssetId[]): Promise<MarketObservation[]>;
};

export function isEligibleEducationalObservation(
  observation: MarketObservation,
  now = new Date(),
): boolean {
  const observed = Date.parse(observation.observedAt);
  const published = Date.parse(observation.publishedAt);
  if (!Number.isFinite(observed) || !Number.isFinite(published)) return false;
  if (!observation.sourceName || !observation.sourceUrl || !observation.licenceId) return false;
  const lagMs = EDUCATION_MARKET_DATA_LAG_DAYS * 24 * 60 * 60 * 1000;
  return observed <= now.getTime() - lagMs && published <= now.getTime() - lagMs;
}

export function filterEligibleEducationalObservations(
  observations: MarketObservation[],
  now = new Date(),
): MarketObservation[] {
  return observations.filter((item) => isEligibleEducationalObservation(item, now));
}
