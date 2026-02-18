import type { Topic } from '../types';

export const arrays: Topic = {
  id: 'arrays',
  title: 'Arrays',
  category: 'data-structures',
  description: 'Contiguous memory blocks with O(1) random access — the foundational data structure.',
  complexity: {
    access: 'O(1)',
    search: 'O(n)',
    insert: 'O(n)',
    delete: 'O(n)',
  },
  theory: `Arrays store elements in contiguous memory locations, enabling constant-time access via index arithmetic. In JavaScript/TypeScript, arrays are dynamic (backed by hash maps when sparse), but dense arrays behave like true arrays with V8 optimizations.

**Key trade-offs:**
- Random access is instant, but insertion/deletion in the middle requires shifting elements.
- Appending is amortized O(1) due to dynamic resizing (doubling strategy).
- Memory locality is excellent — cache-friendly sequential access.

**When to use arrays:**
- You need ordered data with index-based access.
- Iteration performance matters (cache locality).
- The primary operations are append/pop (stack behavior) or indexed reads.

**When NOT to use arrays:**
- Frequent insertions/deletions in the middle → consider a linked list.
- Fast lookups by value → consider a hash map or set.
- Need FIFO behavior at scale → consider a proper queue implementation.`,
  keyPoints: [
    'O(1) access by index — direct memory offset calculation',
    'O(n) insert/delete in middle — shifting required',
    'Amortized O(1) push/pop at end',
    'Cache-friendly due to contiguous memory',
    'JS arrays are objects under the hood but V8 optimizes dense arrays',
    'TypedArrays (Int32Array etc.) give true fixed-size array behavior',
  ],
  visualization: 'ArrayViz',
  useCases: [
    {
      title: 'Time-series metrics buffer',
      description:
        'Ring buffer for storing the last N minutes of server response times, computing rolling averages for an observability dashboard.',
      code: `interface MetricSample {
  timestamp: number;
  responseTimeMs: number;
}

class MetricsRingBuffer {
  private buffer: MetricSample[];
  private head = 0;
  private count = 0;

  constructor(private readonly capacity: number) {
    this.buffer = new Array(capacity);
  }

  push(sample: MetricSample): void {
    this.buffer[this.head] = sample;
    this.head = (this.head + 1) % this.capacity;
    this.count = Math.min(this.count + 1, this.capacity);
  }

  rollingAverage(): number {
    if (this.count === 0) return 0;
    let sum = 0;
    for (let i = 0; i < this.count; i++) {
      sum += this.buffer[i].responseTimeMs;
    }
    return sum / this.count;
  }

  p99(): number {
    const sorted = this.buffer
      .slice(0, this.count)
      .map((s) => s.responseTimeMs)
      .sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * 0.99)];
  }
}

// Usage: 5-minute window at 1 sample/sec
const metrics = new MetricsRingBuffer(300);
metrics.push({ timestamp: Date.now(), responseTimeMs: 42 });`,
      complexity: 'Time: O(1) push, O(n) average/p99 | Space: O(capacity)',
    },
    {
      title: 'Batch API request processor',
      description:
        'Chunk a large array of user IDs into fixed-size batches for parallel API calls, respecting rate limits.',
      code: `interface BatchResult<T> {
  successes: T[];
  failures: Array<{ id: string; error: string }>;
}

function chunkArray<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

async function processBatches(
  userIds: string[],
  batchSize: number,
  concurrency: number
): Promise<BatchResult<string>> {
  const batches = chunkArray(userIds, batchSize);
  const result: BatchResult<string> = { successes: [], failures: [] };

  for (let i = 0; i < batches.length; i += concurrency) {
    const concurrent = batches.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      concurrent.map((batch) => notifyUsers(batch))
    );

    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        result.successes.push(...outcome.value);
      }
    }
  }
  return result;
}

declare function notifyUsers(ids: string[]): Promise<string[]>;

// 10k users, batches of 100, 3 concurrent requests
// processBatches(userIds, 100, 3);`,
      complexity: 'Time: O(n) chunking | Space: O(n)',
    },
    {
      title: 'Event sourcing snapshot',
      description:
        'Compact an event log array by applying events in order to build current state, used in event-sourced systems like order management.',
      code: `type OrderEvent =
  | { type: 'CREATED'; orderId: string; items: string[] }
  | { type: 'ITEM_ADDED'; orderId: string; item: string }
  | { type: 'ITEM_REMOVED'; orderId: string; item: string }
  | { type: 'SHIPPED'; orderId: string; trackingId: string }
  | { type: 'CANCELLED'; orderId: string; reason: string };

interface OrderState {
  orderId: string;
  items: string[];
  status: 'pending' | 'shipped' | 'cancelled';
  trackingId?: string;
}

function buildSnapshot(events: OrderEvent[]): OrderState {
  return events.reduce<OrderState>(
    (state, event) => {
      switch (event.type) {
        case 'CREATED':
          return { ...state, orderId: event.orderId, items: [...event.items] };
        case 'ITEM_ADDED':
          return { ...state, items: [...state.items, event.item] };
        case 'ITEM_REMOVED':
          return { ...state, items: state.items.filter((i) => i !== event.item) };
        case 'SHIPPED':
          return { ...state, status: 'shipped', trackingId: event.trackingId };
        case 'CANCELLED':
          return { ...state, status: 'cancelled' };
      }
    },
    { orderId: '', items: [], status: 'pending' }
  );
}

// Replay 1000 events to rebuild order state at any point`,
      complexity: 'Time: O(n) events | Space: O(1) for state object',
    },
    {
      title: 'Leaderboard ranking',
      description:
        'Maintain a sorted array of player scores, inserting new scores at the correct position using binary search for a real-time game leaderboard.',
      code: `interface LeaderboardEntry {
  playerId: string;
  score: number;
  timestamp: number;
}

class Leaderboard {
  private entries: LeaderboardEntry[] = [];

  submit(entry: LeaderboardEntry): number {
    const pos = this.findInsertPosition(entry.score);
    this.entries.splice(pos, 0, entry);
    return pos; // rank (0-indexed)
  }

  topN(n: number): LeaderboardEntry[] {
    return this.entries.slice(0, n);
  }

  private findInsertPosition(score: number): number {
    let lo = 0;
    let hi = this.entries.length;
    // Descending order: higher scores first
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.entries[mid].score >= score) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  getRank(playerId: string): number {
    return this.entries.findIndex((e) => e.playerId === playerId);
  }
}

const board = new Leaderboard();
board.submit({ playerId: 'p1', score: 950, timestamp: Date.now() });
board.submit({ playerId: 'p2', score: 1200, timestamp: Date.now() });
board.topN(10); // top 10 players`,
      complexity: 'Time: O(log n) search, O(n) insert | Space: O(n)',
    },
    {
      title: 'Virtual scroll viewport',
      description:
        'Compute which items are visible in a scrollable list of thousands of rows, rendering only the visible slice plus a small overscan buffer — the core of any virtual list component.',
      code: `interface VirtualItem {
  index: number;
  offsetTop: number;
  height: number;
}

interface ViewportSlice {
  startIndex: number;
  endIndex: number;
  items: VirtualItem[];
  totalHeight: number;
  offsetY: number;
}

function computeVisibleSlice(
  totalItems: number,
  itemHeight: number,
  viewportHeight: number,
  scrollTop: number,
  overscan: number = 3
): ViewportSlice {
  const totalHeight = totalItems * itemHeight;

  // O(1) index calculation via direct offset arithmetic
  const rawStart = Math.floor(scrollTop / itemHeight);
  const rawEnd = Math.ceil((scrollTop + viewportHeight) / itemHeight);

  // Clamp with overscan buffer
  const startIndex = Math.max(0, rawStart - overscan);
  const endIndex = Math.min(totalItems - 1, rawEnd + overscan);

  const items: VirtualItem[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    items.push({
      index: i,
      offsetTop: i * itemHeight,
      height: itemHeight,
    });
  }

  return {
    startIndex,
    endIndex,
    items,
    totalHeight,
    offsetY: startIndex * itemHeight,
  };
}

// 10,000 rows at 48px each, viewport is 600px, scrolled to 4800px
// computeVisibleSlice(10_000, 48, 600, 4800)
// → renders ~19 items (13 visible + 6 overscan) instead of 10,000
// → offsetY positions the rendered slice correctly via transform`,
      complexity: 'Time: O(1) index calc, O(overscan) items | Space: O(visible + overscan)',
    },
    {
      title: 'Feature flag rollout',
      description:
        'Partition users into cohorts using array index arithmetic (hash % bucketCount) for a gradual feature rollout system.',
      code: `interface RolloutConfig {
  featureId: string;
  bucketCount: number;
  enabledBuckets: number; // first N buckets are enabled
}

function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function isFeatureEnabled(
  userId: string,
  config: RolloutConfig
): boolean {
  const bucket = hashUserId(userId) % config.bucketCount;
  return bucket < config.enabledBuckets;
}

function computeRolloutDistribution(
  userIds: string[],
  bucketCount: number
): number[] {
  const buckets = new Array<number>(bucketCount).fill(0);
  for (const id of userIds) {
    const bucket = hashUserId(id) % bucketCount;
    buckets[bucket]++;
  }
  return buckets;
}

// 10% rollout: 10 buckets, enable first 1
const config: RolloutConfig = {
  featureId: 'new-checkout',
  bucketCount: 100,
  enabledBuckets: 10, // 10% rollout
};
// isFeatureEnabled('user_abc123', config);`,
      complexity: 'Time: O(1) per check, O(n) distribution | Space: O(bucketCount)',
    },
  ],
};
