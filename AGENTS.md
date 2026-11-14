# Utasítás MI-ügynököknek (Claude, Codex, Copilot stb.)

Ez a tároló nyilvános, és minden, ami a `main` ágra kerül, néhány percen belül kint van a GitHub Pages-en (`nomadbeni.github.io/butortervezo`). Úgy dolgozz, mintha minden sorodat idegenek olvasnák.

## Mi ez a tároló

- Böngészőben futó, **egyfájlos** HTML bútortervező appok, magyar felülettel: `kanape.html` (Kanapé-tervező), `polcrendezo.html` (Polcrendező), és a kezdőlap (`index.html`).
- A forrás a `src/` mappában van, a kész HTML-eket a build írja: `npm run build` (Python 3, csomag nélkül). Kész HTML-t kézzel ne szerkessz; a forrást javítsd, buildelj, és a kész HTML-t is commitold. A CI ellenőrzi, hogy egyeznek.
  - `src/core.js`, `src/common.css`, `src/build.py`: közös keret (fejléc, fülek, téma, menü, mezők, letöltés, import-ellenőrzés)
  - `src/kp.js` + `src/b_kp.py`: Kanapé-tervező; `src/pr.js` + `src/b_pr.py`: Polcrendező; `src/b_index.py`: kezdőlap (app lista: `APPS`)
  - `src/csp.txt`: a Content-Security-Policy, minden oldal ezt kapja
- Közzététel: `.github/workflows/ci.yml`, a `main` ágra pusholás után, ha minden ellenőrzés zöld.

## Kötelező szabályok

### Adatvédelem, nincs adatgyűjtés
- **Nincs hálózati kérés az appból:** nincs `fetch`, XHR, `sendBeacon`, WebSocket, külső API, analitika, hirdetés, követőpixel, süti, service worker. A `src/csp.txt` szabálya ezt a böngészőben is kikényszeríti (`connect-src 'none'`, a `script-src` csak a beágyazott szkript SHA-256 hash-e, amit a build számol); ne lazítsd, és ne használj inline eseménykezelő attribútumot (`onclick=` stb.).
- **Egyetlen külső forrás:** a betűtípus a Google Fontsról jön (`fonts.googleapis.com`, `fonts.gstatic.com`), rendszer-tartalékkal. Ezt a README „Adatvédelem” része leírja. Külső `<script src>`, más domainről kép vagy hang nem tölthető; a grafika SVG / canvas vagy `data:` URI.
- **Nincs eszközhozzáférés:** kamera, mikrofon, helyzet, vágólap-olvasás nincs.
- **Csak helyi mentés:** a terv csak a `localStorage`-ba kerülhet, saját előtaggal: `kp.` (Kanapé-tervező), `pr.` (Polcrendező), `bt.` (kezdőlap). Minden olvasás és írás `try/catch`-ben van (`store` a `core.js`-ben).
- **Import és tárolt állapot:** minden betöltött terv (fájl és `localStorage`) a `validateKp` / `validatePr` függvényen megy át: méretkorlát, darabszám-korlátok, véges és tartományon belüli méretek, szöveghossz, **új belső azonosítók** (importált `id` soha nem kerül HTML-be). Hibás fájlnál a terv nem változik. Hibás tárolt tervnél az eredeti a `<előtag>.state.bak` kulcsra kerül, és a menüből letölthető. Új mezőnél bővítsd az ellenőrzést és a tesztet is; a korlátokat ne lazítsd indoklás nélkül (a táblázat a README-ben).
- **A szerkesztő sem léphet túl a korlátokon:** minden mentés előtt a `guard()` ugyanazzal a `validate*`-tel ellenőriz, és visszavonja a módosítást, ha a terv nem lenne betölthető. Új szerkesztő műveletnél ezt ne kerüld meg (ne írj közvetlenül a `localStorage`-ba).
- **Export:** a CSV-cellák a `csvQ()`-n mennek át (a `= + - @` kezdetű cella aposztrófot kap, CSV-injektálás ellen).
- **Nincs személyes adat bekérése:** név, e-mail, telefonszám nem kérhető; a tervlap fejléc mezői (megrendelő, tervező) csak helyben tárolódnak.

### Személyes adat és chat-nyomok a tárolóban
- **E-mail cím:** semmilyen fájlban, commit üzenetben, szerzőben vagy commitolóban nem lehet e-mail cím. Az egyetlen megengedett cím:
  `nomadbeni <29810786+nomadbeni@users.noreply.github.com>`.
  Commit előtt: `git config user.name nomadbeni` és `git config user.email 29810786+nomadbeni@users.noreply.github.com`.
