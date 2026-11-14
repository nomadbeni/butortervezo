# Bútortervező

Egyfájlos HTML bútortervező appok. Telefonon és laptopon is működnek, van világos és sötét témájuk, a tervet a böngésző tárolja (localStorage), és JSON-ba menthető. Nincs build-lépés a futtatáshoz: a gyökérben lévő HTML fájl böngészőben megnyitható vagy bármilyen statikus webszerverre másolható.

## Appok

Kezdőlap: `index.html` (az appok listája, minden app fejlécében a ház ikon ide visz vissza).

| Fájl | App |
|---|---|
| `kanape.html` | Kanapé-tervező: felülnézet téglalap elemekből (ülőrész, bőr perem / könyöklő, háttámla, párna), automatikus méretláncok, oldalnézet, méret-táblázat, jelmagyarázat; tervlap export PNG, SVG és PDF (A4 fekvő) |
| `polcrendezo.html` | Polcrendező: fali, álló, konyha- és fürdőszoba szekrények elölnézetben, polcok és polcközök arányos átméretezéssel, tárgyak rekeszenként, kereső; szekrénysorok egymás mellett (falnézet); tervlap PNG, SVG, PDF (A4 fekvő, soronként és szekrényenként egy oldal), leltár CSV |

## Kanapé-tervező

- **Felülnézet:** az elemek húzással mozgathatók és méretezhetők, a rácshoz (1/5/10 cm) és a többi elem éléhez illeszkednek. Billentyűk: nyilak (Shift: 1 cm), Delete, Ctrl+D, Ctrl+Z / Ctrl+Y.
- **Méretláncok** oldalanként: ki, teljes, lánc, szélső sor. A bőr perem mögötti elem határa is bekerül a láncba.
- **Méret-táblázat:** elemenként megadható sorok (szélesség, hossz vagy mindkettő), teljes méretek, saját sorok, bőr perem összhossza, ülőfelület. Az utolsó sor a magasság.
- **Tervlap:** a felülnézet az elemek nevével és méretével, fejléc (cím, projekt, megrendelő, tervező, dátum).
- Sablonok: lépcsős sarokkanapé, egyenes 3 személyes, sarok recamiere-rel, U alakú.

## Polcrendező

- **Szekrények:** típus (fali, álló, konyha, fürdő), méret-sablonok, szélesség / magasság / mélység, lapvastagság, lábazat, munkalap, falra szerelt jelölés, oszlopok száma.
- **Polcok:** oszloponként polcszám, polcköz (tiszta belmagasság) rekeszenként. Ha egy polcközt vagy a szekrény magasságát módosítod, a többi polcköz **arányosan** igazodik; a lakattal rögzített polcköz és oszlopszélesség nem változik. Egyenletes elosztás, polc beszúrása / eltávolítása, rekesz fajtája: polc vagy fiók.
- **Tárgyak:** rekeszenként név, mennyiség, szín; áthúzással (vagy az „Áthelyezés…” listával) másik rekeszbe, akár másik szekrénybe vihetők. Rekeszkód: oszlopbetű + sorszám felülről (A1, B3), egy oszlopnál csak a sorszám.
- **Szekrénysorok:** több szekrény egy sorba köthető (pl. konyha: alsók, fölöttük a felsők). „Teljes sor” nézetben egymás mellett látszanak: az álló szekrények a padlón balról jobbra, a falra szereltek a megadott magasságban (alsó él a padlótól), a magasabb álló szekrényeket kikerülve. Szekrényenként hézag adható meg előtte, a sorrend ◀ ▶ gombokkal változtatható. Gyors létrehozás: „Szekrénysor (több egyforma)…”, pl. 7 db × 40 cm. A sorról saját tervlap készül (rekeszkód: szekrény sorszáma / rekesz).
- **Tárgyak és keresés:** az összes szekrény tartalma egy listában, ékezet nélkül is kereshető, „Mutasd” a rajzon kijelöli a rekeszt.
- **Tervlap:** elölnézet méretekkel, rekesz-táblázat a tartalommal, fejléc. Billentyűk: nyilak a rekeszek között, Ctrl+Z / Ctrl+Y.

## Fejlesztés

A forrás a `src/` mappában van, a kész HTML-t a build szkript állítja elő:

