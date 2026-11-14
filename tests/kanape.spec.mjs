// #4: Kanapé-tervező – számítások, sablonok, mozgatás/átméretezés/rács, visszavonás, export.
import { test, expect } from '@playwright/test';
import { openApp, grabDownload, importFile } from './helpers.mjs';

test.beforeEach(async ({ page }, ti) => { ti.jsErr = await openApp(page, 'kanape.html'); });
test.afterEach(async ({}, ti) => { expect(ti.jsErr).toEqual([]); });

test('méretszámítások a minta sarokkanapén: befoglaló méret, perem, ülőfelület, átfedés', async ({ page }) => {
  const r = await page.evaluate(() => ({ bb: __bt.bbox(__bt.S.b.items), trim: __bt.trimLen(), area: __bt.seatArea(), ov: __bt.overlaps() }));
  expect(r.bb).toEqual({ x0: 0, y0: 0, x1: 185, y1: 325 });
  expect(r.trim).toBeCloseTo(6.49, 6);       // 165 + 299 + 185 cm perem
  expect(r.area).toBeCloseTo(3.787, 6);      // 150×90 + 80×124 + 170×85 cm²
  expect(r.ov).toEqual([]);
});

test('átfedés felismerése, csak érintkező elemek nem számítanak', async ({ page }) => {
  const r = await page.evaluate(() => {
    const it = __bt.S.b.items; const n0 = __bt.overlaps().length;
    it.push({ id: 'a1', name: 'Érintő', type: 'seat', x: 185, y: 0, w: 10, h: 10, dw: 0, dh: 0, tab: [] });
    const n1 = __bt.overlaps().length;
    it.push({ id: 'a2', name: 'Átfedő', type: 'seat', x: 10, y: 20, w: 10, h: 10, dw: 0, dh: 0, tab: [] });
    return [n0, n1, __bt.overlaps()];
  });
  expect(r[0]).toBe(0); expect(r[1]).toBe(0);
  expect(r[2].length).toBeGreaterThan(0);
  expect(r[2].join(' ')).toContain('Átfedő');
});

test('rácshoz és élekhez igazítás (snapMove, snapE)', async ({ page }) => {
  const r = await page.evaluate(() => [
    __bt.snapMove(12.4, 10, [], 1, 5), __bt.snapMove(12.4, 10, [22.9], 1, 5), __bt.snapMove(12.4, 10, [13], 1, 5),
    __bt.snapE(47, [], 1, 10), __bt.snapE(47, [47.6], 1, 10), __bt.snapE(-3, [], 1, 5)]);
  expect(r).toEqual([10, 12.9, 13, 50, 47.6, -5]);
});

test('minden sablon betölthető, véges méretekkel', async ({ page }) => {
  const keys = await page.evaluate(() => Object.keys(__bt.TPL));
  expect(keys.length).toBeGreaterThanOrEqual(4);
  for (const k of keys) {
    const r = await page.evaluate((k) => { __bt.loadTpl(k); const it = __bt.S.b.items; const bb = __bt.bbox(it); return { n: it.length, fin: [bb.x0, bb.y0, bb.x1, bb.y1].every(Number.isFinite), ids: new Set(it.map((b) => b.id)).size }; }, k);
    expect(r.n).toBeGreaterThan(0); expect(r.fin).toBe(true); expect(r.ids).toBe(r.n);
  }
});

test('mozgatás nyilakkal a rács lépésközével, Shift-tel 1 cm-rel; visszavonás és újra', async ({ page }) => {
  await page.locator('#kp_list [data-act="pick"]').nth(2).click();
  const x0 = await page.evaluate(() => __bt.S.b.items[2].x);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Shift+ArrowRight');
  expect(await page.evaluate(() => __bt.S.b.items[2].x)).toBe(x0 + 6);
  await page.keyboard.press('Control+z');
  expect(await page.evaluate(() => __bt.S.b.items[2].x)).toBe(x0 + 5);
  await page.keyboard.press('Control+z');
  expect(await page.evaluate(() => __bt.S.b.items[2].x)).toBe(x0);
  await page.keyboard.press('Control+y');
  expect(await page.evaluate(() => __bt.S.b.items[2].x)).toBe(x0 + 5);
});

test('egérrel mozgatás és átméretezés a rácsra igazodik', async ({ page }) => {
  await importFile(page, '#kp_file', { app: 'kanape', b: { items: [{ name: 'Q', type: 'seat', x: 0, y: 0, w: 100, h: 100 }] } });
  await expect(page.locator('#toast')).toContainText('Betöltve');
  const rect = page.locator('#kp_cv [data-id]').first();
  const bb = await rect.boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down();
  await page.mouse.move(bb.x + bb.width / 2 + 40, bb.y + bb.height / 2 + 25, { steps: 8 }); await page.mouse.up();
  const m = await page.evaluate(() => __bt.S.b.items[0]);
  expect(m.x).toBeGreaterThan(0); expect(m.x % 5).toBe(0); expect(m.y % 5).toBe(0); expect([m.w, m.h]).toEqual([100, 100]);
  const h = page.locator('#kp_cv [data-h="e"]');
  await expect(h).toHaveCount(1);
  const hb = await h.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2 + 60, hb.y + hb.height / 2, { steps: 8 }); await page.mouse.up();
  const r = await page.evaluate(() => __bt.S.b.items[0]);
  expect(r.w).toBeGreaterThan(100); expect((r.x + r.w) % 5).toBe(0); expect(r.h).toBe(100); expect(r.x).toBe(m.x);
});

test('exportok: PNG tartalom és biztonságos fájlnév', async ({ page }) => {
  await page.evaluate(() => { __bt.S.p.proj = 'Nagy kanapé / 2026: "teszt"?'; });
  expect(await page.evaluate(() => __bt.fileBase())).toBe('Nagy_kanapé_2026_teszt');
  expect(await page.evaluate(() => [__bt.safeName(''), __bt.safeName('../../etc'), __bt.safeName('<b>')])).toEqual(['export', 'etc', 'b']);
  // letöltés ékezet nélküli névvel (headless Chromiumban a nem ASCII blob-letöltési név „download” lesz)
  await page.evaluate(() => { __bt.S.p.proj = 'Nagy kanape / 2026'; });
  await page.locator('nav.side [data-tab="sheet"]').click();
  const png = await grabDownload(page, () => page.locator('[data-act="png"]').first().click());
  expect(png.name).toBe('Nagy_kanape_2026.png');
  expect(png.buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  const svg = await grabDownload(page, () => page.locator('[data-act="svg"]').first().click());
  expect(svg.name).toMatch(/\.svg$/); expect(svg.buf.toString()).toContain('<svg');
});
