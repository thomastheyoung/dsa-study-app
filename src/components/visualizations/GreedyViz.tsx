import { useState, useEffect } from 'react';

const UNIT = 30;
const BAR_H = 20;
const ROW_GAP = 5;
const TOP = 22;
const LEFT = 8;

const intervals = [
  { label: 'A', start: 0, end: 3 },
  { label: 'B', start: 1, end: 4 },
  { label: 'C', start: 3, end: 6 },
  { label: 'D', start: 4, end: 7 },
  { label: 'E', start: 6, end: 9 },
  { label: 'F', start: 7, end: 10 },
];

const selected = [true, false, true, false, true, false];

export function GreedyViz() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 9), 1100);
    return () => clearInterval(id);
  }, []);

  const considering = step < 6 ? step : -1;
  const W = LEFT + 10 * UNIT + 30;
  const H = TOP + 6 * (BAR_H + ROW_GAP) + 6;

  const selectedCount = selected.filter(
    (d, i) => i <= Math.min(step, 5) && d,
  ).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-slate-400 font-mono">
        activity selection&nbsp;|&nbsp;sorted by end time&nbsp;|&nbsp;selected:{' '}
        {selectedCount}
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-md"
        role="img"
        aria-label="Greedy interval scheduling visualization"
      >
        {Array.from({ length: 11 }, (_, t) => (
          <g key={t}>
            <text
              x={LEFT + t * UNIT}
              y={14}
              textAnchor="middle"
              className="text-[9px] fill-slate-400 font-mono"
            >
              {t}
            </text>
            <line
              x1={LEFT + t * UNIT}
              y1={TOP - 3}
              x2={LEFT + t * UNIT}
              y2={H - 4}
              className="stroke-slate-100"
              strokeWidth={1}
            />
          </g>
        ))}

        {intervals.map((iv, i) => {
          const x = LEFT + iv.start * UNIT;
          const w = (iv.end - iv.start) * UNIT;
          const y = TOP + i * (BAR_H + ROW_GAP);
          const isCurrent = i === considering;
          const isDecided = considering === -1 || i < step;
          const sel = selected[i];

          let fill = 'fill-slate-100';
          let stroke = 'stroke-slate-300';
          let sw = 1;
          let text = 'fill-slate-500';
          let dash: string | undefined;

          if (isCurrent) {
            fill = 'fill-tech/25';
            stroke = 'stroke-tech';
            sw = 2;
            text = 'fill-tech';
          } else if (isDecided && sel) {
            fill = 'fill-tech/15';
            stroke = 'stroke-tech';
            sw = 1.5;
            text = 'fill-tech';
          } else if (isDecided && !sel) {
            fill = 'fill-slate-50';
            stroke = 'stroke-slate-200';
            text = 'fill-slate-300';
            dash = '4 3';
          }

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={w}
                height={BAR_H}
                rx={4}
                className={`transition-all duration-300 ${fill} ${stroke}`}
                strokeWidth={sw}
                strokeDasharray={dash}
              />
              <text
                x={x + w / 2}
                y={y + BAR_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[10px] font-mono font-medium transition-colors duration-300 ${text}`}
              >
                {iv.label}
              </text>
              {isDecided && !isCurrent && (
                <text
                  x={x + w + 8}
                  y={y + BAR_H / 2 + 1}
                  dominantBaseline="middle"
                  className={`text-[10px] font-mono ${sel ? 'fill-tech' : 'fill-slate-300'}`}
                >
                  {sel ? '✓' : '✗'}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-tech mr-1" />
          Selected
        </span>
        <span className="text-slate-400">- - - Skipped (overlap)</span>
      </div>
    </div>
  );
}
