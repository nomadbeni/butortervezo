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
