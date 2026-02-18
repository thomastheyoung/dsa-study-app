import type { Topic } from '../types';

export const greedy: Topic = {
  id: 'greedy',
  title: 'Greedy',
  category: 'techniques',
  description: 'Make the locally optimal choice at each step, hoping to reach a globally optimal solution — fast but only correct when the problem has the right structure.',
  invariant: 'At each step, take the locally optimal choice and never revisit it. Correctness requires proving (via exchange argument) that swapping a greedy choice for any other never improves the result.',
  theory: `A greedy algorithm builds a solution piece by piece, always choosing the option that looks best right now without reconsidering previous choices.

**Two properties required for correctness:**

1. **Greedy choice property** — A locally optimal choice leads to a globally optimal solution. You can prove this by showing that swapping a greedy choice for any other choice never improves the result (exchange argument).

2. **Optimal substructure** — The optimal solution to the problem contains optimal solutions to subproblems (shared with DP).

**Greedy vs dynamic programming:**
- Greedy makes one choice and moves forward — no backtracking, no table.
- DP considers all choices and picks the best — more thorough but slower.
- If greedy works, it's almost always faster and simpler than DP.
- If you can't prove the greedy choice property, use DP instead.

**When greedy works:**
- Activity/interval scheduling
- Huffman coding
- Minimum spanning trees (Kruskal's, Prim's)
- Shortest paths (Dijkstra's — greedy on edge relaxation)
- Fractional knapsack (but NOT 0/1 knapsack)

**When greedy fails:**
- 0/1 knapsack: taking the highest value-per-weight item first can miss better combinations.
- Coin change with arbitrary denominations: greedy (largest coin first) fails for e.g., coins [1, 3, 4] and target 6 (greedy: 4+1+1=3 coins; optimal: 3+3=2 coins).
- Longest path in general graphs.

**How to approach a greedy problem:**
1. Sort or organize data by a key metric.
2. Iterate and make the locally optimal choice.
3. Prove correctness (exchange argument or structural induction).
4. If proof is hard, the problem might not be greedy — try DP.`,
  visualization: 'GreedyViz',
  keyPoints: [
    'Greedy = make the best local choice at each step, never reconsider',
    'Requires greedy choice property + optimal substructure for correctness',
    'If greedy works, it\'s typically O(n log n) or O(n) — much faster than DP',
    'Prove correctness with the exchange argument: show switching away from greedy never helps',
    'Classic greedy: interval scheduling, Huffman, Dijkstra, Kruskal/Prim',
    'When in doubt, test with counterexamples or fall back to DP',
  ],
  useCases: [
    {
      title: 'Meeting room scheduler',
      description:
        'Greedily assign meetings to the minimum number of rooms. Sort by start time, and for each meeting, reuse the room whose meeting ends earliest if available.',
      code: `interface Meeting {
  id: string;
  title: string;
  start: number; // Minutes from midnight
  end: number;
}

interface RoomAssignment {
  room: number;
  meetings: Meeting[];
}

function scheduleRooms(meetings: Meeting[]): RoomAssignment[] {
  if (meetings.length === 0) return [];

  // Sort by start time
  const sorted = [...meetings].sort((a, b) => a.start - b.start);

  // Each room tracks its latest end time
  const rooms: RoomAssignment[] = [];
  const roomEndTimes: number[] = [];

  for (const meeting of sorted) {
    // Find room with earliest end time that's free
    let bestRoom = -1;
    let earliestEnd = Infinity;

    for (let i = 0; i < roomEndTimes.length; i++) {
      if (roomEndTimes[i] <= meeting.start && roomEndTimes[i] < earliestEnd) {
        bestRoom = i;
        earliestEnd = roomEndTimes[i];
      }
    }

    if (bestRoom === -1) {
      // No room available — allocate a new one
      bestRoom = rooms.length;
      rooms.push({ room: bestRoom, meetings: [] });
      roomEndTimes.push(0);
    }

    rooms[bestRoom].meetings.push(meeting);
    roomEndTimes[bestRoom] = meeting.end;
  }

  return rooms;
}

// 3 meetings: 9-10, 9:30-11, 10-11:30
// Room 0: [9-10, 10-11:30]  Room 1: [9:30-11]
// Minimum rooms: 2`,
      complexity: 'Time: O(n² ) or O(n log n) with a heap | Space: O(n)',
    },
    {
      title: 'Masonry image gallery layout',
      description:
        'Greedily assign images to the shortest column in a masonry grid — each image goes to the column with the least total height, producing a balanced Pinterest-style layout without gaps.',
      code: `interface GalleryImage {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
}

interface PositionedImage {
  image: GalleryImage;
  column: number;
  x: number;
  y: number;
  displayWidth: number;
  displayHeight: number;
}

function layoutMasonry(
  images: GalleryImage[],
  containerWidth: number,
  columnCount: number,
  gap: number = 8
): { items: PositionedImage[]; totalHeight: number } {
  const columnWidth =
    (containerWidth - gap * (columnCount - 1)) / columnCount;
  const columnHeights = new Array(columnCount).fill(0);
  const items: PositionedImage[] = [];

  for (const image of images) {
    // Greedy: pick the shortest column
    let shortestCol = 0;
    for (let c = 1; c < columnCount; c++) {
      if (columnHeights[c] < columnHeights[shortestCol]) {
        shortestCol = c;
      }
    }

    // Scale image to fit column width, preserving aspect ratio
    const aspectRatio = image.height / image.width;
    const displayWidth = columnWidth;
    const displayHeight = columnWidth * aspectRatio;

    items.push({
      image,
      column: shortestCol,
      x: shortestCol * (columnWidth + gap),
      y: columnHeights[shortestCol],
      displayWidth,
      displayHeight,
    });

    columnHeights[shortestCol] += displayHeight + gap;
  }

  const totalHeight = Math.max(...columnHeights);
  return { items, totalHeight };
}

// 12 images of varying heights across 3 columns:
// layoutMasonry(images, 900, 3, 12)
// → Each image gets absolute x/y position
// → Columns stay roughly equal height
// → Use CSS transform: translate(x, y) for positioning
//
// Why greedy works: assigning to the shortest column
// minimizes the max column height (balanced load)`,
      complexity: 'Time: O(n × cols) | Space: O(n)',
    },
    {
      title: 'Task deadline scheduler',
      description:
        'Schedule tasks to maximize the number completed before their deadlines. Greedy: sort by deadline and pick tasks that can still meet their deadline.',
      code: `interface Task {
  id: string;
  name: string;
  durationMs: number;
  deadlineMs: number;
  priority: number;
}

interface ScheduleEntry {
  task: Task;
  startMs: number;
  completesMs: number;
  meetsDeadline: boolean;
}

function scheduleByDeadline(tasks: Task[]): ScheduleEntry[] {
  // Greedy: sort by deadline (earliest deadline first)
  const sorted = [...tasks].sort((a, b) => a.deadlineMs - b.deadlineMs);

  const schedule: ScheduleEntry[] = [];
  let currentTime = 0;

  for (const task of sorted) {
    const completesMs = currentTime + task.durationMs;
    const meetsDeadline = completesMs <= task.deadlineMs;

    // Only schedule if it can meet the deadline
    if (meetsDeadline) {
      schedule.push({
        task,
        startMs: currentTime,
        completesMs,
        meetsDeadline: true,
      });
      currentTime = completesMs;
    }
  }

  return schedule;
}

// Tasks: A(2s, deadline 4s), B(1s, deadline 2s), C(3s, deadline 6s)
// Sorted by deadline: B(1s, 2s), A(2s, 4s), C(3s, 6s)
// Schedule: B@0→1s, A@1→3s, C@3→6s — all 3 meet deadlines`,
      complexity: 'Time: O(n log n) | Space: O(n)',
    },
    {
      title: 'Load balancer routing',
      description:
        'Greedily assign incoming requests to the least-loaded server, a simplified version of the least-connections load balancing strategy.',
      code: `interface Server {
  id: string;
  capacity: number;     // Max concurrent requests
  activeRequests: number;
  avgResponseMs: number;
}

interface IncomingRequest {
  id: string;
  path: string;
  estimatedCostMs: number;
}

interface RoutingDecision {
  requestId: string;
  serverId: string;
  serverLoad: number; // Load percentage after assignment
}

function routeRequests(
  requests: IncomingRequest[],
  servers: Server[]
): RoutingDecision[] {
  // Clone server state so we can track load changes
  const serverState = servers.map(s => ({
    ...s,
    activeRequests: s.activeRequests,
  }));

  const decisions: RoutingDecision[] = [];

  for (const request of requests) {
    // Greedy: pick the server with lowest load ratio
    let bestIdx = -1;
    let bestLoad = Infinity;

    for (let i = 0; i < serverState.length; i++) {
      const load = serverState[i].activeRequests / serverState[i].capacity;
      if (load < bestLoad && serverState[i].activeRequests < serverState[i].capacity) {
        bestLoad = load;
        bestIdx = i;
      }
    }

    if (bestIdx === -1) continue; // All servers at capacity

    serverState[bestIdx].activeRequests++;
    const newLoad = serverState[bestIdx].activeRequests / serverState[bestIdx].capacity;

    decisions.push({
      requestId: request.id,
      serverId: serverState[bestIdx].id,
      serverLoad: newLoad,
    });
  }

  return decisions;
}

// 3 servers at 40%, 60%, 20% load
// Next request → server at 20% → becomes 30%
// Next request → server at 30% → becomes 40%`,
      complexity: 'Time: O(r * s) where r = requests, s = servers | Space: O(s)',
    },
    {
      title: 'Log file compression',
      description:
        'Huffman-style frequency-based encoding for compressing repetitive log entries — assign shorter codes to more frequent log patterns.',
      code: `interface HuffmanNode {
  char: string | null;
  freq: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}

function buildHuffmanCodes(
  text: string
): Map<string, string> {
  // Count frequencies
  const freq = new Map<string, number>();
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }

  // Build priority queue (greedy: always merge two lowest-freq nodes)
  const nodes: HuffmanNode[] = [...freq.entries()].map(
    ([char, f]) => ({ char, freq: f })
  );
  nodes.sort((a, b) => a.freq - b.freq);

  while (nodes.length > 1) {
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    const parent: HuffmanNode = {
      char: null,
      freq: left.freq + right.freq,
      left,
      right,
    };
    // Insert in sorted position (simple insert for clarity)
    const idx = nodes.findIndex(n => n.freq > parent.freq);
    nodes.splice(idx === -1 ? nodes.length : idx, 0, parent);
  }

  // Traverse tree to build codes
  const codes = new Map<string, string>();
  function traverse(node: HuffmanNode | undefined, code: string): void {
    if (!node) return;
    if (node.char !== null) {
      codes.set(node.char, code || '0');
      return;
    }
    traverse(node.left, code + '0');
    traverse(node.right, code + '1');
  }

  traverse(nodes[0], '');
  return codes;
}

// Input: "ERROR ERROR ERROR INFO WARN ERROR"
// 'E' appears most → shortest code (e.g., "00")
// Rare chars get longer codes → overall compression`,
      complexity: 'Time: O(n + k log k) where k = unique chars | Space: O(k)',
    },
    {
      title: 'API request batching',
      description:
        'Greedily batch small API requests into larger payloads to minimize round trips, respecting a maximum batch size and payload limit.',
      code: `interface APIRequest {
  id: string;
  endpoint: string;
  payloadBytes: number;
  priority: number;
}

interface Batch {
  requests: APIRequest[];
  totalBytes: number;
  estimatedLatencyMs: number;
}

function batchRequests(
  requests: APIRequest[],
  maxBatchSize: number,
  maxPayloadBytes: number,
  baseLatencyMs: number = 50
): Batch[] {
  // Greedy: sort by endpoint to group similar requests
  const sorted = [...requests].sort(
    (a, b) => a.endpoint.localeCompare(b.endpoint) || b.priority - a.priority
  );

  const batches: Batch[] = [];
  let currentBatch: APIRequest[] = [];
  let currentBytes = 0;

  for (const req of sorted) {
    const wouldExceedSize = currentBatch.length >= maxBatchSize;
    const wouldExceedBytes = currentBytes + req.payloadBytes > maxPayloadBytes;
    const differentEndpoint =
      currentBatch.length > 0 &&
      currentBatch[0].endpoint !== req.endpoint;

    if (wouldExceedSize || wouldExceedBytes || differentEndpoint) {
      if (currentBatch.length > 0) {
        batches.push({
          requests: currentBatch,
          totalBytes: currentBytes,
          estimatedLatencyMs: baseLatencyMs,
        });
      }
      currentBatch = [];
      currentBytes = 0;
    }

    currentBatch.push(req);
    currentBytes += req.payloadBytes;
  }

  if (currentBatch.length > 0) {
    batches.push({
      requests: currentBatch,
      totalBytes: currentBytes,
      estimatedLatencyMs: baseLatencyMs,
    });
  }

  return batches;
}

// 10 requests of ~1KB each, max batch = 5, max payload = 4KB
// → 3 batches instead of 10 individual round trips`,
      complexity: 'Time: O(n log n) | Space: O(n)',
    },
  ],
};
