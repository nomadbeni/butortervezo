// #2 és #3: biztonságos JSON-import mindkét appban.
import { test, expect } from '@playwright/test';
import { openApp, importFile, state, toast, XSS, grabDownload } from './helpers.mjs';

const kpItem = (o = {}) => ({ id: 'a', name: 'Elem', type: 'seat', x: 0, y: 0, w: 80, h: 80, ...o });
const kpFile = (items, p = {}) => ({ app: 'kanape', v: 1, p, b: { items } });
const prCab = (o = {}) => ({ id: 'c', name: 'Sz', type: 'fali', W: 80, H: 72, D: 35, t: 1.8, pl: 0, top: 0, fal: 1,
  cols: [{ id: 'k', w: 76, rows: [{ id: 'r1', h: 30, items: [{ id: 'i', n: 'Bögre', q: '2', col: 1 }] }, { id: 'r2', h: 30, items: [] }] }], ...o });
const prFile = (list, extra = {}) => ({ app: 'polcrendezo', v: 2, p: {}, groups: [], list, ...extra });

const APPS = {
  kanape: { file: 'kanape.html', input: '#kp_file', name: 'Kanapé-tervező', good: () => kpFile([kpItem()]) },
  polcrendezo: { file: 'polcrendezo.html', input: '#pr_file', name: 'Polcrendező', good: () => prFile([prCab()]) },
};

test.describe('XSS-regresszió (#2)', () => {
  test('Kanapé-tervező: rosszindulatú id, név és szövegek csak szövegként jelennek meg', async ({ page }) => {
    const errors = await openApp(page, 'kanape.html');
    await importFile(page, '#kp_file', kpFile(
      [kpItem({ id: XSS, name: XSS, tab: [{ f: XSS, l: XSS }] }), kpItem({ id: XSS, name: 'B', type: 'trim', x: 80, w: 20 })],
      { title: XSS, proj: XSS, client: XSS, extra: [{ l: XSS, v: XSS }], dT: XSS, lgSeat: XSS, snap: XSS }));
    await expect(toast(page)).toContainText('Betöltve');
    // minden nézet és a panel kirajzolása
    await page.locator('#kp_list [data-act="pick"]').first().click();
    for (const t of ['side', 'sheet', 'plan']) { const b = page.locator(`nav.side [data-tab="${t}"]`); if (await b.count()) await b.click(); }
    await page.locator('#kp_list [data-act="pick"]').first().click();
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    await expect(page.locator('img[src="x"]')).toHaveCount(0);
    const ids = await page.evaluate(() => [...document.querySelectorAll('[data-id]')].map((e) => e.dataset.id).concat(__bt.S.b.items.map((b) => b.id)));
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]{1,16}$/);
    await expect(page.locator('#kp_list')).toContainText('<img src=x');
    expect(await page.evaluate(() => __bt.S.p.dT)).toBe('edge');
    expect(errors).toEqual([]);
  });

  test('Polcrendező: rosszindulatú azonosítók, sor- és tárgynevek', async ({ page }) => {
    const errors = await openApp(page, 'polcrendezo.html');
    const cab = prCab({ id: XSS, name: XSS, g: XSS, type: XSS });
    cab.cols[0].id = XSS; cab.cols[0].rows[0].id = XSS; cab.cols[0].rows[0].items[0] = { id: XSS, n: XSS, q: XSS, col: XSS };
    await importFile(page, '#pr_file', prFile([cab, prCab({ id: XSS, g: XSS })], { groups: [{ id: XSS, name: XSS }], p: { title: XSS, proj: XSS } }));
    await expect(toast(page)).toContainText('Betöltve');
    await page.locator('#pr_cv [data-cell]').first().click();
    for (const t of ['items', 'sheet', 'cab']) await page.locator(`nav.side [data-tab="${t}"]`).click();
    await page.locator('#pr_cv [data-cell]').first().click();
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
    await expect(page.locator('img[src="x"]')).toHaveCount(0);
    const ids = await page.evaluate(() => {
      const a = [...document.querySelectorAll('[data-cell],[data-it],[data-id],[data-cab],[data-row]')].flatMap((e) => [e.dataset.cell, e.dataset.it, e.dataset.id, e.dataset.cab, e.dataset.row]).filter(Boolean);
      for (const c of __bt.S.c.list) { a.push(c.id); if (c.g) a.push(c.g); for (const k of c.cols) { a.push(k.id); for (const r of k.rows) { a.push(r.id); r.items.forEach((i) => a.push(i.id)); } } }
      __bt.S.c.groups.forEach((g) => a.push(g.id)); return a;
    });
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]{1,16}$/);
    // a két szekrény ugyanabba a (újonnan azonosított) sorba került
    const g = await page.evaluate(() => [__bt.S.c.groups.length, new Set(__bt.S.c.list.map((c) => c.g)).size, __bt.S.c.list[0].g === __bt.S.c.groups[0].id]);
    expect(g).toEqual([1, 1, true]);
    await expect(page.locator('#pr_tabs')).toContainText('<img src=x');
    expect(errors).toEqual([]);
  });
});

