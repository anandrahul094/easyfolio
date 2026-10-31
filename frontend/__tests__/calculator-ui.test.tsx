import {fireEvent,render,screen} from "@testing-library/react";
import {CompoundCalculator,SipCalculator} from "../app/calculators/calculator-tools";

describe("calculator screen interactions",()=>{
  test("SIP calculator updates its illustrative result when assumptions change",()=>{
    render(<SipCalculator/>);
    expect(screen.getByRole("heading",{level:1,name:"See how a monthly SIP can add up."})).toBeInTheDocument();
    const sliders=screen.getAllByRole("slider");
    expect(sliders).toHaveLength(3);
    const result=screen.getByText("₹10,32,760");
    expect(result).toBeInTheDocument();
    fireEvent.change(sliders[0],{target:{value:"10000"}});
    expect(screen.getByText("₹20,65,520")).toBeInTheDocument();
    expect(screen.getByText("₹12,00,000")).toBeInTheDocument();
  });

  test("compound calculator changes output when compounding frequency changes",()=>{
    render(<CompoundCalculator/>);
    expect(screen.getByRole("heading",{level:1,name:"Time changes the shape of growth."})).toBeInTheDocument();
    const select=screen.getByRole("combobox");
    expect(select).toHaveValue("1");
    const annually=screen.getByText("₹2,59,374");
    expect(annually).toBeInTheDocument();
    fireEvent.change(select,{target:{value:"12"}});
    expect(select).toHaveValue("12");
    expect(screen.getByText("₹2,70,704")).toBeInTheDocument();
  });

  test("both calculator screens keep the non-guarantee disclaimer visible",()=>{
    const {unmount}=render(<SipCalculator/>);
    expect(screen.getByText(/An illustration is not a forecast/i)).toBeInTheDocument();
    unmount();
    render(<CompoundCalculator/>);
    expect(screen.getByText(/Compounding describes a formula — not a guaranteed outcome/i)).toBeInTheDocument();
  });
});
