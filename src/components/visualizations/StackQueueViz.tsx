import { useState, useEffect } from 'react';

const ITEM_WIDTH = 52;
const ITEM_HEIGHT = 32;

export function StackQueueViz() {
  const [stackItems, setStackItems] = useState([4, 7, 2, 9]);
  const [queueItems, setQueueItems] = useState([3, 1, 8, 5]);
  const [, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => {
        const next = (prev + 1) % 6;
        if (next === 1) {
          setStackItems((s) => [...s, Math.floor(Math.random() * 9) + 1]);
        } else if (next === 3) {
          setStackItems((s) => (s.length > 1 ? s.slice(0, -1) : s));
        } else if (next === 2) {
          setQueueItems((q) => [...q, Math.floor(Math.random() * 9) + 1]);
        } else if (next === 4) {
          setQueueItems((q) => (q.length > 1 ? q.slice(1) : q));
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {/* Stack — vertical, LIFO */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-medium text-tech mb-1">
          Stack (LIFO)
        </div>
        <svg
          viewBox={`0 0 80 ${Math.max(stackItems.length * (ITEM_HEIGHT + 4) + 20, 120)}`}
          className="w-20"
          role="img"
          aria-label="Stack with LIFO operations"
        >
          {stackItems.map((val, i) => {
            const y =
              (stackItems.length - 1 - i) * (ITEM_HEIGHT + 4) + 10;
            const isTop = i === stackItems.length - 1;
            return (
              <g key={`${i}-${val}`}>
                <rect
                  x={10}
                  y={y}
                  width={ITEM_WIDTH}
                  height={ITEM_HEIGHT}
                  rx={4}
                  className={`transition-all duration-300 ${
                    isTop
                      ? 'fill-tech/15 stroke-tech'
                      : 'fill-slate-100 stroke-slate-300'
                  }`}
                  strokeWidth={isTop ? 1.5 : 1}
                />
                <text
                  x={10 + ITEM_WIDTH / 2}
                  y={y + ITEM_HEIGHT / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-xs font-mono ${isTop ? 'fill-tech' : 'fill-slate-500'}`}
                >
                  {val}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="text-[10px] text-slate-400 font-mono">
          push/pop ↑ top
        </div>
      </div>

      {/* Queue — horizontal, FIFO */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-medium text-algo mb-1">
          Queue (FIFO)
        </div>
        <svg
          viewBox={`0 0 ${Math.max(queueItems.length * (ITEM_WIDTH + 4) + 20, 180)} 60`}
          className="w-full max-w-[200px]"
          role="img"
          aria-label="Queue with FIFO operations"
        >
          {queueItems.map((val, i) => {
            const x = 10 + i * (ITEM_WIDTH + 4);
            const isFront = i === 0;
            const isBack = i === queueItems.length - 1;
            return (
              <g key={`${i}-${val}`}>
                <rect
                  x={x}
                  y={10}
                  width={ITEM_WIDTH}
                  height={ITEM_HEIGHT}
                  rx={4}
                  className={`transition-all duration-300 ${
                    isFront
                      ? 'fill-algo/15 stroke-algo'
                      : isBack
                        ? 'fill-algo/8 stroke-algo/50'
                        : 'fill-slate-100 stroke-slate-300'
                  }`}
                  strokeWidth={isFront ? 1.5 : 1}
                />
                <text
                  x={x + ITEM_WIDTH / 2}
                  y={10 + ITEM_HEIGHT / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-xs font-mono ${
                    isFront ? 'fill-algo' : 'fill-slate-500'
                  }`}
                >
                  {val}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="text-[10px] text-slate-400 font-mono">
          dequeue ← front ... back ← enqueue
        </div>
      </div>
    </div>
  );
}
