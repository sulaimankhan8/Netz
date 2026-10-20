/**
 * NETZ Pro prices (NETZ_LAUNCH_PLAN.md 5.1). One place for the Pricing page and, later, the Razorpay
 * routes: the server must charge from these numbers, never from a price the browser sends.
 * Amounts are in the smallest unit (paise / cents), as Razorpay expects.
 */

export const CURRENCIES = {
  INR: { symbol: '₹', locale: 'en-IN', label: '₹ INR' },
  USD: { symbol: '$', locale: 'en-US', label: '$ USD' },
};

export const PLANS = {
  monthly: { label: 'Monthly', per: 'per month', INR: 19900, USD: 299 },
  yearly: { label: 'Yearly', per: 'per year', INR: 149900, USD: 1999 },
  lifetime: { label: 'Lifetime', per: 'once', INR: 349900, USD: 4999 },
};

export const PLAN_ORDER = ['monthly', 'yearly', 'lifetime'];

export const PRO_LIMITS = { publicNotes: 25, refundDays: 7 };

/** "₹1,499" or "$19.99": whole amounts without decimals. */
export function formatPrice(amount, currency) {
  const c = CURRENCIES[currency];
  const value = amount / 100;
  const digits = Number.isInteger(value) ? 0 : 2;
  return `${c.symbol}${value.toLocaleString(c.locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

/** How much yearly saves against twelve monthly payments, as a whole percent. */
export function yearlySaving(currency) {
  return Math.round((1 - PLANS.yearly[currency] / (PLANS.monthly[currency] * 12)) * 100);
}

/** The yearly price spread over twelve months, rounded to a whole unit ("₹125", "$1.67"). */
export function yearlyPerMonth(currency) {
  const per = PLANS.yearly[currency] / 12;
  return formatPrice(currency === 'INR' ? Math.round(per / 100) * 100 : Math.round(per), currency);
}

/**
 * The visitor's likely currency: INR for India (Indian time zone or an Indian locale), USD for
 * everyone else. The student can switch by hand.
 */
export function guessCurrency() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (zone === 'Asia/Kolkata' || zone === 'Asia/Calcutta') return 'INR';
    const langs = typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [];
    if (langs.some((l) => /-IN$/i.test(l || ''))) return 'INR';
  } catch {
    // fall through
  }
  return 'USD';
}
