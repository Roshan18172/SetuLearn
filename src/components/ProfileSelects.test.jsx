import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExamSelect, StateCitySelect } from "./ProfileSelects";

function LocationHarness({ initial = { state: "", city: "" } }) {
  const [loc, setLoc] = useState(initial);
  return (
    <>
      <StateCitySelect state={loc.state} city={loc.city} onChange={(state, city) => setLoc({ state, city })} />
      <output data-testid="value">{`${loc.state}|${loc.city}`}</output>
    </>
  );
}

const cityOptions = () => Array.from(screen.getByLabelText("City").querySelectorAll("option")).map((o) => o.textContent);

describe("StateCitySelect", () => {
  it("disables city until a state is chosen, then lists only that state's cities", () => {
    render(<LocationHarness />);
    expect(screen.getByLabelText("City")).toBeDisabled();

    fireEvent.change(screen.getByLabelText("State / UT"), { target: { value: "Goa" } });
    expect(screen.getByLabelText("City")).not.toBeDisabled();
    expect(cityOptions()).toContain("Panaji");
    expect(cityOptions()).not.toContain("Pune");

    fireEvent.change(screen.getByLabelText("State / UT"), { target: { value: "Maharashtra" } });
    expect(cityOptions()).toContain("Pune");
    expect(cityOptions()).not.toContain("Panaji");
  });

  it("clears the city when the state changes", () => {
    render(<LocationHarness initial={{ state: "Goa", city: "Panaji" }} />);
    expect(screen.getByTestId("value").textContent).toBe("Goa|Panaji");
    fireEvent.change(screen.getByLabelText("State / UT"), { target: { value: "Kerala" } });
    expect(screen.getByTestId("value").textContent).toBe("Kerala|");
  });

  it("'Other' lets the student type a city that isn't listed", () => {
    render(<LocationHarness initial={{ state: "Goa", city: "" }} />);
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "__other__" } });
    fireEvent.change(screen.getByLabelText("Your city"), { target: { value: "Tiny Village" } });
    expect(screen.getByTestId("value").textContent).toBe("Goa|Tiny Village");
  });

  it("keeps a previously saved free-text city visible via 'Other'", () => {
    render(<LocationHarness initial={{ state: "Goa", city: "Somewhere Else" }} />);
    expect(screen.getByLabelText("Your city").value).toBe("Somewhere Else");
  });
});

describe("ExamSelect", () => {
  function ExamHarness({ initial = "" }) {
    const [v, setV] = useState(initial);
    return (
      <>
        <ExamSelect value={v} onChange={setV} />
        <output data-testid="exam">{v}</output>
      </>
    );
  }

  it("selects a listed exam", () => {
    render(<ExamHarness />);
    fireEvent.change(screen.getByLabelText("Target exam"), { target: { value: "NEET UG" } });
    expect(screen.getByTestId("exam").textContent).toBe("NEET UG");
    expect(screen.queryByLabelText("Your target exam")).toBeNull();
  });

  it("supports an unlisted exam through 'Other' and preserves legacy free-text values", () => {
    const { unmount } = render(<ExamHarness />);
    fireEvent.change(screen.getByLabelText("Target exam"), { target: { value: "__other__" } });
    fireEvent.change(screen.getByLabelText("Your target exam"), { target: { value: "My Local Exam" } });
    expect(screen.getByTestId("exam").textContent).toBe("My Local Exam");
    unmount();

    render(<ExamHarness initial="Some Old Typed Exam" />);
    expect(screen.getByLabelText("Your target exam").value).toBe("Some Old Typed Exam");
  });
});
