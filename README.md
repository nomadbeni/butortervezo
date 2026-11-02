# Bútortervező

Egyfájlos HTML bútortervező appok. Telefonon és laptopon is működnek, van világos és sötét témájuk, a tervet a böngésző tárolja (localStorage), és JSON-ba menthető. Nincs build-lépés a futtatáshoz: a gyökérben lévő HTML fájl böngészőben megnyitható vagy bármilyen statikus webszerverre másolható.

## Appok

| Fájl | App |
|---|---|
| `kanape.html` | Kanapé-tervező: felülnézet téglalap elemekből (ülőrész, bőr perem / könyöklő, háttámla, párna), automatikus méretláncok, oldalnézet, méret-táblázat, jelmagyarázat; tervlap export PNG, SVG és PDF (A4 fekvő) |

## Kanapé-tervező

- **Felülnézet:** az elemek húzással mozgathatók és méretezhetők, a rácshoz (1/5/10 cm) és a többi elem éléhez illeszkednek. Billentyűk: nyilak (Shift: 1 cm), Delete, Ctrl+D, Ctrl+Z / Ctrl+Y.
- **Méretláncok** oldalanként: ki, teljes, lánc, szélső sor. A bőr perem mögötti elem határa is bekerül a láncba.
- **Méret-táblázat:** elemenként megadható sorok (szélesség, hossz vagy mindkettő), teljes méretek, saját sorok, bőr perem összhossza, ülőfelület. Az utolsó sor a magasság.
- **Tervlap:** a felülnézet az elemek nevével és méretével, fejléc (cím, projekt, megrendelő, tervező, dátum).
- Sablonok: lépcsős sarokkanapé, egyenes 3 személyes, sarok recamiere-rel, U alakú.

## Fejlesztés

A forrás a `src/` mappában van, a kész HTML-t a build szkript állítja elő:

```bash
cd src
python3 b_kp.py        # -> ../kanape.html
```

- `src/core.js`, `src/common.css`, `src/build.py`: közös app keret (fejléc, fülek, téma, menü, mezők)
- `src/kp.js`: a kanapé-tervező logikája
- `src/b_kp.py`: a kanapé-tervező színei, saját CSS-e, ikonja
