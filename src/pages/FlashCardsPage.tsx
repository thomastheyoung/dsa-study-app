import { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, ChevronRight, Trophy } from 'lucide-react';
import { flashCards } from '../content/flash-cards';
import type { FlashCard } from '../content/types';

type Category = FlashCard['category'];

const categories: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'big-o', label: 'Big O' },
  { value: 'data-structures', label: 'Data structures' },
  { value: 'algorithms', label: 'Algorithms' },
  { value: 'techniques', label: 'Techniques' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FlashCardsPage() {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [categoryScores, setCategoryScores] = useState<Record<Category, { correct: number; total: number }>>({
    'big-o': { correct: 0, total: 0 },
    'data-structures': { correct: 0, total: 0 },
    algorithms: { correct: 0, total: 0 },
    techniques: { correct: 0, total: 0 },
  });

  const filtered = useMemo(
    () => (filter === 'all' ? flashCards : flashCards.filter((c) => c.category === filter)),
    [filter],
  );

  const reset = useCallback(
    (newFilter?: Category | 'all') => {
      const source = newFilter !== undefined ? newFilter : filter;
      const pool = source === 'all' ? flashCards : flashCards.filter((c) => c.category === source);
      setCards(shuffle(pool));
      setIndex(0);
      setSelected(null);
      setScore(0);
      setAnswered(0);
      setCategoryScores({
        'big-o': { correct: 0, total: 0 },
        'data-structures': { correct: 0, total: 0 },
        algorithms: { correct: 0, total: 0 },
        techniques: { correct: 0, total: 0 },
      });
    },
    [filter],
  );

  useEffect(() => {
    reset('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (cat: Category | 'all') => {
    setFilter(cat);
    reset(cat);
  };

  const card = cards[index] as FlashCard | undefined;
  const done = index >= cards.length && cards.length > 0;

  const handleSelect = useCallback(
    (choiceIndex: number) => {
      if (selected !== null || !card) return;
      setSelected(choiceIndex);
      setAnswered((a) => a + 1);
      const isCorrect = choiceIndex === card.answer;
      if (isCorrect) setScore((s) => s + 1);
      setCategoryScores((prev) => ({
        ...prev,
        [card.category]: {
          correct: prev[card.category].correct + (isCorrect ? 1 : 0),
          total: prev[card.category].total + 1,
        },
      }));
    },
    [selected, card],
  );

  const handleNext = useCallback(() => {
    if (selected === null) return;
    setIndex((i) => i + 1);
    setSelected(null);
  }, [selected]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (!done && card) {
        if (selected === null) {
          const num = parseInt(e.key);
          if (num >= 1 && num <= 4) {
            e.preventDefault();
            handleSelect(num - 1);
          }
        } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        }
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, card, selected, handleSelect, handleNext]);

  if (done) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-quiz-dim">
            <Trophy size={32} className="text-quiz" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Quiz complete</h1>
          <p className="text-xl text-slate-500">
            You scored <span className="font-semibold text-slate-800">{score}</span> out of{' '}
            <span className="font-semibold text-slate-800">{answered}</span>
            {' '}({answered > 0 ? Math.round((score / answered) * 100) : 0}%)
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-slate-700">Breakdown by category</h2>
          {categories
            .filter((c) => c.value !== 'all')
            .map((cat) => {
              const s = categoryScores[cat.value as Category];
              if (s.total === 0) return null;
              const pct = Math.round((s.correct / s.total) * 100);
              return (
                <div key={cat.value} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{cat.label}</span>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-32 h-2 rounded-full bg-slate-100 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={s.correct}
                      aria-valuemin={0}
                      aria-valuemax={s.total}
                      aria-label={`${cat.label} score`}
                    >
                      <div
                        className="h-full rounded-full bg-quiz transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-slate-500 w-20 text-right">
                      {s.correct}/{s.total} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-quiz text-white font-medium hover:opacity-90 transition-opacity"
          >
            <RotateCcw size={16} />
            Restart quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Flash cards</h1>
          <p className="text-sm text-slate-400 mt-1">
            {filtered.length} questions · Test your DSA knowledge
          </p>
        </div>
        {answered > 0 && (
          <div className="text-sm text-slate-500">
            Score: <span className="font-semibold text-slate-700">{score}/{answered}</span>
            {' '}({Math.round((score / answered) * 100)}%)
          </div>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleFilter(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === cat.value
                ? 'bg-quiz text-white'
                : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Card {Math.min(index + 1, cards.length)} of {cards.length}</span>
          <span>{Math.round(((index) / cards.length) * 100)}% complete</span>
        </div>
        <div
          className="h-1.5 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={cards.length}
          aria-label="Quiz progress"
        >
          <div
            className="h-full rounded-full bg-quiz transition-all duration-300"
            style={{ width: `${(index / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      {card && (
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg font-medium text-slate-800 leading-relaxed">{card.question}</p>
            <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-quiz-dim text-quiz font-medium">
              {categories.find((c) => c.value === card.category)?.label}
            </span>
          </div>

          {/* Choices */}
          <div className="space-y-2.5">
            {card.choices.map((choice, i) => {
              let style = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700';

              if (selected !== null) {
                if (i === card.answer) {
                  style = 'border-green-300 bg-green-50 text-green-800';
                } else if (i === selected && selected !== card.answer) {
                  style = 'border-red-300 bg-red-50 text-red-800';
                } else {
                  style = 'border-slate-100 text-slate-400';
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${style} ${
                    selected === null ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                      {i + 1}
                    </span>
                    {choice}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {selected !== null && (
            <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600 leading-relaxed">
              {card.explanation}
            </div>
          )}

          {/* Next button */}
          {selected !== null && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-quiz text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {index < cards.length - 1 ? 'Next' : 'See results'}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Keyboard hint */}
      <p className="text-xs text-slate-300 text-center">
        Keyboard: 1-4 to answer · Enter or → for next
      </p>
    </div>
  );
}
