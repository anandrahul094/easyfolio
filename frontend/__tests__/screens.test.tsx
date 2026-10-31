import {render,screen} from "@testing-library/react";
import Home from "../app/page";
import Learn from "../app/learn/page";
import Basics from "../app/basics/page";
import Categories from "../app/categories/page";
import Resources from "../app/resources/page";
import About from "../app/about/page";

jest.mock("next/link",()=>({
  __esModule:true,
  default:({href,children,...props}:{href:string;children:React.ReactNode;[key:string]:unknown})=><a href={href} {...props}>{children}</a>
}));

describe("public learning and information screens",()=>{
  test("homepage introduces the product and exposes the main journeys",()=>{
    render(<Home/>);
    expect(screen.getByRole("heading",{level:1,name:/See the bigger picture.*Learn as you go/i})).toBeInTheDocument();
    expect(screen.getByRole("link",{name:/Continue learning/i})).toHaveAttribute("href","/learn");
    expect(screen.getByRole("link",{name:/Explore schemes/i})).toHaveAttribute("href","/funds");
    expect(screen.getByRole("link",{name:/Find your starting point/i})).toHaveAttribute("href","/discover");
    expect(screen.getByRole("heading",{name:"Asset allocation ring"})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"Projection sensitivity map"})).toBeInTheDocument();
  });

  test("learning centre exposes six distinct lesson destinations",()=>{
    render(<Learn/>);
    expect(screen.getByRole("heading",{level:1,name:"Build knowledge, one node at a time."})).toBeInTheDocument();
    const lessonLinks=screen.getAllByRole("link",{name:/Read lesson/i});
    expect(lessonLinks).toHaveLength(6);
    expect(lessonLinks.map(link=>link.getAttribute("href"))).toEqual([
      "/learn/mutual-fund-fundamentals",
      "/learn/sip-explained",
      "/learn/mutual-fund-categories",
      "/learn/understand-risk",
      "/learn/read-a-scheme-page",
      "/learn/before-you-take-action"
    ]);
  });

  test("investing basics screen includes foundational concepts and risk context",()=>{
    render(<Basics/>);
    expect(screen.getByRole("heading",{level:1,name:"Before the numbers, know the ideas."})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"What is NAV?"})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"Diversification"})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"Credit risk"})).toBeInTheDocument();
    expect(screen.getByText(/Risk is not a single number/i)).toBeInTheDocument();
  });

  test("category cards link to correctly filtered fund explorer routes",()=>{
    render(<Categories/>);
    expect(screen.getByRole("heading",{level:1,name:"First understand the category."})).toBeInTheDocument();
    for(const category of ["Equity","Debt","Hybrid","Life Cycle","Solution Oriented","Other","Unclassified"]){
      expect(screen.getByRole("link",{name:new RegExp("Explore "+category.toLowerCase()+" schemes")})).toHaveAttribute("href","/funds?category="+encodeURIComponent(category));
    }
    expect(screen.getByText(/A category is only the start/i)).toBeInTheDocument();
  });

  test("resources provide a featured reading path and six guide links",()=>{
    render(<Resources/>);
    expect(screen.getByRole("heading",{level:1,name:"Keep learning beyond the basics."})).toBeInTheDocument();
    expect(screen.getByRole("link",{name:/Start with the guide/i})).toHaveAttribute("href","/learn");
    expect(screen.getAllByRole("link",{name:/Read guide/i})).toHaveLength(6);
  });

  test("about screen communicates source-led education and no recommendation promise",()=>{
    render(<About/>);
    expect(screen.getByRole("heading",{level:1,name:"Clarity before decisions."})).toBeInTheDocument();
    expect(screen.getByText(/AMFI NAV text feed/i)).toBeInTheDocument();
    expect(screen.getByText(/does not guarantee returns, process investments or provide personalised scheme recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/Mutual fund investments are subject to market risks/i)).toBeInTheDocument();
  });
});
