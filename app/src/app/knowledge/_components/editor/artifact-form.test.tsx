import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import { ArtifactForm } from "./artifact-form";

function renderForm(onSubmit = vi.fn()) {
  render(
    <LocaleProvider>
      <ArtifactForm draft={{ mode: "create" }} onSubmit={onSubmit} onCancel={vi.fn()} />
    </LocaleProvider>,
  );
  return onSubmit;
}

describe("ArtifactForm validation", () => {
  it("blocks save and shows a specific message when Owner is empty", () => {
    const onSubmit = renderForm();
    // Arrange: fill Title but leave Owner blank.
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "CXO Deck" } });

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Assert: explicit required-fields message, and no upload attempted.
    expect(screen.getByText("Title and Owner are required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("marks Title and Owner as required in the UI", () => {
    renderForm();
    // The asterisk lives inside each required field's <label>.
    const titleLabel = screen.getByText("Title").closest("label");
    const ownerLabel = screen.getByText("Owner").closest("label");
    expect(titleLabel?.textContent).toContain("*");
    expect(ownerLabel?.textContent).toContain("*");
  });

  it("submits once Title and Owner are filled and a file is chosen", () => {
    const onSubmit = renderForm();
    fireEvent.change(screen.getByLabelText(/Title/), { target: { value: "CXO Deck" } });
    fireEvent.change(screen.getByLabelText(/Owner/), { target: { value: "Alex" } });
    const file = new File(["<html></html>"], "deck.html", { type: "text/html" });
    fireEvent.change(screen.getByLabelText(/File/), { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
