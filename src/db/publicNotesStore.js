import 'server-only';
import { and, eq, sql } from 'drizzle-orm';
import { getDb } from './index';
import { profiles, progress, publicNotes } from './schema';
import { canPublishMore, makeSlug, preparePublicCopy } from '@/app/(Primary.pages)/Notes/utils/publishCore';
import { publicNoteLimit } from '@/app/utils/proLimits';
import { getProStatus } from './billingStore';
import { reduceActivity } from '@/app/utils/progress/engine';
import { dayAt } from '@/app/utils/progress/syncCore';
import { equippedBanner, equippedSkin } from '@/app/utils/progress/shop';

const row = (r) => ({ noteId: r.noteId, slug: r.slug, title: r.title, publishedAt: r.publishedAt, updatedAt: r.updatedAt, views: r.views });

/** The student's published notes, newest first. */
export async function listPublished(userId) {
  const rows = await getDb().select().from(publicNotes).where(eq(publicNotes.userId, userId));
  return rows.map(row).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

/**
 * Publishes a note, or updates its public copy if it is already published. Also counts the
 * "Publish a note" task on the server copy of the student's progress.
 */
export async function publishNote(userId, note, tz) {
  const copy = preparePublicCopy(note);
  if (!copy.ok) return copy;
  const { pro } = await getProStatus(userId);
  const limit = publicNoteLimit(pro);

  return getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`publish:${userId}`}))`);
    const mine = await tx.select().from(publicNotes).where(eq(publicNotes.userId, userId));
    if (!canPublishMore(mine.map((m) => m.noteId), copy.noteId, limit)) {
      return { ok: false, error: 'limit_reached', used: mine.length, limit };
    }

    let saved;
    const existing = mine.find((m) => m.noteId === copy.noteId);
    if (existing) {
      [saved] = await tx.update(publicNotes)
        .set({ title: copy.title, data: copy.data, updatedAt: sql`now()` })
        .where(and(eq(publicNotes.userId, userId), eq(publicNotes.noteId, copy.noteId)))
        .returning();
    } else {
      for (let attempt = 0; attempt < 5 && !saved; attempt++) {
        [saved] = await tx.insert(publicNotes)
          .values({ slug: makeSlug(copy.title), userId, noteId: copy.noteId, title: copy.title, data: copy.data })
          .onConflictDoNothing({ target: publicNotes.slug })
          .returning();
      }
      if (!saved) return { ok: false, error: 'try_again' };
    }

    // Task 50: counted here, where publishing really happened
    let state = null;
    const [p] = await tx.select().from(progress).where(eq(progress.userId, userId)).for('update');
    if (p) {
      state = p.state;
      const now = Date.now();
      reduceActivity(state, 'note.published', { slug: saved.slug }, now, dayAt(now, tz), { pro });
      await tx.update(progress).set({ state, updatedAt: sql`now()` }).where(eq(progress.userId, userId));
    }

    return { ok: true, note: row(saved), used: mine.length + (existing ? 0 : 1), limit, state };
  });
}

export async function unpublishNote(userId, noteId) {
  const deleted = await getDb().delete(publicNotes)
    .where(and(eq(publicNotes.userId, userId), eq(publicNotes.noteId, String(noteId || ''))))
    .returning({ slug: publicNotes.slug });
  return { ok: deleted.length > 0 };
}

/**
 * A published note for /p/<slug>, with what the page shows about its author (name, robot, banner,
 * medal count). Counts one view. Null when there is no such note.
 */
export async function readPublicNote(slug, { countView = true } = {}) {
  const db = getDb();
  const [note] = await db.select().from(publicNotes).where(eq(publicNotes.slug, slug));
  if (!note) return null;
  const [author] = await db.select().from(profiles).where(eq(profiles.id, note.userId));
  const [p] = await db.select({ state: progress.state }).from(progress).where(eq(progress.userId, note.userId));
  if (countView) await db.update(publicNotes).set({ views: sql`${publicNotes.views} + 1` }).where(eq(publicNotes.slug, slug));
  return {
    slug: note.slug,
    title: note.title,
    data: note.data,
    publishedAt: note.publishedAt,
    updatedAt: note.updatedAt,
    author: {
      name: author?.displayName || 'A NETZ student',
      robotName: author?.robotName || '',
      medals: p?.state?.medals ? Object.keys(p.state.medals).length : 0,
      banner: p?.state ? equippedBanner(p.state) : undefined,
      skin: p?.state ? equippedSkin(p.state) : undefined,
    },
  };
}
