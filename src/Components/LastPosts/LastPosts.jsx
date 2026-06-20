import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { collection, query, onSnapshot, orderBy, limit, getDocs, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase";
import { GAMING_AVATARS } from "../Profile/avatars";

const BACKEND_URL = "https://api.sm-artweb.fr";

// ── Hook : récupère le vrai avatar Firestore d'un utilisateur ────────────────
function useUserAvatar(userId, fallback) {
  const [avatarUrl, setAvatarUrl] = useState(fallback || GAMING_AVATARS[0].url);
  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, "users", userId)).then((snap) => {
      if (snap.exists()) {
        const url = snap.data().photoURL;
        if (url) setAvatarUrl(url);
      }
    }).catch(() => {});
  }, [userId]);
  return avatarUrl;
}

function getSteamReviewLabel(total) {
  if (!total) return null;
  if (total >= 500000) return { label: "Extrêmement positives", color: "#4fc3f7" };
  if (total >= 50000)  return { label: "Très positives",        color: "#27ae60" };
  if (total >= 10000)  return { label: "Positives",             color: "#2ecc71" };
  if (total >= 1000)   return { label: "Plutôt positives",      color: "#f39c12" };
  if (total >= 100)    return { label: "Moyennes",              color: "#e67e22" };
  return                      { label: "Peu d'avis",            color: "#888"    };
}

function getRatingDescription(rating) {
  if (!rating || rating === 0) return { label: "Aucune note", color: "#666" };
  if (rating <= 1)   return { label: "Négative",       color: "#e74c3c" };
  if (rating <= 2.5) return { label: "Très moyen",     color: "#e67e22" };
  if (rating <= 3.5) return { label: "Moyen",          color: "#f39c12" };
  if (rating <= 4)   return { label: "Positives",      color: "#2ecc71" };
  if (rating <= 4.7) return { label: "Très positives", color: "#27ae60" };
  return                    { label: "Divin",           color: "#478eff" };
}

const CARD_STYLE = `
  .lp-slider-wrap {
    position: relative;
  }
  .lp-slider {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    padding-bottom: 6px;
    scrollbar-width: none;
  }
  .lp-slider::-webkit-scrollbar { display: none; }

  .lp-card {
    flex: 0 0 360px;
    scroll-snap-align: start;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  @media (max-width: 480px) { .lp-card { flex: 0 0 88vw; } }
  .lp-card:hover {
    border-color: rgba(221,22,59,0.3);
    transform: translateY(-2px);
  }

  .lp-slider-nav {
    display: flex; align-items: center; gap: 8px;
  }
  .lp-nav-btn {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    color: #ddd;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
    flex-shrink: 0;
  }
  .lp-nav-btn:hover {
    background: rgba(221,22,59,0.15);
    border-color: rgba(221,22,59,0.4);
  }
  .lp-nav-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }
  .lp-nav-btn:disabled:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
  }

  .lp-card-img {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
    background: #111;
    display: block;
  }
  .lp-card-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .lp-card:hover .lp-card-img img { transform: scale(1.04); }
  .lp-card-img::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10,10,12,0.95) 0%, transparent 55%);
  }
  .lp-card-game-name {
    position: absolute;
    left: 16px; right: 16px; bottom: 12px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 17px;
    font-weight: 800;
    color: #fff;
    text-decoration: none;
    z-index: 2;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .lp-card-body {
    padding: 16px 18px 18px;
  }

  .lp-top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .lp-badges {
    display: flex;
    flex-direction: row;
    gap: 6px;
    flex-wrap: nowrap;
    min-width: 0;
  }
  .lp-badge {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 5px 8px;
    min-width: 0;
  }
  .lp-badge-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #666;
    white-space: nowrap;
  }
  .lp-badge-value {
    font-family: 'Rajdhani', sans-serif;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }
  .lp-badge-sub {
    font-family: 'Montserrat', sans-serif;
    font-size: 8.5px;
    color: #555;
    white-space: nowrap;
  }

  .lp-author-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .lp-avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.12);
  }
  .lp-author-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13.5px;
    font-weight: 700;
    color: #ddd;
    text-align: right;
  }
  .lp-author-date {
    font-family: 'Montserrat', sans-serif;
    font-size: 10.5px;
    color: #555;
    text-align: right;
  }

  .lp-message {
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #aab0b8;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }
`;

