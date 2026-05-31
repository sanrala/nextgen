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

function getSteamReviewLabel(total) {
  if (!total) return null;
  if (total >= 500000) return { label: "Extrêmement positives", color: "#4fc3f7" };
  if (total >= 50000)  return { label: "Très positives",        color: "#27ae60" };
  if (total >= 10000)  return { label: "Positives",             color: "#2ecc71" };
  if (total >= 1000)   return { label: "Plutôt positives",      color: "#f39c12" };
  if (total >= 100)    return { label: "Moyennes",              color: "#e67e22" };
  return                      { label: "Peu d'avis",            color: "#888"    };
}

function PlatformLogo({ type, size = 16 }) {
  const t = (type || "").toLowerCase();
  if (t.includes("steam")) return (
    <svg width={size} height={size} viewBox="0 0 448 512" fill="currentColor">
      <path d="M395.5 177.5c0 33.8-27.5 61-61 61-33.8 0-61-27.3-61-61s27.3-61 61-61c33.5 0 61 27.2 61 61zm52.5.2c0 63-51 113.8-113.7 113.8L225 371.3c-4 43-40.5 76.8-84.5 76.8-40.5 0-74.7-28.8-83-67L0 358V250.7L97.2 290c15.1-9.2 32.2-13.3 52-11.5l71-101.7c.5-62.3 51.5-112.8 114-112.8C397 64 448 115 448 177.7z"/>
    </svg>
  );
  if (t.includes("ubisoft")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3a9 9 0 1 1 0 18A9 9 0 0 1 12 3zm0 2a7 7 0 1 0 0 14A7 7 0 0 0 12 5zm2.5 3.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
    </svg>
  );
  if (t.includes("xbox") || t.includes("microsoft")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 1.851 6.737 6.963 6.477 10.488C23.154 15.473 24 13.822 24 12c0-4.386-2.322-8.216-5.803-10.337.01 0-1.734 2.868-2.935 4.964zM5.804 1.666C2.32 3.783 0 7.614 0 12c0 1.819.846 3.469 1.463 5.116-.261-3.521 3.972-8.636 6.477-10.488-1.206-2.096-2.945-4.964-2.935-4.962zm6.196.341s-3.258 2.735-3.498 9.402c.765.857 2.099 2.186 3.498 3.168 1.399-.982 2.732-2.31 3.499-3.168-.241-6.667-3.499-9.402-3.499-9.402z"/>
    </svg>
  );
  if (t.includes("playstation")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.984 2.596v15.47l3.915 1.338V6.668c0-.69.304-1.151.794-.991.636.18.76.814.76 1.503v5.324c2.909 1.618 5.106.041 5.106-3.973 0-4.137-1.638-5.88-4.488-6.923-1.493-.54-4.064-1.231-6.087-1.012zm-4.453 15.08c-2.147.896-3.838.098-3.838-1.97 0-1.95 1.374-4.142 3.838-5.637v2.406c-.955.56-1.362 1.197-1.362 1.76 0 .773.497 1.143 1.362.838V19.5zm9.953 2.323c-1.063.385-2.077.493-2.965.228v-2.414c.667.14 1.31.121 1.94-.107 1.054-.384 1.765-1.191 1.765-2.028 0-.838-.711-1.062-1.766-.757l-1.94.667V13.2c2.94-.907 5.293-.127 5.293 2.087 0 2.214-1.28 4.188-2.327 4.712z"/>
    </svg>
  );
  if (t.includes("epic")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.963 0v18.496l2.913.925V.926zm10.043.001l-4.017 1.271v18.252l4.017-1.272zm6.031 1.906l-4.017 1.271v15.98l4.017 1.272z"/>
    </svg>
  );
  if (t.includes("gog")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.25 16.5h-3v-3h3v3zm0-4.5h-3V9h1.5V7.5h-6V9H9v3H6V7.5A1.5 1.5 0 0 1 7.5 6h9A1.5 1.5 0 0 1 18 7.5V12zm-4.5 4.5h-3v-3h3v3z"/>
    </svg>
  );
  if (t.includes("nintendo")) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.434 0C4.226.002 0 4.228 0 9.434v5.132C0 19.774 4.226 24 9.434 24h5.132C19.773 24 24 19.774 24 14.566V9.434C24 4.228 19.773.002 14.566 0zm-.717 5.046h1.992l3.59 7.77V5.046h1.974v13.908h-1.973l-3.61-7.789v7.789H8.717zm-4.89 0h2.062v13.908H3.827z"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  );
}

