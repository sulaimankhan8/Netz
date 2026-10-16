/**
 * The visual equation editor (MathLive) writes short LaTeX: \frac12 for one half, \sqrt2 for
 * the root of two. The rest of the Playground (graphs, "=" answers, the maths helpers) reads the
 * long form, \frac{1}{2}. This writes the braces out; anything else is left exactly as it is.
 */

const TWO_ARGS = new Set(['frac', 'dfrac', 'tfrac', 'cfrac', 'binom', 'dbinom', 'tbinom']);
const ONE_ARG = new Set(['sqrt']);

/** Reads one argument at `i`: a {group}, a \command, or a single character. */
function readArgument(s, i) {
  let j = i;
  while (j < s.length && s[j] === ' ') j++;
  if (j >= s.length) return null;
  if (s[j] === '{') {
    let depth = 0;
    for (let k = j; k < s.length; k++) {
      if (s[k] === '\\') {
        k++;
        continue;
      }
      if (s[k] === '{') depth++;
      if (s[k] === '}') {
        depth--;
        if (depth === 0) return { text: s.slice(j, k + 1), end: k + 1, braced: true };
      }
    }
    return null;
  }
  if (s[j] === '\\') {
    const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(j));
    return m ? { text: m[0], end: j + m[0].length, braced: false } : null;
  }
  return { text: s[j], end: j + 1, braced: false };
}

/**
 * An empty box the editor leaves in a template (\placeholder{} — a matrix not filled in yet)
 * drawn as a square, the way Word and WPS show an empty box; KaTeX does not know \placeholder.
 * A placeholder with something in it shows what is in it.
 */
export function showPlaceholders(latex) {
  return String(latex || '').replace(/\\placeholder(?:\[[^\]]*\])?\{([^{}]*)\}/g, (_, inside) => (inside.trim() ? `{${inside}}` : '\\square'));
}

export function expandCompactLatex(latex) {
  const s = String(latex || '');
  let out = '';
  let i = 0;
  while (i < s.length) {
    const m = s[i] === '\\' ? /^\\([a-zA-Z]+)/.exec(s.slice(i)) : null;
    if (!m || (!TWO_ARGS.has(m[1]) && !ONE_ARG.has(m[1]))) {
      // Keep escaped characters (\{, \%) together
      if (s[i] === '\\' && i + 1 < s.length && !m) {
        out += s.slice(i, i + 2);
        i += 2;
        continue;
      }
      if (m) {
        out += m[0];
        i += m[0].length;
        continue;
      }
      out += s[i];
      i++;
      continue;
    }
    let j = i + m[0].length;
    let command = m[0];
    // \sqrt[n] keeps its index
    if (m[1] === 'sqrt') {
      let k = j;
      while (k < s.length && s[k] === ' ') k++;
      if (s[k] === '[') {
        const close = s.indexOf(']', k);
        if (close > 0) {
          command += s.slice(k, close + 1);
          j = close + 1;
        }
      }
    }
    const count = TWO_ARGS.has(m[1]) ? 2 : 1;
    const args = [];
    for (let a = 0; a < count; a++) {
      const arg = readArgument(s, j);
      if (!arg) break;
      args.push(arg.braced ? `{${expandCompactLatex(arg.text.slice(1, -1))}}` : `{${arg.text}}`);
      j = arg.end;
    }
    if (args.length < count) {
      // Not a complete command (still being typed): leave it as written
      out += s.slice(i, j);
    } else {
      out += command + args.join('');
    }
    i = j;
  }
  return out;
}
