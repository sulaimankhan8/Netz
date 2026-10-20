'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useAccount from '@/app/utils/progress/useAccount';
import { refreshPro } from '@/app/utils/proClient';

/**
 * Buying Pro from the Pricing page (NETZ_LAUNCH_PLAN.md 5.4 step 3):
 * sign in → api/billing/start → Razorpay Checkout → wait until the webhook has turned Pro on.
 * The browser never decides that a payment worked; it only asks the server (api/billing/status).
 */

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
const WAIT_MS = 45000;
const POLL_MS = 2000;

export const PAYMENTS_OPEN = Boolean(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

const ERRORS = {
  signed_out: 'Please sign in first.',
  already_pro: 'You already have Pro.',
  already_lifetime: 'You already have Pro for life.',
  plan_not_set_up: 'This plan is not open yet. Please pick another.',
  not_configured: 'Payments are not open yet.',
  razorpay_failed: 'Razorpay could not start the payment. Please try again.',
};

let checkoutScript = null;
function loadCheckout() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  if (!checkoutScript) {
    checkoutScript = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = CHECKOUT_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        checkoutScript = null;
        reject(new Error('checkout_script'));
      };
      document.head.appendChild(s);
    });
  }
  return checkoutScript;
}

async function fetchStatus() {
  const response = await fetch('/api/billing/status', { cache: 'no-store' });
  return response.ok ? response.json() : null;
}

/**
 * Returns { account, status, phase, message, buy(plan, currency) }.
 * phase: idle → starting → paying → confirming → done (or slow when the webhook takes a while).
 */
export default function useCheckout() {
  const account = useAccount();
  const [status, setStatus] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [message, setMessage] = useState('');
  const waitingRef = useRef(false);

  const signedIn = Boolean(account.user);
  useEffect(() => {
    if (!signedIn || !PAYMENTS_OPEN) return undefined;
    let alive = true;
    fetchStatus().then((s) => { if (alive) setStatus(s); }).catch(() => {});
    return () => { alive = false; };
  }, [signedIn]);

  const waitForPro = useCallback(async () => {
    if (waitingRef.current) return;
    waitingRef.current = true;
    setPhase('confirming');
    setMessage('Payment received. Turning Pro on…');
    const end = Date.now() + WAIT_MS;
    while (Date.now() < end) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      const s = await fetchStatus().catch(() => null);
      if (s?.pro) {
        setStatus(s);
        refreshPro(account.user?.id || null, { force: true });
        setPhase('done');
        setMessage('Pro is on. Thank you!');
        waitingRef.current = false;
        return;
      }
    }
    setPhase('slow');
    setMessage('Payment received. Razorpay is still confirming it; Pro turns on within a few minutes. You can keep using NETZ.');
    waitingRef.current = false;
  }, [account.user]);

  const buy = useCallback(async (plan, currency) => {
    if (!PAYMENTS_OPEN || phase === 'starting' || phase === 'paying' || phase === 'confirming') return;
    setMessage('');
    if (!account.user) {
      if (!account.configured) {
        setMessage('Accounts are coming soon.');
        return;
      }
      setMessage('Sign in with Google to get Pro. You come straight back here.');
      account.signIn();
      return;
    }

    setPhase('starting');
    let start;
    try {
      const response = await fetch('/api/billing/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, currency }),
      });
      start = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(start?.error || 'failed');
      await loadCheckout();
    } catch (error) {
      setPhase('idle');
      setMessage(ERRORS[error.message] || 'Something went wrong. Please try again.');
      return;
    }

    setPhase('paying');
    const checkout = new window.Razorpay({
      key: start.keyId,
      ...(start.subscriptionId ? { subscription_id: start.subscriptionId } : { order_id: start.orderId, amount: start.amount, currency: start.currency }),
      name: 'NETZ',
      description: `NETZ Pro · ${plan}`,
      prefill: start.email ? { email: start.email } : undefined,
      theme: { color: '#4F46E5' },
      handler: () => { waitForPro(); },
      modal: {
        ondismiss: () => {
          if (!waitingRef.current) {
            setPhase('idle');
            setMessage('');
          }
        },
      },
    });
    checkout.on('payment.failed', (response) => {
      setPhase('idle');
      setMessage(response?.error?.description ? `Payment failed: ${response.error.description}` : 'Payment failed. Nothing was charged.');
    });
    checkout.open();
  }, [account, phase, waitForPro]);

  return { account, status, phase, message, buy };
}
