import { useState, useEffect } from 'react';

const BUCKET_WIDTH = 200;
const BUCKET_HEIGHT = 28;
const BUCKETS = 6;

interface Entry {
  key: string;
  value: string;
  bucket: number;
}

const entries: Entry[] = [
  { key: '"name"', value: '"Alice"', bucket: 0 },
  { key: '"age"', value: '30', bucket: 2 },
  { key: '"city"', value: '"NYC"', bucket: 2 }, // Collision!
  { key: '"email"', value: '"a@b.com"', bucket: 4 },
  { key: '"role"', value: '"eng"', bucket: 5 },
];

export function HashMapViz() {
  const [activeEntry, setActiveEntry] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEntry((prev) => (prev + 1) % (entries.length + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Group entries by bucket
  const bucketEntries = Array.from({ length: BUCKETS }, (_, i) =>
    entries.filter((e) => e.bucket === i)
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 320 ${BUCKETS * (BUCKET_HEIGHT + 6) + 20}`} className="w-full max-w-sm" role="img" aria-label="Hash map with bucket chaining visualization">
        {Array.from({ length: BUCKETS }).map((_, i) => {
          const y = 10 + i * (BUCKET_HEIGHT + 6);
          const bucketItems = bucketEntries[i];
          const hasCollision = bucketItems.length > 1;

          return (
            <g key={i}>
              {/* Bucket index */}
              <text
                x={8}
                y={y + BUCKET_HEIGHT / 2 + 1}
                className="text-[10px] fill-slate-400 font-mono"
                dominantBaseline="middle"
              >
                [{i}]
              </text>

              {/* Bucket rectangle */}
              <rect
                x={30}
                y={y}
                width={BUCKET_WIDTH}
                height={BUCKET_HEIGHT}
                rx={4}
                className={`transition-all duration-300 ${
                  bucketItems.some((e) => entries.indexOf(e) === activeEntry)
                    ? 'fill-ds/10 stroke-ds/60'
                    : bucketItems.length > 0
                      ? 'fill-slate-100 stroke-slate-300'
                      : 'fill-slate-50 stroke-slate-200'
                }`}
                strokeWidth={1}
              />

              {/* Entries in bucket */}
              {bucketItems.length === 0 && (
                <text
                  x={30 + BUCKET_WIDTH / 2}
                  y={y + BUCKET_HEIGHT / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] fill-slate-300 font-mono"
                >
                  empty
                </text>
              )}

              {bucketItems.map((entry, j) => {
                const isActive = entries.indexOf(entry) === activeEntry;
                const ex = 38 + j * 95;
                return (
                  <text
                    key={j}
                    x={ex}
                    y={y + BUCKET_HEIGHT / 2 + 1}
                    dominantBaseline="middle"
                    className={`text-[10px] font-mono transition-colors duration-300 ${
                      isActive ? 'fill-ds' : 'fill-slate-500'
                    }`}
                  >
                    {entry.key}: {entry.value}
                  </text>
                );
              })}

              {/* Collision indicator */}
              {hasCollision && (
                <text
                  x={BUCKET_WIDTH + 40}
                  y={y + BUCKET_HEIGHT / 2 + 1}
                  dominantBaseline="middle"
                  className="text-[9px] fill-amber-600/70 font-mono"
                >
                  collision!
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-ds mr-1" />
          Hash map with chaining
        </span>
        <span className="text-amber-600/70 font-mono text-[10px]">
          Bucket 2: collision resolved by chaining
        </span>
      </div>
    </div>
  );
}
