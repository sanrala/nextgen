import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";

function formatTimeAgo(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) +
    " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const STYLES = `
  .bnd-section { padding-top: 36px; }

  .bnd-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
  }
  /* Les 2 premières cartes occupent 3 colonnes chacune (= moitié) */
  .bnd-card-large { grid-column: span 3; }
  /* Les cartes suivantes occupent 2 colonnes chacune (= tiers) */
  .bnd-card-small { grid-column: span 2; }

  @media (max-width: 900px) {
    .bnd-grid { grid-template-columns: repeat(2, 1fr); }
    .bnd-card-large { grid-column: span 1; }
    .bnd-card-small { grid-column: span 1; }
  }
  @media (max-width: 575px) {
    .bnd-grid { grid-template-columns: 1fr; }
    .bnd-card-large, .bnd-card-small { grid-column: span 1; }
  }

  .bnd-card {
    position: relative;
    aspect-ratio: 16/9;
    border-radius: 8px;
    overflow: hidden;
    display: block;
    text-decoration: none;
    background: #111;
  }
  .bnd-card img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .bnd-card:hover img { transform: scale(1.04); }
  .bnd-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.08) 68%, transparent 100%);
  }

  .bnd-card-body {
    position: absolute;
    left: 16px; right: 16px; bottom: 12px;
    z-index: 2;
  }
  .bnd-card-large .bnd-card-title { font-size: 19px; }
  .bnd-card-small .bnd-card-title { font-size: 14.5px; }
  .bnd-card-title {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 800;
    color: #fff;
    line-height: 1.3;
    margin: 0 0 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }
  .bnd-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .bnd-card-date {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
  }
  .bnd-card-badge {
    font-family: 'Montserrat', sans-serif;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #fff;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.35);
    padding: 4px 11px;
    border-radius: 14px;
  }
`;

function BoxNewsDiv() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("status", "==", "public"),
          orderBy("created_at", "desc"),
          limit(40)
        );
        const snap = await getDocs(q);
        const all = snap.docs.map((doc) => ({ doc_id: doc.id, ...doc.data() }));
        setArticles(all.filter((a) => a.isTest === true).slice(0, 5));
      } catch (e) {
        console.error("Erreur chargement articles divers", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading || articles.length === 0) return null;

  return (
    <div className="bn-section bnd-section">
      <style>{STYLES}</style>
      <div className="row vertical-gap">
        <div className="col-lg-12">
          <Link to="/actualites">
            <h3 className="nk-decorated-h-2">
              <span>
                <span className="text-main-1">Actualités</span> &amp;  diverses
              </span>
            </h3>
          </Link>
          <div className="nk-gap" />
        </div>
      </div>

      <div className="bnd-grid">
        {articles.map((article, i) => {
          const img = article.photos?.[0]?.url || article.game_img;
          const isLarge = i < 2;
          return (
            <Link
              key={article.doc_id}
              to={`/article/${article.doc_id}`}
              className={`bnd-card ${isLarge ? "bnd-card-large" : "bnd-card-small"}`}
            >
              <img
                src={img}
                alt={article.title}
                onError={(e) => (e.target.style.display = "none")}
              />
              <div className="bnd-card-body">
                <div className="bnd-card-title">{article.title}</div>
                <div className="bnd-card-footer">
                  <span className="bnd-card-date">{formatTimeAgo(article.created_at)}</span>
                  <span className="bnd-card-badge">{article.testCategory || "TESTS"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default BoxNewsDiv;