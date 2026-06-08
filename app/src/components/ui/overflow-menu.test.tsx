import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OverflowMenu } from "./overflow-menu";

describe("OverflowMenu", () => {
  it("is collapsed until the trigger is clicked", () => {
    render(<OverflowMenu label="More actions" items={[{ label: "Edit", onSelect: () => {} }]} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeInTheDocument();
  });

  it("invokes the item handler and closes on select", () => {
    const onSelect = vi.fn();
    render(<OverflowMenu label="More actions" items={[{ label: "Delete", onSelect, danger: true }]} />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<OverflowMenu label="More actions" items={[{ label: "Edit", onSelect: () => {} }]} />);
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
