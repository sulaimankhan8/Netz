'use client';

import React, { memo } from 'react';
import TableEditor from '@/app/components/table/TableEditor';
import { sanitizeTable } from '../../../Notes/utils/importSafety';

/**
 * A table on the page (Insert > Table; NOTES_HANDWRITING_EXPORT_TABLES_PLAN.md, step 6). It uses
 * the same data and editor as the Notes Table block, so tables move between them unchanged.
 * At rest it shows the table; Edit (or a double-click) lets you type in the cells.
 */
function TableBlock({ block, onUpdateContent, isEditing }) {
  const table = sanitizeTable(block.content?.table);
  return (
    <div className="w-full h-full overflow-auto" data-table-block onPointerDown={isEditing ? (e) => e.stopPropagation() : undefined}>
      <TableEditor
        table={table}
        readOnly={!isEditing}
        tone="pg"
        compact
        label="Table"
        onChange={(next) => onUpdateContent?.(block.blockId, { table: next })}
      />
    </div>
  );
}

export default memo(TableBlock);
