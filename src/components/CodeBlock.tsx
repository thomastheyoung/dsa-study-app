import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export function CodeBlock({ code, lang = 'typescript' }: CodeBlockProps) {
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    codeToHtml(code.trim(), {
      lang,
      theme: 'catppuccin-mocha',
    }).then((result) => {
      if (!cancelled) setHtml(result);
    });

    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all z-10"
        aria-label="Copy code"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>

      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="shiki bg-[#1e1e2e] rounded-xl p-4 overflow-x-auto text-sm text-slate-400">
          <code>{code.trim()}</code>
        </pre>
      )}
    </div>
  );
}
