import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Komponen untuk merender teks dengan format Markdown sederhana (bold, list)
 * dan merender rumus matematika LaTeX (misal $c = \sqrt{a^2 + b^2}$) menjadi simbol visual rapi via KaTeX.
 *
 * @param {{ content: string }} props
 */
export const FormattedMessage = ({ content }) => {
  if (!content) return null;

  // Pisahkan baris per baris
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, lineIndex) => {
        // Render baris kosong sebagai spasi vertikal
        if (!line.trim()) {
          return <div key={lineIndex} className="h-1.5" />;
        }

        // Render bullet list jika diawali dengan * atau -
        const isBullet = /^\s*[\*\-]\s+(.*)/.exec(line);
        const textToProcess = isBullet ? isBullet[1] : line;

        const renderedLine = renderLineWithMathAndBold(textToProcess);

        if (isBullet) {
          return (
            <div key={lineIndex} className="flex items-start space-x-2 pl-1">
              <span className="text-sky-500 font-bold select-none leading-relaxed">•</span>
              <div className="flex-1">{renderedLine}</div>
            </div>
          );
        }

        return <div key={lineIndex}>{renderedLine}</div>;
      })}
    </div>
  );
};

/**
 * Memproses satu baris teks: menangani LaTeX ($...$ atau $$...$$) dan Bold (**...**)
 * @param {string} text
 * @returns {React.ReactNode[]}
 */
const renderLineWithMathAndBold = (text) => {
  if (!text) return null;

  // Regex untuk memisahkan formula matematika LaTeX: $...$ atau $$...$$
  // Format: teks biasa $rumus$ teks biasa
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
            key={index}
            className="inline-block px-1 py-0.5 mx-0.5 font-serif text-sky-900 bg-sky-50/70 rounded border border-sky-200/50"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        // Fallback jika KaTeX gagal merender
        return (
          <code key={index} className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono text-rose-600">
            {part}
          </code>
        );
      }
    }

    // Jika bukan rumus matematika, proses format tebal (**teks**)
    return renderBoldText(part, index);
  });
};

/**
 * Memproses teks dengan format Markdown tebal (**teks**)
 * @param {string} text
 * @param {number|string} keyPrefix
 * @returns {React.ReactNode[]}
 */
const renderBoldText = (text, keyPrefix) => {
  const boldRegex = /(\*\*[^*]+?\*\*)/g;
  const subParts = text.split(boldRegex);

  return subParts.map((sub, i) => {
    if (sub.startsWith('**') && sub.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-bold-${i}`} className="font-semibold text-slate-900">
          {sub.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-plain-${i}`}>{sub}</span>;
  });
};

export default FormattedMessage;

