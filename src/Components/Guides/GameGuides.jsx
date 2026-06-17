// GameGuides.jsx
// Page jeu — niveau 2 : liste des guides & astuces déjà publiés pour ce jeu,
// avec bouton "+" réservé à l'admin pour créer un nouveau guide.
// Si le jeu n'a pas encore de guide, l'admin peut le créer en cherchant
// l'ID Instant Gaming dans le catalogue (comme dans AdminConsole.jsx).

import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../../Firebase";
import {
  collection, query, orderBy, getDocs,
} from "firebase/firestore";
import { useAdmin } from "../../useAdmin";
import { findGameGuidesDoc } from "./guidesHelpers";
import GuideCreateModal from "./GuideCreateModal";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./GuidesAstuces.css";

function GameGuides() {
  const { gameSlug } = useParams();
  const igId = gameSlug?.replace(/^ig_/, "");
  const { isAdmin } = useAdmin();

  const [pivotDoc, setPivotDoc] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Infos jeu de secours si aucun guide n'existe encore (lecture du catalogue/games)
  const [fallbackGame, setFallbackGame] = useState(null);

  const loadEverything = useCallback(async () => {
    setLoading(true);
    try {
      const found = await findGameGuidesDoc(igId);
      setPivotDoc(found);

      if (found) {
        const itemsSnap = await getDocs(
          query(collection(db, "gameGuides", found.id, "items"), orderBy("createdAt", "desc"))
        );
        setItems(itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        setItems([]);
        // Pas encore de guide pour ce jeu : on va chercher son nom/cover
        // dans le catalogue Instant Gaming (seule source fiable côté front)
        try {
          const res = await fetch("https://api.sm-artweb.fr/api/ig-catalog");
          if (res.ok) {
            const catalog = await res.json();
            const match = Array.isArray(catalog)
              ? catalog.find((g) => String(g.id) === String(igId))
              : null;
            if (match) setFallbackGame({ name: match.name, img: match.img, type: match.type });
          }
        } catch { /* silencieux */ }
      }
    } catch (e) {
      console.error("Erreur chargement page jeu guides:", e);
    } finally {
      setLoading(false);
    }
  }, [igId]);

  useEffect(() => { loadEverything(); }, [loadEverything]);

  const gameName = pivotDoc?.gameName || fallbackGame?.name || "Ce jeu";
  const gameImg = pivotDoc?.gameImg || fallbackGame?.img;

  const handleCreated = () => {
    setShowCreate(false);
    setEditingItem(null);
    loadEverything();
  };

  const guides = items.filter((i) => i.type === "guide");
  const astuces = items.filter((i) => i.type === "astuce");

  return (
    <>
      <Header />
      <div className="ga-container">
        <Link to="/guides" className="ga-back-link">← Tous les jeux</Link>

        <div className="ga-game-hero">
          {gameImg && <img src={gameImg} alt={gameName} className="ga-game-hero-img" />}
          <div className="ga-game-hero-info">
            <div className="ga-hero-eyebrow">Guides &amp; Astuces</div>
            <h1 className="ga-game-hero-title">{gameName}</h1>
          </div>
          {isAdmin && (
            <button
              className="ga-add-btn"
              onClick={() => { setEditingItem(null); setShowCreate(true); }}
              title="Créer un guide ou une astuce"
            >
              +
            </button>
          )}
        </div>

        {loading && <div className="ga-empty">Chargement...</div>}

        {!loading && items.length === 0 && (
          <div className="ga-empty">
            Aucun guide ou astuce n'a encore été publié pour ce jeu.
            {isAdmin && (
              <div style={{ marginTop: 16 }}>
                <button className="ga-cta-btn" onClick={() => setShowCreate(true)}>
                  + Créer le premier guide
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && guides.length > 0 && (
          <>
            <h2 className="ga-section-title">Guides</h2>
            <div className="ga-item-grid">
              {guides.map((item) => (
                <GuideItemCard
                  key={item.id}
                  item={item}
                  gameSlug={gameSlug}
                  isAdmin={isAdmin}
                  onEdit={() => { setEditingItem(item); setShowCreate(true); }}
                />
              ))}
            </div>
          </>
        )}

        {!loading && astuces.length > 0 && (
          <>
            <h2 className="ga-section-title">Astuces</h2>
            <div className="ga-item-grid">
              {astuces.map((item) => (
                <GuideItemCard
                  key={item.id}
                  item={item}
                  gameSlug={gameSlug}
                  isAdmin={isAdmin}
                  onEdit={() => { setEditingItem(item); setShowCreate(true); }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showCreate && (
        <GuideCreateModal
          igId={igId}
          existingGameName={gameName}
          existingGameImg={gameImg}
          editingItem={editingItem}
          onClose={() => { setShowCreate(false); setEditingItem(null); }}
          onSaved={handleCreated}
        />
      )}

      <Footer />
    </>
  );
}

function GuideItemCard({ item, gameSlug, isAdmin, onEdit }) {
  return (
    <div className="ga-item-card">
      <Link to={`/guides/${gameSlug}/${item.id}`} className="ga-item-card-link">
        <span className={`ga-item-badge ga-item-badge-${item.type}`}>
          {item.type === "guide" ? "📖 Guide" : "💡 Astuce"}
        </span>
        <h3 className="ga-item-title">{item.title}</h3>
      </Link>
      {isAdmin && (
        <button className="ga-item-edit-btn" onClick={onEdit} title="Modifier">
          ✎
        </button>
      )}
    </div>
  );
}

export default GameGuides;