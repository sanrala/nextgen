# Guides & Astuces — Intégration

## Fichiers livrés
- `guidesHelpers.js` — résolution du pivot multi-éditions + écriture Firestore
- `GuideQuillEditor.jsx` — éditeur React Quill avec upload image Cloudinary inline
- `GuidesAstuces.jsx` — niveau 1 : catalogue des jeux ayant des guides (`/guides`)
- `GameGuides.jsx` — niveau 2 : guides/astuces d'un jeu (`/guides/:gameSlug`)
- `GuideCreateModal.jsx` — modale admin de création/édition
- `GuideReadPage.jsx` — niveau 3 : lecture d'un guide (`/guides/:gameSlug/:guideId`)
- `GuidesAstuces.css` — tout le style, basé sur les variables `--gd-*` déjà en place

Placer ces fichiers dans le même dossier que `GameDetail.jsx` (ex: `src/components/GameDetail/` ou un nouveau dossier `src/components/Guides/` — adapter alors les imports relatifs `../../Firebase`, `../../useAdmin`, `../Header/Header`, `../Footer/Footer` en conséquence).

## 1. Routes à ajouter (fichier de routes principal, ex: App.jsx)

```jsx
import GuidesAstuces from "./components/Guides/GuidesAstuces";
import GameGuides from "./components/Guides/GameGuides";
import GuideReadPage from "./components/Guides/GuideReadPage";

// ...
<Route path="/guides" element={<GuidesAstuces />} />
<Route path="/guides/:gameSlug" element={<GameGuides />} />
<Route path="/guides/:gameSlug/:guideId" element={<GuideReadPage />} />
```

## 2. Lien dans la Navbar

Dans `Navbar.jsx`, ajouter un lien classique vers `/guides` au même endroit que les autres entrées de menu (Jeux, Tendances, etc.) :

```jsx
<Link to="/guides">Guides & Astuces</Link>
```

## 3. Lien depuis GameDetail.jsx

Ajouter un bouton/lien vers la page guides du jeu courant. Le plus simple est de pointer directement sur l'igId courant (la résolution multi-éditions se fait automatiquement côté `GameGuides.jsx` via `findGameGuidesDoc`) :

```jsx
<Link to={`/guides/${igId}`} className="gd-guides-link">
  📖 Guides & Astuces de ce jeu
</Link>
```

Placer ce lien par exemple à côté du bouton wishlist ou dans la barre d'onglets (`activeTab`), selon ce qui te semble le plus visible. Un style minimal cohérent avec le reste (optionnel, à ajouter dans le CSS de GameDetail si tu veux un bouton plutôt qu'un simple lien) :

```css
.gd-guides-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--gd-text);
  border: 1px solid var(--gd-line2);
  border-radius: 4px;
  padding: 10px 16px;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}
.gd-guides-link:hover { border-color: var(--gd-red); color: var(--gd-red); }
```

## 4. Règles Firestore à ajouter

```
match /gameGuides/{pivotId} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.admin == true;

  match /items/{itemId} {
    allow read: if true;
    allow write: if request.auth != null && request.auth.token.admin == true;
  }
}
```
(Adapter la condition `admin == true` à ton mécanisme actuel utilisé par `useAdmin()` si différent — vérifier `useAdmin.js` pour la source de vérité exacte : custom claim, doc Firestore `admins/{uid}`, etc.)

## 5. Index Firestore à créer

La requête `findGameGuidesDoc` utilise un `array-contains-any` sur `allIgIds` — aucun index composite nécessaire (requête simple sur un seul champ tableau).
La requête de tri `orderBy("updatedAt", "desc")` sur `gameGuides` et `orderBy("createdAt", "desc")` sur la sous-collection `items` sont aussi simples (un seul champ), donc pas d'index composite requis non plus. Si Firestore te réclame un index au runtime (cas de filtre combiné futur), la console Firebase fournira le lien direct de création.

## Comment ça fonctionne (résumé du flux)

1. **Création** : l'admin clique sur "+" depuis `/guides/{igId}` (ou depuis le lien ajouté dans `GameDetail.jsx`, qui pointe vers l'igId de l'édition affichée). La modale `GuideCreateModal` récupère `existingGameName`/`existingGameImg` déjà résolus par `GameGuides.jsx` — le titre du jeu vient donc bien de l'ID Instant Gaming, automatiquement, sans ressaisie.
2. **Pivot multi-éditions** : `ensureGameGuidesDoc` lit `games/ig_{igId}.editions` (déjà alimenté par `GameDetail.jsx`) pour connaître tous les igId frères, et les stocke dans `gameGuides/{pivotId}.allIgIds`. N'importe quelle édition pourra ensuite retrouver les mêmes guides via `findGameGuidesDoc`.
3. **Édition de contenu** : `GuideQuillEditor` ajoute un bouton image custom à la toolbar Quill. Au clic, sélection de fichier → upload Cloudinary (`nextgen/guides`) → insertion de l'URL à la position exacte du curseur dans le contenu HTML. Texte et images peuvent donc être librement entremêlés, contrairement au système actuel des articles où les photos sont à part.
4. **Lecture** : `GuideReadPage` affiche `item.content` (HTML Quill) via `dangerouslySetInnerHTML`, stylé par les règles `.ga-article-content` qui imitent le rendu `.ql-editor`.
5. **Modification ultérieure** : le bouton "✎" (sur la carte liste ou sur la page de lecture) rouvre la même modale en mode édition, pré-remplie avec le contenu existant.

## Point d'attention

`findGameGuidesDoc` fait un essai direct sur `gameGuides/ig_{igId}` puis, si rien, une requête `array-contains-any` sur `allIgIds`. Si tu crées énormément de guides (centaines de jeux), c'est performant car indexé nativement par Firestore sur les champs tableau — pas de souci de scalabilité à prévoir ici.
