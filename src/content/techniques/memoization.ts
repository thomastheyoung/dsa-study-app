import type { Topic } from '../types';

export const memoization: Topic = {
  id: 'memoization',
  title: 'Memoization',
  category: 'techniques',
  description: 'Cache the results of expensive function calls to avoid redundant computation — the top-down complement to dynamic programming\'s bottom-up tabulation.',
  invariant: 'Each unique subproblem is computed exactly once. Repeated calls with the same inputs return the cached result in O(1). Total work = (unique subproblems) × (work per subproblem).',
  theory: `**Memoization** stores the results of function calls in a cache (usually a hash map) and returns the cached result when the same inputs occur again. It transforms exponential recursive algorithms into polynomial ones by ensuring each unique subproblem is computed only once.

**Memoization vs tabulation:**
| | Memoization (top-down) | Tabulation (bottom-up) |
|---|---|---|
| Approach | Recursive + cache | Iterative + table |
| Computes | Only needed subproblems | All subproblems |
| Overhead | Function call stack | None (iterative) |
| Stack overflow risk | Yes, for deep recursion | No |
| Ease of implementation | Natural from recursive solution | Requires figuring out order |
| Space optimization | Harder | Easier (rolling array) |

**When to memoize:**
- A recursive function is called with the same arguments multiple times.
- The function is pure — same inputs always produce the same output.
- The number of unique input combinations is manageable (fits in memory).

**Generic memoization:** You can write a higher-order function that wraps any pure function with caching. For functions with multiple arguments, serialize the arguments into a cache key.

**Cache invalidation:**
In algorithm problems, the cache lives for one function call and invalidation is not a concern. In production systems, memoization requires careful cache invalidation:
- **Time-based (TTL):** Expire entries after a duration.
- **Size-based (LRU):** Evict the least recently used entry when the cache is full.
- **Event-based:** Invalidate when the underlying data changes.

**Memoization in practice:**
- React's \`useMemo\` and \`React.memo\` are forms of memoization.
- Database query caches, API response caches, and computed property caches all use memoization principles.
- Be cautious with memoizing functions that have side effects or depend on external state.`,
  visualization: 'MemoizationViz',
  keyPoints: [
    'Memoization = caching pure function results; tabulation = filling a table bottom-up',
    'Memoization only computes subproblems that are actually needed (lazy evaluation)',
    'The cache key must uniquely identify the function inputs',
    'Generic memoize wrappers work for any pure function with serializable arguments',
    'In production: consider TTL, LRU eviction, and cache invalidation strategies',
    'React.memo, useMemo, and useCallback are specialized memoization tools',
  ],
  useCases: [
    {
      title: 'API response caching',
      description:
        'Memoize expensive API calls with TTL-based cache invalidation, preventing redundant network requests while ensuring data freshness.',
      code: `interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

function createAPICache<T>(ttlMs: number = 60_000) {
  const cache = new Map<string, CacheEntry<T>>();

  return async function cachedFetch(
    url: string,
    fetcher: (url: string) => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const cached = cache.get(url);

    if (cached && cached.expiresAt > now) {
      return cached.data; // Cache hit
    }

    // Cache miss or expired — fetch fresh data
    const data = await fetcher(url);
    cache.set(url, { data, expiresAt: now + ttlMs });

    // Lazy cleanup: prune expired entries periodically
    if (cache.size > 1000) {
      for (const [key, entry] of cache) {
        if (entry.expiresAt <= now) cache.delete(key);
      }
    }

    return data;
  };
}

// Usage:
// const fetchUser = createAPICache<User>(5 * 60_000);
// const user = await fetchUser('/api/users/42', url =>
//   fetch(url).then(r => r.json())
// );
// Second call within 5 min → returns cached, no network request`,
      complexity: 'Time: O(1) cache hit, O(n) cleanup | Space: O(n) cached entries',
    },
    {
      title: 'Recursive permission resolution',
      description:
        'Memoize permission lookups in a deep resource hierarchy to avoid redundant tree walks — resources inherit permissions from parent folders.',
      code: `interface Resource {
  id: string;
  parentId: string | null;
  ownPermissions: Set<string>;
}

function createPermissionResolver(
  resources: Map<string, Resource>
) {
  const memo = new Map<string, Set<string>>();

  function resolvePermissions(resourceId: string): Set<string> {
    if (memo.has(resourceId)) {
      return memo.get(resourceId)!;
    }

    const resource = resources.get(resourceId);
    if (!resource) return new Set();

    // Base case: root resource (no parent)
    if (!resource.parentId) {
      memo.set(resourceId, resource.ownPermissions);
      return resource.ownPermissions;
    }

    // Recursive case: merge parent permissions with own
    const parentPerms = resolvePermissions(resource.parentId);
    const merged = new Set([...parentPerms, ...resource.ownPermissions]);
    memo.set(resourceId, merged);
    return merged;
  }

  return resolvePermissions;
}

// Hierarchy: /company → /company/eng → /company/eng/docs
// Without memo: checking 100 files under /company/eng/docs
//   traverses the full path 100 times = 300 lookups
// With memo: first file traverses 3 nodes, remaining 99 are O(1)
//   = 102 lookups total`,
      complexity: 'Time: O(d) first call, O(1) subsequent per resource | Space: O(n * p) where p = avg permissions',
    },
    {
      title: 'React-style computed props',
      description:
        'Memoize derived UI state that depends on multiple inputs, recomputing only when dependencies change — the same pattern as React useMemo.',
      code: `type DependencyList = readonly unknown[];

function createMemo<T>(
  compute: () => T,
  getDeps: () => DependencyList
): () => T {
  let cachedValue: T | undefined;
  let cachedDeps: DependencyList | undefined;

  return (): T => {
    const nextDeps = getDeps();

    if (cachedDeps && depsEqual(cachedDeps, nextDeps)) {
      return cachedValue!; // Dependencies unchanged — return cached
    }

    cachedValue = compute();
    cachedDeps = nextDeps;
    return cachedValue;
  };
}

function depsEqual(a: DependencyList, b: DependencyList): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}

// Usage in a UI component:
// const getFilteredProducts = createMemo(
//   () => products
//     .filter(p => p.category === selectedCategory)
//     .sort((a, b) => a.price - b.price),
//   () => [products, selectedCategory] as const
// );
//
// getFilteredProducts(); // Computes (filter + sort)
// getFilteredProducts(); // Returns cached (deps unchanged)
// selectedCategory = 'electronics';
// getFilteredProducts(); // Recomputes (dep changed)`,
      complexity: 'Time: O(1) when cached, O(f) on recompute | Space: O(1) per memo',
    },
    {
      title: 'Memoized list filtering and sorting',
      description:
        'Cache expensive filter + sort operations on a large product list, recomputing only when filters or sort criteria change — the pattern behind efficient data grids and e-commerce product pages.',
      code: `interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  inStock: boolean;
}

interface FilterCriteria {
  category: string | null;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'price' | 'rating' | 'name';
  sortDir: 'asc' | 'desc';
}

function createProductListMemo() {
  let cachedKey = '';
  let cachedResult: Product[] = [];

  function serializeKey(
    products: Product[],
    filters: FilterCriteria
  ): string {
    // Use products length + last ID as a cheap identity check
    const dataKey = \`\${products.length}:\${products[products.length - 1]?.id}\`;
    return \`\${dataKey}|\${JSON.stringify(filters)}\`;
  }

  return function getFilteredProducts(
    products: Product[],
    filters: FilterCriteria
  ): Product[] {
    const key = serializeKey(products, filters);

    if (key === cachedKey) {
      return cachedResult; // Cache hit — skip filter + sort
    }

    // Cache miss — recompute
    let result = products.filter((p) => {
      if (filters.category && p.category !== filters.category) return false;
      if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      const valA = a[filters.sortBy];
      const valB = b[filters.sortBy];
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return filters.sortDir === 'desc' ? -cmp : cmp;
    });

    cachedKey = key;
    cachedResult = result;
    return result;
  };
}

// Usage in a component:
// const getProducts = createProductListMemo();
//
// On every render:
//   const visible = getProducts(allProducts, currentFilters);
//
// If filters haven't changed → returns cached array (same reference)
// If user changes sort direction → recomputes and caches
// Prevents re-rendering 10,000 product cards on unrelated state changes`,
      complexity: 'Time: O(1) cache hit, O(n log n) miss | Space: O(n) cached result',
    },
    {
      title: 'Configuration resolution',
      description:
        'Memoize resolved config values from layered sources (env vars, config file, defaults), avoiding repeated resolution for frequently accessed keys.',
      code: `type ConfigSource = {
  name: string;
  priority: number; // Higher = takes precedence
  get: (key: string) => string | undefined;
};

function createConfigResolver(sources: ConfigSource[]) {
  // Sort sources by priority descending (highest priority first)
  const sorted = [...sources].sort((a, b) => b.priority - a.priority);
  const memo = new Map<string, string | undefined>();

  function resolve(key: string): string | undefined {
    if (memo.has(key)) return memo.get(key);

    // Walk sources in priority order, return first defined value
    for (const source of sorted) {
      const value = source.get(key);
      if (value !== undefined) {
        memo.set(key, value);
        return value;
      }
    }

    memo.set(key, undefined);
    return undefined;
  }

  function invalidate(key?: string): void {
    if (key) {
      memo.delete(key);
    } else {
      memo.clear(); // Full invalidation (e.g., config file reload)
    }
  }

  return { resolve, invalidate };
}

// const config = createConfigResolver([
//   { name: 'env',      priority: 3, get: k => process.env[k] },
//   { name: 'file',     priority: 2, get: k => fileConfig[k] },
//   { name: 'defaults', priority: 1, get: k => defaults[k] },
// ]);
// config.resolve('DB_HOST');  // Checks env → file → defaults, caches result
// config.resolve('DB_HOST');  // Returns cached value instantly`,
      complexity: 'Time: O(s) first lookup, O(1) cached | Space: O(k) for k unique keys',
    },
    {
      title: 'Expensive computation throttle',
      description:
        'Memoize with LRU eviction for expensive operations like image resize or PDF generation, bounding memory usage while caching hot results.',
      code: `class LRUMemoCache<K, V> {
  private cache = new Map<K, V>();

  constructor(private maxSize: number) {}

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict least recently used (first entry in Map)
      const lruKey = this.cache.keys().next().value!;
      this.cache.delete(lruKey);
    }
    this.cache.set(key, value);
  }
}

interface ResizeParams {
  width: number;
  height: number;
  quality: number;
}

function createImageResizer(maxCached: number = 200) {
  const cache = new LRUMemoCache<string, Buffer>(maxCached);

  return async function resize(
    imageId: string,
    params: ResizeParams,
    doResize: (id: string, p: ResizeParams) => Promise<Buffer>
  ): Promise<Buffer> {
    const key = \`\${imageId}:\${params.width}x\${params.height}@\${params.quality}\`;
    const cached = cache.get(key);
    if (cached) return cached;

    const result = await doResize(imageId, params);
    cache.set(key, result);
    return result;
  };
}

// First resize(img, 200x200) → 150ms (computed)
// Second resize(img, 200x200) → <1ms (cached)
// After 200 unique resizes, oldest entries are evicted`,
      complexity: 'Time: O(1) hit/evict | Space: O(maxSize)',
    },
  ],
};
