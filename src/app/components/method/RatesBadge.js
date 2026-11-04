// "Rates as of …" box for tax pages (NETZ_METHODS_CATALOG.md section 0.2): where the rate comes from,
// when it was checked, a warning when it isn't confirmed on the official site, and "not tax advice".
import { FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { STATUS_TEXT } from '@/app/utils/rates/getRule';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2025-09-22" → "22 Sep 2025" (no time zones involved). */
export const niceDate = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export default function RatesBadge({ rule, custom = false, children }) {
  if (!rule) return null;
  const { source } = rule;
  const official = source.status === 'official';
  const Icon = official ? FiCheckCircle : FiAlertTriangle;
  return (
    <aside className="p-4 border-2 border-black/30 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 space-y-2 text-sm text-black dark:text-white">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-block border-2 border-black dark:border-white bg-[#FFE600] text-black px-2 py-0.5 text-xs font-mono font-black uppercase rounded-md">
          Rates {rule.validFrom ? `from ${niceDate(rule.validFrom)}` : `as of ${niceDate(source.verifiedOn)}`}
        </span>
        <span className="font-bold">{rule.label}</span>
      </div>
      {children}
      <p className="text-neutral-700 dark:text-neutral-300">
        Source: <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline font-semibold">{source.title}</a> · checked {niceDate(source.verifiedOn)}
      </p>
      <p className={`flex items-start gap-2 ${official ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-300'}`}>
        <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
        <span>{STATUS_TEXT[source.status]}.{custom && ' You are using your own rate, so this does not apply to the answer above.'}</span>
      </p>
      <p className="flex items-start gap-2 text-neutral-600 dark:text-neutral-400">
        <FiInfo className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
        <span>For learning and quick checks, not tax advice. Rates change: confirm with the official notification or a tax professional.</span>
      </p>
    </aside>
  );
}
