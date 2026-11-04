/**
 * Picks the rule in force on a date from a rates data file (src/app/data/rates/*).
 * A rule applies when validFrom ≤ date < validTo; a null validFrom or validTo means open-ended.
 */
import { EngineError } from '../numeric/steps';

/** Today as YYYY-MM-DD (local time). */
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** The rule with this id in force on `date` (YYYY-MM-DD), or null. */
export function getRule(rules, id, date = today()) {
  return rules.find((r) => r.id === id && (!r.validFrom || r.validFrom <= date) && (!r.validTo || date < r.validTo)) || null;
}

/** Like getRule, but throws an EngineError when nothing covers the date. */
export function requireRule(rules, id, date = today()) {
  const r = getRule(rules, id, date);
  if (!r) throw new EngineError(`No ${id} rates are stored for ${date}. Type your own rate instead.`);
  return r;
}

/** Every version of one rule, newest first: for a "rates for" picker. */
export function versions(rules, id) {
  return rules.filter((r) => r.id === id).sort((a, b) => String(b.validFrom).localeCompare(String(a.validFrom)));
}

export const STATUS_TEXT = {
  official: 'Checked on the official site',
  secondary: 'From tax portals and news, not yet checked on the official site',
  unverified: 'Not yet checked: confirm this rate before relying on it',
};
