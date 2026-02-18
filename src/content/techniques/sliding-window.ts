import type { Topic } from '../types';

export const slidingWindow: Topic = {
  id: 'sliding-window',
  title: 'Sliding Window',
  category: 'techniques',
  description: 'Maintain a window over a contiguous subarray/substring that expands and shrinks to find optimal solutions in O(n).',
  invariant: 'Window `[l..r]` is kept valid. Expand `r`, and while invalid, shrink `l` until valid again. Each index moves forward at most once.',
  theory: `The sliding window technique maintains a "window" — a contiguous range [left, right] — over an array or string. By advancing the right boundary to expand and the left boundary to shrink, you process each element at most twice, turning O(n²) brute force into O(n).

**Two types of sliding windows:**

1. **Fixed-size window:** The window always has exactly k elements. Slide it one position at a time, adding the new element and removing the old one.
   - Pattern: Initialize window of size k, then slide: add right, remove left.
   - Example: Maximum sum subarray of size k.

2. **Variable-size window:** The window grows and shrinks based on a condition. Expand right to include more elements; shrink left when a constraint is violated.
   - Pattern: Expand right unconditionally. While the window is invalid, shrink from left. Track the best valid window.
   - Example: Longest substring without repeating characters.

**Variable-size window template:**
\`\`\`
let left = 0;
for (let right = 0; right < n; right++) {
  // Add arr[right] to window state
  while (windowIsInvalid()) {
    // Remove arr[left] from window state
    left++;
  }
  // Update answer with current valid window
}
\`\`\`

**When to recognize the pattern:**
- The problem asks about contiguous subarrays or substrings
- You need to find the longest/shortest/max/min subarray satisfying a condition
- Brute force would check all O(n²) subarrays
- The constraint is monotonic: if the window is invalid, making it larger won't help (so shrink)`,
  keyPoints: [
    'Fixed window: size stays constant, slide one step at a time',
    'Variable window: expand right, shrink left when constraint is violated',
    'Each element is added and removed at most once → O(n) total',
    'Use a Map or Set to track window contents efficiently',
    'The constraint must be monotonic — expanding an invalid window cannot make it valid',
    'Common data structures inside the window: frequency map, count of distinct elements, running sum',
  ],
  visualization: 'SlidingWindowViz',
  useCases: [
    {
      title: 'Observability: rolling error rate',
      description:
        'Compute the error rate over a sliding time window of the last N minutes from a structured log stream, used in alerting dashboards.',
      code: `interface LogEvent {
  timestamp: number; // Unix ms
  level: 'info' | 'warn' | 'error' | 'fatal';
  service: string;
  message: string;
}

interface ErrorRateSnapshot {
  windowStart: number;
  windowEnd: number;
  errorCount: number;
  totalCount: number;
  errorRate: number;
}

function rollingErrorRate(
  events: LogEvent[],
  windowMs: number
): ErrorRateSnapshot[] {
  // Events sorted by timestamp
  const snapshots: ErrorRateSnapshot[] = [];
  let left = 0;
  let errorCount = 0;

  for (let right = 0; right < events.length; right++) {
    if (events[right].level === 'error' || events[right].level === 'fatal') {
      errorCount++;
    }

    // Shrink window to maintain the time bound
    while (events[right].timestamp - events[left].timestamp > windowMs) {
      if (events[left].level === 'error' || events[left].level === 'fatal') {
        errorCount--;
      }
      left++;
    }

    const totalCount = right - left + 1;
    snapshots.push({
      windowStart: events[left].timestamp,
      windowEnd: events[right].timestamp,
      errorCount,
      totalCount,
      errorRate: totalCount > 0 ? errorCount / totalCount : 0,
    });
  }

  return snapshots;
}`,
      complexity: 'Time: O(n) | Space: O(1) excluding output',
    },
    {
      title: 'Security: rate limiter',
      description:
        'Count requests per client in a sliding time window to enforce rate limits, returning whether each incoming request should be allowed or throttled.',
      code: `interface Request {
  clientId: string;
  timestamp: number; // Unix ms
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

class SlidingWindowRateLimiter {
  private windows = new Map<string, number[]>();

  constructor(private config: RateLimitConfig) {}

  isAllowed(request: Request): boolean {
    const { clientId, timestamp } = request;
    const { windowMs, maxRequests } = this.config;

    if (!this.windows.has(clientId)) {
      this.windows.set(clientId, []);
    }

    const timestamps = this.windows.get(clientId)!;

    // Slide: remove timestamps outside the window
    let left = 0;
    while (left < timestamps.length &&
           timestamps[left] <= timestamp - windowMs) {
      left++;
    }

    // Trim expired entries
    if (left > 0) timestamps.splice(0, left);

    if (timestamps.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    timestamps.push(timestamp);
    return true;
  }
}

// Usage:
// const limiter = new SlidingWindowRateLimiter({
//   windowMs: 60_000,  // 1 minute
//   maxRequests: 100,
// });
// limiter.isAllowed({ clientId: 'user-42', timestamp: Date.now() })`,
      complexity: 'Time: O(1) amortized per request | Space: O(maxRequests per client)',
    },
    {
      title: 'ML feature engineering',
      description:
        'Compute rolling average and max features from time-series sensor data to feed into a machine learning model for anomaly detection.',
      code: `interface SensorReading {
  timestamp: number;
  value: number;
  sensorId: string;
}

interface RollingFeatures {
  timestamp: number;
  rollingAvg: number;
  rollingMax: number;
  rollingStdDev: number;
}

function computeRollingFeatures(
  readings: SensorReading[],
  windowSize: number
): RollingFeatures[] {
  const features: RollingFeatures[] = [];
  let windowSum = 0;
  let windowSumSq = 0;
  let windowMax = -Infinity;

  // Fixed-size sliding window over sorted readings
  for (let right = 0; right < readings.length; right++) {
    const val = readings[right].value;
    windowSum += val;
    windowSumSq += val * val;
    windowMax = Math.max(windowMax, val);

    if (right >= windowSize) {
      const removed = readings[right - windowSize].value;
      windowSum -= removed;
      windowSumSq -= removed * removed;

      // Recompute max if we removed the current max
      if (removed >= windowMax) {
        windowMax = -Infinity;
        for (let i = right - windowSize + 1; i <= right; i++) {
          windowMax = Math.max(windowMax, readings[i].value);
        }
      }
    }

    if (right >= windowSize - 1) {
      const avg = windowSum / windowSize;
      const variance = windowSumSq / windowSize - avg * avg;
      features.push({
        timestamp: readings[right].timestamp,
        rollingAvg: avg,
        rollingMax: windowMax,
        rollingStdDev: Math.sqrt(Math.max(0, variance)),
      });
    }
  }

  return features;
}`,
      complexity: 'Time: O(n) amortized | Space: O(1) excluding output',
    },
    {
      title: 'Product analytics: session detection',
      description:
        'Detect user sessions by grouping clickstream events within a sliding inactivity window — events more than N minutes apart start a new session.',
      code: `interface ClickEvent {
  userId: string;
  timestamp: number;
  page: string;
  action: string;
}

interface Session {
  userId: string;
  startTime: number;
  endTime: number;
  events: ClickEvent[];
  durationMs: number;
}

function detectSessions(
  events: ClickEvent[],
  inactivityThresholdMs: number
): Session[] {
  if (events.length === 0) return [];

  // Events pre-sorted by timestamp
  const sessions: Session[] = [];
  let sessionStart = 0;

  for (let right = 1; right <= events.length; right++) {
    const gap = right < events.length
      ? events[right].timestamp - events[right - 1].timestamp
      : Infinity;

    // Gap exceeds threshold or end of events — close session
    if (gap > inactivityThresholdMs) {
      const sessionEvents = events.slice(sessionStart, right);
      sessions.push({
        userId: events[sessionStart].userId,
        startTime: events[sessionStart].timestamp,
        endTime: events[right - 1].timestamp,
        events: sessionEvents,
        durationMs:
          events[right - 1].timestamp - events[sessionStart].timestamp,
      });
      sessionStart = right;
    }
  }

  return sessions;
}

// Usage:
// const sessions = detectSessions(userEvents, 30 * 60 * 1000);
// sessions.map(s => ({
//   pages: s.events.length,
//   duration: s.durationMs / 1000 + 's'
// }));`,
      complexity: 'Time: O(n) | Space: O(n) for session event slices',
    },
    {
      title: 'Text search: shortest snippet',
      description:
        'Find the shortest substring of a document containing all search query terms — the same technique used for generating search result snippets.',
      code: `function shortestSnippet(
  document: string[],  // Tokenized words
  queryTerms: string[]
): { start: number; end: number; text: string[] } | null {
  const need = new Map<string, number>();
  for (const term of queryTerms) {
    need.set(term, (need.get(term) ?? 0) + 1);
  }

  const window = new Map<string, number>();
  let have = 0;
  const required = need.size;

  let bestStart = 0;
  let bestLen = Infinity;
  let left = 0;

  for (let right = 0; right < document.length; right++) {
    const word = document[right].toLowerCase();
    window.set(word, (window.get(word) ?? 0) + 1);

    if (need.has(word) && window.get(word) === need.get(word)) {
      have++;
    }

    // Shrink while all terms are covered
    while (have === required) {
      const windowLen = right - left + 1;
      if (windowLen < bestLen) {
        bestLen = windowLen;
        bestStart = left;
      }

      const leftWord = document[left].toLowerCase();
      window.set(leftWord, window.get(leftWord)! - 1);
      if (need.has(leftWord) && window.get(leftWord)! < need.get(leftWord)!) {
        have--;
      }
      left++;
    }
  }

  if (bestLen === Infinity) return null;
  return {
    start: bestStart,
    end: bestStart + bestLen - 1,
    text: document.slice(bestStart, bestStart + bestLen),
  };
}`,
      complexity: 'Time: O(n + q) | Space: O(q) where q = unique query terms',
    },
    {
      title: 'Real-time chart data windowing',
      description:
        'Maintain a fixed time window of data points for a live-updating chart. As new data streams in, old points slide out — used in dashboards, stock tickers, and monitoring UIs.',
      code: `interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

interface ChartWindow {
  points: DataPoint[];
  min: number;
  max: number;
  average: number;
  timeRange: { start: number; end: number };
}

class LiveChartBuffer {
  private buffer: DataPoint[] = [];
  private windowMs: number;
  private left = 0;
  private sum = 0;
  private min = Infinity;
  private max = -Infinity;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  push(point: DataPoint): ChartWindow {
    this.buffer.push(point);
    this.sum += point.value;
    this.min = Math.min(this.min, point.value);
    this.max = Math.max(this.max, point.value);

    // Slide left edge: remove points outside the window
    while (
      this.left < this.buffer.length &&
      point.timestamp - this.buffer[this.left].timestamp > this.windowMs
    ) {
      const removed = this.buffer[this.left];
      this.sum -= removed.value;
      this.left++;

      // Recompute min/max if we removed an extreme
      if (removed.value <= this.min || removed.value >= this.max) {
        this.recomputeExtremes();
      }
    }

    const visible = this.buffer.slice(this.left);
    const count = visible.length;

    return {
      points: visible,
      min: this.min,
      max: this.max,
      average: count > 0 ? this.sum / count : 0,
      timeRange: {
        start: visible[0]?.timestamp ?? point.timestamp,
        end: point.timestamp,
      },
    };
  }

  private recomputeExtremes(): void {
    this.min = Infinity;
    this.max = -Infinity;
    for (let i = this.left; i < this.buffer.length; i++) {
      this.min = Math.min(this.min, this.buffer[i].value);
      this.max = Math.max(this.max, this.buffer[i].value);
    }
  }

  // Periodically compact to free memory from old points
  compact(): void {
    this.buffer = this.buffer.slice(this.left);
    this.left = 0;
  }
}

// 60-second window for a CPU usage chart
const chart = new LiveChartBuffer(60_000);
// Every second, push a new data point:
// const window = chart.push({ timestamp: Date.now(), value: 42.5 });
// window.points → last 60 seconds of data for rendering
// window.min/max → Y-axis bounds
// window.average → display in tooltip`,
      complexity: 'Time: O(1) amortized per push | Space: O(window size)',
    },
    {
      title: 'Product analytics: longest uninterrupted segment',
      description:
        'Find the longest contiguous session segment containing at most K occurrences of a disruptive event — used to measure engagement quality, identify smooth user flows, or flag sessions degraded by errors.',
      code: `interface SessionEvent {
  timestamp: number;
  type: string;
  page: string;
}

interface Segment {
  start: number;
  end: number;
  length: number;
  interruptionCount: number;
  events: SessionEvent[];
}

function longestSegmentWithAtMostKInterruptions(
  events: SessionEvent[],
  interruptionType: string,
  maxInterruptions: number
): Segment | null {
  if (events.length === 0) return null;

  let left = 0;
  let interruptionCount = 0;
  let bestStart = 0;
  let bestLen = 0;

  for (let right = 0; right < events.length; right++) {
    if (events[right].type === interruptionType) {
      interruptionCount++;
    }

    // Shrink from left while over budget
    while (interruptionCount > maxInterruptions) {
      if (events[left].type === interruptionType) {
        interruptionCount--;
      }
      left++;
    }

    const windowLen = right - left + 1;
    if (windowLen > bestLen) {
      bestLen = windowLen;
      bestStart = left;
    }
  }

  return {
    start: bestStart,
    end: bestStart + bestLen - 1,
    length: bestLen,
    interruptionCount: maxInterruptions,
    events: events.slice(bestStart, bestStart + bestLen),
  };
}

// Longest stretch with zero errors (fully smooth)
// longestSegmentWithAtMostKInterruptions(events, 'error', 0);

// Longest stretch tolerating up to 2 buffering events
// longestSegmentWithAtMostKInterruptions(events, 'buffer', 2);

// Find longest engagement window with at most 1 ad break
// longestSegmentWithAtMostKInterruptions(events, 'ad_break', 1);`,
      complexity: 'Time: O(n) | Space: O(1) excluding output',
    },
  ],
};
