"use client";

import { usePathname } from "next/navigation";
import type { ScoringMode } from "@/content/sample-data";
import { ScoringModeSwitch } from "./scoring-mode-switch";

interface ScoringModeSwitchSlotProps {
  projectId: string;
  mode: ScoringMode;
}

/**
 * Renders the scoring-mode switch on every Impact-Sizing tab except Candidates,
 * where the prioritization grain isn't relevant.
 */
export function ScoringModeSwitchSlot({ projectId, mode }: ScoringModeSwitchSlotProps) {
  const pathname = usePathname();
  if (pathname?.endsWith("/candidates")) return null;
  return <ScoringModeSwitch projectId={projectId} mode={mode} />;
}
