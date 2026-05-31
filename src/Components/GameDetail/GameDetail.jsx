import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { auth, db } from "../../Firebase";
import {
  collection, addDoc, query, where, onSnapshot,
  serverTimestamp, updateDoc, setDoc, doc, getDoc
} from "firebase/firestore";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

const BACKEND_URL = "https://api.sm-artweb.fr";

// ─── helpers rating ──────────────────────────────────────────────────────────

function getRatingDescription(rating) {
  if (!rating || rating === 0) return <span style={{ color: "#666" }}>Aucune note</span>;
  if (rating <= 1)   return <span style={{ color: "#e74c3c" }}>Négative</span>;
  if (rating <= 2.5) return <span style={{ color: "#e67e22" }}>Très moyen</span>;
  if (rating <= 3.5) return <span style={{ color: "#f39c12" }}>Moyen</span>;
  if (rating <= 4)   return <span style={{ color: "#2ecc71" }}>Positives</span>;
  if (rating <= 4.7) return <span style={{ color: "#27ae60" }}>Très positives</span>;
  return <span style={{ color: "#478eff" }}>Divin</span>;
}

function getRatingIcon(rating) {
  if (!rating || rating === 0) return null;
  if (rating <= 1)   return <SentimentVeryDissatisfiedIcon color="error" />;
  if (rating <= 2)   return <SentimentDissatisfiedIcon color="error" />;
  if (rating <= 3)   return <SentimentSatisfiedIcon color="warning" />;
  if (rating <= 4)   return <SentimentSatisfiedAltIcon color="success" />;
  return <SentimentVerySatisfiedIcon color="success" />;
}


// ─── HLS Video Player ────────────────────────────────────────────────────────
// Utilise HLS.js pour les streams .m3u8 (Steam nouveaux jeux)
// Fallback natif pour mp4/webm (anciens jeux) et Safari (HLS natif)

function HlsPlayer({ src, type, className }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (type === "hls") {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari : HLS natif
        video.src = src;
      } else {
        // Chrome/Firefox : HLS.js via CDN
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js";
        script.onload = () => {
          if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
          }
        };
        // Si déjà chargé
        if (window.Hls) {
          if (window.Hls.isSupported()) {
            const hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
          }
        } else {
          document.head.appendChild(script);
        }
      }
    } else {
      // mp4/webm direct
      video.src = src;
    }

    return () => {
      if (video._hls) {
        video._hls.destroy();
        video._hls = null;
      }
    };
  }, [src, type]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      loop
      className={className}
    />
  );
}

// ─── component ───────────────────────────────────────────────────────────────

