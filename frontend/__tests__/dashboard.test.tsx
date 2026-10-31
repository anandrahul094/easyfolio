import {fireEvent,render,screen,waitFor} from "@testing-library/react";
import Dashboard from "../app/components/dashboard";

jest.mock("next/link",()=>({
  __esModule:true,
  default:({href,children,...props}:{href:string;children:React.ReactNode;[key:string]:unknown})=><a href={href} {...props}>{children}</a>
}));

jest.mock("recharts",()=>{
  const React=require("react");
  const Container=()=>React.createElement("div",null);
  const Empty=()=>null;
  return {
    ResponsiveContainer:Container,AreaChart:Empty,PieChart:Empty,Pie:Empty,
    CartesianGrid:Empty,Cell:Empty,Area:Empty,Tooltip:Empty,XAxis:Empty,YAxis:Empty,Legend:Empty
  };
});

describe("visual dashboard progress and projection",()=>{
  beforeEach(()=>window.localStorage.clear());

  test("reads only completed foundational lesson IDs and selects the first incomplete lesson",async()=>{
    window.localStorage.setItem("easyfolio:learning-progress:v1",JSON.stringify([
      "/learn/sip-explained","/learn/understand-risk","/learn/not-a-real-lesson"
    ]));
    render(<Dashboard/>);
    await waitFor(()=>expect(document.body.textContent).toContain("2 / 4"));
    expect(screen.getByRole("link",{name:/Open lesson/})).toHaveAttribute("href","/learn/mutual-fund-fundamentals");
  });

  test("shows a complete-state destination when all foundational lessons are done",async()=>{
    window.localStorage.setItem("easyfolio:learning-progress:v1",JSON.stringify([
      "/learn/mutual-fund-fundamentals","/learn/sip-explained",
      "/learn/mutual-fund-categories","/learn/understand-risk"
    ]));
    render(<Dashboard/>);
    await waitFor(()=>expect(document.body.textContent).toContain("4 / 4"));
    expect(screen.getByText("All foundational nodes complete")).toBeInTheDocument();
    expect(screen.getByRole("link",{name:/Review learning path/})).toHaveAttribute("href","/learn");
  });

  test("recovers from malformed local progress without breaking the dashboard",async()=>{
    window.localStorage.setItem("easyfolio:learning-progress:v1","{not-json");
    render(<Dashboard/>);
    await waitFor(()=>expect(document.body.textContent).toContain("0 / 4"));
    expect(screen.getByRole("link",{name:/Open lesson/})).toHaveAttribute("href","/learn/mutual-fund-fundamentals");
  });

  test("updates monthly contributions and projection output from the dashboard slider",()=>{
    render(<Dashboard/>);
    expect(screen.getByText(/Total contributions:/i)).toBeInTheDocument();
    const sliders=screen.getAllByRole("slider");
    fireEvent.change(sliders[0],{target:{value:"10000"}});
    expect(document.body.textContent).toContain("₹14,40,000");
  });
});
