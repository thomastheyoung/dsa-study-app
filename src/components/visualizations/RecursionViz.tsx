import { useState, useEffect } from 'react';

const W = 160;
const H = 28;
const GAP = 5;

const calls = [
  { label: 'fact(5)', result: 120 },
  { label: 'fact(4)', result: 24 },
  { label: 'fact(3)', result: 6 },
  { label: 'fact(2)', result: 2 },
  { label: 'fact(1)', result: 1 },
];

export function RecursionViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 12), 900);
    return () => clearInterval(id);
  }, []);

  // 0-4: pushing frames, 5-9: popping with results, 10-11: pause
  const pushing = step <= 4;
  const popping = step >= 5 && step <= 9;
  const visibleCount = pushing ? step + 1 : popping ? 10 - step : 1;
  const returningIdx = popping ? 10 - step - 1 : step >= 10 ? 0 : -1;

  const svgH = calls.length * (H + GAP) + 16;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-400 font-mono">
        call stack&nbsp;|&nbsp;
        {pushing
          ? `calling fact(${5 - step})...`
          : popping
            ? `returning ${calls[returningIdx].result}`
            : `result = 120`}
      </p>

      <svg
        viewBox={`0 0 ${W + 60} ${svgH}`}
        className="w-full max-w-[280px]"
        role="img"
        aria-label="Recursion call stack visualization"
      >
        {calls.map((call, i) => {
          if (i >= visibleCount) return null;
          const x = 10 + i * 6;
          const y = 6 + i * (H + GAP);
          const isReturning = i === returningIdx;
          const isNewFrame = pushing && i === step;
          const isBaseCase = pushing && step === 4 && i === 4;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={W}
                height={H}
                rx={5}
                className={`transition-all duration-300 ${
                  isReturning
                    ? 'fill-algo/20 stroke-algo'
                    : isBaseCase
                      ? 'fill-tech/30 stroke-tech'
                      : isNewFrame
                        ? 'fill-tech/20 stroke-tech'
                        : 'fill-slate-100 stroke-slate-300'
                }`}
                strokeWidth={
                  isReturning || isNewFrame || isBaseCase ? 1.5 : 1
                }
              />
              <text
                x={x + 10}
                y={y + H / 2 + 1}
                dominantBaseline="middle"
                className={`text-[11px] font-mono ${
                  isReturning
                    ? 'fill-algo font-bold'
                    : isNewFrame || isBaseCase
                      ? 'fill-tech'
                      : 'fill-slate-500'
                }`}
              >
                {isReturning
                  ? `${call.label} → ${call.result}`
                  : call.label}
              </text>
              {isBaseCase && (
                <text
                  x={x + W - 10}
                  y={y + H / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-[9px] fill-tech/60 font-mono"
                >
                  base
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-tech mr-1" />
          Push (call)
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-algo mr-1" />
          Pop (return)
        </span>
      </div>
    </div>
  );
}
