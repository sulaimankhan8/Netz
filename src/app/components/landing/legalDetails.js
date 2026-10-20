/**
 * The owner's details shown on the Terms, Refund, Contact and Privacy pages. Razorpay checks these
 * pages before it turns payments on, so they must be real (NETZ_LAUNCH_PLAN.md 5.3).
 * Empty fields are left off the pages.
 */
export const LEGAL = {
  // Who runs NETZ: your full name, or the business name once it is registered
  owner: '',
  // Where students and Razorpay can reach you
  email: '',
  // Postal address (city, state, PIN). Razorpay asks for one on the Contact page
  address: '',
  // Courts for disputes, usually your city and state
  jurisdiction: '',
  // Days after a first Pro payment in which a full refund is given
  refundDays: 7,
  updated: '20 October 2026',
};
