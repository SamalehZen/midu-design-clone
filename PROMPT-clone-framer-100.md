# PROMPT — Reproduction 1:1 d'un site Framer en React + CSS, sans runtime Framer

> À copier-coller tel quel. Remplacer les `{...}` par les valeurs du projet.

---

## 0. Mission

Tu es ingénieur front-end. Reproduis **`{URL}`** à **100 % de fidélité** dans **`{DOSSIER}`**, en
**React + CSS**, **sans le runtime Framer**. Puis déploie sur **`{HOTE}/{SOUS_CHEMIN}`**.

Tu travailles en autonomie, du début à la fin, sans t'arrêter pour demander confirmation.

---

## 1. Règles absolues (non négociables)

1. **Ne jamais estimer une valeur.** Toute dimension, couleur, police, taille, durée, courbe
   d'easing, offset ou vitesse vient d'une **mesure instrumentée** sur le site original.
   *Une valeur inventée = échec du travail.* Si une valeur est introuvable, écris
   `INCONNU` et remonte-la — ne la devine pas.

2. **Tu ne décides pas seul de ce qui n'est pas reproductible.** Si une partie du rendu dépend
   d'un service externe, d'un shader, d'un WASM, d'un binaire non récupérable ou d'un runtime
   propriétaire, alors :
   - reproduis tout ce qui est reproduisible ;
   - **et remonte explicitement à l'utilisateur** : ce qui reste, pourquoi, avec les mesures,
     les options possibles et leur coût. **C'est lui qui tranche.**
   - Ne masque jamais un manque derrière une approximation silencieuse.

3. **Rythme de travail.** Une section / un composant par itération. À chaque itération : le diff
   **chiffré**, puis on enchaîne. **Ne t'arrête pas pour demander confirmation.** Si un écart
   résiste, isole-le (masque, patch temporaire, comparaison de styles ciblée) **avant** de passer
   à la suite. Tu ne reviens dessus qu'à la phase de consolidation.

4. **Chaque affirmation est un chiffre.** Pas de « c'est proche », « ça semble bon »,
   « visuellement identique ». Unité, valeur, écart, méthode.

---

## 2. Protocole de vérification (imposé, à ne pas adapter)

### 2.1 Environnement de mesure
- Playwright + Chromium **headless**.
- Viewport **fixe** : `1200×900`, `deviceScaleFactor: 1`. Note-le partout.
- Toujours lancer avec `--hide-scrollbars` des deux côtés (sinon la barre de défilement fausse
  toute la géométrie).
- **Désactive le cache entre deux mesures** ou vérifie que les octets servis sont bien les tiens.

### 2.2 Séquence de stabilisation (obligatoire avant CHAQUE capture)
```js
await page.goto(url, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);   // 1. polices réellement chargées
await page.waitForTimeout(2500);                   // 2. laisser le runtime s'hydrater

// 3. balayage complet : l'état final dépend de l'HISTORIQUE de scroll
for (let y = 0; y <= H; y += 400) {
  await page.evaluate(v => window.scrollTo({ top: v, behavior: 'instant' }), y);
  await page.waitForTimeout(110);
}
// 4. revenir à la position de mesure et VÉRIFIER qu'on y est
for (let i = 0; i < 25; i++) {
  await page.evaluate(v => window.scrollTo({ top: v, behavior: 'instant' }), S);
  await page.waitForTimeout(100);
  if (Math.abs(await page.evaluate(() => window.scrollY) - S) <= 1) break;
}
await page.waitForTimeout(500);                    // 5. laisser retomber les animations
```
> Sans l'étape 3, tu compares deux états d'animation différents et tu perds des heures.

### 2.3 Métrique pixel
```js
d = |ΔR| + |ΔG| + |ΔB|;          // un pixel est "différent" si d > 6
pourcentage = pixels_différents / pixels_total;
MAE = Σd / nombre_de_pixels / 765;   // toujours donner la MAE en plus
```
- Balaye **25 positions** (pas de ~450 px) sur toute la hauteur, pas seulement quelques-unes.
- **Masque les zones animées** dans le diff (voir 2.4) et donne **deux chiffres** :
  brut et masqué.

### 2.4 Avant tout : mesure le PLANCHER DE BRUIT
**Fais ceci en premier, sinon tous tes chiffres sont ininterprétables :**
diffe `{URL}` **contre elle-même** (deux chargements séparés, protocole identique).
Tu obtiens le bruit irréductible : typiquement **0,5 – 0,7 %** de pixels et une MAE ~2e-4
(icônes qui tournent, carrousels, marquees, antialiasing non déterministe).
**Un écart inférieur à ~3× ce plancher n'est pas un écart.**

