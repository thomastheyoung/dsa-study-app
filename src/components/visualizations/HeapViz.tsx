import { useState, useEffect } from 'react';

const RADIUS = 16;

// Min-heap: [1, 3, 2, 7, 6, 4, 5]
// Positions for a complete binary tree
const heapData = [
  { val: 1, x: 150, y: 25 },
  { val: 3, x: 80, y: 75 },
  { val: 2, x: 220, y: 75 },
  { val: 7, x: 45, y: 125 },
  { val: 6, x: 115, y: 125 },
  { val: 4, x: 185, y: 125 },
  { val: 5, x: 255, y: 125 },
];

function parentIdx(i: number) {
  return Math.floor((i - 1) / 2);
}

export function HeapViz() {
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [highlightParent, setHighlightParent] = useState(-1);

  useEffect(() => {
    const sequence = [6, 5, 4, 3, 2, 1, 0]; // Bottom-up highlight
    let step = 0;
    const interval = setInterval(() => {
      const idx = sequence[step % sequence.length];
      setHighlightIdx(idx);
      setHighlightParent(idx > 0 ? parentIdx(idx) : -1);
      step++;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 300 160" className="w-full max-w-sm" role="img" aria-label="Min-heap tree visualization">
        {/* Edges */}
        {heapData.map((_, i) => {
          if (i === 0) return null;
          const parent = heapData[parentIdx(i)];
          const child = heapData[i];
          const isHighlighted =
            (i === highlightIdx && parentIdx(i) === highlightParent) ||
            (parentIdx(i) === highlightIdx);
          return (
            <line
              key={`edge-${i}`}
              x1={parent.x}
              y1={parent.y + RADIUS}
              x2={child.x}
              y2={child.y - RADIUS}
              className={`transition-all duration-300 ${
                isHighlighted ? 'stroke-algo/60' : 'stroke-slate-200'
              }`}
              strokeWidth={1.5}
            />
          );
        })}

        {/* Nodes */}
        {heapData.map((node, i) => {
          const isActive = i === highlightIdx;
          const isParent = i === highlightParent;
          return (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r={RADIUS}
                className={`transition-all duration-300 ${
                  isActive
                    ? 'fill-algo/15 stroke-algo'
                    : isParent
                      ? 'fill-algo/10 stroke-algo/60'
                      : 'fill-slate-100 stroke-slate-300'
                }`}
                strokeWidth={isActive || isParent ? 2 : 1}
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs font-mono font-medium transition-colors duration-300 ${
                  isActive
                    ? 'fill-algo'
                    : isParent
                      ? 'fill-algo/70'
                      : 'fill-slate-500'
                }`}
              >
                {node.val}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-col items-center gap-1 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-algo mr-1" />
          Min-heap — parent ≤ children
        </span>
        <span className="font-mono text-slate-400">
          Array: [{heapData.map((n) => n.val).join(', ')}]
        </span>
      </div>
    </div>
  );
}
