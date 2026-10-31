import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {LearningPath} from "../app/components/learning-path";
import {AllocationRing,ProjectionCurve,ProjectionHeatmap,buildProjectionSeries} from "../app/components/visuals";

jest.mock("recharts",()=>{
  const React=require("react");
  const Container=({children}: {children?:React.ReactNode})=>React.createElement("div",null,children);
  const Empty=()=>null;
  return {
    ResponsiveContainer:Container,
    AreaChart:Container,
    PieChart:Container,
    Pie:Container,
    CartesianGrid:Empty,
    Cell:Empty,
    Area:Empty,
    Tooltip:Empty,
    XAxis:Empty,
    YAxis:Empty,
    Legend:Empty
  };
});

const lessons=[
  {title:"First lesson",description:"Start with the basics.",time:"5 min",href:"/learn/first"},
  {title:"Second lesson",description:"Understand the next idea.",time:"6 min",href:"/learn/second"}
];

describe("visual dashboard components",()=>{
  beforeEach(()=>window.localStorage.clear());

  test("builds a contribution and projection series with the starting point",()=>{
    const series=buildProjectionSeries(1000,10,3);
    expect(series).toHaveLength(4);
    expect(series[0]).toEqual({year:0,invested:0,projected:0,growth:0});
    expect(series[3].invested).toBe(36000);
    expect(series[3].projected).toBeGreaterThan(series[3].invested);
  });

  test("projection curve activates its draw reveal when it enters the viewport",async()=>{
    const data=buildProjectionSeries(1000,8,2);
    const {container}=render(<ProjectionCurve data={data}/>);
    await waitFor(()=>expect(container.querySelector(".reveal-chart")).toBeInTheDocument());
  });

  test("allocation ring updates its central profile from accessible category controls",()=>{
    render(<AllocationRing/>);
    expect(screen.getByText("EQUITY")).toBeInTheDocument();
    const debt=screen.getByRole("button",{name:/Debt 30%/});
    fireEvent.mouseEnter(debt);
    expect(screen.getByText("DEBT")).toBeInTheDocument();
    expect(screen.getByText(/Interest-rate and credit risks apply/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:/Gold 5%/}));
    expect(screen.getByText("GOLD")).toBeInTheDocument();
  });

  test("scenario heatmap selects a rate and horizon and recalculates the summary",()=>{
    render(<ProjectionHeatmap monthly={2500}/>);
    const cell=screen.getByRole("button",{name:/Assumed annual rate 5 percent over 5 years/});
    fireEvent.click(cell);
    expect(cell).toHaveAttribute("aria-pressed","true");
    expect(screen.getByText("5% · 5 years")).toBeInTheDocument();
    expect(screen.getByText("Selected growth relative to contributions: 13.3%. Hypothetical scenarios using monthly end-of-month contributions of ₹2,500. These are calculator outputs, not historical fund returns or forecasts.")).toBeInTheDocument();
  });

  test("learning path loads, persists, completes and resets local milestones",async()=>{
    window.localStorage.setItem("easyfolio:learning-progress:v1",JSON.stringify(["/learn/first"]));
    render(<LearningPath lessons={lessons}/>);
    await screen.findByText("1 / 2");
    expect(screen.getByRole("button",{name:"Completed"})).toHaveAttribute("aria-pressed","true");
    await screen.getByRole("button",{name:"Mark done"}).click();
    await screen.findByText("2 / 2");
    expect(JSON.parse(window.localStorage.getItem("easyfolio:learning-progress:v1")??"[]")).toEqual(["/learn/first","/learn/second"]);
    await screen.getByRole("button",{name:/Reset progress/}).click();
    await screen.findByText("0 / 2");
    expect(window.localStorage.getItem("easyfolio:learning-progress:v1")).toBeNull();
  });
});
