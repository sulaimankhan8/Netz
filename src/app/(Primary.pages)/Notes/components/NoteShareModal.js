'use client';

import { useState } from 'react';
import { 
  FaTimes, 
  FaShareAlt, 
  FaKey, 
  FaCopy, 
  FaCheck, 
  FaGlobe, 
  FaLock, 
  FaFileImport,
  FaSearch,
  FaDownload,
  FaUserGraduate,
  FaBookOpen,
  FaLayerGroup
} from 'react-icons/fa';

export const CURATED_COMMUNITY_NOTES = [
  {
    id: 'community-unit1-roots',
    title: 'Unit 1: Root Finding & Convergence Master Guide',
    subtitle: 'Derivations, comparative analysis and error bounds for Bisection, Secant, and Newton-Raphson',
    author: 'Prof. Reynolds (MIT Applied Math)',
    unit: 'Unit 1',
    tags: ['Unit 1', 'Roots', 'ExamPrep'],
    accessKey: 'NETZ-ROOTS1',
    blocks: [
      { id: 'c1-1', type: 'heading1', content: 'Comparative Analysis of Root Finding Methods' },
      { id: 'c1-2', type: 'paragraph', content: 'In Unit 1, solving f(x) = 0 relies on balancing reliability (bracketing methods) versus convergence speed (open methods).' },
      { id: 'c1-3', type: 'math', content: 'x_{n+1} = x_n - \\frac{f(x_n)(x_n - x_{n-1})}{f(x_n) - f(x_{n-1})}' },
      { id: 'c1-4', type: 'callout', content: '💡 Secant vs Newton: Secant avoids computing analytical derivatives, while converging at superlinear order ~1.618.' },
      {
        id: 'c1-5',
        type: 'quiz',
        content: 'Root Finding Quiz',
        quizConfig: {
          question: 'Which method is guaranteed to bracket a root if f(a) * f(b) < 0 on a continuous function?',
          mode: 'mcq',
          options: ['Newton-Raphson Method', 'Bisection Method', 'Secant Method', 'Fixed Point Iteration'],
          correctOptionIndex: 1,
          explanation: 'Bisection method operates under the Bolzano Intermediate Value Theorem on bracketed intervals [a, b].'
        }
      },
      {
        id: 'c1-6',
        type: 'widget',
        content: 'Secant Method Solver',
        widgetConfig: { algorithmId: 'secant-method', params: { expression: 'x^3 - 4*x - 9', x0: 2, x1: 3, tolerance: 0.0001 } }
      }
    ]
  },
  {
    id: 'community-unit2-interp',
    title: 'Unit 2: Forward, Backward & Lagrange Interpolation Handbook',
    subtitle: 'Equal interval difference tables vs unequal interval Lagrange polynomial weights',
    author: 'Dr. A. Verma (IIT Bombay)',
    unit: 'Unit 2',
    tags: ['Unit 2', 'Interpolation', 'Lagrange'],
    accessKey: 'NETZ-INTERP2',
    blocks: [
      { id: 'c2-1', type: 'heading1', content: 'Polynomial Interpolation Principles' },
      { id: 'c2-2', type: 'paragraph', content: 'For equal spacing h = x_{i+1} - x_i, Newton Forward or Backward is preferred. For arbitrary unequal spacing, Lagrange or Divided Differences must be used.' },
      { id: 'c2-3', type: 'math', content: 'L_i(x) = \\prod_{j \\neq i} \\frac{x - x_j}{x_i - x_j}' },
      {
        id: 'c2-4',
        type: 'quiz',
        content: 'Interpolation Check',
        quizConfig: {
          question: 'When should Newton Backward Interpolation formula be chosen?',
          mode: 'mcq',
          options: ['Near the beginning of table', 'Near the end of table', 'For arbitrary unequal points', 'Only for trigonometric functions'],
          correctOptionIndex: 1,
          explanation: 'Newton Backward formula uses backward differences ∇y evaluated at yn near the end of the table.'
        }
      },
      {
        id: 'c2-5',
        type: 'widget',
        content: 'Lagrange Interpolation Solver',
        widgetConfig: { algorithmId: 'lagrange-interpolation', params: { xValues: '5, 6, 9, 11', yValues: '12, 13, 14, 16', targetX: 10 } }
      }
    ]
  },
  {
    id: 'community-unit3-quad',
    title: 'Unit 3: Numerical Integration & Gauss-Legendre Quadrature',
    subtitle: 'Newton-Cotes formulas (Trapezoidal, Simpson, Boole, Weddle) and Gauss Quadrature',
    author: 'Calculus & Numerical Lab (Imperial)',
    unit: 'Unit 3',
    tags: ['Unit 3', 'Integration', 'GaussQuadrature'],
    accessKey: 'NETZ-QUADR3',
    blocks: [
      { id: 'c3-1', type: 'heading1', content: 'Numerical Quadrature Methods Overview' },
      { id: 'c3-2', type: 'paragraph', content: 'Gauss Quadrature selects optimal nodes t_i to achieve exact integration of polynomials up to degree 2n-1 using only n points.' },
      { id: 'c3-3', type: 'math', content: '\\int_{-1}^1 f(t) dt \\approx \\sum_{i=1}^n w_i f(t_i)' },
      {
        id: 'c3-4',
        type: 'widget',
        content: 'Gauss Quadrature Solver',
        widgetConfig: { algorithmId: 'gauss-quadrature', params: { expression: '1 / (1 + x^2)', a: 0, b: 1, points: 2 } }
      }
    ]
  },
  {
    id: 'community-unit4-matrix',
    title: 'Unit 4: Matrix Decompositions & ODE Initial Value Solvers',
    subtitle: 'LU Decomposition, Gauss-Seidel iteration, and 4th-Order Runge-Kutta derivations',
    author: 'Stanford Computational Engineering',
    unit: 'Unit 4',
    tags: ['Unit 4', 'LinearSystems', 'RK4', 'LU'],
    accessKey: 'NETZ-MATRIX4',
    blocks: [
      { id: 'c4-1', type: 'heading1', content: 'Solving Ax = b with LU Factorization' },
      { id: 'c4-2', type: 'paragraph', content: 'Factoring A = LU decomposes the system into two triangular systems: Ly = b (forward substitution) and Ux = y (backward substitution).' },
      { id: 'c4-3', type: 'math', content: 'A = L \\cdot U, \\quad L y = b, \\quad U x = y' },
      {
        id: 'c4-4',
        type: 'widget',
        content: 'LU Decomposition Solver',
        widgetConfig: { algorithmId: 'lu-decomposition', params: { row1: '2, 3, 1, 9', row2: '1, 2, 3, 6', row3: '3, 1, 2, 8' } }
      }
    ]
  },
  {
    id: 'community-unit5-stats',
    title: 'Unit 5: Hypothesis Testing & Statistical Significance Roadmap',
    subtitle: 'Deciding between Z-Test, t-Test, Chi-Square goodness-of-fit, and F-Test of variances',
    author: 'Biostatistics & Engineering Analytics',
    unit: 'Unit 5',
    tags: ['Unit 5', 'Statistics', 'HypothesisTesting'],
    accessKey: 'NETZ-STATS5',
    blocks: [
      { id: 'c5-1', type: 'heading1', content: 'Parametric vs Non-Parametric Tests' },
      { id: 'c5-2', type: 'paragraph', content: 'Use Z-test when population variance σ is known or sample size n ≥ 30. Use Student t-test when σ is unknown and n < 30.' },
      { id: 'c5-3', type: 'math', content: 't = \\frac{\\bar{X} - \\mu_0}{s / \\sqrt{n}}, \\quad df = n - 1' },
      {
        id: 'c5-4',
        type: 'quiz',
        content: 'Statistical Test Selector',
        quizConfig: {
          question: 'A quality engineer inspects a sample of 16 components with unknown population variance. Which test is appropriate?',
          mode: 'mcq',
          options: ['Z-Test for large samples', "Student's t-Test", 'F-Test for equality of variances', 'Chi-Square test'],
          correctOptionIndex: 1,
          explanation: 'Since n = 16 < 30 and σ is unknown, Student t-test with df = 15 is appropriate.'
        }
      }
    ]
  }
];