function HlsPlayer({ src, type, poster, className }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    if (type === "hls") {
      if (video.canPlayType("application/vnd.apple.mpegurl")) { video.src = src; }
      else {
        const initHls = () => {
          if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls(); hls.loadSource(src); hls.attachMedia(video); video._hls = hls;
          }
        };
        if (window.Hls) { initHls(); }
        else { const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"; s.onload = initHls; document.head.appendChild(s); }
      }
    } else { video.src = src; }
    return () => { if (video._hls) { video._hls.destroy(); video._hls = null; } };
  }, [src, type]);
  return <video ref={videoRef} controls muted playsInline poster={poster || undefined} className={className} />;
}

// ─── Nom court plateforme ─────────────────────────────────────────────────────
function platformShortName(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("steam"))       return "PC - Steam";
  if (t.includes("ubisoft"))     return "PC - Ubisoft Connect";
  if (t.includes("epic"))        return "PC - Epic Games";
  if (t.includes("gog"))         return "PC - GOG";
  if (t.includes("microsoft") && t.includes("xbox")) return "PC / Xbox Series X|S";
  if (t.includes("microsoft"))   return "PC / Xbox Series X|S";
  if (t.includes("xbox"))        return "Xbox Series X|S";
  if (t.includes("playstation") || t.includes("ps5")) return "PS5";
  if (t.includes("ps4"))         return "PS4";
  if (t.includes("nintendo") || t.includes("switch")) return "Switch 2";
  return type;
}

// ─── component ────────────────────────────────────────────────────────────────

