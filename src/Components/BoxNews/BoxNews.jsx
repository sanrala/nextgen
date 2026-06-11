import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

// ✅ AJOUT
const isMobile = () => window.innerWidth <= 768;

function BoxNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVideo, setExpandedVideo] = useState(null);
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
      <Link to="/actualites">
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
            <Link to={`/article/${main.doc_id}`} className="image-title-large">
              {main.title}
            </Link>
          </div>

          {/* ── Petites cartes ── */}
          <div className="small-images-container" style={{ position: "relative" }}>

            {/* ✅ MODIFIÉ UNIQUEMENT ICI */}
            {expandedVideo && (
              <div
                style={{
                  position: isMobile() ? "fixed" : "absolute",
                  top: 0,
                  left: 0,
                  width: isMobile() ? "100vw" : "100%",
                  height: isMobile() ? "100vh" : "100%",
                  zIndex: 9999,
                  background: "#000",
                  borderRadius: isMobile() ? 0 : 4,
                  overflow: "hidden",
                }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${expandedVideo}?autoplay=1&rel=0`}
                  title="video"
                  style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                <button
                  onClick={() => setExpandedVideo(null)}
                  style={{
                    position: "absolute",
                    top: isMobile() ? 15 : 8,
                    right: isMobile() ? 15 : 8,
                    background: "rgba(0,0,0,0.7)",
                    border: "1px solid #555",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 11,
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
                      onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();

  if (window.innerWidth <= 768) {
    // 📱 MOBILE → plein écran direct
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.width = "100vw";
    iframe.style.height = "100vh";
    iframe.style.zIndex = "9999";
    iframe.style.border = "none";
    iframe.allow = "autoplay; encrypted-media";
    iframe.allowFullscreen = true;

    // bouton fermer
    const close = document.createElement("button");
    close.innerHTML = "✕";
    close.style.position = "fixed";
    close.style.top = "15px";
    close.style.right = "15px";
    close.style.zIndex = "10000";
    close.style.width = "40px";
    close.style.height = "40px";
    close.style.borderRadius = "50%";
    close.style.border = "none";
    close.style.background = "rgba(0,0,0,0.7)";
    close.style.color = "#fff";
    close.style.fontSize = "20px";
    close.style.cursor = "pointer";

    close.onclick = () => {
      document.body.removeChild(iframe);
      document.body.removeChild(close);
    };

    document.body.appendChild(iframe);
    document.body.appendChild(close);

  } else {
    // 🖥 DESKTOP → ton système actuel
    setExpandedVideo(ytId);
  }
}}
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