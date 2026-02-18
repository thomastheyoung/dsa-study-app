import type { Topic } from '../types';

export const prefixSumHashmap: Topic = {
  id: 'prefix-sum-hashmap',
  title: 'Prefix sums + hashmap',
  category: 'techniques',
  description:
    'Track cumulative prefix values in a hashmap to answer subarray sum/balance/count queries in O(n) — turning nested scans into single-pass lookups.',
  invariant: 'If prefix[j] - prefix[i] = K, then (i..j] is a valid subarray. Track counts or first positions of prefix values as you scan.',
  theory: `A **prefix sum** (or cumulative sum) converts an array into a running total: \`prefix[j] = arr[0] + arr[1] + … + arr[j-1]\`. The sum of any subarray \`(i..j]\` is simply \`prefix[j] - prefix[i]\`. By storing prefix values in a hashmap, you can check in *O(1)* whether any earlier prefix creates a valid subarray ending at the current position. As you scan left to right, store prefix counts (or first-seen indices) in a map so every new prefix can instantly query all prior positions.

**When to use it:**

- "Subarray sum equals K" → count how many prior prefixes equal \`currentPrefix - K\`
- "Longest subarray with equal 0s and 1s" → map 0 → -1, track first occurrence of each prefix
- "Subarray sum divisible by K" → store \`prefix % K\` in the map
- Any problem where a **local prefix** helps reason about relationships between **any two positions**

**Signals:** subarray sum equals K, equal counts, divisible by K, balanced subarrays.

**Template — count subarrays summing to K:**
\`\`\`
const prefixCount = new Map<number, number>();
prefixCount.set(0, 1); // empty prefix
let prefix = 0;
let count = 0;

for (const val of arr) {
  prefix += val;
  count += prefixCount.get(prefix - K) ?? 0;
  prefixCount.set(prefix, (prefixCount.get(prefix) ?? 0) + 1);
}
\`\`\`

**Template — longest subarray with prefix property:**
\`\`\`
const firstSeen = new Map<number, number>();
firstSeen.set(0, -1); // empty prefix at index -1
let prefix = 0;
let maxLen = 0;

for (let i = 0; i < arr.length; i++) {
  prefix += arr[i];
  if (firstSeen.has(prefix)) {
    maxLen = Math.max(maxLen, i - firstSeen.get(prefix)!);
  } else {
    firstSeen.set(prefix, i);
  }
}
\`\`\`

**Key difference from sliding window:** Sliding window requires a monotonic constraint (expanding an invalid window can't help). Prefix sums + hashmap works when the target subarray could start at *any* prior position — there's no shrink condition, just a lookup.`,
  visualization: 'PrefixSumViz',
  keyPoints: [
    'prefix[j] - prefix[i] = K means the subarray (i..j] sums to K',
    'Initialize the map with prefix 0 (count 1 or index -1) to handle subarrays starting at index 0',
    'For counting problems, store prefix → count; for length/index problems, store prefix → first index',
    'Map 0 → -1 and 1 → +1 (or similar) to convert balance problems into prefix sum problems',
    'Use modular arithmetic (prefix % K) for divisibility queries',
    'Single pass O(n) time, O(n) space — replaces O(n²) brute-force subarray enumeration',
  ],
  useCases: [
    {
      title: 'Billing: spend in any time range',
      description:
        'Compute cumulative daily spend so any date-range total is a single subtraction. Pair with a hashmap to find periods where spend hits a target.',
      code: `interface DailySpend {
  date: string;
  amount: number;
}

/** Find all contiguous periods where total spend equals exactly targetAmount */
function periodsMatchingSpend(
  dailySpend: DailySpend[],
  targetAmount: number
): { start: string; end: string; total: number }[] {
  const results: { start: string; end: string; total: number }[] = [];
  const prefixIndex = new Map<number, number>();
  prefixIndex.set(0, -1);
  let prefix = 0;

  for (let i = 0; i < dailySpend.length; i++) {
    prefix += dailySpend[i].amount;

    const needed = prefix - targetAmount;
    if (prefixIndex.has(needed)) {
      const startIdx = prefixIndex.get(needed)! + 1;
      results.push({
        start: dailySpend[startIdx].date,
        end: dailySpend[i].date,
        total: targetAmount,
      });
    }

    // Store first occurrence only (for longest-period variant, use all)
    if (!prefixIndex.has(prefix)) {
      prefixIndex.set(prefix, i);
    }
  }

  return results;
}

// Usage:
// const spend = [
//   { date: '2026-01-01', amount: 120 },
//   { date: '2026-01-02', amount: 80 },
//   { date: '2026-01-03', amount: 200 },
//   { date: '2026-01-04', amount: 100 },
// ];
// periodsMatchingSpend(spend, 280);
// → [{ start: '2026-01-02', end: '2026-01-03', total: 280 }]`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
    {
      title: 'Finance: net balance change threshold',
      description:
        'Detect periods where the net balance change (credits minus debits) hits a threshold. Each transaction maps to +/- and prefix sums reveal matching windows.',
      code: `interface Transaction {
  id: string;
  timestamp: number;
  amount: number; // positive = credit, negative = debit
  category: string;
}

/** Count contiguous transaction sequences where net change equals target */
function countPeriodsWithNetChange(
  transactions: Transaction[],
  target: number
): number {
  const prefixCount = new Map<number, number>();
  prefixCount.set(0, 1);
  let prefix = 0;
  let count = 0;

  for (const txn of transactions) {
    prefix += txn.amount;
    count += prefixCount.get(prefix - target) ?? 0;
    prefixCount.set(prefix, (prefixCount.get(prefix) ?? 0) + 1);
  }

  return count;
}

// Usage:
// const txns = [
//   { id: '1', timestamp: 1, amount: 500, category: 'revenue' },
//   { id: '2', timestamp: 2, amount: -200, category: 'expense' },
//   { id: '3', timestamp: 3, amount: -100, category: 'expense' },
//   { id: '4', timestamp: 4, amount: 300, category: 'revenue' },
//   { id: '5', timestamp: 5, amount: -500, category: 'expense' },
// ];
// countPeriodsWithNetChange(txns, 200);`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
    {
      title: 'A/B analytics: longest balanced window',
      description:
        'Find the longest contiguous window where two event types (e.g., variant A vs B conversions) are perfectly balanced. Map A → +1, B → -1 and find the longest subarray summing to 0.',
      code: `interface ConversionEvent {
  timestamp: number;
  userId: string;
  variant: 'A' | 'B';
  converted: boolean;
}

interface BalancedWindow {
  startIdx: number;
  endIdx: number;
  length: number;
  aCount: number;
  bCount: number;
}

function longestBalancedWindow(
  events: ConversionEvent[]
): BalancedWindow | null {
  // Map variant A → +1, variant B → -1
  const firstSeen = new Map<number, number>();
  firstSeen.set(0, -1); // empty prefix before index 0

  let prefix = 0;
  let bestStart = 0;
  let bestLen = 0;

  for (let i = 0; i < events.length; i++) {
    prefix += events[i].variant === 'A' ? 1 : -1;

    if (firstSeen.has(prefix)) {
      const start = firstSeen.get(prefix)! + 1;
      const len = i - start + 1;
      if (len > bestLen) {
        bestLen = len;
        bestStart = start;
      }
    } else {
      firstSeen.set(prefix, i);
    }
  }

  if (bestLen === 0) return null;

  const window = events.slice(bestStart, bestStart + bestLen);
  const aCount = window.filter((e) => e.variant === 'A').length;

  return {
    startIdx: bestStart,
    endIdx: bestStart + bestLen - 1,
    length: bestLen,
    aCount,
    bCount: bestLen - aCount,
  };
}

// Usage:
// const events = conversions.filter(e => e.converted);
// const balanced = longestBalancedWindow(events);
// → { startIdx: 2, endIdx: 9, length: 8, aCount: 4, bCount: 4 }`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
    {
      title: 'Rate limits: exceeded action threshold',
      description:
        'Given a prefix count of user actions, find all contiguous windows where a user performed exactly K actions — useful for detecting burst patterns or verifying rate-limit violations.',
      code: `interface ActionLog {
  userId: string;
  timestamp: number;
  action: string;
}

interface BurstWindow {
  startIdx: number;
  endIdx: number;
  actionCount: number;
}

/** Find all contiguous windows where exactly targetActions occurred */
function findBurstWindows(
  logs: ActionLog[],
  targetActions: number
): BurstWindow[] {
  const results: BurstWindow[] = [];
  const prefixIndex = new Map<number, number[]>();
  prefixIndex.set(0, [-1]);
  let prefix = 0;

  for (let i = 0; i < logs.length; i++) {
    prefix += 1; // Each log entry is one action

    const needed = prefix - targetActions;
    const priorIndices = prefixIndex.get(needed);
    if (priorIndices) {
      for (const startIdx of priorIndices) {
        results.push({
          startIdx: startIdx + 1,
          endIdx: i,
          actionCount: targetActions,
        });
      }
    }

    if (!prefixIndex.has(prefix)) {
      prefixIndex.set(prefix, []);
    }
    prefixIndex.get(prefix)!.push(i);
  }

  return results;
}

// Usage:
// const logs = getUserActionLogs('user-42');
// const bursts = findBurstWindows(logs, 100);
// → all 100-action contiguous windows`,
      complexity: 'Time: O(n + result size) | Space: O(n)',
    },
    {
      title: 'Gaming: longest balanced win/loss streak',
      description:
        'Find the longest stretch of matches where wins and losses are balanced. Map win → +1, loss → -1 and find the longest subarray summing to 0.',
      code: `interface MatchResult {
  matchId: string;
  timestamp: number;
  outcome: 'win' | 'loss' | 'draw';
  rating: number;
}

interface BalancedStreak {
  startIdx: number;
  endIdx: number;
  length: number;
  wins: number;
  losses: number;
}

function longestBalancedStreak(
  matches: MatchResult[]
): BalancedStreak | null {
  // Filter to only wins and losses, map win → +1, loss → -1
  const wl = matches.filter((m) => m.outcome !== 'draw');

  const firstSeen = new Map<number, number>();
  firstSeen.set(0, -1);

  let prefix = 0;
  let bestStart = 0;
  let bestLen = 0;

  for (let i = 0; i < wl.length; i++) {
    prefix += wl[i].outcome === 'win' ? 1 : -1;

    if (firstSeen.has(prefix)) {
      const start = firstSeen.get(prefix)! + 1;
      const len = i - start + 1;
      if (len > bestLen) {
        bestLen = len;
        bestStart = start;
      }
    } else {
      firstSeen.set(prefix, i);
    }
  }

  if (bestLen === 0) return null;

  const streak = wl.slice(bestStart, bestStart + bestLen);
  const wins = streak.filter((m) => m.outcome === 'win').length;

  return {
    startIdx: bestStart,
    endIdx: bestStart + bestLen - 1,
    length: bestLen,
    wins,
    losses: bestLen - wins,
  };
}

// Usage:
// const matches = getPlayerHistory('player-123');
// const streak = longestBalancedStreak(matches);
// → { startIdx: 5, endIdx: 18, length: 14, wins: 7, losses: 7 }`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
  ],
};
