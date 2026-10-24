'use client';

import { useState, useEffect, useRef } from 'react';
import { OFFERED_BLOCK_TYPES as BLOCK_TYPES } from '../utils/blockTypes';

/**
 * The / menu: the same blocks, names, icons and colours as the Add block grid
 * (utils/blockTypes.js). Arrow keys move, Enter adds, Escape closes.
 */
export default function SlashCommandMenu({ isOpen, query, onSelect, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);

  const q = query.toLowerCase();
  const filteredItems = BLOCK_TYPES.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.hint.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.keywords.includes(q)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation (Arrow Up, Arrow Down, Enter, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelect, onClose]);

  // Keep the highlighted row in view
  useEffect(() => {
    menuRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="listbox"
      aria-label="Blocks"
      className="absolute left-0 top-full mt-1 z-[100] w-[min(340px,calc(100vw-40px))] max-h-80 flex flex-col bg-nt-surface border border-nt-line rounded-2xl shadow-nt-menu overflow-hidden text-nt-ink"
    >
      <div className="px-3.5 pt-2.5 pb-1 text-xs font-semibold text-nt-text2">Blocks</div>

      <div className="flex-1 overflow-y-auto px-1.5 pb-1.5 custom-notion-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-sm text-nt-text2">No block matches &quot;/{query}&quot;</div>
        ) : (
          filteredItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-selected={isSelected}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center gap-3 px-2.5 min-h-[48px] rounded-xl text-left transition-colors ${isSelected ? 'bg-nt-tray' : ''}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.tile}`} aria-hidden="true">
                  <item.Icon className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-medium truncate">{item.name}</span>
                  <span className="block text-xs text-nt-text2 truncate">{item.hint}</span>
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="hidden [@media(pointer:fine)]:flex px-3.5 py-2 border-t border-nt-line text-xs text-nt-text2 justify-between">
        <span>↑ ↓ to move · Enter to add</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
}
