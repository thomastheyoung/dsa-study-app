import { parseTheoryBlocks, TheoryBlock, formatInline } from '../components/TheorySection';
import { ComplexityChartViz } from '../components/visualizations/ComplexityChartViz';
import {
  complexities,
  whatIsBigO,
  howToDetermine,
  spaceVsTime,
  referenceTable,
} from '../content/big-o';

export function BigOPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-bigo bg-bigo-dim mb-2">
          Foundational concept
        </span>
        <h1 className="text-3xl font-bold text-slate-900">Big O notation</h1>
        <p className="mt-2 text-slate-500 text-lg">
          The framework for analyzing algorithm efficiency — how time and space
          requirements grow as input scales.
        </p>
      </div>

      {/* What is Big O? */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">What is Big O?</h2>
        <div className="prose-custom space-y-4">
          {parseTheoryBlocks(whatIsBigO).map((block, i) => (
            <TheoryBlock key={i} block={block} headingLevel={3} />
          ))}
        </div>
      </section>

      {/* Common complexities */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Common complexities
        </h2>

        <div className="rounded-xl border border-slate-200 p-4 sm:p-6">
          <ComplexityChartViz />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {complexities.map((c) => (
            <div
              key={c.notation}
              className="rounded-lg border border-slate-200 p-4 space-y-2"
            >
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-semibold ${c.color}`}
                  dangerouslySetInnerHTML={{ __html: formatInline(c.notation) }}
                />
                <span className="text-sm text-slate-500">{c.name}</span>
              </div>
              <p className="text-sm text-slate-600">{c.description}</p>
              <p className="text-xs text-slate-400 italic">{c.analogy}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {c.examples.map((ex) => (
                  <span
                    key={ex}
                    className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to determine complexity */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          How to determine complexity
        </h2>
        <div className="prose-custom space-y-4">
          {parseTheoryBlocks(howToDetermine).map((block, i) => (
            <TheoryBlock key={i} block={block} headingLevel={3} />
          ))}
        </div>
      </section>

      {/* Space vs time */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Space vs time complexity
        </h2>
        <div className="prose-custom space-y-4">
          {parseTheoryBlocks(spaceVsTime).map((block, i) => (
            <TheoryBlock key={i} block={block} headingLevel={3} />
          ))}
        </div>
      </section>

      {/* Quick reference */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Quick reference
        </h2>
        <div className="prose-custom space-y-4">
          {parseTheoryBlocks(referenceTable).map((block, i) => (
            <TheoryBlock key={i} block={block} headingLevel={3} />
          ))}
        </div>
      </section>
    </div>
  );
}
