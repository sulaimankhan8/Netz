import { notFound } from 'next/navigation';
import { isDatabaseConfigured } from '@/db';
import { readPublicNote } from '@/db/publicNotesStore';
import { isValidSlug } from '../../Notes/utils/publishCore';
import PublicNoteView from './PublicNoteView';
import '../../Notes/notes.css';

export const dynamic = 'force-dynamic';

async function load(slug, countView) {
  if (!isDatabaseConfigured() || !isValidSlug(slug)) return null;
  try {
    return await readPublicNote(slug, { countView });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const note = await load(slug, false);
  if (!note) return { title: 'Note not found | NETZ' };
  const description = (note.data?.subtitle && note.data.subtitle !== 'Click to add description...')
    ? note.data.subtitle
    : `A NETZ note by ${note.author.name}, with live solvers and quizzes.`;
  return {
    title: `${note.title} | NETZ`,
    description,
    openGraph: { title: note.title, description, type: 'article', url: `/p/${note.slug}`, siteName: 'NETZ' },
    twitter: { card: 'summary', title: note.title, description },
  };
}

/** /p/<slug>: a note its author published to the web (boards 11–12). Read only, but the solvers and quizzes work. */
export default async function PublicNotePage({ params }) {
  const { slug } = await params;
  const note = await load(slug, true);
  if (!note) notFound();
  return (
    <PublicNoteView
      note={{
        ...note,
        publishedAt: new Date(note.publishedAt).toISOString(),
        updatedAt: new Date(note.updatedAt).toISOString(),
      }}
    />
  );
}
