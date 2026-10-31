import {render,screen} from "@testing-library/react";
import FundDetail from "../app/funds/[scheme_code]/page";

jest.mock("next/link",()=>({
  __esModule:true,
  default:({href,children,...props}:{href:string;children:React.ReactNode;[key:string]:unknown})=><a href={href} {...props}>{children}</a>
}));
jest.mock("next/navigation",()=>({
  notFound:()=>{throw new Error("NEXT_NOT_FOUND");}
}));

const response={
  data:{
    scheme_code:100201,isin_growth:"INF000000201",scheme_name:"Acme Large Cap Fund",
    nav:"1234.5678",nav_date:"2026-10-30",plan:"direct",option:"growth",
    category:"Equity",subcategory:"Large Cap Fund",amc_name:"Acme Mutual Fund"
  },
  metadata:{source:"AMFI"}
};

describe("scheme detail screen",()=>{
  beforeEach(()=>{global.fetch=jest.fn().mockResolvedValue({status:200,ok:true,json:async()=>response}) as jest.Mock;});

  test("renders scheme identity, NAV, date, source and missing-data disclosures",async()=>{
    const page=await FundDetail({params:Promise.resolve({scheme_code:"100201"})});
    render(page);
    expect(screen.getByRole("heading",{level:1,name:"Acme Large Cap Fund"})).toBeInTheDocument();
    expect(screen.getByText("₹1,234.5678")).toBeInTheDocument();
    expect(screen.getByText("2026-10-30")).toBeInTheDocument();
    expect(screen.getByText("Acme Mutual Fund")).toBeInTheDocument();
    expect(screen.getByText(/Expense ratio, AUM, benchmark, Riskometer/i)).toBeInTheDocument();
    expect(screen.getByRole("link",{name:/Add to comparison/i})).toHaveAttribute("href","/compare?scheme=100201");
  });

  test("invalid scheme codes do not make an API request and return not-found",async()=>{
    await expect(FundDetail({params:Promise.resolve({scheme_code:"bad-code"})})).rejects.toThrow("NEXT_NOT_FOUND");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("missing scheme returned by API becomes not-found",async()=>{
    (global.fetch as jest.Mock).mockResolvedValueOnce({status:404,ok:false});
    await expect(FundDetail({params:Promise.resolve({scheme_code:"999999"})})).rejects.toThrow("NEXT_NOT_FOUND");
  });

  test("upstream failure becomes not-found instead of leaking an exception",async()=>{
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API unavailable"));
    await expect(FundDetail({params:Promise.resolve({scheme_code:"100201"})})).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