### 2.5 Géométrie AVANT les pixels
Les pixels mentent (resampling, antialiasing). Compare d'abord, dans cet ordre :
1. **Hauteur totale du document** — doit être identique au pixel près.
2. **`getBoundingClientRect()` de TOUS les éléments**, à **6 décimales**. Tolérance **0 px**.
3. **Diff de styles calculés** : ~45 propriétés par élément (`display, position, width, height,
   top/left/right/bottom, margin*, padding*, gap, flex-*, grid-*, background-color,
   background-image, color, font*, line-height, letter-spacing, text-transform, border*,
   border-radius, box-shadow, opacity, transform, filter, mix-blend-mode, overflow, z-index,
   object-fit, object-position, white-space`).
   **Groupe les écarts par signature** (l'ensemble des propriétés divergentes) : un seul
   correctif règle souvent 300 éléments d'un coup.
4. **Contenu texte** : compare le texte de chaque élément. Écart attendu : **0**.
5. **Polices** : nombre de `@font-face`, et **jeu réellement chargé**
   (`[...document.fonts].filter(f => f.status === 'loaded')`) + `document.fonts.check()`
   sur les variantes utilisées.
6. **Assets** : md5 de **ce que le navigateur charge réellement** (`img.currentSrc`), pas ce
   qu'il y a sur le disque.

### 2.6 Attribution des pixels divergents
Quand un écart résiste, **ne devine pas** : attribue-le.
```js
// pour chaque pixel divergent, quel est l'élément du dessus ?
document.elementFromPoint(x, y)
```
Histogramme par élément → tu sais immédiatement si c'est un `<img>`, un `<header>`, un
`<canvas>`, du texte… C'est la seule méthode qui a permis de trancher dans ce projet.

### 2.7 Distinguer un DÉCALAGE d'un RE-ÉCHANTILLONNAGE
Sur un patch, calcule le diff pour `dx, dy ∈ [-3, +3]` (cross-corrélation) :
- minimum **hors** de `(0,0)` → c'est un décalage positionnel : cherche la propriété en cause.
- minimum **en** `(0,0)` avec une faible valeur résiduelle → c'est du ré-échantillonnage ou de
  la rastérisation navigateur. **Ce n'est pas une erreur de reproduction : arrête de creuser.**

---

## 3. Pièges connus (chacun a coûté du temps ; vérifie-les systématiquement)

### 3.1 ⚠️ Le HTML SSR contient des CLASSES FACTICES
Sur un site publié par Framer, le HTML servi au premier octet porte des listes de classes qui
**n'ont aucun CSS associé**. C'est le runtime qui les **remplace** à l'hydratation par le jeu
responsive réel.

*Symptôme* : ta hauteur de page est fausse (ex. 11 839 px au lieu de 11 143 px), et une seule
classe apparaît dans tous tes écarts de styles calculés (ex. `.framer-DL6dO` → `display: block ;
position: static` au lieu de `flex`), ce qui fait que toute la mise en page se cale sur la
largeur de la fenêtre au lieu du conteneur.

*Diagnostic* : capte le DOM **après hydratation** (`page.waitForTimeout` généreux, puis
`document.documentElement.outerHTML`) et compare les listes de classes avec le HTML SSR.
Vérifie aussi que les classes du SSR **n'existent pas** dans les feuilles de style :
`[...document.styleSheets].flatMap(sheet => [...sheet.cssRules])` et cherche la classe dedans.

*Conclusion* : **la source de vérité est la capture du DOM HYDRATÉ, jamais le HTML SSR.**

### 3.2 Le runtime injecte des éléments invisibles dans ta capture
Bandeaux cookies, overlays de consentement, badges de l'éditeur… Ils sont ajoutés au DOM par le
runtime, en `position: fixed`, donc présents **à toutes les positions de scroll**.
Dans ce projet, le bandeau cookies Framer représentait **~9 % des pixels sur chaque viewport** et
faisait passer le diff de 1,26 % à 10,86 %.

*Méthode* : diff le DOM (arbre + styles) entre l'instant 0 et l'instant stabilisé, et mesure la
surface de chaque nouvel élément (`getBoundingClientRect` × nb de viewports couverts).

### 3.3 `srcset` / `sizes` : localise CHAQUE candidat
Ne localise pas seulement `src` : **chaque URL de `srcset`** doit être mappée vers un fichier
local, sinon le navigateur choisit un candidat dont tu n'as pas les octets, et tu obtiens des
écarts de 2–5 unités sur 255 sur toute la photo.
Vérifie ensuite **le md5 de ce que le navigateur a réellement téléchargé** :
`curl -s -L <currentSrc> | md5sum` contre le fichier local.
Et compare le **nombre de candidats** et leurs **descripteurs** (`679w 1340w`), pas seulement
la longueur de la chaîne.

### 3.4 Ne compare pas des URLs, compare des OCTETS
Télécharge **tous** les assets et compare les **md5** avec le CDN. C'est rapide et ça élimine
d'un coup toute la classe d'hypothèses « c'est peut-être l'image ».
(`113/116 identiques` dans ce projet — les 3 restants étaient des pages HTML, non visuels.)

### 3.5 Les animations scroll-liées se confondent avec les reveals
Pour chaque animation détectée, **classe-la** en mesurant `transform`/`opacity` à ~30 positions
de scroll, dans les deux sens (montée **et** descente) :
- **Scroll-lié réversible** → une loi linéaire existe : ajuste-la par moindres carrés et
  **donne l'erreur maximale** (ex. `translateY(0.4 × scrollY)`, `scale 0.9 → 1.0` sur
  `scroll 1339 → 2354`, erreur max `4.6e-7`).
