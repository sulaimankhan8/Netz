/**
 * A small ZIP writer (files stored, not compressed): enough to hand over a .tex file with its
 * pictures. Pure, works in the browser and in Node (test_note_exports.mjs).
 *
 *   const bytes = makeZip([{ name: 'note.tex', data: 'text…' }, { name: 'images/1.png', data: Uint8Array }]);
 */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const encoder = new TextEncoder();

/** @param {Array<{ name: string, data: string|Uint8Array }>} files @returns {Uint8Array} */
export function makeZip(files) {
  const entries = files.map((f) => {
    const name = encoder.encode(f.name);
    const data = typeof f.data === 'string' ? encoder.encode(f.data) : f.data;
    return { name, data, crc: crc32(data) };
  });
  const now = new Date();
  const time = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const date = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  const chunks = [];
  const central = [];
  let offset = 0;
  for (const e of entries) {
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // names are UTF-8
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, time, true);
    local.setUint16(12, date, true);
    local.setUint32(14, e.crc, true);
    local.setUint32(18, e.data.length, true);
    local.setUint32(22, e.data.length, true);
    local.setUint16(26, e.name.length, true);
    local.setUint16(28, 0, true);
    chunks.push(new Uint8Array(local.buffer), e.name, e.data);

    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(8, 0x0800, true);
    cd.setUint16(10, 0, true);
    cd.setUint16(12, time, true);
    cd.setUint16(14, date, true);
    cd.setUint32(16, e.crc, true);
    cd.setUint32(20, e.data.length, true);
    cd.setUint32(24, e.data.length, true);
    cd.setUint16(28, e.name.length, true);
    cd.setUint32(42, offset, true);
    central.push(new Uint8Array(cd.buffer), e.name);
    offset += 30 + e.name.length + e.data.length;
  }
  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  const all = [...chunks, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((s, c) => s + c.length, 0));
  let at = 0;
  for (const c of all) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

/** Bytes of a data: URL (base64 or text). */
export function dataUrlBytes(dataUrl) {
  const m = /^data:([^;,]*)(;base64)?,(.*)$/s.exec(String(dataUrl || ''));
  if (!m) return null;
  if (m[2]) {
    const bin = typeof atob === 'function' ? atob(m[3]) : Buffer.from(m[3], 'base64').toString('binary');
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { mime: m[1], bytes };
  }
  return { mime: m[1], bytes: encoder.encode(decodeURIComponent(m[3])) };
}
