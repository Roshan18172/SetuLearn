import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import About from "./About";

it("shows the overview video section between the story and the mission", () => {
  const { container } = render(
    <HelmetProvider>
      <MemoryRouter>
        <About />
      </MemoryRouter>
    </HelmetProvider>
  );
  expect(screen.getByRole("heading", { level: 2, name: /whole exam preparation/i })).toBeInTheDocument();
  expect(container.querySelector("video").getAttribute("src")).toBe("/videos/setulearn-about.mp4");
  const order = [...container.querySelectorAll("section")].map((s) => s.className);
  expect(order.indexOf("avs")).toBeGreaterThan(order.indexOf("about-section"));
  expect(order.indexOf("avs")).toBeLessThan(order.indexOf("mission-section"));
});
