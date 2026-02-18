import type { Topic } from '../types';

export const searching: Topic = {
  id: 'searching',
  title: 'Searching',
  category: 'algorithms',
  description: 'Algorithms for finding elements or positions in data structures — from linear scans to logarithmic binary search.',
  complexity: {
    average: 'O(log n) for binary search',
    worst: 'O(n) for linear search',
  },
  theory: `**Linear search** scans every element sequentially. It works on any collection (sorted or not) but is O(n). Use it only when the data is unsorted and small, or when you need to find all matches.

**Binary search** is the fundamental divide-and-conquer search. It requires a sorted (or monotonic) input and eliminates half the search space each step, achieving O(log n).

**The binary search template:**
\`\`\`
let lo = 0, hi = n - 1;
while (lo <= hi) {
  const mid = lo + Math.floor((hi - lo) / 2);
  if (condition(mid)) hi = mid - 1;
  else lo = mid + 1;
}
return lo;
\`\`\`

**Critical variants:**

1. **Lower bound** — Find the first index where \`arr[i] >= target\`. Equivalent to C++ \`lower_bound\`.
2. **Upper bound** — Find the first index where \`arr[i] > target\`. Equivalent to C++ \`upper_bound\`.
3. **Search on answer** — Binary search over the answer space instead of the array itself. Used when you can frame the problem as "is X feasible?" with a monotonic feasibility function.

**Common pitfalls:**
- Off-by-one errors: be precise about whether bounds are inclusive or exclusive.
- Integer overflow in \`(lo + hi) / 2\` — use \`lo + Math.floor((hi - lo) / 2)\` instead. Not an issue in JS (no integer overflow), but good habit.
- Infinite loops: ensure the search space shrinks every iteration.

**When to recognize binary search:**
- Sorted array or monotonic function
- "Find minimum/maximum value satisfying a condition"
- The problem says "sorted" or can be modeled as a sorted search space
- O(log n) is required`,
  keyPoints: [
    'Binary search requires a sorted or monotonic search space',
    'Always use lo + Math.floor((hi - lo) / 2) to compute mid',
    'Lower bound finds first element >= target; upper bound finds first > target',
    'Search on answer: binary search the answer space with a feasibility check',
    'Off-by-one errors are the #1 bug — be explicit about inclusive vs exclusive bounds',
    'Binary search applies to more than arrays: search rotated arrays, search 2D matrices, search on real numbers',
  ],
  useCases: [
    {
      title: 'Autocomplete suggestions',
      description:
        'Binary search on a sorted dictionary to find the range of words matching a prefix — powers search-as-you-type in a search bar.',
      code: `function autocompleteSuggestions(
  sortedDictionary: string[],
  prefix: string,
  limit: number = 10
): string[] {
  // Lower bound: first word >= prefix
  const start = lowerBound(sortedDictionary, prefix);

  // Upper bound: first word >= prefix + highest char
  const prefixEnd = prefix.slice(0, -1)
    + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
  const end = lowerBound(sortedDictionary, prefixEnd);

  return sortedDictionary.slice(start, Math.min(end, start + limit));
}

function lowerBound(arr: string[], target: string): number {
  let lo = 0;
  let hi = arr.length;

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }

  return lo;
}

// sortedDictionary = ["apple", "apply", "apt", "banana", ...]
// autocompleteSuggestions(dict, "app") → ["apple", "apply"]`,
      complexity: 'Time: O(log n + k) where k = results returned | Space: O(k)',
    },
    {
      title: 'Log timestamp lookup',
      description:
        'Binary search to find the first log entry after a given timestamp in a time-sorted log file — common for incident investigation and log tailing.',
      code: `interface LogEntry {
  timestamp: number; // epoch ms
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
}

function findLogsAfter(
  logs: LogEntry[],
  afterTimestamp: number,
  limit: number = 100
): LogEntry[] {
  let lo = 0;
  let hi = logs.length;

  // Find first log entry with timestamp > afterTimestamp
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (logs[mid].timestamp <= afterTimestamp) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return logs.slice(lo, lo + limit);
}

// 10M log entries sorted by timestamp
// findLogsAfter(logs, incidentStartTime)
// → returns first 100 log entries after the incident
// Only ~23 comparisons needed (log2(10M) ≈ 23)`,
      complexity: 'Time: O(log n) | Space: O(1)',
    },
    {
      title: 'Feature flag percentage rollout',
      description:
        'Binary search over sorted bucket boundaries to determine which feature variant a user falls into, based on a deterministic hash of their user ID.',
      code: `interface FeatureVariant {
  name: string;
  percentage: number; // e.g., 10 means 10%
}

interface ResolvedVariant {
  name: string;
  upperBound: number;
}

function buildBuckets(variants: FeatureVariant[]): ResolvedVariant[] {
  const buckets: ResolvedVariant[] = [];
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.percentage;
    buckets.push({ name: v.name, upperBound: cumulative });
  }
  return buckets;
}

function resolveVariant(
  buckets: ResolvedVariant[],
  userId: string
): string {
  const hash = simpleHash(userId) % 100; // 0-99

  // Binary search for first bucket where hash < upperBound
  let lo = 0;
  let hi = buckets.length - 1;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (buckets[mid].upperBound <= hash) lo = mid + 1;
    else hi = mid;
  }
  return buckets[lo].name;
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}`,
      complexity: 'Time: O(log k) where k = number of variants | Space: O(1)',
    },
    {
      title: 'Rate limit threshold check',
      description:
        'Binary search on a sorted array of request timestamps to count requests in a sliding window — determines if a rate limit has been exceeded.',
      code: `interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // sliding window size in ms
}

function isRateLimited(
  sortedTimestamps: number[],
  now: number,
  config: RateLimitConfig
): { limited: boolean; count: number; retryAfterMs: number } {
  const windowStart = now - config.windowMs;

  // Binary search: find first timestamp within the window
  let lo = 0;
  let hi = sortedTimestamps.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (sortedTimestamps[mid] <= windowStart) lo = mid + 1;
    else hi = mid;
  }

  const countInWindow = sortedTimestamps.length - lo;
  const limited = countInWindow >= config.maxRequests;

  // If limited, calculate when the oldest request in window expires
  const retryAfterMs = limited
    ? sortedTimestamps[lo] + config.windowMs - now
    : 0;

  return { limited, count: countInWindow, retryAfterMs };
}

// 100 req/min limit, 50K timestamps logged
// Binary search finds window boundary in ~16 comparisons`,
      complexity: 'Time: O(log n) | Space: O(1)',
    },
    {
      title: 'Command palette / spotlight search',
      description:
        'Binary search on a sorted action registry to instantly narrow down matching commands as the user types — the pattern behind VS Code\'s Cmd+P and Spotlight-style interfaces.',
      code: `interface CommandAction {
  id: string;
  label: string;        // display name (sorted)
  keywords: string[];   // additional search terms
  shortcut?: string;
  section: string;
  handler: () => void;
}

function searchCommands(
  sortedActions: CommandAction[],
  query: string,
  limit: number = 10
): CommandAction[] {
  if (!query) return sortedActions.slice(0, limit);

  const q = query.toLowerCase();

  // Binary search for prefix match on label
  const prefixStart = lowerBound(sortedActions, q);
  const prefixEnd = lowerBound(
    sortedActions,
    q.slice(0, -1) + String.fromCharCode(q.charCodeAt(q.length - 1) + 1)
  );

  // Prefix matches (best results)
  const prefixMatches = sortedActions.slice(prefixStart, prefixEnd);

  // If we need more, do a linear scan for fuzzy/keyword matches
  const prefixIds = new Set(prefixMatches.map((a) => a.id));
  const fuzzyMatches: Array<{ action: CommandAction; score: number }> = [];

  for (const action of sortedActions) {
    if (prefixIds.has(action.id)) continue;

    const labelMatch = action.label.toLowerCase().includes(q);
    const keywordMatch = action.keywords.some((k) =>
      k.toLowerCase().includes(q)
    );

    if (labelMatch || keywordMatch) {
      // Score: substring position (earlier = better)
      const pos = action.label.toLowerCase().indexOf(q);
      fuzzyMatches.push({
        action,
        score: pos >= 0 ? pos : 100,
      });
    }
  }

  fuzzyMatches.sort((a, b) => a.score - b.score);

  return [
    ...prefixMatches,
    ...fuzzyMatches.map((m) => m.action),
  ].slice(0, limit);
}

function lowerBound(actions: CommandAction[], target: string): number {
  let lo = 0;
  let hi = actions.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (actions[mid].label.toLowerCase() < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// Sorted registry: ["Copy", "Cut", "Delete", "Find", "Paste", ...]
// searchCommands(registry, 'pa') → ["Paste", "Page Setup", ...]
// Prefix match via binary search is O(log n), then fuzzy fallback`,
      complexity: 'Time: O(log n) prefix + O(n) fuzzy fallback | Space: O(k) results',
    },
    {
      title: 'Version compatibility resolver',
      description:
        'Binary search for the latest compatible version satisfying a minimum semver constraint — used by package managers to resolve dependencies.',
      code: `interface SemVer {
  major: number;
  minor: number;
  patch: number;
}

function parseSemVer(v: string): SemVer {
  const [major, minor, patch] = v.split('.').map(Number);
  return { major, minor, patch };
}

function compareSemVer(a: SemVer, b: SemVer): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

function findLatestCompatible(
  sortedVersions: string[],
  minVersion: string,
  maxMajor: number
): string | null {
  const min = parseSemVer(minVersion);

  // Lower bound: first version >= minVersion
  let lo = 0;
  let hi = sortedVersions.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (compareSemVer(parseSemVer(sortedVersions[mid]), min) < 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  // Scan forward to find latest within same major version
  let best: string | null = null;
  for (let i = lo; i < sortedVersions.length; i++) {
    const v = parseSemVer(sortedVersions[i]);
    if (v.major > maxMajor) break;
    best = sortedVersions[i];
  }
  return best;
}

// versions = ["1.0.0", "1.2.0", "1.5.3", "2.0.0", "2.1.0"]
// findLatestCompatible(versions, "1.2.0", 1) → "1.5.3"`,
      complexity: 'Time: O(log n + k) | Space: O(1)',
    },
  ],
};
