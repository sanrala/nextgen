// guidesHelpers.js
// Logique de résolution du jeu "pivot" pour les Guides & Astuces.
// Réutilise le système d'éditions déjà en place dans GameDetail.jsx
// (games/ig_{id}.editions) pour qu'un guide créé depuis une édition
// soit retrouvable depuis n'importe quelle autre édition du même jeu.

import { db } from "../../Firebase";
import {
  doc, getDoc, setDoc, collection, query, where, orderBy, limit,
  getDocs, serverTimestamp,
} from "firebase/firestore";

/**
 * Récupère tous les igId connus pour le jeu courant (lui-même + ses éditions),
 * en lisant le doc games/ig_{igId} déjà alimenté par GameDetail.jsx.
 */
export async function getRelatedIgIds(igId) {
  if (!igId) return [];
  try {
    const snap = await getDoc(doc(db, "games", `ig_${igId}`));
    const editions = snap.exists() ? (snap.data().editions || []) : [];
    const ids = new Set([String(igId), ...editions.map((e) => String(e.id))]);
    return [...ids];
  } catch (e) {
    console.warn("getRelatedIgIds:", e.message);
    return [String(igId)];
  }
}

/**
 * Retrouve le doc gameGuides correspondant au jeu courant, quelle que soit
 * l'édition par laquelle on arrive. Retourne null si aucun guide n'existe
 * encore pour ce jeu.
 */
export async function findGameGuidesDoc(igId) {
  const relatedIds = await getRelatedIgIds(igId);

  // 1. Essai direct : un doc gameGuides existe peut-être déjà avec cet igId comme ID pivot
  const directSnap = await getDoc(doc(db, "gameGuides", `ig_${igId}`));
  if (directSnap.exists()) {
    return { id: directSnap.id, ...directSnap.data() };
  }

  // 2. Sinon, recherche parmi tous les docs gameGuides celui dont allIgIds
  // contient un des igId reliés (édition différente utilisée à la création)
  const q = query(
    collection(db, "gameGuides"),
    where("allIgIds", "array-contains-any", relatedIds.slice(0, 30))
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  }
  return null;
}

/**
 * Crée (ou met à jour) le doc pivot gameGuides pour un jeu, à appeler
 * à la création du premier guide/astuce d'un jeu.
 * Filtre les valeurs undefined (Firestore les refuse) en les remplaçant par null.
 */
export async function ensureGameGuidesDoc({ igId, gameName, gameImg, gameType }) {
  const relatedIds = await getRelatedIgIds(igId);
  const existing = await findGameGuidesDoc(igId);

  const safeGameName = gameName ?? "Jeu inconnu";
  const safeGameImg  = gameImg ?? null;
  const safeGameType = gameType ?? null;

  if (existing) {
    const mergedIds = [...new Set([...(existing.allIgIds || []), ...relatedIds])];
    await setDoc(doc(db, "gameGuides", existing.id), {
      allIgIds: mergedIds,
      gameName: safeGameName,
      gameImg: safeGameImg,
      gameType: safeGameType,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return existing.id;
  }

  const pivotId = `ig_${igId}`;
  await setDoc(doc(db, "gameGuides", pivotId), {
    allIgIds: relatedIds,
    gameName: safeGameName,
    gameImg: safeGameImg,
    gameType: safeGameType,
    guidesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return pivotId;
}

/**
 * Enregistre une référence légère dans la collection plate "recentGuides",
 * utilisée uniquement pour afficher les derniers guides/astuces publiés
 * toutes éditions confondues (page d'accueil). À appeler en plus de l'écriture
 * dans gameGuides/{pivotId}/items, jamais à sa place.
 * Si le doc existe déjà (cas d'une édition ultérieure), createdAt n'est jamais
 * écrasé — seule la première écriture fixe la date d'apparition dans "récents".
 */
export async function recordRecentGuide({ itemId, pivotId, igId, gameName, gameImg, type, title, forceCreatedAt = false }) {
  try {
    const ref = doc(db, "recentGuides", itemId);
    const existing = forceCreatedAt ? null : await getDoc(ref);
    const payload = {
      pivotId,
      igId: String(igId),
      gameName: gameName ?? "Jeu inconnu",
      gameImg: gameImg ?? null,
      type,
      title,
    };
    if (!existing || !existing.exists()) {
      payload.createdAt = serverTimestamp();
    }
    await setDoc(ref, payload, { merge: true });
  } catch (e) {
    console.warn("recordRecentGuide:", e.message);
  }
}

/**
 * Récupère les N derniers guides/astuces publiés, toutes éditions et tous
 * jeux confondus, pour affichage sur la page d'accueil.
 */
export async function getRecentGuides(limitCount = 6) {
  try {
    const q = query(
      collection(db, "recentGuides"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn("getRecentGuides:", e.message);
    return [];
  }
}
