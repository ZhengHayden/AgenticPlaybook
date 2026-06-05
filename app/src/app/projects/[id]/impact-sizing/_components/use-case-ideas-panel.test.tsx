import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import type { ProjectUseCase } from "@/content/sample-data";
import { UseCaseIdeasPanel } from "./use-case-ideas-panel";

const wrap = (ui: ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>);

const idea = (over: Partial<ProjectUseCase> = {}): ProjectUseCase => ({
  id: "u1",
  candidateId: "c1",
  name: "Auto-match",
  description: "d",
  impactRationale: "r",
  ...over,
});

describe("UseCaseIdeasPanel", () => {
  it("renders existing use-case ideas", () => {
    wrap(<UseCaseIdeasPanel candidateId="c1" useCases={[idea()]} onChange={() => {}} />);
    expect(screen.getByDisplayValue("Auto-match")).toBeInTheDocument();
  });

  it("adds a new idea parented to the candidate", () => {
    const onChange = vi.fn();
    wrap(<UseCaseIdeasPanel candidateId="c1" useCases={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add use case/i }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as ProjectUseCase[];
    expect(next).toHaveLength(1);
    expect(next[0].candidateId).toBe("c1");
  });

  it("edits a field immutably", () => {
    const onChange = vi.fn();
    const original = [idea()];
    wrap(<UseCaseIdeasPanel candidateId="c1" useCases={original} onChange={onChange} />);
    fireEvent.change(screen.getByDisplayValue("Auto-match"), { target: { value: "Renamed" } });
    const next = onChange.mock.calls[0][0] as ProjectUseCase[];
    expect(next[0].name).toBe("Renamed");
    expect(original[0].name).toBe("Auto-match"); // original untouched
  });

  it("removes an idea immutably (new array, original kept)", () => {
    const onChange = vi.fn();
    const original = [idea()];
    wrap(<UseCaseIdeasPanel candidateId="c1" useCases={original} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onChange.mock.calls[0][0]).toHaveLength(0);
    expect(original).toHaveLength(1);
  });
});
