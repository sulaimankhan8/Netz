'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FiDownload, FiChevronDown, FiZap, FiImage, FiFileText, FiSliders, FiCode, FiHash } from 'react-icons/fi';
import EditorialButton from './EditorialButton';
import EditorialExportModal from './EditorialExportModal';
import { exportAsPNG, exportAsSVG, exportAsPDF } from '@/app/utils/exportEngine';
import { EXPORT_INPUTS_EVENT, currentExportInputs } from '@/app/utils/codeExport/inputs';
import { solverInputsToTex, solverPanelToTex, slugFile } from '@/app/utils/latexExport';

const ProExportDialog = dynamic(() => import('../export/ProExportDialog'), { ssr: false });

/**
 * The calculator this button sits in: the largest box around it that is still below the page title,
 * so the LaTeX file has the calculator's tables and not the worked example's.
 */
function calculatorRoot(el) {
  let node = el;
  while (node?.parentElement && !node.parentElement.querySelector('h1') && node.parentElement !== document.body) node = node.parentElement;
  return node;
}

/** Code and LaTeX export (NETZ Pro) for the solver this button sits in. */
function SolverExportDialog({ anchor, tab, onClose }) {
  const [inputs, setInputs] = useState(() => currentExportInputs());
  const [codeLib, setCodeLib] = useState(null);

  useEffect(() => {
    const on = (e) => setInputs(e.detail);
    window.addEventListener(EXPORT_INPUTS_EVENT, on);
    let live = true;
    import('@/app/utils/codeExport').then((m) => live && setCodeLib(m));
    return () => {
      live = false;
      window.removeEventListener(EXPORT_INPUTS_EVENT, on);
    };
  }, []);

  const title = (codeLib && inputs?.method && codeLib.METHOD_NAMES[inputs.method]) || 'Solver';
  const getCode = useCallback((lang) => {
    if (!codeLib) throw new Error('Getting code export ready…');
    if (!inputs?.method) throw new Error('Enter your numbers in the calculator first.');
    return codeLib.generateCode(inputs.method, inputs.raw, lang);
  }, [codeLib, inputs]);
  const getTex = useCallback(() => ({
    tex: solverPanelToTex({ title, inputs: solverInputsToTex(inputs?.raw), root: calculatorRoot(anchor) }),
    filename: `netz-${slugFile(title)}.tex`,
  }), [title, inputs, anchor]);

  return (
    <ProExportDialog
      title={title}
      initialTab={tab}
      getCode={getCode}
      getTex={getTex}
      onClose={onClose}
      note="The code uses the numbers now in the calculator. The LaTeX file has your inputs and this calculator's tables."
    />
  );
}

export default function EditorialExportButton({
  targetId,
  elementId,
  fileName = 'report',
  title,
  exportData,
  label = 'Export',
  variant = 'secondary',
  size = 'sm',
  availableSections = [],
  data = null,
  tooltipText = 'Export section or calculation sheet',
  className = ''
}) {
  const activeTargetId = targetId || elementId;
  const activeFileName = fileName !== 'report' ? fileName : (title ? title.toLowerCase().replace(/\s+/g, '_') : 'report');
  const activeData = data || exportData;

  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // The menu opens to the right of the button when there is no room for it on the left (phones)
  const [menuLeft, setMenuLeft] = useState(false);
  const [quickExporting, setQuickExporting] = useState(false);
  const [proTab, setProTab] = useState(null);
  const wrapRef = useRef(null);

  const handleQuickExport = async (format) => {
    setDropdownOpen(false);
    setQuickExporting(true);
    try {
      if (format === 'svg') {
        await exportAsSVG(activeTargetId, { fileName: `${activeFileName}.svg` });
      } else if (format === 'pdf') {
        await exportAsPDF(activeTargetId, { fileName: `${activeFileName}.pdf` });
      } else {
        await exportAsPNG(activeTargetId, { fileName: `${activeFileName}.png`, pixelRatio: 2 });
      }
    } catch (e) {
      console.error(e);
      // Fallback to opening modal if quick export fails
      setModalOpen(true);
    } finally {
      setQuickExporting(false);
    }
  };

  return (
    <>
      {/* items-stretch: both halves keep the same height when touch screens make buttons taller */}
      <div className="relative inline-flex items-stretch" ref={wrapRef}>
        {/* Main Export Button - Opens Modal by default */}
        <EditorialButton
          onClick={() => setModalOpen(true)}
          variant={variant}
          size={size}
          disabled={quickExporting}
          tooltipText={tooltipText}
          icon={quickExporting ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <FiDownload className="w-3.5 h-3.5" />}
          className={`rounded-r-none border-r-0 whitespace-nowrap ${className}`}
        >
          {quickExporting ? 'Exporting...' : label}
        </EditorialButton>

        {/* Dropdown Quick Options Trigger */}
        <button
          type="button"
          onClick={() => {
            const r = wrapRef.current?.getBoundingClientRect();
            setMenuLeft(Boolean(r && r.right < 216));
            setDropdownOpen(!dropdownOpen);
          }}
          className="flex items-center px-2 py-1.5 border border-neutral-300 dark:border-neutral-600 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-r-lg transition-colors focus:outline-none"
          title="Quick Export Options"
        >
          <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Quick Dropdown Menu */}
        {dropdownOpen && (
          <div 
            className={`absolute ${menuLeft ? 'left-0' : 'right-0'} top-full mt-1.5 w-52 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-xl z-50 py-1 font-mono text-xs animate-fadeIn`}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase border-b border-neutral-200 dark:border-neutral-800">
              Quick Export
            </div>

            <button
              type="button"
              onClick={() => handleQuickExport('png')}
              className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FiImage className="text-emerald-500" /> Free PNG (2x HD)
              </span>
              <span className="text-[9px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-500">FREE</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickExport('svg')}
              className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FiZap className="text-amber-500" /> Vector SVG
              </span>
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">PRO</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickExport('pdf')}
              className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FiFileText className="text-blue-500" /> PDF Document
              </span>
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">PRO</span>
            </button>

            <button
              type="button"
              onClick={() => { setDropdownOpen(false); setProTab('code'); }}
              className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FiCode className="text-violet-500" /> Code (Python, C++…)
              </span>
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">PRO</span>
            </button>

            <button
              type="button"
              onClick={() => { setDropdownOpen(false); setProTab('tex'); }}
              className="w-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FiHash className="text-teal-500" /> LaTeX (.tex)
              </span>
              <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold">PRO</span>
            </button>

            <div className="border-t border-neutral-200 dark:border-neutral-800 my-1" />

            <button
              type="button"
              onClick={() => { setDropdownOpen(false); setModalOpen(true); }}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold transition-colors"
            >
              <FiSliders /> Customize Settings...
            </button>
          </div>
        )}
      </div>

      {proTab && <SolverExportDialog anchor={wrapRef.current} tab={proTab} onClose={() => setProTab(null)} />}

      {/* Export Configuration Modal */}
      <EditorialExportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTargetId={activeTargetId}
        availableSections={availableSections}
        data={activeData}
        baseFileName={activeFileName}
      />
    </>
  );
}
