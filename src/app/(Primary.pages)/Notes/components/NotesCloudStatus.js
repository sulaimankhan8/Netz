'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LuCloud, LuCloudOff } from 'react-icons/lu';
import useAccount from '@/app/utils/progress/useAccount';
import { NOTES_SYNCED_EVENT, notesCloudStatus } from '../utils/notesCloud';

/** One line under the notes list: where the notes are kept (this device, or also the account). */
export default function NotesCloudStatus({ isPhone }) {
  const { configured, user, loading } = useAccount();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const refresh = () => setStatus(notesCloudStatus());
    refresh();
    window.addEventListener(NOTES_SYNCED_EVENT, refresh);
    return () => window.removeEventListener(NOTES_SYNCED_EVENT, refresh);
  }, [user]);

  if (!configured || loading || !status) return null;
  const pad = isPhone ? 'px-5 py-3' : 'px-3 py-2.5';

  if (!user) {
    return (
      <div className={`flex items-center gap-2 border-t border-nt-line text-[13px] text-nt-text2 ${pad}`}>
        <LuCloudOff className="h-4 w-4 flex-none" aria-hidden="true" />
        <span className="min-w-0 flex-1">On this device only.</span>
        <Link href="/Profile" className="font-semibold text-nt-accent hover:underline">Sign in to save</Link>
      </div>
    );
  }

  const over = status.overLimit.length;
  return (
    <div className={`flex flex-col gap-0.5 border-t border-nt-line text-[13px] text-nt-text2 ${pad}`} role="status">
      <span className="flex items-center gap-2">
        <LuCloud className="h-4 w-4 flex-none" aria-hidden="true" />
        Saved to your account · {status.limit === null ? `${status.inCloud} in the cloud` : `${status.inCloud} of ${status.limit} in the cloud`}
      </span>
      {over > 0 && (
        <span className="pl-6">{over} {over === 1 ? 'note stays' : 'notes stay'} on this device only (free limit {status.limit}).</span>
      )}
    </div>
  );
}
