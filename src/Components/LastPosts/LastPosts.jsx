import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, onSnapshot, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "../../Firebase";

const BACKEND_URL = "https://api.sm-artweb.fr";

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
      <div className="col-lg-12">
        <h3 className="nk-decorated-h-2">
          <span>
            <span className="text-main-1">Derniers</span> avis
          </span>
        </h3>
        <div className="nk-gap"></div>
        <div className="nk-blog-grid">
          <div className="row">
            {comments.map((comment) => {
              const igId = String(comment.gameId).replace("ig_", "");
              const game = games[igId];
              const steam = steamData[igId];
              const slug = game ? game.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") : "";

              const steamReviewTotal = steam?.recommendations?.total || 0;
              const steamReview = getSteamReviewLabel(steamReviewTotal);

              const avgRating = communityRatings[igId] || 0;
              const communityNote = getRatingDescription(avgRating);

              const price = game ? parseFloat(game.price) : null;
              const retail = game ? parseFloat(game.retail) : null;
              const promo = retail && price && retail > price
                ? `-${Math.round(((retail - price) / retail) * 100)}%`
                : null;

              return (
                <div className="col-md-6" key={comment.id}>
                  <div className="nk-blog-post">
                    <div className="nk-gap"></div>

                    {/* Image */}
                    {game && (
                      <Link to={`/store/${igId}/${game.steam_id || 0}/${slug}`} className="nk-post-img">
                        <img
                          src={game.img}
                          alt={game.name}
                          className="img-fluid"
                          style={{ borderRadius: 8, width: "100%", objectFit: "cover", maxHeight: 460 }}
                        />
                      </Link>
                    )}

                    {/* Nom du jeu */}
                    {game && (
                      <h2 className="nk-post-title h4" style={{ marginTop: 10, marginBottom: 6 }}>
                        <Link
                          to={`/store/${igId}/${game.steam_id || 0}/${slug}`}
                          style={{ color: "#fff", textDecoration: "none" }}
                        >
                          {game.name}
                        </Link>
                      </h2>
                    )}

                    {/* Prix + Notes sur la même ligne */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>

                      {/* Prix à gauche */}
                      {price > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {retail > price && (
                            <span style={{ color: "#888", fontSize: 13, textDecoration: "line-through" }}>
                              {retail.toFixed(2)} €
                            </span>
                          )}
                          {promo && (
                            <span style={{ background: "#dd163b", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4 }}>
                              {promo}
                            </span>
                          )}
                          <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
                            {price.toFixed(2)} €
                          </span>
                        </div>
                      )}

                      {/* Notes à droite */}
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        {steamReview && steamReviewTotal > 0 && (
                          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "5px 10px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "#888", fontFamily: "Montserrat,sans-serif", marginBottom: 2 }}>Avis Steam</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: steamReview.color }}>{steamReview.label}</div>
                            <div style={{ fontSize: 10, color: "#666" }}>{steamReviewTotal.toLocaleString("fr-FR")} avis</div>
                          </div>
                        )}
                        {avgRating > 0 && (
                          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "5px 10px", textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: "#888", fontFamily: "Montserrat,sans-serif", marginBottom: 2 }}>Communauté</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: communityNote.color }}>{communityNote.label}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Auteur + date */}
                    <div className="nk-post-by" style={{ marginBottom: 6 }}>
                      par <strong>{comment.userName || "Anonyme"}</strong>{" "}
                      {comment.createdAt
                        ? `le ${new Date(comment.createdAt.seconds * 1000).toLocaleDateString("fr-FR")}`
                        : ""}
                    </div>

                    <div className="nk-gap"></div>
                    <div className="nk-post-text">
                      <p>{comment.message}</p>
                    </div>
                    <div className="nk-gap"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LastPosts;