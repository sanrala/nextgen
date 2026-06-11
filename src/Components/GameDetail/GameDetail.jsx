import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { auth, db } from "../../Firebase";
import {
  collection, addDoc, query, where, onSnapshot,
  serverTimestamp, setDoc, doc, getDoc, getDocs
} from "firebase/firestore";
import { useAdmin } from "../../useAdmin";
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

const IG_ICON_BASE = "https://www.instant-gaming.com/themes/assets/store";

const PLATFORM_ICONS = {
  steam:       `${IG_ICON_BASE}/icon-stm.svg`,
  ubisoft:     `${IG_ICON_BASE}/icon-uplay.svg`,
  playstation: `${IG_ICON_BASE}/icon-play2.svg`,
  nintendo:    `${IG_ICON_BASE}/icon-swt.svg`,
  xbox:        `${IG_ICON_BASE}/icon-xbx-360.svg`,
  microsoft:   `${IG_ICON_BASE}/icon-xbx-360.svg`,
  epic:        `${IG_ICON_BASE}/icon-epic.svg`,
  gog:         `${IG_ICON_BASE}/icon-gog.svg`,
  ea:          `${IG_ICON_BASE}/icon-ea.svg`,
};

// Filtre CSS pour forcer l'icône en blanc
const WHITE_FILTER = "brightness(0) invert(1)";

function PlatformLogo({ type, size = 16 }) {
  const t = (type || "").toLowerCase();
  const base = { width: size, height: size, display: "inline-block", verticalAlign: "middle", flexShrink: 0, objectFit: "contain" };

  // Rockstar : R noir sur fond jaune, étoile blanche — SVG inline
  if (t.includes("rockstar")) return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      {/* R noir */}
      <path d="M8 8 h36 c17 0 27 10 27 23 c0 10-6 18-16 21 l18 28 h-19 l-17-26 h-13 v26 h-16 z M24 22 v16 h18 c5 0 9-3.5 9-8 s-4-8-9-8 z" fill="#1a1a1a"/>
      {/* Étoile blanche plus grande */}
      <polygon points="76,48 80,62 95,62 83,71 87,85 76,76 65,85 69,71 57,62 72,62" fill="#ffffff"/>
    </svg>
  );

  let src = null;
  if (t.includes("steam"))                                                        src = PLATFORM_ICONS.steam;
  else if (t.includes("ubisoft"))                                                 src = PLATFORM_ICONS.ubisoft;
  else if (t.includes("playstation") || t.includes("ps5") || t.includes("ps4")) src = PLATFORM_ICONS.playstation;
  else if (t.includes("nintendo") || t.includes("switch"))                       src = PLATFORM_ICONS.nintendo;
  else if (t.includes("xbox"))                                                    src = PLATFORM_ICONS.xbox;
  else if (t.includes("microsoft"))                                               src = PLATFORM_ICONS.microsoft;
  else if (t.includes("epic"))                                                    src = PLATFORM_ICONS.epic;
  else if (t.includes("gog"))                                                     src = PLATFORM_ICONS.gog;
  else if (t.includes("ea app") || t.includes("origin"))                         src = PLATFORM_ICONS.ea;

  if (src) return <img src={src} alt={type} style={{ ...base, filter: WHITE_FILTER }} />;

  // Fallback générique manette
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffffff" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  );
}

