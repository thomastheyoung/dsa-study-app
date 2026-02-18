import { useState, useEffect } from 'react';

const CELL_W = 48;
const CELL_H = 36;
const GAP = 4;

const values = [2, 1, 3, 5, 4];

const states: {
  scan: number;
  stack: number[];
  nge: (number | null)[];
}[] = [
  { scan: 0, stack: [0], nge: [null, null, null, null, null] },
  { scan: 1, stack: [0, 1], nge: [null, null, null, null, null] },
  { scan: 2, stack: [2], nge: [3, 3, null, null, null] },
  { scan: 3, stack: [3], nge: [3, 3, 5, null, null] },
  { scan: 4, stack: [3, 4], nge: [3, 3, 5, null, null] },
  { scan: -1, stack: [], nge: [3, 3, 5, -1, -1] },
];

export function MonotonicStackViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 8), 1200);
    return () => clearInterval(id);
  }, []);

  const state = states[Math.min(step, states.length - 1)];
  const totalW = values.length * (CELL_W + GAP) - GAP;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-400 font-mono">
        next greater element&nbsp;|&nbsp;decreasing stack
      </p>

      <svg
        viewBox={`0 0 ${totalW + 20} 158`}
        className="w-full max-w-sm"
        role="img"
        aria-label="Monotonic stack visualization"
      >
        {/* Array row */}
        {values.map((val, i) => {
          const x = 10 + i * (CELL_W + GAP);
          const inStack = state.stack.includes(i);
          const isScanning = i === state.scan;

          return (
            <g key={`arr-${i}`}>
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
                  isScanning
                    ? 'fill-tech/25 stroke-tech'
                    : inStack
                      ? 'fill-tech/10 stroke-tech/50'
                      : 'fill-slate-100 stroke-slate-300'
                }`}
                strokeWidth={isScanning ? 2 : 1}
              />
              <text
                x={x + CELL_W / 2}
                y={14 + CELL_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-mono ${isScanning ? 'fill-tech font-bold' : 'fill-slate-600'}`}
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Stack */}
        <text x={10} y={72} className="text-[10px] fill-slate-400 font-mono">
          Stack:
        </text>
        {state.stack.length === 0 ? (
          <text
            x={52}
            y={72}
            className="text-[10px] fill-slate-300 font-mono"
          >
            empty
          </text>
        ) : (
          state.stack.map((idx, si) => {
            const x = 52 + si * 41;
            return (
              <g key={`stk-${si}`}>
                <rect
                  x={x}
                  y={60}
                  width={38}
                  height={24}
                  rx={4}
                  className="fill-tech/15 stroke-tech/40 transition-all duration-300"
                  strokeWidth={1}
                />
                <text
                  x={x + 19}
                  y={72 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[11px] fill-tech font-mono"
                >
                  {values[idx]}
                </text>
              </g>
            );
          })
        )}

        {/* NGE result row */}
        <text x={10} y={106} className="text-[10px] fill-slate-400 font-mono">
          NGE:
        </text>
        {values.map((_, i) => {
          const x = 10 + i * (CELL_W + GAP);
          const nge = state.nge[i];
          const hasAnswer = nge !== null;

          return (
            <g key={`nge-${i}`}>
              <rect
                x={x}
                y={112}
                width={CELL_W}
                height={28}
                rx={5}
                className={`transition-all duration-300 ${
                  hasAnswer && nge !== -1
                    ? 'fill-algo/15 stroke-algo/50'
                    : hasAnswer
                      ? 'fill-slate-50 stroke-slate-200'
                      : 'fill-slate-50 stroke-slate-200'
                }`}
                strokeWidth={1}
                strokeDasharray={hasAnswer ? undefined : '3 3'}
              />
              <text
                x={x + CELL_W / 2}
                y={126 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[11px] font-mono ${
                  hasAnswer && nge !== -1
                    ? 'fill-algo'
                    : hasAnswer
                      ? 'fill-slate-400'
                      : 'fill-slate-300'
                }`}
              >
                {hasAnswer ? (nge === -1 ? '—' : nge) : '·'}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-tech mr-1" />
          Scanning / on stack
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-algo mr-1" />
          Answer found
        </span>
      </div>
    </div>
  );
}
