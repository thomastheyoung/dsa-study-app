import { Link } from 'react-router-dom';
import { BookOpen, Code, Lightbulb, ArrowRight, TrendingUp, Zap } from 'lucide-react';
import { topicsByCategory } from '../content';

const categoryStyles = {
  'data-structures': {
    icon: BookOpen,
    gradient: 'from-ds/10 to-ds/3',
    border: 'border-ds/15 hover:border-ds/30',
    text: 'text-ds',
    dot: 'bg-ds',
    badge: 'bg-ds-dim text-ds',
  },
  algorithms: {
    icon: Code,
    gradient: 'from-algo/10 to-algo/3',
    border: 'border-algo/15 hover:border-algo/30',
    text: 'text-algo',
    dot: 'bg-algo',
    badge: 'bg-algo-dim text-algo',
  },
  techniques: {
    icon: Lightbulb,
    gradient: 'from-tech/10 to-tech/3',
    border: 'border-tech/15 hover:border-tech/30',
    text: 'text-tech',
    dot: 'bg-tech',
    badge: 'bg-tech-dim text-tech',
  },
} as const;

export function Home() {
  const totalTopics = topicsByCategory.reduce((sum, g) => sum + g.topics.length, 0);
  const totalUseCases = topicsByCategory.reduce(
    (sum, g) => sum + g.topics.reduce((s, t) => s + t.useCases.length, 0),
    0
  );

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          DSA study guide
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          Pragmatic data structures & algorithms review for fullstack engineers.
          Clear theory, visual diagrams, and real-world TypeScript implementations.
        </p>
        <div className="flex gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} />
            {totalTopics} topics
          </span>
          <span className="flex items-center gap-1.5">
            <Code size={14} />
            {totalUseCases}+ use cases
          </span>
        </div>
      </div>

      {/* Big O card */}
      <Link
        to="/big-o"
        className="group relative block rounded-xl border border-amber-200/50 hover:border-amber-300/60 p-5 bg-gradient-to-br from-amber-50 to-orange-50/30 transition-all hover:translate-y-[-1px] hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-amber-100/60">
              <TrendingUp size={18} className="text-amber-600" />
            </div>
            <div className="space-y-1">
              <h2 className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                Big O notation
              </h2>
              <p className="text-sm text-slate-400">
                The foundational framework for analyzing algorithm efficiency.
                Start here to understand how time and space complexity work.
              </p>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1"
          />
        </div>
      </Link>

      {/* Flash cards card */}
      <Link
        to="/flash-cards"
        className="group relative block rounded-xl border border-teal-200/50 hover:border-teal-300/60 p-5 bg-gradient-to-br from-teal-50 to-cyan-50/30 transition-all hover:translate-y-[-1px] hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-teal-100/60">
              <Zap size={18} className="text-teal-600" />
            </div>
            <div className="space-y-1">
              <h2 className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                Flash cards
              </h2>
              <p className="text-sm text-slate-400">
                100 multiple-choice questions covering real-world fullstack
                engineering scenarios. Test your active recall.
              </p>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1"
          />
        </div>
      </Link>

      {/* Category sections */}
      {topicsByCategory.map((group) => {
        const styles = categoryStyles[group.category];
        const Icon = styles.icon;

        return (
          <section key={group.category} className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon size={18} className={styles.text} />
              <h2 className="text-xl font-semibold text-slate-900">
                {group.label}
              </h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
                {group.topics.length}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {group.topics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/topic/${topic.id}`}
                  className={`group relative rounded-xl border p-4 bg-gradient-to-br ${styles.gradient} ${styles.border} transition-all hover:translate-y-[-1px] hover:shadow-md`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {topic.description}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    <span>{topic.useCases.length} use cases</span>
                    {topic.complexity && (
                      <span className="font-mono">
                        {Object.values(topic.complexity)[0]}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
