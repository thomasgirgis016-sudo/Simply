import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

function renderInlineMarkdown(text: string, keyPrefix: string) {
  // Split by bold **...** and inline code `...`
  const parts = text.split(/(\*\*[^*]+?\*\*|`[^`]+?`)/g);
  return parts.map((part, pIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-bold-${pIdx}`} className="font-semibold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${keyPrefix}-code-${pIdx}`} className="bg-slate-800/80 px-1 py-0.5 rounded font-mono text-amber-300 text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderMarkdownLine(line: string, keyPrefix: string) {
  const trimmed = line.trim();
  if (trimmed === '---' || trimmed === '***') {
    return <hr key={keyPrefix} className="border-slate-800 my-2" />;
  }
  if (line.startsWith('### ')) {
    return (
      <h3 key={keyPrefix} className="font-bold text-base sm:text-lg text-white my-1.5 flex items-center gap-1.5">
        {renderInlineMarkdown(line.slice(4), `${keyPrefix}-h3`)}
      </h3>
    );
  }
  if (line.startsWith('#### ')) {
    return (
      <h4 key={keyPrefix} className="font-semibold text-sm sm:text-base text-slate-100 my-1">
        {renderInlineMarkdown(line.slice(5), `${keyPrefix}-h4`)}
      </h4>
    );
  }
  if (line.startsWith('- ') || line.startsWith('* ')) {
    return (
      <div key={keyPrefix} className="ml-4 list-item list-disc text-slate-300 my-0.5">
        {renderInlineMarkdown(line.slice(2), `${keyPrefix}-li`)}
      </div>
    );
  }
  return (
    <React.Fragment key={keyPrefix}>
      {renderInlineMarkdown(line, `${keyPrefix}-inline`)}
    </React.Fragment>
  );
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split by $$ ... $$ (display math) and $ ... $ (inline math)
  const renderFormattedText = (text: string) => {
    // First, split by block math $$ ... $$
    const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

    return blockParts.map((blockPart, bIdx) => {
      if (blockPart.startsWith('$$') && blockPart.endsWith('$$')) {
        const math = blockPart.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <div
              key={`block-${bIdx}`}
              className="my-2 overflow-x-auto py-1 text-center max-w-full scrollbar-thin scrollbar-thumb-slate-700 text-[13px] sm:text-base [word-break:break-word]"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <div key={`block-${bIdx}`} className="font-mono text-xs sm:text-sm text-amber-400 overflow-x-auto">{blockPart}</div>;
        }
      }

      // Then split by inline math $ ... $
      const inlineParts = blockPart.split(/(\$[^$\n]+?\$)/g);
      return (
        <span key={`inline-block-${bIdx}`}>
          {inlineParts.map((inlinePart, iIdx) => {
            if (inlinePart.startsWith('$') && inlinePart.endsWith('$')) {
              const math = inlinePart.slice(1, -1).trim();
              try {
                const html = katex.renderToString(math, {
                  displayMode: false,
                  throwOnError: false,
                });
                return (
                  <span
                    key={`inline-${bIdx}-${iIdx}`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              } catch {
                return <span key={`inline-${bIdx}-${iIdx}`} className="font-mono text-amber-300">{inlinePart}</span>;
              }
            }

            // Normal text with markdown parsing & line breaks preserved
            const lines = inlinePart.split('\n');
            return lines.map((line, lIdx) => (
              <React.Fragment key={`text-${bIdx}-${iIdx}-${lIdx}`}>
                {renderMarkdownLine(line, `md-${bIdx}-${iIdx}-${lIdx}`)}
                {lIdx < lines.length - 1 && !line.startsWith('### ') && !line.startsWith('#### ') && line.trim() !== '---' && <br />}
              </React.Fragment>
            ));
          })}
        </span>
      );
    });
  };

  return <div className={`leading-relaxed ${className}`}>{renderFormattedText(content)}</div>;
};
