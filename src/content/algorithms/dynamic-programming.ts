import type { Topic } from '../types';

export const dynamicProgramming: Topic = {
  id: 'dynamic-programming',
  title: 'Dynamic Programming',
  category: 'algorithms',
  description: 'Solve complex problems by breaking them into overlapping subproblems and caching results — trading space for exponential time savings.',
  complexity: {
    average: 'Varies by problem',
    worst: 'Varies by problem',
  },
  theory: `Dynamic programming (DP) applies when a problem has two properties:

1. **Optimal substructure** — The optimal solution to the problem contains optimal solutions to its subproblems.
2. **Overlapping subproblems** — The same subproblems are solved multiple times in the recursive solution.

**Two approaches:**

**Top-down (memoization):** Write the natural recursive solution, then cache results. Easier to derive since you start from the original problem and recurse. Only computes subproblems that are actually needed.

**Bottom-up (tabulation):** Build a table from the smallest subproblems up. Avoids recursion overhead and stack depth limits. Often allows space optimization by keeping only the previous row/state.

**How to design a DP solution:**
1. **Define the state** — What information uniquely identifies a subproblem? This becomes your dp array dimensions.
2. **Write the recurrence** — How does the current state relate to smaller states?
3. **Identify base cases** — What are the trivial subproblems?
4. **Determine computation order** — For bottom-up, ensure dependencies are computed first.
5. **Optimize space** — If state[i] only depends on state[i-1], use rolling variables.

**Common DP patterns:**
- **Linear DP:** dp[i] depends on dp[i-1] or dp[i-2] (climbing stairs, house robber)
- **Two-sequence DP:** dp[i][j] for two strings/arrays (LCS, edit distance)
- **Knapsack:** dp[i][w] for item i with capacity w (0/1 knapsack, coin change)
- **Interval DP:** dp[i][j] for subarray/substring from i to j (palindrome, matrix chain)
- **State machine DP:** dp[i][state] for problems with transitions (buy/sell stock)

**DP vs greedy:** DP explores all valid substructures; greedy commits to locally optimal choices. DP is safe when greedy proofs are hard to establish.`,
  keyPoints: [
    'Two requirements: overlapping subproblems + optimal substructure',
    'Top-down (memoization) is easier to derive; bottom-up (tabulation) avoids stack overflow',
    'State design is the hardest part — ask "what do I need to know to make a decision?"',
    'Look for space optimization: if dp[i] only needs dp[i-1], use two variables',
    'Common patterns: linear, knapsack, two-sequence, interval, state machine',
    'Time complexity = number of states × time per state transition',
  ],
  useCases: [
    {
      title: 'Promotional pricing optimizer',
      description:
        'Choose non-overlapping promotional time slots to maximize revenue — adjacent slots cannot both run promotions due to customer fatigue.',
      code: `interface Promotion {
  slotId: string;
  expectedRevenue: number; // projected additional revenue
  description: string;
}

function optimizePromotions(slots: Promotion[]): {
  maxRevenue: number;
  selectedSlots: string[];
} {
  const n = slots.length;
  if (n === 0) return { maxRevenue: 0, selectedSlots: [] };

  // dp[i] = max revenue considering slots 0..i
  // Take/skip: either include slot i (skip i-1) or skip slot i
  const dp = new Array(n).fill(0);
  dp[0] = slots[0].expectedRevenue;
  if (n > 1) {
    dp[1] = Math.max(slots[0].expectedRevenue, slots[1].expectedRevenue);
  }

  for (let i = 2; i < n; i++) {
    dp[i] = Math.max(
      dp[i - 1],                              // skip slot i
      dp[i - 2] + slots[i].expectedRevenue    // take slot i
    );
  }

  // Backtrack to find which slots were selected
  const selected: string[] = [];
  let i = n - 1;
  while (i >= 0) {
    if (i === 0 || dp[i] !== dp[i - 1]) {
      selected.push(slots[i].slotId);
      i -= 2;
    } else {
      i -= 1;
    }
  }

  return { maxRevenue: dp[n - 1], selectedSlots: selected.reverse() };
}

// Slots: [$500, $300, $700, $200, $600]
// Optimal: slots 0, 2, 4 → $500 + $700 + $600 = $1800`,
      complexity: 'Time: O(n) | Space: O(n), reducible to O(1) without backtracking',
    },
    {
      title: 'Job scheduler with cooldown',
      description:
        'Select the most valuable subset of jobs where each selected job requires a cooldown period before the next can run — models batch processing with recovery time.',
      code: `interface ScheduledJob {
  id: string;
  value: number;  // business value / priority score
  cooldownSlots: number;
}

function scheduleJobs(
  jobs: ScheduledJob[],
  totalSlots: number
): { maxValue: number; scheduled: string[] } {
  // dp[t] = max value achievable using slots 0..t-1
  const dp = new Array(totalSlots + 1).fill(0);
  const choice = new Array(totalSlots + 1).fill(-1);

  for (let t = 1; t <= totalSlots; t++) {
    // Option 1: idle this slot
    dp[t] = dp[t - 1];

    // Option 2: run a job ending at slot t
    for (let j = 0; j < jobs.length; j++) {
      const cost = 1 + jobs[j].cooldownSlots; // job + cooldown
      if (cost <= t) {
        const val = dp[t - cost] + jobs[j].value;
        if (val > dp[t]) {
          dp[t] = val;
          choice[t] = j;
        }
      }
    }
  }

  // Backtrack
  const scheduled: string[] = [];
  let t = totalSlots;
  while (t > 0) {
    if (choice[t] === -1) {
      t--;
    } else {
      const job = jobs[choice[t]];
      scheduled.push(job.id);
      t -= (1 + job.cooldownSlots);
    }
  }

  return { maxValue: dp[totalSlots], scheduled: scheduled.reverse() };
}

// 10 time slots, jobs with varying values and cooldowns
// Finds the combination that maximizes total value`,
      complexity: 'Time: O(totalSlots × jobs) | Space: O(totalSlots)',
    },
    {
      title: 'Alert escalation optimizer',
      description:
        'Choose which monitoring alerts to escalate given limited on-call resources — adjacent alerts incur context-switching penalties, so spacing them out is preferred.',
      code: `interface Alert {
  id: string;
  severity: number;    // higher = more important
  estimatedImpact: number;
}

function optimizeEscalations(
  alerts: Alert[],
  maxEscalations: number
): { totalImpact: number; escalatedIds: string[] } {
  const n = alerts.length;
  if (n === 0) return { totalImpact: 0, escalatedIds: [] };

  // dp[i][k] = max impact from alerts[0..i] with k escalations used
  // Skip adjacent to avoid context-switching penalty
  const dp: number[][] = Array.from(
    { length: n },
    () => new Array(maxEscalations + 1).fill(0)
  );

  dp[0][1] = alerts[0].estimatedImpact;

  for (let i = 1; i < n; i++) {
    for (let k = 0; k <= maxEscalations; k++) {
      // Skip alert i
      dp[i][k] = dp[i - 1][k];

      // Take alert i (must skip i-1 to avoid adjacency penalty)
      if (k > 0) {
        const prev = i >= 2 ? dp[i - 2][k - 1] : 0;
        dp[i][k] = Math.max(dp[i][k], prev + alerts[i].estimatedImpact);
      }
    }
  }

  // Find best k
  let best = 0;
  for (let k = 0; k <= maxEscalations; k++) {
    best = Math.max(best, dp[n - 1][k]);
  }

  return { totalImpact: best, escalatedIds: [] }; // backtrack omitted for brevity
}

// 20 alerts, can escalate at most 5, no two adjacent
// Selects the highest-impact non-adjacent subset`,
      complexity: 'Time: O(n × k) | Space: O(n × k)',
    },
    {
      title: 'Text diff — edit distance',
      description:
        'Compute the minimum edit distance between two strings and reconstruct the edit operations (insert, delete, replace). Powers inline diff views in code review tools, real-time collaboration, and search result highlighting.',
      code: `type EditOp =
  | { type: 'keep'; char: string }
  | { type: 'insert'; char: string }
  | { type: 'delete'; char: string }
  | { type: 'replace'; from: string; to: string };

function computeEditDistance(
  source: string,
  target: string
): { distance: number; operations: EditOp[] } {
  const m = source.length;
  const n = target.length;

  // dp[i][j] = min edits to turn source[0..i-1] into target[0..j-1]
  const dp: number[][] = Array.from(
    { length: m + 1 },
    (_, i) => {
      const row = new Array(n + 1).fill(0);
      row[0] = i; // delete all chars from source
      return row;
    }
  );
  for (let j = 0; j <= n; j++) dp[0][j] = j; // insert all target chars

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (source[i - 1] === target[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // chars match — no edit
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // delete from source
          dp[i][j - 1],     // insert into source
          dp[i - 1][j - 1]  // replace
        );
      }
    }
  }

  // Backtrack to reconstruct operations
  const ops: EditOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && source[i - 1] === target[j - 1]) {
      ops.push({ type: 'keep', char: source[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] <= dp[i - 1][j] &&
                          dp[i][j - 1] <= dp[i - 1][j - 1])) {
      ops.push({ type: 'insert', char: target[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] <= dp[i - 1][j - 1])) {
      ops.push({ type: 'delete', char: source[i - 1] });
      i--;
    } else {
      ops.push({ type: 'replace', from: source[i - 1], to: target[j - 1] });
      i--; j--;
    }
  }

  return { distance: dp[m][n], operations: ops.reverse() };
}

// computeEditDistance("kitten", "sitting")
// → { distance: 3, operations: [
//     { type: 'replace', from: 'k', to: 's' },
//     { type: 'keep', char: 'i' },
//     { type: 'keep', char: 't' },
//     { type: 'keep', char: 't' },
//     { type: 'replace', from: 'e', to: 'i' },
//     { type: 'keep', char: 'n' },
//     { type: 'insert', char: 'g' },
//   ]}`,
      complexity: 'Time: O(m × n) | Space: O(m × n), reducible to O(min(m, n)) without backtracking',
    },
    {
      title: 'Content recommendation sequence',
      description:
        'Select posts for a feed maximizing engagement score while avoiding adjacent posts of the same content type — prevents repetitive feeds.',
      code: `interface Post {
  id: string;
  contentType: 'article' | 'video' | 'image' | 'poll';
  engagementScore: number;
}

function buildFeed(posts: Post[], feedLength: number): Post[] {
  const n = posts.length;
  if (n === 0) return [];

  // Sort by engagement descending as a starting heuristic
  const sorted = [...posts].sort(
    (a, b) => b.engagementScore - a.engagementScore
  );

  // dp[i] = max engagement for feed ending with sorted[i]
  // Constraint: no two adjacent feed items share contentType
  const dp = new Array(n).fill(0);
  const prev = new Array(n).fill(-1);

  for (let i = 0; i < n; i++) {
    dp[i] = sorted[i].engagementScore;

    for (let j = 0; j < i; j++) {
      if (sorted[j].contentType !== sorted[i].contentType) {
        if (dp[j] + sorted[i].engagementScore > dp[i]) {
          dp[i] = dp[j] + sorted[i].engagementScore;
          prev[i] = j;
        }
      }
    }
  }

  // Find the best ending point
  let bestIdx = 0;
  for (let i = 1; i < n; i++) {
    if (dp[i] > dp[bestIdx]) bestIdx = i;
  }

  // Backtrack to build the feed
  const feed: Post[] = [];
  let idx: number | null = bestIdx;
  while (idx !== -1 && feed.length < feedLength) {
    feed.push(sorted[idx]);
    idx = prev[idx];
  }

  return feed.reverse();
}

// Ensures users see a varied feed: article → video → image → article`,
      complexity: 'Time: O(n²) | Space: O(n)',
    },
    {
      title: 'Budget allocation optimizer',
      description:
        'Allocate a limited budget across projects where funding one project may exclude adjacent ones in a priority queue — a take/skip pattern over ranked project proposals.',
      code: `interface Project {
  id: string;
  name: string;
  costK: number;    // cost in $1000s
  expectedROI: number; // expected return multiplier
}

function allocateBudget(
  projects: Project[],
  budgetK: number
): { selectedIds: string[]; totalROI: number; totalCost: number } {
  const n = projects.length;
  if (n === 0) return { selectedIds: [], totalROI: 0, totalCost: 0 };

  // dp[i] = max ROI value from projects[0..i] with adjacency constraint
  // Adjacent projects in the ranked list compete for the same resources
  const dp = new Array(n).fill(0);
  const take = new Array(n).fill(false);

  const roi = (p: Project) => p.costK * p.expectedROI;

  dp[0] = roi(projects[0]);
  take[0] = true;

  if (n > 1) {
    if (roi(projects[1]) > dp[0]) {
      dp[1] = roi(projects[1]);
      take[1] = true;
    } else {
      dp[1] = dp[0];
    }
  }

  for (let i = 2; i < n; i++) {
    const takeValue = dp[i - 2] + roi(projects[i]);
    const skipValue = dp[i - 1];

    if (takeValue > skipValue) {
      dp[i] = takeValue;
      take[i] = true;
    } else {
      dp[i] = skipValue;
    }
  }

  // Backtrack to find selected projects
  const selected: Project[] = [];
  let i = n - 1;
  let remaining = budgetK;
  while (i >= 0) {
    if (i === 0 || dp[i] !== dp[i - 1]) {
      if (projects[i].costK <= remaining) {
        selected.push(projects[i]);
        remaining -= projects[i].costK;
      }
      i -= 2;
    } else {
      i -= 1;
    }
  }

  selected.reverse();
  const totalCost = selected.reduce((s, p) => s + p.costK, 0);
  const totalROI = selected.reduce((s, p) => s + roi(p), 0);

  return {
    selectedIds: selected.map(p => p.id),
    totalROI,
    totalCost,
  };
}

// 8 ranked projects, $500K budget
// Selects non-adjacent projects maximizing total ROI`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
  ],
};