- **Linkek:** nem lehet benne chat- vagy munkamenet-link (claude.ai, chatgpt.com, `Claude-Session:`), `utm_` paraméter, belső elérési út, gépnév, IP-cím, token vagy jelszó. A PR-leírásra is vonatkozik.
- **Valós személy:** nincs valós személyre utaló adat (név, cím, megrendelő). A minta- és tesztadat kitalált, általános (pl. „Konyha felső”, „Törölközők”).
- **Commit üzenet:** magyarul írd, és a végén egyetlen MI-jelölő sor álljon:
  ```
  AI-generated: Claude (Anthropic)
  ```
  Ne legyen benne `Co-Authored-By`, se e-mail cím. Más modell a saját nevét írja (pl. `AI-generated: Codex (OpenAI)`); a `npm run check` az `AI-generated: <modell>` alakú utolsó sort fogadja el. Ez a szabály felülírja az eszközöd alapértelmezett commit-aláírását.

### MI-jelölés
- A README-ben (magyarul és angolul) és a kezdőlap láblécében szerepelnie kell: a tárolóban minden kódot és leírást teljes egészében MI készített, az ellenőrzést egy másik MI végezte. Ezt nem szabad eltávolítani vagy gyengíteni. A `npm run check` ellenőrzi.
- A licenc MIT (`LICENSE`), ez marad.

### Tartalom és kód
- Nincs valós bútormárka, termék- vagy cégnév, logó a sablonokban és a mintákban.
- Nincs `eval` és `new Function` az appokban. Felhasználói vagy importált szöveg HTML-be / SVG-be csak `esc()`-pel kerülhet; azonosító csak belső, `uid()`-vel generált lehet.
- Az appokat egy IIFE zárja be; a tesztek a `window.__bt` felületen érik el a belső függvényeket. Ide csak tesztekhez szükséges függvény kerüljön.

## Új app vagy módosítás: kötelező elemek

1. Új app: `src/<rövid>.js` (logika) és `src/b_<rövid>.py` (szín, CSS, ikon, a `build.page()` hívása), a kész fájl a gyökérben `<nev>.html` (kisbetű, ékezet nélkül). Vedd fel a `package.json` `build` szkriptjébe és a `src/b_index.py` `APPS` listájába.
2. A közös keretet (`shell`, mezők, `download`, `readImport`, `vStr`/`vNum`/`vArr`…) használd, ne írj újat. A fejlécben ott a kezdőlap gomb (a `build.py` teszi bele).
3. Legyen `validate<App>()` az importhoz és a tárolt állapothoz, és `window.__bt` tesztelési felület.
4. Telefonon (kb. 390×844) és laptopon is használható legyen, oldalirányú görgetés nélkül; az export (PNG, SVG, PDF nyomtatással) működjön.
5. Tesztek: `tests/<nev>.spec.mjs` a számításokra és a fő folyamatokra, és az `import.spec.mjs`-be XSS-, hibás-fájl- és határérték-esetek.
6. A README app-táblázatába (magyar és angol) új sor kell.

## Kötelező ellenőrzés commit és push előtt

Mindet futtasd le, és csak akkor pusholj, ha mind átment:

```bash
npm run build          # a kész HTML-ek a forrásból; utána legyenek commitolva
npm test               # szabályellenőrzés (tests/check.mjs) + Playwright tesztek
#   ha nincs a Playwright Chromiuma: CHROME_PATH=/usr/bin/google-chrome npm test

# a commitok szerzője és üzenete tiszta:
git log origin/main..HEAD --format='%an <%ae> | %cn <%ce>%n%B' \
  | grep -iE '@|claude\.ai|session|co-authored' | grep -v 'users.noreply.github.com'
#   → ennek üresnek kell lennie
```

Ezen felül nézd meg a módosított oldalt telefon- és laptopméretben (képernyőkép), és próbáld ki az exportot.

## Mit ne csinálj

- Ne fésüld össze a Dependabot PR-jét úgy, ahogy van (angol commit üzenet, nincs MI-jelölő; a CI emiatt szándékosan piros rajta). Vedd át a frissítést egy saját, magyar commitba: olvasd el a főverziók változásnaplóját, a commit-azonosítót és a verziót megjegyzésben írd be, a Dependabot PR-t pedig zárd le a saját PR-ed linkjével.
- Ne írd át a git előzményeket, és ne force pusholj, hacsak a tulajdonos kifejezetten nem kéri.
- Ne kapcsold ki és ne gyengítsd az ellenőrzéseket (`tests/check.mjs`, CSP, import-ellenőrzés) azért, hogy átmenjen a build. Javítsd a kódot.
- Ne tegyél be keretrendszert, bundlert vagy futásidejű függőséget. Az appok önálló HTML fájlok maradnak; a `package.json` csak a teszteszközt tartalmazza.
- Ne módosíts más appot, mint amit kértek. Kivétel, ha az ellenőrzés hibát talál benne: akkor javítsd, és írd bele a commit üzenetbe.