export default function NoteShareModal({
  note,
  isOpen,
  onClose,
  onUpdateNote,
  onImportKey,
  onCloneNote
}) {
  const [activeTab, setActiveTab] = useState('share'); // 'share' | 'community'
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [importInputKey, setImportInputKey] = useState('');
  const [importStatus, setImportStatus] = useState(null);

  // Community search & filters
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityUnit, setCommunityUnit] = useState('All');

  if (!isOpen || !note) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/Notes?key=${note.accessKey}`
    : `https://netz.app/Notes?key=${note.accessKey}`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(note.accessKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTogglePublic = () => {
    onUpdateNote({ ...note, isPublic: !note.isPublic });
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!importInputKey.trim()) return;
    const result = onImportKey(importInputKey.trim());
    if (result) {
      setImportStatus({ success: true, message: `Successfully imported "${result.title}"!` });
      setImportInputKey('');
    } else {
      setImportStatus({ success: false, message: 'Invalid or missing Access Key.' });
    }
  };

  const filteredCommunityNotes = CURATED_COMMUNITY_NOTES.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(communitySearch.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(communitySearch.toLowerCase()) ||
      item.author.toLowerCase().includes(communitySearch.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(communitySearch.toLowerCase()));

    const matchesUnit =
      communityUnit === 'All' || item.unit === communityUnit;

    return matchesSearch && matchesUnit;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-900 dark:text-slate-100 font-sans max-h-[85vh] flex flex-col">
        {/* Modal Header with Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-slate-800 bg-neutral-50/80 dark:bg-slate-950/50 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('share')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'share'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-neutral-200 dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-300 dark:hover:bg-slate-700'
              }`}
            >
              <FaShareAlt className="w-3 h-3" />
              <span>Share Active Note</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'community'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-neutral-200 dark:bg-slate-800 text-neutral-700 dark:text-slate-300 hover:bg-neutral-300 dark:hover:bg-slate-700'
              }`}
            >
              <FaGlobe className="w-3 h-3" />
              <span>Community Notes Feed</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 font-mono">
                {CURATED_COMMUNITY_NOTES.length}
              </span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-notion-scrollbar">
          {/* TAB 1: SHARE ACTIVE NOTE */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* Public / Private Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-slate-950/80 border border-neutral-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-lg ${note.isPublic ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-200 text-neutral-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {note.isPublic ? <FaGlobe className="w-5 h-5" /> : <FaLock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {note.isPublic ? 'Public Note (Shared)' : 'Private Note (Only You)'}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-slate-400">
                      {note.isPublic
                        ? 'Anyone with your 8-digit key can view or import this note.'
                        : 'Visible only on this local browser session.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleTogglePublic}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    note.isPublic
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {note.isPublic ? 'Public' : 'Make Public'}
                </button>
              </div>

              {/* Access Key & Direct Share Link */}
              {note.isPublic && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
                      <FaKey className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <span>Unique Access Key</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-neutral-100 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/50 rounded-xl px-4 py-2 text-base font-mono font-bold text-indigo-700 dark:text-indigo-300 tracking-wider">
                        {note.accessKey}
                      </div>
                      <button
                        onClick={handleCopyKey}
                        className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        {copiedKey ? <FaCheck className="w-3.5 h-3.5" /> : <FaCopy className="w-3.5 h-3.5" />}
                        <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-slate-400 mb-1.5">Direct Web Link</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 bg-neutral-100 dark:bg-slate-950 border border-neutral-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-800 dark:text-slate-300 focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center space-x-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        {copiedLink ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Note by Key */}
              <div className="pt-4 border-t border-neutral-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-neutral-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
                  <FaFileImport className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Import Shared Note by Access Key</span>
                </h4>
                <form onSubmit={handleImportSubmit} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. NETZ-ROOTS1 or NETZ-8X42"
                    value={importInputKey}
                    onChange={(e) => setImportInputKey(e.target.value)}
                    className="flex-1 bg-neutral-50 dark:bg-slate-950 border border-neutral-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    Import
                  </button>
                </form>

                {importStatus && (
                  <p
                    className={`mt-2 text-xs font-medium ${
                      importStatus.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {importStatus.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMMUNITY NOTES FEED */}
          {activeTab === 'community' && (
            <div className="space-y-4">
              {/* Search & Unit Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full">
                  <FaSearch className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search community notes, formulas, authors..."
                    value={communitySearch}
                    onChange={(e) => setCommunitySearch(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-slate-950 border border-neutral-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center space-x-1 text-xs overflow-x-auto w-full sm:w-auto">
                  {['All', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'].map((u) => (
                    <button
                      key={u}
                      onClick={() => setCommunityUnit(u)}
                      className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-all ${
                        communityUnit === u
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Community Cards Grid */}
              <div className="space-y-3 pt-2">
                {filteredCommunityNotes.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-slate-950/70 border border-neutral-200 dark:border-slate-800/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                            {comm.unit}
                          </span>
                          <span className="text-[11px] text-neutral-500 dark:text-slate-400 flex items-center space-x-1">
                            <FaUserGraduate className="w-3 h-3 text-neutral-400" />
                            <span>{comm.author}</span>
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-400 dark:text-slate-500">
                          {comm.accessKey}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {comm.title}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {comm.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-slate-800/60 text-xs">
                      <div className="flex items-center space-x-1.5">
                        {comm.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-neutral-500 dark:text-slate-400 bg-neutral-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => onCloneNote && onCloneNote(comm)}
                        className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                      >
                        <FaDownload className="w-2.5 h-2.5" />
                        <span>Clone to My Workspace</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
