import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { topicMap } from '../content';
import { TheorySection } from '../components/TheorySection';
import { UseCaseCard } from '../components/UseCaseCard';
import { Visualization } from '../components/visualizations';

const categoryLabel = {
  'data-structures': { text: 'Data structure', color: 'text-ds bg-ds-dim', accent: 'var(--color-ds)' },
  algorithms: { text: 'Algorithm', color: 'text-algo bg-algo-dim', accent: 'var(--color-algo)' },
  techniques: { text: 'Technique', color: 'text-tech bg-tech-dim', accent: 'var(--color-tech)' },
} as const;

const tabCategoryColors = {
  'data-structures': 'bg-ds-dim text-ds',
  algorithms: 'bg-algo-dim text-algo',
  techniques: 'bg-tech-dim text-tech',
} as const;

const cardCategoryColors = {
  'data-structures': 'bg-ds-dim text-ds',
  algorithms: 'bg-algo-dim text-algo',
  techniques: 'bg-tech-dim text-tech',
} as const;

type Tab = 'theory' | 'use-cases';

export function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('theory');
  const topic = topicMap.get(topicId ?? '');

  if (!topic) return <Navigate to="/" replace />;

  const cat = categoryLabel[topic.category];
  const tabColor = tabCategoryColors[topic.category];
  const cardColor = cardCategoryColors[topic.category];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cat.color} mb-2`}
        >
          {cat.text}
        </span>
        <h1 className="text-3xl font-bold text-slate-900">{topic.title}</h1>
        <p className="mt-2 text-slate-500 text-lg">{topic.description}</p>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Topic sections"
        className="flex gap-1 p-1 rounded-lg bg-slate-100 w-fit"
      >
        {(['theory', 'use-cases'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? `${tabColor}`
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'theory' ? 'Theory' : `Use cases (${topic.useCases.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'theory' ? (
        <div id="panel-theory" role="tabpanel" aria-labelledby="tab-theory" className="space-y-6">
          <TheorySection topic={topic} accentColor={cat.accent} />
          {topic.visualization && (
            <div className="rounded-lg border border-slate-200 p-6">
              <h2 className="text-sm font-medium text-slate-600 mb-4">
                Visualization
              </h2>
              <Visualization type={topic.visualization} />
            </div>
          )}
        </div>
      ) : (
        <div id="panel-use-cases" role="tabpanel" aria-labelledby="tab-use-cases" className="space-y-3">
          <p className="text-sm text-slate-400">
            {topic.useCases.length} TypeScript implementations with complexity analysis
          </p>
          <div className="space-y-2 mt-4">
            {topic.useCases.map((uc, i) => (
              <UseCaseCard
                key={uc.title}
                useCase={uc}
                index={i}
                categoryColor={cardColor}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
