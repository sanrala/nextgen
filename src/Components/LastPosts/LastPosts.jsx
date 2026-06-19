import React, { useState, useEffect } from "react";
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
  .lp-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  @media (max-width: 767px) { .lp-grid { grid-template-columns: 1fr; } }

  .lp-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .lp-card:hover {
    border-color: rgba(221,22,59,0.3);
    transform: translateY(-2px);
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
    gap: 8px;
    flex-wrap: wrap;
  }
  .lp-badge {
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 6px 11px;
  }
  .lp-badge-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #666;
  }
  .lp-badge-value {
    font-family: 'Rajdhani', sans-serif;
    font-size: 12.5px;
    font-weight: 700;
  }
  .lp-badge-sub {
    font-family: 'Montserrat', sans-serif;
    font-size: 9.5px;
    color: #555;
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
  }
`;

function LastPostCard({ comment, game, steam, avgRating }) {
  const slug = game ? game.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") : "";
  const igId = game ? String(comment.gameId).replace("ig_", "") : "";

  const steamReviewTotal = steam?.recommendations?.total || 0;
  const steamReview = getSteamReviewLabel(steamReviewTotal);
  const communityNote = getRatingDescription(avgRating);

  const avatarUrl = useUserAvatar(comment.userId, comment.userPhoto);
  const dateLabel = comment.createdAt
    ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div className="lp-card">
      {game && (
        <Link to={`/store/${igId}/${game.steam_id || 0}/${slug}`} className="lp-card-img">
          <img src={game.img} alt={game.name} />
          <span className="lp-card-game-name">{game.name}</span>
        </Link>
      )}

      <div className="lp-card-body">
        <div className="lp-top-row">
          {(steamReview && steamReviewTotal > 0) || avgRating > 0 ? (
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

        <p className="lp-message">{comment.message}</p>
      </div>
    </div>
  );
}

function LastPosts() {
  const [comments, setComments] = useState([]);
  const [games, setGames] = useState({});
  const [steamData, setSteamData] = useState({});
  const [communityRatings, setCommunityRatings] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      orderBy("createdAt", "desc"),
      limit(2)
    );
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const commentsArray = [];
      querySnapshot.forEach((doc) => {
        commentsArray.push({ ...doc.data(), id: doc.id });
      });
      setComments(commentsArray);

      // Fetch infos jeu + Steam + notes communauté
      const gameMap = {};
      const steamMap = {};
      const ratingMap = {};

      await Promise.all(
        commentsArray.map(async (comment) => {
          const igId = String(comment.gameId).replace("ig_", "");
          if (!igId) return;

          // 1. Infos jeu IG
          try {
            const res = await fetch(`${BACKEND_URL}/api/game/${igId}`);
            if (res.ok) gameMap[igId] = await res.json();
          } catch {}

          // 2. Données Steam via editions pour récupérer le vrai steam_id
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

          // 3. Note communauté depuis Firestore
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
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="row vertical-gap">
      <style>{CARD_STYLE}</style>
      <div className="col-lg-12">
        <h3 className="nk-decorated-h-2">
          <span>
            <span className="text-main-1">Derniers</span> avis
          </span>
        </h3>
        <div className="nk-gap"></div>

        <div className="lp-grid">
          {comments.map((comment) => {
            const igId = String(comment.gameId).replace("ig_", "");
            const game = games[igId];
            const steam = steamData[igId];
            const avgRating = communityRatings[igId] || 0;

            return (
              <LastPostCard
                key={comment.id}
                comment={comment}
                game={game}
                steam={steam}
                avgRating={avgRating}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LastPosts;