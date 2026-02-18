import type { Topic } from '../types';

export const graphs: Topic = {
  id: 'graphs',
  title: 'Graphs',
  category: 'data-structures',
  description: 'Vertices and edges modeling relationships — the most general data structure for networks, dependencies, and pathfinding.',
  complexity: {
    search: 'O(V + E) BFS/DFS',
    insert: 'O(1) add edge',
    delete: 'O(E) remove vertex',
  },
  theory: `A graph G = (V, E) consists of vertices (nodes) and edges (connections). Graphs model relationships: social networks, maps, dependencies, state machines, and more.

**Representation:**
- **Adjacency list:** Each vertex stores a list of its neighbors. Space: O(V + E). Best for sparse graphs (most real-world graphs).
- **Adjacency matrix:** 2D array where matrix[i][j] = 1 if edge exists. Space: O(V²). Best for dense graphs or when you need O(1) edge lookup.

**Types:**
- **Directed vs undirected:** Directed edges have a direction (a → b). Undirected edges go both ways.
- **Weighted:** Edges have costs/distances. Used in shortest-path algorithms.
- **DAG (Directed Acyclic Graph):** Directed graph with no cycles. Models dependencies (build systems, course prerequisites). Topological sort is defined only for DAGs.

**Core algorithms:**
- **BFS:** Level-by-level exploration. Finds shortest path in unweighted graphs. Uses a queue.
- **DFS:** Go deep before wide. Useful for cycle detection, connected components, topological sort. Uses a stack/recursion.
- **Dijkstra's:** Shortest path in weighted graphs with non-negative weights. Uses a priority queue (min-heap).
- **Topological sort:** Linear ordering of vertices such that for every edge u → v, u comes before v. Only possible for DAGs.

**When to use graphs:**
- Modeling relationships or connections between entities.
- Pathfinding, routing, dependency resolution.
- Any problem with "prerequisites," "connections," or "reachability."`,
  keyPoints: [
    'Adjacency list: O(V + E) space — preferred for sparse graphs',
    'Adjacency matrix: O(V²) space — O(1) edge lookup',
    'BFS finds shortest path in unweighted graphs',
    'DFS for cycle detection, connected components, topological sort',
    'Dijkstra for shortest path in weighted graphs (non-negative weights)',
    'Topological sort only works on DAGs — detects cycles if it fails',
  ],
  visualization: 'GraphViz',
  useCases: [
    {
      title: 'Service dependency mapping',
      description:
        'Map microservice dependencies to detect circular dependency chains before deployment. A circular dependency means two services can never be independently deployed — a critical CI/CD blocker.',
      code: `interface ServiceDep {
  service: string;
  dependsOn: string[];
}

function detectCircularDeps(
  services: ServiceDep[]
): string[][] {
  const graph = new Map<string, string[]>();
  for (const { service, dependsOn } of services) {
    graph.set(service, dependsOn);
    for (const dep of dependsOn) {
      if (!graph.has(dep)) graph.set(dep, []);
    }
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    visited.add(node);
    inStack.add(node);
    path.push(node);

    for (const dep of graph.get(node) ?? []) {
      if (inStack.has(dep)) {
        const cycleStart = path.indexOf(dep);
        cycles.push(path.slice(cycleStart));
      } else if (!visited.has(dep)) {
        dfs(dep, path);
      }
    }

    path.pop();
    inStack.delete(node);
  }

  for (const service of graph.keys()) {
    if (!visited.has(service)) dfs(service, []);
  }

  return cycles;
}

// Example:
// detectCircularDeps([
//   { service: 'api-gateway', dependsOn: ['auth-svc'] },
//   { service: 'auth-svc',    dependsOn: ['user-svc'] },
//   { service: 'user-svc',    dependsOn: ['auth-svc'] },  // circular!
//   { service: 'billing-svc', dependsOn: ['user-svc'] },
// ])
// → [['auth-svc', 'user-svc']]`,
      complexity: 'Time: O(V + E) | Space: O(V) for visited/stack sets',
    },
    {
      title: 'Social network friend suggestions',
      description:
        'Find friends-of-friends using BFS, ranked by number of mutual connections. A classic 2-hop BFS used by social platforms to power "People you may know" features.',
      code: `interface FriendSuggestion {
  userId: string;
  mutualCount: number;
  mutualFriends: string[];
}

function suggestFriends(
  friendGraph: Map<string, Set<string>>,
  userId: string,
  limit = 10
): FriendSuggestion[] {
  const directFriends = friendGraph.get(userId) ?? new Set();
  const mutuals = new Map<string, string[]>();

  // BFS: explore friends-of-friends (2 hops)
  for (const friend of directFriends) {
    const friendsOfFriend = friendGraph.get(friend) ?? new Set();

    for (const candidate of friendsOfFriend) {
      // Skip self and existing friends
      if (candidate === userId || directFriends.has(candidate)) {
        continue;
      }
      if (!mutuals.has(candidate)) mutuals.set(candidate, []);
      mutuals.get(candidate)!.push(friend);
    }
  }

  // Rank by mutual connection count
  return [...mutuals.entries()]
    .map(([uid, shared]) => ({
      userId: uid,
      mutualCount: shared.length,
      mutualFriends: shared,
    }))
    .sort((a, b) => b.mutualCount - a.mutualCount)
    .slice(0, limit);
}

// Example:
// Alice ↔ Bob, Alice ↔ Carol, Bob ↔ Dave, Carol ↔ Dave, Carol ↔ Eve
//
// suggestFriends(graph, 'alice')
// → [{ userId: 'dave', mutualCount: 2, mutualFriends: ['bob','carol'] },
//    { userId: 'eve',  mutualCount: 1, mutualFriends: ['carol'] }]`,
      complexity: 'Time: O(F * F) where F = avg friends per user | Space: O(candidates)',
    },
    {
      title: 'Build system task ordering',
      description:
        'Topological sort of build tasks with identification of parallelizable groups. Tasks with no remaining dependencies can execute concurrently — the key optimization in CI/CD pipelines.',
      code: `interface BuildTask {
  name: string;
  dependsOn: string[];
}

interface ExecutionPlan {
  phase: number;
  parallel: string[];  // tasks that can run concurrently
}

function planBuildOrder(tasks: BuildTask[]): ExecutionPlan[] | null {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const task of tasks) {
    graph.set(task.name, []);
    inDegree.set(task.name, 0);
  }

  for (const task of tasks) {
    for (const dep of task.dependsOn) {
      graph.get(dep)!.push(task.name);
      inDegree.set(task.name, inDegree.get(task.name)! + 1);
    }
  }

  const plan: ExecutionPlan[] = [];
  let remaining = tasks.length;
  let phase = 0;

  while (remaining > 0) {
    // Collect all tasks with zero in-degree — they can run in parallel
    const ready: string[] = [];
    for (const [task, deg] of inDegree) {
      if (deg === 0) ready.push(task);
    }

    if (ready.length === 0) return null; // cycle detected

    plan.push({ phase: phase++, parallel: ready });

    for (const task of ready) {
      inDegree.delete(task);
      remaining--;
      for (const dependent of graph.get(task)!) {
        inDegree.set(dependent, inDegree.get(dependent)! - 1);
      }
    }
  }

  return plan;
}

// planBuildOrder([
//   { name: 'install',  dependsOn: [] },
//   { name: 'lint',     dependsOn: ['install'] },
//   { name: 'typecheck',dependsOn: ['install'] },
//   { name: 'test',     dependsOn: ['lint', 'typecheck'] },
//   { name: 'build',    dependsOn: ['test'] },
// ])
// → [
//   { phase: 0, parallel: ['install'] },
//   { phase: 1, parallel: ['lint', 'typecheck'] },  // concurrent!
//   { phase: 2, parallel: ['test'] },
//   { phase: 3, parallel: ['build'] },
// ]`,
      complexity: 'Time: O(V + E) | Space: O(V + E)',
    },
    {
      title: 'Multi-step form wizard',
      description:
        'Model a multi-step form as a DAG where each step may depend on previous answers. Determines which steps are reachable given current form state, supports conditional branching, and computes the shortest path to completion.',
      code: `interface FormStep {
  id: string;
  title: string;
  condition?: (answers: Record<string, unknown>) => boolean;
  nextSteps: string[];  // edges to possible next steps
}

interface WizardState {
  reachableSteps: string[];
  completedSteps: Set<string>;
  currentStep: string;
  shortestPathToEnd: string[];
}

function computeReachableSteps(
  steps: Map<string, FormStep>,
  answers: Record<string, unknown>,
  startId: string
): string[] {
  // BFS from start, only following edges where conditions are met
  const reachable: string[] = [];
  const visited = new Set<string>();
  const queue = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const id = queue.shift()!;
    const step = steps.get(id);
    if (!step) continue;

    // Check if this step is active given current answers
    if (step.condition && !step.condition(answers)) continue;

    reachable.push(id);

    for (const nextId of step.nextSteps) {
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push(nextId);
      }
    }
  }

  return reachable;
}

function findShortestPath(
  steps: Map<string, FormStep>,
  answers: Record<string, unknown>,
  fromId: string,
  toId: string
): string[] | null {
  const queue: string[][] = [[fromId]];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    if (current === toId) return path;

    const step = steps.get(current);
    if (!step) continue;

    for (const nextId of step.nextSteps) {
      const nextStep = steps.get(nextId);
      if (!visited.has(nextId) &&
          (!nextStep?.condition || nextStep.condition(answers))) {
        visited.add(nextId);
        queue.push([...path, nextId]);
      }
    }
  }
  return null;
}

// Checkout wizard:
//   account-type → personal-info → payment → review
//                ↘ business-info ↗  (if type === 'business')
//
// answers = { accountType: 'business' }
// computeReachableSteps(steps, answers, 'account-type')
// → ['account-type', 'business-info', 'payment', 'review']`,
      complexity: 'Time: O(V + E) | Space: O(V)',
    },
    {
      title: 'Fraud ring detection',
      description:
        'Find connected components of user accounts sharing identifiers (email, phone, IP address). Each connected component is a potential fraud ring for manual review.',
      code: `interface Account {
  id: string;
  email: string;
  phone: string;
  loginIps: string[];
}

function detectFraudRings(accounts: Account[]): string[][] {
  // Build graph: accounts sharing any identifier are connected
  const identifierToAccounts = new Map<string, string[]>();

  for (const acct of accounts) {
    const identifiers = [
      \`email:\${acct.email}\`,
      \`phone:\${acct.phone}\`,
      ...acct.loginIps.map(ip => \`ip:\${ip}\`),
    ];

    for (const ident of identifiers) {
      if (!identifierToAccounts.has(ident)) {
        identifierToAccounts.set(ident, []);
      }
      identifierToAccounts.get(ident)!.push(acct.id);
    }
  }

  // Adjacency list from shared identifiers
  const adj = new Map<string, Set<string>>();
  for (const acct of accounts) adj.set(acct.id, new Set());

  for (const linked of identifierToAccounts.values()) {
    for (let i = 0; i < linked.length; i++) {
      for (let j = i + 1; j < linked.length; j++) {
        adj.get(linked[i])!.add(linked[j]);
        adj.get(linked[j])!.add(linked[i]);
      }
    }
  }

  // BFS to find connected components
  const visited = new Set<string>();
  const rings: string[][] = [];

  for (const acctId of adj.keys()) {
    if (visited.has(acctId)) continue;
    const component: string[] = [];
    const queue = [acctId];
    visited.add(acctId);

    while (queue.length > 0) {
      const node = queue.shift()!;
      component.push(node);
      for (const neighbor of adj.get(node)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    if (component.length > 1) rings.push(component);
  }

  return rings;
}

// Accounts sharing the same IP → linked in a fraud ring
// detectFraudRings([...]) → [['acct_1', 'acct_3', 'acct_7']]`,
      complexity: 'Time: O(A * I) accounts x identifiers | Space: O(A + edges)',
    },
    {
      title: 'Database migration ordering',
      description:
        'Order schema migrations respecting foreign key dependencies. A migration creating a referenced table must run before migrations adding foreign keys to it.',
      code: `interface Migration {
  id: string;
  description: string;
  creates: string[];       // tables this migration creates
  references: string[];    // tables this migration depends on via FK
}

function orderMigrations(
  migrations: Migration[]
): string[] | { error: string; cycle: string[] } {
  // Map table names to the migration that creates them
  const tableToMigration = new Map<string, string>();
  for (const m of migrations) {
    for (const table of m.creates) {
      tableToMigration.set(table, m.id);
    }
  }

  // Build dependency graph: migration → migrations it depends on
  const graph = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  for (const m of migrations) {
    graph.set(m.id, new Set());
    inDegree.set(m.id, 0);
  }

  for (const m of migrations) {
    for (const refTable of m.references) {
      const depMigration = tableToMigration.get(refTable);
      if (depMigration && depMigration !== m.id) {
        if (!graph.get(depMigration)!.has(m.id)) {
          graph.get(depMigration)!.add(m.id);
          inDegree.set(m.id, inDegree.get(m.id)! + 1);
        }
      }
    }
  }

  // Kahn's topological sort
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const dep of graph.get(id)!) {
      const newDeg = inDegree.get(dep)! - 1;
      inDegree.set(dep, newDeg);
      if (newDeg === 0) queue.push(dep);
    }
  }

  if (order.length < migrations.length) {
    return { error: 'Circular FK dependency detected', cycle: [] };
  }

  return order;
}

// orderMigrations([
//   { id: '001', description: 'Create users',    creates: ['users'],   references: [] },
//   { id: '002', description: 'Create orders',   creates: ['orders'],  references: ['users'] },
//   { id: '003', description: 'Create payments', creates: ['payments'],references: ['orders'] },
// ])
// → ['001', '002', '003']`,
      complexity: 'Time: O(M + D) migrations + dependencies | Space: O(M)',
    },
  ],
};
