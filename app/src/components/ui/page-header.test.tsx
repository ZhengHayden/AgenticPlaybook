import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the title as a level-1 heading", () => {
    render(<PageHeader title="Projects" />);
    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();
  });

  it("renders subtitle, actions, and an optional icon", () => {
    render(
      <PageHeader
        icon={<span data-testid="icon">A</span>}
        title="Projects"
        subtitle="Impact sizing engine"
        actions={<button type="button">New project</button>}
      />,
    );
    expect(screen.getByText("Impact sizing engine")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders a highlights strip of label/value pairs", () => {
    render(
      <PageHeader
        title="Acme"
        highlights={[
          { label: "Domain", value: "Logistics" },
          { label: "Phase", value: "Impact Sizing" },
        ]}
      />,
    );
    expect(screen.getByText("Domain")).toBeInTheDocument();
    expect(screen.getByText("Logistics")).toBeInTheDocument();
    expect(screen.getByText("Phase")).toBeInTheDocument();
    expect(screen.getByText("Impact Sizing")).toBeInTheDocument();
  });

  it("omits the highlights strip when none are provided", () => {
    const { container } = render(<PageHeader title="Empty" />);
    expect(container.querySelector("dl")).toBeNull();
  });
});
