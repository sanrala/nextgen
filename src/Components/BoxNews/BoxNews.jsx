import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function BoxNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVideo, setExpandedVideo] = useState(null); // ytId de la vidéo agrandie
  const [playingMain, setPlayingMain] = useState(false);

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

  const mainYtId = getYoutubeId(main.youtube_url);
  const mainImg  = main.photos?.[0]?.url || main.game_img;

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

          {/* ── Grande carte ── */}
          <div className="large-image-container">
            {mainYtId && playingMain ? (
              <iframe
                src={`https://www.youtube.com/embed/${mainYtId}?autoplay=1&rel=0`}
                title={main.title}
                className="large-image"
                style={{ border: "none", width: "100%", height: "100%", display: "block" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <img
                  src={mainYtId ? `https://img.youtube.com/vi/${mainYtId}/maxresdefault.jpg` : mainImg}
                  alt={main.title}
                  className="large-image"
                  onError={e => {
                    if (mainYtId && e.target.src.includes("maxresdefault"))
                      e.target.src = `https://img.youtube.com/vi/${mainYtId}/hqdefault.jpg`;
                    else e.target.style.display = "none";
                  }}
                />
                {mainYtId && (
                  <button onClick={() => setPlayingMain(true)} style={playBtnStyle(60)}>
                    <PlayIcon size={24} />
                  </button>
                )}
                <span className="nk-post-categories">
                  <span className="bg-main-1">{mainYtId ? "▶ VIDEO" : "NEWS"}</span>
                </span>
              </div>
            )}
            <Link to={`/article/${main.doc_id}`} className="image-title-large">{main.title}</Link>
          </div>

          {/* ── Petites cartes ── */}
          <div className="small-images-container" style={{ position: "relative" }}>

            {/* Vidéo agrandie par-dessus les 4 petites cartes */}
            {expandedVideo && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 10,
                background: "#000", borderRadius: 4, overflow: "hidden",
                animation: "zoomIn 0.3s cubic-bezier(.4,0,.2,1) forwards",
              }}>
                <style>{`
                  @keyframes zoomIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to   { transform: scale(1);   opacity: 1; }
                  }
                  @keyframes zoomOut {
                    from { transform: scale(1);   opacity: 1; }
                    to   { transform: scale(0.5); opacity: 0; }
                  }
                  .video-closing {
                    animation: zoomOut 0.25s cubic-bezier(.4,0,.2,1) forwards !important;
                  }
                `}</style>
                <iframe
                  src={`https://www.youtube.com/embed/${expandedVideo}?autoplay=1&rel=0`}
                  title="video"
                  style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Bouton fermer */}
                <button
                  onClick={(e) => {
                    const container = e.currentTarget.parentElement;
                    container.classList.add("video-closing");
                    setTimeout(() => setExpandedVideo(null), 240);
                  }}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.7)", border: "1px solid #555",
                    borderRadius: "50%", width: 32, height: 32,
                    cursor: "pointer", color: "#fff", fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 11, lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            {rest.map((article) => {
              const ytId = getYoutubeId(article.youtube_url);
              const img  = article.photos?.[0]?.url || article.game_img;
              return (
                <div key={article.doc_id} className="small-image-container">
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <img
                      src={ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : img}
                      alt={article.title}
                      className="small-image"
                      onError={e => e.target.style.display = "none"}
                    />
                    {ytId && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpandedVideo(ytId); }}
                        style={playBtnStyle(36)}
                      >
                        <PlayIcon size={14} />
                      </button>
                    )}
                    <span className="nk-post-categories">
                      <span className="bg-main-1">{ytId ? "▶ VIDEO" : "NEWS"}</span>
                    </span>
                  </div>
                  <Link to={`/article/${article.doc_id}`} className="image-title">
                    {article.title}
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

function playBtnStyle(size) {
  return {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(221,22,59,0.9)", border: "none",
    borderRadius: "50%", width: size, height: size,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.5)", zIndex: 2,
  };
}

function PlayIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

export default BoxNews;