for (const [key, A] of Object.entries(APPS)) {
  test.describe(`Hibás fájlok elutasítása – ${A.name} (#3)`, () => {
    const big = () => JSON.stringify({ ...A.good(), pad: 'x'.repeat(2 * 1024 * 1024 + 10) });
    const cases = [
      ['nem JSON', '{ez nem json', 'nem érvényes JSON'],
      ['tömb gyökér', '[]', 'nem tervfájl'],
      ['másik app', { app: 'masik' }, `nem ${A.name}`],
      ['túl nagy fájl', big, 'túl nagy'],
    ];
    for (const [title, data, msg] of cases) {
      test(`${title}: érthető hiba, a terv nem változik`, async ({ page }) => {
        const errors = await openApp(page, A.file);
        const before = await state(page);
        await importFile(page, A.input, typeof data === 'function' ? data() : data);
        await expect(toast(page)).toContainText('Nem sikerült betölteni');
        await expect(toast(page)).toContainText(msg);
        expect(await state(page)).toBe(before);
        expect(errors).toEqual([]);
      });
    }
    test('helyes fájl betöltődik', async ({ page }) => {
      await openApp(page, A.file);
      await importFile(page, A.input, A.good());
      await expect(toast(page)).toContainText('Betöltve');
    });
  });
}

test.describe('Kanapé-tervező: tartományok és határértékek (#3)', () => {
  const bad = [
    ['végtelen szélesség (1e999)', '{"app":"kanape","b":{"items":[{"name":"x","x":0,"y":0,"w":1e999,"h":10}]}}', 'szélesség'],
    ['negatív méret', kpFile([kpItem({ w: -5 })]), 'szélesség'],
    ['nulla méret', kpFile([kpItem({ h: 0 })]), 'mélység'],
    ['szöveges koordináta', kpFile([kpItem({ x: 'abc' })]), ' x'],
    ['hiányzó koordináta', kpFile([kpItem({ y: null })]), ' y'],
    ['koordináta a határ felett', kpFile([kpItem({ x: 20000.1 })]), ' x'],
    ['elemlista hiányzik', { app: 'kanape', b: {} }, 'lista'],
    ['túl sok elem (301)', kpFile(Array.from({ length: 301 }, (_, i) => kpItem({ x: i * 90 }))), 'Túl sok elem'],
    ['elem nem objektum', kpFile([5]), 'Hibás adat'],
  ];
  for (const [title, data, msg] of bad) {
    test(`elutasítva: ${title}`, async ({ page }) => {
      await openApp(page, 'kanape.html');
      const before = await state(page);
      await importFile(page, '#kp_file', data);
      await expect(toast(page)).toContainText(msg);
      expect(await state(page)).toBe(before);
    });
  }
  test('határértékek elfogadva, opcionális mezők normalizálva', async ({ page }) => {
    const errors = await openApp(page, 'kanape.html');
    const items = Array.from({ length: 300 }, (_, i) => kpItem({ x: (i % 20) * 100, y: Math.floor(i / 20) * 100 }));
    items[0] = kpItem({ x: 20000, y: -20000, w: '80,5', h: 10000, name: 'n'.repeat(500), type: 'nincs', tab: 'nem lista' });
    await importFile(page, '#kp_file', kpFile(items, { H: '1e999', snap: '7', totW: 1, title: { a: 1 }, ismeretlen: 'x', extra: [null, { l: 1, v: 2 }] }));
    await expect(toast(page)).toContainText('Betöltve');
    const r = await page.evaluate(() => ({ n: __bt.S.b.items.length, b: __bt.S.b.items[0], p: __bt.S.p }));
    expect(r.n).toBe(300);
    expect(r.b).toMatchObject({ x: 20000, y: -20000, w: 80.5, h: 10000, type: 'seat', tab: [] });
    expect(r.b.name.length).toBe(80);
    expect(r.p.H).toBe('43'); expect(r.p.snap).toBe('5'); expect(r.p.totW).toBe('1');
    expect(r.p.title).toBe('KANAPÉ – MÉRETEZETT TERVRAJZ'); expect(r.p.ismeretlen).toBeUndefined();
    expect(r.p.extra).toEqual([{ l: '1', v: '2' }]);
    expect(errors).toEqual([]);
  });
});

