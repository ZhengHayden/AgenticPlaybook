"use client";

import type { KnowledgeUseCase } from "@/content/knowledge";
import { useLocale } from "@/lib/locale-context";
import { Badge, IdBadge, fnPaletteColor } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  archetypeLabel,
  maturityAccent,
  maturityLabel,
  validationDotClass,
  validationLabel,
} from "./display";

interface UseCaseCardProps {
  useCase: KnowledgeUseCase;
  onView: (useCase: KnowledgeUseCase) => void;
  onEdit: (useCase: KnowledgeUseCase) => void;
  onDelete: (useCase: KnowledgeUseCase) => void;
}

const MAX_KPIS = 3;

export function UseCaseCard({ useCase, onView, onEdit, onDelete }: UseCaseCardProps) {
  const { t, locale } = useLocale();
  const v = useCase.validation;

  return (
    <Card lift className="flex h-full flex-col">
      <CardBody className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
              {useCase.name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">{useCase.domain}</p>
          </div>
          <span
            className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", validationDotClass(v.status))}
            title={validationLabel(t, v.status)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white",
              maturityAccent(useCase.maturity),
            )}
          >
            {maturityLabel(t, useCase.maturity)}
          </span>
          <Badge>{useCase.techTag}</Badge>
          <Badge ok={v.status === "validated"}>{validationLabel(t, v.status)}</Badge>
        </div>

        {useCase.kpis.length > 0 && (
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            {useCase.kpis.slice(0, MAX_KPIS).map((kpi) => (
              <li key={kpi} className="flex gap-1.5">
                <span className="text-emerald-500">▲</span>
                <span>{kpi}</span>
              </li>
            ))}
          </ul>
        )}

        {useCase.archetypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {useCase.archetypes.map((a, i) => (
              <IdBadge key={a} bg={fnPaletteColor(i)}>
                {archetypeLabel(a, locale)}
              </IdBadge>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1">
          <Button variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => onView(useCase)}>
            {t.knowledge.viewDetails}
          </Button>
          <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => onEdit(useCase)}>
            {t.common.edit}
          </Button>
          <Button
            variant="ghost"
            className="ml-auto px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
            onClick={() => onDelete(useCase)}
          >
            {t.common.delete}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
