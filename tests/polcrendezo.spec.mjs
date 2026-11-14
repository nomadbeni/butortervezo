// #4: Polcrendező – arányos méretezés, szekrény-geometria, sorok, polc/oszlop műveletek, tárgyak, visszavonás, export.
import { test, expect } from '@playwright/test';
import { openApp, grabDownload } from './helpers.mjs';

test.beforeEach(async ({ page }, ti) => { ti.jsErr = await openApp(page, 'polcrendezo.html'); });
test.afterEach(async ({}, ti) => { expect(ti.jsErr).toEqual([]); });

/** a szekrény minden oszlopában: rekeszek + polcok + lábazat + munkalap = teljes magasság */
const geomOk = () => page => page.evaluate(() => __bt.S.c.list.every((c) => {
  const okW = Math.abs(c.cols.reduce((s, k) => s + k.w, 0) + (c.cols.length + 1) * c.t - c.W) < 0.06;
  const okH = c.cols.every((k) => Math.abs(k.rows.reduce((s, r) => s + r.h, 0) + (k.rows.length + 1) * c.t + c.pl + c.top - c.H) < 0.06);
  return okW && okH;
}));

test('fit: arányos elosztás, rögzített és szerkesztett elem megtartása, kerekítés', async ({ page }) => {
  const r = await page.evaluate(() => {
    const a = [{ h: 10 }, { h: 20 }, { h: 30 }]; __bt.fit(a, 'h', 120); const r1 = a.map((x) => x.h);
    const b = [{ h: 10, lock: 1 }, { h: 20 }, { h: 30 }]; __bt.fit(b, 'h', 70); const r2 = b.map((x) => x.h);
    const c = [{ h: 50 }, { h: 20 }, { h: 30 }]; __bt.fit(c, 'h', 100, 0); const r3 = c.map((x) => x.h);
    const d = [{ h: 1 }, { h: 1 }, { h: 1 }]; __bt.fit(d, 'h', 100); const r4 = d.map((x) => x.h);
    const e = [{ h: 90 }, { h: 10 }]; __bt.fit(e, 'h', 20, 0); const r5 = e.map((x) => x.h); // a többinek is marad minimum 3 cm
    return { r1, r2, r3, r4, sum4: r4.reduce((s, x) => s + x, 0), r5 };
  });
  expect(r.r1).toEqual([20, 40, 60]);
  expect(r.r2).toEqual([10, 24, 36]);
  expect(r.r3).toEqual([50, 20, 30]);
  expect(r.sum4).toBeCloseTo(100, 6);
  expect(r.r5).toEqual([17, 3]);
});

test('minden méret-sablon geometriája zárt', async ({ page }) => {
  const r = await page.evaluate(() => {
    const out = [];
    for (const [type, list] of Object.entries(__bt.PRE)) list.forEach(([n], i) => {
      const c = __bt.mkCab(type, i);
      const okH = c.cols.every((k) => Math.abs(k.rows.reduce((s, r) => s + r.h, 0) + (k.rows.length + 1) * c.t + c.pl + c.top - c.H) < 0.06 && k.rows.every((r) => r.h >= 3));
      const okW = Math.abs(c.cols.reduce((s, k) => s + k.w, 0) + (c.cols.length + 1) * c.t - c.W) < 0.06;
      out.push([n, okH && okW]);
    });
    return out;
  });
  expect(r.length).toBeGreaterThan(10);
  for (const [n, ok] of r) expect(ok, n).toBe(true);
});

test('magasság módosítása: a polcközök arányosan változnak, a lakattal rögzített nem', async ({ page }) => {
  await page.locator('[data-act="pick"]').filter({ hasText: 'Fürdőszoba' }).click();
  await page.locator('#pr_cv [data-cell]').nth(1).click();
  await page.locator('[data-act="rlock"]').click();
  const before = await page.evaluate(() => { const c = __bt.S.c.list.find((x) => x.id === __bt.S.c.sel); return c.cols[0].rows.map((r) => r.h); });
  await page.fill('#cf_H', '200'); await page.press('#cf_H', 'Enter');
  await expect.poll(() => page.evaluate(() => __bt.S.c.list.find((x) => x.id === __bt.S.c.sel).H)).toBe(200);
  const after = await page.evaluate(() => __bt.S.c.list.find((x) => x.id === __bt.S.c.sel).cols[0].rows.map((r) => r.h));
  expect(after[1]).toBe(before[1]);
  const ratioB = before[0] / before[2], ratioA = after[0] / after[2];
  expect(Math.abs(ratioA - ratioB)).toBeLessThan(0.02);
  expect(await geomOk()(page)).toBe(true);
});

