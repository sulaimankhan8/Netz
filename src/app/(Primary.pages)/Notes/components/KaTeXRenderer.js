'use client';

import { useEffect, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function KaTeXRenderer({ math, blockMode = false }) {
  const [html, setHtml] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (!math || !math.trim()) {
        setHtml('');
        setError(null);
        return;
      }
      const rendered = katex.renderToString(math, {
        displayMode: blockMode,
        throwOnError: false
      });
      setHtml(rendered);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [math, blockMode]);

  if (error) {
    return <span className="text-red-400 font-mono text-xs">LaTeX Error: {error}</span>;
  }

  return (
    <span
      className="katex-rendered-output text-neutral-900 dark:text-slate-100"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
