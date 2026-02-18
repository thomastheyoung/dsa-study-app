import type { Topic } from '../types';

export const twoPointers: Topic = {
  id: 'two-pointers',
  title: 'Two Pointers',
  category: 'techniques',
  description: 'Converging or parallel pointer technique that reduces nested loops from O(n²) to O(n).',
  invariant: 'Pointers only advance forward (or inward). Each element is visited at most once per pointer, and the movement rule guarantees no valid solution is skipped.',
  theory: `The two-pointer technique uses two indices that move through a data structure (usually a sorted array or linked list) to solve problems that would otherwise require nested loops.

**Three main patterns:**

1. **Converging pointers** — Start from both ends, move inward. Works on sorted arrays.
   - Example: Two Sum (sorted), container with most water, palindrome checking.

2. **Same-direction (fast/slow)** — Both start at the beginning, one moves faster.
   - Example: Removing duplicates, linked list cycle detection, finding the middle.

3. **Parallel pointers** — One pointer per array, merge-style traversal.
   - Example: Merging sorted arrays, intersection of sorted arrays.

**When to recognize the pattern:**
- Input is sorted (or should be sorted)
- You need to find pairs/triplets with some property
- You're comparing elements from opposite ends
- You need to partition or deduplicate in-place
- The brute force involves nested loops over the same array

**Key insight:** The pointers eliminate the need for an inner loop because each pointer monotonically advances — once an element is skipped, we never revisit it.`,
  keyPoints: [
    'Reduces O(n²) brute force to O(n) by advancing two indices strategically',
    'Usually requires sorted input (or sort first for O(n log n) total)',
    'Converging: left + right pointers moving inward',
    'Same-direction: slow + fast pointers (Floyd\'s, dedup, etc.)',
    'Parallel: one pointer per input array (merge pattern)',
    'Always prove that skipping elements is safe — no valid solutions missed',
  ],
  visualization: 'ArrayViz',
  useCases: [
    {
      title: 'Log file correlation',
      description:
        'Two pointers walking sorted server and client log arrays by timestamp to correlate matching request/response pairs across distributed systems.',
      code: `interface LogEntry {
  timestamp: number;
  requestId: string;
  type: 'request' | 'response';
  payload: string;
}

interface CorrelatedPair {
  request: LogEntry;
  response: LogEntry;
  latencyMs: number;
}

function correlateRequestResponse(
  serverLogs: LogEntry[],
  clientLogs: LogEntry[]
): CorrelatedPair[] {
  // Both arrays sorted by timestamp
  const pairs: CorrelatedPair[] = [];
  let s = 0;
  let c = 0;

  while (s < serverLogs.length && c < clientLogs.length) {
    const server = serverLogs[s];
    const client = clientLogs[c];

    if (server.requestId === client.requestId) {
      pairs.push({
        request: server,
        response: client,
        latencyMs: client.timestamp - server.timestamp,
      });
      s++;
      c++;
    } else if (server.timestamp <= client.timestamp) {
      s++; // Advance the pointer with the earlier timestamp
    } else {
      c++;
    }
  }

  return pairs;
}`,
      complexity: 'Time: O(n + m) | Space: O(1) excluding output',
    },
    {
      title: 'Media transcoding pipeline',
      description:
        'Parallel pointers over audio and video frame arrays to synchronize A/V streams during transcoding, aligning frames by presentation timestamp.',
      code: `interface VideoFrame {
  pts: number; // Presentation timestamp in ms
  data: Uint8Array;
}

interface AudioFrame {
  pts: number;
  samples: Float32Array;
}

interface SyncedFrame {
  video: VideoFrame;
  audio: AudioFrame;
  drift: number; // ms difference between matched frames
}

function syncAVFrames(
  videoFrames: VideoFrame[],
  audioFrames: AudioFrame[],
  toleranceMs: number = 40
): SyncedFrame[] {
  const synced: SyncedFrame[] = [];
  let v = 0;
  let a = 0;

  while (v < videoFrames.length && a < audioFrames.length) {
    const drift = videoFrames[v].pts - audioFrames[a].pts;

    if (Math.abs(drift) <= toleranceMs) {
      synced.push({
        video: videoFrames[v],
        audio: audioFrames[a],
        drift,
      });
      v++;
      a++;
    } else if (drift > 0) {
      a++; // Audio is behind — advance audio pointer
    } else {
      v++; // Video is behind — advance video pointer
    }
  }

  return synced;
}`,
      complexity: 'Time: O(v + a) | Space: O(1) excluding output',
    },
    {
      title: 'Payment reconciliation',
      description:
        'Converging pointers on sorted transactions to find matching debit/credit pairs that sum to zero, reconciling accounts payable vs receivable.',
      code: `interface Transaction {
  id: string;
  amount: number; // Positive = credit, negative = debit
  date: string;
  counterparty: string;
}

interface ReconciledPair {
  debit: Transaction;
  credit: Transaction;
}

function reconcileTransactions(
  transactions: Transaction[]
): ReconciledPair[] {
  // Sort by absolute amount for converging pointer search
  const sorted = [...transactions].sort(
    (a, b) => a.amount - b.amount
  );

  const reconciled: ReconciledPair[] = [];
  let left = 0;
  let right = sorted.length - 1;

  while (left < right) {
    const sum = sorted[left].amount + sorted[right].amount;

    if (sum === 0) {
      reconciled.push({
        debit: sorted[left],
        credit: sorted[right],
      });
      left++;
      right--;
    } else if (sum < 0) {
      left++; // Need a larger credit to offset
    } else {
      right--; // Need a larger debit to offset
    }
  }

  return reconciled;
}`,
      complexity: 'Time: O(n log n) | Space: O(n) for sorted copy',
    },
    {
      title: 'Search result merging',
      description:
        'Parallel pointers merging sorted relevance-scored results from multiple search index shards into a single ranked list.',
      code: `interface SearchResult {
  docId: string;
  score: number;
  snippet: string;
}

function mergeSortedResults(
  shardA: SearchResult[],
  shardB: SearchResult[],
  limit: number
): SearchResult[] {
  // Both shards sorted by score descending
  const merged: SearchResult[] = [];
  let a = 0;
  let b = 0;

  while (merged.length < limit) {
    const hasA = a < shardA.length;
    const hasB = b < shardB.length;

    if (!hasA && !hasB) break;

    if (!hasB || (hasA && shardA[a].score >= shardB[b].score)) {
      merged.push(shardA[a]);
      a++;
    } else {
      merged.push(shardB[b]);
      b++;
    }
  }

  return merged;
}

// Generalized: merge K sorted shards pairwise
function mergeKShards(
  shards: SearchResult[][],
  limit: number
): SearchResult[] {
  let result = shards[0] ?? [];
  for (let i = 1; i < shards.length; i++) {
    result = mergeSortedResults(result, shards[i], limit);
  }
  return result;
}`,
      complexity: 'Time: O(n + m) per pair, O(K * n) total | Space: O(n)',
    },
    {
      title: 'Data cleaning — dedup sorted records',
      description:
        'Fast/slow pointers to remove duplicate rows from a sorted database export in-place, keeping only unique entries by a composite key.',
      code: `interface CustomerRecord {
  email: string;
  name: string;
  lastActive: string;
  source: string;
}

function dedupSortedRecords(
  records: CustomerRecord[]
): number {
  if (records.length === 0) return 0;

  // Records pre-sorted by email (primary key)
  let slow = 0; // Write position for unique records

  for (let fast = 1; fast < records.length; fast++) {
    if (records[fast].email !== records[slow].email) {
      slow++;
      records[slow] = records[fast];
    } else {
      // Duplicate email — keep the one with latest activity
      if (records[fast].lastActive > records[slow].lastActive) {
        records[slow] = records[fast];
      }
    }
  }

  return slow + 1; // Length of deduplicated portion
}

// Usage:
// const records = loadSortedExport('customers.csv');
// const uniqueCount = dedupSortedRecords(records);
// records.length = uniqueCount; // Truncate in-place`,
      complexity: 'Time: O(n) | Space: O(1)',
    },
    {
      title: 'Inline diff highlighting',
      description:
        'Parallel pointers walk two sorted arrays of line hashes (old and new file) to identify added, removed, and unchanged lines — the core of a side-by-side diff view component.',
      code: `interface DiffLine {
  lineNum: number;
  text: string;
  hash: number;
}

type DiffResult =
  | { type: 'unchanged'; oldLine: DiffLine; newLine: DiffLine }
  | { type: 'removed'; oldLine: DiffLine }
  | { type: 'added'; newLine: DiffLine };

function computeLineDiff(
  oldLines: DiffLine[],
  newLines: DiffLine[]
): DiffResult[] {
  const result: DiffResult[] = [];
  let o = 0;
  let n = 0;

  while (o < oldLines.length && n < newLines.length) {
    if (oldLines[o].hash === newLines[n].hash) {
      // Lines match — unchanged
      result.push({
        type: 'unchanged',
        oldLine: oldLines[o],
        newLine: newLines[n],
      });
      o++;
      n++;
    } else {
      // Look ahead to see if old line appears later in new
      const newIdx = findNextMatch(newLines, n, oldLines[o].hash);
      const oldIdx = findNextMatch(oldLines, o, newLines[n].hash);

      if (newIdx !== -1 && (oldIdx === -1 || newIdx - n <= oldIdx - o)) {
        // New lines were added before the match
        while (n < newIdx) {
          result.push({ type: 'added', newLine: newLines[n] });
          n++;
        }
      } else if (oldIdx !== -1) {
        // Old lines were removed before the match
        while (o < oldIdx) {
          result.push({ type: 'removed', oldLine: oldLines[o] });
          o++;
        }
      } else {
        // No match found — both lines changed
        result.push({ type: 'removed', oldLine: oldLines[o] });
        result.push({ type: 'added', newLine: newLines[n] });
        o++;
        n++;
      }
    }
  }

  // Drain remaining
  while (o < oldLines.length) {
    result.push({ type: 'removed', oldLine: oldLines[o++] });
  }
  while (n < newLines.length) {
    result.push({ type: 'added', newLine: newLines[n++] });
  }

  return result;
}

function findNextMatch(
  lines: DiffLine[],
  start: number,
  hash: number,
  maxLookahead: number = 5
): number {
  for (let i = start; i < Math.min(lines.length, start + maxLookahead); i++) {
    if (lines[i].hash === hash) return i;
  }
  return -1;
}

// Side-by-side diff:
//   - const x = 1;     (removed, red)
//   + const x = 2;     (added, green)
//     return x;         (unchanged, no highlight)`,
      complexity: 'Time: O(n + m) with bounded lookahead | Space: O(n + m)',
    },
    {
      title: 'Log processing — mirrored structure validation',
      description:
        'Converging pointers scan a sequence of log tokens from both ends to verify mirrored (palindrome-like) structure — useful for validating symmetric request/response chains, bracket-matched protocols, or round-trip audit trails.',
      code: `interface LogToken {
  id: string;
  action: string;
  direction: 'open' | 'close';
}

interface MismatchReport {
  index: [number, number];
  expected: string;
  actual: string;
}

function validateMirroredLog(
  tokens: LogToken[]
): { valid: boolean; mismatches: MismatchReport[] } {
  const mismatches: MismatchReport[] = [];
  let left = 0;
  let right = tokens.length - 1;

  while (left < right) {
    const opener = tokens[left];
    const closer = tokens[right];

    if (opener.action !== closer.action) {
      mismatches.push({
        index: [left, right],
        expected: opener.action,
        actual: closer.action,
      });
    }

    if (opener.direction !== 'open' || closer.direction !== 'close') {
      mismatches.push({
        index: [left, right],
        expected: 'open/close pair',
        actual: \`\${opener.direction}/\${closer.direction}\`,
      });
    }

    left++;
    right--;
  }

  return { valid: mismatches.length === 0, mismatches };
}

// Example: validate symmetric request chain
// [open:auth, open:query, close:query, close:auth]
//  ^left                                ^right     ✓ match
//           ^left          ^right                  ✓ match`,
      complexity: 'Time: O(n) | Space: O(1) excluding report',
    },
    {
      title: 'Text pipeline — in-place sanitization',
      description:
        'Fast/slow pointers compact valid characters in-place, dropping invalid ones without allocating a new buffer — used in input sanitization, log scrubbing, or stripping control characters from user-submitted text.',
      code: `type CharPredicate = (char: string, index: number) => boolean;

function sanitizeInPlace(
  chars: string[],
  isValid: CharPredicate
): number {
  let slow = 0; // Write position for valid characters

  for (let fast = 0; fast < chars.length; fast++) {
    if (isValid(chars[fast], fast)) {
      chars[slow] = chars[fast];
      slow++;
    }
  }

  return slow; // New logical length
}

// Strip control characters from user input
const input = Array.from('Hello\\x00World\\x1B[31m!');
const len = sanitizeInPlace(
  input,
  (ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) < 127
);
// input[0..len-1] = ['H','e','l','l','o','W','o','r','l','d','!']

// Scrub PII tokens from log lines
function scrubTokens(
  tokens: string[],
  piiPatterns: RegExp[]
): string[] {
  const isPII = (t: string) =>
    piiPatterns.some((p) => p.test(t));

  let slow = 0;
  for (let fast = 0; fast < tokens.length; fast++) {
    if (!isPII(tokens[fast])) {
      tokens[slow] = tokens[fast];
      slow++;
    }
  }

  tokens.length = slow;
  return tokens;
}`,
      complexity: 'Time: O(n) | Space: O(1)',
    },
  ],
};
