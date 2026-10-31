import {render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Discover from "../app/discover/page";

jest.mock("next/link",()=>({
  __esModule:true,
  default:({href,children,...props}:{href:string;children:React.ReactNode;[key:string]:unknown})=><a href={href} {...props}>{children}</a>
}));

describe("guided learning discovery flow",()=>{
  test("requires an answer before allowing the user to continue",()=>{
    render(<Discover/>);
    expect(screen.getByRole("progressbar",{name:"Question progress"})).toHaveAttribute("aria-valuenow","1");
    expect(screen.getByRole("button",{name:"← Back"})).toBeDisabled();
    expect(screen.getByRole("button",{name:"Continue →"})).toBeDisabled();
  });

  test("supports answer selection, forward and backward navigation, and a learning summary",async()=>{
    const user=userEvent.setup();
    render(<Discover/>);

    await user.click(screen.getByRole("button",{name:"How mutual funds work"}));
    expect(screen.getByRole("button",{name:"How mutual funds work"})).toHaveAttribute("aria-pressed","true");
    await user.click(screen.getByRole("button",{name:"Continue →"}));
    expect(screen.getByText("Which time-horizon concept would you like to understand?")).toBeInTheDocument();

    await user.click(screen.getByRole("button",{name:"← Back"}));
    expect(screen.getByRole("button",{name:"How mutual funds work"})).toHaveAttribute("aria-pressed","true");
    await user.click(screen.getByRole("button",{name:"Continue →"}));

    await user.click(screen.getByRole("button",{name:"Long-term goals"}));
    await user.click(screen.getByRole("button",{name:"Continue →"}));
    await user.click(screen.getByRole("button",{name:"Why fund values fluctuate"}));
    await user.click(screen.getByRole("button",{name:"Continue →"}));
    await user.click(screen.getByRole("button",{name:"I'm completely new"}));
    await user.click(screen.getByRole("button",{name:"See my learning route"}));

    expect(screen.getByRole("heading",{name:"A useful place to continue."})).toBeInTheDocument();
    expect(screen.getByText(/How mutual funds work/)).toBeInTheDocument();
    expect(screen.getByText(/Long-term goals/)).toBeInTheDocument();
    expect(screen.getByRole("link",{name:"Start learning"})).toHaveAttribute("href","/learn");
    expect(screen.getByRole("link",{name:"Explore categories"})).toHaveAttribute("href","/categories");
  });

  test("can edit a saved answer and restart the flow",async()=>{
    const user=userEvent.setup();
    render(<Discover/>);
    await user.click(screen.getByRole("button",{name:"How categories differ"}));
    await user.click(screen.getByRole("button",{name:"Continue →"}));
    await user.click(screen.getByRole("button",{name:"Short-term goals"}));
    await user.click(screen.getByRole("button",{name:"Continue →"}));
    await user.click(screen.getByRole("button",{name:"Why fund values fluctuate"}));
    await user.click(screen.getByRole("button",{name:"Continue →"}));
    await user.click(screen.getByRole("button",{name:"I know the basics"}));
    await user.click(screen.getByRole("button",{name:"See my learning route"}));

    await user.click(screen.getAllByRole("button",{name:"Change"})[0]);
    expect(screen.getByText("What would you like to understand first?")).toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"How mutual funds work"}));
    await user.click(screen.getByRole("button",{name:"Continue →"}));

    await user.click(screen.getByRole("button",{name:"Start again"}));
    expect(screen.getByText("What would you like to understand first?")).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Continue →"})).toBeDisabled();
  });
});
