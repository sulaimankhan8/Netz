'use client';

import { useEffect, useRef, useState } from 'react';
import NetzRobot from '@/app/components/mascot/NetzRobot';
import { completeOnboarding } from '@/app/utils/progress/useProgress';
import { DEFAULT_ROBOT_NAME } from '@/app/utils/progress/catalog';

const UNITS = [
  { n: 1, name: 'Roots and systems' },
  { n: 2, name: 'Interpolation' },
  { n: 3, name: 'Integration' },
  { n: 4, name: 'ODEs and matrices' },
  { n: 5, name: 'Statistics' },
];

const FIELD = 'w-full min-h-[48px] rounded-xl border border-[var(--pf-line)] bg-[var(--pf-tray)] px-4 text-[16px] text-[var(--pf-ink)] placeholder:text-[var(--pf-text2)]';
const BTN = 'inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 text-[15px] font-bold';

/**
 * Onboarding step 1 (NETZ_LAUNCH_PLAN.md 2.3): meet the robot, name it, and pick your units.
 * Two short screens; it can be skipped at any time. onClose(finished)
 */
export default function OnboardingDialog({ initial = {}, onClose }) {
  const [step, setStep] = useState(0);
  const [robotName, setRobotName] = useState(initial.robotName || '');
  const [displayName, setDisplayName] = useState(initial.displayName || '');
  const [units, setUnits] = useState(Array.isArray(initial.units) ? initial.units : []);
  const firstFieldRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [step]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose(false);
      // Keep Tab inside the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button, input');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const finish = () => {
    completeOnboarding({ robotName: robotName.trim() || DEFAULT_ROBOT_NAME, displayName, units });
    onClose(true);
  };

  const toggleUnit = (n) => setUnits((list) => (list.includes(n) ? list.filter((u) => u !== n) : [...list, n].sort()));

  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose(false)}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-onboard-title"
        className="pf w-full max-w-[460px] rounded-t-[28px] border border-[var(--pf-line)] bg-[var(--pf-surface)] p-6 shadow-2xl sm:rounded-[28px]"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-[var(--pf-text2)]">Step {step + 1} of 2</span>
          <button type="button" onClick={() => onClose(false)} className="min-h-[44px] rounded-xl px-3 text-[14px] font-semibold text-[var(--pf-text2)] hover:text-[var(--pf-ink)]">Skip</button>
        </div>

        {step === 0 ? (
          <form className="mt-2 flex flex-col items-center gap-4 text-center" onSubmit={(e) => { e.preventDefault(); setStep(1); }}>
            <NetzRobot size={140} mood="wave" listen={false} title="Your new robot, waving" />
            <h2 id="pf-onboard-title" className="pf-display m-0 text-[26px] font-semibold">Hi! I&apos;m your study robot.</h2>
            <p className="m-0 text-[15px] text-[var(--pf-text2)]">I cheer when you finish tasks and keep your streak warm. What should my name be?</p>
            <label className="w-full text-left">
              <span className="mb-1.5 block text-[14px] font-bold">Robot name</span>
              <input ref={firstFieldRef} className={FIELD} value={robotName} onChange={(e) => setRobotName(e.target.value)} maxLength={24} placeholder={DEFAULT_ROBOT_NAME} autoComplete="off" />
            </label>
            <button type="submit" className={`${BTN} w-full bg-[var(--pf-accent)] text-[var(--pf-accent-ink)]`}>Next</button>
          </form>
        ) : (
          <form className="mt-2 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); finish(); }}>
            <div className="flex items-center gap-3">
              <NetzRobot size={64} mood="think" listen={false} title="Your robot, thinking" />
              <h2 id="pf-onboard-title" className="pf-display m-0 text-[22px] font-semibold">{robotName.trim() || DEFAULT_ROBOT_NAME} says: now tell me about you!</h2>
            </div>
            <label>
              <span className="mb-1.5 block text-[14px] font-bold">Your name <span className="font-normal text-[var(--pf-text2)]">(optional)</span></span>
              <input ref={firstFieldRef} className={FIELD} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} placeholder="Shown on your Profile" autoComplete="given-name" />
            </label>
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-1.5 text-[14px] font-bold">Which units are you studying?</legend>
              <p className="m-0 mb-2 text-[13px] text-[var(--pf-text2)]">Today&apos;s tasks come from these. Pick none to get all of them.</p>
              <div className="flex flex-wrap gap-2">
                {UNITS.map((u) => {
                  const on = units.includes(u.n);
                  return (
                    <button
                      key={u.n}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleUnit(u.n)}
                      className={`min-h-[44px] rounded-full border px-4 text-[14px] font-semibold ${on ? 'border-[#FBAE3D] bg-[var(--pf-accent)] text-[var(--pf-accent-ink)]' : 'border-[var(--pf-line)] bg-[var(--pf-tray)] text-[var(--pf-ink)]'}`}
                    >
                      Unit {u.n} · {u.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep(0)} className={`${BTN} flex-1 border border-[var(--pf-line)] bg-[var(--pf-tray)] text-[var(--pf-ink)]`}>Back</button>
              <button type="submit" className={`${BTN} flex-[2] bg-[var(--pf-accent)] text-[var(--pf-accent-ink)]`}>Done</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