test.describe('Polcrendező: tartományok és határértékek (#3)', () => {
  const tooManyRows = prCab({ H: 250 }); tooManyRows.cols[0].rows = Array.from({ length: 41 }, (_, i) => ({ id: 'r' + i, h: 3, items: [] }));
  const tooManyItems = prCab(); tooManyItems.cols[0].rows[0].items = Array.from({ length: 201 }, () => ({ n: 'x' }));
  const bad = [
    ['szélesség 0', prFile([prCab({ W: 0 })]), 'szélesség'],
    ['szélesség a határ felett', prFile([prCab({ W: 2001 })]), 'szélesség'],
    ['végtelen magasság', '{"app":"polcrendezo","list":[{"name":"x","W":80,"H":1e999,"D":30,"cols":[{"rows":[{"h":10}]}]}]}', 'magasság'],
    ['üres oszloplista', prFile([prCab({ cols: [] })]), 'Üres lista'],
    ['túl sok polc (41 rekesz)', prFile([tooManyRows]), 'Túl sok elem'],
    ['túl sok tárgy egy rekeszben', prFile([tooManyItems]), 'Túl sok elem'],
    ['magasság kisebb, mint a polcok', prFile([prCab({ H: 11 })]), 'túl kicsi'],
    ['túl sok szekrény (201)', prFile(Array.from({ length: 201 }, () => prCab())), 'Túl sok elem'],
    ['szekrénylista hiányzik', { app: 'polcrendezo', p: {} }, 'lista'],
  ];
  for (const [title, data, msg] of bad) {
    test(`elutasítva: ${title}`, async ({ page }) => {
      await openApp(page, 'polcrendezo.html');
      const before = await state(page);
      await importFile(page, '#pr_file', data);
      await expect(toast(page)).toContainText(msg);
      expect(await state(page)).toBe(before);
    });
  }
  test('határértékek elfogadva, a méretek a szekrényhez igazodnak', async ({ page }) => {
    const errors = await openApp(page, 'polcrendezo.html');
    const c = prCab({ W: 2000, H: 1000, t: 99, pl: -4, elev: 'x', type: 'nincs' });
    c.cols[0].rows[0].items[0].col = 99;
    await importFile(page, '#pr_file', prFile([c, ...Array.from({ length: 199 }, () => prCab())]));
    await expect(toast(page)).toContainText('Betöltve');
    const r = await page.evaluate(() => { const c = __bt.S.c.list[0], col = c.cols[0];
      return { n: __bt.S.c.list.length, t: c.t, pl: c.pl, elev: c.elev, type: c.type, col: col.rows[0].items[0].col, sumH: col.rows.reduce((s, x) => s + x.h, 0) + (col.rows.length + 1) * c.t + c.pl + c.top, H: c.H }; });
    expect(r).toMatchObject({ n: 200, t: 10, pl: 0, elev: 150, type: 'allo', col: 8 });
    expect(Math.abs(r.sumH - r.H)).toBeLessThan(0.15);
    expect(errors).toEqual([]);
  });
});

