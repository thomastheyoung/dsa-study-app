import { useState, useEffect } from 'react';

const CELL_W = 48;
const CELL_H = 36;
const GAP = 4;

const values = [1, 2, 3, -1, 2];
const K = 5;
const prefixes = [0, 1, 3, 6, 5, 7];

const steps: { scan: number; highlight: [number, number] | null }[] = [
  { scan: 0, highlight: null },
  { scan: 1, highlight: null },
  { scan: 2, highlight: [1, 2] }, // prefix 6 - 5 = 1, found at i=0 → subarray [1..2]
  { scan: 3, highlight: [0, 3] }, // prefix 5 - 5 = 0, found at i=-1 → subarray [0..3]
  { scan: 4, highlight: null },
];

export function PrefixSumViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 7), 1200);
    return () => clearInterval(id);
  }, []);

  const state = steps[Math.min(step, steps.length - 1)];
  const totalW = values.length * (CELL_W + GAP) - GAP;
  const done = step >= 5;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-400 font-mono">
        subarrays summing to K={K}&nbsp;|&nbsp;
        {done
          ? `found ${steps.filter((s) => s.highlight).length} subarrays`
          : `prefix = ${prefixes[state.scan + 1]}, need ${prefixes[state.scan + 1] - K}`}
      </p>

      <svg
        viewBox={`0 0 ${totalW + 20} 108`}
        className="w-full max-w-sm"
        role="img"
        aria-label="Prefix sum + hashmap visualization"
      >
        {/* Array row */}
        {values.map((val, i) => {
          const x = 10 + i * (CELL_W + GAP);
          const isScanning = !done && i === state.scan;
          const inHighlight =
            state.highlight &&
            i >= state.highlight[0] &&
            i <= state.highlight[1];

          return (
            <g key={`val-${i}`}>
              {isScanning && (
                <text
                  x={x + CELL_W / 2}
                  y={8}
                  textAnchor="middle"
                  className="text-[10px] fill-tech font-mono font-bold"
                >
                  ▼
                </text>
              )}
              <rect
                x={x}
                y={14}
                width={CELL_W}
                height={CELL_H}
                rx={5}
                className={`transition-all duration-300 ${
                  inHighlight
                    ? 'fill-algo/25 stroke-algo'
                    : isScanning
                      ? 'fill-tech/20 stroke-tech'
                      : 'fill-slate-100 stroke-slate-300'
                }`}
                strokeWidth={isScanning || inHighlight ? 2 : 1}
              />
              <text
                x={x + CELL_W / 2}
                y={14 + CELL_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-mono ${
                  inHighlight
                    ? 'fill-algo font-bold'
                    : isScanning
                      ? 'fill-tech'
                      : 'fill-slate-600'
                }`}
              >
                {val}
              </text>
              <text
                x={x + CELL_W / 2}
                y={14 + CELL_H + 12}
                textAnchor="middle"
                className="text-[9px] fill-slate-400 font-mono"
              >
                {i}
              </text>
            </g>
          );
        })}

        {/* Subarray sum annotation */}
        {state.highlight && (
          <rect
            x={10 + state.highlight[0] * (CELL_W + GAP) - 3}
            y={11}
            width={
              (state.highlight[1] - state.highlight[0] + 1) * (CELL_W + GAP) -
              GAP +
              6
            }
            height={CELL_H + 6}
            rx={8}
            className="fill-none stroke-algo/40"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}

        {/* Prefix sum row */}
        <text
          x={10}
          y={82}
          className="text-[9px] fill-slate-400 font-mono"
        >
          prefix:
        </text>
        {values.map((_, i) => {
          const x = 10 + i * (CELL_W + GAP);
          const isComputed = done || i <= state.scan;

          return (
            <g key={`pfx-${i}`}>
              <rect
                x={x}
                y={86}
                width={CELL_W}
                height={16}
                rx={3}
                className={`transition-all duration-300 ${
                  isComputed
                    ? 'fill-tech/8 stroke-tech/30'
                    : 'fill-slate-50 stroke-slate-200'
                }`}
                strokeWidth={0.5}
              />
              <text
                x={x + CELL_W / 2}
                y={94 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[9px] font-mono ${isComputed ? 'fill-tech' : 'fill-slate-300'}`}
              >
                {isComputed ? prefixes[i + 1] : '·'}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-tech mr-1" />
          Scanning
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-algo mr-1" />
          Subarray = K
        </span>
      </div>
    </div>
  );
}
