// "Open in Notes" on a method page links to /Notes?method=<id>. This makes the new note: titled with the method's
// name, one line on what to do, and the page's live calculator as a widget block (the widget "Add a solver" inserts).
import { ALGORITHMS_CATALOG } from './algorithmRegistry';
import { methodById } from '@/app/data/methods';
import { createNewNote, saveSingleNote } from './noteStorage';

/** The Notes widget for a method page, matched by the page's route; null when that page has none. */
export function widgetForMethod(id) {
  const m = methodById(id);
  if (!m || m.status !== 'live') return null;
  const route = m.route.toLowerCase();
  return ALGORITHMS_CATALOG.find((a) => (a.route || '').toLowerCase() === route) || null;
}

/** Creates and saves the note; returns it, or null if the method has no widget. */
export function createMethodNote(id) {
  const m = methodById(id);
  const alg = widgetForMethod(id);
  if (!m || !alg) return null;
  const base = createNewNote();
  const t = Date.now();
  return saveSingleNote({
    ...base,
    title: m.name,
    subtitle: `Live calculator from the ${m.name} page`,
    blocks: [
      { id: `b-${t}-2`, type: 'paragraph', content: 'Change the numbers in the calculator below and press Calculate. Write your own working above or below it.' },
      { id: `b-${t}-3`, type: 'widget', content: alg.name, widgetConfig: { algorithmId: alg.id, params: alg.defaultParams } },
    ],
  });
}
