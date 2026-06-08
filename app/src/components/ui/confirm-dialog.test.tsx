import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "./confirm-dialog";

const baseProps = {
  onClose: () => {},
  onConfirm: () => {},
  title: "Delete project",
  confirmLabel: "Delete",
  cancelLabel: "Cancel",
};

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<ConfirmDialog {...baseProps} open={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the title and description when open", () => {
    render(<ConfirmDialog {...baseProps} open description="This cannot be undone." />);
    expect(screen.getByRole("heading", { name: "Delete project" })).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("fires onConfirm when no re-type gate is set", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} open onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("keeps confirm disabled until the required text is typed exactly", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        {...baseProps}
        open
        onConfirm={onConfirm}
        requireText="NEXT ELT"
        requireTextLabel="Type the project name"
      />,
    );
    const confirm = screen.getByRole("button", { name: "Delete" });
    expect(confirm).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "wrong" } });
    expect(confirm).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "NEXT ELT" } });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...baseProps} open onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
