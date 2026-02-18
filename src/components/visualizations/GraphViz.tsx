import { useState, useEffect } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
}

interface Edge {
  from: number;
  to: number;
}

const graphNodes: Node[] = [
  { id: 'A', x: 100, y: 30 },
  { id: 'B', x: 40, y: 100 },
  { id: 'C', x: 160, y: 100 },
  { id: 'D', x: 70, y: 170 },
  { id: 'E', x: 190, y: 170 },
  { id: 'F', x: 130, y: 170 },
];

const edges: Edge[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 1, to: 5 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
];

// BFS order from node A
const bfsOrder = [0, 1, 2, 3, 5, 4];

const RADIUS = 18;

export function GraphViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % (bfsOrder.length + 2));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const visitedSet = new Set(bfsOrder.slice(0, step));
  const currentNode = step > 0 && step <= bfsOrder.length ? bfsOrder[step - 1] : -1;

  // Determine which edges are "discovered"
  const activeEdges = new Set<string>();
  for (const edge of edges) {
    if (visitedSet.has(edge.from) && visitedSet.has(edge.to)) {
      activeEdges.add(`${edge.from}-${edge.to}`);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 230 200" className="w-full max-w-xs" role="img" aria-label="Graph traversal visualization">
        {/* Edges */}
        {edges.map((edge) => {
          const from = graphNodes[edge.from];
          const to = graphNodes[edge.to];
          const isActive = activeEdges.has(`${edge.from}-${edge.to}`);

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={`transition-all duration-300 ${
                isActive ? 'stroke-ds/60' : 'stroke-slate-200'
              }`}
              strokeWidth={1.5}
            />
          );
        })}

        {/* Nodes */}
        {graphNodes.map((node, i) => {
          const isCurrent = i === currentNode;
          const isVisited = visitedSet.has(i);

          return (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r={RADIUS}
                className={`transition-all duration-300 ${
                  isCurrent
                    ? 'fill-ds/20 stroke-ds'
                    : isVisited
                      ? 'fill-ds/10 stroke-ds/50'
                      : 'fill-slate-100 stroke-slate-300'
                }`}
                strokeWidth={isCurrent ? 2 : 1}
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs font-mono font-bold transition-colors duration-300 ${
                  isCurrent
                    ? 'fill-ds'
                    : isVisited
                      ? 'fill-ds/70'
                      : 'fill-slate-500'
                }`}
              >
                {node.id}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-ds mr-1" />
          BFS traversal
        </span>
        <span className="font-mono text-slate-400">
          Queue: [{bfsOrder
            .slice(0, Math.max(0, step))
            .map((i) => graphNodes[i].id)
            .join(' → ')}]
        </span>
      </div>
    </div>
  );
}
