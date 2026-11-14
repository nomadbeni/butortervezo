// A CSP a böngészőben is tilt minden hálózati kérést; a kezdőlap betölt, a linkek működnek.
import { test, expect } from '@playwright/test';
import { openApp, url } from './helpers.mjs';

for (const f of ['index.html', 'kanape.html', 'polcrendezo.html']) {
  test(`${f}: a böngésző letiltja a hálózati kéréseket`, async ({ page }) => {
    const errors = f === 'index.html' ? [] : await openApp(page, f);
    if (f === 'index.html') { page.on('pageerror', (e) => errors.push(e.message)); await page.goto(url(f)); }
    const r = await page.evaluate(async () => {
      const out = {};
      const violation = (path, trigger) => new Promise((res) => { const h = (e) => { if (!String(e.blockedURI).includes(path)) return; document.removeEventListener('securitypolicyviolation', h); res(e.effectiveDirective); };
        document.addEventListener('securitypolicyviolation', h); trigger(); setTimeout(() => res('nincs'), 1500); });
      out.fetch = await violation('/f', () => fetch('https://example.com/f').catch(() => {}));
      out.beacon = await violation('/b', () => navigator.sendBeacon('https://example.com/b', 'x'));
      out.script = await violation('/x.js', () => { const s = document.createElement('script'); s.src = 'https://example.com/x.js'; document.head.appendChild(s); });
      out.img = await violation('/p.gif', () => { const i = new Image(); i.src = 'https://example.com/p.gif'; });
      return out;
    });
    expect(r.fetch).toBe('connect-src');
    expect(r.beacon).toBe('connect-src');
    expect(r.script).toMatch(/script-src/);
    expect(r.img).toBe('img-src');
    expect(errors.filter((e) => !e.includes('https://example.com/'))).toEqual([]);   // a fenti, szándékosan blokkolt kérések naplóbejegyzései nem hibák
  });
}

test('kezdőlap: app-kártyák, MI-nyilatkozat, GitHub-link', async ({ page }) => {
  await page.goto(url('index.html'));
  await expect(page.locator('a.app')).toHaveCount(2);
  await expect(page.locator('footer')).toContainText('az ellenőrzést egy másik MI végezte');
  await expect(page.locator('footer a[href="https://github.com/nomadbeni/butortervezo"]')).toHaveCount(1);
  await page.locator('a.app[href="polcrendezo.html"]').click();
  await expect(page.locator('#main h1')).toBeVisible();
  await page.locator('header a[href="index.html"]').click();
  await expect(page.locator('a.app')).toHaveCount(2);
});