function GameDetail() {
  const { igId, steamId, title } = useParams();
  const user  = useSelector(selectUser);
  const userN = auth.currentUser;

  const [steamData,    setSteamData]    = useState(null);
  const [igGame,       setIgGame]       = useState(null);
  const [allEditions,  setAllEditions]  = useState([]); // toutes éditions sans filtre région
  const [loadingSteam, setLoadingSteam] = useState(true);
  const [activeTab,    setActiveTab]    = useState("description");
  const [activeMedia,  setActiveMedia]  = useState("video");
  const [comments,     setComments]     = useState([]);
  const [newComment,   setNewComment]   = useState({ title: "", message: "", rating: 0 });

  // Sélecteurs plateforme / édition (comme sur IG)
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedEdition,  setSelectedEdition]  = useState(null);

  // ── Steam ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!steamId || steamId === "0") { setLoadingSteam(false); return; }
    (async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/api/steam/${steamId}`);
        const data = await res.json();
        setSteamData(data || null);
      } catch (e) { console.error("Steam proxy error", e); }
      finally { setLoadingSteam(false); }
    })();
  }, [steamId]);

  // ── IG game ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        const [r1, r2, r3] = await Promise.all([
          fetch(`${BACKEND_URL}/api/topsellers-recent`).then(r => r.json()).catch(() => []),
          fetch(`${BACKEND_URL}/api/latest-releases`).then(r => r.json()).catch(() => []),
          fetch(`${BACKEND_URL}/api/precommandes`).then(r => r.json()).catch(() => []),
        ]);
        const all = [...(Array.isArray(r1)?r1:[]), ...(Array.isArray(r2)?r2:[]), ...(Array.isArray(r3)?r3:[])];
        setIgGame(all.find(g => String(g.id) === String(igId)) || null);
      } catch (e) { console.error("IG fetch error", e); }
    })();
  }, [igId]);

  // ── Éditions : TOUTES sans filtre région ─────────────────────────────────
  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        const res  = await fetch(`${BACKEND_URL}/api/editions/${igId}`);
        const data = await res.json();
        // Filtre uniquement Upgrade/DLC, garde TOUTES les régions et plateformes
        const filtered = (Array.isArray(data) ? data : []).filter(ed => {
          const n = (ed.name || "").toLowerCase();
          return !n.includes("upgrade") && !n.includes("dlc") && !n.includes("season pass");
        });
        setAllEditions(filtered);
      } catch (e) { console.error("Editions fetch error", e); }
    })();
  }, [igId]);

  // ── Init sélecteurs quand les éditions sont chargées ─────────────────────
  useEffect(() => {
    if (!allEditions.length) return;
    const current = allEditions.find(e => String(e.id) === String(igId));
    if (current) {
      setSelectedPlatform(current.type);
      // selectedEdition = NOM de l'édition (pour grouper les régions)
      setSelectedEdition(current.name);
    } else {
      const first = allEditions.find(e => e.stock === 1) || allEditions[0];
      setSelectedPlatform(first?.type || null);
      setSelectedEdition(first?.name || null);
    }
  }, [allEditions, igId]);

  // ── Données dérivées des sélecteurs ──────────────────────────────────────

  // ── Structure : plateforme → édition → région ─────────────────────────
  // Groupe par type (plateforme)
  const platformGroups = allEditions.reduce((acc, ed) => {
    if (!acc[ed.type]) acc[ed.type] = [];
    acc[ed.type].push(ed);
    return acc;
  }, {});

  // Nom court d'une édition (retire le préfixe du jeu)
  const gameBase = (igGame?.name || "").replace(/[-–].*$/, "").trim();
  const shortEdName = (name) =>
    name.replace(gameBase, "").replace(/^\s*[-–]?\s*/, "").trim() || "Standard Edition";

  // Éditions uniques (par nom) pour la plateforme sélectionnée
  const editionNamesForPlatform = selectedPlatform
    ? [...new Set(
        platformGroups[selectedPlatform]?.map(e => e.name) || []
      )]
    : [];

  // Entrées pour la plateforme + édition sélectionnées (= les régions dispo)
  const regionsForSelection = selectedPlatform && selectedEdition
    ? (platformGroups[selectedPlatform] || []).filter(e => e.name === selectedEdition)
    : [];

  // État du sélecteur région
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Init région : préfère Europe en stock, sinon première en stock, sinon première
  useEffect(() => {
    if (!regionsForSelection.length) return;
    const europeInStock = regionsForSelection.find(e =>
      (e.region || "").toLowerCase().includes("europe") && e.stock === 1
    );
    const anyInStock = regionsForSelection.find(e => e.stock === 1);
    const best = europeInStock || anyInStock || regionsForSelection[0];
    setSelectedRegion(best?.region || null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, selectedEdition, allEditions.length]);

  // L'entrée IG correspondant à la sélection plateforme + édition + région
  const chosenEntry = regionsForSelection.find(e => e.region === selectedRegion)
    || regionsForSelection[0]
    || null;

  const chosenPrice   = chosenEntry ? parseFloat(chosenEntry.price)  : null;
  const chosenRetail  = chosenEntry ? parseFloat(chosenEntry.retail) : null;
  const chosenPromo   = chosenRetail && chosenPrice && chosenRetail > chosenPrice
    ? `-${Math.round(((chosenRetail - chosenPrice) / chosenRetail) * 100)}%` : null;
  const chosenInStock = chosenEntry ? chosenEntry.stock === 1 && chosenPrice > 0 : false;
  const chosenUrl     = chosenEntry?.url || null;
  const editionName   = chosenEntry ? shortEdName(chosenEntry.name) : "Standard Edition";

  // ── Fallback media ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!steamData) return;
    const m = steamData?.movies?.[0];
    const hasVideo = m?.webm?.max || m?.webm?.["480"] || m?.mp4?.max || m?.mp4?.["480"] || m?.hls_h264;
    if (!hasVideo) setActiveMedia(0);
  }, [steamData]);

  // ── Firebase ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!igId) return;
    const gameKey = `ig_${igId}`;
    const q = query(collection(db, "comments"), where("gameId", "==", gameKey));
    const unsub = onSnapshot(q,
      snap => { const arr = []; snap.forEach(d => arr.push({ ...d.data(), id: d.id })); setComments(arr); },
      err  => { console.warn("Firestore read denied:", err.message); setComments([]); }
    );
    return () => unsub();
  }, [igId]);

  useEffect(() => {
    if (!igId || !user || comments.length === 0) return;
    (async () => {
      try {
        const gameKey = `ig_${igId}`;
        const avg     = comments.reduce((a, c) => a + parseInt(c.rating || 0), 0) / comments.length;
        const ref     = doc(db, "games", gameKey);
        const snap    = await getDoc(ref);
        snap.exists() ? await updateDoc(ref, { averageRating: avg }) : await setDoc(ref, { gameId: gameKey, averageRating: avg });
      } catch (err) { console.warn("Firestore write denied:", err.message); }
    })();
  }, [comments, igId, user]);

  const averageRating = comments.length
    ? comments.reduce((a, c) => a + parseInt(c.rating || 0), 0) / comments.length : 0;

  const handleChanges      = e => setNewComment(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleRatingChange = e => setNewComment(p => ({ ...p, rating: parseInt(e.target.value) }));
  const handleSubmit = async e => {
    e.preventDefault();
    if (!user || !userN) return;
    try {
      await addDoc(collection(db, "comments"), {
        gameId: `ig_${igId}`, ...newComment,
        userName: userN.displayName || "Anonymous",
        userPhoto: userN.photoURL   || "https://zupimages.net/up/24/22/cib6.png",
        createdAt: serverTimestamp(),
      });
      setNewComment({ title: "", message: "", rating: 0 });
    } catch (err) { console.error("Erreur commentaire:", err); }
  };

  const screenshots = steamData?.screenshots || [];
  const movies      = steamData?.movies      || [];
  const getVideoSrc = (movie) => {
    if (!movie) return null;
    if (movie?.webm?.max)     return { url: movie.webm.max,    type: "mp4" };
    if (movie?.webm?.["480"]) return { url: movie.webm["480"], type: "mp4" };
    if (movie?.mp4?.max)      return { url: movie.mp4.max,     type: "mp4" };
    if (movie?.mp4?.["480"])  return { url: movie.mp4["480"],  type: "mp4" };
    if (movie?.hls_h264)      return { url: movie.hls_h264,    type: "hls" };
    return null;
  };
  const videoSrc   = getVideoSrc(movies[0]);
  const videoThumb = movies[0]?.thumbnail || null;

  const pcReqs          = steamData?.pc_requirements;
  const steamReviewTotal = steamData?.recommendations?.total || 0;
  const steamReview      = getSteamReviewLabel(steamReviewTotal);
  const metacritic       = steamData?.metacritic || null;
  const steamCategories  = steamData?.categories || [];

  if (loadingSteam) return (
    <><Header /><Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box></>
  );

  const gameTitle  = steamData?.name || igGame?.name || decodeURIComponent(title || "");
  // Badge plateforme (de l'édition choisie)
  const pt = (chosenEntry?.type || igGame?.type || "Steam").toLowerCase();
  const platformLabel = pt.includes("ubisoft") ? "Ubisoft Connect"
    : pt.includes("microsoft") ? "Microsoft Store"
    : pt.includes("xbox")      ? "Xbox"
    : pt.includes("playstation") ? "PlayStation Store"
    : pt.includes("epic")      ? "Epic Games"
    : pt.includes("gog")       ? "GOG"
    : pt.includes("nintendo")  ? "Nintendo eShop"
    : "Steam";
  const platformBg = pt.includes("ubisoft")    ? "#0070cc"
    : pt.includes("microsoft") || pt.includes("xbox") ? "#107c10"
    : pt.includes("playstation") ? "#003087"
    : pt.includes("epic")      ? "#2a2a2a"
    : pt.includes("gog")       ? "#6c4db9"
    : pt.includes("nintendo")  ? "#e4000f"
    : "#14487b";

  return (
    <div>
      <Header />
      {steamData?.background && (
        <div className="gd-hero" style={{ backgroundImage: `url(${steamData.background})` }}>
          <div className="gd-hero-overlay" />
        </div>
      )}
      <div className="nk-gap-1" />
      <div className="container" style={{ paddingTop: 80, maxWidth: 1100, margin: "0 auto" }}>
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

            {/* ── Colonne gauche ── */}
            <div className="col-12 col-md-6">
              <div className="gd-media-main">
                {activeMedia === "video" && videoSrc ? (
                  <HlsPlayer key={videoSrc.url} src={videoSrc.url} type={videoSrc.type} poster={videoThumb} className="gd-media-video" />
                ) : screenshots[activeMedia] ? (
                  <img src={screenshots[activeMedia].path_full} alt="screenshot" className="gd-media-img" />
                ) : igGame?.img ? (
                  <img src={igGame.img} alt={gameTitle} className="gd-media-img" />
                ) : null}
              </div>

              {(videoSrc || screenshots.length > 0) && (
                <div className="gd-thumbstrip">
                  {videoSrc && (
                    <div className={`gd-thumb-wrap${activeMedia === "video" ? " gd-thumb-active" : ""}`} onClick={() => setActiveMedia("video")}>
                      {videoThumb ? <img src={videoThumb} alt="vidéo" className="gd-thumb" /> : <div className="gd-thumb gd-thumb-video-placeholder">▶</div>}
                      <div className="gd-thumb-play">▶</div>
                    </div>
                  )}
                  {screenshots.slice(0, 7).map((s, i) => (
                    <div key={i} className={`gd-thumb-wrap${activeMedia === i ? " gd-thumb-active" : ""}`} onClick={() => setActiveMedia(i)}>
                      <img src={s.path_thumbnail} alt="" className="gd-thumb" />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Sélecteurs Plateforme / Édition ── */}
              {allEditions.length > 0 && (
                <div className="gd-selectors">
                  <div className="gd-selector-group">
                    <label className="gd-selector-label">Plateforme</label>
                    <div className="gd-selector-options">
                      {Object.keys(platformGroups).map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setSelectedPlatform(type);
                            // Sélectionne la première édition (par nom) en stock
                            const firstInStock = platformGroups[type].find(e => e.stock === 1) || platformGroups[type][0];
                            setSelectedEdition(firstInStock?.name || null);
                          }}
                          className={`gd-selector-btn${selectedPlatform === type ? " gd-selector-active" : ""}`}
                        >
                          <PlatformLogo type={type} size={14} />
                          <span>{platformShortName(type)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {editionNamesForPlatform.length > 1 && (
                    <div className="gd-selector-group">
                      <label className="gd-selector-label">Édition</label>
                      <div className="gd-selector-options">
                        {editionNamesForPlatform.map(edName => {
                          const short = shortEdName(edName);
                          // Une édition est "en stock" si au moins une région l'est
                          const edEntries = (platformGroups[selectedPlatform] || []).filter(e => e.name === edName);
                          const hasStock  = edEntries.some(e => e.stock === 1);
                          return (
                            <button
                              key={edName}
                              onClick={() => setSelectedEdition(edName)}
                              className={`gd-selector-btn${selectedEdition === edName ? " gd-selector-active" : ""}${!hasStock ? " gd-selector-soldout" : ""}`}
                            >
                              <span>{short}</span>
                              {!hasStock && <span className="gd-sel-rupture">Rupture</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sélecteur région (si plusieurs régions pour plateforme+édition choisies) */}
                  {regionsForSelection.length > 1 && (
                    <div className="gd-selector-group">
                      <label className="gd-selector-label">Région</label>
                      <div className="gd-selector-options">
                        {regionsForSelection.map(entry => (
                          <button
                            key={entry.region}
                            onClick={() => setSelectedRegion(entry.region)}
                            className={`gd-selector-btn${selectedRegion === entry.region ? " gd-selector-active" : ""}${entry.stock === 0 ? " gd-selector-soldout" : ""}`}
                          >
                            <span>{entry.region}</span>
                            {entry.stock === 0
                              ? <span className="gd-sel-rupture"> — Hors stock</span>
                              : <span className="gd-sel-instock"> ✓ {parseFloat(entry.price).toFixed(2)} €</span>
                            }
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Colonne droite ── */}
            <div className="col-12 col-md-6">

              {/* Badge plateforme + titre */}
              <div className="subinfos">
                <span className="platform gd-platform-badge" style={{ background: platformBg }}>
                  <PlatformLogo type={chosenEntry?.type || igGame?.type || "Steam"} size={18} />
                  &nbsp;{platformLabel}
                </span>
                <h2 className="nk-productpro-title h3pro" style={{ marginLeft: 12, marginBottom: 0 }}>
                  {gameTitle}
                </h2>
              </div>

              {steamData?.short_description && (
                <div className="nk-product-description gd-short-desc">
                  <p>{steamData.short_description}</p>
                </div>
              )}

              {/* Avis Steam + Metacritic */}
              <div className="gd-scores-row">
                {steamReview && steamReviewTotal > 0 && (
                  <div className="gd-score-block">
                    <div className="gd-score-label">Avis Steam</div>
                    <div className="gd-score-value" style={{ color: steamReview.color }}>{steamReview.label}</div>
                    <div className="gd-score-sub">{steamReviewTotal.toLocaleString("fr-FR")} avis</div>
                  </div>
                )}
                {metacritic && (
                  <a href={metacritic.url} target="_blank" rel="noopener noreferrer"
                    className="gd-score-block gd-metacritic" style={{ textDecoration: "none" }}>
                    <div className="gd-score-label">Metacritic</div>
                    <div className="gd-metacritic-score" style={{
                      background: metacritic.score >= 75 ? "#66cc33" : metacritic.score >= 50 ? "#ffcc33" : "#ff0000"
                    }}>{metacritic.score}</div>
                  </a>
                )}
              </div>

              {/* Prix de l'édition choisie */}
              <div className="info gd-price-block">
                {chosenRetail && chosenRetail > (chosenPrice || 0) && (
                  <div className="priceOrigin text-white">{chosenRetail.toFixed(2)} €</div>
                )}
                {chosenPromo && <div className="priceSlidePromo">{chosenPromo}</div>}
                {chosenPrice && chosenPrice > 0 && (
                  <div className="price text-white">{chosenPrice.toFixed(2)} €</div>
                )}
              </div>

              {/* Bouton achat conditionnel */}
              <div className="gd-buy-btn">
                {chosenInStock && chosenUrl ? (
                  <a href={chosenUrl} target="_blank" rel="noopener noreferrer"
                    className="nk-btn nk-btn-rounded nk-btn-color-main-1 gd-btn-instock">
                    🛒 Acheter sur Instant Gaming
                  </a>
                ) : (
                  <button className="nk-btn nk-btn-rounded gd-btn-outofstock" disabled aria-disabled="true">
                    ⛔ Hors stock — {editionName}
                  </button>
                )}
              </div>

              <div className="nk-gap-1" />

              <div className="nk-product-meta gd-meta">
                <div>
                  <strong>Note communauté</strong>:{" "}
                  <span>{getRatingDescription(averageRating)} {getRatingIcon(averageRating)}</span>
                </div>
                {steamData?.genres && (
                  <div><strong>Genres</strong>: {steamData.genres.map(g => g.description).join(", ")}</div>
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
                {steamCategories.length > 0 && (
                  <div className="gd-steam-features">
                    {steamCategories.map(cat => (
                      <span key={cat.id} className="gd-feature-tag">{cat.description}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="nk-gap-2" />

        <div className="nk-tabs">
          <ul className="nav nav-tabs" role="tablist">
            {[
              { key: "description", label: "Description" },
              { key: "config",      label: "Config requise" },
              { key: "comment",     label: `Commentaires (${comments.length})` },
            ].map(t => (
              <li className="nav-item" key={t.key}>
                <span className={activeTab === t.key ? "active nav-link" : "nav-link"}
                  style={{ cursor: "pointer" }} onClick={() => setActiveTab(t.key)}>{t.label}</span>
              </li>
            ))}
          </ul>
          <div className="tab-content">
            {activeTab === "description" && (
              <div className="tab-pane fade show active">
                <div className="nk-gap" />
                {steamData?.detailed_description ? (
                  <div className="steam-desc-content" dangerouslySetInnerHTML={{ __html: steamData.detailed_description }} />
                ) : <p style={{ color: "#888" }}>Aucune description disponible.</p>}
              </div>
            )}
            {activeTab === "config" && (
              <div className="tab-pane fade show active">
                <div className="nk-gap" />
                <div className="row gd-config-row">
                  {pcReqs?.minimum && (
                    <div className="col-12 col-md-6 gd-config-col">
                      <h4 className="gd-config-title">⚙️ Configuration minimale</h4>
                      <div className="gd-config-content" dangerouslySetInnerHTML={{ __html: pcReqs.minimum }} />
                    </div>
                  )}
                  {pcReqs?.recommended && (
                    <div className="col-12 col-md-6 gd-config-col">
                      <h4 className="gd-config-title">🚀 Configuration recommandée</h4>
                      <div className="gd-config-content" dangerouslySetInnerHTML={{ __html: pcReqs.recommended }} />
                    </div>
                  )}
                  {!pcReqs?.minimum && !pcReqs?.recommended && (
                    <p className="col-12" style={{ color: "#888", padding: "20px 15px" }}>Configuration non disponible.</p>
                  )}
                </div>
              </div>
            )}
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
                            <img src={userN?.photoURL} alt="" style={{ width: 35, borderRadius: "50%" }} />
                            <span>{user.displayName}</span>
                          </div>
                        </div>
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <React.Fragment key={i}>
                              <input type="radio" id={`rate-${i + 1}`} name="rating" value={i + 1}
                                onChange={handleRatingChange} checked={newComment.rating === i + 1}
                                style={{ display: "none" }} />
                              <label htmlFor={`rate-${i + 1}`} style={{ cursor: "pointer" }}>
                                {newComment.rating >= i + 1 ? <StarIcon /> : <StarBorderIcon />}
                              </label>
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="col-sm-6">
                          <input type="text" className="form-control required" name="title"
                            placeholder="Titre *" value={newComment.title} onChange={handleChanges} required />
                        </div>
                      </div>
                      <div className="nk-gap-1" />
                      <textarea className="form-control required" name="message" rows="5"
                        placeholder="Ton message *" value={newComment.message} onChange={handleChanges} required />
                      <div className="nk-gap-1" />
                      <button className="nk-btn nk-btn-rounded nk-btn-color-dark-3 float-right">Envoyer</button>
                    </form>
                  </div>
                ) : (
                  <Link to="/Login"><button className="fa fa-user"> Se connecter</button></Link>
                )}
                <div className="clearfix" /><div className="nk-gap-2" />
                <div className="nk-comments">
                  <h3>Commentaires</h3>
                  {comments.map(comment => (
                    <div key={comment.id} className="nk-comment">
                      <div className="nk-comment-meta">
                        <img src={comment.userPhoto} alt={comment.userName} className="rounded-circle" width="35" />{" "}
                        par <Link to="/...">{comment.userName}</Link>{" "}
                        {comment.createdAt ? `le ${new Date(comment.createdAt.seconds * 1000).toLocaleDateString("fr-FR")}` : ""}
                        <div className="nk-review-rating" data-rating={comment.rating}>
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={comment.rating > i ? "fa fa-star" : "far fa-star"} />
                          ))}
                        </div>
                      </div>
                      <p>{comment.title}</p>
                      <div className="nk-comment-text"><p>{comment.message}</p></div>
                    </div>
                  ))}
                </div>
                <div className="clearfix" /><div className="nk-gap-2" />
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