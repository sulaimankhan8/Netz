// The rates files and the GST / VAT engines: fixed cases, so a rate edit that breaks a page fails here.
// Run: npm run test:engines
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IN_RULES } from '../../src/app/data/rates/in.js';
import { VAT_COUNTRIES } from '../../src/app/data/rates/vat.js';
import { getRule, versions } from '../../src/app/utils/rates/getRule.js';
import { solve as gst, gstRule } from '../../src/app/utils/engines/gst.js';
import { solve as vat, vatRule } from '../../src/app/utils/engines/vat.js';

const near = (a, b, tol = 0.005) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);
const STATUSES = ['official', 'secondary', 'unverified'];

test('Rates files: every rule has a source, a check date and a status', () => {
  const all = [...IN_RULES, ...VAT_COUNTRIES.flatMap((c) => c.rules)];
  for (const r of all) {
    assert.match(r.source.url, /^https:\/\//, `${r.id} source url`);
    assert.match(r.source.verifiedOn, /^\d{4}-\d{2}-\d{2}$/, `${r.id} verifiedOn`);
    assert.ok(STATUSES.includes(r.source.status), `${r.id} status`);
  }
  // EU law: the standard rate is at least 15%
  for (const c of VAT_COUNTRIES.filter((x) => x.group === 'European Union')) {
    const s = c.rules[0].data.standard;
    assert.ok(s >= 15 && s <= 28, `${c.name} standard rate ${s}`);
  }
  assert.equal(VAT_COUNTRIES.filter((x) => x.group === 'European Union').length, 27);
});

test('Rates files: GST 2.0 starts on 22 Sep 2025', () => {
  const before = getRule(IN_RULES, 'in.gst.slabs', '2025-09-21').data.slabs.map((s) => s.rate);
  const after = getRule(IN_RULES, 'in.gst.slabs', '2025-09-22').data.slabs.map((s) => s.rate);
  assert.ok(before.includes(28) && !before.includes(40));
  assert.ok(after.includes(40) && !after.includes(28));
  assert.equal(getRule(IN_RULES, 'in.gst.slabs', '2016-01-01'), null);
  assert.equal(versions(IN_RULES, 'in.gst.slabs')[0].validFrom, '2025-09-22');
  assert.equal(gstRule('2026-11-03').data.defaultRate, 18);
});

test('GST: add and remove, CGST/SGST and IGST', () => {
  const add = gst({ amount: '50000', rate: '18', mode: 'add', supply: 'intra' });
  near(add.gst, 9000); near(add.total, 59000); near(add.cgst, 4500); near(add.sgst, 4500);
  const rem = gst({ amount: '59,000', rate: '18', mode: 'remove', supply: 'inter' });
  near(rem.base, 50000); near(rem.gst, 9000); near(rem.igst, 9000);
  assert.equal(rem.cgst, undefined);
  near(gst({ amount: '1000', rate: '40' }).total, 1400);
  near(gst({ amount: '1000', rate: '0.25' }).gst, 2.5);
  near(gst({ amount: '100', rate: '7.5' }).gst, 7.5); // the student's own rate
  assert.throws(() => gst({ amount: '100', rate: '120' }), (e) => e.name === 'EngineError');
  assert.throws(() => gst({ amount: '', rate: '18' }), (e) => e.name === 'EngineError' && /empty/.test(e.message));
});

test('VAT: add, remove and the "subtract 20%" mistake', () => {
  const uk = vatRule('GB', '2026-11-03');
  assert.equal(uk.data.standard, 20);
  const rem = vat({ amount: '240', rate: '20', mode: 'remove' });
  near(rem.net, 200); near(rem.tax, 40); near(rem.wrong, 192);
  const add = vat({ amount: '200', rate: '20', mode: 'add' });
  near(add.gross, 240); near(add.tax, 40);
  assert.equal(vatRule('JP').data.reduced[0].rate, 8);
  near(vat({ amount: '110', rate: '10', mode: 'remove', taxName: 'GST' }).net, 100);
  assert.throws(() => vatRule('XX'), (e) => e.name === 'EngineError');
});
