import { useState, useEffect } from 'react';
import { complexities, strokeColors, bgColors } from '../../content/big-o';

const W = 700;
const H = 400;
const PAD = { top: 20, right: 20, bottom: 40, left: 55 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const MAX_N = 30;
const X_TICKS = [0, 5, 10, 15, 20, 25, 30];

interface Scale {
  label: string;
  maxOps: number;
  yTicks: number[];
}

const scales: Record<'zoomed' | 'full', Scale> = {
  zoomed: { label: 'Zoomed', maxOps: 60, yTicks: [0, 10, 20, 30, 40, 50, 60] },
  full: { label: 'Full scale', maxOps: 900, yTicks: [0, 200, 400, 600, 800] },
};

function toX(n: number) {
  return PAD.left + (n / MAX_N) * PLOT_W;
}

function toY(ops: number, maxOps: number) {
  return PAD.top + PLOT_H - (Math.min(ops, maxOps) / maxOps) * PLOT_H;
}

function buildPath(mathFn: (n: number) => number, maxOps: number): string {
  const points: string[] = [];
  for (let n = 0; n <= MAX_N; n++) {
    const ops = mathFn(n);
    if (ops > maxOps * 1.1) break;
    const cmd = points.length === 0 ? 'M' : 'L';
    points.push(`${cmd}${toX(n).toFixed(1)},${toY(ops, maxOps).toFixed(1)}`);
  }
  return points.join(' ');
}

export function ComplexityChartViz() {
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'zoomed' | 'full'>('zoomed');

  const scale = scales[view];

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const paths = complexities.map((c) => buildPath(c.mathFn, scale.maxOps));

  return (
    <div className="space-y-3">
      {/* View toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-xs">
          {(Object.keys(scales) as Array<'zoomed' | 'full'>).map((key) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                view === key
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {scales[key].label}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Big O complexity growth rate comparison chart"
        onMouseLeave={() => setActive(null)}
      >
        {/* Grid lines */}
        {scale.yTicks.map((v) => (
          <line
            key={`gy-${v}`}
            x1={PAD.left}
            y1={toY(v, scale.maxOps)}
            x2={W - PAD.right}
            y2={toY(v, scale.maxOps)}
            className="stroke-slate-200"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        ))}
        {X_TICKS.map((v) => (
          <line
            key={`gx-${v}`}
            x1={toX(v)}
            y1={PAD.top}
            x2={toX(v)}
            y2={H - PAD.bottom}
            className="stroke-slate-200"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={H - PAD.bottom}
          className="stroke-slate-300"
          strokeWidth={1.5}
        />
        <line
          x1={PAD.left}
          y1={H - PAD.bottom}
          x2={W - PAD.right}
          y2={H - PAD.bottom}
          className="stroke-slate-300"
          strokeWidth={1.5}
        />

        {/* X-axis labels */}
        {X_TICKS.map((v) => (
          <text
            key={`xl-${v}`}
            x={toX(v)}
            y={H - PAD.bottom + 20}
            textAnchor="middle"
            className="fill-slate-400 text-[11px]"
          >
            {v}
          </text>
        ))}
        <text
          x={PAD.left + PLOT_W / 2}
          y={H - 4}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium"
        >
          Input size (n)
        </text>

        {/* Y-axis labels */}
        {scale.yTicks.map((v) => (
          <text
            key={`yl-${v}`}
            x={PAD.left - 10}
            y={toY(v, scale.maxOps) + 4}
            textAnchor="end"
            className="fill-slate-400 text-[11px]"
          >
            {v}
          </text>
        ))}
        <text
          x={14}
          y={PAD.top + PLOT_H / 2}
          textAnchor="middle"
          className="fill-slate-500 text-xs font-medium"
          transform={`rotate(-90, 14, ${PAD.top + PLOT_H / 2})`}
        >
          Operations
        </text>

        {/* Curves */}
        {paths.map((d, i) => (
          <g key={i}>
            {/* Invisible wide hit area */}
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              className="cursor-pointer"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(active === i ? null : i)}
            />
            {/* Visible path */}
            <path
              d={d}
              fill="none"
              className={`${strokeColors[i]} transition-opacity duration-200`}
              strokeWidth={active === i ? 3.5 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={active === null || active === i ? 1 : 0.15}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={mounted ? 0 : 1}
              style={{
                transition: `stroke-dashoffset 0.8s ease-out ${i * 0.12}s, opacity 0.2s, stroke-width 0.2s`,
              }}
            />
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
        {complexities.map((c, i) => (
          <button
            key={i}
            className={`flex items-center gap-1.5 text-sm transition-opacity duration-200 cursor-pointer ${
              active === null || active === i ? 'opacity-100' : 'opacity-30'
            }`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={() => setActive(active === i ? null : i)}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${bgColors[i]}`} />
            <span className="text-slate-600 font-mono text-xs">{c.notation}</span>
            <span className="text-slate-400 text-xs">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
