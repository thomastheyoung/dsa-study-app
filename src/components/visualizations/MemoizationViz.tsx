import { useState, useEffect } from 'react';

const CELL_W = 52;
const CELL_H = 40;
const GAP = 4;

const fibs = [0, 1, 1, 2, 3, 5, 8];
const deps: number[][] = [[], [], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];

export function MemoizationViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 9), 1000);
    return () => clearInterval(id);
  }, []);

  // step 0-6: computing fib(step), step 7-8: pause
  const computing = step <= 6 ? step : -1;
  const computedUpTo = Math.min(step, 6);

  const totalW = fibs.length * (CELL_W + GAP) - GAP;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-400 font-mono">
        fibonacci memoization&nbsp;|&nbsp;
        {computing >= 0
          ? deps[computing].length > 0
            ? `fib(${computing}) = fib(${computing - 2}) + fib(${computing - 1})`
            : `fib(${computing}) = ${fibs[computing]} (base)`
          : 'cache complete'}
      </p>

      <svg
        viewBox={`0 0 ${totalW + 20} ${CELL_H + 56}`}
        className="w-full max-w-lg"
        role="img"
        aria-label="Memoization fibonacci cache visualization"
      >
        {fibs.map((val, i) => {
          const x = 10 + i * (CELL_W + GAP);
          const y = 14;
          const isComputed = i < computedUpTo;
          const isComputing = i === computing;
          const isDep = computing >= 0 && deps[computing].includes(i);

          return (
            <g key={i}>
              {isDep && (
                <text
                  x={x + CELL_W / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="text-[8px] fill-algo font-mono font-bold"
                >
                  cache
                </text>
              )}
              <rect
                x={x}
                y={y}
                width={CELL_W}
                height={CELL_H}
                rx={6}
                className={`transition-all duration-300 ${
                  isComputing
                    ? 'fill-tech/25 stroke-tech'
                    : isDep
                      ? 'fill-algo/20 stroke-algo'
                      : isComputed
                        ? 'fill-tech/10 stroke-tech/50'
                        : 'fill-slate-50 stroke-slate-200'
                }`}
                strokeWidth={isComputing || isDep ? 2 : 1}
              />
              <text
                x={x + CELL_W / 2}
                y={y + CELL_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-mono transition-colors duration-300 ${
                  isComputed || isComputing
                    ? 'fill-tech'
                    : 'fill-slate-300'
                }`}
              >
                {isComputed || isComputing ? val : '?'}
              </text>
              <text
                x={x + CELL_W / 2}
                y={y + CELL_H + 14}
                textAnchor="middle"
                className="text-[9px] fill-slate-400 font-mono"
              >
                fib({i})
              </text>
            </g>
          );
        })}

        {/* Dependency arrows */}
        {computing >= 0 &&
          deps[computing].map((depIdx) => {
            const fromX = 10 + depIdx * (CELL_W + GAP) + CELL_W / 2;
            const toX = 10 + computing * (CELL_W + GAP) + CELL_W / 2;
            const y1 = 14 + CELL_H;
            return (
              <path
                key={depIdx}
                d={`M ${fromX} ${y1} Q ${(fromX + toX) / 2} ${y1 + 16} ${toX} ${y1}`}
                fill="none"
                className="stroke-algo/40"
                strokeWidth={1.5}
                strokeDasharray="3 2"
              />
            );
          })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-tech mr-1" />
          Computing
        </span>
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-algo mr-1" />
          Cache read
        </span>
      </div>
    </div>
  );
}