```bash
cd src
python3 b_kp.py        # -> ../kanape.html
python3 b_pr.py        # -> ../polcrendezo.html
python3 b_index.py     # -> ../index.html (új app: egy sor az APPS listába)
```

- `src/core.js`, `src/common.css`, `src/build.py`: közös app keret (fejléc, fülek, téma, menü, mezők)
- `src/kp.js`: a kanapé-tervező logikája
- `src/b_kp.py`: a kanapé-tervező színei, saját CSS-e, ikonja
- `src/pr.js`, `src/b_pr.py`: a polcrendező logikája, illetve színei, CSS-e, ikonja
- `src/b_index.py`: a kezdőlap

A kész HTML-eket is commitolni kell (a CI ellenőrzi, hogy egyeznek a forrással): `npm run build`.

## Tervfájlok importja

A JSON-import (és a böngészőben tárolt terv betöltése) mindkét appban ugyanazokat a szabályokat követi (`src/core.js`, `validateKp`, `validatePr`):

- A fájl legfeljebb **2 MB**, érvényes JSON-objektum, a megfelelő `app` mezővel (`kanape` / `polcrendezo`).
- **Elutasítás**, érthető hibaüzenettel: hiányzó vagy rossz típusú lista; a darabszám-korlát átlépése; kötelező méret, ami nem véges szám vagy tartományon kívül esik; olyan szekrény, amelybe a megadott polcok fizikailag nem férnek bele.
- **Normalizálás**: szövegek hossza korlátozva, vezérlőkarakterek nélkül; ismeretlen típus, kapcsoló vagy választó → alapérték; opcionális számok a tartományukba szorítva; ismeretlen mezők elhagyva.
- Az **azonosítókat az app nem veszi át**: minden elem új, belső azonosítót kap, a sor-hivatkozások és a kijelölés átíródnak.
- A terv csak a teljes, sikeres ellenőrzés után cserélődik; hibás fájlnál a meglévő terv változatlan marad.

| Korlát | Kanapé-tervező | Polcrendező |
|---|---|---|
| Elemek | 300 elem, elemenként 20 táblázatsor | 200 szekrény, 50 sor, 8 oszlop, 40 rekesz/oszlop, 200 tárgy/rekesz, összesen 5000 tárgy |
| Méretek (cm) | koordináta ±20 000, szélesség/mélység 0,1–10 000 | szélesség 5–2000, magasság 5–1000, mélység 1–500 |

## Tesztek és CI

```bash
npm ci                 # egyszer: rögzített verziójú függőségek (@playwright/test)
npx playwright install chromium   # egyszer: böngésző a tesztekhez
npm test               # statikus ellenőrzés + összes teszt
```

Ha a Playwright saját Chromiumja nem telepíthető, egy meglévő Chrome is használható: `CHROME_PATH=/usr/bin/google-chrome npm test`.

- `tests/check.mjs` (`npm run check`): a JS források és a kész HTML-ekbe ágyazott szkriptek szintaxisa, a kezdőlap linkjei.
- `tests/import.spec.mjs`: XSS-regresszió rosszindulatú azonosítókkal és szövegekkel, hibás / túl nagy / rossz típusú fájlok, határértékek, mentés–visszatöltés, sérült tárolt állapot.
- `tests/kanape.spec.mjs`: befoglaló méret, perem, ülőfelület, átfedés, rácshoz igazítás, sablonok, mozgatás és átméretezés egérrel és billentyűvel, visszavonás/újra, export és fájlnév.
- `tests/polcrendezo.spec.mjs`: arányos méretezés és lakat, sablonok geometriája, polc- és oszlopműveletek, tárgyak áthúzása, szekrénysor-elrendezés, visszavonás/újra, CSV- és PDF-export.

A logikai függvényeket a tesztek a `window.__bt` tesztelési felületen keresztül, közvetlenül hívják; a felhasználói folyamatokat valódi böngészőben futtatják.

A **GitHub Actions** (`.github/workflows/ci.yml`) minden pull requestnél és a `main` ágra pusholáskor lefut: Python build szkriptek, build-egyezés a commitolt HTML-ekkel, JS szintaxis, majd az összes teszt. Rögzített verziók: Ubuntu 24.04, Python 3.12, Node 22.12.0, `@playwright/test` 1.65.1 (`package-lock.json`). Hiba esetén a tesztjelentés letölthető a futás oldaláról.
