/**
 * What Free and Pro may store on the server (NETZ_LAUNCH_PLAN.md 5.1). The server routes use these
 * with the student's real Pro status (db/billingStore.js); a null limit means unlimited.
 */

import { FREE_CLOUD_NOTES } from '../(Primary.pages)/Notes/utils/notesCore.js';
import { FREE_PUBLIC_NOTES } from '../(Primary.pages)/Notes/utils/publishCore.js';
import { PRO_LIMITS } from './pricing.js';

export function cloudNoteLimit(pro) {
  return pro ? null : FREE_CLOUD_NOTES;
}

export function publicNoteLimit(pro) {
  return pro ? PRO_LIMITS.publicNotes : FREE_PUBLIC_NOTES;
}
