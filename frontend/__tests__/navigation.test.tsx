import {render,screen} from "@testing-library/react";
import {MobileBottomNav,SiteHeader} from "../app/site-navigation";

let pathname="/";
jest.mock("next/navigation",()=>({usePathname:()=>pathname}));
jest.mock("next/link",()=>({
  __esModule:true,
  default:({href,children,...props}:{href:string;children:React.ReactNode;[key:string]:unknown})=><a href={href} {...props}>{children}</a>
}));

describe("responsive navigation state",()=>{
  test("home is marked as the current page in desktop and mobile navigation",()=>{
    pathname="/";
    render(<><SiteHeader/><MobileBottomNav/></>);
    expect(screen.getAllByRole("link",{name:/Home|EasyFolio home/i}).some(link=>link.getAttribute("aria-current")==="page")).toBe(true);
    expect(screen.getAllByRole("navigation")).toHaveLength(2);
  });

  test("nested lesson routes keep Learn active",()=>{
    pathname="/learn/sip-explained";
    render(<><SiteHeader/><MobileBottomNav/></>);
    const learnLinks=screen.getAllByRole("link",{name:"Learn"});
    expect(learnLinks.length).toBeGreaterThan(0);
    expect(learnLinks.every(link=>link.getAttribute("aria-current")==="page")).toBe(true);
  });

  test("calculator routes keep the calculator quick link active",()=>{
    pathname="/calculators/compound";
    render(<><SiteHeader/><MobileBottomNav/></>);
    expect(screen.getByRole("link",{name:"Calculators"})).toHaveAttribute("aria-current","page");
    expect(screen.getByRole("link",{name:/Tools/})).toHaveAttribute("aria-current","page");
  });
});
