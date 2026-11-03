// Lets Node load app code the way Next.js does: imports without ".js", folder imports (index.js),
// and the "@/..." shortcut for src/. Loaded by register.mjs.
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const SRC = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../src');

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) specifier = pathToFileURL(path.join(SRC, specifier.slice(2))).href;
  try {
    return await next(specifier, context);
  } catch (err) {
    const local = specifier.startsWith('.') || specifier.startsWith('file:');
    if (!local || !['ERR_MODULE_NOT_FOUND', 'ERR_UNSUPPORTED_DIR_IMPORT'].includes(err.code)) throw err;
    for (const ending of ['.js', '/index.js']) {
      try { return await next(specifier + ending, context); } catch { /* try the next ending */ }
    }
    throw err;
  }
}
