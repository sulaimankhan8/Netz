'use client';

import { useEffect, useState } from 'react';
import { LuCheck, LuCopy, LuDownload, LuExternalLink, LuFileDown, LuGlobe, LuLock, LuSearch } from 'react-icons/lu';
import { BTN_DANGER, BTN_MAIN, BTN_QUIET, BTN_SECONDARY, BTN_TINT, chipClass, FIELD, FIELD_INPUT, LABEL, Modal, Segmented } from './ui';
import useAccount from '@/app/utils/progress/useAccount';
import { recordActivity } from '@/app/utils/activity';
import { exportNoteAsMarkdown } from '../utils/noteStorage';
import { exportNoteToPdf } from '../utils/pdfExport';
import { loadPublished, PUBLISHED_EVENT, publicUrl, publishedState, publishNote, unpublishNote } from '../utils/publishClient';
import { FREE_PUBLIC_NOTES } from '../utils/publishCore';
import { isProOnDevice } from '@/app/utils/proClient';

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



const PUBLISH_ERRORS = {
  limit_reached: 'You have published as many notes as your plan allows. Unpublish one to publish this.',
  empty_note: 'Write something first: an empty note cannot be published.',
  sample_note: 'Sample notes cannot be published. Make your own note, or copy this one first.',
  too_large: 'This note is too big to publish. Split it into two notes.',
  offline: "You're offline. Try again when you're connected.",
  signed_out: 'Please sign in again.',
};

/** "This note" tab (board artboard 10): A signed out, B private, C published; then Export. */
function ShareThisNote({ note }) {
  const account = useAccount();
  const [published, setPublished] = useState(publishedState());
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const onChange = (e) => setPublished(e.detail);
    window.addEventListener(PUBLISHED_EVENT, onChange);
    if (account.user) loadPublished();
    return () => window.removeEventListener(PUBLISHED_EVENT, onChange);
  }, [account.user]);

  const mine = published.notes.find((n) => n.noteId === note.id);
  const changedSince = mine && note.updatedAt && Date.parse(note.updatedAt) > Date.parse(mine.updatedAt) + 1000;
  const link = mine ? publicUrl(mine.slug) : '';

  const run = async (kind, fn, okText) => {
    setBusy(kind);
    setMessage(null);
    const r = await fn();
    setBusy(null);
    setMessage(r.ok ? { ok: true, text: okText } : { ok: false, text: PUBLISH_ERRORS[r.error] || 'That did not work. Please try again.' });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage({ ok: false, text: 'Could not copy. Select the link and copy it by hand.' });
    }
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      await exportNoteToPdf(note, 'note-printable-area', { clean: isProOnDevice() });
      recordActivity('note.exported', { kind: 'pdf' });
    } catch (err) {
      setMessage({ ok: false, text: `Could not export the PDF: ${err.message || 'unknown error'}` });
    } finally {
      setExporting(false);
    }
  };

  let status;
  if (account.configured && !account.user) {
    status = (
      <>
        <StatusRow icon={<LuGlobe className="w-5 h-5" />} title="Publish to the web" text="Give classmates a link to read this note, try its solvers and answer its quizzes." />
        <p className="m-0 text-[14px] text-nt-text2">Publishing needs an account, so the link keeps working on every device.</p>
        <button type="button" className={`${BTN_SECONDARY} !h-11`} onClick={account.signIn}>Continue with Google</button>
      </>
    );
  } else if (!account.configured) {
    status = (
      <StatusRow icon={<LuLock className="w-5 h-5" />} title="Private" text="Only you can see this note. Publishing to the web is coming soon." />
    );
  } else if (!mine) {
    const used = published.notes.length;
    status = (
      <>
        <StatusRow icon={<LuLock className="w-5 h-5" />} title="Private" text="Only you can see this note." />
        <div className="flex flex-col gap-1">
          <p className="m-0 text-[14px] text-nt-text2">Publishing shares a copy of the note as it is now. Later edits stay private until you press &ldquo;Update the public copy&rdquo;.</p>
          {published.loaded && <p className="m-0 text-[13px] text-nt-text2">{used} of {published.limit} {published.limit > FREE_PUBLIC_NOTES ? '' : 'free '}public notes used</p>}
        </div>
        <button type="button" className={`${BTN_MAIN} !h-11`} disabled={!!busy} onClick={() => run('publish', () => publishNote(note), 'Published. Copy the link and share it.')}>
          {busy === 'publish' ? 'Publishing…' : 'Publish to the web'}
        </button>
      </>
    );
  } else {
    status = (
      <>
        <StatusRow ok icon={<LuGlobe className="w-5 h-5" />} title="Published" text={`Anyone with the link can read it · ${mine.views} ${mine.views === 1 ? 'view' : 'views'}`} />
        <div className="flex gap-2">
          <label className={`${FIELD} flex-1 min-w-0 !h-11`}>
            <input type="text" readOnly value={link} aria-label="Link to the public note" onFocus={(e) => e.target.select()} className={`${FIELD_INPUT} font-nt-mono text-[13px] text-nt-text2`} />
          </label>
          <button type="button" onClick={copyLink} className={`${BTN_MAIN} !h-11`}>
            {copied ? <LuCheck className="w-4 h-4" aria-hidden="true" /> : <LuCopy className="w-4 h-4" aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-dashed border-nt-line px-3.5 py-3">
          <p className="m-0 flex-1 min-w-[160px] text-[14px] text-nt-text2">{changedSince ? 'You changed this note since publishing.' : 'The public copy matches this note.'}</p>
          <button type="button" className={`${BTN_SECONDARY} !h-10`} disabled={!!busy} onClick={() => run('update', () => publishNote(note), 'The public copy is up to date.')}>
            {busy === 'update' ? 'Updating…' : 'Update the public copy'}
          </button>
        </div>
        <a href={link} target="_blank" rel="noopener noreferrer" className={`${BTN_QUIET} !h-11 justify-center`}>
          <LuExternalLink className="w-4 h-4" aria-hidden="true" />
          Open the public page
        </a>
        <button type="button" className={`${BTN_DANGER} !h-11 justify-center border border-nt-line`} disabled={!!busy} onClick={() => run('unpublish', () => unpublishNote(note.id), 'Unpublished. The link no longer works.')}>
          {busy === 'unpublish' ? 'Unpublishing…' : 'Unpublish'}
        </button>
      </>
    );
  }

  return (
    <>
      {status}
      <div aria-live="polite">
        {message && <p className={`m-0 text-[14px] font-medium ${message.ok ? 'text-nt-ok' : 'text-nt-danger'}`}>{message.text}</p>}
      </div>
      <div className="h-px bg-nt-line" />
      <div className="flex flex-col gap-2">
        <span className={LABEL}>Export</span>
        <div className="flex gap-2">
          <button type="button" className={`${BTN_SECONDARY} !h-11 flex-1`} disabled={exporting} onClick={exportPdf}>
            <LuFileDown className="w-4 h-4" aria-hidden="true" />
            {exporting ? 'Exporting PDF…' : 'PDF'}
          </button>
          <button type="button" className={`${BTN_SECONDARY} !h-11 flex-1`} onClick={() => exportNoteAsMarkdown(note)}>
            <LuDownload className="w-4 h-4" aria-hidden="true" />
            Markdown
          </button>
        </div>
      </div>
    </>
  );
}

