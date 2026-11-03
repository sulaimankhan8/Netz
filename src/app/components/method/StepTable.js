// Exam-style table for worked examples (iterations, difference tables, sums).

/**
 * columns: [{ key, label, bold?, highlight? }]   rows: [{ [key]: value }]
 * `bold` makes a column's cells bold; `highlight` gives them the yellow "answer" tint.
 */
export function StepTable({ columns, rows, rowKey = (row, i) => i }) {
  const last = columns.length - 1;
  const cellClass = (c, i) => [
    'p-2.5',
    i < last && 'border-r border-black/15 dark:border-neutral-700',
    (c.bold || c.highlight) && 'font-bold',
    c.highlight && 'bg-[#FFE600]/20 dark:bg-amber-950/40',
  ].filter(Boolean).join(' ');

  return (
    <div className="overflow-x-auto rounded-xl border border-black/30 dark:border-neutral-700">
      <table className="w-full text-center text-xs font-mono border-collapse">
        <thead>
          <tr className="bg-neutral-200 dark:bg-neutral-900 text-black dark:text-white border-b border-black/30 dark:border-neutral-700 font-bold">
            {columns.map((c, i) => (
              <th key={c.key} className={i < last ? 'p-2.5 border-r border-black/20 dark:border-neutral-700' : 'p-2.5'}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={rowKey(row, r)} className="hover:bg-neutral-50 dark:hover:bg-neutral-900 border-t border-black/15 dark:border-neutral-700">
              {columns.map((c, i) => (
                <td key={c.key} className={cellClass(c, i)}>{row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
