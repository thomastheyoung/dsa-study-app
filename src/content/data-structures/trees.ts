import type { Topic } from '../types';

export const trees: Topic = {
  id: 'trees',
  title: 'Trees',
  category: 'data-structures',
  description: 'Hierarchical structures enabling O(log n) operations — BSTs, traversals, and recursive problem decomposition.',
  complexity: {
    access: 'O(log n) balanced / O(n) skewed',
    search: 'O(log n) balanced / O(n) skewed',
    insert: 'O(log n) balanced / O(n) skewed',
    delete: 'O(log n) balanced / O(n) skewed',
  },
  theory: `A tree is a connected acyclic graph. A binary tree is a tree where each node has at most two children (left and right). Trees are the go-to structure for hierarchical data and divide-and-conquer algorithms.

**Binary Search Tree (BST):**
- Left subtree values < node value < right subtree values.
- Inorder traversal of a BST yields sorted order.
- Operations are O(h) where h = height. Balanced: h = log n. Skewed: h = n.

**Balanced trees:**
- AVL trees maintain |height(left) - height(right)| ≤ 1 at every node via rotations.
- Red-black trees guarantee h ≤ 2·log(n+1) with color-based balancing.
- In interviews, you rarely implement balancing — but know why it matters.

**Traversals:**
- **Inorder (left, root, right):** Sorted order for BSTs. Used for validation and kth-smallest.
- **Preorder (root, left, right):** Serialize a tree; reconstruct from preorder.
- **Postorder (left, right, root):** Delete/free nodes; compute subtree properties bottom-up.
- **Level-order (BFS):** Process nodes level by level using a queue.

**Key patterns:**
- Most tree problems use recursion — think in terms of "solve for left subtree, solve for right subtree, combine."
- Return values from recursive calls: height, validity, count, path sum.
- Sometimes you need to pass information downward (via parameters) and upward (via return values) simultaneously.`,
  keyPoints: [
    'BST property: left < root < right — enables O(log n) search in balanced trees',
    'Inorder traversal of BST gives sorted order',
    'Tree height matters: balanced = O(log n), skewed = O(n)',
    'Most tree problems decompose into: solve left, solve right, combine',
    'Preorder for serialization, inorder for sorted order, postorder for bottom-up computation',
    'Level-order traversal (BFS) uses a queue, not recursion',
  ],
  visualization: 'TreeViz',
  useCases: [
    {
      title: 'Nested navigation menu',
      description:
        'Render a multi-level sidebar navigation with expand/collapse state. Tree traversal determines which items are visible, computes active paths, and expands ancestor nodes when a deep link is active.',
      code: `interface NavItem {
  id: string;
  label: string;
  href: string;
  children: NavItem[];
}

interface FlatNavItem {
  id: string;
  label: string;
  href: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isActive: boolean;
  isInActivePath: boolean;
}

function buildVisibleNav(
  items: NavItem[],
  activePath: string,
  expandedIds: Set<string>,
  depth: number = 0
): FlatNavItem[] {
  const result: FlatNavItem[] = [];

  for (const item of items) {
    const isActive = item.href === activePath;
    const isInActivePath = isActive || hasActiveDescendant(item, activePath);
    const isExpanded = expandedIds.has(item.id) || isInActivePath;

    result.push({
      id: item.id,
      label: item.label,
      href: item.href,
      depth,
      hasChildren: item.children.length > 0,
      isExpanded,
      isActive,
      isInActivePath,
    });

    // Only render children if this node is expanded
    if (isExpanded && item.children.length > 0) {
      result.push(
        ...buildVisibleNav(item.children, activePath, expandedIds, depth + 1)
      );
    }
  }

  return result;
}

function hasActiveDescendant(item: NavItem, activePath: string): boolean {
  for (const child of item.children) {
    if (child.href === activePath) return true;
    if (hasActiveDescendant(child, activePath)) return true;
  }
  return false;
}

// Navigation tree:
//   Dashboard (/dashboard)
//   Settings (/settings)
//     ├── Profile (/settings/profile)
//     └── Security (/settings/security)
//         └── 2FA (/settings/security/2fa)  ← active
//
// buildVisibleNav(nav, '/settings/security/2fa', new Set())
// → Settings auto-expanded, Security auto-expanded, 2FA marked active`,
      complexity: 'Time: O(n) all nodes visited | Space: O(h) recursion depth',
    },
    {
      title: 'Org chart — find common manager (LCA)',
      description:
        'Find the lowest common ancestor of two employees in a company hierarchy. Used in HR tools to determine the shared reporting chain for cross-team collaboration.',
      code: `interface Employee {
  id: string;
  name: string;
  title: string;
  directReports: Employee[];
}

function findCommonManager(
  root: Employee,
  empA: string,
  empB: string
): Employee | null {
  if (root.id === empA || root.id === empB) {
    return root;
  }

  const foundIn: Employee[] = [];

  for (const report of root.directReports) {
    const result = findCommonManager(report, empA, empB);
    if (result !== null) {
      foundIn.push(result);
    }
  }

  // Both employees found in different subtrees — root is LCA
  if (foundIn.length >= 2) return root;

  // Found in exactly one subtree — propagate up
  if (foundIn.length === 1) return foundIn[0];

  return null;
}

// Example org chart:
//            CEO (Alice)
//           /           \\
//     VP Eng (Bob)    VP Sales (Carol)
//      /       \\            \\
//  Staff (Dan)  Lead (Eve)  Lead (Frank)
//
// findCommonManager(ceo, 'dan', 'eve')
// → Bob (VP Eng — manages both)
//
// findCommonManager(ceo, 'dan', 'frank')
// → Alice (CEO — different branches)`,
      complexity: 'Time: O(n) | Space: O(h) where h = org depth',
    },
    {
      title: 'DOM element lookup',
      description:
        'Traverse a virtual DOM tree to find all elements matching a tag name or CSS class. A BFS approach processes level by level, useful for rendering engines and testing frameworks.',
      code: `interface VNode {
  tag: string;
  classes: string[];
  attrs: Record<string, string>;
  children: VNode[];
}

function querySelectorAll(
  root: VNode,
  selector: { tag?: string; className?: string }
): VNode[] {
  const matches: VNode[] = [];
  const queue: VNode[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;

    const tagMatch = !selector.tag || node.tag === selector.tag;
    const classMatch =
      !selector.className ||
      node.classes.includes(selector.className);

    if (tagMatch && classMatch) {
      matches.push(node);
    }

    for (const child of node.children) {
      queue.push(child);
    }
  }

  return matches;
}

// Example virtual DOM:
// <div class="app">
//   <nav class="sidebar">
//     <button class="nav-btn">Home</button>
//     <button class="nav-btn">Settings</button>
//   </nav>
//   <main>
//     <button class="submit-btn">Save</button>
//   </main>
// </div>
//
// querySelectorAll(root, { tag: 'button' })
// → [Home button, Settings button, Save button]
//
// querySelectorAll(root, { className: 'nav-btn' })
// → [Home button, Settings button]`,
      complexity: 'Time: O(n) | Space: O(w) where w = max tree width',
    },
    {
      title: 'Route trie — HTTP path matching',
      description:
        'An HTTP router using a trie to match URL paths to handler functions. Each path segment is a trie node, supporting static segments and :param wildcards like Express.js.',
      code: `type RouteHandler = (params: Record<string, string>) => void;

interface TrieNode {
  children: Map<string, TrieNode>;
  paramName: string | null;     // e.g. "id" for :id
  paramChild: TrieNode | null;  // wildcard child
  handler: RouteHandler | null;
}

function createNode(): TrieNode {
  return { children: new Map(), paramName: null, paramChild: null, handler: null };
}

function addRoute(root: TrieNode, path: string, handler: RouteHandler): void {
  let node = root;

  for (const segment of path.split('/').filter(Boolean)) {
    if (segment.startsWith(':')) {
      if (!node.paramChild) node.paramChild = createNode();
      node.paramChild.paramName = segment.slice(1);
      node = node.paramChild;
    } else {
      if (!node.children.has(segment)) {
        node.children.set(segment, createNode());
      }
      node = node.children.get(segment)!;
    }
  }
  node.handler = handler;
}

function matchRoute(
  root: TrieNode,
  url: string
): { handler: RouteHandler; params: Record<string, string> } | null {
  let node = root;
  const params: Record<string, string> = {};

  for (const segment of url.split('/').filter(Boolean)) {
    if (node.children.has(segment)) {
      node = node.children.get(segment)!;
    } else if (node.paramChild) {
      params[node.paramChild.paramName!] = segment;
      node = node.paramChild;
    } else {
      return null; // no match
    }
  }

  return node.handler ? { handler: node.handler, params } : null;
}

// addRoute(root, '/api/users/:id/posts', handleUserPosts);
// matchRoute(root, '/api/users/42/posts')
// → { handler: handleUserPosts, params: { id: '42' } }`,
      complexity: 'Time: O(m) per lookup where m = path segments | Space: O(total segments across all routes)',
    },
    {
      title: 'JSON config deep merge',
      description:
        'Deep merge two nested configuration objects where overrides take precedence. Treats each config as a tree and merges recursively — common in build tools, feature flags, and environment-specific config.',
      code: `type ConfigValue =
  | string
  | number
  | boolean
  | null
  | ConfigObject
  | ConfigValue[];

interface ConfigObject {
  [key: string]: ConfigValue;
}

function deepMergeConfig(
  base: ConfigObject,
  overrides: ConfigObject
): ConfigObject {
  const result: ConfigObject = { ...base };

  for (const [key, overrideVal] of Object.entries(overrides)) {
    const baseVal = result[key];

    if (
      isConfigObject(baseVal) &&
      isConfigObject(overrideVal)
    ) {
      // Both are objects — recurse into subtree
      result[key] = deepMergeConfig(baseVal, overrideVal);
    } else {
      // Override replaces base (scalars, arrays, type changes)
      result[key] = overrideVal;
    }
  }

  return result;
}

function isConfigObject(val: unknown): val is ConfigObject {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

// Example: merge base config with production overrides
// const base = {
//   server: { port: 3000, host: 'localhost' },
//   db: { pool: { min: 2, max: 10 }, ssl: false },
//   features: { darkMode: true },
// };
// const prod = {
//   server: { host: '0.0.0.0' },
//   db: { ssl: true },
// };
// deepMergeConfig(base, prod)
// → { server: { port: 3000, host: '0.0.0.0' },
//     db: { pool: { min: 2, max: 10 }, ssl: true },
//     features: { darkMode: true } }`,
      complexity: 'Time: O(n) total keys | Space: O(d) recursion depth of nesting',
    },
    {
      title: 'Permission inheritance',
      description:
        'Walk a resource tree (folders, documents) to compute effective permissions. Each node can define its own ACL or inherit from its parent, with explicit overrides taking precedence.',
      code: `type Permission = 'read' | 'write' | 'admin';

interface Resource {
  id: string;
  name: string;
  ownPermissions: Map<string, Permission> | null; // userId → permission
  children: Resource[];
}

interface EffectiveACL {
  resourceId: string;
  resourceName: string;
  permissions: Map<string, Permission>; // userId → effective permission
}

function computeEffectivePermissions(
  node: Resource,
  inherited: Map<string, Permission> = new Map()
): EffectiveACL[] {
  // Merge: own permissions override inherited ones
  const effective = new Map(inherited);

  if (node.ownPermissions) {
    for (const [userId, perm] of node.ownPermissions) {
      effective.set(userId, perm);
    }
  }

  const results: EffectiveACL[] = [{
    resourceId: node.id,
    resourceName: node.name,
    permissions: new Map(effective),
  }];

  // Propagate effective permissions to children
  for (const child of node.children) {
    results.push(
      ...computeEffectivePermissions(child, effective)
    );
  }

  return results;
}

// Example resource tree:
//   Workspace (alice: admin)
//   ├── Engineering (bob: write)
//   │   └── Secrets (bob: read)   ← overrides parent's "write"
//   └── Marketing (carol: write)
//
// Effective permissions:
// Workspace:   { alice: admin }
// Engineering: { alice: admin, bob: write }  ← alice inherited
// Secrets:     { alice: admin, bob: read }   ← bob overridden
// Marketing:   { alice: admin, carol: write }`,
      complexity: 'Time: O(n * u) where u = users per node | Space: O(d) tree depth',
    },
  ],
};
