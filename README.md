# midu.design — reconstruction 1:1 en React + CSS

Reproduction **pixel-fidèle** de <https://midu.design> en **React 18 + CSS**, **sans le runtime Framer**.

**En ligne : <https://component.hypeer.cloud/ui/>**

> Règle du projet : **aucune valeur estimée.** Chaque dimension, couleur, police, durée et courbe
> d'animation de ce dépôt provient d'une mesure instrumentée sur le site original (Playwright +
> Chromium, viewport 1200×900, DPR 1). Les chiffres du tableau ci-dessous sont reproductibles avec
> le harnais de `_recon/`.

---

## Résultat mesuré

Protocole : Playwright + Chromium headless (`--hide-scrollbars`), 1200×900, `deviceScaleFactor: 1`,
attente de `document.fonts.ready`, balayage de stabilisation 0 → bas de page → position de mesure,
comparaison pixel à pixel avec `d = |ΔR| + |ΔG| + |ΔB|`, un pixel est compté si `d > 6`.

| Mesure | Valeur |
|---|---|
| Différence **brute** (25 viewports, pas de 450 px) | **4,946 %** |
| Différence **masquée** (zones animées exclues) | **1,259 %** — MAE **0,000813** |
| **Plancher de bruit** (midu.design comparé à lui-même, même protocole) | **0,55 – 0,70 %** |

Le clone se situe donc à **≈ 0,6 point au-dessus du bruit de la mesure elle-même**.

| Domaine | Écart |
|---|---|
| Géométrie (toutes les `getBoundingClientRect`, 6 décimales) | **0 px** |
| Frontières de section (Hero 0/900, About 2652, Works 4827, Services 4827, Pricing 7763, Footer 10371/772) | **0 px** |
| Hauteur totale du document | **11 143 px** (identique) |
| Texte (1 104 éléments) | **0 écart** |
| Polices | **49 `@font-face`, même jeu chargé** |
| Assets (116 fichiers) | **113 identiques au md5** (les 3 autres sont des `.bin` non visuels) |
| Structure `#main` | **3 enfants, classes identiques, badge Framer `opacity: 0`** |
| Erreurs console / réponses 4xx en production | **0 / 0** |

---

## Ce que le harnais a permis de découvrir

Le HTML rendu par le serveur (SSR) contient des **classes de remplacement** : la liste de classes
qu'on y trouve (`.framer-W8QJn .framer-qvJjo .framer-MW7yW .framer-DL6dO .frame`) **n'a aucun CSS
associé**. C'est le runtime Framer qui les **remplace** à l'hydratation par le jeu responsive réel
(`.framer-W8QJn framer-qvJjo framer-MW7yW framer-kh4v5l`).

Conséquence : reconstruire depuis le DOM SSR donne `.framer-DL6dO frame` → `display: block ;
position: static` → les enfants se dimensionnent sur un viewport de 1680 px. C'était **l'unique cause**
d'un écart de hauteur de 11 839 px contre 11 143 px.
→ La source de vérité de la génération est donc la capture **hydratée** (`_recon/dom-live.json`).

Autre découverte : un **bandeau cookies injecté par le runtime Framer**
(`.--framer-cookie-banner-container`, `490×203`, `rgb(21,21,21)`, rayon 14 px) est présent à
**toutes** les positions de scroll (`position: fixed`). Il représentait à lui seul ~9 % des pixels
sur chaque viewport. Il est reproduit à l'identique (`src/dynamic/CookieBanner.jsx`), ce qui a fait
passer le diff masqué de **10,86 % à 1,26 %**.

---

## Comportements dynamiques (tous mesurés)

| Élément | Loi mesurée | Où |
|---|---|---|
| Parallaxe hero | `translateY(0.4 × scrollY)` (10 243 px → 4 097,2 px) | `behaviors.js` |
| Parallaxe barre méta | `translateY(0.2 × scrollY)` (→ 2 048,6 px) | `behaviors.js` |
| Zoom image « À propos » | **réversible**, linéaire sur scroll **1339 → 2354** : `scale 0.9 → 1.0` + `translateY -80px → 0` (moindres carrés sur 24 points, **erreur max 4,6e-7**) | `behaviors.js` |
| Soleil (icône) | rotation **68,42 °/s** (360° en 5,262 s) | `behaviors.js` |
| Bascule jour / nuit | soleil pour les heures **9 → 18** (Europe/London), lune sinon — mesuré sur horloges décalées (±3 h, ±6 h, ±9 h, ±12 h) | `behaviors.js` |
| Carrousel d'avis | **1 040 px** toutes les **4 100 ms**, **640 ms** ease-out, retour au repos après un tour | `behaviors.js` |
| Bandeau de logos | marquee linéaire continue **38,771 px/s** vers la gauche | `behaviors.js` |
| Horloge | `Intl.DateTimeFormat("Europe/London")`, rafraîchie toutes les 1 000 ms | `Clock.jsx` |
| Icône lune (dotLottie) | animation rejouée image par image (`fr 30`, `op 70`) | `SleepIcon.jsx` |

