import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
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
              className="my-3 overflow-x-auto py-1 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <div key={`block-${bIdx}`} className="font-mono text-amber-400">{blockPart}</div>;
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

            // Normal text with line breaks preserved
            return inlinePart.split('\n').map((line, lIdx, arr) => (
              <React.Fragment key={`text-${bIdx}-${iIdx}-${lIdx}`}>
                {line}
                {lIdx < arr.length - 1 && <br />}
              </React.Fragment>
            ));
          })}
        </span>
      );
    });
  };

  return <div className={`leading-relaxed ${className}`}>{renderFormattedText(content)}</div>;
};
