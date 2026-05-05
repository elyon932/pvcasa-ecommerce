"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { DashboardMetrics } from "@/types/store";

type RevenueScale = NonNullable<DashboardMetrics["revenueScales"]>[number];

function buildLinePoints(series: RevenueScale["series"]) {
  const max = Math.max(...series.map((item) => item.revenueInCents), 1);

  return series.map((item, index) => ({
    ...item,
    x: series.length > 1 ? (index / (series.length - 1)) * 100 : 50,
    y: 88 - (item.revenueInCents / max) * 76,
  }));
}

function getVisibleIndexes(length: number, range: RevenueScale["range"]) {
  if (length <= 7) {
    return Array.from({ length }, (_, index) => index);
  }

  const targetCount = range === 365 ? 7 : 6;
  return Array.from({ length: targetCount }, (_, index) =>
    Math.round((index / (targetCount - 1)) * (length - 1)),
  );
}

export function RevenueLineChart({
  scales,
  initialRange = 7,
}: {
  scales: RevenueScale[];
  initialRange?: RevenueScale["range"];
}) {
  const [selectedRange, setSelectedRange] = useState<RevenueScale["range"]>(initialRange);
  const selectedScale = scales.find((scale) => scale.range === selectedRange) ?? scales[0];
  const points = useMemo(() => buildLinePoints(selectedScale.series), [selectedScale]);
  const path =
    points.length > 1
      ? `M ${points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" L ")}`
      : "M 0,88 L 100,88";
  const visibleIndexes = getVisibleIndexes(points.length, selectedScale.range);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--copper)]">
            Gráfico de receita
          </p>
          <h2 className="mt-2 font-serif text-[clamp(1.65rem,3vw,2rem)] text-[color:var(--wood-dark)]">
            Receita por período
          </h2>
        </div>
        <div className="inline-flex max-w-full flex-wrap gap-2 rounded-full bg-[color:var(--surface)] p-1">
          {scales.map((scale) => (
            <button
              key={scale.range}
              type="button"
              onClick={() => setSelectedRange(scale.range)}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                selectedRange === scale.range
                  ? "bg-white text-[color:var(--wood-dark)] shadow-sm"
                  : "text-[color:var(--muted-foreground)] hover:text-[color:var(--wood-dark)]"
              }`}
            >
              {scale.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-1 flex-col rounded-[1.5rem] bg-[color:var(--surface)] p-4 sm:p-5">
        <div className="relative min-h-64 flex-1">
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label="Evolução da receita no período selecionado"
            className="absolute inset-0 size-full overflow-visible"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,88 L 100,88"
              fill="none"
              stroke="rgba(107,91,81,0.18)"
              strokeWidth="0.7"
            />
            <path
              d={path}
              fill="none"
              stroke="var(--copper)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.4"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className="relative mt-4 h-10 text-[11px] font-medium text-[color:var(--muted-foreground)]">
          {visibleIndexes.map((pointIndex) => {
            const point = points[pointIndex];

            return (
              <div
                key={`${point.dateKey ?? point.label}-${pointIndex}`}
                className="absolute top-0 w-20 -translate-x-1/2 text-center first:translate-x-0 first:text-left last:-translate-x-full last:text-right"
                style={{ left: `${point.x}%` }}
              >
                <p className="truncate">{point.label}</p>
                <p className="mt-1 truncate text-[color:var(--wood-dark)]">
                  {formatCurrency(point.revenueInCents)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
