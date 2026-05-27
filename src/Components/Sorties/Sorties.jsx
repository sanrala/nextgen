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
        setGames(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (games.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [games]);

  const current = games[currentIndex];

  if (!current) return null;

  return (
    <div>
      <Link to="/Sorties/">
        <h3 className="nk-decorated-h-2">
          <span>
            <span className="text-main-1">Les dernières</span> sorties
          </span>
        </h3>
      </Link>

      <div className="nk-gap"></div>

      <div className="carousel">
        <div
          className="main-image"
          style={{ backgroundImage: `url(${current.img})` }}
        >
          <div className="price-tag">{current.price}€</div>

          <div className="image-overlay">
            <Link to={`/PC/${current.id}`}>
              <h2>{current.name}</h2>
            </Link>

            <p>📅 {current.releaseDate}</p>
          </div>
        </div>

        <div className="thumbnail-background">
          <div className="thumbnail-container">
            {games.map((g, i) => (
              <div
                key={g.id}
                className={`thumbnail ${i === currentIndex ? "selected" : ""}`}
                onClick={() => setCurrentIndex(i)}
                style={{ backgroundImage: `url(${g.img})` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sorties;