- **Reveal one-shot** → hystérésis entre montée et descente : implémente-le comme une
  transition déclenchée par un seuil, pas comme une fonction du scroll.
- **Autonome** → période, amplitude, easing, mesurés indépendamment du scroll.

### 3.6 Les animations autonomes ne seront JAMAIS en phase
Carrousel, marquee, horloge, icône qui tourne, canvas, `<iframe>`, WebGL.
**Ne cherche pas à les synchroniser.** Masque-les dans le diff et vérifie-les **séparément** :
vitesse (px/s, °/s), période (ms), amplitude, courbe d'easing. Donne ces constantes.
Mesure-les en échantillonnant la position à intervalle connu.

### 3.7 Une animation peut dépendre de l'heure / de la date
Icône jour/nuit, thème saisonnier… Pour le déterminer : **décale l'horloge** de la page
(`page.addInitScript` pour remplacer `Date`/`Intl`) par pas de 3 h sur 24 h et observe les
variantes. Attention aux courses d'hydratation : refais chaque point plusieurs fois.

### 3.8 Dépendances externes : ça peut tomber en panne
Un `<iframe>`, un CDN, un service tiers peuvent renvoyer **403, 429 ou varier** selon l'IP, le
referer, ou un challenge anti-bot. Vérifie le **statut HTTP réel** de chaque ressource externe,
et signale-le : une dépendance externe est un risque de production, même si le rendu est 1:1.
Si c'est un shader / une lib identifiable, **extrais le code source** : tu pourras le ré-embarquer
et supprimer la dépendance (le dire à l'utilisateur, avec le coût).

### 3.9 Les valeurs résiduelles sur les images ne sont pas un bug
Après vérification md5 + géométrie à 6 décimales + cross-corrélation à `(0,0)`, un résidu de
**~0,5–0,6 sur 255 par canal** (`MAE ≈ 0,002`, soit **0,08 %** d'écart moyen) sur des zones
d'image est un artefact du pipeline de rastérisation de Chrome
(décodage, mise à l'échelle, couche composée). Il est **invisible**, il ne dépend ni de tes
octets ni de ta mise en page, et il n'est pas réparable. **Documente-le et passe à autre chose.**

### 3.10 Les pages sont longues et les outils ont des délais
Les scripts de mesure sur 25 viewports dépassent vite le délai par défaut : lance-les en
**tâche de fond** et récupère leur sortie. Ne les relance pas en boucle.

---

## 4. Déroulé A → Z

### Phase 0 — Reconnaissance
- Identifie la stack (Framer ? Webflow ? Next ?) via les attributs `data-*`, les bundles, les
  `<style>` inline.
- **Breakpoints** : Framer nomme ses breakpoints (classes du type `framer-xxxx` par plage).
  Détermine **exactement** celui qui s'applique à ton viewport de test, et cite-le.
- Recense les sections : `top` et `height` de chacune, mesurés.
- Recense les comportements dynamiques (voir 3.5/3.6).
- Inventorie les ressources externes et leur statut HTTP.

### Phase 1 — Capture de la vérité
- **DOM hydraté** complet → `dom-live.json` (avec rects, styles calculés, textes, attributs).
- **CSS** : tous les `<style>` et feuilles, concaténés **tels quels** (ne réécris rien, ne
  « nettoie » rien). Recompte les `@font-face` et les `@media`.
- **Assets** : télécharge **toutes** les variantes (y compris chaque candidat `srcset`),
  nomme-les de façon stable et vérifie les **md5**.
- Localise les données d'animation (Lottie JSON, sprites, séquences) si présentes.

### Phase 2 — Génération du code
- Écris un **générateur** `dom-live.json → JSX` plutôt que de recopier à la main : c'est ce qui
  garantit 0 px d'écart, et ça rend la régénération gratuite après chaque correction.
- Règles à implémenter dans le générateur :
  - noms d'attributs JSX (`srcset → srcSet`, `class → className`, `for → htmlFor`,
    `style` → objet React avec les propriétés personnalisées **entre guillemets**) ;
  - localisation des URLs d'assets, y compris **dans** `srcset` ;
  - remplacement des éléments dynamiques par des composants React (horloge, Lottie, etc.) ;
  - préservation à l'identique des attributs `data-*` (utiles pour cibler les comportements).
- **Ne recopie pas seulement le conteneur principal** : recense **tous** les enfants de la racine,
  y compris les surcouches, les extras et les éléments ajoutés par le runtime (3.2) — et place-les
  au **même niveau** que dans l'original (`position: fixed` mal placé = élément pleine largeur).

### Phase 3 — Chaîne de build
- Bundler (esbuild) : bundle, `format: iife`, `minify`, JSX automatique,
  `define: { 'process.env.NODE_ENV': '"production"' }`.
- Sors un `dist/` **auto-suffisant** avec des chemins **relatifs** (`./app.js`, `assets/…`) :
  le même dossier doit fonctionner à la racine **et** dans un sous-chemin.
- Serveur statique local pour les mesures, sur un port dédié.

### Phase 4 — Itération section par section
Pour chaque section : diff géométrie → diff styles (groupé par signature) → diff texte →
diff pixels → correctif → **re-mesure**. Ne passe à la section suivante que lorsque le diff
masqué de la section est au niveau du plancher de bruit.

### Phase 5 — Dynamique
Implémente chaque comportement **avec ses constantes mesurées**, en un seul module
(`behaviors.js`) : un `scroll` listener pour tout ce qui est scroll-lié, **une seule** boucle
`requestAnimationFrame` pour tout ce qui est autonome, un `setInterval` pour ce qui dépend de
l'heure. Nettoyage complet au démontage.
Recalcule les positions **à chaque frame** depuis l'état, ne les incrémente pas (sinon dérive).

### Phase 6 — Chrome injecté par le runtime
Reproduis le bandeau cookies / les overlays à l'identique : géométrie, couleurs, rayon, ombre,
polices, textes, et **comportement au clic** (persistance). C'est souvent le plus gros gain de diff.

### Phase 7 — Vérification finale
- Balayage complet (25 viewports) : brut + masqué + MAE.
- Re-mesure du plancher de bruit **le jour de la mesure**.
- Tableau final : hauteur, géométrie, texte, polices, assets, poids du bundle.
- Vérifie **la page déployée** (pas seulement le build local) : statuts HTTP, **0 erreur console**,
  **0 réponse 4xx**, géométrie identique, comportements actifs.

### Phase 8 — Déploiement
- Publie `dist/` sur `{HOTE}/{SOUS_CHEMIN}`.
- Vérifie le **retour HTTP** de la page, du JS, du CSS et d'un asset.
- Relance une vérification en production.

---

## 5. Livrables

1. `{DOSSIER}/ui/` — l'application React + CSS + les assets.
2. `{DOSSIER}/_recon/` — **le harnais de mesure** (le script de capture, le générateur, le diff
   pixel, le diff de styles, le diff de géométrie, la classification des animations, la mesure
   du bruit, la vérification des assets). C'est ce qui rend le résultat vérifiable.
3. `README.md` contenant :
   - le **protocole** de mesure, noir sur blanc ;
   - **tous les chiffres** (brut, masqué, MAE, plancher de bruit) ;
   - la liste des comportements avec **leurs constantes mesurées** ;
   - la liste **honnête** des écarts connus, chacun avec sa cause identifiée et son ordre de grandeur ;
   - les commandes pour builder, mesurer et déployer ;
   - ce qui dépend d'une ressource externe.
4. Une **image de comparaison** original | clone | différence ×4, à plusieurs positions de scroll.

---

## 6. Critère de succès

- **0 px** d'écart de géométrie sur l'ensemble des éléments.
- **0** écart de texte, **0** écart de police chargée.
- Diff pixel **masqué** ≤ **3 × le plancher de bruit** (soit typiquement **≤ 1,5 %**).
- Diff pixel **brut** expliqué : chaque zone restante est soit animée, soit documentée.
- Comportements identiques en **vitesse, amplitude, période et sens**.
- Aucun écart non expliqué : tout écart restant a une cause **mesurée**, pas supposée.

---

## 7. Format de restitution

À chaque itération, une ligne par écart, sous cette forme :

```
Section « {nom} »  (scroll {y})
  geometrie   : 0 px d'ecart sur {n} elements
  styles      : {n} signatures  -> {liste des proprietes}
  texte       : 0 ecart
  pixels      : brut {a}% | masque {b}% | MAE {c}   (bruit {d}%)
  correctif   : {ce que tu as change, et la mesure avant/apres}
```

Et à la fin, la liste des points **que tu ne peux pas résoudre seul**, avec pour chacun :
la mesure, la cause identifiée, les options possibles et leur coût. **Sans trancher à ma place.**