function StatusRow({ icon, title, text, ok = false }) {
  return (
    <div className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl ${ok ? 'bg-nt-ok-tint' : 'bg-nt-tray'}`}>
      <span className={`w-10 h-10 rounded-xl bg-nt-surface flex items-center justify-center shrink-0 ${ok ? 'text-nt-ok' : 'text-nt-text2'}`} aria-hidden="true">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`m-0 text-[15px] font-semibold ${ok ? 'text-nt-ok' : ''}`}>{title}</p>
        <p className="m-0 text-[13px] leading-[19px] text-nt-text2">{text}</p>
      </div>
    </div>
  );
}

export default function NoteShareModal({ note, isOpen, onClose, onCloneNote, isPhone }) {
  const [activeTab, setActiveTab] = useState('share'); // 'share' | 'community'
  const [communitySearch, setCommunitySearch] = useState('');
  const [communityUnit, setCommunityUnit] = useState('All');

  if (!isOpen || !note) return null;

  const filteredCommunityNotes = CURATED_COMMUNITY_NOTES.filter((item) => {
    const q = communitySearch.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));
    return matchesSearch && (communityUnit === 'All' || item.unit === communityUnit);
  });

  const units = ['All', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];

  return (
    <Modal title="Share" onClose={onClose} isPhone={isPhone}>
      <div className={`flex flex-col gap-5 ${isPhone ? 'px-5 pt-3 pb-8' : 'px-6 pt-3 pb-6'}`}>
        <Segmented
          label="Share"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'share', label: 'This note' },
            { value: 'community', label: `Community · ${CURATED_COMMUNITY_NOTES.length}` }
          ]}
        />

        {activeTab === 'share' && <ShareThisNote note={note} />}

        {activeTab === 'community' && (
          <>
            <label className={`${FIELD} !h-11`}>
              <LuSearch className="w-[18px] h-[18px] text-nt-text2 shrink-0" aria-hidden="true" />
              <input
                type="text"
                aria-label="Search community notes"
                placeholder="Search community notes"
                value={communitySearch}
                onChange={(e) => setCommunitySearch(e.target.value)}
                className={FIELD_INPUT}
              />
            </label>

            <div className="flex gap-1.5 overflow-x-auto nt-noscroll -mt-1" role="group" aria-label="Unit">
              {units.map((u) => (
                <button key={u} type="button" aria-pressed={communityUnit === u} onClick={() => setCommunityUnit(u)} className={chipClass(communityUnit === u)}>
                  {u}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              {filteredCommunityNotes.length === 0 && <p className="m-0 py-6 text-center text-sm text-nt-text2">No community notes match.</p>}
              {filteredCommunityNotes.map((comm) => (
                <article key={comm.id} className="rounded-2xl border border-nt-line px-4 py-3.5 flex flex-col gap-1.5">
                  <p className="m-0 text-xs font-semibold text-nt-text2">
                    {comm.unit} · {comm.author}
                  </p>
                  <h3 className="m-0 text-base leading-[22px] font-semibold">{comm.title}</h3>
                  <p className="m-0 text-sm leading-5 text-nt-text2">{comm.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="flex-1 min-w-0 truncate text-[13px] text-nt-text2">{comm.tags.map((t) => `# ${t}`).join('  ')}</span>
                    <button type="button" onClick={() => onCloneNote && onCloneNote(comm)} className={BTN_TINT}>
                      <LuCopy className="w-4 h-4" aria-hidden="true" />
                      Clone
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
