import type { Topic } from '../types';

export const linkedLists: Topic = {
  id: 'linked-lists',
  title: 'Linked Lists',
  category: 'data-structures',
  description: 'Node-based sequences with O(1) insertion/deletion — the foundation for stacks, queues, and LRU caches.',
  complexity: {
    access: 'O(n)',
    search: 'O(n)',
    insert: 'O(1)',
    delete: 'O(1)',
  },
  theory: `A linked list is a linear data structure where each element (node) contains a value and a pointer to the next node. Unlike arrays, nodes are not stored in contiguous memory — each node is independently allocated.

**Singly linked list:**
- Each node has \`val\` and \`next\`. Traversal is one-directional.
- Insertion/deletion at a known position is O(1), but finding that position is O(n).
- Uses less memory per node than a doubly linked list.

**Doubly linked list:**
- Each node has \`val\`, \`next\`, and \`prev\`. Traversal is bidirectional.
- Deletion of a known node is O(1) without needing its predecessor.
- Used in LRU caches, browser history, and undo systems.

**Advantages over arrays:**
- O(1) insertion/deletion at any known position (no shifting).
- Dynamic size — no resizing or wasted capacity.
- No contiguous memory requirement.

**Disadvantages:**
- O(n) access by index — no random access.
- Poor cache locality — nodes scattered in memory.
- Extra memory per node for pointer(s).

**Common patterns:**
- **Dummy head node:** Simplifies edge cases for insertion/deletion at the head.
- **Two pointers (fast/slow):** Detect cycles, find midpoints, find the kth node from the end.
- **Reverse in-place:** Rewire pointers iteratively — a must-know interview skill.`,
  keyPoints: [
    'O(1) insert/delete at a known node — no shifting like arrays',
    'O(n) access — must traverse from head',
    'Singly linked: less memory, but can only traverse forward',
    'Doubly linked: bidirectional traversal, O(1) delete of known node',
    'Dummy head node eliminates head-null edge cases',
    'Fast/slow pointer technique: cycle detection, midpoint, nth from end',
  ],
  visualization: 'LinkedListViz',
  useCases: [
    {
      title: 'LRU cache',
      description:
        'Doubly linked list + HashMap for O(1) get/put cache with eviction — the standard production cache pattern used in CDNs and database query caches.',
      code: `class CacheNode<K, V> {
  constructor(
    public key: K,
    public value: V,
    public prev: CacheNode<K, V> | null = null,
    public next: CacheNode<K, V> | null = null
  ) {}
}

class LRUCache<K, V> {
  private map = new Map<K, CacheNode<K, V>>();
  private head = new CacheNode<K, V>(null as K, null as V);
  private tail = new CacheNode<K, V>(null as K, null as V);

  constructor(private readonly capacity: number) {
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToFront(node);
    return node.value;
  }

  put(key: K, value: V): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.moveToFront(existing);
      return;
    }
    const node = new CacheNode(key, value);
    this.map.set(key, node);
    this.addAfter(this.head, node);

    if (this.map.size > this.capacity) {
      const evicted = this.tail.prev!;
      this.remove(evicted);
      this.map.delete(evicted.key);
    }
  }

  private addAfter(anchor: CacheNode<K, V>, node: CacheNode<K, V>) {
    node.prev = anchor;
    node.next = anchor.next;
    anchor.next!.prev = node;
    anchor.next = node;
  }

  private remove(node: CacheNode<K, V>) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToFront(node: CacheNode<K, V>) {
    this.remove(node);
    this.addAfter(this.head, node);
  }
}

// DB query cache: evict least-recently-queried results
const queryCache = new LRUCache<string, unknown>(500);`,
      complexity: 'Time: O(1) get/put | Space: O(capacity)',
    },
    {
      title: 'Undo history with memory budget',
      description:
        'Capped undo history that drops oldest entries when a memory limit is hit, using a doubly linked list for O(1) eviction from either end.',
      code: `interface Snapshot {
  action: string;
  data: Uint8Array;
  sizeBytes: number;
}

class SnapshotNode {
  prev: SnapshotNode | null = null;
  next: SnapshotNode | null = null;
  constructor(public snapshot: Snapshot) {}
}

class BoundedUndoHistory {
  private head: SnapshotNode | null = null;
  private tail: SnapshotNode | null = null;
  private currentBytes = 0;
  private count = 0;

  constructor(private readonly maxBytes: number) {}

  push(snapshot: Snapshot): void {
    // Evict oldest until under budget
    while (
      this.currentBytes + snapshot.sizeBytes > this.maxBytes &&
      this.head
    ) {
      this.dropOldest();
    }

    const node = new SnapshotNode(snapshot);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.currentBytes += snapshot.sizeBytes;
    this.count++;
  }

  popLatest(): Snapshot | undefined {
    if (!this.tail) return undefined;
    const node = this.tail;
    this.tail = node.prev;
    if (this.tail) this.tail.next = null;
    else this.head = null;
    this.currentBytes -= node.snapshot.sizeBytes;
    this.count--;
    return node.snapshot;
  }

  private dropOldest(): void {
    if (!this.head) return;
    const node = this.head;
    this.head = node.next;
    if (this.head) this.head.prev = null;
    else this.tail = null;
    this.currentBytes -= node.snapshot.sizeBytes;
    this.count--;
  }

  get usedBytes(): number { return this.currentBytes; }
  get length(): number { return this.count; }
}

// 50MB undo budget for an image editor
const undoHistory = new BoundedUndoHistory(50 * 1024 * 1024);`,
      complexity: 'Time: O(1) push/pop/evict | Space: O(maxBytes budget)',
    },
    {
      title: 'Middleware chain',
      description:
        'Express/Koa-style middleware pipeline where each handler node points to the next, allowing dynamic insertion and removal of processing steps.',
      code: `interface Context {
  request: { url: string; method: string; headers: Record<string, string> };
  response: { status: number; body: unknown };
  state: Record<string, unknown>;
}

type Handler = (ctx: Context, next: () => Promise<void>) => Promise<void>;

class MiddlewareNode {
  next: MiddlewareNode | null = null;
  constructor(
    public name: string,
    public handler: Handler
  ) {}
}

class MiddlewareChain {
  private head: MiddlewareNode | null = null;
  private tail: MiddlewareNode | null = null;

  append(name: string, handler: Handler): MiddlewareNode {
    const node = new MiddlewareNode(name, handler);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    return node;
  }

  insertAfter(target: MiddlewareNode, name: string, handler: Handler) {
    const node = new MiddlewareNode(name, handler);
    node.next = target.next;
    target.next = node;
    if (target === this.tail) this.tail = node;
  }

  async execute(ctx: Context): Promise<void> {
    const run = async (node: MiddlewareNode | null): Promise<void> => {
      if (!node) return;
      await node.handler(ctx, () => run(node.next));
    };
    await run(this.head);
  }
}

const chain = new MiddlewareChain();
chain.append('logger', async (ctx, next) => {
  const start = Date.now();
  await next();
  console.log(\`\${ctx.request.method} \${ctx.request.url} \${Date.now() - start}ms\`);
});
chain.append('auth', async (ctx, next) => {
  if (!ctx.request.headers['authorization']) {
    ctx.response.status = 401;
    return;
  }
  await next();
});`,
      complexity: 'Time: O(m) middleware count | Space: O(m) nodes',
    },
    {
      title: 'Music playlist',
      description:
        'Doubly linked list for prev/next track navigation with shuffle support, modeling a media player queue.',
      code: `interface Track {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
}

class TrackNode {
  prev: TrackNode | null = null;
  next: TrackNode | null = null;
  constructor(public track: Track) {}
}

class Playlist {
  private head: TrackNode | null = null;
  private tail: TrackNode | null = null;
  private current: TrackNode | null = null;
  private size = 0;

  append(track: Track): void {
    const node = new TrackNode(track);
    if (!this.tail) {
      this.head = this.tail = this.current = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.size++;
  }

  next(): Track | null {
    if (!this.current?.next) return null;
    this.current = this.current.next;
    return this.current.track;
  }

  prev(): Track | null {
    if (!this.current?.prev) return null;
    this.current = this.current.prev;
    return this.current.track;
  }

  remove(node: TrackNode): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    if (this.current === node) this.current = node.next ?? node.prev;
    this.size--;
  }

  shuffle(): void {
    // Collect into array, Fisher-Yates shuffle, rebuild list
    const nodes: TrackNode[] = [];
    let n = this.head;
    while (n) { nodes.push(n); n = n.next; }
    for (let i = nodes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
    }
    // Rewire
    this.head = nodes[0] ?? null;
    this.tail = nodes[nodes.length - 1] ?? null;
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].prev = nodes[i - 1] ?? null;
      nodes[i].next = nodes[i + 1] ?? null;
    }
    this.current = this.head;
  }

  get nowPlaying(): Track | null {
    return this.current?.track ?? null;
  }
}`,
      complexity: 'Time: O(1) next/prev/remove, O(n) shuffle | Space: O(n)',
    },
    {
      title: 'Image carousel',
      description:
        'Doubly linked list for a circular image carousel with prev/next navigation and auto-advance. Wraps around at both ends for infinite loop behavior.',
      code: `interface Slide {
  id: string;
  src: string;
  alt: string;
}

class SlideNode {
  prev: SlideNode | null = null;
  next: SlideNode | null = null;
  constructor(public slide: Slide) {}
}

class Carousel {
  private head: SlideNode | null = null;
  private current: SlideNode | null = null;
  private size = 0;

  append(slide: Slide): void {
    const node = new SlideNode(slide);
    if (!this.head) {
      this.head = this.current = node;
      node.next = node; // circular
      node.prev = node;
    } else {
      const tail = this.head.prev!;
      tail.next = node;
      node.prev = tail;
      node.next = this.head;
      this.head.prev = node;
    }
    this.size++;
  }

  next(): Slide | null {
    if (!this.current) return null;
    this.current = this.current.next;
    return this.current!.slide;
  }

  prev(): Slide | null {
    if (!this.current) return null;
    this.current = this.current.prev;
    return this.current!.slide;
  }

  goTo(id: string): Slide | null {
    if (!this.head) return null;
    let node = this.head;
    for (let i = 0; i < this.size; i++) {
      if (node.slide.id === id) {
        this.current = node;
        return node.slide;
      }
      node = node.next!;
    }
    return null;
  }

  get currentSlide(): Slide | null {
    return this.current?.slide ?? null;
  }

  get count(): number {
    return this.size;
  }
}

const carousel = new Carousel();
carousel.append({ id: '1', src: '/hero-1.jpg', alt: 'Product shot 1' });
carousel.append({ id: '2', src: '/hero-2.jpg', alt: 'Product shot 2' });
carousel.append({ id: '3', src: '/hero-3.jpg', alt: 'Product shot 3' });
carousel.next(); // → slide 2
carousel.next(); // → slide 3
carousel.next(); // → wraps to slide 1 (circular)
carousel.prev(); // → back to slide 3`,
      complexity: 'Time: O(1) next/prev, O(n) goTo | Space: O(n)',
    },
    {
      title: 'Task dependency ordering',
      description:
        'Linked chain of dependent deployment steps that execute in sequence, where each step must complete before its successor starts.',
      code: `type TaskStatus = 'pending' | 'running' | 'done' | 'failed';

class DeployStep {
  next: DeployStep | null = null;
  status: TaskStatus = 'pending';
  error: string | null = null;

  constructor(
    public name: string,
    public execute: () => Promise<void>
  ) {}
}

class DeployPipeline {
  private head: DeployStep | null = null;
  private tail: DeployStep | null = null;

  addStep(name: string, execute: () => Promise<void>): DeployStep {
    const step = new DeployStep(name, execute);
    if (!this.tail) {
      this.head = this.tail = step;
    } else {
      this.tail.next = step;
      this.tail = step;
    }
    return step;
  }

  async run(): Promise<{ success: boolean; failedStep?: string }> {
    let current = this.head;

    while (current) {
      current.status = 'running';
      try {
        await current.execute();
        current.status = 'done';
      } catch (err) {
        current.status = 'failed';
        current.error = err instanceof Error ? err.message : String(err);
        return { success: false, failedStep: current.name };
      }
      current = current.next;
    }

    return { success: true };
  }

  getStatus(): Array<{ name: string; status: TaskStatus }> {
    const result: Array<{ name: string; status: TaskStatus }> = [];
    let step = this.head;
    while (step) {
      result.push({ name: step.name, status: step.status });
      step = step.next;
    }
    return result;
  }
}

const deploy = new DeployPipeline();
deploy.addStep('run-migrations', async () => { /* ... */ });
deploy.addStep('build-assets', async () => { /* ... */ });
deploy.addStep('swap-traffic', async () => { /* ... */ });
deploy.addStep('health-check', async () => { /* ... */ });
// deploy.run(); // stops at first failure`,
      complexity: 'Time: O(n) steps | Space: O(n)',
    },
  ],
};
