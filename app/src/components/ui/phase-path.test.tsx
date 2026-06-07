import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhasePath } from "./phase-path";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/p1/impact-sizing/scoring",
}));

const STEPS = [
  { href: "/projects/p1/impact-sizing/candidates", label: "Candidates", meta: "12" },
  { href: "/projects/p1/impact-sizing/scoring", label: "Scoring", meta: "6" },
  { href: "/projects/p1/impact-sizing/portfolio", label: "Portfolio" },
];

describe("PhasePath", () => {
  it("renders every step label", () => {
    render(<PhasePath steps={STEPS} />);
    expect(screen.getByText("Candidates")).toBeInTheDocument();
    expect(screen.getByText("Scoring")).toBeInTheDocument();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
  });

  it("marks the step matching the current path as the active step", () => {
    render(<PhasePath steps={STEPS} />);
    const current = screen.getByText("Scoring").closest("a");
    expect(current).toHaveAttribute("aria-current", "step");
  });

  it("does not mark non-current steps as active", () => {
    render(<PhasePath steps={STEPS} />);
    expect(screen.getByText("Candidates").closest("a")).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Portfolio").closest("a")).not.toHaveAttribute("aria-current");
  });

  it("renders per-step meta badges when provided", () => {
    render(<PhasePath steps={STEPS} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });
});
