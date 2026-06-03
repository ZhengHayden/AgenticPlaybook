"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
import type {
  CanvasNode,
  WorkflowCanvas,
  WorkflowEdge,
  WorkflowStep,
} from "@/content/sample-data";
import { NODE_H, NODE_W, unplacedSteps } from "@/content/canvas-layout";
import { archetypes } from "@/content/archetypes";
import { X } from "lucide-react";

interface FlowCanvasProps {
  steps: ReadonlyArray<WorkflowStep>;
  canvas: WorkflowCanvas;
  locale: Locale;
  onChange: (canvas: WorkflowCanvas) => void;
}

const CANVAS_H = 440;
const ADD_X_STRIDE = 200;
const ADD_Y_STRIDE = 96;
const PAD = 24;

type Interaction =
  | { mode: "idle" }
  | { mode: "move"; stepId: string; offsetX: number; offsetY: number }
  | { mode: "connect"; from: string; x: number; y: number };

interface Point {
  x: number;
  y: number;
}

const centerOf = (node: CanvasNode): Point => ({ x: node.x + NODE_W / 2, y: node.y + NODE_H / 2 });

export function FlowCanvas({ steps, canvas, locale, onChange }: FlowCanvasProps) {
  const en = locale === "en";
  const containerRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<Interaction>({ mode: "idle" });

  const stepById = (id: string): WorkflowStep | undefined => steps.find((s) => s.id === id);
  const nodeByStep = (id: string): CanvasNode | undefined => canvas.nodes.find((n) => n.stepId === id);
  const unplaced = unplacedSteps(steps, canvas);

  // Canvas extent — large enough to hold every node plus padding.
  const extentX = canvas.nodes.reduce((m, n) => Math.max(m, n.x + NODE_W), 0) + PAD * 2;
  const extentY = canvas.nodes.reduce((m, n) => Math.max(m, n.y + NODE_H), 0) + PAD * 2;
  const width = Math.max(extentX, 640);
  const height = Math.max(extentY, CANVAS_H);

  const toLocal = (clientX: number, clientY: number): Point => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: clientX - rect.left + el.scrollLeft, y: clientY - rect.top + el.scrollTop };
  };

  const findNodeAt = (p: Point): CanvasNode | undefined =>
    canvas.nodes.find((n) => p.x >= n.x && p.x <= n.x + NODE_W && p.y >= n.y && p.y <= n.y + NODE_H);

  const startMove = (e: React.PointerEvent, node: CanvasNode) => {
    e.stopPropagation();
    const p = toLocal(e.clientX, e.clientY);
    setInteraction({ mode: "move", stepId: node.stepId, offsetX: p.x - node.x, offsetY: p.y - node.y });
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const startConnect = (e: React.PointerEvent, node: CanvasNode) => {
    e.stopPropagation();
    const p = toLocal(e.clientX, e.clientY);
    setInteraction({ mode: "connect", from: node.stepId, x: p.x, y: p.y });
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (interaction.mode === "idle") return;
    const p = toLocal(e.clientX, e.clientY);
    if (interaction.mode === "move") {
      const x = Math.max(0, p.x - interaction.offsetX);
      const y = Math.max(0, p.y - interaction.offsetY);
      onChange({
        ...canvas,
        nodes: canvas.nodes.map((n) => (n.stepId === interaction.stepId ? { ...n, x, y } : n)),
      });
    } else {
      setInteraction({ ...interaction, x: p.x, y: p.y });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (interaction.mode === "connect") {
      const target = findNodeAt(toLocal(e.clientX, e.clientY));
      if (target && target.stepId !== interaction.from) addEdge(interaction.from, target.stepId);
    }
    setInteraction({ mode: "idle" });
  };

  const addEdge = (from: string, to: string) => {
    const exists = canvas.edges.some((edge) => edge.from === from && edge.to === to);
    if (exists) return;
    const edge: WorkflowEdge = { id: `e-${crypto.randomUUID()}`, from, to };
    onChange({ ...canvas, edges: [...canvas.edges, edge] });
  };

  const removeEdge = (edgeId: string) => {
    onChange({ ...canvas, edges: canvas.edges.filter((edge) => edge.id !== edgeId) });
  };

  const removeNode = (stepId: string) => {
    onChange({
      nodes: canvas.nodes.filter((n) => n.stepId !== stepId),
      edges: canvas.edges.filter((edge) => edge.from !== stepId && edge.to !== stepId),
    });
  };

  const addNode = (stepId: string) => {
    const count = canvas.nodes.length;
    const node: CanvasNode = {
      stepId,
      x: PAD + (count % 3) * ADD_X_STRIDE,
      y: PAD + Math.floor(count / 3) * ADD_Y_STRIDE,
    };
    onChange({ ...canvas, nodes: [...canvas.nodes, node] });
  };

  const preview =
    interaction.mode === "connect"
      ? { from: nodeByStep(interaction.from), to: { x: interaction.x, y: interaction.y } }
      : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-400">
          {en
            ? "Drag a node to move · drag its handle (▸) onto another node to connect"
            : "拖动节点移动 · 从节点手柄 (▸) 拖到另一节点建立连接"}
        </span>
        {unplaced.length > 0 && (
          <label className="text-[11px] text-zinc-500">
            <span className="mr-1">{en ? "Add to canvas:" : "添加到画布:"}</span>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) addNode(e.target.value);
              }}
              className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">{en ? "— select step —" : "— 选择步骤 —"}</option>
              {unplaced.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.seq}. {s.name || (en ? "Untitled step" : "未命名步骤")}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div
        ref={containerRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative overflow-auto rounded-md border border-zinc-200 bg-[radial-gradient(circle,theme(colors.zinc.200)_1px,transparent_1px)] [background-size:16px_16px] dark:border-zinc-800 dark:bg-[radial-gradient(circle,theme(colors.zinc.800)_1px,transparent_1px)]"
        style={{ height: CANVAS_H }}
      >
        <div className="relative" style={{ width, height }}>
          <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
            <defs>
              <marker id="fc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className="fill-zinc-400 dark:fill-zinc-500" />
              </marker>
            </defs>
            {canvas.edges.map((edge) => {
              const from = nodeByStep(edge.from);
              const to = nodeByStep(edge.to);
              if (!from || !to) return null;
              const a = centerOf(from);
              const b = centerOf(to);
              return (
                <line
                  key={edge.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  markerEnd="url(#fc-arrow)"
                  className="stroke-zinc-400 dark:stroke-zinc-500"
                  strokeWidth={1.5}
                />
              );
            })}
            {preview?.from && (
              <line
                x1={centerOf(preview.from).x}
                y1={centerOf(preview.from).y}
                x2={preview.to.x}
                y2={preview.to.y}
                className="stroke-indigo-400"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            )}
          </svg>

          {/* Edge delete buttons at midpoints */}
          {canvas.edges.map((edge) => {
            const from = nodeByStep(edge.from);
            const to = nodeByStep(edge.to);
            if (!from || !to) return null;
            const a = centerOf(from);
            const b = centerOf(to);
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            return (
              <button
                key={edge.id}
                type="button"
                onClick={() => removeEdge(edge.id)}
                style={{ left: mid.x - 8, top: mid.y - 8 }}
                className="absolute flex h-4 w-4 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-500 shadow-sm hover:border-rose-300 hover:text-rose-600 dark:border-zinc-600 dark:bg-zinc-900"
                title={en ? "Remove connection" : "删除连接"}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            );
          })}

          {/* Nodes */}
          {canvas.nodes.map((node) => {
            const step = stepById(node.stepId);
            if (!step) return null;
            const archetype = step.archetype ? archetypes.find((a) => a.id === step.archetype) : undefined;
            const dragging = interaction.mode === "move" && interaction.stepId === node.stepId;
            return (
              <div
                key={node.stepId}
                onPointerDown={(e) => startMove(e, node)}
                style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
                className={cn(
                  "absolute flex cursor-grab touch-none select-none flex-col justify-center rounded-lg border bg-white px-3 py-2 shadow-sm active:cursor-grabbing dark:bg-zinc-900",
                  dragging
                    ? "border-indigo-400 ring-2 ring-indigo-200 dark:border-indigo-600 dark:ring-indigo-900"
                    : "border-zinc-200 dark:border-zinc-700",
                )}
              >
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {archetype && <span>{archetype.icon}</span>}
                  <span className="truncate">
                    {step.name || (en ? "Untitled step" : "未命名步骤")}
                  </span>
                </div>
                <span className="mt-0.5 text-[10px] text-zinc-400">
                  {en ? "Step" : "步骤"} {step.seq}
                </span>

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => removeNode(node.stepId)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-500 shadow-sm hover:border-rose-300 hover:text-rose-600 dark:border-zinc-600 dark:bg-zinc-900"
                  title={en ? "Remove from canvas" : "从画布移除"}
                >
                  <X className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  onPointerDown={(e) => startConnect(e, node)}
                  className="absolute -right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 cursor-crosshair items-center justify-center rounded-full border border-indigo-300 bg-white text-[9px] font-bold text-indigo-600 shadow-sm hover:bg-indigo-50 dark:border-indigo-700 dark:bg-zinc-900 dark:text-indigo-300"
                  title={en ? "Drag to connect" : "拖动以连接"}
                >
                  ▸
                </button>
              </div>
            );
          })}

          {canvas.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-zinc-400">
                {en ? "No steps on the canvas. Add one above." : "画布上暂无步骤,请在上方添加。"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
