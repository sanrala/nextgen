// RecentGuides.jsx
// Bloc page d'accueil : derniers guides & astuces publiés, toutes éditions
// confondues. Format bannière pleine largeur — liste structurée à gauche,
// grande image à droite. Au survol d'un item de la liste, l'image de droite
// change (crossfade) pour montrer la cover du jeu correspondant ; en quittant
// la liste, elle revient automatiquement à la cover du dernier guide publié.

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentGuides } from "../Guides/guidesHelpers";
import "./RecentGuides.css";

function RecentGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredGuide, setHoveredGuide] = useState(null);

  useEffect(() => {
    getRecentGuides(5)
      .then(setGuides)
      .finally(() => setLoading(false));
  }, []);

  if (loading || guides.length === 0) return null;

  const latest = guides[0];
  const displayed = hoveredGuide || latest;

  return (
    <section className="rg-banner">
      <div className="rg-banner-left">
        <span className="rg-banner-eyebrow">Base de connaissances</span>
        <h2 className="rg-banner-title">Guides &amp; astuces récents</h2>

        <div
          className="rg-banner-list"
          onMouseLeave={() => setHoveredGuide(null)}
        >
          {guides.map((g) => (
            <Link
              key={g.id}
              to={`/guides/${g.igId}/${g.id}`}
              className="rg-banner-item"
              onMouseEnter={() => setHoveredGuide(g)}
            >
              <span className={`rg-banner-dot rg-banner-dot-${g.type}`} />
              <span className="rg-banner-item-text">
                {g.title}
                <span className="rg-banner-item-game"> — {g.gameName}</span>
              </span>
            </Link>
          ))}
        </div>

        <Link to="/guides" className="rg-banner-cta">
          Voir tout →
        </Link>
      </div>

      <Link to={`/guides/${displayed.igId}/${displayed.id}`} className="rg-banner-right">
        {guides.map((g) => (
          g.gameImg && (
            <img
              key={g.id}
              src={g.gameImg}
              alt={g.gameName}
              className="rg-banner-img"
              style={{ opacity: g.id === displayed.id ? 1 : 0 }}
            />
          )
        ))}
        <div className="rg-banner-img-overlay" />
      </Link>
    </section>
  );
}

export default RecentGuides;