function GameDetail() {
  const { igId, steamId, title } = useParams();
  const user  = useSelector(selectUser);
  const userN = auth.currentUser;

  const [steamData,    setSteamData]    = useState(null);
  const [igGame,       setIgGame]       = useState(null);
  const [loadingSteam, setLoadingSteam] = useState(true);
  const [activeTab,    setActiveTab]    = useState("description");
  // "video" ou index numérique du screenshot actif
  const [activeMedia,  setActiveMedia]  = useState("video");
  const [comments,     setComments]     = useState([]);
  const [newComment,   setNewComment]   = useState({ title: "", message: "", rating: 0 });

  // ── Steam via proxy backend ──────────────────────────────────────────────
  useEffect(() => {
    if (!steamId || steamId === "0") { setLoadingSteam(false); return; }
    (async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/api/steam/${steamId}`);
        const data = await res.json();
        setSteamData(data || null);
      } catch (e) {
        console.error("Steam proxy error", e);
      } finally {
        setLoadingSteam(false);
      }
    })();
  }, [steamId]);

  // ── IG game info ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        const res   = await fetch(`${BACKEND_URL}/api/topsellers-recent`);
        const all   = await res.json();
        const found = all.find(g => String(g.id) === String(igId));
        if (!found) {
          const res2 = await fetch(`${BACKEND_URL}/api/latest-releases`);
          const all2 = await res2.json();
          setIgGame(all2.find(g => String(g.id) === String(igId)) || null);
        } else {
          setIgGame(found);
        }
      } catch (e) {
        console.error("IG fetch error", e);
      }
    })();
  }, [igId]);

  // Quand steamData est chargé : si pas de vidéo, afficher le 1er screenshot
  useEffect(() => {
    if (!steamData) return;
    const mvs = steamData?.movies || [];
    const m = mvs[0];
    const hasVideo = m?.webm?.max || m?.webm?.["480"] || m?.mp4?.max || m?.mp4?.["480"] || m?.hls_h264;
    if (!hasVideo) setActiveMedia(0);
  }, [steamData]);

  // ── Firebase : lecture commentaires ─────────────────────────────────────
  useEffect(() => {
    if (!igId) return;
    const gameKey = `ig_${igId}`;
    const q = query(collection(db, "comments"), where("gameId", "==", gameKey));
    const unsub = onSnapshot(
      q,
      snap => {
        const arr = [];
        snap.forEach(d => arr.push({ ...d.data(), id: d.id }));
        setComments(arr);
      },
      err => {
        console.warn("Firestore read denied:", err.message);
        setComments([]);
      }
    );
    return () => unsub();
  }, [igId]);

  // ── Firebase : écriture note moyenne (connecté seulement) ───────────────
  useEffect(() => {
    if (!igId || !user || comments.length === 0) return;
    (async () => {
      try {
        const gameKey = `ig_${igId}`;
        const total   = comments.reduce((a, c) => a + parseInt(c.rating || 0), 0);
        const avg     = total / comments.length;
        const ref     = doc(db, "games", gameKey);
        const snap    = await getDoc(ref);
        snap.exists()
          ? await updateDoc(ref, { averageRating: avg })
          : await setDoc(ref, { gameId: gameKey, averageRating: avg });
      } catch (err) {
        console.warn("Firestore write denied:", err.message);
      }
    })();
  }, [comments, igId, user]);

  const averageRating = comments.length
    ? comments.reduce((a, c) => a + parseInt(c.rating || 0), 0) / comments.length
    : 0;

  // ── Handlers commentaire ─────────────────────────────────────────────────
  const handleChanges = e => {
    const { name, value } = e.target;
    setNewComment(p => ({ ...p, [name]: value }));
  };
  const handleRatingChange = e =>
    setNewComment(p => ({ ...p, rating: parseInt(e.target.value) }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user || !userN) return;
    try {
      await addDoc(collection(db, "comments"), {
        gameId:    `ig_${igId}`,
        ...newComment,
        userName:  userN.displayName || "Anonymous",
        userPhoto: userN.photoURL    || "https://zupimages.net/up/24/22/cib6.png",
        createdAt: serverTimestamp(),
      });
      setNewComment({ title: "", message: "", rating: 0 });
    } catch (err) {
      console.error("Erreur commentaire:", err);
    }
  };

  // ── Données dérivées ──────────────────────────────────────────────────────
  const screenshots = steamData?.screenshots || [];
  const movies      = steamData?.movies      || [];

  // Steam retourne uniquement HLS/DASH depuis 2025, plus de webm/mp4 directs.
  // On utilise hls_h264 (M3U8) qui est lisible via HLS.js (chargé en CDN).
  // Fallback sur webm/mp4 pour les anciens jeux.
  const getVideoSrc = (movie) => {
    if (!movie) return null;
    if (movie?.webm?.max)     return { url: movie.webm.max,     type: "mp4" };
    if (movie?.webm?.["480"]) return { url: movie.webm["480"],  type: "mp4" };
    if (movie?.mp4?.max)      return { url: movie.mp4.max,      type: "mp4" };
    if (movie?.mp4?.["480"])  return { url: movie.mp4["480"],   type: "mp4" };
    if (movie?.hls_h264)      return { url: movie.hls_h264,     type: "hls" };
    return null;
  };

  const videoSrc   = getVideoSrc(movies[0]);
  const videoThumb = movies[0]?.thumbnail || null;

  const igPrice  = igGame ? parseFloat(igGame.price)  : null;
  const igRetail = igGame ? parseFloat(igGame.retail) : null;
  const promo    = igRetail && igPrice && igRetail > igPrice
    ? `-${Math.round(((igRetail - igPrice) / igRetail) * 100)}%`
    : null;

  const igUrl  = igGame?.url || null;
  const pcReqs = steamData?.pc_requirements;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingSteam) {
    return (
      <>
        <Header />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  const gameTitle = steamData?.name || igGame?.name || decodeURIComponent(title || "");

  return (
    <div>
      <Header />

      {/* ── Hero banner ── */}
      {steamData?.background && (
        <div className="gd-hero" style={{ backgroundImage: `url(${steamData.background})` }}>
          <div className="gd-hero-overlay" />
        </div>
      )}

      <div className="nk-gap-1" />

      <div className="container" style={{ paddingTop: 80, maxWidth: 1100, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <ul className="nk-breadcrumbs">
          <li><Link to="/">Accueil</Link></li>
          <li><span className="fa fa-angle-right" /></li>
          <li><Link to="/Populaires/">Tendances</Link></li>
          <li><span className="fa fa-angle-right" /></li>
          <li><span>{gameTitle}</span></li>
        </ul>

        <div className="nk-gap-1" />

        <div className="nk-store-product">
          <div className="row vertical-gap">

            {/* ── Colonne gauche : media ── */}
            <div className="col-12 col-md-6">

              {/* ── Cadre principal ── */}
              <div className="gd-media-main">
                {activeMedia === "video" && videoSrc ? (
                  /* Vidéo Steam dans le cadre — HLS.js pour les nouveaux jeux */
                  <HlsPlayer
                    key={videoSrc.url}
                    src={videoSrc.url}
                    type={videoSrc.type}
                    className="gd-media-video"
                  />
                ) : screenshots[activeMedia] ? (
                  /* Screenshot sélectionné */
                  <img
                    src={screenshots[activeMedia].path_full}
                    alt="screenshot"
                    className="gd-media-img"
                  />
                ) : igGame?.img ? (
                  /* Fallback image IG */
                  <img src={igGame.img} alt={gameTitle} className="gd-media-img" />
                ) : null}
              </div>

              {/* ── Strip miniatures (vidéo en 1er + screenshots) ── */}
              {(videoSrc || screenshots.length > 0) && (
                <div className="gd-thumbstrip">

                  {/* Miniature vidéo en 1ère position */}
                  {videoSrc && (
                    <div
                      className={`gd-thumb-wrap${activeMedia === "video" ? " gd-thumb-active" : ""}`}
                      onClick={() => setActiveMedia("video")}
                    >
                      {videoThumb ? (
                        <img src={videoThumb} alt="vidéo" className="gd-thumb" />
                      ) : (
                        /* Fallback si pas de thumbnail vidéo */
                        <div className="gd-thumb gd-thumb-video-placeholder">
                          ▶
                        </div>
                      )}
                      {/* Badge ▶ par-dessus la miniature */}
                      <div className="gd-thumb-play">▶</div>
                    </div>
                  )}

                  {/* Screenshots */}
                  {screenshots.slice(0, 7).map((s, i) => (
                    <div
                      key={i}
                      className={`gd-thumb-wrap${activeMedia === i ? " gd-thumb-active" : ""}`}
                      onClick={() => setActiveMedia(i)}
                    >
                      <img src={s.path_thumbnail} alt="" className="gd-thumb" />
                    </div>
                  ))}

                </div>
              )}
            </div>

            {/* ── Colonne droite : infos ── */}
            <div className="col-12 col-md-6">

              {/* Badge plateforme + titre */}
              <div className="subinfos">
                <span className="platform platform-steam">
                  <svg xmlns="http://www.w3.org/2000/svg" height="22" width="20" viewBox="0 0 448 512">
                    <path fill="#fff" d="M395.5 177.5c0 33.8-27.5 61-61 61-33.8 0-61-27.3-61-61s27.3-61 61-61c33.5 0 61 27.2 61 61zm52.5 .2c0 63-51 113.8-113.7 113.8L225 371.3c-4 43-40.5 76.8-84.5 76.8-40.5 0-74.7-28.8-83-67L0 358V250.7L97.2 290c15.1-9.2 32.2-13.3 52-11.5l71-101.7c.5-62.3 51.5-112.8 114-112.8C397 64 448 115 448 177.7zM203 363c0-34.7-27.8-62.5-62.5-62.5-4.5 0-9 .5-13.5 1.5l26 10.5c25.5 10.2 38 39 27.7 64.5-10.2 25.5-39.2 38-64.7 27.5-10.2-4-20.5-8.3-30.7-12.2 10.5 19.7 31.2 33.2 55.2 33.2 34.7 0 62.5-27.8 62.5-62.5zm207.5-185.3c0-42-34.3-76.2-76.2-76.2-42.3 0-76.5 34.2-76.5 76.2 0 42.2 34.3 76.2 76.5 76.2 41.9 .1 76.2-33.9 76.2-76.2z"/>
                  </svg>
                  &nbsp;Steam
                </span>
                <h2 className="nk-productpro-title h3pro" style={{ marginLeft: 12, marginBottom: 0 }}>
                  {gameTitle}
                </h2>
              </div>

              {/* Description courte */}
              {steamData?.short_description && (
                <div className="nk-product-description gd-short-desc">
                  <p>{steamData.short_description}</p>
                </div>
              )}

              {/* Prix */}
              <div className="info gd-price-block">
                {igRetail && igRetail > (igPrice || 0) && (
                  <div className="priceOrigin text-white">{igRetail.toFixed(2)} €</div>
                )}
                {promo && <div className="priceSlidePromo">{promo}</div>}
                {igPrice && (
                  <div className="price text-white">{igPrice.toFixed(2)} €</div>
                )}
              </div>

              {/* Bouton achat */}
              {igUrl && (
                <div className="gd-buy-btn">
                  <a
                    href={igUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nk-btn nk-btn-rounded nk-btn-color-main-1"
                  >
                    🛒 Acheter sur Instant Gaming
                  </a>
                </div>
              )}

              <div className="nk-gap-1" />

              {/* Meta */}
              <div className="nk-product-meta gd-meta">
                <div>
                  <strong>Note</strong>:{" "}
                  <span>{getRatingDescription(averageRating)} {getRatingIcon(averageRating)}</span>
                </div>
                {steamData?.genres && (
                  <div>
                    <strong>Genres</strong>: {steamData.genres.map(g => g.description).join(", ")}
                  </div>
                )}
                {steamData?.release_date?.date && (
                  <div><strong>Date de sortie</strong>: {steamData.release_date.date}</div>
                )}
                {steamData?.developers?.[0] && (
                  <div><strong>Développeur</strong>: {steamData.developers[0]}</div>
                )}
                {steamData?.publishers?.[0] && (
                  <div><strong>Éditeur</strong>: {steamData.publishers[0]}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="nk-gap-2" />

        {/* ── Tabs ── */}
        <div className="nk-tabs">
          <ul className="nav nav-tabs" role="tablist">
            {[
              { key: "description", label: "Description" },
              { key: "config",      label: "Config requise" },
              { key: "comment",     label: `Commentaires (${comments.length})` },
            ].map(t => (
              <li className="nav-item" key={t.key}>
                <span
                  className={activeTab === t.key ? "active nav-link" : "nav-link"}
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="tab-content">

            {/* ── Description ── */}
            {activeTab === "description" && (
              <div className="tab-pane fade show active">
                <div className="nk-gap" />
                {steamData?.detailed_description ? (
                  <div
                    className="steam-desc-content"
                    dangerouslySetInnerHTML={{ __html: steamData.detailed_description }}
                  />
                ) : (
                  <p style={{ color: "#888" }}>Aucune description disponible.</p>
                )}
              </div>
            )}

            {/* ── Config ── */}
            {activeTab === "config" && (
              <div className="tab-pane fade show active">
                <div className="nk-gap" />
                <div className="row gd-config-row">
                  {pcReqs?.minimum && (
                    <div className="col-12 col-md-6 gd-config-col">
                      <h4 className="gd-config-title">⚙️ Configuration minimale</h4>
                      <div
                        className="gd-config-content"
                        dangerouslySetInnerHTML={{ __html: pcReqs.minimum }}
                      />
                    </div>
                  )}
                  {pcReqs?.recommended && (
                    <div className="col-12 col-md-6 gd-config-col">
                      <h4 className="gd-config-title">🚀 Configuration recommandée</h4>
                      <div
                        className="gd-config-content"
                        dangerouslySetInnerHTML={{ __html: pcReqs.recommended }}
                      />
                    </div>
                  )}
                  {!pcReqs?.minimum && !pcReqs?.recommended && (
                    <p className="col-12" style={{ color: "#888", padding: "20px 15px" }}>
                      Configuration non disponible.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Commentaires ── */}
            {activeTab === "comment" && (
              <div className="tab-pane fade show active">
                <div className="nk-gap-2" />
                <h3 className="h4">Ajouter un commentaire</h3>

                {user ? (
                  <div className="nk-reply">
                    <div className="nk-gap-1" />
                    <form onSubmit={handleSubmit} className="nk-form">
                      <div className="d-flex flex-column row vertical-gap sm-gap">
                        <div className="d-flex col-sm-2">
                          <div className="avatar_product" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <img
                              src={userN?.photoURL}
                              alt=""
                              style={{ width: 35, borderRadius: "50%" }}
                            />
                            <span>{user.displayName}</span>
                          </div>
                        </div>

                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <React.Fragment key={i}>
                              <input
                                type="radio"
                                id={`rate-${i + 1}`}
                                name="rating"
                                value={i + 1}
                                onChange={handleRatingChange}
                                checked={newComment.rating === i + 1}
                                style={{ display: "none" }}
                              />
                              <label htmlFor={`rate-${i + 1}`} style={{ cursor: "pointer" }}>
                                {newComment.rating >= i + 1 ? <StarIcon /> : <StarBorderIcon />}
                              </label>
                            </React.Fragment>
                          ))}
                        </div>

                        <div className="col-sm-6">
                          <input
                            type="text"
                            className="form-control required"
                            name="title"
                            placeholder="Titre *"
                            value={newComment.title}
                            onChange={handleChanges}
                            required
                          />
                        </div>
                      </div>

                      <div className="nk-gap-1" />
                      <textarea
                        className="form-control required"
                        name="message"
                        rows="5"
                        placeholder="Ton message *"
                        value={newComment.message}
                        onChange={handleChanges}
                        required
                      />
                      <div className="nk-gap-1" />
                      <button className="nk-btn nk-btn-rounded nk-btn-color-dark-3 float-right">
                        Envoyer
                      </button>
                    </form>
                  </div>
                ) : (
                  <Link to="/Login">
                    <button className="fa fa-user"> Se connecter</button>
                  </Link>
                )}

                <div className="clearfix" />
                <div className="nk-gap-2" />

                <div className="nk-comments">
                  <h3>Commentaires</h3>
                  {comments.map(comment => (
                    <div key={comment.id} className="nk-comment">
                      <div className="nk-comment-meta">
                        <img
                          src={comment.userPhoto}
                          alt={comment.userName}
                          className="rounded-circle"
                          width="35"
                        />{" "}
                        par <Link to="/...">{comment.userName}</Link>{" "}
                        {comment.createdAt
                          ? `le ${new Date(comment.createdAt.seconds * 1000).toLocaleDateString("fr-FR")}`
                          : ""}
                        <div className="nk-review-rating" data-rating={comment.rating}>
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={comment.rating > i ? "fa fa-star" : "far fa-star"} />
                          ))}
                        </div>
                      </div>
                      <p>{comment.title}</p>
                      <div className="nk-comment-text">
                        <p>{comment.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="clearfix" />
                <div className="nk-gap-2" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="separator product-panel" />
      <Footer />
    </div>
  );
}

export default GameDetail;