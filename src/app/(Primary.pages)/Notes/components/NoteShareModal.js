'use client';

import { useState } from 'react';
import { 
  FaTimes, 
  FaShareAlt, 
  FaKey, 
  FaCopy, 
  FaCheck, 
  FaGlobe, 
  FaLock, 
  FaFileImport 
} from 'react-icons/fa';

export default function NoteShareModal({
  note,
  isOpen,
  onClose,
  onUpdateNote,
  onImportKey
}) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [importInputKey, setImportInputKey] = useState('');
  const [importStatus, setImportStatus] = useState(null);

  if (!isOpen || !note) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/Notes?key=${note.accessKey}`
    : `https://netz.app/Notes?key=${note.accessKey}`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(note.accessKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTogglePublic = () => {
    onUpdateNote({ ...note, isPublic: !note.isPublic });
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!importInputKey.trim()) return;
    const result = onImportKey(importInputKey.trim());
    if (result) {
      setImportStatus({ success: true, message: `Successfully imported "${result.title}"!` });
      setImportInputKey('');
    } else {
      setImportStatus({ success: false, message: 'Invalid or missing Access Key.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-900 dark:text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-slate-800 bg-neutral-50/80 dark:bg-slate-950/50">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold">
            <FaShareAlt className="w-4 h-4" />
            <span>Note Sharing & Community Access</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Public / Private Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-slate-950/80 border border-neutral-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-lg ${note.isPublic ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-200 text-neutral-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                {note.isPublic ? <FaGlobe className="w-5 h-5" /> : <FaLock className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                  {note.isPublic ? 'Public Note (Shared)' : 'Private Note (Only You)'}
                </p>
                <p className="text-xs text-neutral-500 dark:text-slate-400">
                  {note.isPublic
                    ? 'Anyone with your 8-digit key can view or import this note.'
                    : 'Visible only on this local browser session.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                note.isPublic
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {note.isPublic ? 'Public' : 'Make Public'}
            </button>
          </div>

          {/* Access Key & Direct Share Link */}
          {note.isPublic && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
                  <FaKey className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  <span>Unique Access Key</span>
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-neutral-100 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/50 rounded-xl px-4 py-2 text-base font-mono font-bold text-indigo-700 dark:text-indigo-300 tracking-wider">
                    {note.accessKey}
                  </div>
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    {copiedKey ? <FaCheck className="w-3.5 h-3.5" /> : <FaCopy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-slate-400 mb-1.5">Direct Web Link</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-neutral-100 dark:bg-slate-950 border border-neutral-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-800 dark:text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center space-x-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                  >
                    {copiedLink ? <FaCheck className="w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import Note Form */}
          <div className="pt-4 border-t border-neutral-200 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-neutral-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
              <FaFileImport className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Import Shared Note by Access Key</span>
            </h4>
            <form onSubmit={handleImportSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="e.g. NETZ-8X42"
                value={importInputKey}
                onChange={(e) => setImportInputKey(e.target.value)}
                className="flex-1 bg-neutral-50 dark:bg-slate-950 border border-neutral-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
              >
                Import
              </button>
            </form>

            {importStatus && (
              <p
                className={`mt-2 text-xs font-medium ${
                  importStatus.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {importStatus.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
