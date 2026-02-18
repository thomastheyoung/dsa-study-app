import { useState, useEffect } from 'react';

const R = 15;

const nodes = [
  { id: 1, x: 30, y: 42 },
  { id: 2, x: 85, y: 42 },
  { id: 3, x: 140, y: 42 },
  { id: 4, x: 195, y: 42 },
  { id: 5, x: 250, y: 42 },
  { id: 6, x: 305, y: 42 },
];

const cycleNodes = new Set([3, 4, 5, 6]);

const frames = [
  { slow: 1, fast: 1, label: 'Both start at node 1' },
  { slow: 2, fast: 3, label: 'Slow +1, fast +2' },
  { slow: 3, fast: 5, label: 'Slow +1, fast +2' },
  { slow: 4, fast: 3, label: 'Fast wraps around' },
  { slow: 5, fast: 5, label: 'Met! Cycle exists' },
  { slow: 1, fast: 5, label: 'Reset slow to head' },
  { slow: 2, fast: 6, label: 'Both move +1 now' },
  { slow: 3, fast: 3, label: 'Cycle entry = node 3' },
];

const nodeMap = new Map(nodes.map((n) => [n.id, n]));

export function FastSlowViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 10), 1200);
    return () => clearInterval(id);
  }, []);

  const frame = frames[Math.min(step, frames.length - 1)];

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-400 font-mono">
        Floyd's cycle detection&nbsp;|&nbsp;{frame.label}
      </p>

      <svg
        viewBox="0 0 340 108"
        className="w-full max-w-md"
        role="img"
        aria-label="Fast/slow pointer cycle detection visualization"
      >
        <defs>
          <marker
            id="fsp-arr"
            markerWidth="7"
            markerHeight="5"
            refX="7"
            refY="2.5"
            orient="auto"
          >
            <path d="M 0 0 L 7 2.5 L 0 5 Z" className="fill-slate-300" />
          </marker>
          <marker
            id="fsp-cyc"
            markerWidth="7"
            markerHeight="5"
            refX="7"
            refY="2.5"
            orient="auto"
          >
            <path d="M 0 0 L 7 2.5 L 0 5 Z" className="fill-slate-400" />
          </marker>
        </defs>

        {/* Forward edges 1→2→3→4→5→6 */}
        {[1, 2, 3, 4, 5].map((from) => {
          const f = nodeMap.get(from)!;
          const t = nodeMap.get(from + 1)!;
          return (
            <line
              key={from}
              x1={f.x + R + 2}
              y1={f.y}
              x2={t.x - R - 2}
              y2={t.y}
              className="stroke-slate-300"
              strokeWidth={1.5}
              markerEnd="url(#fsp-arr)"
            />
          );
        })}

        {/* Back edge 6→3 (curved below) */}
        <path
          d={`M ${nodes[5].x} ${nodes[5].y + R + 2} Q ${(nodes[5].x + nodes[2].x) / 2} ${nodes[5].y + R + 40} ${nodes[2].x} ${nodes[2].y + R + 2}`}
          fill="none"
          className="stroke-slate-400"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd="url(#fsp-cyc)"
        />

        {/* Nodes */}
        {nodes.map((n) => {
          const isSlow = frame.slow === n.id;
          const isFast = frame.fast === n.id;
          const isBoth = isSlow && isFast;
          const isCycle = cycleNodes.has(n.id);

          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={R}
                className={`transition-all duration-500 ${
                  isBoth
                    ? 'fill-bigo/20 stroke-bigo'
                    : isSlow
                      ? 'fill-algo/20 stroke-algo'
                      : isFast
                        ? 'fill-tech/20 stroke-tech'
                        : isCycle
                          ? 'fill-slate-50 stroke-slate-400'
                          : 'fill-white stroke-slate-300'
                }`}
                strokeWidth={isSlow || isFast ? 2 : isCycle ? 1.5 : 1}
              />
              <text
                x={n.x}
                y={n.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[11px] font-mono ${
                  isBoth
                    ? 'fill-bigo font-bold'
                    : isSlow
                      ? 'fill-algo font-bold'
                      : isFast
                        ? 'fill-tech font-bold'
                        : 'fill-slate-500'
                }`}
              >
                {n.id}
              </text>
              {isBoth && (
                <text
                  x={n.x}
                  y={n.y - R - 5}
                  textAnchor="middle"
                  className="text-[8px] fill-bigo font-mono font-bold"
                >
                  S+F
                </text>
              )}
              {isSlow && !isBoth && (
                <text
                  x={n.x}
                  y={n.y - R - 5}
                  textAnchor="middle"
                  className="text-[8px] fill-algo font-mono font-bold"
                >
                  S
                </text>
              )}
              {isFast && !isBoth && (
                <text
                  x={n.x}
                  y={n.y - R - 5}
                  textAnchor="middle"
                  className="text-[8px] fill-tech font-mono font-bold"
                >
                  F
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="text-algo font-mono font-bold mr-1">S</span>Slow
          (+1)
        </span>
        <span>
          <span className="text-tech font-mono font-bold mr-1">F</span>Fast
          (+2)
        </span>
        <span>
          <span className="text-bigo font-mono font-bold mr-1">S+F</span>Meet
        </span>
      </div>
    </div>
  );
}
