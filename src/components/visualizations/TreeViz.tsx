import { useState, useEffect } from 'react';

interface TreeNode {
  val: number;
  x: number;
  y: number;
  left?: number;
  right?: number;
}

const RADIUS = 18;

// Pre-computed BST layout: [8, 4, 12, 2, 6, 10, 14]
const nodes: TreeNode[] = [
  { val: 8, x: 200, y: 30, left: 1, right: 2 },
  { val: 4, x: 110, y: 90, left: 3, right: 4 },
  { val: 12, x: 290, y: 90, left: 5, right: 6 },
  { val: 2, x: 65, y: 150 },
  { val: 6, x: 155, y: 150 },
  { val: 10, x: 245, y: 150 },
  { val: 14, x: 335, y: 150 },
];

// DFS preorder traversal order
const traversalOrder = [0, 1, 3, 4, 2, 5, 6];

export function TreeViz() {
  const [visitedIndex, setVisitedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitedIndex((prev) => (prev + 1) % (traversalOrder.length + 2));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const visitedSet = new Set(
    traversalOrder.slice(0, visitedIndex)
  );
  const currentNode =
    visitedIndex > 0 && visitedIndex <= traversalOrder.length
      ? traversalOrder[visitedIndex - 1]
      : -1;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 400 185" className="w-full max-w-md" role="img" aria-label="Binary search tree visualization">
        {/* Edges */}
        {nodes.map((node, i) =>
          [node.left, node.right]
            .filter((c): c is number => c !== undefined)
            .map((childIdx) => (
              <line
                key={`${i}-${childIdx}`}
                x1={node.x}
                y1={node.y + RADIUS}
                x2={nodes[childIdx].x}
                y2={nodes[childIdx].y - RADIUS}
                className={`transition-all duration-300 ${
                  visitedSet.has(i) && visitedSet.has(childIdx)
                    ? 'stroke-algo/60'
                    : 'stroke-slate-200'
                }`}
                strokeWidth={1.5}
              />
            ))
        )}

        {/* Nodes */}
        {nodes.map((node, i) => {
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
                    ? 'fill-algo/20 stroke-algo'
                    : isVisited
                      ? 'fill-algo/10 stroke-algo/50'
                      : 'fill-slate-100 stroke-slate-300'
                }`}
                strokeWidth={isCurrent ? 2 : 1}
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs font-mono font-medium transition-colors duration-300 ${
                  isCurrent
                    ? 'fill-algo'
                    : isVisited
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

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-algo mr-1" />
          DFS preorder traversal
        </span>
        <span className="font-mono text-slate-400">
          [{traversalOrder
            .slice(0, Math.max(0, visitedIndex))
            .map((i) => nodes[i].val)
            .join(' → ')}
          ]
        </span>
      </div>
    </div>
  );
}