test('polcszám, oszlopszám, polc beszúrása és eltávolítása: a tárgyak és a geometria megmaradnak', async ({ page }) => {
  const count = () => page.evaluate(() => __bt.S.c.list.reduce((s, c) => s + c.cols.reduce((t, k) => t + k.rows.reduce((u, r) => u + r.items.length, 0), 0), 0));
  const n0 = await count();
  await page.locator('[data-act="pick"]').filter({ hasText: 'ruhásszekrény' }).click();
  await page.locator('#pr_cv [data-cell]').first().click();
  await page.fill('#cl_n', '2'); await page.press('#cl_n', 'Enter');
  await expect.poll(() => page.evaluate(() => __bt.S.c.list.find((x) => x.id === __bt.S.c.sel).cols[0].rows.length)).toBe(3);
  await page.fill('#cf_nc', '1'); await page.press('#cf_nc', 'Enter');
  await expect.poll(() => page.evaluate(() => __bt.S.c.list.find((x) => x.id === __bt.S.c.sel).cols.length)).toBe(1);
  await page.locator('#pr_cv [data-cell]').first().click();
  await page.locator('[data-act="rsplit"]').click();
  await page.locator('[data-act="rmerge"]').click();
  expect(await count()).toBe(n0);
  expect(await geomOk()(page)).toBe(true);
});

test('tárgyak: pontosvesszős felvitel, vessző a névben marad; áthúzás másik rekeszbe; visszavonás', async ({ page }) => {
  await page.locator('[data-act="pick"]').filter({ hasText: 'Fürdőszoba' }).click();
  await page.locator('#pr_cv [data-cell]').first().click();
  await page.fill('#pr_new', 'Kávé, tea; Cukor'); await page.press('#pr_new', 'Enter');
  const names = await page.evaluate(() => __bt.S.c.list.find((x) => x.id === __bt.S.c.sel).cols[0].rows[0].items.map((i) => i.n));
  expect(names.slice(-2)).toEqual(['Kávé, tea', 'Cukor']);
  await page.evaluate(() => { document.activeElement.blur(); const r = document.querySelector('#pr_cv').getBoundingClientRect(); window.scrollBy(0, r.top - 10); });
  const it = page.locator('#pr_cv [data-it]').first(), cell = page.locator('#pr_cv [data-cell]').last();
  const a = await it.boundingBox(), b = await cell.boundingBox();
  await page.mouse.move(a.x + 30, a.y + a.height / 2); await page.mouse.down();
  await page.mouse.move(a.x + 50, a.y + 30, { steps: 4 }); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 }); await page.mouse.up();
  await expect(page.locator('#toast')).toContainText('→');
  const last = () => page.evaluate(() => { const r = __bt.S.c.list.find((x) => x.id === __bt.S.c.sel).cols[0].rows; return r[r.length - 1].items.length; });
  const moved = await last();
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Control+z');
  expect(await last()).toBe(moved - 1);
  await page.keyboard.press('Control+y');
  expect(await last()).toBe(moved);
});

test('szekrénysor: 7 × 40 cm, falra szerelt szekrény kikerüli a magas álló szekrényt', async ({ page }) => {
  await page.selectOption('#pr_add', 'row');
  await page.fill('#rn_name', 'Teszt'); await page.selectOption('#rn_pre', 'konyha:4'); await page.fill('#rn_n', '7'); await page.fill('#rn_w', '40');
  await page.locator('[data-act="rowmake"]').click();
  await expect(page.locator('#toast')).toContainText('összesen 280 cm');
  await page.selectOption('#g_add', 'konyha:6');   // kamraszekrény 210 cm, a sor végére kerül
  for (let i = 0; i < 7; i++) await page.locator('[data-act="cleft"]').click();   // a sor elejére
  await page.selectOption('#g_add', 'konyha:5');   // felső 40, alsó éle 145 cm-en
  const r = await page.evaluate(() => { const g = __bt.S.c.list.find((x) => x.id === __bt.S.c.sel).g, L = __bt.rowLayout(g);
    const tall = L.st.find((c) => c.H === 210), wall = L.wl[0], pt = L.pos.get(tall.id), pw = L.pos.get(wall.id);
    return { n: L.cs.length, W: L.W, wallX: pw.x, tallEnd: pt.x + tall.W, wallY: pw.y }; });
  expect(r).toEqual({ n: 9, W: 340, wallX: 60, tallEnd: 60, wallY: 145 });   // a 210 cm-es kamra mellé, nem elé
  expect(await page.locator('#pr_cv [data-cab]').count()).toBe(9);
});

test('export: CSV leltár, PDF oldalak, biztonságos fájlnév', async ({ page }) => {
  await page.evaluate(() => { __bt.S.p.proj = 'Lakás/2026: konyha?'; });
  expect(await page.evaluate(() => __bt.fileBase())).toBe('Lakás2026_konyha');
  await page.evaluate(() => { __bt.S.p.proj = 'Lakas 2026'; });
  const csv = await grabDownload(page, () => page.evaluate(() => __bt.exportCSV()));
  expect(csv.name).toBe('Lakas_2026_leltar.csv');
  const text = csv.buf.toString('utf8');
  expect(text.charCodeAt(0)).toBe(0xfeff);
  const rows = text.slice(1).split('\r\n');
  expect(rows[0]).toBe('Sor;Szekrény;Típus;Rekesz;Fajta;Belméret (sz × m, cm);Tárgy;Mennyiség');
  expect(rows.some((r) => r.startsWith('Konyha;') && r.includes('Poharak;12'))).toBe(true);
  await page.evaluate(() => { window.print = () => {}; __bt.exportPDF(); });
  const pages = await page.locator('#rep .pg').count();
  const expected = await page.evaluate(() => __bt.S.c.groups.length + __bt.S.c.list.length);
  expect(pages).toBe(expected);
});
