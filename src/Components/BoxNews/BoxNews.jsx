import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";
import "./BoxNews.css";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function formatTimeAgo(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diffMs = Date.now() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return "À l'instant";
  if (diffH < 24) return `Il y a ${diffH} heure${diffH > 1 ? "s" : ""}`;
  const diffJ = Math.floor(diffH / 24);
  if (diffJ === 1) return "Hier";
  if (diffJ < 7) return `Il y a ${diffJ} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ✅ AJOUT
const isMobile = () => window.innerWidth <= 768;

function BoxNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [playingMain, setPlayingMain] = useState(false);

  // ── NEWS IMPORTANTES (cover/carousel) ──
  const [breakingArticles, setBreakingArticles] = useState([]);
  const [breakingLoading, setBreakingLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("status", "==", "public"),
          orderBy("created_at", "desc"),
          limit(13)
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

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("status", "==", "public"),
          where("isBreaking", "==", true),
          orderBy("created_at", "desc"),
          limit(6)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ doc_id: doc.id, ...doc.data() }));
        setBreakingArticles(data);
      } catch (e) {
        console.error("Erreur chargement news importantes", e);
      } finally {
        setBreakingLoading(false);
      }
    };
    fetchBreaking();
  }, []);

  if (loading || articles.length === 0) return null;

  // 1 grande carte à gauche + 4 petites cartes en grille 2x2 à droite (disposition d'origine)
  const mainCard = articles[0];
  const smallCards = articles.slice(1, 5);
  // Liste "Actualités jeux vidéo du moment" : les 8 articles suivants
  const moreArticles = articles.slice(5, 13);

  return (
    <div className="bn-wrapper">

      {/* ══════════════════════════════════════════
          SECTION 1 — ⚡ NEWS IMPORTANTES (carousel)
          ══════════════════════════════════════════ */}
      {!breakingLoading && breakingArticles.length > 0 && (
        <div className="bn-section">
          <h3 className="nk-decorated-h-2">
            <span>
              <span className="text-main-1">⚡ À ne pas</span> manquer
            </span>
          </h3>
          <div className="nk-gap" />
          <BreakingCover articles={breakingArticles} />
        </div>
      )}

      {/* SECTION 2 — ACTUALITÉS DU JOUR */}
      <div className="bn-section">
        <Link to="/actualites">
          <h3 className="nk-decorated-h-2">
            <span>
              <span className="text-main-1">Actualités</span> gaming du jour
            </span>
          </h3>
        </Link>
        <div className="nk-gap" />

        <div className="nk-news-box">
          <div className="gallery-container">

          {/* ── Grande carte ── */}
          {(() => {
            const article = mainCard;
            const ytId = getYoutubeId(article.youtube_url);
            const img = article.photos?.[0]?.url || article.game_img;
            const isPlaying = playingMain === article.doc_id;
            return (
              <div className="large-image-container">
                {ytId && isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                    title={article.title}
                    className="large-image"
                    style={{ border: "none", width: "100%", height: "100%", display: "block" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={{ position: "relative", width: "100%", height: "100%" }}>
                    <img
                      src={ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : img}
                      alt={article.title}
                      className="large-image"
                      onError={e => {
                        if (ytId && e.target.src.includes("maxresdefault"))
                          e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                        else e.target.style.display = "none";
                      }}
                    />
                    {ytId && (
                      <button onClick={() => setPlayingMain(article.doc_id)} style={playBtnStyle(60)}>
                        <PlayIcon size={24} />
                      </button>
                    )}
                    <span className="nk-post-categories">
                      <span className="bg-main-1">{ytId ? "▶ VIDEO" : "ACTUALITÉS"}</span>
                    </span>
                  </div>
                )}
                <Link to={`/article/${article.doc_id}`} className="image-title-large">
                  {article.title}
                </Link>
              </div>
            );
          })()}

          {/* ── Petites cartes (grille 2x2) ── */}
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

            {smallCards.map((article) => {
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
                      <span className="bg-main-1">{ytId ? "▶ VIDEO" : "ACTUALITÉS"}</span>
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
      </div>{/* fin bn-section grille */}

      {/* ══════════════════════════════════════════
          SECTION 3 — ACTUALITÉS JEUX VIDÉO DU MOMENT
          ══════════════════════════════════════════ */}
      {moreArticles.length > 0 && (
        <div className="bn-section">
          <div className="nk-more-news-header">
            <h3 className="nk-decorated-h-2" style={{ margin: 0 }}>
              <span>
                <span className="text-main-1">Actualités</span> gaming du moment
              </span>
            </h3>
            <Link to="/actualites" className="nk-more-news-btn">
              Toutes les news
            </Link>
          </div>
          <div className="nk-gap" />
          <div className="nk-more-news-list">
            {/* Colonne gauche : articles pairs */}
            <div className="nk-more-news-col">
              {moreArticles.filter((_, i) => i % 2 === 0).map((article, colIdx) => {
                const ytId = getYoutubeId(article.youtube_url);
                const img = article.photos?.[0]?.url || article.game_img;
                const rank = String(colIdx * 2 + 1).padStart(2, "0");
                return (
                  <Link key={article.doc_id} to={`/article/${article.doc_id}`} className="nk-more-news-item">
                    <div className="nk-more-news-thumb">
                      <img src={ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : img} alt={article.title} onError={(e) => (e.target.style.display = "none")} />
                    </div>
                    <div className="nk-more-news-body">
                      <div className="nk-more-news-title">{article.title}</div>
                      <div className="nk-more-news-meta">
                        <span>{formatTimeAgo(article.created_at)}</span>
                        {article.game_type && <span className="nk-more-news-tag">{article.game_type}</span>}
                      </div>
                    </div>
                    <span className="nk-more-news-rank">{rank}</span>
                  </Link>
                );
              })}
            </div>

            {/* Séparateur vertical */}
            <div className="nk-more-news-divider" />

            {/* Colonne droite : articles impairs */}
            <div className="nk-more-news-col">
              {moreArticles.filter((_, i) => i % 2 === 1).map((article, colIdx) => {
                const ytId = getYoutubeId(article.youtube_url);
                const img = article.photos?.[0]?.url || article.game_img;
                const rank = String(colIdx * 2 + 2).padStart(2, "0");
                return (
                  <Link key={article.doc_id} to={`/article/${article.doc_id}`} className="nk-more-news-item">
                    <div className="nk-more-news-thumb">
                      <img src={ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : img} alt={article.title} onError={(e) => (e.target.style.display = "none")} />
                    </div>
                    <div className="nk-more-news-body">
                      <div className="nk-more-news-title">{article.title}</div>
                      <div className="nk-more-news-meta">
                        <span>{formatTimeAgo(article.created_at)}</span>
                        {article.game_type && <span className="nk-more-news-tag">{article.game_type}</span>}
                      </div>
                    </div>
                    <span className="nk-more-news-rank">{rank}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
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

// ── COVER CAROUSEL : news importantes ──
function BreakingCover({ articles }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const count = articles.length;

  const goTo = (i) => setIndex(((i % count) + count) % count);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Auto-défilement toutes les 6s, pause au survol
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setTimeout(() => {
      setIndex((prevIdx) => (prevIdx + 1) % count);
    }, 6000);
    return () => clearTimeout(timerRef.current);
  }, [index, paused, count]);

  return (
    <div
      className="nk-breaking-cover"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        height: isMobile() ? 240 : 460,
        borderRadius: 6,
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {articles.map((article, i) => {
        const aYtId = getYoutubeId(article.youtube_url);
        const aImg = article.photos?.[0]?.url || article.game_img;
        return (
          <Link
            key={article.doc_id}
            to={`/article/${article.doc_id}`}
            style={{
              position: "absolute",
              top: 0, left: 0, width: "100%", height: "100%",
              display: "block",
              opacity: i === index ? 1 : 0,
              transition: "opacity 0.6s ease",
              pointerEvents: i === index ? "auto" : "none",
              overflow: "hidden",
            }}
          >
            {/* Fond flouté pour éviter les bandes noires */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${aYtId ? `https://img.youtube.com/vi/${aYtId}/maxresdefault.jpg` : aImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px) brightness(0.4) saturate(1.2)",
              transform: "scale(1.1)",
            }} />
            <img
              src={aYtId ? `https://img.youtube.com/vi/${aYtId}/maxresdefault.jpg` : aImg}
              alt={article.title}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
              }}
              onError={(e) => {
                if (aYtId && e.target.src.includes("maxresdefault"))
                  e.target.src = `https://img.youtube.com/vi/${aYtId}/hqdefault.jpg`;
              }}
            />
            <div
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.25) 68%, rgba(0,0,0,0.75) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute", left: 0, bottom: 0, right: 0,
                padding: isMobile() ? "16px 16px 20px" : "24px 32px 28px",
              }}
            >
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#dd163b", color: "#fff",
                  fontFamily: "Orbitron, sans-serif", fontSize: 11,
                  letterSpacing: 1, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 3,
                  marginBottom: 10,
                }}
              >
                ⚡ NEWS IMPORTANTE
              </span>
              <h2
                style={{
                  color: "#fff", margin: 0,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile() ? 18 : 28,
                  lineHeight: 1.25,
                  textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.8)",
                  maxWidth: 800,
                  ...(isMobile() ? {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  } : {}),
                }}
              >
                {article.title}
              </h2>
              {article.game_name && (
                <div
                  style={{
                    color: "#ddd", fontFamily: "Rajdhani, sans-serif",
                    fontSize: 14, marginTop: 6,
                    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  {/* {article.game_name} */}
                </div>
              )}
            </div>
          </Link>
        );
      })}

      {count > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            aria-label="Précédent"
            style={navBtnStyle("left")}
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            aria-label="Suivant"
            style={navBtnStyle("right")}
          >
            ›
          </button>

          <div
            style={{
              position: "absolute", bottom: 10, left: "50%",
              transform: "translateX(-50%)",
              display: "flex", gap: 6, zIndex: 3,
            }}
          >
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); goTo(i); }}
                aria-label={`Aller à la news ${i + 1}`}
                style={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                  background: i === index ? "#dd163b" : "rgba(255,255,255,0.45)",
                  transition: "width 0.25s, background 0.25s",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function navBtnStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: 12,
    transform: "translateY(-50%)",
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    fontSize: 22,
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  };
}

export default BoxNews;