import type { Topic } from '../types';

export const monotonicStack: Topic = {
  id: 'monotonic-stack',
  title: 'Monotonic Stack',
  category: 'techniques',
  description: 'Maintain a stack in sorted order to answer "next greater/smaller" queries in O(n) instead of O(n²).',
  invariant: 'The stack stays sorted (increasing or decreasing). Each element is pushed and popped at most once — O(n) total. When an element is popped, the element being pushed is its next-greater (or next-smaller) answer.',
  theory: `A monotonic stack is a regular stack where elements are maintained in strictly increasing or decreasing order. When pushing a new element, you pop everything that violates the monotonic property. Each element is pushed and popped at most once, so the total work across all iterations is O(n) — even though each individual push may trigger multiple pops.

**Two variants:**

1. **Monotonic decreasing stack** — Elements decrease from bottom to top. When you push a value, pop all smaller values. The popped elements have found their "next greater element" (the value being pushed).
   - Solves: next greater element, stock span, daily temperatures.

2. **Monotonic increasing stack** — Elements increase from bottom to top. When you push a value, pop all larger values. The popped elements have found their "next smaller element."
   - Solves: next smaller element, largest rectangle in histogram, remove K digits.

**The invariant (why it works):**
When you pop element X because you're pushing Y:
- Y is the first element after X that breaks the monotonic property.
- This means Y is the **next greater** (or smaller) element for X.
- Elements still on the stack haven't found their answer yet — they're waiting for a future element to pop them.

**Template (next greater element, decreasing stack):**
\`\`\`
const stack: number[] = []; // indices
const result = new Array(n).fill(-1);
for (let i = 0; i < n; i++) {
  while (stack.length > 0 && arr[stack.at(-1)!] < arr[i]) {
    result[stack.pop()!] = arr[i]; // arr[i] is the answer for popped index
  }
  stack.push(i);
}
\`\`\`

**When to recognize the pattern:**
- "Find the next greater/smaller element for each position"
- "How many consecutive elements before hitting a larger/smaller one"
- "Find the largest rectangle" or "trapping rain water"
- "Remove elements to make the smallest/largest sequence"
- Any problem where brute force checks all pairs to the right (or left) for each element`,
  visualization: 'MonotonicStackViz',
  keyPoints: [
    'Each element is pushed and popped at most once → O(n) total despite nested loops',
    'Decreasing stack: finds next greater element; increasing stack: finds next smaller',
    'Store indices (not values) so you can compute distances and look up values',
    'When an element is popped, the element being pushed IS its answer',
    'Elements remaining on the stack at the end have no answer (use -1 or default)',
    'Can iterate left-to-right, right-to-left, or both depending on what you need',
  ],
  useCases: [
    {
      title: 'Financial: stock price span',
      description:
        'For each day\'s stock price, compute the span — the number of consecutive preceding days (including today) where the price was ≤ today\'s price. This is the classic monotonic stack problem, used in candlestick charts and technical analysis indicators.',
      code: `interface PriceData {
  date: string;
  price: number;
}

interface SpanResult {
  date: string;
  price: number;
  span: number;
}

function computeStockSpan(prices: PriceData[]): SpanResult[] {
  const result: SpanResult[] = [];
  const stack: number[] = []; // indices of prices in decreasing order

  for (let i = 0; i < prices.length; i++) {
    // Pop all days with price ≤ today's price
    while (
      stack.length > 0 &&
      prices[stack[stack.length - 1]].price <= prices[i].price
    ) {
      stack.pop();
    }

    // Span = distance to the previous day with a higher price
    // If stack is empty, all preceding days had lower prices
    const span = stack.length === 0 ? i + 1 : i - stack[stack.length - 1];

    result.push({
      date: prices[i].date,
      price: prices[i].price,
      span,
    });

    stack.push(i);
  }

  return result;
}

// Prices: [100, 80, 60, 70, 60, 85, 110]
// Spans:  [  1,  1,  1,  2,  1,  5,   7]
// Day 5 (85): spans back over 60,70,60,80 → span = 5`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
    {
      title: 'Monitoring: next threshold breach',
      description:
        'Given a time series of server CPU readings, find for each reading how many ticks until the CPU exceeds that level again. Used in alerting systems to estimate "time until this metric gets worse."',
      code: `interface MetricReading {
  timestamp: number;
  value: number;
  host: string;
}

interface BreachForecast {
  timestamp: number;
  value: number;
  ticksUntilHigher: number; // -1 if never exceeded
}

function nextBreachForecasts(
  readings: MetricReading[]
): BreachForecast[] {
  const n = readings.length;
  const result: BreachForecast[] = readings.map((r) => ({
    timestamp: r.timestamp,
    value: r.value,
    ticksUntilHigher: -1,
  }));

  // Monotonic decreasing stack of indices
  const stack: number[] = [];

  for (let i = 0; i < n; i++) {
    // Pop all readings that are less than the current one —
    // current reading is their "next greater element"
    while (
      stack.length > 0 &&
      readings[stack[stack.length - 1]].value < readings[i].value
    ) {
      const idx = stack.pop()!;
      result[idx].ticksUntilHigher = i - idx;
    }
    stack.push(i);
  }

  // Remaining stack entries: no future reading exceeded them
  return result;
}

// CPU: [73, 74, 75, 71, 69, 72, 76, 73]
// Wait: [ 1,  1,  4,  2,  1,  1, -1, -1]
// Reading 75 at index 2 → next higher is 76 at index 6 → wait = 4`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
    {
      title: 'Dashboard: largest rectangular area',
      description:
        'Given a histogram of bar heights (e.g., a bar chart widget showing daily active users), find the largest rectangular area that fits under the bars. This is the core of "largest rectangle in histogram," which also underlies the maximal rectangle in a binary matrix.',
      code: `interface BarData {
  label: string;
  height: number;
}

interface MaxRect {
  startIndex: number;
  endIndex: number;
  height: number;
  area: number;
}

function largestRectangle(bars: BarData[]): MaxRect {
  const n = bars.length;
  const stack: number[] = []; // monotonic increasing stack of indices
  let best: MaxRect = { startIndex: 0, endIndex: 0, height: 0, area: 0 };

  for (let i = 0; i <= n; i++) {
    const currentHeight = i < n ? bars[i].height : 0; // sentinel at end

    while (
      stack.length > 0 &&
      bars[stack[stack.length - 1]].height > currentHeight
    ) {
      const height = bars[stack.pop()!].height;
      // Width extends from the element after the new stack top to i - 1
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      const area = height * width;

      if (area > best.area) {
        best = {
          startIndex: stack.length === 0 ? 0 : stack[stack.length - 1] + 1,
          endIndex: i - 1,
          height,
          area,
        };
      }
    }

    stack.push(i);
  }

  return best;
}

// Heights: [2, 1, 5, 6, 2, 3]
// Largest rectangle: height=5, width=2 (indices 2-3), area=10
// Or: height=2, width=4 (indices 2-5), area=8 — but 10 > 8`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
    {
      title: 'Infrastructure: trapped capacity',
      description:
        'Given server utilization over time (like an elevation map), compute the total "trapped" idle capacity between utilization peaks — analogous to trapping rain water. Useful for capacity planning: how much burst headroom exists between peaks.',
      code: `interface UtilizationReading {
  timestamp: number;
  percent: number; // 0-100
}

interface TrappedCapacity {
  totalTrappedUnits: number;
  segments: Array<{
    startIdx: number;
    endIdx: number;
    trapped: number;
  }>;
}

function computeTrappedCapacity(
  readings: UtilizationReading[]
): TrappedCapacity {
  const n = readings.length;
  const stack: number[] = []; // monotonic decreasing stack of indices
  let totalTrapped = 0;
  const segments: TrappedCapacity['segments'] = [];

  for (let i = 0; i < n; i++) {
    while (
      stack.length > 0 &&
      readings[stack[stack.length - 1]].percent < readings[i].percent
    ) {
      const mid = stack.pop()!;

      if (stack.length === 0) break; // no left boundary

      const left = stack[stack.length - 1];
      const boundedHeight =
        Math.min(readings[left].percent, readings[i].percent) -
        readings[mid].percent;
      const width = i - left - 1;
      const trapped = boundedHeight * width;

      if (trapped > 0) {
        totalTrapped += trapped;
        segments.push({ startIdx: left, endIdx: i, trapped });
      }
    }

    stack.push(i);
  }

  return { totalTrappedUnits: totalTrapped, segments };
}

// Utilization: [80, 30, 50, 20, 90, 40, 70]
// Trapped between peaks:
//   Between 80 and 90: idle gaps at 30, 50, 20 → bounded by min(80,90)=80
//   Between 90 and 70: idle gap at 40 → bounded by min(90,70)=70`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
    {
      title: 'Build optimization: remove redundant steps',
      description:
        'Given a sequence of build step costs, remove exactly k steps to minimize the total build ID (treating costs as digits). This is the "remove K digits" problem — a monotonic increasing stack greedily removes larger digits that precede smaller ones.',
      code: `function minimizeBuildSequence(
  stepCosts: string, // digit string, e.g. "1432219"
  k: number
): string {
  const stack: string[] = []; // monotonic increasing stack of digits
  let remaining = k;

  for (const digit of stepCosts) {
    // Pop larger digits — they make the number bigger in higher positions
    while (
      remaining > 0 &&
      stack.length > 0 &&
      stack[stack.length - 1] > digit
    ) {
      stack.pop();
      remaining--;
    }
    stack.push(digit);
  }

  // If we haven't removed enough, trim from the end
  while (remaining > 0) {
    stack.pop();
    remaining--;
  }

  // Remove leading zeros
  const result = stack.join('').replace(/^0+/, '') || '0';
  return result;
}

// Input: "1432219", k = 3
// Step through:
//   push 1 → [1]
//   push 4 → [1, 4]
//   push 3 → pop 4, remaining=2 → [1, 3]
//   push 2 → pop 3, remaining=1 → [1, 2]
//   push 2 → [1, 2, 2]
//   push 1 → pop 2, remaining=0 → [1, 2, 1]
//   push 9 → [1, 2, 1, 9]
// Result: "1219"`,
      complexity: 'Time: O(n) | Space: O(n)',
    },
    {
      title: 'Real-time analytics: sliding window maximum',
      description:
        'Maintain the maximum value in a sliding window of size k over a data stream — used for real-time dashboards showing "peak value in the last k readings." Uses a monotonic decreasing deque where the front always holds the current maximum.',
      code: `interface WindowMax {
  index: number;
  value: number;
  windowMax: number;
}

function slidingWindowMaximum(
  values: number[],
  windowSize: number
): WindowMax[] {
  const result: WindowMax[] = [];
  const deque: number[] = []; // indices, values in monotonic decreasing order

  for (let i = 0; i < values.length; i++) {
    // Remove elements outside the window from the front
    while (deque.length > 0 && deque[0] <= i - windowSize) {
      deque.shift();
    }

    // Maintain monotonic decreasing: remove smaller elements from back
    while (
      deque.length > 0 &&
      values[deque[deque.length - 1]] <= values[i]
    ) {
      deque.pop();
    }

    deque.push(i);

    // Window is fully formed once we've seen at least windowSize elements
    if (i >= windowSize - 1) {
      result.push({
        index: i,
        value: values[i],
        windowMax: values[deque[0]], // front of deque is always the max
      });
    }
  }

  return result;
}

// Values:     [1, 3, -1, -3, 5, 3, 6, 7], k = 3
// Window max: [3, 3,  5,  5, 6, 7]
//
// Window [1,3,-1]  → max 3
// Window [3,-1,-3] → max 3
// Window [-1,-3,5] → max 5`,
      complexity: 'Time: O(n) | Space: O(k)',
    },
  ],
};
