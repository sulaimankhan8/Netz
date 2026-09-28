'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FaParagraph, 
  FaHeading, 
  FaSquareRootAlt, 
  FaLightbulb, 
  FaCalculator, 
  FaCheck
} from 'react-icons/fa';

export default function SlashCommandMenu({ isOpen, query, onSelect, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);

  const mainItems = [
    {
      id: 'paragraph',
      title: 'Text / Paragraph',
      subtitle: 'Plain text notes and documentation',
      icon: <FaParagraph className="w-4 h-4 text-slate-400" />,
      type: 'paragraph'
    },
    {
      id: 'heading1',
      title: 'Heading 1',
      subtitle: '# Large section title',
      icon: <FaHeading className="w-4 h-4 text-blue-400" />,
      type: 'heading1'
    },
    {
      id: 'heading2',
      title: 'Heading 2',
      subtitle: '## Medium section title',
      icon: <FaHeading className="w-3.5 h-3.5 text-cyan-400" />,
      type: 'heading2'
    },
    {
      id: 'heading3',
      title: 'Heading 3',
      subtitle: '### Small section title',
      icon: <FaHeading className="w-3 h-3 text-indigo-400" />,
      type: 'heading3'
    },
    {
      id: 'math',
      title: 'LaTeX Math Formula',
      subtitle: '$$ Render KaTeX mathematical equations',
      icon: <FaSquareRootAlt className="w-4 h-4 text-purple-400" />,
      type: 'math'
    },
    {
      id: 'callout',
      title: 'Callout Box',
      subtitle: '💡 Key takeaway or important rule card',
      icon: <FaLightbulb className="w-4 h-4 text-amber-400" />,
      type: 'callout'
    },
    {
      id: 'widget-picker',
      title: 'Math Calculator Widget',
      subtitle: '🧮 Embed solvers (Bisection, Newton, Euler, Z-Test...)',
      icon: <FaCalculator className="w-4 h-4 text-indigo-400" />,
      type: 'open-picker'
    }
  ];

  const filteredItems = mainItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase())
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

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-0 top-full mt-1 z-[100] w-72 max-h-64 bg-white dark:bg-[#202020] border border-neutral-200 dark:border-[#333333] rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans text-neutral-900 dark:text-slate-100 animate-fadeIn"
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-neutral-200 dark:border-[#2e2e2e] bg-neutral-50 dark:bg-[#181818] flex items-center justify-between text-[11px] text-neutral-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
        <span>Slash Commands</span>
        <span className="text-[10px] text-neutral-400 dark:text-slate-500 font-mono">esc to close</span>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-notion-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-500 dark:text-slate-500">
            No block matching "/{query}"
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'bg-indigo-50 dark:bg-[#2e2e2e] text-indigo-700 dark:text-white font-medium' 
                    : 'hover:bg-neutral-100 dark:hover:bg-[#282828] text-neutral-700 dark:text-slate-300'
                }`}
              >
                <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-[#333333] shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold truncate">{item.title}</h4>
                  <p className="text-[10px] text-neutral-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                </div>
                {isSelected && <FaCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1 border-t border-neutral-200 dark:border-[#2e2e2e] bg-neutral-50 dark:bg-[#181818] text-[10px] text-neutral-500 dark:text-slate-500 flex items-center justify-between">
        <span>↑↓ Navigate</span>
        <span>↵ Select</span>
      </div>
    </div>
  );
}
