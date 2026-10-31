import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import Funds from "../app/funds/page";

jest.mock("next/link",()=>({
  __esModule:true,
  default:({href,children,...props}:{href:string;children:React.ReactNode;[key:string]:unknown})=><a href={href} {...props}>{children}</a>
}));

const apiResult={
  data:[
    {scheme_code:1001,isin_growth:"INF000001001",scheme_name:"Alpha Large Cap Fund",nav:"25.1234",nav_date:"2026-10-30",category:"Equity",subcategory:"Large Cap Fund"},
    {scheme_code:1002,isin_growth:"INF000001002",scheme_name:"Beta Liquid Fund",nav:"10.5000",nav_date:"2026-10-30",category:"Debt",subcategory:"Liquid Fund"}
  ],
  page:1,limit:24,total:2,
  metadata:{source:"AMFI",latest_nav_date:"2026-10-30",future_nav_record_count:0,fetched_at:"2026-10-31T10:00:00Z"}
};

describe("fund explorer screen",()=>{
  beforeEach(()=>{
    global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>apiResult}) as jest.Mock;
  });

  test("loads AMFI scheme cards with source date and detail links",async()=>{
    render(<Funds/>);
    expect(screen.getByRole("heading",{level:1,name:"Research funds, one detail at a time."})).toBeInTheDocument();
    expect(await screen.findByRole("heading",{name:"Alpha Large Cap Fund"})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"Beta Liquid Fund"})).toBeInTheDocument();
    expect(screen.getByText(/Source: AMFI.*Latest NAV date in feed: 2026-10-30/)).toBeInTheDocument();
    expect(screen.getByRole("link",{name:/View scheme details/i})).toHaveAttribute("href","/funds/1001");
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/v1/schemes?page=1&limit=24"),expect.objectContaining({signal:expect.any(Object)}));
  });

  test("category filter sends the selected category to the API and clear resets it",async()=>{
    render(<Funds/>);
    await screen.findByRole("heading",{name:"Alpha Large Cap Fund"});
    fireEvent.change(screen.getByRole("combobox",{name:"Filter schemes by category"}),{target:{value:"Equity"}});
    await waitFor(()=>expect(global.fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("category=Equity"),
      expect.objectContaining({signal:expect.any(Object)})
    ));
    fireEvent.click(screen.getByRole("button",{name:"Clear search and filters"}));
    await waitFor(()=>expect(global.fetch).toHaveBeenLastCalledWith(
      expect.stringContaining("/api/v1/schemes?page=1&limit=24"),
      expect.objectContaining({signal:expect.any(Object)})
    ));
  });

  test("renders API errors as an alert without showing false empty results",async()=>{
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network unavailable"));
    render(<Funds/>);
    expect(await screen.findByRole("alert")).toHaveTextContent("network unavailable");
    expect(screen.queryByText("No matching schemes found.")).not.toBeInTheDocument();
  });

  test("renders explicit empty state when the API returns no matching records",async()=>{
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok:true,
      json:async()=>({...apiResult,data:[],total:0})
    });
    render(<Funds/>);
    expect(await screen.findByText(/No matching schemes found/i)).toBeInTheDocument();
  });
});
