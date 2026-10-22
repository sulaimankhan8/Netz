'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import useIsPro from '@/app/utils/useIsPro';
import { LANGS, LANG_ORDER } from '@/app/utils/codeExport';
import { downloadText } from '@/app/utils/latexExport';
import './export-dialog.css';

const LANG_KEY = 'netz_code_lang';

/**
 * Code and LaTeX export, both NETZ Pro (Pricing: "Clean PDF, SVG, LaTeX and code export").
 * Free accounts see what it does and a link to Pricing; nothing is generated for them.
 *
 *   <ProExportDialog title="Bisection method" getCode={(lang) => ({ code, filename })} getTex={() => ({ tex, filename })} onClose={…} />
 *
 * getCode / getTex may throw an Error whose message is shown to the student (for example
 * "Enter a number for x0 first."). Leave one out to hide its tab.
 */
export default function ProExportDialog({ title, getCode, getTex, initialTab, onClose, note }) {
  const pro = useIsPro();
  const tabs = [getCode && ['code', 'Code'], getTex && ['tex', 'LaTeX']].filter(Boolean);
  const [tab, setTab] = useState(initialTab && tabs.some(([k]) => k === initialTab) ? initialTab : tabs[0]?.[0]);
  const [lang, setLang] = useState('python');
  const [copied, setCopied] = useState('');
  const closeRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (LANGS[saved]) setLang(saved);
    } catch {
      // first choice stays Python
    }
    closeRef.current?.focus();
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && boxRef.current) {
        const all = boxRef.current.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]');
        const first = all[0];
        const last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);

  const pickLang = (next) => {
    setLang(next);
    setCopied('');
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // not remembered this time
    }
  };

  const output = useMemo(() => {
    if (!pro) return null;
    try {
      if (tab === 'code') {
        const { code, filename } = getCode(lang);
        return { text: code, filename, type: 'text/plain' };
      }
      if (tab === 'tex') {
        const { tex, filename } = getTex();
        return { text: tex, filename, type: 'application/x-tex' };
      }
    } catch (err) {
      return { error: err?.message || 'Export did not work. Check the inputs and try again.' };
    }
    return null;
  }, [pro, tab, lang, getCode, getTex]);

  const copy = async () => {
    if (!output?.text) return;
    try {
      await navigator.clipboard.writeText(output.text);
      setCopied('Copied');
    } catch {
      setCopied('Could not copy');
    }
    setTimeout(() => setCopied(''), 1400);
  };

  return (
    <div className="xd-scrim" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="xd" role="dialog" aria-modal="true" aria-labelledby="xd-title" ref={boxRef}>
        <div className="xd-head">
          <div className="xd-head-text">
            <h2 id="xd-title">Export</h2>
            <span>{title}</span>
          </div>
          <span className="xd-pro">Pro</span>
          <button ref={closeRef} type="button" className="xd-icon" aria-label="Close export" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {tabs.length > 1 && (
          <div className="xd-tabs" role="tablist" aria-label="Export type">
            {tabs.map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setCopied(''); }}>{label}</button>
            ))}
          </div>
        )}

        {!pro ? (
          <div className="xd-lock">
            <p className="xd-lock-title">{tab === 'code' ? 'Get this solve as a program' : 'Get this as a LaTeX file'}</p>
            <p>
              {tab === 'code'
                ? 'NETZ Pro writes your inputs into a ready-to-run program in Python, MATLAB, C++, JavaScript, Rust or Go, with the same steps as the page.'
                : 'NETZ Pro turns this into a .tex file with your maths and tables, ready for Overleaf or your report.'}
            </p>
            <a className="xd-btn xd-btn-main" href="/Pricing" target="_blank" rel="noopener">See NETZ Pro</a>
          </div>
        ) : (
          <>
            {tab === 'code' && (
              <div className="xd-langs" role="radiogroup" aria-label="Language">
                {LANG_ORDER.map((k) => (
                  <button key={k} type="button" role="radio" aria-checked={lang === k} onClick={() => pickLang(k)}>{LANGS[k].label}</button>
                ))}
              </div>
            )}
            {output?.error ? (
              <p className="xd-error" role="alert">{output.error}</p>
            ) : (
              <pre className="xd-code" tabIndex={0} aria-label={tab === 'code' ? `${LANGS[lang].label} code` : 'LaTeX file'}><code>{output?.text}</code></pre>
            )}
            {note && <p className="xd-note">{note}</p>}
            <div className="xd-actions">
              <button type="button" className="xd-btn xd-btn-quiet" onClick={copy} disabled={!output?.text}>{copied || 'Copy'}</button>
              <button type="button" className="xd-btn xd-btn-main" onClick={() => output?.text && downloadText(output.text, output.filename, output.type)} disabled={!output?.text}>
                Download {output?.filename ? `.${output.filename.split('.').pop()}` : ''}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
