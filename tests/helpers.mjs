import { expect } from '@playwright/test';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const url = (f) => pathToFileURL(join(root, f)).href;

/** XSS-payload: ha bárhol nyersen kerülne HTML-be, a window.__xss beállna. */
export const XSS = `"><img src=x onerror="window.__xss=1"><svg onload="window.__xss=2">'"`;

/** App megnyitása tiszta tárolóval; a visszaadott tömb gyűjti a JS-hibákat (a webfont letöltési hibái nem számítanak). */
export async function openApp(page, file, { keepStorage = false } = {}) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::|fonts\.g/.test(m.text())) errors.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(url(file));
  if (!keepStorage) { await page.evaluate(() => localStorage.clear()); await page.reload(); }
  await expect(page.locator('#main h1')).toBeVisible();
  return errors;
}

/** Tervfájl „feltöltése” a rejtett file inputba. */
export async function importFile(page, input, data, name = 'terv.json') {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  await page.setInputFiles(input, { name, mimeType: 'application/json', buffer: Buffer.from(text) });
}

export const state = (page) => page.evaluate(() => JSON.stringify(__bt.S));
export const toast = (page) => page.locator('#toast');

/** Letöltés elkapása; visszaadja a fájlnevet és a tartalmat. */
export async function grabDownload(page, trigger) {
  const [dl] = await Promise.all([page.waitForEvent('download'), trigger()]);
  const stream = await dl.createReadStream();
  const chunks = []; for await (const c of stream) chunks.push(c);
  return { name: dl.suggestedFilename(), buf: Buffer.concat(chunks) };
}
