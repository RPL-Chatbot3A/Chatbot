import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Komponen untuk merender teks dengan format Markdown (bold, heading, bullet/numbered list, inline code)
 * dan merender rumus matematika LaTeX (misal $c = \sqrt{a^2 + b^2}$) menjadi simbol visual rapi via KaTeX.
 *
 * Seluruh elemen memiliki warna teks dinamis yang kontras baik di Light Mode maupun Dark Mode.
 *
 * @param {{ content: string, theme?: string }} props
 */
export const FormattedMessage = ({ content, theme = 'dark' }) => {
  if (!content) return null;

  // Pisahkan baris per baris
  const lines = String(content).split('\n');

  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-slate-800 dark:text-zinc-200">
      {lines.map((line, lineIndex) => {
        const trimmed = line.trim();

        // Render baris kosong sebagai spasi vertikal
        if (!trimmed) {
          return <div key={lineIndex} className="h-1.5" />;
        }

        // Render Heading 3: ### Judul
        if (line.startsWith('### ')) {
          const headingText = line.slice(4).trim();
          return (
            <h4
              key={lineIndex}
              className="font-bold text-sm sm:text-base mt-2 mb-1 text-slate-950 dark:text-white"
            >
              {renderLineWithMathAndBold(headingText, lineIndex)}
            </h4>
          );
        }

        // Render Heading 2: ## Judul
        if (line.startsWith('## ')) {
          const headingText = line.slice(3).trim();
          return (
            <h3
              key={lineIndex}
              className="font-bold text-base sm:text-lg mt-2.5 mb-1 text-slate-950 dark:text-white"
            >
              {renderLineWithMathAndBold(headingText, lineIndex)}
            </h3>
          );
        }

        // Render Bullet list jika diawali dengan • atau * atau -
        const bulletMatch = /^\s*([•\*\-])\s+(.*)/.exec(line);
        if (bulletMatch) {
          const textToProcess = bulletMatch[2];
          return (
            <div key={lineIndex} className="flex items-start space-x-2 pl-1.5 py-0.5">
              <span className="text-sky-500 font-bold select-none leading-relaxed shrink-0">
                •
              </span>
              <div className="flex-1 text-slate-800 dark:text-zinc-200">
                {renderLineWithMathAndBold(textToProcess, lineIndex)}
              </div>
            </div>
          );
        }

        // Render Numbered list jika diawali angka: 1. atau 2.
        const numberMatch = /^\s*(\d+[\.\)])\s+(.*)/.exec(line);
        if (numberMatch) {
          const numLabel = numberMatch[1];
          const textToProcess = numberMatch[2];
          return (
            <div key={lineIndex} className="flex items-start space-x-2 pl-1.5 py-0.5">
              <span className="text-sky-500 font-semibold select-none leading-relaxed shrink-0 min-w-[18px]">
                {numLabel}
              </span>
              <div className="flex-1 text-slate-800 dark:text-zinc-200">
                {renderLineWithMathAndBold(textToProcess, lineIndex)}
              </div>
            </div>
          );
        }

        // Baris paragraf normal
        return (
          <div key={lineIndex} className="text-slate-800 dark:text-zinc-200">
            {renderLineWithMathAndBold(line, lineIndex)}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Memproses satu baris teks: menangani LaTeX ($...$ atau $$...$$), Inline Code (`code`), dan Bold (**...**)
 * @param {string} text
 * @param {number|string} lineIndex
 * @returns {React.ReactNode[]}
 */
const renderLineWithMathAndBold = (text, lineIndex) => {
  if (!text) return null;

  // Regex untuk memisahkan formula matematika LaTeX: $...$ atau $$...$$
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g;
  const parts = text.split(mathRegex);

  return parts.map((part, index) => {
    // Jika bagian ini adalah rumus matematika LaTeX ($...$)
    if (part.startsWith('$') && part.endsWith('$')) {
      const isDisplayMode = part.startsWith('$$') && part.endsWith('$$');
      const mathCode = isDisplayMode
        ? part.slice(2, -2).trim()
        : part.slice(1, -1).trim();

      try {
        const html = katex.renderToString(mathCode, {
          displayMode: isDisplayMode,
          throwOnError: false,
        });

        return (
          <span
            key={`${lineIndex}-math-${index}`}
            className="inline-block px-1 py-0.5 mx-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        return (
          <code
            key={`${lineIndex}-math-err-${index}`}
            className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-rose-600 dark:text-rose-400"
          >
            {part}
          </code>
        );
      }
    }

    // Jika bukan rumus matematika, proses format inline code & format tebal (**teks**)
    return renderInlineCodeAndBold(part, `${lineIndex}-${index}`);
  });
};

/**
 * Memproses format Inline Code (`kode`) dan Bold (**teks**)
 * @param {string} text
 * @param {string} keyPrefix
 * @returns {React.ReactNode[]}
 */
const renderInlineCodeAndBold = (text, keyPrefix) => {
  // Pisahkan inline code terlebih dahulu: `code`
  const codeRegex = /(`[^`]+?`)/g;
  const codeParts = text.split(codeRegex);

  return codeParts.map((segment, cIdx) => {
    if (segment.startsWith('`') && segment.endsWith('`') && segment.length >= 2) {
      return (
        <code
          key={`${keyPrefix}-code-${cIdx}`}
          className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 mx-0.5"
        >
          {segment.slice(1, -1)}
        </code>
      );
    }

    // Format Bold (**teks**)
    const boldRegex = /(\*\*[^*]+?\*\*)/g;
    const subParts = segment.split(boldRegex);

    return subParts.map((sub, bIdx) => {
      if (sub.startsWith('**') && sub.endsWith('**')) {
        return (
          <strong
            key={`${keyPrefix}-bold-${cIdx}-${bIdx}`}
            className="font-bold text-slate-950 dark:text-white"
          >
            {sub.slice(2, -2)}
          </strong>
        );
      }
      return <span key={`${keyPrefix}-text-${cIdx}-${bIdx}`}>{sub}</span>;
    });
  });
};

export default FormattedMessage;
