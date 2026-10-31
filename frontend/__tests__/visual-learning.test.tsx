import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import {LearningPath} from "../app/components/learning-path";
import {AllocationRing,PerformanceHeatmap,ProjectionCurve,ProjectionHeatmap,buildProjectionSeries} from "../app/components/visuals";

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
    Area:({isAnimationActive}: {isAnimationActive?:boolean})=>React.createElement("div",{"data-testid":"chart-area","data-animation-active":String(Boolean(isAnimationActive))}),
    Tooltip:Empty,
    XAxis:Empty,
    YAxis:Empty,
    Legend:Empty
  };
  test("projection curve reveals immediately when IntersectionObserver is unavailable",async()=>{
    const original=global.IntersectionObserver;
    Object.defineProperty(global,"IntersectionObserver",{configurable:true,writable:true,value:undefined});
    try{
      const data=buildProjectionSeries(1000,8,2);
      const {container}=render(<ProjectionCurve data={data}/>);
      await waitFor(()=>expect(container.querySelector(".reveal-chart")).toBeInTheDocument());
    }finally{
      Object.defineProperty(global,"IntersectionObserver",{configurable:true,writable:true,value:original});
    }
  });

  test("projection curve disables chart animation when reduced motion is preferred",async()=>{
    const original=window.matchMedia;
    Object.defineProperty(window,"matchMedia",{configurable:true,writable:true,value:jest.fn().mockReturnValue({
      matches:true,media:"(prefers-reduced-motion: reduce)",addEventListener:jest.fn(),removeEventListener:jest.fn()
    })});
    try{
      render(<ProjectionCurve data={buildProjectionSeries(1000,8,2)}/>);
      await waitFor(()=>expect(screen.getAllByTestId("chart-area").length).toBeGreaterThan(0));
      expect(screen.getAllByTestId("chart-area").every(node=>node.getAttribute("data-animation-active")==="false")).toBe(true);
    }finally{
      Object.defineProperty(window,"matchMedia",{configurable:true,writable:true,value:original});
    }
  });

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
    fireEvent.focus(screen.getByRole("button",{name:/Equity 55%/}));
    expect(screen.getByText("EQUITY")).toBeInTheDocument();
  });

  test("historical performance heatmap clearly reports when no verified monthly data is connected",()=>{
    render(<PerformanceHeatmap/>);
    expect(screen.getByRole("status",{name:"Historical performance data is not connected"})).toBeInTheDocument();
    expect(screen.getByText("Historical return data is not connected")).toBeInTheDocument();
    expect(screen.getByText(/verified, dated performance source/i)).toBeInTheDocument();
  });

  test("historical performance heatmap renders only supplied monthly returns",()=>{
    render(<PerformanceHeatmap data={[
      {year:2025,month:1,returnPercent:2.35},
      {year:2025,month:2,returnPercent:-1.2},
      {year:2025,month:3,returnPercent:0}
    ]}/>);
    const january=screen.getByRole("button",{name:"Jan 2025: 2.35 percent"});
    expect(january).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Feb 2025: -1.20 percent"})).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Mar 2025: 0.00 percent"})).toBeInTheDocument();
    expect(screen.getByText(/Select a month to inspect its return/i)).toBeInTheDocument();
    fireEvent.click(january);
    expect(screen.getByText("Jan 2025: 2.35% Historical values require a source and reporting date.")).toBeInTheDocument();
  });

  test("scenario heatmap selects a rate and horizon and recalculates the summary",()=>{
    render(<ProjectionHeatmap monthly={2500}/>);
    const cell=screen.getByRole("button",{name:/Assumed annual rate 5 percent over 5 years/});
    fireEvent.click(cell);
    expect(cell).toHaveAttribute("aria-pressed","true");
    expect(screen.getByText("5% · 5 years")).toBeInTheDocument();
    expect(screen.getByText("Selected growth relative to contributions: 13.3%. Hypothetical scenarios using monthly end-of-month contributions of ₹2,500. These are calculator outputs, not historical fund returns or forecasts.")).toBeInTheDocument();
    const negativeScenario=screen.getByRole("button",{name:/Assumed annual rate -10 percent over 1 years/});
    fireEvent.focus(negativeScenario);
    expect(negativeScenario).toHaveAttribute("aria-pressed","true");
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
