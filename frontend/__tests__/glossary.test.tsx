import {fireEvent,render,screen} from "@testing-library/react";
import Glossary from "../app/glossary/page";

describe("glossary search",()=>{
  test("renders the glossary catalogue and term count",()=>{
    render(<Glossary/>);
    expect(screen.getByRole("heading",{level:1,name:"The language of investing, decoded."})).toBeInTheDocument();
    expect(screen.getByText("15 terms")).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"NAV"})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"Riskometer"})).toBeInTheDocument();
  });

  test("filters terms by abbreviation, full definition and explanatory text",()=>{
    render(<Glossary/>);
    const input=screen.getByRole("textbox",{name:"Search glossary terms"});
    fireEvent.change(input,{target:{value:"Annual scheme expenses"}});
    expect(screen.getByRole("heading",{name:"Expense ratio"})).toBeInTheDocument();
    expect(screen.queryByRole("heading",{name:"Riskometer"})).not.toBeInTheDocument();
    expect(screen.getByText("1 terms")).toBeInTheDocument();
  });

  test("search is case-insensitive and shows an empty state for no matches",()=>{
    render(<Glossary/>);
    const input=screen.getByRole("textbox",{name:"Search glossary terms"});
    fireEvent.change(input,{target:{value:"nav"}});
    expect(screen.getByRole("heading",{name:"NAV"})).toBeInTheDocument();
    fireEvent.change(input,{target:{value:"not-a-real-financial-term"}});
    expect(screen.getByText("0 terms")).toBeInTheDocument();
    expect(screen.getByText(/No matching terms/i)).toBeInTheDocument();
  });
});
