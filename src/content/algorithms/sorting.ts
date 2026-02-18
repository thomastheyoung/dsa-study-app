import type { Topic } from '../types';

export const sorting: Topic = {
  id: 'sorting',
  title: 'Sorting',
  category: 'algorithms',
  description: 'Algorithms that arrange elements in a specific order — the most studied family of algorithms in computer science.',
  complexity: {
    average: 'O(n log n)',
    worst: 'O(n²) for comparison sorts, O(n + k) for counting/radix',
  },
  theory: `Sorting algorithms fall into two broad categories: **comparison-based** and **non-comparison-based**.

**Comparison sorts** determine order by comparing pairs of elements. The theoretical lower bound for comparison sorts is O(n log n). Key algorithms:

- **Merge sort** — Divide in half, sort each half, merge. Stable, always O(n log n), but requires O(n) extra space. Preferred when stability matters or data is linked (linked lists).
- **Quicksort** — Pick a pivot, partition around it, recurse on each side. Average O(n log n), worst O(n²) with bad pivots, but in practice it's the fastest comparison sort due to cache locality. Use randomized pivot selection to avoid worst case.
- **Heapsort** — Build a max-heap, repeatedly extract the max. Always O(n log n) with O(1) extra space, but poor cache performance. Rarely used alone — its value is proving O(n log n) is achievable in-place.

**Non-comparison sorts** exploit the structure of the input:

- **Counting sort** — Count occurrences of each value. O(n + k) where k is the range. Only works for integer keys in a bounded range.
- **Radix sort** — Sort digit by digit using a stable sub-sort (usually counting sort). O(d × (n + k)) where d is the number of digits.

**Stability:** A sort is stable if equal elements preserve their original relative order. Merge sort and counting sort are stable; quicksort and heapsort are not (by default).

**When to use which:**
| Algorithm | Best for |
|---|---|
| Merge sort | Linked lists, external sorting, stability required |
| Quicksort | General-purpose, arrays, average-case performance |
| Heapsort | Guaranteed O(n log n) with O(1) space |
| Counting sort | Small integer range, very fast when k is small |
| Radix sort | Fixed-length strings, large datasets with bounded keys |

**JavaScript's Array.prototype.sort** uses TimSort (hybrid merge + insertion sort), which is stable and O(n log n).`,
  keyPoints: [
    'Comparison sort lower bound is O(n log n) — you cannot beat this with comparisons alone',
    'Quicksort is fastest in practice due to cache locality, but O(n²) worst case without randomized pivot',
    'Merge sort guarantees O(n log n) and is stable, but needs O(n) auxiliary space',
    'Counting sort achieves O(n + k) by avoiding comparisons entirely',
    'Stability matters when sorting by multiple keys (e.g., sort by name, then by age)',
    'JavaScript\'s built-in sort is TimSort — stable, O(n log n), but allocates O(n) space',
  ],
  useCases: [
    {
      title: 'Search result relevance ranking',
      description:
        'Sort search results by a weighted composite score combining relevance, recency, and popularity using a custom comparator.',
      code: `interface SearchResult {
  id: string;
  title: string;
  relevanceScore: number; // 0-1 from text matching
  publishedAt: Date;
  viewCount: number;
}

function rankSearchResults(results: SearchResult[]): SearchResult[] {
  const now = Date.now();
  const DAY_MS = 86_400_000;

  return [...results].sort((a, b) => {
    const scoreA = computeRankScore(a, now, DAY_MS);
    const scoreB = computeRankScore(b, now, DAY_MS);
    return scoreB - scoreA; // Higher score first
  });
}

function computeRankScore(
  result: SearchResult, now: number, dayMs: number
): number {
  const ageInDays = (now - result.publishedAt.getTime()) / dayMs;
  const recencyBoost = 1 / (1 + Math.log1p(ageInDays));
  const popularityNorm = Math.log1p(result.viewCount) / 10;

  return (
    result.relevanceScore * 0.6 +
    recencyBoost * 0.25 +
    popularityNorm * 0.15
  );
}`,
      complexity: 'Time: O(n log n) | Space: O(n)',
    },
    {
      title: 'Event log timeline',
      description:
        'Sort heterogeneous event objects by timestamp to build a unified activity feed across multiple event sources.',
      code: `type EventType = 'commit' | 'deploy' | 'alert' | 'review';

interface ActivityEvent {
  type: EventType;
  timestamp: Date;
  actor: string;
  payload: Record<string, unknown>;
}

function buildTimeline(sources: ActivityEvent[][]): ActivityEvent[] {
  // Flatten all sources into a single array
  const allEvents = sources.flat();

  // Sort by timestamp ascending (oldest first)
  // Stable sort preserves insertion order for same-millisecond events
  allEvents.sort((a, b) =>
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  return allEvents;
}

// Example usage:
// const commits: ActivityEvent[] = fetchCommits();
// const deploys: ActivityEvent[] = fetchDeploys();
// const alerts: ActivityEvent[] = fetchAlerts();
// const timeline = buildTimeline([commits, deploys, alerts]);
// timeline is now a single chronological feed`,
      complexity: 'Time: O(n log n) | Space: O(n) for flat copy',
    },
    {
      title: 'Database query ORDER BY',
      description:
        'Implement multi-column sort like SQL ORDER BY — sort by department ascending, then by salary descending within each department.',
      code: `interface Employee {
  name: string;
  department: string;
  salary: number;
  hireDate: Date;
}

type SortDirection = 'asc' | 'desc';
type KeyExtractor<T> = (item: T) => string | number;

interface SortColumn<T> {
  key: KeyExtractor<T>;
  direction: SortDirection;
}

function orderBy<T>(rows: T[], columns: SortColumn<T>[]): T[] {
  return [...rows].sort((a, b) => {
    for (const { key, direction } of columns) {
      const valA = key(a);
      const valB = key(b);
      let cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      if (cmp !== 0) return direction === 'desc' ? -cmp : cmp;
    }
    return 0;
  });
}

// SQL: SELECT * FROM employees ORDER BY department ASC, salary DESC
// const sorted = orderBy(employees, [
//   { key: e => e.department, direction: 'asc' },
//   { key: e => e.salary, direction: 'desc' },
// ]);`,
      complexity: 'Time: O(n log n × k) where k = number of sort columns | Space: O(n)',
    },
    {
      title: 'Dependency-aware deployment ordering',
      description:
        'Topological sort of deployment steps respecting service dependencies — ensures each service is deployed only after its dependencies are ready.',
      code: `interface DeploymentStep {
  service: string;
  dependsOn: string[];
}

function resolveDeployOrder(steps: DeploymentStep[]): string[] {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const step of steps) {
    graph.set(step.service, []);
    inDegree.set(step.service, 0);
  }
  for (const step of steps) {
    for (const dep of step.dependsOn) {
      graph.get(dep)!.push(step.service);
      inDegree.set(step.service, inDegree.get(step.service)! + 1);
    }
  }

  const queue = [...inDegree.entries()]
    .filter(([, deg]) => deg === 0)
    .map(([svc]) => svc);
  const order: string[] = [];

  while (queue.length > 0) {
    const svc = queue.shift()!;
    order.push(svc);
    for (const dependent of graph.get(svc) ?? []) {
      const newDeg = inDegree.get(dependent)! - 1;
      inDegree.set(dependent, newDeg);
      if (newDeg === 0) queue.push(dependent);
    }
  }

  if (order.length !== steps.length) {
    throw new Error('Circular dependency detected');
  }
  return order;
}`,
      complexity: 'Time: O(V + E) | Space: O(V + E)',
    },
    {
      title: 'Sortable data table',
      description:
        'A reusable table sort engine that handles multi-column sorting, null positioning, and sort direction toggling — the logic behind every sortable data grid component.',
      code: `type SortDirection = 'asc' | 'desc';
type CellValue = string | number | boolean | null | Date;

interface ColumnSort {
  key: string;
  direction: SortDirection;
  nullsLast?: boolean;
}

function sortTableData<T extends Record<string, CellValue>>(
  rows: T[],
  sorts: ColumnSort[]
): T[] {
  return [...rows].sort((a, b) => {
    for (const { key, direction, nullsLast = true } of sorts) {
      const valA = a[key];
      const valB = b[key];

      // Handle nulls
      if (valA == null && valB == null) continue;
      if (valA == null) return nullsLast ? 1 : -1;
      if (valB == null) return nullsLast ? -1 : 1;

      // Compare by type
      let cmp: number;
      if (valA instanceof Date && valB instanceof Date) {
        cmp = valA.getTime() - valB.getTime();
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        cmp = valA.localeCompare(valB);
      } else {
        cmp = Number(valA) - Number(valB);
      }

      if (cmp !== 0) return direction === 'desc' ? -cmp : cmp;
    }
    return 0;
  });
}

// Toggle sort: click column header to cycle asc → desc → none
function toggleSort(
  current: ColumnSort[],
  columnKey: string,
  multiSort = false
): ColumnSort[] {
  const existing = current.find((s) => s.key === columnKey);

  if (!existing) {
    const newSort: ColumnSort = { key: columnKey, direction: 'asc' };
    return multiSort ? [...current, newSort] : [newSort];
  }

  if (existing.direction === 'asc') {
    return current.map((s) =>
      s.key === columnKey ? { ...s, direction: 'desc' as const } : s
    );
  }

  // Was desc → remove sort
  return current.filter((s) => s.key !== columnKey);
}

// Usage:
// let sorts: ColumnSort[] = [];
// sorts = toggleSort(sorts, 'name');          // → [name asc]
// sorts = toggleSort(sorts, 'name');          // → [name desc]
// sorts = toggleSort(sorts, 'price', true);   // → [name desc, price asc]
// sortTableData(products, sorts);`,
      complexity: 'Time: O(n log n × k) where k = sort columns | Space: O(n)',
    },
    {
      title: 'Leaderboard with tiebreaking',
      description:
        'Stable sort players by score descending, breaking ties by earliest achievement time — the player who reached the score first ranks higher.',
      code: `interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  score: number;
  achievedAt: Date;
}

function rankLeaderboard(
  entries: LeaderboardEntry[]
): (LeaderboardEntry & { rank: number })[] {
  // Stable sort: highest score first, then earliest time
  const sorted = [...entries].sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return a.achievedAt.getTime() - b.achievedAt.getTime();
  });

  // Assign ranks with ties getting the same rank
  return sorted.map((entry, i) => {
    const prev = sorted[i - 1];
    const isTied = prev
      && prev.score === entry.score
      && prev.achievedAt.getTime() === entry.achievedAt.getTime();

    return {
      ...entry,
      rank: isTied ? (sorted as any)[i - 1].rank : i + 1,
    };
  });
}

// 3 players with score 100: whoever hit 100 first ranks highest
// Tied timestamps get the same rank (dense ranking)`,
      complexity: 'Time: O(n log n) | Space: O(n)',
    },
  ],
};
