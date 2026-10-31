import {render,screen} from "@testing-library/react";
import LessonPage,{generateMetadata} from "../app/learn/[slug]/page";

jest.mock("next/link",()=>({
  __esModule:true,
  default:({href,children,...props}:{href:string;children:React.ReactNode;[key:string]:unknown})=><a href={href} {...props}>{children}</a>
}));

describe("individual learning lessons",()=>{
  test("first lesson includes learning content, takeaway and forward navigation",async()=>{
    const page=await LessonPage({params:Promise.resolve({slug:"mutual-fund-fundamentals"})});
    render(page);
    expect(screen.getByRole("heading",{level:1,name:"Mutual fund fundamentals"})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"What is a mutual fund?"})).toBeInTheDocument();
    expect(screen.getByText(/A mutual fund pools money from multiple investors/i)).toBeInTheDocument();
    expect(screen.getByText(/A mutual fund is a pooled investment structure/i)).toBeInTheDocument();
    expect(screen.getByRole("link",{name:/NEXT LESSON/i})).toHaveAttribute("href","/learn/sip-explained");
    expect(screen.getByRole("link",{name:/BACK TO LEARNING CENTRE/i})).toHaveAttribute("href","/learn");
  });

  test("checklist lesson renders list items and links to comparison",async()=>{
    const page=await LessonPage({params:Promise.resolve({slug:"before-you-take-action"})});
    render(page);
    expect(screen.getByRole("heading",{level:1,name:"Before you take action"})).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText(/Read the latest Scheme Information Document/i)).toBeInTheDocument();
    expect(screen.getByRole("link",{name:/Compare available scheme information/i})).toHaveAttribute("href","/compare");
    expect(screen.getByRole("link",{name:/COURSE COMPLETE/i})).toHaveAttribute("href","/learn");
  });

  test("lesson metadata uses the lesson title",async()=>{
    await expect(generateMetadata({params:Promise.resolve({slug:"sip-explained"})})).resolves.toEqual({title:"SIP, explained simply"});
  });
});
