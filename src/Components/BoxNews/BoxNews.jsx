import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function ArticleMedia({ article, large = false }) {
  const [playing, setPlaying] = useState(false);
  const ytId = getYoutubeId(article.youtube_url);
  const img = article.photos?.[0]?.url || article.game_img;
  const cls = large ? "large-image" : "small-image";

  if (ytId && playing) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
        title={article.title}
        className={cls}
        style={{ border: "none", width: "100%", height: "100%", display: "block" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <img
        src={ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : img}
        alt={article.title}
        className={cls}
        onError={(e) => {
          // Fallback thumbnail qualité inférieure
          if (ytId && e.target.src.includes("maxresdefault")) {
            e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
          } else {
            e.target.style.display = "none";
          }
        }}
      />
      {ytId && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPlaying(true); }}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(221,22,59,0.9)",
            border: "none",
            borderRadius: "50%",
            width: large ? 60 : 40,
            height: large ? 60 : 40,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
            transition: "background 0.15s",
            zIndex: 2,
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(221,22,59,1)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(221,22,59,0.9)"}
        >
          <svg width={large ? 24 : 16} height={large ? 24 : 16} viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      )}
      <span className="nk-post-categories">
        <span className="bg-main-1">{ytId ? "▶ VIDEO" : "NEWS"}</span>
      </span>
    </div>
  );
}

function BoxNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("status", "==", "public"),
          orderBy("created_at", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ doc_id: doc.id, ...doc.data() }));
        setArticles(data);
      } catch (e) {
        console.error("Erreur chargement articles", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading || articles.length === 0) return null;

  const main = articles[0];
  const rest = articles.slice(1);

  return (
    <div>
      <Link to="/actualités">
        <h3 className="nk-decorated-h-2">
          <span>
            <span className="text-main-1">Actualités</span> du jour
          </span>
        </h3>
      </Link>
      <div className="nk-gap"></div>

      <div className="nk-news-box">
        <div className="gallery-container">

          {/* Grande image/vidéo — article le plus récent */}
          <div className="large-image-container">
            <ArticleMedia article={main} large={true} />
            <Link to={`/article/${main.doc_id}`} className="image-title-large">
              {main.title}
            </Link>
          </div>

          {/* Petites images/vidéos — 4 articles suivants */}
          <div className="small-images-container">
            {rest.map((article) => (
              <div key={article.doc_id} className="small-image-container">
                <ArticleMedia article={article} large={false} />
                <Link to={`/article/${article.doc_id}`} className="image-title">
                  {article.title}
                </Link>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default BoxNews;