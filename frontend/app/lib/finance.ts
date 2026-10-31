export type Projection = {
  investedAmount: number;
  futureValue: number;
  growth: number;
  investedSharePercent: number;
};

function assertFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number`);
  }
}

function composition(investedAmount: number, futureValue: number): number {
  if (investedAmount <= 0) return 0;
  if (futureValue <= 0) return 100;
  return Math.min(100, (investedAmount / Math.max(investedAmount, futureValue)) * 100);
}

/** Format as whole INR with Indian digit grouping and symmetric half-up rounding. */
export function formatInr(amount: number): string {
  assertFinite("amount", amount);
  const rounded = Math.round(Math.abs(amount));
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded);
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Future value of end-of-month SIP instalments with monthly compounding.
 * The annual nominal rate is divided by 12; no beginning-of-period uplift is applied.
 */
export function calculateSip(
  monthlyAmount: number,
  annualRatePercent: number,
  years: number,
): Projection {
  assertFinite("monthlyAmount", monthlyAmount);
  assertFinite("annualRatePercent", annualRatePercent);
  assertFinite("years", years);
  if (monthlyAmount < 0 || years <= 0 || annualRatePercent <= -1200) {
    throw new RangeError("SIP inputs are outside the supported calculation range");
  }

  const months = Math.round(years * 12);
  const monthlyRate = annualRatePercent / 1200;
  const investedAmount = monthlyAmount * months;
  const futureValue =
    monthlyRate === 0
      ? investedAmount
      : monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  const growth = futureValue - investedAmount;

  return {
    investedAmount,
    futureValue,
    growth,
    investedSharePercent: composition(investedAmount, futureValue),
  };
}

/** Future value of a lump sum with a nominal annual rate and periodic compounding. */
export function calculateCompound(
  principal: number,
  annualRatePercent: number,
  years: number,
  frequency: number,
): Projection {
  assertFinite("principal", principal);
  assertFinite("annualRatePercent", annualRatePercent);
  assertFinite("years", years);
  assertFinite("frequency", frequency);
  if (
    principal < 0 ||
    years <= 0 ||
    !Number.isInteger(frequency) ||
    frequency <= 0 ||
    annualRatePercent <= -100 * frequency
  ) {
    throw new RangeError("Compounding inputs are outside the supported calculation range");
  }

  const periods = frequency * years;
  const investedAmount = principal;
  const futureValue = principal * Math.pow(1 + annualRatePercent / 100 / frequency, periods);
  const growth = futureValue - investedAmount;

  return {
    investedAmount,
    futureValue,
    growth,
    investedSharePercent: composition(investedAmount, futureValue),
  };
}
