'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ldSans } from '../landing/fonts';

const PHONE_QUERY = '(max-width: 600px)';

export function isPhoneScreen() {
  return typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches;
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/**
 * The tour bubble, given to react-joyride as its tooltipComponent. Laptop and tablet: next to the
 * control it explains. Phones: a bottom sheet, drawn in a portal so the floating position does not
 * move it. Escape ends the tour; the main button gets focus on every step.
 */
export default function TourBubble({ index, size, step, isLastStep, backProps, primaryProps, skipProps, closeProps, tooltipProps, controls }) {
  const mainRef = useRef(null);
  const phone = isPhoneScreen();
  const { area = 'NETZ', tone = 'app' } = step.data || {};

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      controls.skip('button_close');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [controls]);

  const bubble = (
    <div
      {...tooltipProps}
      className={`nz-tour nz-tour-${tone} ${ldSans.variable}${phone ? ' is-sheet' : ''}`}
      aria-label={`${area} tour, step ${index + 1} of ${size}`}
      data-tour-bubble=""
    >
      <div className="nz-tour-head">
        <span className="nz-tour-kicker">
          {area} · {index + 1} of {size}
        </span>
        <button type="button" {...closeProps} className="nz-tour-x" aria-label="End tour" title="End tour">
          <IconX />
        </button>
      </div>
      {step.title && <h3 className="nz-tour-title">{step.title}</h3>}
      <p className="nz-tour-text">{step.content}</p>
      <div className="nz-tour-bars" aria-hidden="true">
        {Array.from({ length: size }, (_, i) => (
          <span key={i} className={`nz-tour-bar${i <= index ? ' is-on' : ''}`} />
        ))}
      </div>
      <div className="nz-tour-foot">
        {!isLastStep && (
          <button type="button" {...skipProps} className="nz-tour-btn is-quiet" aria-label="Skip tour" title="Skip tour">
            Skip tour
          </button>
        )}
        <div className="nz-tour-btns">
          {index > 0 && (
            <button type="button" {...backProps} className="nz-tour-btn" aria-label="Back" title="Back">
              Back
            </button>
          )}
          <button type="button" {...primaryProps} ref={mainRef} className="nz-tour-btn is-main" aria-label={isLastStep ? 'Done' : 'Next'} title={isLastStep ? 'Done' : 'Next'}>
            {isLastStep ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );

  return phone ? createPortal(bubble, document.body) : bubble;
}
