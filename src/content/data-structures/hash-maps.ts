import type { Topic } from '../types';

export const hashMaps: Topic = {
  id: 'hash-maps',
  title: 'Hash Maps',
  category: 'data-structures',
  description: 'Key-value stores with O(1) average lookup — the Swiss Army knife of interview problems.',
  complexity: {
    access: 'N/A',
    search: 'O(1) avg / O(n) worst',
    insert: 'O(1) avg / O(n) worst',
    delete: 'O(1) avg / O(n) worst',
  },
  theory: `Hash maps store key-value pairs by computing a hash of the key to determine the storage index (bucket). A good hash function distributes keys uniformly across buckets, minimizing collisions. In JavaScript, \`Map\` and plain objects both act as hash maps, but \`Map\` preserves insertion order, allows any key type, and has a \`.size\` property.

**Hash function basics:**
- A hash function maps a key to an integer index. It must be deterministic (same key → same hash) and should distribute keys uniformly.
- JavaScript's \`Map\` uses an internal hash; you don't control it directly.

**Collision resolution:**
- **Chaining:** Each bucket holds a linked list (or array) of entries. On collision, the new entry is appended. Lookup walks the chain — O(k) where k is the chain length.
- **Open addressing:** On collision, probe for the next empty slot (linear probing, quadratic probing, or double hashing). All entries live in the array itself.

**Load factor and rehashing:**
- Load factor = n / buckets. When it exceeds a threshold (commonly 0.75), the table doubles in size and all keys are rehashed. This makes insertion amortized O(1).

**When to use hash maps:**
- You need fast lookup/insert/delete by key.
- Counting frequencies, grouping, caching, deduplication.
- Converting an O(n²) brute-force into O(n) with a complement lookup.

**When NOT to use hash maps:**
- You need ordered iteration by key → use a balanced BST or sorted array.
- Keys aren't hashable or equality is complex.
- Memory is extremely constrained (hash maps have overhead).`,
  keyPoints: [
    'O(1) average lookup, insert, delete — the defining feature',
    'Worst case O(n) when all keys collide into one bucket',
    'Load factor triggers rehashing — amortized O(1) insert',
    'JS Map vs object: Map allows any key type and preserves insertion order',
    'Chaining vs open addressing: trade-offs in cache locality and deletion complexity',
    'Hash maps are the #1 tool for reducing brute-force O(n²) to O(n)',
  ],
  visualization: 'HashMapViz',
  useCases: [
    {
      title: 'API response cache with TTL',
      description:
        'LRU-style cache using Map with TTL expiration for expensive API calls, avoiding redundant external requests in a backend service.',
      code: `interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(
    private readonly maxSize: number,
    private readonly defaultTTLMs: number
  ) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    // Move to end (most recently used) via re-insert
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs = this.defaultTTLMs): void {
    this.store.delete(key); // remove if exists for LRU re-order
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });

    if (this.store.size > this.maxSize) {
      const oldest = this.store.keys().next().value!;
      this.store.delete(oldest);
    }
  }
}

// Cache GitHub API responses for 5 minutes, max 1000 entries
const apiCache = new TTLCache<unknown>(1000, 5 * 60_000);
apiCache.set('/repos/org/repo', { stars: 42 });
apiCache.get('/repos/org/repo'); // hit or undefined if expired`,
      complexity: 'Time: O(1) get/set | Space: O(maxSize)',
    },
    {
      title: 'Form validation state manager',
      description:
        'Track validation errors by field name in a Map, supporting per-field error display, cross-field validation, and clearing errors on input — the core of any form library.',
      code: `type ValidationRule = (value: unknown, allValues: FormValues) => string | null;

type FormValues = Record<string, unknown>;

interface FieldConfig {
  rules: ValidationRule[];
  dependsOn?: string[]; // Re-validate when these fields change
}

class FormValidator {
  private errors = new Map<string, string[]>();
  private fields = new Map<string, FieldConfig>();
  private values: FormValues = {};

  register(name: string, config: FieldConfig): void {
    this.fields.set(name, config);
  }

  setFieldValue(name: string, value: unknown): void {
    this.values[name] = value;
    // Validate this field
    this.validateField(name);
    // Re-validate dependent fields
    for (const [field, config] of this.fields) {
      if (config.dependsOn?.includes(name)) {
        this.validateField(field);
      }
    }
  }

  private validateField(name: string): void {
    const config = this.fields.get(name);
    if (!config) return;

    const fieldErrors: string[] = [];
    for (const rule of config.rules) {
      const error = rule(this.values[name], this.values);
      if (error) fieldErrors.push(error);
    }

    if (fieldErrors.length > 0) {
      this.errors.set(name, fieldErrors);
    } else {
      this.errors.delete(name);
    }
  }

  getErrors(name: string): string[] {
    return this.errors.get(name) ?? [];
  }

  get isValid(): boolean {
    return this.errors.size === 0;
  }

  get allErrors(): Record<string, string[]> {
    return Object.fromEntries(this.errors);
  }
}

// Usage:
const form = new FormValidator();
form.register('email', {
  rules: [
    (v) => (v ? null : 'Email is required'),
    (v) => (/@/.test(String(v)) ? null : 'Invalid email'),
  ],
});
form.register('confirmEmail', {
  rules: [(v, all) => (v === all.email ? null : 'Emails must match')],
  dependsOn: ['email'],
});
form.setFieldValue('email', 'a@b.com');
form.setFieldValue('confirmEmail', 'x@y.com');
// form.getErrors('confirmEmail') → ['Emails must match']`,
      complexity: 'Time: O(1) per field lookup, O(rules) validation | Space: O(fields)',
    },
    {
      title: 'Feature flag evaluation',
      description:
        'Evaluate feature flags with user targeting rules stored in a Map, supporting percentage rollouts and user allowlists.',
      code: `interface FeatureFlag {
  enabled: boolean;
  rolloutPercent: number;
  allowlist: Set<string>;
  blocklist: Set<string>;
}

class FeatureFlagService {
  private flags = new Map<string, FeatureFlag>();

  register(flagId: string, config: FeatureFlag): void {
    this.flags.set(flagId, config);
  }

  evaluate(flagId: string, userId: string): boolean {
    const flag = this.flags.get(flagId);
    if (!flag || !flag.enabled) return false;
    if (flag.blocklist.has(userId)) return false;
    if (flag.allowlist.has(userId)) return true;

    // Deterministic hash for consistent bucketing
    const hash = this.hashPair(flagId, userId);
    return (hash % 100) < flag.rolloutPercent;
  }

  private hashPair(a: string, b: string): number {
    const str = a + ':' + b;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }
}

const flags = new FeatureFlagService();
flags.register('dark-mode', {
  enabled: true,
  rolloutPercent: 25,
  allowlist: new Set(['user_beta_tester']),
  blocklist: new Set(),
});
flags.evaluate('dark-mode', 'user_abc'); // deterministic true/false`,
      complexity: 'Time: O(1) evaluate | Space: O(flags * users in lists)',
    },
    {
      title: 'Request deduplication',
      description:
        'Deduplicate webhook deliveries using an idempotency key Map, preventing double-processing of payment events.',
      code: `interface WebhookEvent {
  idempotencyKey: string;
  type: string;
  payload: Record<string, unknown>;
}

interface ProcessedRecord {
  processedAt: number;
  result: 'success' | 'failure';
}

class WebhookDeduplicator {
  private processed = new Map<string, ProcessedRecord>();

  async handle(
    event: WebhookEvent,
    processor: (e: WebhookEvent) => Promise<void>
  ): Promise<{ action: 'processed' | 'skipped' }> {
    if (this.processed.has(event.idempotencyKey)) {
      return { action: 'skipped' };
    }

    try {
      await processor(event);
      this.processed.set(event.idempotencyKey, {
        processedAt: Date.now(),
        result: 'success',
      });
    } catch {
      this.processed.set(event.idempotencyKey, {
        processedAt: Date.now(),
        result: 'failure',
      });
    }

    return { action: 'processed' };
  }

  purgeOlderThan(maxAgeMs: number): number {
    const cutoff = Date.now() - maxAgeMs;
    let purged = 0;
    for (const [key, record] of this.processed) {
      if (record.processedAt < cutoff) {
        this.processed.delete(key);
        purged++;
      }
    }
    return purged;
  }
}

// Stripe sends webhook twice — second delivery is a no-op
const dedup = new WebhookDeduplicator();`,
      complexity: 'Time: O(1) lookup/insert | Space: O(n) stored keys',
    },
    {
      title: 'Session store with auto-expiry',
      description:
        'In-memory session management with automatic expiry for an authentication layer, mapping session tokens to user data.',
      code: `interface Session {
  userId: string;
  roles: string[];
  createdAt: number;
  expiresAt: number;
  metadata: Record<string, string>;
}

class SessionStore {
  private sessions = new Map<string, Session>();

  create(token: string, userId: string, ttlMs: number): Session {
    const session: Session = {
      userId,
      roles: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
      metadata: {},
    };
    this.sessions.set(token, session);
    return session;
  }

  validate(token: string): Session | null {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }

  revoke(token: string): boolean {
    return this.sessions.delete(token);
  }

  revokeAllForUser(userId: string): number {
    let count = 0;
    for (const [token, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(token);
        count++;
      }
    }
    return count;
  }

  get activeCount(): number {
    return this.sessions.size;
  }
}

const store = new SessionStore();
store.create('tok_abc', 'user_123', 30 * 60_000); // 30min
store.validate('tok_abc'); // Session or null`,
      complexity: 'Time: O(1) create/validate/revoke | Space: O(n) sessions',
    },
    {
      title: 'Analytics event aggregation',
      description:
        'Aggregate page view events by URL path, counting unique visitors using nested Maps for a real-time analytics dashboard.',
      code: `interface PageViewEvent {
  path: string;
  visitorId: string;
  timestamp: number;
  referrer: string;
}

interface PathStats {
  totalViews: number;
  uniqueVisitors: Set<string>;
  referrerCounts: Map<string, number>;
}

class AnalyticsAggregator {
  private stats = new Map<string, PathStats>();

  ingest(event: PageViewEvent): void {
    let pathStats = this.stats.get(event.path);

    if (!pathStats) {
      pathStats = {
        totalViews: 0,
        uniqueVisitors: new Set(),
        referrerCounts: new Map(),
      };
      this.stats.set(event.path, pathStats);
    }

    pathStats.totalViews++;
    pathStats.uniqueVisitors.add(event.visitorId);

    if (event.referrer) {
      const prev = pathStats.referrerCounts.get(event.referrer) ?? 0;
      pathStats.referrerCounts.set(event.referrer, prev + 1);
    }
  }

  getReport(path: string) {
    const s = this.stats.get(path);
    if (!s) return null;
    return {
      totalViews: s.totalViews,
      uniqueVisitors: s.uniqueVisitors.size,
      topReferrers: [...s.referrerCounts.entries()]
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    };
  }
}

const analytics = new AnalyticsAggregator();
analytics.ingest({
  path: '/pricing',
  visitorId: 'v_8f3a',
  timestamp: Date.now(),
  referrer: 'google.com',
});`,
      complexity: 'Time: O(1) ingest | Space: O(paths * visitors)',
    },
  ],
};
