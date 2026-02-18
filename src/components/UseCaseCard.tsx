import { useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { formatInline } from './TheorySection';
import type { UseCase } from '../content';

interface UseCaseCardProps {
  useCase: UseCase;
  index: number;
  categoryColor: string;
}

export function UseCaseCard({ useCase, index, categoryColor }: UseCaseCardProps) {
  const [expanded, setExpanded] = useState(index === 0);
  const panelId = `usecase-panel-${index}`;
  const buttonId = `usecase-btn-${index}`;

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden transition-colors hover:border-slate-300">
      <h3>
        <button
          id={buttonId}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
        >
          <span
            className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${categoryColor} shrink-0`}
          >
            {index + 1}
          </span>
          <span className="flex-1 min-w-0">
            <span className="text-sm font-medium text-slate-700">
              {useCase.title}
            </span>
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
              <Clock size={12} />
              <span dangerouslySetInnerHTML={{ __html: formatInline(useCase.complexity) }} />
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </span>
        </button>
      </h3>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="border-t border-slate-200 px-4 py-4 space-y-3"
        >
          <p className="text-sm text-slate-500">{useCase.description}</p>
          <div className="flex items-center gap-1 sm:hidden text-xs text-slate-400">
            <Clock size={12} />
            <span dangerouslySetInnerHTML={{ __html: formatInline(useCase.complexity) }} />
          </div>
          <CodeBlock code={useCase.code} />
        </div>
      )}
    </div>
  );
}
