import type { Topic } from '../types';

export const heaps: Topic = {
  id: 'heaps',
  title: 'Heaps',
  category: 'data-structures',
  description: 'Complete binary trees with the heap property — O(log n) insert/extract for priority-based problems.',
  complexity: {
    access: 'O(1) peek',
    search: 'O(n)',
    insert: 'O(log n)',
    delete: 'O(log n)',
  },
  theory: `A heap is a complete binary tree satisfying the heap property: in a min-heap, every parent is smaller than its children; in a max-heap, every parent is larger. The root always holds the extreme value.

**Array representation:**
- A complete binary tree maps perfectly to an array with no gaps.
- For node at index i: left child = 2i + 1, right child = 2i + 2, parent = Math.floor((i - 1) / 2).
- No pointer overhead — just an array.

**Core operations:**
- **Insert (push):** Add to the end of the array, then "bubble up" (sift up) — swap with parent while heap property is violated. O(log n).
- **Extract min/max (pop):** Replace root with the last element, then "bubble down" (sift down) — swap with the smaller/larger child while violated. O(log n).
- **Peek:** Return the root. O(1).
- **Heapify (build heap):** Convert an arbitrary array into a heap. Bottom-up sift-down is O(n), not O(n log n).

**Priority queue:**
- A heap is the standard implementation of a priority queue — an abstract data type where elements are dequeued by priority, not insertion order.
- JavaScript has no built-in heap. You must implement one or use a library.

**When to use heaps:**
- "Find the kth largest/smallest" — maintain a heap of size k.
- "Merge k sorted lists" — min-heap of k current heads.
- "Median from a stream" — two heaps (max-heap for lower half, min-heap for upper half).
- Any problem requiring repeated access to the min or max element.`,
  keyPoints: [
    'Min-heap: root is the smallest; max-heap: root is the largest',
    'Array representation: parent at i, children at 2i+1 and 2i+2',
    'Insert and extract are O(log n); peek is O(1)',
    'Building a heap from an array is O(n) with bottom-up heapify',
    'JavaScript has no built-in heap — you must implement or import one',
    'Key pattern: maintain a heap of size k to find kth largest in O(n log k)',
  ],
  visualization: 'HeapViz',
  useCases: [
    {
      title: 'Search result ranking — top-K from shards',
      description:
        'Aggregate top-K search results from multiple shards. Each shard returns its best results; a min-heap of size K maintains the globally best scores across all shards.',
      code: `interface SearchResult {
  docId: string;
  score: number;
  shard: string;
  snippet: string;
}

class TopKHeap {
  private data: SearchResult[] = [];

  constructor(private k: number) {}

  get size(): number { return this.data.length; }
  get results(): SearchResult[] { return [...this.data].sort((a, b) => b.score - a.score); }

  offer(result: SearchResult): void {
    if (this.data.length < this.k) {
      this.data.push(result);
      this.bubbleUp(this.data.length - 1);
    } else if (result.score > this.data[0].score) {
      this.data[0] = result; // replace the weakest
      this.bubbleDown(0);
    }
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].score <= this.data[i].score) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  private bubbleDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let min = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l].score < this.data[min].score) min = l;
      if (r < n && this.data[r].score < this.data[min].score) min = r;
      if (min === i) break;
      [this.data[i], this.data[min]] = [this.data[min], this.data[i]];
      i = min;
    }
  }
}

function mergeShardResults(
  shardResults: SearchResult[][],
  k: number
): SearchResult[] {
  const heap = new TopKHeap(k);
  for (const shard of shardResults) {
    for (const result of shard) heap.offer(result);
  }
  return heap.results;
}

// 3 shards each return 100 results; we want the global top 10
// mergeShardResults([shard1, shard2, shard3], 10)
// → 10 highest-scoring results across all shards`,
      complexity: 'Time: O(N log K) where N = total results | Space: O(K)',
    },
    {
      title: 'Log stream merging — K-way merge',
      description:
        'Merge K sorted log streams (from different servers) into a single time-ordered stream. A min-heap always holds the next entry from each stream, yielding the globally earliest log.',
      code: `interface LogEntry {
  timestamp: number;
  server: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface StreamCursor {
  entry: LogEntry;
  streamIndex: number;
  position: number; // next index in this stream
}

function mergeLogStreams(streams: LogEntry[][]): LogEntry[] {
  // Min-heap by timestamp
  const heap: StreamCursor[] = [];

  function siftUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p].entry.timestamp <= heap[i].entry.timestamp) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  }

  function siftDown(i: number): void {
    while (true) {
      let min = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < heap.length && heap[l].entry.timestamp < heap[min].entry.timestamp) min = l;
      if (r < heap.length && heap[r].entry.timestamp < heap[min].entry.timestamp) min = r;
      if (min === i) break;
      [heap[i], heap[min]] = [heap[min], heap[i]];
      i = min;
    }
  }

  // Seed heap with first entry from each stream
  for (let i = 0; i < streams.length; i++) {
    if (streams[i].length > 0) {
      heap.push({ entry: streams[i][0], streamIndex: i, position: 1 });
      siftUp(heap.length - 1);
    }
  }

  const merged: LogEntry[] = [];

  while (heap.length > 0) {
    // Pop minimum
    const cursor = heap[0];
    merged.push(cursor.entry);

    const stream = streams[cursor.streamIndex];
    if (cursor.position < stream.length) {
      heap[0] = { ...cursor, entry: stream[cursor.position], position: cursor.position + 1 };
      siftDown(0);
    } else {
      heap[0] = heap[heap.length - 1];
      heap.pop();
      if (heap.length > 0) siftDown(0);
    }
  }

  return merged;
}

// mergeLogStreams([server1Logs, server2Logs, server3Logs])
// → single time-ordered stream across all servers`,
      complexity: 'Time: O(N log K) where N = total entries, K = streams | Space: O(K)',
    },
    {
      title: 'Task scheduler — priority job queue',
      description:
        'A job scheduling priority queue where tasks with the highest priority run first. On ties, the task with the earliest deadline runs first. Used in worker pools and background job systems.',
      code: `interface ScheduledJob {
  id: string;
  priority: number;       // higher = more important
  deadlineMs: number;     // Unix timestamp
  handler: string;        // handler function name
}

class JobQueue {
  private heap: ScheduledJob[] = [];

  get size(): number { return this.heap.length; }
  get isEmpty(): boolean { return this.heap.length === 0; }

  private higherPriority(a: ScheduledJob, b: ScheduledJob): boolean {
    if (a.priority !== b.priority) return a.priority > b.priority;
    return a.deadlineMs < b.deadlineMs; // earlier deadline wins tie
  }

  enqueue(job: ScheduledJob): void {
    this.heap.push(job);
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!this.higherPriority(this.heap[i], this.heap[p])) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  dequeue(): ScheduledJob | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let i = 0;
      while (true) {
        let best = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < this.heap.length && this.higherPriority(this.heap[l], this.heap[best])) best = l;
        if (r < this.heap.length && this.higherPriority(this.heap[r], this.heap[best])) best = r;
        if (best === i) break;
        [this.heap[i], this.heap[best]] = [this.heap[best], this.heap[i]];
        i = best;
      }
    }
    return top;
  }
}

// const queue = new JobQueue();
// queue.enqueue({ id: 'j1', priority: 1, deadlineMs: 1700000, handler: 'sendEmail' });
// queue.enqueue({ id: 'j2', priority: 10, deadlineMs: 1700000, handler: 'processPayment' });
// queue.enqueue({ id: 'j3', priority: 10, deadlineMs: 1690000, handler: 'alertOncall' });
// queue.dequeue() → j3 (priority 10, earlier deadline)
// queue.dequeue() → j2 (priority 10, later deadline)
// queue.dequeue() → j1 (priority 1)`,
      complexity: 'Time: O(log n) enqueue/dequeue, O(1) peek | Space: O(n)',
    },
    {
      title: 'Rate-limited API queue — premium users first',
      description:
        'Process API requests in priority order using a max-heap. Premium-tier users get processed before free-tier users, implementing fair but tiered quality-of-service.',
      code: `type Tier = 'enterprise' | 'pro' | 'free';

interface APIRequest {
  requestId: string;
  userId: string;
  tier: Tier;
  endpoint: string;
  receivedAt: number;
}

const TIER_WEIGHT: Record<Tier, number> = {
  enterprise: 100,
  pro: 50,
  free: 10,
};

class PriorityRequestQueue {
  private heap: APIRequest[] = [];

  private weight(req: APIRequest): number {
    return TIER_WEIGHT[req.tier];
  }

  enqueue(req: APIRequest): void {
    this.heap.push(req);
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.weight(this.heap[p]) >= this.weight(this.heap[i])) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  dequeue(): APIRequest | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      let i = 0;
      while (true) {
        let best = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < this.heap.length && this.weight(this.heap[l]) > this.weight(this.heap[best])) best = l;
        if (r < this.heap.length && this.weight(this.heap[r]) > this.weight(this.heap[best])) best = r;
        if (best === i) break;
        [this.heap[i], this.heap[best]] = [this.heap[best], this.heap[i]];
        i = best;
      }
    }
    return top;
  }

  get size(): number { return this.heap.length; }
}

async function processWithRateLimit(
  queue: PriorityRequestQueue,
  maxPerSecond: number
): Promise<void> {
  while (queue.size > 0) {
    const batch: APIRequest[] = [];
    for (let i = 0; i < maxPerSecond && queue.size > 0; i++) {
      batch.push(queue.dequeue()!);
    }
    await Promise.all(batch.map(req => handleRequest(req)));
    await sleep(1000);
  }
}

declare function handleRequest(req: APIRequest): Promise<void>;
declare function sleep(ms: number): Promise<void>;

// Enterprise requests always processed before free-tier,
// even if free-tier requests arrived first`,
      complexity: 'Time: O(log n) enqueue/dequeue | Space: O(n)',
    },
    {
      title: 'Real-time median response time',
      description:
        'Track the median API response time in a sliding window using two heaps. The max-heap holds the lower half, the min-heap holds the upper half — median is always at the root(s).',
      code: `class MedianTracker {
  private lo: number[] = []; // max-heap (negated values)
  private hi: number[] = []; // min-heap

  addResponseTime(ms: number): void {
    // Push to max-heap (negate for max behavior)
    this.heapPush(this.lo, -ms);

    // Balance: move max of lower half to upper half
    this.heapPush(this.hi, -this.heapPop(this.lo));

    // Keep lo.size >= hi.size
    if (this.lo.length < this.hi.length) {
      this.heapPush(this.lo, -this.heapPop(this.hi));
    }
  }

  getMedian(): number {
    if (this.lo.length === 0) return 0;
    if (this.lo.length > this.hi.length) {
      return -this.lo[0];
    }
    return (-this.lo[0] + this.hi[0]) / 2;
  }

  getP50Report(): string {
    const median = this.getMedian();
    const total = this.lo.length + this.hi.length;
    return \`p50: \${median.toFixed(1)}ms (over \${total} requests)\`;
  }

  private heapPush(heap: number[], val: number): void {
    heap.push(val);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  }

  private heapPop(heap: number[]): number {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (true) {
        let min = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < heap.length && heap[l] < heap[min]) min = l;
        if (r < heap.length && heap[r] < heap[min]) min = r;
        if (min === i) break;
        [heap[i], heap[min]] = [heap[min], heap[i]];
        i = min;
      }
    }
    return top;
  }
}

// const tracker = new MedianTracker();
// tracker.addResponseTime(120);
// tracker.addResponseTime(45);
// tracker.addResponseTime(200);
// tracker.addResponseTime(80);
// tracker.getMedian() → 100  (average of 80 and 120)
// tracker.getP50Report() → "p50: 100.0ms (over 4 requests)"`,
      complexity: 'Time: O(log n) per add, O(1) median | Space: O(n)',
    },
    {
      title: 'Notification center — priority inbox',
      description:
        'Render notifications in a priority inbox where urgent alerts (security, payment failures) always surface above informational ones. A max-heap ensures the highest-priority notification is always at the top, even as new ones stream in.',
      code: `type NotificationType = 'security' | 'payment' | 'mention' | 'update' | 'marketing';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const TYPE_PRIORITY: Record<NotificationType, number> = {
  security: 100,
  payment: 80,
  mention: 60,
  update: 30,
  marketing: 10,
};

class NotificationInbox {
  private heap: Notification[] = [];

  private priority(n: Notification): number {
    // Unread items get a boost; within same priority, newer first
    const readPenalty = n.read ? 0 : 50;
    return TYPE_PRIORITY[n.type] + readPenalty + n.timestamp / 1e15;
  }

  add(notification: Notification): void {
    this.heap.push(notification);
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.priority(this.heap[p]) >= this.priority(this.heap[i])) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  peek(): Notification | undefined {
    return this.heap[0];
  }

  getTopN(n: number): Notification[] {
    // Extract n items from a copy of the heap
    const copy = [...this.heap];
    const result: Notification[] = [];
    for (let k = 0; k < n && copy.length > 0; k++) {
      result.push(copy[0]);
      copy[0] = copy[copy.length - 1];
      copy.pop();
      let i = 0;
      while (true) {
        let best = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l < copy.length && this.priority(copy[l]) > this.priority(copy[best])) best = l;
        if (r < copy.length && this.priority(copy[r]) > this.priority(copy[best])) best = r;
        if (best === i) break;
        [copy[i], copy[best]] = [copy[best], copy[i]];
        i = best;
      }
    }
    return result;
  }

  markRead(id: string): void {
    const idx = this.heap.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.heap[idx].read = true;
      // Re-heapify (simplified: rebuild)
      const items = [...this.heap];
      this.heap = [];
      for (const item of items) this.add(item);
    }
  }

  get unreadCount(): number {
    return this.heap.filter((n) => !n.read).length;
  }
}

const inbox = new NotificationInbox();
inbox.add({ id: '1', type: 'marketing', title: 'Sale!', message: '...', timestamp: Date.now() - 5000, read: false });
inbox.add({ id: '2', type: 'security', title: 'New login', message: '...', timestamp: Date.now(), read: false });
// inbox.peek() → security alert (highest priority)
// inbox.getTopN(5) → ordered by priority for notification dropdown`,
      complexity: 'Time: O(log n) add, O(n log n) getTopN | Space: O(n)',
    },
  ],
};
