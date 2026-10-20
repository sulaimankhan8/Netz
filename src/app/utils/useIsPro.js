'use client';

import { useEffect, useState } from 'react';
import { PRO_EVENT, cachedPro, isProOnDevice } from './proClient';

/** Calls `update` now and whenever the device's copy of the Pro status changes. */
function useProEvents(update) {
  useEffect(() => {
    update();
    window.addEventListener(PRO_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(PRO_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, [update]);
}

/** Whether this device thinks the student is Pro (utils/proClient.js); updates when that changes. */
export default function useIsPro() {
  const [pro, setPro] = useState(false);
  useProEvents(useStableCallback(() => setPro(isProOnDevice())));
  return pro;
}

/** The cached status ({ pro, plan, lifetime, until, renews }) or null, for screens that show the plan. */
export function useProStatus() {
  const [status, setStatus] = useState(null);
  useProEvents(useStableCallback(() => setStatus(isProOnDevice() ? cachedPro() : null)));
  return status;
}

// The callbacks above only call setState, so one function for the component's life is enough
function useStableCallback(fn) {
  const [stable] = useState(() => fn);
  return stable;
}
