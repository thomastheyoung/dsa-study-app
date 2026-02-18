import { useState, useEffect } from 'react';

const CELL_WIDTH = 56;
const CELL_HEIGHT = 40;
const GAP = 4;

export function ArrayViz() {
  const values = [3, 7, 1, 9, 4, 6, 2, 8];
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pointerLeft, setPointerLeft] = useState(0);
  const [pointerRight, setPointerRight] = useState(values.length - 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % values.length);
    }, 800);
    return () => clearInterval(interval);
  }, [values.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPointerLeft((prev) => {
        if (prev >= Math.floor(values.length / 2) - 1) return 0;
        return prev + 1;
      });
      setPointerRight((prev) => {
        if (prev <= Math.ceil(values.length / 2)) return values.length - 1;
        return prev - 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [values.length]);

  const totalWidth = values.length * (CELL_WIDTH + GAP) - GAP;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-400 font-mono">
        index: [{values.map((_, i) => i).join(', ')}]
      </p>

      <svg
        viewBox={`0 0 ${totalWidth + 20} ${CELL_HEIGHT + 50}`}
        className="w-full max-w-lg"
        role="img"
        aria-label="Array data structure visualization"
      >
        {values.map((val, i) => {
          const x = 10 + i * (CELL_WIDTH + GAP);
          const isActive = i === activeIndex;
          const isLeft = i === pointerLeft;
          const isRight = i === pointerRight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={10}
                width={CELL_WIDTH}
                height={CELL_HEIGHT}
                rx={6}
                className={`transition-all duration-300 ${
                  isActive
                    ? 'fill-ds/20 stroke-ds'
                    : 'fill-slate-100 stroke-slate-300'
                }`}
                strokeWidth={isActive ? 2 : 1}
              />
              <text
                x={x + CELL_WIDTH / 2}
                y={10 + CELL_HEIGHT / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-mono transition-colors duration-300 ${
                  isActive ? 'fill-ds' : 'fill-slate-600'
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

              {/* Two pointer indicators */}
              {isLeft && (
                <text
                  x={x + CELL_WIDTH / 2}
                  y={8}
                  textAnchor="middle"
                  className="text-[10px] fill-algo font-mono font-bold"
                >
                  L
                </text>
              )}
              {isRight && (
                <text
                  x={x + CELL_WIDTH / 2}
                  y={8}
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
          <span className="inline-block w-2 h-2 rounded-full bg-ds mr-1" />
          Sequential access
        </span>
        <span>
          <span className="text-algo font-mono font-bold mr-1">L</span>
          <span className="text-tech font-mono font-bold mr-1">R</span>
          Two pointers
        </span>
      </div>
    </div>
  );
}
