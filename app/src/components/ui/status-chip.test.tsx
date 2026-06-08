import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusChip, type ChipState } from "./status-chip";

describe("StatusChip", () => {
  it("renders the label text", () => {
    render(<StatusChip state="ready">Validated</StatusChip>);
    expect(screen.getByText("Validated")).toBeInTheDocument();
  });

  it("pairs every state with an icon so color is never the only carrier", () => {
    const states: ReadonlyArray<ChipState> = ["ready", "warn", "block", "info", "neutral"];
    for (const state of states) {
      const { container, unmount } = render(<StatusChip state={state}>{state}</StatusChip>);
      // lucide renders an <svg>; its presence proves the icon pairing.
      expect(container.querySelector("svg")).not.toBeNull();
      unmount();
    }
  });

  it("maps each state to its semantic token classes", () => {
    const cases: ReadonlyArray<[ChipState, string]> = [
      ["ready", "text-state-ready"],
      ["warn", "text-state-warn"],
      ["block", "text-state-block"],
      ["info", "text-state-info"],
      ["neutral", "text-state-neutral"],
    ];
    for (const [state, token] of cases) {
      const { container, unmount } = render(<StatusChip state={state}>x</StatusChip>);
      expect(container.firstElementChild?.className).toContain(token);
      unmount();
    }
  });

  it("respects an icon override", () => {
    const Custom = (props: { className?: string }) => (
      <svg data-testid="custom-icon" className={props.className} />
    );
    render(
      <StatusChip state="ready" icon={Custom}>
        PASS
      </StatusChip>,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
