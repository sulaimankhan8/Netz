/**
 * The owner's details shown on the Terms, Refund, Contact and Privacy pages. Razorpay checks these
 * pages before it turns payments on, so they must be real (NETZ_LAUNCH_PLAN.md 5.3).
 * Empty fields are left off the pages.
 */
export const LEGAL = {
  // Who runs NETZ: your full name, or the business name once it is registered
  owner: 'Sulaiman Khan',
  // Where students and Razorpay can reach you
  email: 'suleman111111111111111@gmail.com',
  // Postal address (city, state, PIN). Razorpay asks for one on the Contact page
  address: '356/218/348, Govind Puram, Habibpur, Rajajipuram, Lucknow, Uttar Pradesh 226017',
  // Courts for disputes, usually your city and state
  jurisdiction: 'Lucknow, Uttar Pradesh',
  updated: '21 October 2026',
};
