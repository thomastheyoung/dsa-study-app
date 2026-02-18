import { useState, useEffect } from 'react';

const CELL_WIDTH = 56;
const CELL_HEIGHT = 40;
const GAP = 4;
const WINDOW_SIZE = 3;

export function SlidingWindowViz() {
  const values = [2, 5, 1, 8, 3, 7, 4, 6];
  const maxStart = values.length - WINDOW_SIZE;
  const [windowStart, setWindowStart] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWindowStart((prev) => (prev >= maxStart ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [maxStart]);

  const windowEnd = windowStart + WINDOW_SIZE - 1;
  const windowSum = values
    .slice(windowStart, windowStart + WINDOW_SIZE)
    .reduce((a, b) => a + b, 0);

  const totalWidth = values.length * (CELL_WIDTH + GAP) - GAP;
  const bracketWidth = WINDOW_SIZE * (CELL_WIDTH + GAP) - GAP + 8;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-400 font-mono">
        window size k = {WINDOW_SIZE} &nbsp;|&nbsp; sum ={' '}
        <span className="text-tech font-bold">{windowSum}</span>
      </p>

      <svg
        viewBox={`0 0 ${totalWidth + 20} ${CELL_HEIGHT + 55}`}
        className="w-full max-w-lg"
        role="img"
        aria-label="Sliding window technique visualization"
      >
        {/* Sliding window bracket */}
        <g
          style={{
            transform: `translateX(${windowStart * (CELL_WIDTH + GAP)}px)`,
            transition: 'transform 700ms ease',
          }}
        >
          <rect
            x={6}
            y={4}
            width={bracketWidth}
            height={CELL_HEIGHT + 12}
            rx={8}
            className="fill-tech/8 stroke-tech/40"
            strokeWidth={1.5}
            strokeDasharray="6 3"
          />
        </g>

        {values.map((val, i) => {
          const x = 10 + i * (CELL_WIDTH + GAP);
          const inWindow = i >= windowStart && i <= windowEnd;
          const isLeft = i === windowStart;
          const isRight = i === windowEnd;

          return (
            <g key={i}>
              <rect
                x={x}
                y={10}
                width={CELL_WIDTH}
                height={CELL_HEIGHT}
                rx={6}
                className={`transition-all duration-300 ${
                  inWindow
                    ? 'fill-tech/20 stroke-tech'
                    : 'fill-slate-100 stroke-slate-300'
                }`}
                strokeWidth={inWindow ? 2 : 1}
              />
              <text
                x={x + CELL_WIDTH / 2}
                y={10 + CELL_HEIGHT / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-mono transition-colors duration-300 ${
                  inWindow ? 'fill-tech' : 'fill-slate-600'
                }`}
              >
                {val}
              </text>
              <text
                x={x + CELL_WIDTH / 2}
                y={10 + CELL_HEIGHT + 14}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-mono"
              >
                {i}
              </text>

              {isLeft && (
                <text
                  x={x + CELL_WIDTH / 2}
                  y={10 + CELL_HEIGHT + 28}
                  textAnchor="middle"
                  className="text-[10px] fill-algo font-mono font-bold"
                >
                  L
                </text>
              )}
              {isRight && (
                <text
                  x={x + CELL_WIDTH / 2}
                  y={10 + CELL_HEIGHT + 28}
                  textAnchor="middle"
                  className="text-[10px] fill-tech font-mono font-bold"
                >
                  R
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-tech mr-1" />
          Window (k={WINDOW_SIZE})
        </span>
        <span>
          <span className="text-algo font-mono font-bold mr-1">L</span>
          <span className="text-tech font-mono font-bold mr-1">R</span>
          Boundaries
        </span>
      </div>
    </div>
  );
}
