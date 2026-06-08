import { Card } from "@/components/primitives";

export default function Placeholder({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[28px] leading-9 font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
      <Card className="p-16 text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-surface-muted grid place-items-center mb-3">
          <span className="font-display text-lg text-muted-foreground">∅</span>
        </div>
        <div className="font-medium">Mockup page</div>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          This screen follows the same shell, KPI strip and table patterns established on the
          Projects, Overview, Roadmap and Knowledge mockups.
        </p>
      </Card>
    </div>
  );
}
