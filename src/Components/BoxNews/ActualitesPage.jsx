import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const STYLES = `
  .actu-page {
    padding-top: 110px;
    padding-bottom: 60px;
    min-height: 100vh;
  }
  .actu-hero {
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .actu-hero-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #fff;
    margin: 0 0 4px;
    line-height: 1;
  }
  .actu-hero-title span { color: #dd163b; }
  .actu-hero-sub {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #444;
  }

  /* Grille */
  .actu-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  @media (max-width: 991px) { .actu-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 575px)  { .actu-grid { grid-template-columns: 1fr; } }

  /* Card */
  .actu-card {
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
    text-decoration: none;
  }
  .actu-card:hover {
    transform: translateY(-4px);
    border-color: rgba(221,22,59,0.3);
    box-shadow: 0 12px 36px rgba(0,0,0,0.45);
  }
  .actu-card-img {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: #111;
  }
  .actu-card-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .actu-card:hover .actu-card-img img { transform: scale(1.04); }
  .actu-card-badge {
    position: absolute;
    top: 10px; left: 10px;
    background: #dd163b;
    color: #fff;
    font-size: 9px;
    font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    padding: 3px 8px;
    border-radius: 3px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .actu-card-body {
    padding: 14px 16px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .actu-card-date {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: #444;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .actu-card-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #ddd;
    line-height: 1.3;
    margin: 0;
    transition: color 0.15s;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .actu-card:hover .actu-card-title { color: #fff; }
  .actu-card-excerpt {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    color: #555;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex: 1;
  }
  .actu-card-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 4px;
  }
  .actu-card-link {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    font-weight: 700;
    color: #dd163b;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* Loading / vide */
  .actu-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 0; gap: 16px;
  }
  .actu-spinner {
    width: 36px; height: 36px;
    border: 2px solid rgba(221,22,59,0.15);
    border-top-color: #dd163b;
    border-radius: 50%;
    animation: actuSpin 0.75s linear infinite;
  }
  @keyframes actuSpin { to { transform: rotate(360deg); } }
  .actu-spinner-text {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px; letter-spacing: 0.2em;
    color: #333; text-transform: uppercase;
  }
  .actu-empty {
    text-align: center; padding: 80px 0;
    color: #333; font-family: 'Montserrat', sans-serif;
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  }
`;

function ActualitesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("status", "==", "public"),
          orderBy("created_at", "desc")
        );
        const snap = await getDocs(q);
        setArticles(snap.docs.map(d => ({ doc_id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Erreur chargement articles", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="App">
      <style>{STYLES}</style>
      <Header />
      <div className="nk-main">
        <div className="container actu-page">

          <div className="actu-hero">
            <h1 className="actu-hero-title">
              <span>Actualités</span> Gaming
            </h1>
            <div className="actu-hero-sub">NextGen Gaming — Toutes les news</div>
          </div>

          {loading && (
            <div className="actu-loading">
              <div className="actu-spinner" />
              <span className="actu-spinner-text">Chargement des articles</span>
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="actu-empty">Aucun article disponible.</div>
          )}

          {!loading && articles.length > 0 && (
            <div className="actu-grid">
              {articles.map(article => {
                const ytId = getYoutubeId(article.youtube_url);
                const img  = ytId
                  ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
                  : article.photos?.[0]?.url || article.game_img;

                return (
                  <Link
                    key={article.doc_id}
                    to={`/article/${article.doc_id}`}
                    className="actu-card"
                  >
                    <div className="actu-card-img">
                      <img
                        src={img}
                        alt={article.title}
                        onError={e => {
                          if (ytId && e.target.src.includes("maxresdefault"))
                            e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                        }}
                      />
                      <span className="actu-card-badge">
                        {article.isTest ? (article.testCategory || "TESTS") : ytId ? "▶ Vidéo" : "News"}
                      </span>
                    </div>
                    <div className="actu-card-body">
                      <div className="actu-card-date">{formatDate(article.created_at)}</div>
                      <div className="actu-card-title">{article.title}</div>
                      {article.excerpt && (
                        <div className="actu-card-excerpt">{article.excerpt}</div>
                      )}
                      <div className="actu-card-footer">
                        <span className="actu-card-link">Lire l'article →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </div>
      <div className="separator product-panel" />
      <Footer />
    </div>
  );
}

export default ActualitesPage;