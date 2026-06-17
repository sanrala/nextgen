// GuidesAstuces.jsx
// Page d'arrivée "Guides & Astuces" — catalogue des jeux ayant au moins
// un guide ou une astuce publié. Style editorial dark / cinema, cohérent
// avec GameDetail.jsx (variables --gd-*).

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../../Firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./GuidesAstuces.css";

function GameCard({ game }) {
  const slug = game.id.replace(/^ig_/, "");
  return (
    <Link to={`/guides/${slug}`} className="ga-card">
      <div className="ga-card-img-wrap">
        <img
          src={game.gameImg}
          alt={game.gameName}
          className="ga-card-img"
          onError={(e) => { e.target.style.opacity = 0; }}
        />
        <div className="ga-card-gradient" />
        <span className="ga-card-count">
          {game.guidesCount} {game.guidesCount > 1 ? "entrées" : "entrée"}
        </span>
      </div>
      <div className="ga-card-body">
        <h3 className="ga-card-title">{game.gameName}</h3>
        {game.gameType && <span className="ga-card-type">{game.gameType}</span>}
      </div>
    </Link>
  );
}

function GuidesAstuces() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const q = query(collection(db, "gameGuides"), orderBy("updatedAt", "desc"));
        const snap = await getDocs(q);
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((g) => (g.guidesCount || 0) > 0);
        setGames(list);
      } catch (e) {
        console.error("Erreur chargement guides:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const filtered = search.trim().length > 0
    ? games.filter((g) => g.gameName?.toLowerCase().includes(search.toLowerCase()))
    : games;

  return (
    <>
      <Header />
      <div className="ga-container">
        <div className="ga-hero">
          <div className="ga-hero-eyebrow">Base de connaissances</div>
          <h1 className="ga-hero-title">Guides &amp; Astuces</h1>
          <p className="ga-hero-sub">
            Walkthroughs, conseils techniques et astuces de jeu, classés par titre.
          </p>
        </div>

        <div className="ga-search-wrap">
          <span className="ga-search-icon">🔍</span>
          <input
            className="ga-search-input"
            type="text"
            placeholder="Rechercher un jeu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && (
          <div className="ga-empty">Chargement des guides...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="ga-empty">
            {search ? "Aucun jeu ne correspond à cette recherche." : "Aucun guide n'a encore été publié."}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="ga-grid">
            {filtered.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default GuidesAstuces;
