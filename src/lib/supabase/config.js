/**
 * Supabase settings from the environment (NETZ_LAUNCH_PLAN.md 4.1). Both are public: the URL and
 * the publishable (or older "anon") key are meant for the browser. Secrets never go here.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/** False until the Supabase keys are set; sign-in then shows as "coming soon" and nothing breaks. */
export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_KEY);
