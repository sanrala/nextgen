import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Sorties() {
  const [games, setGames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch("https://api.sm-artweb.fr/api/latest-releases");
        const data = await res.json();
        const today = new Date();

        const filtered = data
          .filter(g => {
            if (!g.releaseDate) return false;
            if (new Date(g.releaseDate) > today) return false;
            const cats = Array.isArray(g.category)
              ? g.category.map(c => c.toLowerCase())
              : [(g.category || "").toLowerCase()];
            if (cats.some(c => c.includes("indie"))) return false;
            return true;
          })
          .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
          .slice(0, 6);

        setGames(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    if (games.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % games.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [games]);

  const current = games[currentIndex];
  if (!current) return null;

  const gameUrl = (g) =>
    `/store/${g.id}/${g.steam_id || 0}/${g.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}`;

  return (
    <div className="sorties-section">

   <div className="row vertical-gap">
  <div className="col-lg-12">
    <Link to="/populaires?catFilter=nouveautes">
      <h3 className="nk-decorated-h-2">
        <span>
          <span className="text-main-1">Les dernières</span> sorties
        </span>
      </h3>
    </Link>
    <div className="nk-gap" />

    <div className="sr-grid">
      {/* ... reste du JSX inchangé */}
    </div>
  </div>
</div>

      <div className="sr-grid">

        {/* Grande image à gauche */}
        <div className="sr-main-card">
          <div
            className="sr-main-img"
            style={{ backgroundImage: `url(${current.img})` }}
          >
            <div className="sr-main-gradient" />
            <div className="sr-main-badge">{current.price}€</div>
            <div className="sr-main-info">
              <span className="sr-tag">SORTIE</span>
              <Link to={gameUrl(current)}>
                <h2 className="sr-main-title">{current.name}</h2>
              </Link>
              <p className="sr-main-date">📅 {current.releaseDate}</p>
            </div>
          </div>
        </div>

        {/* Liste droite — clic = sélection */}
        <div className="sr-list">
          {games.map((g, i) => (
            <div
              key={g.id}
              className={`sr-item${i === currentIndex ? " sr-item-active" : ""}`}
              onClick={() => setCurrentIndex(i)}
            >
              <div
                className="sr-item-img"
                style={{ backgroundImage: `url(${g.img})` }}
              />
              <div className="sr-item-body">
                <span className="sr-tag">SORTIE</span>
                <p className="sr-item-title">{g.name}</p>
                <p className="sr-item-date">📅 {g.releaseDate}</p>
              </div>
              <div className="sr-item-price">{g.price}€</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Sorties;