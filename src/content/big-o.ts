export interface ComplexityClass {
  notation: string;
  name: string;
  description: string;
  analogy: string;
  examples: string[];
  color: string;
  mathFn: (n: number) => number;
}

export const complexities: ComplexityClass[] = [
  {
    notation: 'O(1)',
    name: 'Constant',
    description: 'Execution time stays the same regardless of input size.',
    analogy: 'Looking up a word in a dictionary by page number — instant no matter how thick the book.',
    examples: ['Array index access', 'Hash map lookup', 'Stack push/pop'],
    color: 'text-emerald-500',
    mathFn: () => 1,
  },
  {
    notation: 'O(log n)',
    name: 'Logarithmic',
    description: 'Execution time grows slowly as input doubles — each step halves the problem.',
    analogy: 'Finding a name in a phone book by splitting it in half each time.',
    examples: ['Binary search', 'Balanced BST operations', 'Binary lifting'],
    color: 'text-sky-500',
    mathFn: (n) => (n <= 0 ? 0 : Math.log2(n)),
  },
  {
    notation: 'O(n)',
    name: 'Linear',
    description: 'Execution time grows proportionally to input size.',
    analogy: 'Reading every page of a book to find a specific quote.',
    examples: ['Linear search', 'Array traversal', 'Counting sort (with range)'],
    color: 'text-blue-500',
    mathFn: (n) => n,
  },
  {
    notation: 'O(n log n)',
    name: 'Linearithmic',
    description: 'Slightly worse than linear — the cost of efficient sorting.',
    analogy: 'Sorting a deck of cards by repeatedly splitting and merging.',
    examples: ['Merge sort', 'Quick sort (average)', 'Heap sort'],
    color: 'text-violet-500',
    mathFn: (n) => (n <= 0 ? 0 : n * Math.log2(n)),
  },
  {
    notation: 'O(n\u00B2)',
    name: 'Quadratic',
    description: 'Execution time squares with input — nested loops over the same data.',
    analogy: 'Comparing every student in a class with every other student for a group project.',
    examples: ['Bubble sort', 'Selection sort', 'Brute-force pair checking'],
    color: 'text-amber-500',
    mathFn: (n) => n * n,
  },
  {
    notation: 'O(2\u207F)',
    name: 'Exponential',
    description: 'Execution time doubles with each additional input element.',
    analogy: 'Trying every combination on a lock — each digit multiplies the possibilities.',
    examples: ['Recursive Fibonacci (naive)', 'Power set generation', 'Brute-force TSP'],
    color: 'text-orange-500',
    mathFn: (n) => Math.pow(2, n),
  },
  {
    notation: 'O(n!)',
    name: 'Factorial',
    description: 'Execution time explodes — grows faster than any exponential.',
    analogy: 'Trying every possible seating arrangement at a dinner table.',
    examples: ['Generating all permutations', 'Brute-force traveling salesman'],
    color: 'text-red-500',
    mathFn: (n) => {
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    },
  },
];

export const strokeColors = [
  'stroke-emerald-500',
  'stroke-sky-500',
  'stroke-blue-500',
  'stroke-violet-500',
  'stroke-amber-500',
  'stroke-orange-500',
  'stroke-red-500',
];

export const bgColors = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-red-500',
];

export const whatIsBigO = `Big O notation describes the **asymptotic upper bound** of an algorithm's growth rate. It answers: "As input grows toward infinity, how does the number of operations scale?"

**Formal definition**
For functions f(n) and g(n), we say f(n) = O(g(n)) if there exist constants \`c > 0\` and \`n₀ ≥ 0\` such that \`f(n) ≤ c · g(n)\` for all \`n ≥ n₀\`. In practice, this means we care about the **dominant term** and ignore constants.

**Why it matters**
- Lets you compare algorithms **independent of hardware** — a O(n log n) sort always beats O(n²) at scale
- Guides data structure selection — the right structure turns O(n) lookups into O(1)
- Interview shorthand — every solution discussion involves stating time and space complexity`;

export const howToDetermine = `**Drop constants and lower-order terms**
\`3n² + 5n + 100\` simplifies to O(n²). Constants and smaller terms become irrelevant at scale.

**Nested loops multiply**
A loop inside a loop over the same data: O(n) × O(n) = O(n²). Three levels deep: O(n³).

**Sequential blocks add**
Two independent loops one after another: O(n) + O(n) = O(2n) = O(n). Take the dominant term.

**Halving means logarithmic**
Any time you divide the problem in half each step (binary search, balanced BST traversal), the complexity is O(log n).

**Recurrence relations**
Divide-and-conquer algorithms like merge sort split into subproblems: T(n) = 2T(n/2) + O(n) solves to O(n log n) via the Master Theorem.

**Common patterns to recognize**
- Single loop over n elements → O(n)
- Loop with index doubling (\`i *= 2\`) → O(log n)
- Two nested loops → O(n²)
- Processing all subsets → O(2ⁿ)
- Processing all permutations → O(n!)`;

export const spaceVsTime = `**Time complexity** measures how the number of operations grows with input size. **Space complexity** measures how much additional memory an algorithm needs.

**Auxiliary space vs total space**
Auxiliary space is the extra memory beyond the input itself. In-place algorithms like quick sort use O(log n) auxiliary space (call stack), while merge sort needs O(n) for the temporary array.

**The call stack counts**
Recursive algorithms consume stack frames. A recursive function called n times deep uses O(n) space even if it allocates nothing else. This is why iterative solutions sometimes have better space complexity.

**Common trade-offs**
- **Hash maps** trade O(n) space for O(1) lookup time (vs O(n) search)
- **Memoization** caches results in O(n) space to avoid O(2ⁿ) recomputation
- **Sorting first** costs O(n log n) time but can reduce a subsequent search from O(n²) to O(n)
- **Bit manipulation** can compress boolean arrays from O(n) to O(n/32) space`;

export const referenceTable = `**Quick reference: common operations**
| Data structure | Access | Search | Insert | Delete | Space |
|---|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) | O(n) |
| Linked list | O(n) | O(n) | O(1) | O(1) | O(n) |
| Hash map | — | O(1)* | O(1)* | O(1)* | O(n) |
| Binary search tree | O(log n)* | O(log n)* | O(log n)* | O(log n)* | O(n) |
| Heap | O(1) top | O(n) | O(log n) | O(log n) | O(n) |
| Stack / Queue | O(n) | O(n) | O(1) | O(1) | O(n) |

**Quick reference: sorting algorithms**
| Algorithm | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Counting sort | O(n + k) | O(n + k) | O(n + k) | O(k) | Yes |`;