// ─── Séparateur ──────────────────────────────────────────────────────────────
function Separator({ label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 18,
      margin: "52px 0 28px"
    }}>
      {/* Barre verticale rouge */}
      <div style={{ width: 5, height: 28, background: "#dd163b", borderRadius: 3, flexShrink: 0 }} />
      {/* Tiret horizontal rouge */}
      <div style={{ width: 32, height: 3, background: "#dd163b", borderRadius: 2, flexShrink: 0 }} />
      {label && (
        <span style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "clamp(14px, 4vw, 25px)",
          color: "#ccc",
          letterSpacing: "clamp(1px, 0.8vw, 4px)",
          textTransform: "uppercase",
          whiteSpace: "normal",
          fontWeight: 800,
        }}>
          {label}
        </span>
      )}
      {/* Ligne dégradée */}
      <div style={{
        flex: 1,
        height: 1,
        background: "linear-gradient(to right, rgba(221,22,59,0.3), transparent)"
      }} />
    </div>
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
  if (t.includes("rockstar")) return "PC - Rockstar";
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
  const user    = useSelector(selectUser);
  const userN   = auth.currentUser;
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  // ── Admin panel state ──
  const [adminOpen,      setAdminOpen]      = useState(false);
  const [adminSaving,    setAdminSaving]    = useState(false);
  const [adminMsg,       setAdminMsg]       = useState("");
  const [adminMsgType,   setAdminMsgType]   = useState("success");
  const [adminDesc,      setAdminDesc]      = useState("");
  const [adminDev,       setAdminDev]       = useState("");
  const [adminPub,       setAdminPub]       = useState("");
  const [adminDate,      setAdminDate]      = useState("");
  const [adminDateMode,  setAdminDateMode]  = useState("global");
  const [adminDateByPlatform, setAdminDateByPlatform] = useState({ PC:"", PlayStation:"", Xbox:"", Nintendo:"" });
  const [adminYoutube,   setAdminYoutube]   = useState("");
  const [adminFeatured,  setAdminFeatured]  = useState(false);
  const [adminFeaturedPlatforms, setAdminFeaturedPlatforms] = useState([]);
  const [adminTrending,  setAdminTrending]  = useState(false);
  const [adminReleased,  setAdminReleased]  = useState(false);
  const [adminReleasedPlatforms, setAdminReleasedPlatforms] = useState([]);
  const [adminScreenshots, setAdminScreenshots] = useState([]);
  const [adminNewFiles,  setAdminNewFiles]  = useState([]);
  const [adminNewPreviews, setAdminNewPreviews] = useState([]);
  const adminScreenRef = useRef();
  const CLOUDINARY_CLOUD  = "dl0eijxyn";
  const CLOUDINARY_PRESET = "ml_default";

  const [steamData,    setSteamData]    = useState(null);
  const [igGame,       setIgGame]       = useState(null);
  const [allEditions,  setAllEditions]  = useState([]); // toutes éditions sans filtre région
  // eslint-disable-next-line no-unused-vars
  const [loadingSteam, setLoadingSteam] = useState(false);
  const [activeTab,    setActiveTab]    = useState("description");
  const [activeMedia,  setActiveMedia]  = useState("video");
  const [comments,     setComments]     = useState([]);
  const [newComment,   setNewComment]   = useState({ title: "", message: "", rating: 0 });
  const [franchise,    setFranchise]    = useState([]);
  const [similar,      setSimilar]      = useState([]);
  const [articles,     setArticles]     = useState([]);

  // Sélecteurs plateforme / édition (comme sur IG)
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedEdition,  setSelectedEdition]  = useState(null);

  // Hero background : fallback IG si Steam library_hero.jpg indisponible
  const [heroImgError, setHeroImgError] = useState(false);

  // ── Test disponibilité hero Steam → fallback IG ──────────────────────────
  useEffect(() => {
    setHeroImgError(false);
  }, [igId]);

  // ── Steam + Firebase cache ────────────────────────────────────────────────
  useEffect(() => {
  if (!igId) { setLoadingSteam(false); return; }
  (async () => {
    try {
      const fbRef  = doc(db, "games", `ig_${igId}`);
      const fbSnap = await getDoc(fbRef);

if (fbSnap.exists()) {
  const cached = fbSnap.data();
  const savedAt = cached.savedAt?.toMillis?.() || 0;
  const AGE_LIMIT = 24 * 60 * 60 * 1000; // 24h
  const isFresh = (Date.now() - savedAt) < AGE_LIMIT;
  const isConsoleCached = cached.steamData?.source === 'rawg';

  if (cached.steamData && isFresh && !isConsoleCached) {
    setSteamData(cached.steamData);
    const [frRes, siRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/franchise/${igId}`).then(r => r.json()).catch(() => []),
      fetch(`${BACKEND_URL}/api/similar/${igId}`).then(r => r.json()).catch(() => []),
    ]);
    setFranchise(Array.isArray(frRes) ? frRes : []);
    setSimilar(Array.isArray(siRes) ? siRes : []);
    setLoadingSteam(false);
    return;
  }
  // cache expiré, absent, ou données RAWG → re-fetch
}

      // Récupère les infos IG du jeu (type, steam_id éventuel)
      const igGameData = await fetch(`${BACKEND_URL}/api/game/${igId}`)
        .then(r => r.ok ? r.json() : null).catch(() => null);
      const gameType = (igGameData?.type || "").toLowerCase();

      let resolvedSteamId = steamId && steamId !== "0" ? steamId : null;

      const isConsole = gameType.includes("playstation") || gameType.includes("ps5") ||
        gameType.includes("ps4") || gameType.includes("nintendo") ||
        gameType.includes("switch") || gameType.includes("microsoft") ||
        gameType.includes("xbox") || gameType.includes("ubisoft");

      // Si steamId fourni dans l'URL → toujours utiliser Steam (peu importe le type)
      // PC uniquement sans steamId — jamais pour les consoles (risque de mauvais jeu)
      if (!resolvedSteamId && !isConsole) {
        const isPC = gameType.includes("steam") || gameType.includes("epic") ||
          gameType.includes("gog") || gameType.includes("battle") ||
          gameType.includes("rockstar") || gameType.includes("ea app") ||
          gameType.includes("other");
        if (isPC) {
          const editions = await fetch(`${BACKEND_URL}/api/editions/${igId}`)
            .then(r => r.ok ? r.json() : []).catch(() => []);
          const found = editions.find(e => String(e.id) === String(igId));
          if (found?.steam_id) resolvedSteamId = found.steam_id;
        }
      }

      // Pour les jeux console : cherche sur Steam via le nom
      // Quand Steam aura les infos, ça se mettra à jour automatiquement via Firebase
      let steamIdFromSearch = null;
      if (!resolvedSteamId && isConsole && igGameData?.name) {
        const cleanName = (igGameData.name)
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/:/g, "")
          .replace(/\+.*$/, "")
          .replace(/deluxe|ultimate|gold|premium|standard/gi, "")
          .trim();
        const steamSearch = await fetch(`${BACKEND_URL}/api/steam-search?term=${encodeURIComponent(cleanName)}`)
          .then(r => r.ok ? r.json() : null).catch(() => null);
        const items = steamSearch?.items || [];
        const nameLower = cleanName.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        const match = items.find(i => i.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim() === nameLower)
          || items.find(i => {
            const iName = i.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
            const iWords = iName.split(' ').slice(0, 4).join(' ');
            const gWords = nameLower.split(' ').slice(0, 4).join(' ');
            return gWords.length > 6 && iWords === gWords;
          });
        if (match?.id) steamIdFromSearch = match.id;
      }

      const finalSteamId = resolvedSteamId || steamIdFromSearch;

      const [gameDataRes, frRes, siRes] = await Promise.all([
        finalSteamId
          ? fetch(`${BACKEND_URL}/api/steam/${finalSteamId}`).then(r => r.ok ? r.json() : null).catch(() => null)
          : Promise.resolve(null),
        fetch(`${BACKEND_URL}/api/franchise/${igId}`).then(r => r.json()).catch(() => []),
        fetch(`${BACKEND_URL}/api/similar/${igId}`).then(r => r.json()).catch(() => []),
      ]);

      const fr = Array.isArray(frRes) ? frRes : [];
      const si = Array.isArray(siRes) ? siRes : [];

      if (gameDataRes) {
        setSteamData(gameDataRes);
        // Sauvegarde Firebase uniquement si vraies données Steam
        try {
          await setDoc(fbRef, { igId, savedAt: serverTimestamp(), steamData: gameDataRes }, { merge: true });
        } catch (writeErr) {
          console.warn("Firebase write error:", writeErr.message);
        }
      } else if (igGameData) {
        // Pas encore sur Steam → données IG minimales, rien en Firebase
        // Quand Steam ajoutera le jeu, Firebase vide → re-fetch automatique
        setSteamData({
          name: igGameData.name,
          short_description: "",
          detailed_description: "",
          header_image: igGameData.img || "",
          genres: [],
          developers: "",
          publishers: "",
          release_date: { date: "" },
          screenshots: [],
          movies: [],
          source: "ig",
        });
      }
      setFranchise(fr);
      setSimilar(si);

    } catch (e) {
      console.error("Steam/Firebase error", e);
    } finally {
      setLoadingSteam(false);
    }
  })();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [igId]);

  // ── IG game ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        // Appel direct au catalogue par igId — fonctionne pour tous les jeux
        // (pas seulement topsellers/latest/precommandes)
        const res = await fetch(`${BACKEND_URL}/api/game/${igId}`);
        if (res.ok) {
          const game = await res.json();
          setIgGame(game || null);
          return;
        }
        // Fallback sur les 3 listes si l'endpoint échoue
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

  // ── Articles du jeu (Firestore) ──────────────────────────────────────────
  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        // Filtre par nom du jeu (premiers mots) — couvre toutes les éditions
        // gameTitle peut ne pas être dispo dans useEffect, on utilise les sources directes
        const rawTitle = steamData?.name || igGame?.name || decodeURIComponent(title || "");
        const baseTitle = rawTitle
          .replace(/[-–:].*/,'')
          .replace(/deluxe|ultimate|gold|premium|standard|edition/gi,'')
          .trim()
          .toLowerCase()
          .split(' ')
          .slice(0, 3)
          .join(' ');

        const allSnap = await getDocs(collection(db, "articles"));
        const arts = allSnap.docs
          .map(d => ({ doc_id: d.id, ...d.data() }))
          .filter(a => {
            if (a.status !== "public") return false;
            const artName = (a.game_name || "")
              .replace(/[-–:].*/,'')
              .replace(/deluxe|ultimate|gold|premium|standard|edition/gi,'')
              .trim()
              .toLowerCase()
              .split(' ')
              .slice(0, 3)
              .join(' ');
            return artName.includes(baseTitle) || baseTitle.includes(artName);
          })
          .sort((a, b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0))
          .slice(0, 5);
        setArticles(arts);
      } catch (e) {
        console.warn("Articles fetch error", e);
        setArticles([]);
      }
    })();
    // Dépend de igGame et steamData pour avoir le nom du jeu
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igId, igGame?.name, steamData?.name]);

  // ── Franchise + Similar — gérés dans le useEffect Steam+Firebase ci-dessus ──

  // ── Éditions : TOUTES sans filtre région ─────────────────────────────────
  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        // 1. Vérifie Firebase d'abord
        let cachedEditions = [];
        const fbRef = doc(db, "games", `ig_${igId}`);
        const fbSnap = await getDoc(fbRef);
        if (fbSnap.exists() && fbSnap.data().editions?.length) {
          const noLatam = fbSnap.data().editions.filter(ed =>
            !(ed.region || "").toLowerCase().includes("latin")
          );
          setAllEditions(noLatam);
          return;
        }

        // 2. Fetch depuis l'API
        const res = await fetch(`${BACKEND_URL}/api/editions/${igId}`);
        const data = await res.json();
        let filtered = (Array.isArray(data) ? data : []).filter(ed => {
          const n = (ed.name || "").toLowerCase();
          if (n.includes("upgrade") || n.includes("dlc") ||
              n.includes("season pass") || n.includes("credits") ||
              n.includes("traque") || n.includes("pack") ||
              n.includes("klauen") || n.includes("awaji")) return false;
          if ((ed.region || "").toLowerCase().includes("latin")) return false;
          return true;
        });
if (cachedEditions.length) {
  filtered = filtered.map(apiEd => {
    const cached = cachedEditions.find(c => c.id === apiEd.id);

    if (!cached) return apiEd;

    return {
      ...cached,
      ...apiEd,

      // 🔥 ON FORCE LES PRIX API
      price: apiEd.price,
      retail: apiEd.retail
    };
  });
}

        // 3. Si l'igId courant n'est pas dans la liste, l'ajouter
        const currentInList = filtered.find(e => String(e.id) === String(igId));
        if (!currentInList) {
          const selfRes = await fetch(`${BACKEND_URL}/api/game/${igId}`);
          if (selfRes.ok) {
            const self = await selfRes.json();
            if (self && self.id) filtered = [self, ...filtered];
          }
        }

        setAllEditions(filtered);

        // ── Redirection automatique US/Worldwide → Europe ──────────────────
        // Si l'édition courante est US ou Worldwide, et qu'une version Europe
        // avec prix existe, rediriger vers elle
        const currentEd = filtered.find(e => String(e.id) === String(igId));
        if (currentEd) {
          const currentRegion = (currentEd.region || "").toLowerCase();
          const isUSOrWorldwide = currentRegion.includes("us") || currentRegion === "worldwide";
          if (isUSOrWorldwide) {
            const europeEd = filtered.find(e => {
              const r = (e.region || "").toLowerCase();
              return (r.includes("europe") || r.includes("fr")) &&
                     e.type === currentEd.type &&
                     parseFloat(e.price) > 0 &&
                     e.stock === 1;
            });
            if (europeEd) {
              const slug = europeEd.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
              const isEuSteam = (europeEd.type || "").toLowerCase().includes("steam");
              navigate(`/store/${europeEd.id}/${isEuSteam ? (europeEd.steam_id || 0) : 0}/${slug}`, { replace: true });
              return;
            }
          }
        }

        // 4. Sauvegarder dans Firebase pour TOUS les igIds des éditions
        try {
          await Promise.all(filtered.map(ed =>
            setDoc(doc(db, "games", `ig_${ed.id}`), { editions: filtered }, { merge: true })
          ));
        } catch (e) { console.warn("Firebase editions write:", e); }

      } catch (e) { console.error("Editions fetch error", e); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const gameBase = (igGame?.name || "")
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/\s*(deluxe|ultimate|gold|premium|standard)\s*edition.*/gi, "")
    .replace(/\s*edition.*/gi, "")
    .replace(/[-–].*$/, "")
    .trim();
  const shortEdName = (name) => {
    // Retire le nom de base du jeu
    let short = name.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    const baseNorm = gameBase.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    short = short.replace(baseNorm, "").replace(/^\s*[-–]?\s*/, "").trim();
    // Si vide ou juste "Edition", c'est la Standard
    if (!short || short.toLowerCase() === "edition") return "Standard Edition";
    // Si ça ne contient pas "Edition", ajoute-le
    if (!short.toLowerCase().includes("edition")) short = short + " Edition";
    return short;
  };

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

  // ── Pré-remplir le panneau admin depuis Firebase/steamData ─────────────
  useEffect(() => {
    if (!isAdmin || !igId) return;
    (async () => {
      const snap = await getDoc(doc(db, "games", `ig_${igId}`));
      const data = snap.exists() ? snap.data() : null;
      const sd   = data?.steamData;
      setAdminDesc(sd?.short_description || "");
      setAdminDev(Array.isArray(sd?.developers) ? sd.developers[0] || "" : sd?.developers || "");
      setAdminPub(Array.isArray(sd?.publishers) ? sd.publishers[0] || "" : sd?.publishers || "");
      setAdminDate(sd?.release_date?.date || "");
      setAdminDateMode(sd?.release_date?.byPlatform ? "byplatform" : "global");
      setAdminDateByPlatform({
        PC:          sd?.release_date?.byPlatform?.PC          || "",
        PlayStation: sd?.release_date?.byPlatform?.PlayStation || "",
        Xbox:        sd?.release_date?.byPlatform?.Xbox        || "",
        Nintendo:    sd?.release_date?.byPlatform?.Nintendo    || "",
      });
      setAdminYoutube(sd?.youtube_id ? `https://www.youtube.com/watch?v=${sd.youtube_id}` : "");
      setAdminFeatured(data?.featured || false);
      setAdminFeaturedPlatforms(data?.featuredPlatforms || []);
      setAdminTrending(data?.trending || false);
      setAdminReleased(!!data?.releasedAt);
      setAdminReleasedPlatforms(data?.releasedAt ? (data?.featuredPlatforms || []) : []);
      setAdminScreenshots(sd?.screenshots || []);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, igId]);

  // ── Save admin changes ────────────────────────────────────────────────────
  const handleAdminClearCache = async () => {
    if (!window.confirm("Vider le cache Firebase de ce jeu (steamData + éditions) ?")) return;
    setAdminSaving(true);
    try {
      const { deleteField } = await import("firebase/firestore");
      // Vide le cache pour TOUTES les éditions du jeu
      const allIds = allEditions.length > 0
        ? [...new Set(allEditions.map(e => e.id))]
        : [igId];
      await Promise.all(allIds.map(id =>
        setDoc(doc(db, "games", `ig_${id}`), {
          steamData: deleteField(), savedAt: deleteField(),
          igName: deleteField(), editions: deleteField()
        }, { merge: true })
      ));
      setSteamData(null);
      setAdminMsg(`🔄 Cache vidé pour ${allIds.length} édition(s). Rechargez la page.`);
      setAdminMsgType("success");
    } catch (e) {
      setAdminMsg("Erreur : " + e.message);
      setAdminMsgType("error");
    } finally { setAdminSaving(false); }
  };

  const handleAdminSave = async () => {
    setAdminSaving(true); setAdminMsg("");
    try {
      // Upload nouveaux screenshots
      const uploaded = [];
      for (let i = 0; i < adminNewFiles.length; i++) {
        const fd = new FormData();
        fd.append("file", adminNewFiles[i]);
        fd.append("upload_preset", CLOUDINARY_PRESET);
        fd.append("folder", "nextgen/screenshots");
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method:"POST", body:fd });
        const data = await res.json();
        uploaded.push({ id: Date.now()+i, path_full: data.secure_url, path_thumbnail: data.secure_url });
      }
      const allScreenshots = [...adminScreenshots, ...uploaded];

      const ytMatch = adminYoutube.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const ytId = ytMatch ? ytMatch[1] : null;

      // Sauvegarde steamData sur TOUTES les éditions du jeu
      const allEditionIds = allEditions.length > 0
        ? [...new Set(allEditions.map(e => e.id))]
        : [igId];

      const steamDataPayload = {
        short_description: adminDesc,
        developers: [adminDev],
        publishers: [adminPub],
        release_date: {
          date: adminDateMode === "global" ? adminDate : "",
          byPlatform: adminDateMode === "byplatform" ? adminDateByPlatform : null,
        },
        screenshots: allScreenshots,
        ...(ytId ? { youtube_id: ytId } : {}),
      };

      // Pour chaque édition : merge steamData
      await Promise.all(allEditionIds.map(async (edId) => {
        const edRef  = doc(db, "games", `ig_${edId}`);
        const edSnap = await getDoc(edRef);
        const edExisting = edSnap.exists() ? edSnap.data() : {};
        await setDoc(edRef, {
          steamData: { ...(edExisting.steamData || {}), ...steamDataPayload },
          savedAt: serverTimestamp(),
        }, { merge: true });
      }));

      // Mise en avant + trending : seulement sur l'édition courante
      const fbRef = doc(db, "games", `ig_${igId}`);
      await setDoc(fbRef, {
        featured: adminReleased ? false : adminFeatured,
        featuredPlatforms: adminReleased ? adminReleasedPlatforms : (adminFeatured ? adminFeaturedPlatforms : []),
        featuredGame: (adminFeatured || adminReleased) ? {
          id: igId, name: igGame?.name || gameTitle,
          img: igGame?.img || "", type: igGame?.type || "",
        } : null,
        releasedAt: adminReleased
          ? (adminDate || adminDateByPlatform?.PlayStation || adminDateByPlatform?.Xbox || adminDateByPlatform?.Nintendo || "sorti")
          : null,
        trending: adminTrending,
        trendingGame: adminTrending ? {
          id: igId, name: igGame?.name || gameTitle,
          img: igGame?.img || "", type: igGame?.type || "",
        } : null,
      }, { merge: true });

      setAdminScreenshots(allScreenshots);
      setAdminNewFiles([]); setAdminNewPreviews([]);
      setAdminMsg(`✅ Fiche mise à jour sur ${allEditionIds.length} édition(s) !`);
      setAdminMsgType("success");
      // Recharge steamData
      setSteamData(prev => ({
        ...prev,
        short_description: adminDesc,
        developers: [adminDev],
        publishers: [adminPub],
        screenshots: allScreenshots,
        ...(ytId ? { youtube_id: ytId } : {}),
      }));
    } catch (e) {
      setAdminMsg("Erreur : " + e.message);
      setAdminMsgType("error");
    } finally {
      setAdminSaving(false);
    }
  };

  // ── Fallback media ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!steamData) return;
    const m = steamData?.movies?.[0];
    const hasVideo = m?.webm?.max || m?.webm?.["480"] || m?.mp4?.max || m?.mp4?.["480"] || m?.hls_h264 || steamData?.youtube_id;
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
        // const snap    = await getDoc(ref);
        await setDoc(ref, { gameId: gameKey, averageRating: avg }, { merge: true });
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
  const youtubeId   = steamData?.youtube_id  || null;
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

  // Attend seulement les données IG (rapides) avant d'afficher
  if (!igGame && !steamData) return (
    <><Header /><Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box></>
  );

  const gameTitle = chosenEntry?.name || steamData?.name || igGame?.name || decodeURIComponent(title || "");
  // Badge plateforme (de l'édition choisie)
  const pt = (chosenEntry?.type || igGame?.type || "Steam").toLowerCase();
const platformLabel = pt.includes("rockstar") ? "Rockstar"
  : pt.includes("ubisoft") ? "Ubisoft Connect"
  : pt.includes("microsoft") ? "Microsoft Store"
  : pt.includes("xbox")      ? "Xbox"
  : pt.includes("playstation") ? "PlayStation Store"
  : pt.includes("epic")      ? "Epic Games"
  : pt.includes("gog")       ? "GOG"
  : pt.includes("nintendo")  ? "Nintendo eShop"
  : "Steam";
  const platformBg = pt.includes("rockstar")   ? "#F7941D"
    : pt.includes("ubisoft")    ? "#0070cc"
    : pt.includes("microsoft") || pt.includes("xbox") ? "#107c10"
    : pt.includes("playstation") ? "#003087"
    : pt.includes("epic")      ? "#2a2a2a"
    : pt.includes("gog")       ? "#6c4db9"
    : pt.includes("nintendo")  ? "#e4000f"
    : "#14487b";
function formatEdition(name) {
  return name
    .replace(/^[^:]+:\s*/, '')
    .trim()
}
const heroId =
  chosenEntry?.steam_id ||
  steamData?.steam_appid ||
  steamId;


console.log("heroId:", heroId);
console.log("allEditions:", allEditions);
console.log("first img:", allEditions?.[0]?.img);

  return (
    <div style={{ position: "relative" }}>
      <Header />
     



{((heroId && heroId !== "0") || screenshots?.[0]?.path_full || igGame?.img || allEditions?.[0]?.img) && (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      height: "580px",
      backgroundImage: (() => {
        const steamHero = heroId && heroId !== "0" && !heroImgError
          ? `url(https://images.weserv.nl/?url=cdn.akamai.steamstatic.com/steam/apps/${heroId}/library_hero.jpg)`
          : null;
        const igFallback = screenshots?.[0]?.path_full || igGame?.img || allEditions?.[0]?.img;
        const igUrl = igFallback
          ? `url(https://images.weserv.nl/?url=${igFallback.replace(/^https?:\/\//, "")})`
          : null;
        return steamHero || igUrl || "none";
      })(),
      backgroundSize: "cover",
      backgroundPosition: "center top",
      zIndex: 0,
    }}
  >
    {/* Sonde invisible : détecte si library_hero.jpg est disponible */}
    {heroId && heroId !== "0" && !heroImgError && (
      <img
        src={`https://images.weserv.nl/?url=cdn.akamai.steamstatic.com/steam/apps/${heroId}/library_hero.jpg`}
        alt=""
        style={{ display: "none" }}
        onError={() => setHeroImgError(true)}
      />
    )}
     
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(23,30,34,0.9) 10%, rgba(23,30,34,0.4) 60%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(23,30,34,1) 0%, transparent 55%)" }} />
        </div>
      )}

      <div className="container gd-container" style={{ position: "relative", zIndex: 1 }}>
        <ul className="nk-breadcrumbs">
          <li><Link to="/">Accueil</Link></li>
          <li><span className="fa fa-angle-right" /></li>
          <li><Link to="/Catalogues/">Jeux</Link></li>
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
                ) : activeMedia === "video" && youtubeId ? (
                  <iframe
                    key={youtubeId}
                    className="gd-media-video"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: "100%", aspectRatio: "16/9", border: "none" }}
                  />
                ) : screenshots[activeMedia] ? (
                  <img src={screenshots[activeMedia].path_full} alt="screenshot" className="gd-media-img" />
                ) : igGame?.img ? (
                  <img src={igGame.img} alt={gameTitle} className="gd-media-img" />
                ) : null}
              </div>

              {(videoSrc || youtubeId || screenshots.length > 0) && (
                <div className="gd-thumbstrip">
                  {(videoSrc || youtubeId) && (
                    <div className={`gd-thumb-wrap${activeMedia === "video" ? " gd-thumb-active" : ""}`} onClick={() => setActiveMedia("video")}>
                      {videoThumb
                        ? <img src={videoThumb} alt="vidéo" className="gd-thumb" />
                        : youtubeId
                          ? <img src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} alt="vidéo" className="gd-thumb" />
                          : <div className="gd-thumb gd-thumb-video-placeholder">▶</div>
                      }
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

              {/* Titre + prix dupliqués ici pour mobile (cachés sur desktop) */}
              <div className="gd-mobile-header">
                <div className="subinfos" style={{ marginTop: 12 }}>
                  <span className="platform gd-platform-badge" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <span style={{ background: platformBg, borderRadius: "50%", width: 42, height: 42, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <PlatformLogo type={chosenEntry?.type || igGame?.type || "Steam"} size={32} />
                    </span>
                    &nbsp;{platformLabel}
                  </span>
                  <h2 className="nk-productpro-title h3pro" style={{ marginLeft: 10, marginBottom: 0, fontSize: "1rem" }}>
                    {gameTitle}
                  </h2>
                </div>
                <div className="info gd-price-block" style={{ marginTop: 8 }}>
                  {chosenRetail && chosenRetail > (chosenPrice || 0) && (
                    <div className="priceOrigin text-white">{chosenRetail.toFixed(2)} €</div>
                  )}
                  {chosenPromo && <div className="priceSlidePromo">{chosenPromo}</div>}
                  {chosenPrice && chosenPrice > 0 && (
                    <div className="price text-white">{chosenPrice.toFixed(2)} €</div>
                  )}
                </div>
              </div>

              {/* ── Sélecteurs Plateforme / Édition ── */}
             {/* ── Sélecteurs Plateforme / Édition ── */}
{allEditions.length > 0 && (
  <div className="gd-selectors">

    {/* Plateforme */}
    <div className="gd-selector-group">
      <label className="gd-selector-label">Plateforme</label>
      <div className="gd-select-wrapper">
        <select
          className="gd-select"
          value={selectedPlatform || ""}
          onChange={e => {
            const type = e.target.value;
            setSelectedPlatform(type);

            const first = platformGroups[type]?.find(ed => ed.stock === 1) || platformGroups[type]?.[0];
            setSelectedEdition(first?.name || null);
            setSelectedRegion(null);

            if (first && String(first.id) !== String(igId)) {
              const clean = first.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
              const isSteamType = (first.type || "").toLowerCase().includes("steam");
              navigate(`/store/${first.id}/${isSteamType ? (first.steam_id || 0) : 0}/${clean}`);
            }
          }}
        >
          {Object.keys(platformGroups).map(type => (
            <option key={type} value={type}>
              {platformShortName(type)}
            </option>
          ))}
        </select>
        <span className="gd-select-arrow">▾</span>
      </div>
    </div>

    {/* Édition */}
    {editionNamesForPlatform.length > 1 && (
      <div className="gd-selector-group">
        <label className="gd-selector-label">Édition</label>
        <div className="gd-select-wrapper">
          <select
            className="gd-select"
            value={selectedEdition || ""}
            onChange={e => {
              const edName = e.target.value;
              setSelectedEdition(edName);
              setSelectedRegion(null);

              const entries = (platformGroups[selectedPlatform] || []).filter(e => e.name === edName);
              const best = entries.find(e => e.stock === 1) || entries[0];

              if (best && String(best.id) !== String(igId)) {
                const clean = best.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
                const isSteamType = (best.type || "").toLowerCase().includes("steam");
                navigate(`/store/${best.id}/${isSteamType ? (best.steam_id || 0) : 0}/${clean}`);
              }
            }}
          >
            {editionNamesForPlatform.map(name => (
              <option key={name} value={name}>
                {formatEdition(name)}
              </option>
            ))}
          </select>
          <span className="gd-select-arrow">▾</span>
        </div>
      </div>
    )}

    {/* Région */}
    {regionsForSelection.length > 1 && (
      <div className="gd-selector-group">
        <label className="gd-selector-label">Région</label>
        <div className="gd-select-wrapper">
          <select
            className="gd-select"
            value={selectedRegion || ""}
            onChange={e => setSelectedRegion(e.target.value)}
          >
            {regionsForSelection.map(entry => (
              <option key={entry.region} value={entry.region}>
                {entry.region}
                {entry.stock === 0
                  ? " — Hors stock"
                  : ` ✓ ${parseFloat(entry.price).toFixed(2)} €`}
              </option>
            ))}
          </select>
          <span className="gd-select-arrow">▾</span>
        </div>
      </div>
    )}

  </div>
)}

              {/* Bouton achat — sous les sélecteurs sur mobile */}
              <div className="gd-buy-btn gd-buy-btn-left">
                {chosenInStock && chosenUrl ? (
                  <a href={chosenUrl} target="_blank" rel="noopener noreferrer"
                    className="nk-btn nk-btn-rounded nk-btn-color-main-1 gd-btn-instock">
                    🛒 Acheter
                  </a>
                ) : (
                  <button className="nk-btn nk-btn-rounded gd-btn-outofstock" disabled aria-disabled="true">
                    ⛔ Hors stock — {editionName}
                  </button>
                )}
              </div>
            </div>

            {/* ── Colonne droite ── */}
            <div className="col-12 col-md-6">

              {/* Badge plateforme + titre — order 1 sur mobile */}
              <div className="gd-right-title">
              <div className="subinfos">
                <span className="platform gd-platform-badge" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <span style={{ background: platformBg, borderRadius: "50%", width: 42, height: 42, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <PlatformLogo type={chosenEntry?.type || igGame?.type || "Steam"} size={32} />
                  </span>
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
              </div>{/* fin gd-right-title */}

              {/* Avis Steam + Metacritic — order 3 sur mobile */}
              <div className="gd-right-scores">
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
              </div>{/* fin gd-right-scores */}

              {/* Prix — order 2 sur mobile */}
              <div className="gd-right-price">
              <div className="info gd-price-block">
                {chosenRetail && chosenRetail > (chosenPrice || 0) && (
                  <div className="priceOrigin text-white">{chosenRetail.toFixed(2)} €</div>
                )}
                {chosenPromo && <div className="priceSlidePromo">{chosenPromo}</div>}
                {chosenPrice && chosenPrice > 0 && (
                  <div className="price text-white">{chosenPrice.toFixed(2)} €</div>
                )}
              </div>

              </div>{/* fin gd-right-price */}

              {/* Bouton achat — colonne droite, visible desktop seulement */}
              <div className="gd-buy-btn gd-buy-btn-right">
                {chosenInStock && chosenUrl ? (
                  <a href={chosenUrl} target="_blank" rel="noopener noreferrer"
                    className="nk-btn nk-btn-rounded nk-btn-color-main-1 gd-btn-instock">
                    🛒 Acheter
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
                {(() => {
                  const byPlatform = steamData?.release_date?.byPlatform;
                  // Détermine la clé plateforme depuis le type sélectionné
                  const platformKey = pt.includes("playstation") || pt.includes("ps") ? "PlayStation"
                    : pt.includes("xbox") || pt.includes("microsoft") ? "Xbox"
                    : pt.includes("nintendo") || pt.includes("switch") ? "Nintendo"
                    : "PC";
                  const date = byPlatform
                    ? (byPlatform[platformKey] || "Date inconnue")
                    : steamData?.release_date?.date;
                  return date ? (
                    <div><strong>Date de sortie</strong>: {date}</div>
                  ) : null;
                })()}
               {steamData?.developers && (
  <div><strong>Développeur</strong>: {
    Array.isArray(steamData.developers)
      ? steamData.developers[0]
      : steamData.developers
  }</div>
)}
{steamData?.publishers && (
  <div><strong>Éditeur</strong>: {
    Array.isArray(steamData.publishers)
      ? steamData.publishers[0]
      : steamData.publishers
  }</div>
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

        <Separator />

        <div className="nk-tabs">
          <style>{`
            .gd-tabs-nav {
              display: flex !important;
              flex-wrap: nowrap !important;
              gap: 6px;
              list-style: none;
              padding: 0;
              margin: 0 0 16px 0;
              border-bottom: none !important;
            }
            .gd-tab-item {
              flex: 1 1 0;
              min-width: 0;
            }
            .gd-tab-btn {
              display: flex !important;
              align-items: center;
              justify-content: center;
              width: 100%;
              padding: 10px 6px;
              font-size: clamp(10px, 2.5vw, 13px);
              font-weight: 700;
              font-family: inherit;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              text-align: center;
              white-space: nowrap;
              cursor: pointer;
              border: 2px solid #333 !important;
              border-radius: 4px;
              color: #aaa !important;
              background: transparent !important;
              transition: all 0.18s ease;
              line-height: 1.2;
              box-sizing: border-box;
            }
            .gd-tab-btn:hover {
              border-color: #dd163b !important;
              color: #fff !important;
            }
            .gd-tab-btn.gd-tab-active {
              background: #dd163b !important;
              border-color: #dd163b !important;
              color: #fff !important;
            }
          `}</style>
          <ul className="gd-tabs-nav" role="tablist">
            {[
              { key: "description", label: "Description" },
              { key: "config",      label: "Config requise" },
              { key: "comment",     label: `Commentaires (${comments.length})` },
            ].map(t => (
              <li className="gd-tab-item" key={t.key}>
                <span
                  className={`gd-tab-btn${activeTab === t.key ? " gd-tab-active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </span>
              </li>
            ))}
          </ul>
          <div className="tab-content">
            {activeTab === "description" && (
              <div className="tab-pane fade show active">
                <Separator label="Description" />
                {steamData?.detailed_description ? (
                  <div className="steam-desc-content" dangerouslySetInnerHTML={{ __html: steamData.detailed_description }} />
                ) : <p style={{ color: "#888" }}>Aucune description disponible.</p>}
              </div>
            )}
            {activeTab === "config" && (
              <div className="tab-pane fade show active">
                <Separator label="Configuration PC requise" />
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
                <Separator label="Commentaires" />
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
      {/* ── Articles du jeu ── */}
      {articles.length > 0 && (
        <div className="container gd-container">
          <Separator label="L'actualité du jeu" />
          <div className="gd-articles-list">
            {articles.map(a => {
              const img = a.photos?.[0]?.url || a.game_img || null;
              const excerpt = a.content
                ? a.content.replace(/<[^>]*>/g, "").slice(0, 180) + "…"
                : "";
              const date = a.created_at?.toDate
                ? a.created_at.toDate().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                : "";
              return (
                <Link key={a.doc_id} to={`/article/${a.doc_id}`} className="gd-article-card">
                  {img && (
                    <div className="gd-article-img">
                      <img src={img} alt={a.title} />
                    </div>
                  )}
                  <div className="gd-article-body">
                    {date && <div className="gd-article-meta">{date}</div>}
                    <div className="gd-article-title">{a.title}</div>
                    {excerpt && <div className="gd-article-excerpt">{excerpt}</div>}
                    {a.game_type && <span className="gd-article-tag">{a.game_type}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Franchise ── */}
      {franchise.length > 0 && (
        <div className="container gd-container">
          <Separator label="Autres jeux de la franchise" />
          <div className="gd-related-grid">
            {franchise.map(g => {
              const price    = parseFloat(g.price);
              const retail   = parseFloat(g.retail);
              const promo    = retail && price && retail > price
                ? `-${Math.round(((retail - price) / retail) * 100)}%` : null;
              const gSteamId = g.steam_id || 0;
              const gSlug    = g.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
              return (
                <Link key={g.id} to={`/store/${g.id}/${gSteamId}/${gSlug}`} className="gd-related-card" onClick={() => window.scrollTo(0, 0)}>
                  <div className="gd-related-img">
                    <img src={g.img} alt={g.name} />
                    {promo && <span className="gd-related-promo">{promo}</span>}
                    {g.stock === 0 && <span className="gd-related-outofstock">Rupture</span>}
                  </div>
                  <div className="gd-related-info">
                    <div className="gd-related-name">{g.name}</div>
                    <div className="gd-related-price">
                      {g.stock === 1 && price > 0 ? (
                        <>
                          {retail > price && <span className="gd-related-retail">{retail.toFixed(2)} €</span>}
                          <span className="gd-related-final">{price.toFixed(2)} €</span>
                        </>
                      ) : (
                        <span className="gd-related-na">Hors stock</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Jeux similaires ── */}
      {similar.length > 0 && (
        <div className="container gd-container">
          <Separator label="Jeux similaires" />
          <div className="gd-related-grid">
            {similar.map(g => {
              const price    = parseFloat(g.price);
              const retail   = parseFloat(g.retail);
              const promo    = retail && price && retail > price
                ? `-${Math.round(((retail - price) / retail) * 100)}%` : null;
              const gSteamId = g.steam_id || 0;
              const gSlug    = g.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
              return (
                <Link key={g.id} to={`/store/${g.id}/${gSteamId}/${gSlug}`} className="gd-related-card" onClick={() => window.scrollTo(0, 0)}>
                  <div className="gd-related-img">
                    <img src={g.img} alt={g.name} />
                    {promo && <span className="gd-related-promo">{promo}</span>}
                    {g.stock === 0 && <span className="gd-related-outofstock">Rupture</span>}
                  </div>
                  <div className="gd-related-info">
                    <div className="gd-related-name">{g.name}</div>
                    <div className="gd-related-price">
                      {g.stock === 1 && price > 0 ? (
                        <>
                          {retail > price && <span className="gd-related-retail">{retail.toFixed(2)} €</span>}
                          <span className="gd-related-final">{price.toFixed(2)} €</span>
                        </>
                      ) : (
                        <span className="gd-related-na">Hors stock</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="separator product-panel" />
      <Footer />

      {/* ── Bouton flottant admin ── */}
      {isAdmin && (
        <button
          onClick={() => setAdminOpen(v => !v)}
          style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 9000,
            width: 52, height: 52, borderRadius: "50%",
            background: adminOpen ? "#333" : "#dd163b",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            transition: "background 0.2s",
          }}
          title={adminOpen ? "Fermer le panneau admin" : "Modifier ce jeu"}
        >
          {adminOpen ? "✕" : "✏️"}
        </button>
      )}

      {/* ── Panneau admin slide-in ── */}
      {isAdmin && (
        <>
          {/* Overlay */}
          {adminOpen && (
            <div
              onClick={() => setAdminOpen(false)}
              style={{
                position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:8000,
              }}
            />
          )}
          <div style={{
            position: "fixed", top:0, right: adminOpen ? 0 : "-480px",
            width: "100%", maxWidth: 460, height: "100vh",
            background: "#0d0e13", borderLeft: "1px solid rgba(221,22,59,0.25)",
            zIndex: 8001, transition: "right 0.3s ease",
            overflowY: "auto", padding: "24px 24px 100px",
            boxSizing: "border-box",
          }}>
            {/* Header panneau */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:11, color:"#dd163b", letterSpacing:"0.15em", textTransform:"uppercase" }}>Console Admin</div>
                <div style={{ fontFamily:"Rajdhani,sans-serif", fontSize:18, fontWeight:700, color:"#fff", marginTop:2 }}>
                  Modifier la fiche
                </div>
              </div>
              <button onClick={() => setAdminOpen(false)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"50%", width:36, height:36, color:"#fff", cursor:"pointer", fontSize:16 }}>✕</button>
            </div>

            {/* Jeu sélectionné */}
            {igGame && (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, marginBottom:20 }}>
                <img src={igGame.img} alt={igGame.name} style={{ width:48, height:30, objectFit:"cover", borderRadius:4 }} />
                <div>
                  <div style={{ fontFamily:"Rajdhani,sans-serif", fontSize:14, fontWeight:700, color:"#fff" }}>{igGame.name}</div>
                  <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, color:"#555" }}>#{igId} · {igGame.type}</div>
                </div>
              </div>
            )}

            {/* Section helper */}
            {(() => {
              const S = ({ children }) => (
                <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#555", marginBottom:8, marginTop:20 }}>
                  {children}
                </div>
              );
              const Field = ({ label, children }) => (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#444", marginBottom:6 }}>{label}</div>
                  {children}
                </div>
              );
              const Input = (props) => (
                <input {...props} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"#ddd", fontSize:13, padding:"9px 12px", outline:"none", fontFamily:"Montserrat,sans-serif", boxSizing:"border-box", ...props.style }} />
              );
              const CheckLabel = ({ checked, onChange, color="#dd163b", children }) => (
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontFamily:"Rajdhani,sans-serif", fontSize:14, color: checked ? color : "#888" }}>
                  <input type="checkbox" checked={checked} onChange={onChange} style={{ width:16, height:16, accentColor:color, cursor:"pointer" }} />
                  {children}
                </label>
              );

              return (
                <>
                  <S>Description & Infos</S>
                  <Field label="Description courte">
                    <textarea value={adminDesc} onChange={e=>setAdminDesc(e.target.value)} rows={4}
                      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"#ddd", fontSize:13, padding:"9px 12px", outline:"none", fontFamily:"Rajdhani,sans-serif", resize:"vertical", boxSizing:"border-box" }} />
                  </Field>
                  <div style={{ display:"flex", gap:10 }}>
                    <Field label="Développeur"><Input value={adminDev} onChange={e=>setAdminDev(e.target.value)} placeholder="Ex: CD Projekt" /></Field>
                    <Field label="Éditeur"><Input value={adminPub} onChange={e=>setAdminPub(e.target.value)} placeholder="Ex: CD Projekt" /></Field>
                  </div>

                  <S>Date de sortie</S>
                  <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                    {["global","byplatform"].map(m => (
                      <label key={m} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontFamily:"Rajdhani,sans-serif", fontSize:12, color: adminDateMode===m?"#dd163b":"#666", background: adminDateMode===m?"rgba(221,22,59,0.08)":"rgba(255,255,255,0.02)", border:`1px solid ${adminDateMode===m?"#dd163b":"#333"}`, borderRadius:4, padding:"5px 10px" }}>
                        <input type="radio" checked={adminDateMode===m} onChange={()=>setAdminDateMode(m)} style={{ accentColor:"#dd163b" }} />
                        {m==="global" ? "Globale" : "Par plateforme"}
                      </label>
                    ))}
                  </div>
                  {adminDateMode==="global" && (
                    <Input value={adminDate} onChange={e=>setAdminDate(e.target.value)} placeholder="Ex: 26 mai 2026" />
                  )}
                  {adminDateMode==="byplatform" && (
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {["PC","PlayStation","Xbox","Nintendo"].map(p => (
                        <div key={p} style={{ flex:"1 1 120px" }}>
                          <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, color:"#444", marginBottom:4 }}>{p}</div>
                          <Input value={adminDateByPlatform[p]} onChange={e=>setAdminDateByPlatform(prev=>({...prev,[p]:e.target.value}))} placeholder="Date..." />
                        </div>
                      ))}
                    </div>
                  )}

                  <S>Vidéo YouTube</S>
                  <Input value={adminYoutube} onChange={e=>setAdminYoutube(e.target.value)} placeholder="https://youtube.com/watch?v=..." />

                  <S>Screenshots</S>
                  {adminScreenshots.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                      {adminScreenshots.map((s,i) => (
                        <div key={i} style={{ position:"relative" }}>
                          <img src={s.path_thumbnail||s.path_full} alt="" style={{ width:72, height:42, objectFit:"cover", borderRadius:4 }} />
                          <button type="button" onClick={()=>setAdminScreenshots(prev=>prev.filter((_,idx)=>idx!==i))}
                            style={{ position:"absolute", top:-6, right:-6, background:"#dd163b", border:"none", borderRadius:"50%", width:18, height:18, color:"#fff", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {adminNewPreviews.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                      {adminNewPreviews.map((src,i) => (
                        <div key={i} style={{ position:"relative" }}>
                          <img src={src} alt="" style={{ width:72, height:42, objectFit:"cover", borderRadius:4, opacity:0.7 }} />
                          <button type="button" onClick={()=>{setAdminNewFiles(p=>p.filter((_,idx)=>idx!==i));setAdminNewPreviews(p=>p.filter((_,idx)=>idx!==i));}}
                            style={{ position:"absolute", top:-6, right:-6, background:"#dd163b", border:"none", borderRadius:"50%", width:18, height:18, color:"#fff", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={()=>adminScreenRef.current?.click()}
                    style={{ width:"100%", padding:"10px", background:"rgba(255,255,255,0.04)", border:"1px dashed rgba(255,255,255,0.15)", borderRadius:6, color:"#666", fontFamily:"Montserrat,sans-serif", fontSize:11, cursor:"pointer", marginBottom:4 }}>
                    🖼 Ajouter des screenshots
                  </button>
                  <input ref={adminScreenRef} type="file" accept="image/*" multiple style={{ display:"none" }}
                    onChange={e=>{
                      const files=Array.from(e.target.files);
                      setAdminNewFiles(p=>[...p,...files]);
                      setAdminNewPreviews(p=>[...p,...files.map(f=>URL.createObjectURL(f))]);
                    }} />

                  <S>Mise en avant</S>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <CheckLabel checked={adminFeatured} onChange={e=>{setAdminFeatured(e.target.checked);if(!e.target.checked)setAdminFeaturedPlatforms([]);}} >
                      Afficher dans "Sorties les plus attendues"
                    </CheckLabel>
                    {adminFeatured && (
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", paddingLeft:24 }}>
                        {["PlayStation","Nintendo","Xbox","PC","Tous"].map(p=>(
                          <label key={p} style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer", fontFamily:"Rajdhani,sans-serif", fontSize:13, color:adminFeaturedPlatforms.includes(p)?"#dd163b":"#888", background:adminFeaturedPlatforms.includes(p)?"rgba(221,22,59,0.08)":"rgba(255,255,255,0.02)", border:`1px solid ${adminFeaturedPlatforms.includes(p)?"#dd163b":"#333"}`, borderRadius:4, padding:"4px 10px" }}>
                            <input type="checkbox" checked={adminFeaturedPlatforms.includes(p)} onChange={e=>{ if(e.target.checked) setAdminFeaturedPlatforms(prev=>[...prev,p]); else setAdminFeaturedPlatforms(prev=>prev.filter(x=>x!==p)); }} style={{ accentColor:"#dd163b" }} />
                            {p}
                          </label>
                        ))}
                      </div>
                    )}
                    <CheckLabel checked={adminTrending} onChange={e=>setAdminTrending(e.target.checked)} color="#f39c12">
                      Afficher dans les Tendances 🔥
                    </CheckLabel>
                    <CheckLabel checked={adminReleased} onChange={e=>{setAdminReleased(e.target.checked);if(e.target.checked)setAdminFeatured(false);if(!e.target.checked)setAdminReleasedPlatforms([]);}} color="#27ae60">
                      Marquer comme sorti ✅
                    </CheckLabel>
                    {adminReleased && (
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", paddingLeft:24 }}>
                        {["PlayStation","Nintendo","Xbox","PC"].map(p=>(
                          <label key={p} style={{ display:"flex", alignItems:"center", gap:5, cursor:"pointer", fontFamily:"Rajdhani,sans-serif", fontSize:13, color:adminReleasedPlatforms.includes(p)?"#27ae60":"#888", background:adminReleasedPlatforms.includes(p)?"rgba(39,174,96,0.08)":"rgba(255,255,255,0.02)", border:`1px solid ${adminReleasedPlatforms.includes(p)?"#27ae60":"#333"}`, borderRadius:4, padding:"4px 10px" }}>
                            <input type="checkbox" checked={adminReleasedPlatforms.includes(p)} onChange={e=>{ if(e.target.checked) setAdminReleasedPlatforms(prev=>[...prev,p]); else setAdminReleasedPlatforms(prev=>prev.filter(x=>x!==p)); }} style={{ accentColor:"#27ae60" }} />
                            {p}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {adminMsg && (
                    <div style={{ marginTop:16, padding:"10px 14px", background: adminMsgType==="success" ? "rgba(39,174,96,0.1)" : "rgba(221,22,59,0.1)", border:`1px solid ${adminMsgType==="success"?"rgba(39,174,96,0.3)":"rgba(221,22,59,0.3)"}`, borderRadius:6, fontFamily:"Rajdhani,sans-serif", fontSize:14, color: adminMsgType==="success"?"#27ae60":"#dd163b" }}>
                      {adminMsg}
                    </div>
                  )}

                  <div style={{ position:"sticky", bottom:0, background:"#0d0e13", padding:"16px 0 0", marginTop:20, borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", gap:8 }}>
                    <button onClick={handleAdminSave} disabled={adminSaving}
                      style={{ width:"100%", padding:13, background:"#dd163b", border:"none", borderRadius:6, color:"#fff", fontFamily:"Montserrat,sans-serif", fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", cursor: adminSaving?"default":"pointer", opacity: adminSaving?0.6:1 }}>
                      {adminSaving ? "Sauvegarde..." : `💾 Sauvegarder (${allEditions.length > 0 ? allEditions.length : 1} édition(s))`}
                    </button>
                    <button onClick={handleAdminClearCache} disabled={adminSaving}
                      style={{ width:"100%", padding:10, background:"none", border:"1px solid #333", borderRadius:6, color:"#555", fontFamily:"Montserrat,sans-serif", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer" }}>
                      🔄 Vider le cache (toutes éditions)
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}

export default GameDetail;