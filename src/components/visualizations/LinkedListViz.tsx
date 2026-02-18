import { useState, useEffect } from 'react';

const NODE_WIDTH = 48;
const NODE_HEIGHT = 32;
const GAP = 28;
const ARROW_LEN = GAP - 4;

export function LinkedListViz() {
  const values = [3, 7, 1, 9, 4];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % (values.length + 1));
    }, 900);
    return () => clearInterval(interval);
  }, [values.length]);

  const totalWidth = values.length * (NODE_WIDTH + GAP) - GAP + 60;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${totalWidth} 70`} className="w-full max-w-lg" role="img" aria-label="Linked list traversal visualization">
        {/* Head label */}
        <text x={10} y={15} className="text-[10px] fill-slate-400 font-mono">
          head
        </text>
        <line
          x1={24}
          y1={18}
          x2={24}
          y2={28}
          className="stroke-slate-400"
          strokeWidth={1}
          markerEnd="url(#arrowhead)"
        />

        {values.map((val, i) => {
          const x = 10 + i * (NODE_WIDTH + GAP);
          const y = 30;
          const isCurrent = i === currentIdx;
          const isVisited = i < currentIdx;

          return (
            <g key={i}>
              {/* Node box */}
              <rect
                x={x}
                y={y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={6}
                className={`transition-all duration-300 ${
                  isCurrent
                    ? 'fill-ds/15 stroke-ds'
                    : isVisited
                      ? 'fill-ds/8 stroke-ds/40'
                      : 'fill-slate-100 stroke-slate-300'
                }`}
                strokeWidth={isCurrent ? 2 : 1}
              />
              {/* Value */}
              <text
                x={x + NODE_WIDTH / 2}
                y={y + NODE_HEIGHT / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs font-mono font-medium transition-colors duration-300 ${
                  isCurrent ? 'fill-ds' : isVisited ? 'fill-ds/60' : 'fill-slate-500'
                }`}
              >
                {val}
              </text>

              {/* Arrow to next node */}
              {i < values.length - 1 && (
                <g>
                  <line
                    x1={x + NODE_WIDTH + 2}
                    y1={y + NODE_HEIGHT / 2}
                    x2={x + NODE_WIDTH + ARROW_LEN}
                    y2={y + NODE_HEIGHT / 2}
                    className={`transition-colors duration-300 ${
                      isVisited ? 'stroke-ds/40' : 'stroke-slate-300'
                    }`}
                    strokeWidth={1.5}
                  />
                  <polygon
                    points={`${x + NODE_WIDTH + ARROW_LEN - 5},${y + NODE_HEIGHT / 2 - 3} ${x + NODE_WIDTH + ARROW_LEN},${y + NODE_HEIGHT / 2} ${x + NODE_WIDTH + ARROW_LEN - 5},${y + NODE_HEIGHT / 2 + 3}`}
                    className={`transition-colors duration-300 ${
                      isVisited ? 'fill-ds/40' : 'fill-slate-300'
                    }`}
                  />
                </g>
              )}

              {/* Null pointer for last node */}
              {i === values.length - 1 && (
                <text
                  x={x + NODE_WIDTH + 8}
                  y={y + NODE_HEIGHT / 2 + 1}
                  className="text-[10px] fill-slate-400 font-mono"
                  dominantBaseline="middle"
                >
                  null
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-ds mr-1" />
          Traversal pointer
        </span>
        <span className="font-mono text-slate-400">
          node {currentIdx < values.length ? `→ ${values[currentIdx]}` : '→ null'}
        </span>
      </div>
    </div>
  );
}