test.describe('Mentés és visszatöltés', () => {
  test('Kanapé-tervező: JSON-export, majd import ugyanazt a tervet adja (új azonosítókkal)', async ({ page }) => {
    await openApp(page, 'kanape.html');
    const geo = () => page.evaluate(() => __bt.S.b.items.map(({ id, ...r }) => r));
    const before = await geo(), oldIds = await page.evaluate(() => __bt.S.b.items.map((b) => b.id));
    const { name, buf } = await grabDownload(page, () => page.evaluate(() => __bt.exportJSON()));
    expect(name).toMatch(/\.json$/);
    await page.evaluate(() => { __bt.S.b.items = []; });
    await importFile(page, '#kp_file', buf.toString());
    await expect(toast(page)).toContainText('Betöltve');
    expect(await geo()).toEqual(before);
    const newIds = await page.evaluate(() => __bt.S.b.items.map((b) => b.id));
    expect(newIds.some((id) => oldIds.includes(id))).toBe(false);
  });
  test('Polcrendező: JSON-export, majd import (sorok, tárgyak, méretek)', async ({ page }) => {
    await openApp(page, 'polcrendezo.html');
    const shape = () => page.evaluate(() => __bt.S.c.list.map((c) => ({ n: c.name, W: c.W, H: c.H, g: __bt.S.c.groups.findIndex((x) => x.id === c.g),
      cols: c.cols.map((k) => ({ w: k.w, rows: k.rows.map((r) => ({ h: r.h, kind: r.kind, items: r.items.map((i) => i.n + '|' + i.q + '|' + i.col) })) })) })));
    const before = await shape();
    const { buf } = await grabDownload(page, () => page.evaluate(() => __bt.exportJSON()));
    await page.evaluate(() => { __bt.S.c.list = []; __bt.S.c.groups = []; });
    await importFile(page, '#pr_file', buf.toString());
    await expect(toast(page)).toContainText('Betöltve');
    expect(await shape()).toEqual(before);
  });
});

test.describe('Sérült tárolt állapot', () => {
  test('Kanapé-tervező: hibás tárolt terv helyett a minta töltődik be, hiba nélkül', async ({ page }) => {
    await page.addInitScript(() => { if (!sessionStorage.done) { sessionStorage.done = 1; localStorage.setItem('kp.state', JSON.stringify({ p: { title: 5 }, b: { items: [{ id: '"><b>', x: 'abc' }] } })); } });
    const errors = await openApp(page, 'kanape.html', { keepStorage: true });
    expect(await page.evaluate(() => __bt.S.b.items.length)).toBe(6);
    await expect(toast(page)).toContainText('hibás');
    expect(errors).toEqual([]);
  });
  test('Polcrendező: tárolt terv azonosítói újak, a kijelölés megmarad', async ({ page }) => {
    await page.addInitScript((c) => { if (!sessionStorage.done) { sessionStorage.done = 1; localStorage.setItem('pr.state', JSON.stringify({ c: { list: [c], groups: [], sel: '"x', cell: 'r2' } })); } }, prCab({ id: '"x' }));
    const errors = await openApp(page, 'polcrendezo.html', { keepStorage: true });
    const r = await page.evaluate(() => ({ sel: __bt.S.c.sel === __bt.S.c.list[0].id, cell: __bt.S.c.cell === __bt.S.c.list[0].cols[0].rows[1].id, id: __bt.S.c.list[0].id }));
    expect(r.sel).toBe(true); expect(r.cell).toBe(true); expect(r.id).toMatch(/^[a-z0-9]+$/);
    expect(errors).toEqual([]);
  });
});
