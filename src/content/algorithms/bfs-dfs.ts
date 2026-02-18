import type { Topic } from '../types';

export const bfsDfs: Topic = {
  id: 'bfs-dfs',
  title: 'BFS / DFS',
  category: 'algorithms',
  description: 'Breadth-first and depth-first traversal — the two fundamental graph/tree exploration strategies.',
  complexity: {
    average: 'O(V + E)',
    worst: 'O(V + E)',
  },
  theory: `**BFS (Breadth-First Search)** explores nodes level by level using a queue. It finds the shortest path in unweighted graphs and is ideal when the solution is likely close to the root.

**DFS (Depth-First Search)** explores as deep as possible along each branch before backtracking, using a stack (or recursion). It uses less memory than BFS on wide graphs and naturally maps to recursive solutions.

**Key differences:**
| Property | BFS | DFS |
|---|---|---|
| Data structure | Queue | Stack / recursion |
| Space | O(w) where w = max width | O(h) where h = max depth |
| Shortest path? | Yes (unweighted) | No |
| Complete? | Yes | Yes (finite graphs) |

**When to use BFS:**
- Shortest path in unweighted graph
- Level-order traversal
- Finding nearest neighbors
- Web crawlers (breadth exploration)

**When to use DFS:**
- Detecting cycles
- Topological sorting
- Path existence problems
- Maze solving, puzzle states
- When memory is constrained and graph is wide`,
  keyPoints: [
    'BFS uses a queue → level-by-level; DFS uses a stack → branch-by-branch',
    'Both visit every vertex and edge once → O(V + E)',
    'BFS guarantees shortest path in unweighted graphs',
    'DFS can be implemented with recursion (implicit call stack)',
    'Mark nodes as visited to avoid infinite loops in graphs with cycles',
    'Tree traversal is a special case of DFS (preorder, inorder, postorder)',
  ],
  visualization: 'GraphViz',
  useCases: [
    {
      title: 'Support ticket escalation path',
      description:
        'BFS to find the shortest escalation path in an org/team graph — fewest handoffs to reach the team that can resolve the issue.',
      code: `interface Team {
  id: string;
  name: string;
  canResolve: string[]; // issue categories this team handles
  escalatesTo: string[]; // team IDs this team can escalate to
}

interface EscalationPath {
  teams: string[];
  hops: number;
}

function findEscalationPath(
  teams: Map<string, Team>,
  startTeamId: string,
  issueCategory: string
): EscalationPath | null {
  const queue: string[][] = [[startTeamId]];
  const visited = new Set<string>([startTeamId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentId = path[path.length - 1];
    const team = teams.get(currentId)!;

    if (team.canResolve.includes(issueCategory)) {
      return { teams: path, hops: path.length - 1 };
    }

    for (const nextId of team.escalatesTo) {
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push([...path, nextId]);
      }
    }
  }

  return null; // No team can resolve this issue
}

// findEscalationPath(teams, "tier1-support", "billing-fraud")
// → { teams: ["tier1-support", "tier2-billing", "fraud-team"], hops: 2 }`,
      complexity: 'Time: O(V + E) | Space: O(V)',
    },
    {
      title: 'Keyboard focus trap (accessibility)',
      description:
        'BFS traversal of the DOM tree to collect all focusable elements within a modal or dialog, enabling keyboard tab cycling — a core accessibility pattern for focus management.',
      code: `interface DOMNode {
  tag: string;
  attrs: Record<string, string>;
  children: DOMNode[];
}

const FOCUSABLE_TAGS = new Set([
  'input', 'select', 'textarea', 'button', 'a',
]);

function isFocusable(node: DOMNode): boolean {
  if (node.attrs['disabled'] !== undefined) return false;
  if (node.attrs['tabindex'] === '-1') return false;
  if (FOCUSABLE_TAGS.has(node.tag)) return true;
  if (node.attrs['tabindex'] !== undefined) return true;
  if (node.attrs['contenteditable'] === 'true') return true;
  return false;
}

interface FocusableElement {
  node: DOMNode;
  tabIndex: number;
  depth: number;
}

function collectFocusableElements(root: DOMNode): FocusableElement[] {
  // BFS: preserves document order (level-by-level, left-to-right)
  const focusable: FocusableElement[] = [];
  const queue: Array<{ node: DOMNode; depth: number }> = [
    { node: root, depth: 0 },
  ];

  while (queue.length > 0) {
    const { node, depth } = queue.shift()!;

    if (isFocusable(node)) {
      focusable.push({
        node,
        tabIndex: parseInt(node.attrs['tabindex'] ?? '0', 10),
        depth,
      });
    }

    for (const child of node.children) {
      queue.push({ node: child, depth: depth + 1 });
    }
  }

  // Sort by tabIndex (0 = document order, positive = priority)
  return focusable.sort((a, b) => {
    if (a.tabIndex === 0 && b.tabIndex === 0) return 0;
    if (a.tabIndex === 0) return 1;
    if (b.tabIndex === 0) return -1;
    return a.tabIndex - b.tabIndex;
  });
}

function createFocusTrap(root: DOMNode) {
  const elements = collectFocusableElements(root);
  let currentIndex = 0;

  return {
    get current() { return elements[currentIndex]?.node ?? null; },
    next() {
      currentIndex = (currentIndex + 1) % elements.length;
      return elements[currentIndex].node;
    },
    prev() {
      currentIndex = (currentIndex - 1 + elements.length) % elements.length;
      return elements[currentIndex].node;
    },
    get count() { return elements.length; },
  };
}

// Modal with [Close button, Email input, Password input, Submit button]
// Tab → cycles through 4 elements
// Shift+Tab → cycles backward
// Focus never escapes the modal`,
      complexity: 'Time: O(n) DOM nodes | Space: O(n)',
    },
    {
      title: 'Fraud account cluster detection',
      description:
        'DFS to find connected clusters of accounts sharing identifiers like email, phone, or device ID — accounts in the same cluster are likely controlled by the same actor.',
      code: `interface Account {
  id: string;
  email: string;
  phone: string;
  deviceId: string;
}

function detectFraudClusters(accounts: Account[]): string[][] {
  // Build adjacency: two accounts are connected if they share
  // any identifier (email, phone, or device)
  const adj = new Map<string, Set<string>>();
  const byIdentifier = new Map<string, string[]>();

  for (const acct of accounts) {
    adj.set(acct.id, new Set());
    for (const key of [acct.email, acct.phone, acct.deviceId]) {
      if (!byIdentifier.has(key)) byIdentifier.set(key, []);
      byIdentifier.get(key)!.push(acct.id);
    }
  }
  for (const group of byIdentifier.values()) {
    for (let i = 1; i < group.length; i++) {
      adj.get(group[0])!.add(group[i]);
      adj.get(group[i])!.add(group[0]);
    }
  }

  // DFS to find connected components
  const visited = new Set<string>();
  const clusters: string[][] = [];

  for (const acct of accounts) {
    if (visited.has(acct.id)) continue;
    const cluster: string[] = [];
    const stack = [acct.id];
    while (stack.length > 0) {
      const id = stack.pop()!;
      if (visited.has(id)) continue;
      visited.add(id);
      cluster.push(id);
      for (const neighbor of adj.get(id) ?? []) {
        if (!visited.has(neighbor)) stack.push(neighbor);
      }
    }
    if (cluster.length > 1) clusters.push(cluster);
  }

  return clusters;
}`,
      complexity: 'Time: O(V + E) | Space: O(V + E)',
    },
    {
      title: 'Web crawler',
      description:
        'DFS crawl of a website following links, respecting a depth limit and visited set — the core loop of any search engine crawler.',
      code: `interface CrawlResult {
  url: string;
  title: string;
  links: string[];
  depth: number;
}

async function crawlSite(
  startUrl: string,
  maxDepth: number,
  maxPages: number
): Promise<CrawlResult[]> {
  const visited = new Set<string>();
  const results: CrawlResult[] = [];
  const stack: [string, number][] = [[startUrl, 0]];

  while (stack.length > 0 && results.length < maxPages) {
    const [url, depth] = stack.pop()!;

    if (visited.has(url) || depth > maxDepth) continue;
    visited.add(url);

    const page = await fetchPage(url);
    if (!page) continue;

    results.push({
      url,
      title: page.title,
      links: page.links,
      depth,
    });

    // Push links in reverse so first link is explored first
    const sameDomainLinks = page.links
      .filter(link => isSameDomain(link, startUrl));
    for (let i = sameDomainLinks.length - 1; i >= 0; i--) {
      if (!visited.has(sameDomainLinks[i])) {
        stack.push([sameDomainLinks[i], depth + 1]);
      }
    }
  }

  return results;
}

// Stubs for illustration
declare function fetchPage(url: string): Promise<{ title: string; links: string[] } | null>;
declare function isSameDomain(url: string, base: string): boolean;`,
      complexity: 'Time: O(V + E) | Space: O(V) for visited set + stack',
    },
    {
      title: 'CI/CD pipeline dependency resolution',
      description:
        'Topological sort (Kahn\'s algorithm) of build tasks for parallel execution — determines which tasks can run concurrently and which must wait.',
      code: `interface BuildTask {
  id: string;
  command: string;
  dependsOn: string[];
}

interface ExecutionPlan {
  stages: string[][]; // each stage is tasks that can run in parallel
}

function buildExecutionPlan(tasks: BuildTask[]): ExecutionPlan {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const task of tasks) {
    graph.set(task.id, []);
    inDegree.set(task.id, 0);
  }
  for (const task of tasks) {
    for (const dep of task.dependsOn) {
      graph.get(dep)!.push(task.id);
      inDegree.set(task.id, inDegree.get(task.id)! + 1);
    }
  }

  const stages: string[][] = [];
  let queue = [...inDegree.entries()]
    .filter(([, deg]) => deg === 0)
    .map(([id]) => id);

  while (queue.length > 0) {
    stages.push(queue); // All current tasks run in parallel
    const nextQueue: string[] = [];
    for (const taskId of queue) {
      for (const dep of graph.get(taskId) ?? []) {
        const newDeg = inDegree.get(dep)! - 1;
        inDegree.set(dep, newDeg);
        if (newDeg === 0) nextQueue.push(dep);
      }
    }
    queue = nextQueue;
  }

  return { stages };
}

// Stage 0: [lint, typecheck]     ← parallel
// Stage 1: [build]               ← depends on lint + typecheck
// Stage 2: [test-unit, test-e2e] ← parallel, depends on build
// Stage 3: [deploy]              ← depends on all tests`,
      complexity: 'Time: O(V + E) | Space: O(V + E)',
    },
    {
      title: 'Permission tree traversal',
      description:
        'DFS to compute effective permissions by walking a resource hierarchy — child resources inherit parent permissions unless explicitly overridden.',
      code: `interface ResourceNode {
  id: string;
  permissions: Record<string, boolean | undefined>;
  children: ResourceNode[];
}

type EffectivePermissions = Map<string, Record<string, boolean>>;

function computeEffectivePermissions(
  root: ResourceNode
): EffectivePermissions {
  const result: EffectivePermissions = new Map();

  function dfs(
    node: ResourceNode,
    inherited: Record<string, boolean>
  ): void {
    // Merge: explicit permissions override inherited ones
    const effective: Record<string, boolean> = { ...inherited };
    for (const [perm, value] of Object.entries(node.permissions)) {
      if (value !== undefined) effective[perm] = value;
    }

    result.set(node.id, effective);

    for (const child of node.children) {
      dfs(child, effective);
    }
  }

  dfs(root, {});
  return result;
}

// Resource tree: org → team → project → repo
// org: { read: true, write: false }
// team: { write: true }  ← overrides org's write:false
// project: {} ← inherits { read: true, write: true }
// repo: { write: false } ← overrides back to write:false`,
      complexity: 'Time: O(V × P) where P = number of permission keys | Space: O(V × P)',
    },
    {
      title: 'Social network distance',
      description:
        'BFS to compute degrees of separation between two users in a social graph — the classic "six degrees" problem.',
      code: `function degreesOfSeparation(
  connections: Map<string, string[]>,
  userA: string,
  userB: string,
  maxDegrees: number = 6
): number | null {
  if (userA === userB) return 0;

  // Bidirectional BFS: search from both sides
  let frontA = new Set<string>([userA]);
  let frontB = new Set<string>([userB]);
  const visitedA = new Set<string>([userA]);
  const visitedB = new Set<string>([userB]);
  let degrees = 0;

  while (frontA.size > 0 && frontB.size > 0) {
    degrees++;
    if (degrees > maxDegrees) return null;

    // Expand the smaller frontier (optimization)
    if (frontA.size > frontB.size) {
      [frontA, frontB] = [frontB, frontA];
      [visitedA, visitedB].reverse();
    }

    const nextFront = new Set<string>();
    for (const userId of frontA) {
      for (const friend of connections.get(userId) ?? []) {
        if (visitedB.has(friend)) return degrees;
        if (!visitedA.has(friend)) {
          visitedA.add(friend);
          nextFront.add(friend);
        }
      }
    }
    frontA = nextFront;
  }

  return null; // Not connected
}

// degreesOfSeparation(graph, "alice", "dave")
// → 3 (alice → bob → carol → dave)`,
      complexity: 'Time: O(b^(d/2)) with bidirectional BFS vs O(b^d) | Space: O(b^(d/2))',
    },
  ],
};
