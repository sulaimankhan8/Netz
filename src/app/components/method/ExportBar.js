'use client';

import EditorialExportButton from '@/app/components/editorial/EditorialExportButton';
import { useCodeExportInputs } from '@/app/utils/codeExport/inputs';
import { methodById } from '@/app/data/methods';

/**
 * For calculators that are not SymbolicCalculator: shares the inputs the page just solved with the Export
 * menu (so its Code tab writes the same problem) and returns the Export button for the answer box.
 * getRaw must return exactly what the page passed to its engine. The calculator's outer element should carry
 * id={`netz-solve-${id}`} so the picture exports capture it.
 */
export function useExportBar(id, getRaw, hasAnswer, fallbackTitle = null) {
  const name = methodById(id)?.name || fallbackTitle || 'NETZ';
  useCodeExportInputs(id, () => (hasAnswer ? getRaw() : null), name);
  return (
    <div className="flex justify-end -mt-1 mb-2">
      <EditorialExportButton title={name} elementId={`netz-solve-${id}`} size="sm" />
    </div>
  );
}
