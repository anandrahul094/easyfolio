import {render,screen,waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Compare from "../app/compare/page";

jest.mock("next/link",()=>({
  __esModule:true,
  default:({href,children,...props}:{href:string;children:React.ReactNode;[key:string]:unknown})=><a href={href} {...props}>{children}</a>
}));

const schemes=[
  {scheme_code:1,scheme_name:"Alpha Equity Fund",nav:"25.1234",nav_date:"2026-10-30",isin_growth:"INF000000001",category:"Equity",subcategory:"Large Cap Fund",amc_name:"Alpha AMC"},
  {scheme_code:2,scheme_name:"Beta Debt Fund",nav:"10.5000",nav_date:"2026-10-30",isin_growth:"INF000000002",category:"Debt",subcategory:"Liquid Fund",amc_name:"Beta AMC"},
  {scheme_code:3,scheme_name:"Gamma Hybrid Fund",nav:"15.0000",nav_date:"2026-10-30",isin_growth:"INF000000003",category:"Hybrid",subcategory:"Aggressive Hybrid Fund",amc_name:"Gamma AMC"},
  {scheme_code:4,scheme_name:"Delta Index Fund",nav:"18.2500",nav_date:"2026-10-30",isin_growth:"INF000000004",category:"Equity",subcategory:"Index Fund",amc_name:"Delta AMC"}
];

describe("scheme comparison interactions",()=>{
  beforeEach(()=>{
    global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({data:schemes})}) as jest.Mock;
  });

  async function addScheme(user:ReturnType<typeof userEvent.setup>,name:string){
    const input=screen.getByPlaceholderText("Search scheme name or code");
    await user.clear(input);
    await user.type(input,"fund");
    const addButton=await screen.findByRole("button",{name:new RegExp("Add "+name)});
    await user.click(addButton);
  }

  test("selection cards update the comparison checklist and removal updates rows",async()=>{
    const user=userEvent.setup();
    render(<Compare/>);
    await addScheme(user,"Alpha Equity Fund");
    await addScheme(user,"Beta Debt Fund");

    expect(screen.getByText("Alpha Equity Fund")).toBeInTheDocument();
    expect(screen.getByText("Beta Debt Fund")).toBeInTheDocument();
    expect(screen.getByText("Alpha AMC")).toBeInTheDocument();
    expect(screen.getByText("Beta AMC")).toBeInTheDocument();
    expect(screen.getByText("INF000000001")).toBeInTheDocument();
    expect(screen.getByText("INF000000002")).toBeInTheDocument();

    await user.click(screen.getByRole("button",{name:"Remove Alpha Equity Fund"}));
    await waitFor(()=>expect(screen.queryByText("Alpha AMC")).not.toBeInTheDocument());
    expect(screen.getByText("Beta AMC")).toBeInTheDocument();
  });

  test("prevents duplicate selection and caps the comparison at three schemes",async()=>{
    const user=userEvent.setup();
    render(<Compare/>);
    await addScheme(user,"Alpha Equity Fund");
    await addScheme(user,"Beta Debt Fund");
    await addScheme(user,"Gamma Hybrid Fund");

    const input=screen.getByPlaceholderText("Search scheme name or code");
    await user.type(input,"fund");
    const alpha=await screen.findByRole("button",{name:/Add Alpha Equity Fund/});
    const delta=screen.getByRole("button",{name:/Add Delta Index Fund/});
    expect(alpha).toBeDisabled();
    expect(delta).toBeDisabled();
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });
});
