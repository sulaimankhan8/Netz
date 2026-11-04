// A finite difference table laid out the textbook way: each difference sits between the two values
// it comes from. rows/headers come from utils/numeric/differences.js (staggeredRows, differenceHeaders).
import { sig } from '@/app/utils/numberFormat';

/** highlight: Set of "row,col" keys to tint (e.g. the entries a formula uses). */
export default function DifferenceTable({ rows, headers, highlight = new Set() }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
      <table className="w-full text-center text-xs font-mono border-collapse text-black dark:text-white">
        <thead>
          <tr className="bg-neutral-200 dark:bg-neutral-900 font-bold border-b border-black/30 dark:border-neutral-700">
            {headers.map((h, j) => <th key={j} className="p-2 whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? 'border-t border-black/10 dark:border-neutral-800' : ''}>
              {r.map((v, j) => (
                <td key={j} className={`px-2 py-1 whitespace-nowrap ${j === 0 ? 'font-bold' : ''} ${highlight.has(`${i},${j}`) ? 'bg-[#FFE600]/30 dark:bg-amber-950/50 font-bold' : ''}`}>
                  {v === null ? '' : sig(v, 7)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
