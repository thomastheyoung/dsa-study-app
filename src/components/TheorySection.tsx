import type { Topic } from '../content';
import { CodeBlock } from './CodeBlock';

interface TheorySectionProps {
  topic: Topic;
  accentColor?: string;
}

export function TheorySection({ topic, accentColor }: TheorySectionProps) {
  return (
    <div className="space-y-6">
      {/* Invariant callout */}
      {topic.invariant && (
        <aside role="note" className="rounded-lg border border-tech/20 bg-tech-dim px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-tech">
            Invariant
          </span>
          <p
            className="mt-1 text-sm text-slate-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatInline(topic.invariant) }}
          />
        </aside>
      )}

      {/* Complexity table */}
      {topic.complexity && (
        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <h2 className="bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
            Time complexity
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200">
            {Object.entries(topic.complexity).map(([op, value]) => (
              <div key={op} className="bg-white px-4 py-3 text-center">
                <dt className="text-xs text-slate-400 uppercase tracking-wide">{op}</dt>
                <dd
                  className="mt-1 text-sm text-slate-700"
                  dangerouslySetInnerHTML={{ __html: formatInline(value) }}
                />
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Theory content */}
      <div className="prose-custom space-y-4">
        {parseTheoryBlocks(topic.theory).map((block, i) => (
          <TheoryBlock key={i} block={block} accentColor={accentColor} />
        ))}
      </div>

      {/* Key points */}
      <div className="rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-medium text-slate-600 mb-3">
          Key points
        </h2>
        <ul role="list" className="space-y-2">
          {topic.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-emerald-600 shrink-0 mt-0.5">✓</span>
              <span
                className="text-slate-500"
                dangerouslySetInnerHTML={{ __html: formatInline(point) }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Parsing ---

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading-list'; heading: string; items: string[]; ordered: boolean }
  | { type: 'heading-table'; heading: string; tableText: string }
  | { type: 'heading-code'; heading: string; code: string }
  | { type: 'table'; text: string }
  | { type: 'code'; code: string }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'unordered-list'; items: string[] };

function splitPreservingCodeFences(text: string): string[] {
  const blocks: string[] = [];
  let current = '';
  let inCode = false;

  for (const line of text.split('\n')) {
    if (line.startsWith('```')) inCode = !inCode;

    if (!inCode && current.length > 0 && line === '') {
      blocks.push(current);
      current = '';
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

export function parseTheoryBlocks(theory: string): Block[] {
  return splitPreservingCodeFences(theory).map((raw): Block => {
    // Standalone table
    if (raw.startsWith('|')) {
      return { type: 'table', text: raw };
    }

    // Standalone fenced code block
    if (raw.startsWith('```')) {
      const code = raw.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
      return { type: 'code', code };
    }

    // Standalone ordered list (starts with "1.")
    if (/^\d+\.\s/.test(raw)) {
      const items = raw.split(/\n(?=\d+\.\s)/).map((l) => l.replace(/^\d+\.\s/, ''));
      return { type: 'ordered-list', items };
    }

    // Standalone unordered list (starts with "- ")
    if (raw.startsWith('- ')) {
      const items = raw.split('\n').map((l) => l.replace(/^- /, ''));
      return { type: 'unordered-list', items };
    }

    // Heading followed by content
    if (raw.startsWith('**')) {
      // Heading + fenced code block
      if (raw.includes('\n```')) {
        const newlineIdx = raw.indexOf('\n');
        const heading = raw.slice(0, newlineIdx);
        const rest = raw.slice(newlineIdx + 1);
        const code = rest.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
        return { type: 'heading-code', heading, code };
      }

      // Heading + table
      if (raw.includes('\n|')) {
        const [heading, ...tableLines] = raw.split('\n');
        return { type: 'heading-table', heading, tableText: tableLines.join('\n') };
      }

      // Heading + ordered list
      if (/\n\d+\.\s/.test(raw)) {
        const [heading, ...rest] = raw.split('\n');
        const items = rest
          .join('\n')
          .split(/\n(?=\d+\.\s)/)
          .map((l) => l.replace(/^\d+\.\s/, ''));
        return { type: 'heading-list', heading, items, ordered: true };
      }

      // Heading + unordered list
      if (raw.includes('\n-')) {
        const [heading, ...items] = raw.split('\n');
        return {
          type: 'heading-list',
          heading,
          items: items.map((item) => item.replace(/^- /, '')),
          ordered: false,
        };
      }
    }

    return { type: 'paragraph', text: raw };
  });
}

// --- Rendering ---

export function TheoryBlock({
  block,
  accentColor,
  headingLevel = 2,
}: {
  block: Block;
  accentColor?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  const hClass = 'section-heading text-xl font-semibold text-slate-800';
  const hStyle = accentColor
    ? ({ '--heading-accent': accentColor } as React.CSSProperties)
    : undefined;

  switch (block.type) {
    case 'table':
      return <TheoryTable text={block.text} />;

    case 'code':
      return (
        <CodeBlock code={block.code} />
      );

    case 'ordered-list':
      return (
        <ol role="list" className="space-y-1 list-none">
          {block.items.map((item, j) => (
            <li key={j} className="text-slate-500 text-sm flex gap-2">
              <span className="text-slate-400 select-none shrink-0">{j + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ol>
      );

    case 'unordered-list':
      return (
        <ul role="list" className="space-y-1 list-none">
          {block.items.map((item, j) => (
            <li key={j} className="text-slate-500 text-sm flex gap-2">
              <span className="text-slate-300 select-none shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );

    case 'heading-table':
      return (
        <div>
          <Heading
            className={hClass}
            style={hStyle}
            dangerouslySetInnerHTML={{ __html: formatInline(block.heading) }}
          />
          <TheoryTable text={block.tableText} />
        </div>
      );

    case 'heading-code':
      return (
        <div>
          <Heading
            className={`${hClass} mb-2`}
            style={hStyle}
            dangerouslySetInnerHTML={{ __html: formatInline(block.heading) }}
          />
          <CodeBlock code={block.code} />
        </div>
      );

    case 'heading-list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <div>
          <Heading
            className={hClass}
            style={hStyle}
            dangerouslySetInnerHTML={{ __html: formatInline(block.heading) }}
          />
          <ListTag role="list" className="mt-1 space-y-1 list-none">
            {block.items.map((item, j) => (
              <li key={j} className="text-slate-500 text-sm flex gap-2">
                <span className="text-slate-300 select-none shrink-0">
                  {block.ordered ? `${j + 1}.` : '•'}
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              </li>
            ))}
          </ListTag>
        </div>
      );
    }

    case 'paragraph': {
      const isHeading = /^\*\*[^*]+\*\*$/.test(block.text.trim());
      if (isHeading) {
        return (
          <Heading
            className={hClass}
            style={hStyle}
            dangerouslySetInnerHTML={{ __html: formatInline(block.text) }}
          />
        );
      }
      return (
        <p
          className="text-slate-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatInline(block.text) }}
        />
      );
    }
  }
}

export function formatInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-sm font-mono">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-700 font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/(?<!<[^>]*)(?<!["\w])O\(([^)]+)\)/g, '<span class="bigo">O($1)</span>');
}

function TheoryTable({ text }: { text: string }) {
  const rows = text
    .trim()
    .split('\n')
    .filter((r) => !r.match(/^\|[-|]+\|$/));
  const header = rows[0]
    .split('|')
    .filter(Boolean)
    .map((c) => c.trim());
  const body = rows.slice(1).map((row) =>
    row
      .split('|')
      .filter(Boolean)
      .map((c) => c.trim())
  );

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            {header.map((h, i) => (
              <th
                key={i}
                className="px-4 py-2 text-left font-medium text-slate-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-2 text-slate-500"
                  dangerouslySetInnerHTML={{ __html: formatInline(cell) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
