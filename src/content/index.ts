import type { CategoryGroup, Topic } from './types';
import { arrays } from './data-structures/arrays';
import { hashMaps } from './data-structures/hash-maps';
import { stacksQueues } from './data-structures/stacks-queues';
import { linkedLists } from './data-structures/linked-lists';
import { trees } from './data-structures/trees';
import { graphs } from './data-structures/graphs';
import { heaps } from './data-structures/heaps';
import { sorting } from './algorithms/sorting';
import { searching } from './algorithms/searching';
import { bfsDfs } from './algorithms/bfs-dfs';
import { dynamicProgramming } from './algorithms/dynamic-programming';
import { twoPointers } from './techniques/two-pointers';
import { slidingWindow } from './techniques/sliding-window';
import { recursion } from './techniques/recursion';
import { greedy } from './techniques/greedy';
import { memoization } from './techniques/memoization';
import { monotonicStack } from './techniques/monotonic-stack';
import { prefixSumHashmap } from './techniques/prefix-sum-hashmap';
import { fastSlowPointers } from './techniques/fast-slow-pointers';

export const allTopics: Topic[] = [
  arrays,
  hashMaps,
  stacksQueues,
  linkedLists,
  trees,
  graphs,
  heaps,
  sorting,
  searching,
  bfsDfs,
  dynamicProgramming,
  twoPointers,
  slidingWindow,
  recursion,
  greedy,
  memoization,
  monotonicStack,
  prefixSumHashmap,
  fastSlowPointers,
];

export const topicsByCategory: CategoryGroup[] = [
  {
    label: 'Data structures',
    category: 'data-structures',
    topics: [arrays, hashMaps, stacksQueues, linkedLists, trees, graphs, heaps],
  },
  {
    label: 'Algorithms',
    category: 'algorithms',
    topics: [sorting, searching, bfsDfs, dynamicProgramming],
  },
  {
    label: 'Techniques',
    category: 'techniques',
    topics: [twoPointers, slidingWindow, recursion, greedy, memoization, monotonicStack, prefixSumHashmap, fastSlowPointers],
  },
];

export const topicMap = new Map<string, Topic>(
  allTopics.map((t) => [t.id, t])
);

export type { Topic, UseCase, CategoryGroup } from './types';
