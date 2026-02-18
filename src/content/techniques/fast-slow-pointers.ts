import type { Topic } from '../types';

export const fastSlowPointers: Topic = {
  id: 'fast-slow-pointers',
  title: 'Fast/slow pointers',
  category: 'techniques',
  description:
    'Two pointers moving at different speeds through a sequence to detect cycles, find midpoints, or locate duplicates — all without extra memory.',
  invariant: 'Fast moves 2 steps, slow moves 1 step. If a cycle exists they meet. Reset one pointer to start to find the cycle entry.',
  theory: `The fast/slow pointer technique (Floyd's tortoise and hare) uses two pointers traversing a sequence at different speeds. The slow pointer moves 1 step at a time; the fast pointer moves 2 steps. This speed difference creates powerful invariants for cycle detection and midpoint finding.

**Cycle detection — two phases:**

**Phase 1: Detect the cycle.** Move slow by 1 and fast by 2. If there's a cycle, they will meet inside it. If fast reaches the end (null), there's no cycle.

\`\`\`
let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
  if (slow === fast) break; // cycle detected
}
\`\`\`

**Phase 2: Find the cycle entry.** Once they meet, reset one pointer to the start. Move both at speed 1 — they meet at the cycle entry.

\`\`\`
// After detecting meeting point:
slow = head;
while (slow !== fast) {
  slow = slow.next;
  fast = fast.next;  // both move 1 step now
}
// slow === fast === cycle entry
\`\`\`

**Why this works:** When they meet, slow has traveled \`d + k\` steps and fast has traveled \`2(d + k)\` steps, where \`d\` is the distance to the cycle entry and \`k\` is how far into the cycle they met. The difference \`d + k\` is a multiple of the cycle length, so advancing \`d\` more steps from the meeting point lands exactly on the entry — the same distance as from the start.

**Middle of a linked list:** When fast reaches the end, slow is at the midpoint — fast traveled twice the distance.

\`\`\`
let slow = head, fast = head;
while (fast && fast.next) {
  slow = slow.next;
  fast = fast.next.next;
}
// slow is at the middle node
\`\`\`

**Array-as-linked-list (Floyd on arrays):** For an array of n+1 integers in range [1..n], treat each value as a "next pointer" — \`next(i) = arr[i]\`. A duplicate value means two indices point to the same node, creating a cycle. The cycle entry is the duplicate.

**When to use it:**
- Detect if a linked list or sequence has a cycle
- Find the start of a cycle
- Find the middle of a linked list in one pass
- Find a duplicate in [1..n] without extra space
- Detect periodic behavior in iterated functions`,
  visualization: 'FastSlowViz',
  keyPoints: [
    'Fast moves 2 steps, slow moves 1 step — if a cycle exists, they must meet',
    'After meeting, reset one pointer to start and move both at speed 1 to find the cycle entry',
    'For middle-finding, when fast reaches the end, slow is at the midpoint',
    'Array-as-linked-list: treat arr[i] as a next pointer to detect duplicates via cycle entry',
    'O(1) space — no visited set or hashmap needed',
    'Works on any iterated function f(x), not just linked lists',
  ],
  useCases: [
    {
      title: 'Backend pipelines: dependency cycle detection',
      description:
        'Detect cycles in a job dependency chain where each job points to a dependency. If a cycle exists, identify which job starts the loop so the pipeline can report it.',
      code: `interface Job {
  id: string;
  dependsOn: string | null; // ID of the job this one waits on
}

interface CycleResult {
  hasCycle: boolean;
  cycleEntry: string | null;
  cycleMembers: string[];
}

function detectDependencyCycle(
  jobs: Map<string, Job>,
  startJobId: string
): CycleResult {
  const step = (id: string | null): string | null => {
    if (!id) return null;
    return jobs.get(id)?.dependsOn ?? null;
  };

  // Phase 1: detect cycle
  let slow: string | null = startJobId;
  let fast: string | null = startJobId;

  do {
    slow = step(slow);
    fast = step(step(fast));
  } while (slow && fast && slow !== fast);

  if (!slow || !fast || slow !== fast) {
    return { hasCycle: false, cycleEntry: null, cycleMembers: [] };
  }

  // Phase 2: find cycle entry
  slow = startJobId;
  while (slow !== fast) {
    slow = step(slow);
    fast = step(fast);
  }

  // Collect all cycle members
  const cycleMembers: string[] = [slow!];
  let current = step(slow);
  while (current !== slow) {
    cycleMembers.push(current!);
    current = step(current);
  }

  return { hasCycle: true, cycleEntry: slow, cycleMembers };
}

// Usage:
// const jobs = new Map([
//   ['build', { id: 'build', dependsOn: 'test' }],
//   ['test', { id: 'test', dependsOn: 'lint' }],
//   ['lint', { id: 'lint', dependsOn: 'build' }], // cycle!
// ]);
// detectDependencyCycle(jobs, 'build');
// → { hasCycle: true, cycleEntry: 'build',
//     cycleMembers: ['build', 'test', 'lint'] }`,
      complexity: 'Time: O(n) | Space: O(1) for detection, O(cycle length) to collect members',
    },
    {
      title: 'Data integrity: circular reference detection',
      description:
        'Detect corrupt circular references in a linked data structure (e.g., a chain of records where each points to a parent) without allocating a visited set.',
      code: `interface Record {
  id: number;
  parentId: number | null;
}

interface IntegrityReport {
  isCorrupt: boolean;
  loopEntryId: number | null;
  loopLength: number;
}

function checkCircularReference(
  records: Map<number, Record>,
  startId: number
): IntegrityReport {
  const next = (id: number | null): number | null => {
    if (id === null) return null;
    return records.get(id)?.parentId ?? null;
  };

  // Phase 1: detect
  let slow: number | null = startId;
  let fast: number | null = startId;

  do {
    slow = next(slow);
    fast = next(next(fast));
  } while (slow !== null && fast !== null && slow !== fast);

  if (slow === null || fast === null || slow !== fast) {
    return { isCorrupt: false, loopEntryId: null, loopLength: 0 };
  }

  // Phase 2: find entry
  slow = startId;
  while (slow !== fast) {
    slow = next(slow)!;
    fast = next(fast)!;
  }

  // Measure loop length
  let loopLength = 1;
  let walker = next(slow)!;
  while (walker !== slow) {
    walker = next(walker)!;
    loopLength++;
  }

  return { isCorrupt: true, loopEntryId: slow, loopLength };
}

// Usage:
// const records = new Map([
//   [1, { id: 1, parentId: 2 }],
//   [2, { id: 2, parentId: 3 }],
//   [3, { id: 3, parentId: 1 }], // corrupt: points back to 1
// ]);
// checkCircularReference(records, 1);
// → { isCorrupt: true, loopEntryId: 1, loopLength: 3 }`,
      complexity: 'Time: O(n) | Space: O(1)',
    },
    {
      title: 'Dedup under constraints: find duplicate ID',
      description:
        'Find the one duplicate in an array of n+1 IDs in range [1..n] without modifying the array or using extra memory. Treat array values as next-pointers and apply Floyd\'s algorithm.',
      code: `/**
 * Given n+1 integers in [1..n], exactly one value is duplicated.
 * Find it in O(n) time and O(1) space using Floyd's cycle detection.
 *
 * Key insight: treat arr[i] as "next pointer" — index 0 is the head,
 * arr[0] is the next index, arr[arr[0]] is the one after, etc.
 * A duplicate value means two indices point to the same "node",
 * creating a cycle. The cycle entry is the duplicate value.
 */
function findDuplicate(ids: number[]): number {
  // Phase 1: find meeting point inside the cycle
  let slow = ids[0];
  let fast = ids[0];

  do {
    slow = ids[slow];
    fast = ids[ids[fast]];
  } while (slow !== fast);

  // Phase 2: find cycle entry (the duplicate value)
  slow = ids[0];
  while (slow !== fast) {
    slow = ids[slow];
    fast = ids[fast];
  }

  return slow;
}

// Usage:
// IDs assigned to users — should be unique in [1..5]
// but one got assigned twice:
// findDuplicate([1, 3, 4, 2, 5, 3]);
// → 3

// Compact sensor IDs in [1..8], one duplicated:
// findDuplicate([2, 6, 4, 1, 3, 1, 5, 7, 8]);
// → 1`,
      complexity: 'Time: O(n) | Space: O(1)',
    },
    {
      title: 'User journeys: detect repeated state loops',
      description:
        'Model a user funnel as state transitions and detect if a user gets stuck in a repeating loop of states — useful for identifying broken automations or UX dead ends.',
      code: `type State = string;

interface TransitionLog {
  userId: string;
  states: State[]; // ordered sequence of states visited
}

interface LoopReport {
  hasLoop: boolean;
  loopEntry: State | null;
  loopStates: State[];
  stepsBeforeLoop: number;
}

function detectStateLoop(
  transitions: Map<State, State>, // state → next state
  startState: State
): LoopReport {
  const next = (s: State | null): State | null => {
    if (!s) return null;
    return transitions.get(s) ?? null;
  };

  // Phase 1: detect
  let slow: State | null = startState;
  let fast: State | null = startState;

  do {
    slow = next(slow);
    fast = next(next(fast));
  } while (slow && fast && slow !== fast);

  if (!slow || !fast || slow !== fast) {
    return {
      hasLoop: false,
      loopEntry: null,
      loopStates: [],
      stepsBeforeLoop: 0,
    };
  }

  // Phase 2: find entry
  slow = startState;
  let stepsBeforeLoop = 0;
  while (slow !== fast) {
    slow = next(slow)!;
    fast = next(fast)!;
    stepsBeforeLoop++;
  }

  // Collect loop states
  const loopStates: State[] = [slow!];
  let current = next(slow)!;
  while (current !== slow) {
    loopStates.push(current);
    current = next(current)!;
  }

  return {
    hasLoop: true,
    loopEntry: slow,
    loopStates,
    stepsBeforeLoop,
  };
}

// Usage — onboarding funnel with a broken loop:
// const transitions = new Map([
//   ['signup', 'verify-email'],
//   ['verify-email', 'choose-plan'],
//   ['choose-plan', 'payment'],
//   ['payment', 'choose-plan'],   // bug: loops back!
// ]);
// detectStateLoop(transitions, 'signup');
// → { hasLoop: true, loopEntry: 'choose-plan',
//     loopStates: ['choose-plan', 'payment'],
//     stepsBeforeLoop: 2 }`,
      complexity: 'Time: O(n) | Space: O(1) for detection, O(cycle length) to collect states',
    },
    {
      title: 'Streaming transforms: detect periodic hashing',
      description:
        'Detect if an iterated hash/transform function enters a cycle (e.g., a PRNG seed, a hash chain, or an idempotent cache key). Find the cycle length and entry to prevent infinite loops.',
      code: `/**
 * Detect periodicity in an iterated function f(x).
 * Returns the cycle start value and cycle length,
 * or null if the sequence terminates before cycling.
 */
interface CycleInfo<T> {
  cycleEntry: T;
  cycleLength: number;
  tailLength: number; // steps before entering the cycle
}

function detectFunctionCycle<T>(
  f: (x: T) => T | null,
  start: T,
  eq: (a: T, b: T) => boolean = (a, b) => a === b
): CycleInfo<T> | null {
  // Phase 1: detect meeting point
  let slow: T | null = start;
  let fast: T | null = start;

  do {
    slow = slow !== null ? f(slow) : null;
    const mid = fast !== null ? f(fast) : null;
    fast = mid !== null ? f(mid) : null;
  } while (
    slow !== null &&
    fast !== null &&
    !eq(slow, fast)
  );

  if (slow === null || fast === null) return null;

  // Phase 2: find cycle entry
  slow = start;
  let tailLength = 0;
  while (!eq(slow!, fast!)) {
    slow = f(slow!)!;
    fast = f(fast!)!;
    tailLength++;
  }

  // Phase 3: measure cycle length
  let cycleLength = 1;
  let walker = f(slow!)!;
  while (!eq(walker, slow!)) {
    walker = f(walker)!;
    cycleLength++;
  }

  return { cycleEntry: slow!, cycleLength, tailLength };
}

// Example: detect cycle in a simple hash chain
// const hashStep = (n: number) => (n * n + 1) % 1000;
// detectFunctionCycle(hashStep, 2);
// → { cycleEntry: 5, cycleLength: 4, tailLength: 3 }

// Example: detect PRNG period
// const lcg = (x: number) => (1103515245 * x + 12345) % (1 << 16);
// const info = detectFunctionCycle(lcg, 0);
// info.cycleLength → the PRNG period`,
      complexity: 'Time: O(tailLength + cycleLength) | Space: O(1)',
    },
  ],
};
