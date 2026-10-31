import {calculateCompound,calculateSip,formatInr} from "../app/lib/finance";

describe("formatInr",()=>{
  test("formats INR using Indian digit grouping and whole-rupee rounding",()=>{
    expect(formatInr(1234.49)).toBe("₹1,234");
    expect(formatInr(1234.5)).toBe("₹1,235");
    expect(formatInr(12345678)).toBe("₹1,23,45,678");
    expect(formatInr(-1234.5)).toBe("-₹1,235");
    expect(formatInr(0)).toBe("₹0");
  });
  test("rejects non-finite amounts instead of rendering misleading currency",()=>{
    expect(()=>formatInr(Number.NaN)).toThrow(RangeError);
    expect(()=>formatInr(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("calculateSip",()=>{
  test("uses end-of-month instalments and monthly compounding",()=>{
    const result=calculateSip(100,12,1);
    expect(result.investedAmount).toBe(1200);
    expect(result.futureValue).toBeCloseTo(1268.25,2);
    expect(result.growth).toBeCloseTo(68.25,2);
  });
  test("zero return equals total contributions exactly",()=>{
    const result=calculateSip(5000,0,10);
    expect(result.futureValue).toBe(600000);
    expect(result.growth).toBe(0);
  });
  test("supports negative assumptions without producing non-finite values",()=>{
    const result=calculateSip(5000,-10,10);
    expect(result.futureValue).toBeLessThan(result.investedAmount);
    expect(Number.isFinite(result.futureValue)).toBe(true);
    expect(result.investedSharePercent).toBe(100);
  });
  test("rejects invalid inputs",()=>{
    expect(()=>calculateSip(-1,10,10)).toThrow(RangeError);
    expect(()=>calculateSip(100,-1200,10)).toThrow(RangeError);
    expect(()=>calculateSip(100,10,0)).toThrow(RangeError);
  });
});

describe("calculateCompound",()=>{
  test("calculates annual compounding precisely",()=>{
    const result=calculateCompound(1000,12,2,1);
    expect(result.futureValue).toBeCloseTo(1254.4,8);
    expect(result.growth).toBeCloseTo(254.4,8);
  });
  test("supports monthly compounding and a negative assumption",()=>{
    const result=calculateCompound(1000,-12,1,12);
    expect(result.futureValue).toBeLessThan(1000);
    expect(result.investedSharePercent).toBe(100);
  });
  test("rejects invalid amount, duration, frequency and rates",()=>{
    expect(()=>calculateCompound(-100,10,1,12)).toThrow(RangeError);
    expect(()=>calculateCompound(100,10,0,12)).toThrow(RangeError);
    expect(()=>calculateCompound(100,10,1,0)).toThrow(RangeError);
    expect(()=>calculateCompound(100,-1200,1,1)).toThrow(RangeError);
  });
});