function LastPostCard({ comment, game, steam, avgRating, article }) {
  const isArticleComment = String(comment.gameId).startsWith("article_");

  const slug = game ? game.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") : "";
  const igId = game ? String(comment.gameId).replace("ig_", "") : "";

  const steamReviewTotal = steam?.recommendations?.total || 0;
  const steamReview = getSteamReviewLabel(steamReviewTotal);
  const communityNote = getRatingDescription(avgRating);

  const avatarUrl = useUserAvatar(comment.userId, comment.userPhoto);
  const dateLabel = comment.createdAt
    ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    : "";

  const MAX_MESSAGE_LENGTH = 160;
  const rawMessage = comment.message || "";
  const truncatedMessage = rawMessage.length > MAX_MESSAGE_LENGTH
    ? rawMessage.slice(0, MAX_MESSAGE_LENGTH).trim() + "…"
    : rawMessage;

  // Image + lien selon le type de contenu commenté
  const mediaImg = isArticleComment
    ? (article?.photos?.[0]?.url || article?.game_img)
    : game?.img;
  const mediaTitle = isArticleComment ? article?.title : game?.name;
  const mediaLink = isArticleComment
    ? (article ? `/article/${String(comment.gameId).replace("article_", "")}` : null)
    : (game ? `/store/${igId}/${game.steam_id || 0}/${slug}` : null);

  return (
    <div className="lp-card">
      {mediaImg && mediaLink && (
        <Link to={mediaLink} className="lp-card-img">
          <img src={mediaImg} alt={mediaTitle} />
          <span className="lp-card-game-name">{mediaTitle}</span>
        </Link>
      )}

      <div className="lp-card-body">
        <div className="lp-top-row">
          {!isArticleComment && ((steamReview && steamReviewTotal > 0) || avgRating > 0) ? (
            <div className="lp-badges">
              {steamReview && steamReviewTotal > 0 && (
                <div className="lp-badge">
                  <span className="lp-badge-label">Avis Steam</span>
                  <span className="lp-badge-value" style={{ color: steamReview.color }}>{steamReview.label}</span>
                  <span className="lp-badge-sub">{steamReviewTotal.toLocaleString("fr-FR")} avis</span>
                </div>
              )}
              {avgRating > 0 && (
                <div className="lp-badge">
                  <span className="lp-badge-label">Communauté</span>
                  <span className="lp-badge-value" style={{ color: communityNote.color }}>{communityNote.label}</span>
                </div>
              )}
            </div>
          ) : <div />}

          <div className="lp-author-row">
            <div>
              <div className="lp-author-name">{comment.userName || "Anonyme"}</div>
              <div className="lp-author-date">{dateLabel}</div>
            </div>
            <img className="lp-avatar" src={avatarUrl} alt={comment.userName || "Anonyme"} />
          </div>
        </div>

        <p className="lp-message">{truncatedMessage}</p>
      </div>
    </div>
  );
}

function LastPosts() {
  const [comments, setComments] = useState([]);
  const [games, setGames] = useState({});
  const [steamData, setSteamData] = useState({});
  const [communityRatings, setCommunityRatings] = useState({});
  const [articlesMap, setArticlesMap] = useState({});
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const commentsArray = [];
      querySnapshot.forEach((doc) => {
        commentsArray.push({ ...doc.data(), id: doc.id });
      });
      setComments(commentsArray);

      const gameMap = {};
      const steamMap = {};
      const ratingMap = {};
      const articleMap = {};

      await Promise.all(
        commentsArray.map(async (comment) => {
          const rawKey = String(comment.gameId);

          // Cas commentaire sur un ARTICLE (BoxNews / BoxNewsDiv)
          if (rawKey.startsWith("article_")) {
            const articleId = rawKey.replace("article_", "");
            try {
              const snap = await getDoc(doc(db, "articles", articleId));
              if (snap.exists()) articleMap[articleId] = { doc_id: snap.id, ...snap.data() };
            } catch {}
            return;
          }

          // Cas commentaire sur un JEU
          const igId = rawKey.replace("ig_", "");
          if (!igId) return;

          try {
            const res = await fetch(`${BACKEND_URL}/api/game/${igId}`);
            if (res.ok) gameMap[igId] = await res.json();
          } catch {}

          try {
            const edRes = await fetch(`${BACKEND_URL}/api/editions/${igId}`);
            if (edRes.ok) {
              const editions = await edRes.json();
              const steamId = gameMap[igId]?.steam_id
                || editions.find(e => e.steam_id)?.steam_id;
              if (steamId) {
                const sRes = await fetch(`${BACKEND_URL}/api/steam/${steamId}`);
                if (sRes.ok) steamMap[igId] = await sRes.json();
              }
            }
          } catch {}

          try {
            const gameKey = `ig_${igId}`;
            const q2 = query(collection(db, "comments"), where("gameId", "==", gameKey));
            const snap = await getDocs(q2);
            const allComments = [];
            snap.forEach(d => allComments.push(d.data()));
            if (allComments.length > 0) {
              const avg = allComments.reduce((a, c) => a + parseInt(c.rating || 0), 0) / allComments.length;
              ratingMap[igId] = avg;
            }
          } catch {}
        })
      );

      setGames(gameMap);
      setSteamData(steamMap);
      setCommunityRatings(ratingMap);
      setArticlesMap(articleMap);
    });

    return () => unsubscribe();
  }, []);

  const updateScrollButtons = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [comments]);

  const scrollByCard = (direction) => {
    const el = sliderRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(".lp-card")?.offsetWidth || 360;
    el.scrollBy({ left: direction * (cardWidth + 20), behavior: "smooth" });
  };

  return (
    <div className="row vertical-gap">
      <style>{CARD_STYLE}</style>
      <div className="col-lg-12">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 className="nk-decorated-h-2" style={{ margin: 0 }}>
            <span>
              <span className="text-main-1">Derniers</span> avis
            </span>
          </h3>
          <div className="lp-slider-nav">
            <button className="lp-nav-btn" onClick={() => scrollByCard(-1)} disabled={!canScrollLeft} aria-label="Précédent">
              ‹
            </button>
            <button className="lp-nav-btn" onClick={() => scrollByCard(1)} disabled={!canScrollRight} aria-label="Suivant">
              ›
            </button>
          </div>
        </div>
        <div className="nk-gap"></div>

        <div className="lp-slider-wrap">
          <div className="lp-slider" ref={sliderRef} onScroll={updateScrollButtons}>
            {comments.map((comment) => {
              const rawKey = String(comment.gameId);
              const isArticleComment = rawKey.startsWith("article_");
              const igId = rawKey.replace("ig_", "");
              const articleId = rawKey.replace("article_", "");

              return (
                <LastPostCard
                  key={comment.id}
                  comment={comment}
                  game={!isArticleComment ? games[igId] : null}
                  steam={!isArticleComment ? steamData[igId] : null}
                  avgRating={!isArticleComment ? (communityRatings[igId] || 0) : 0}
                  article={isArticleComment ? articlesMap[articleId] : null}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LastPosts;