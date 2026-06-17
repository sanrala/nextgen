// GuideReadPage.jsx
// Page de lecture d'un guide ou d'une astuce — niveau 3.
// URL dédiée et partageable : /guides/{gameSlug}/{guideId}

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAdmin } from "../../useAdmin";
import { findGameGuidesDoc } from "./guidesHelpers";
import GuideCreateModal from "./GuideCreateModal";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./GuidesAstuces.css";

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Regroupe les <p><img></p> consécutifs (cas réel généré par Quill quand
 * plusieurs images sont insérées l'une après l'autre) dans un conteneur
 * .ga-image-gallery, pour un affichage en rangée façon magazine plutôt
 * que chaque image empilée en pleine largeur.
 */
function groupConsecutiveImageParagraphs(html) {
  if (!html || typeof document === "undefined") return html;
  const container = document.createElement("div");
  container.innerHTML = html;

  // Trouve l'<img> d'un <p> qu'il soit en enfant direct, ou enveloppé dans
  // un unique <span> intermédiaire (cas réel généré par Quill/collage avec
  // une couleur de texte appliquée, ex: <p><span style="..."><img/></span></p>).
  const getSoloImg = (node) => {
    if (node?.tagName !== "P" || node.children.length !== 1) return null;
    const only = node.children[0];
    if (only.tagName === "IMG" && node.textContent.trim() === "") return only;
    if (
      only.tagName === "SPAN" &&
      only.children.length === 1 &&
      only.children[0].tagName === "IMG" &&
      node.textContent.trim() === ""
    ) {
      return only.children[0];
    }
    return null;
  };

  let node = container.firstChild;
  while (node) {
    const img = getSoloImg(node);
    if (img) {
      const group = [{ p: node, img }];
      let next = node.nextSibling;
      while (next) {
        const nextImg = getSoloImg(next);
        if (!nextImg) break;
        group.push({ p: next, img: nextImg });
        next = next.nextSibling;
      }
      if (group.length > 1) {
        const wrapper = document.createElement("div");
        wrapper.className = `ga-image-gallery ga-gallery-${Math.min(group.length, 3)}`;
        group.forEach(({ img }) => {
          wrapper.appendChild(img); // déplace l'<img>, en l'extrayant du <span> le cas échéant
        });
        container.insertBefore(wrapper, group[0].p);
        group.forEach(({ p }) => container.removeChild(p));
        node = next;
        continue;
      }
    }
    node = node.nextSibling;
  }

  return container.innerHTML;
}

function GuideReadPage() {
  const { gameSlug, guideId } = useParams();
  const igId = gameSlug?.replace(/^ig_/, "");
  const { isAdmin } = useAdmin();

  const [pivotDoc, setPivotDoc] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const found = await findGameGuidesDoc(igId);
      setPivotDoc(found);
      if (found) {
        const snap = await getDoc(doc(db, "gameGuides", found.id, "items", guideId));
        if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
      }
    } catch (e) {
      console.error("Erreur chargement guide:", e);
    } finally {
      setLoading(false);
    }
  }, [igId, guideId]);

  useEffect(() => { load(); }, [load]);

  const processedContent = useMemo(
    () => groupConsecutiveImageParagraphs(item?.content),
    [item?.content]
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="ga-container"><div className="ga-empty">Chargement...</div></div>
        <Footer />
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Header />
        <div className="ga-container">
          <div className="ga-empty">
            Ce guide n'existe pas ou plus.
            <div style={{ marginTop: 16 }}>
              <Link to={`/guides/${gameSlug}`} className="ga-cta-btn">← Retour aux guides du jeu</Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="ga-container ga-read-container">
        <Link to={`/guides/${gameSlug}`} className="ga-back-link">
          ← {pivotDoc?.gameName || "Retour"}
        </Link>

        <article className="ga-article">
          <span className={`ga-item-badge ga-item-badge-${item.type}`}>
            {item.type === "guide" ? "📖 Guide" : "💡 Astuce"}
          </span>
          <h1 className="ga-article-title">{item.title}</h1>
          <div className="ga-article-meta">
            {pivotDoc?.gameName && <span>{pivotDoc.gameName}</span>}
            {item.updatedAt && <span>· Mis à jour le {formatDate(item.updatedAt)}</span>}
            {isAdmin && (
              <button className="ga-item-edit-btn ga-article-edit-btn" onClick={() => setShowEdit(true)}>
                ✎ Modifier
              </button>
            )}
          </div>

          <div
            className="ga-article-content ql-editor"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </article>
      </div>

      {showEdit && (
        <GuideCreateModal
          igId={igId}
          existingGameName={pivotDoc?.gameName}
          existingGameImg={pivotDoc?.gameImg}
          editingItem={item}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); load(); }}
        />
      )}

      <Footer />
    </>
  );
}

export default GuideReadPage;