Les effets discrets observés appartiennent au breakpoint **1440 px**, jamais atteint à 1200 px
(recapturés en 1200×1440 : statiques). Ils ne sont donc pas implémentés.

---

## Architecture

```
ui/
  build.mjs                 bundle esbuild → dist/ (iife, minify, jsx automatic)
  public/index.html         coquille minimale : #root + app.js + framer.css
  src/main.jsx              createRoot(...).render(<App/>)
  src/App.jsx               arbre #main : PAGE → CONTENT (12 sections) + extras
  src/generated/sections.jsx  sections générées depuis le DOM hydraté (276 Ko)
  src/dynamic/
    behaviors.js            scroll, carrousel, marquee, rotation, jour/nuit
    Clock.jsx               horloge Europe/London
    SleepIcon.jsx           rendu manuel du dotLottie (SVG + cubic-bezier Newton)
    CookieBanner.jsx        bandeau cookies Framer, reproduit à l'identique
  src/styles/framer.css     CSS Framer extrait (179 828 octets, 49 @font-face)
  assets/                   assets localisés (116 fichiers, noms préfixés par hash)

_recon/                     harnais de mesure et de génération
  capture.mjs               capture le DOM hydraté → dom-live.json
  gen-react.mjs             génère src/generated/sections.jsx
  gen-lottie.mjs            extrait le dotLottie → sleep-icon-data.js
  servedist.mjs             serveur statique local
  vdiff2.mjs / vdiff3.mjs   diff viewport par viewport (brut / masqué)
  stylediff.mjs             diff de ~45 propriétés calculées, groupé par signature
  geoat.mjs                 diff géométrie + texte + polices à un scroll donné
  scrolllink.mjs            classe transform/opacity : scroll-lié (réversible) vs reveal
  scrollfn.cjs, aboutfit.cjs  ajustement des lois de scroll
  noise.mjs                 plancher de bruit (original vs original)
  attrib3.mjs               attribue les pixels divergents à leur élément
  compare.mjs               génère compare-prod.png (original | clone | diff ×4)
  verify-assets.mjs         vérifie les octets des assets contre le CDN (md5)
```

---

## Construire et déployer

```bash
cd ui
npm install        # react, react-dom, esbuild
npm run build      # → ui/dist/ (app.js, framer.css, index.html, assets/)
```

`dist/` est ensuite publié tel quel : les chemins y sont **relatifs** (`./app.js`,
`./framer.css`, `assets/…`), donc le dossier fonctionne aussi bien à la racine que dans un
sous-chemin (`/ui/`).

Mesurer une modification :

```bash
cd _recon
node servedist.mjs &                      # sert ui/dist sur :8792
node vdiff3.mjs https://midu.design/ http://127.0.0.1:8792/
```

---

## Écarts connus (honnêtement chiffrés)

1. **Photos de la section Works — ≈ 7 % des pixels diffèrent de 2 à 5 unités sur 255**
   (MAE 0,0021 contre 0,0002 de bruit). Hypothèses écartées par la mesure : octets identiques au md5,
   géométrie identique à 6 décimales, `srcset`/`sizes` identiques, cross-corrélation du meilleur
   alignement exactement à `(dx=0, dy=0)`, service des images depuis le CDN sans effet. Il s'agit
   d'un artefact de rastérisation de Chrome — invisible à l'œil (0,08 % d'écart moyen).
2. **Fond animé du hero** : c'est un `<iframe>` vers `gradientshader-nine.vercel.app`
   (lib **Paper Shaders**, shader « Grain Gradient » : uniforms `u_softness`, `u_intensity`,
   `u_noise`, `u_shape`, `u_colors`). Conservé à l'identique → fidélité visuelle, mais
   **dépendance externe** (un 403 transitoire — challenge Vercel — a été observé). Le fragment shader
   GLSL complet (7 821 octets) a été extrait et permettrait de l'embarquer sans dépendance.
3. **Badge Framer** : `opacity: 0` dans l'original ; sa structure interne mesure `20×20` chez
   l'original contre `0×0` ici. **0 pixel d'impact.**
4. **Zones animées** (hero WebGL, carrousel, marquee, soleil) : jamais en phase entre deux instances,
   donc exclues du diff pixel et vérifiées séparément en vitesse et amplitude.
