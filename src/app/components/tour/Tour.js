'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import './tour.css';
import { TOURS, markTourDone } from './tours';
import TourBubble, { isPhoneScreen } from './TourBubble';

// Loaded only when a tour actually starts
const Joyride = dynamic(() => import('react-joyride').then((mod) => mod.Joyride), { ssr: false });

function isVisible(element) {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  const style = window.getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) > 0;
}

function findTarget(selectors) {
  for (const selector of selectors || []) {
    for (const element of document.querySelectorAll(selector)) {
      if (isVisible(element)) return element;
    }
  }
  return null;
}

/**
 * Runs one of the onboarding tours (tours.js) when the page's address has ?tour=<id> and <id> is
 * one of `ids`. `aliases` maps older parameter values to an id (Gauss–Seidel used ?tour=true).
 *
 * The parameter is removed from the address once the tour starts, so a refresh does not start it
 * again. Finishing the tour records it for the landing page's cards; Skip, the cross and Escape
 * end it without a tick.
 */
export default function Tour({ ids, aliases }) {
  const [tour, setTour] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('tour');
    if (!raw) return undefined;
    const id = aliases?.[raw] || raw;
    const definition = TOURS[id];
    if (!definition || !ids.includes(id)) return undefined;

    params.delete('tour');
    const query = params.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);

    // Give the page a moment to lay out (the Playground loads its canvas first)
    const timer = window.setTimeout(() => {
      const steps = definition.steps.map((step, index) => {
        const element = step.target ? findTarget(step.target) : null;
        return {
          id: `${id}-${index}`,
          target: element || 'body',
          placement: element ? step.placement || 'auto' : 'center',
          title: step.title,
          content: step.content,
          data: { area: definition.area, tone: definition.tone },
        };
      });
      setTour({ id, steps, phone: isPhoneScreen(), dark: document.documentElement.classList.contains('dark') });
    }, definition.delay ?? 700);
    return () => window.clearTimeout(timer);
    // The tour is chosen once, from the address the page opened with
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEvent = useCallback(
    (data) => {
      if (data.status === 'finished') {
        markTourDone(tour.id);
        setTour(null);
      } else if (data.status === 'skipped') {
        setTour(null);
      }
    },
    [tour]
  );

  if (!tour) return null;

  return (
    <Joyride
      run
      continuous
      scrollToFirstStep
      steps={tour.steps}
      onEvent={onEvent}
      tooltipComponent={TourBubble}
      floatingOptions={{ hideArrow: tour.phone }}
      options={{
        skipBeacon: true,
        closeButtonAction: 'skip',
        dismissKeyAction: false,
        overlayClickAction: false,
        disableFocusTrap: tour.phone,
        overlayColor: 'rgba(29, 29, 31, 0.5)',
        arrowColor: tour.dark ? '#1E1E20' : '#FFFFFF',
        spotlightRadius: 14,
        spotlightPadding: 8,
        scrollOffset: 120,
        zIndex: 10000,
      }}
    />
  );
}
