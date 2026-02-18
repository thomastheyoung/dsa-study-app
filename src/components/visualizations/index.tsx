import { ArrayViz } from './ArrayViz';
import { TreeViz } from './TreeViz';
import { GraphViz } from './GraphViz';
import { StackQueueViz } from './StackQueueViz';
import { LinkedListViz } from './LinkedListViz';
import { HeapViz } from './HeapViz';
import { HashMapViz } from './HashMapViz';
import { SlidingWindowViz } from './SlidingWindowViz';
import { RecursionViz } from './RecursionViz';
import { GreedyViz } from './GreedyViz';
import { MemoizationViz } from './MemoizationViz';
import { MonotonicStackViz } from './MonotonicStackViz';
import { FastSlowViz } from './FastSlowViz';
import { PrefixSumViz } from './PrefixSumViz';

const vizMap: Record<string, React.FC> = {
  ArrayViz,
  TreeViz,
  GraphViz,
  StackQueueViz,
  LinkedListViz,
  HeapViz,
  HashMapViz,
  SlidingWindowViz,
  RecursionViz,
  GreedyViz,
  MemoizationViz,
  MonotonicStackViz,
  FastSlowViz,
  PrefixSumViz,
};

interface VisualizationProps {
  type: string;
}

export function Visualization({ type }: VisualizationProps) {
  const Component = vizMap[type];
  if (!Component) return null;
  return <Component />;
}
