import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { auth, db } from "../../Firebase";
import {
  collection, query, where, onSnapshot,
  serverTimestamp, setDoc, doc, getDoc, getDocs, deleteDoc
} from "firebase/firestore";
import { useAdmin } from "../../useAdmin";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Header from "../Header/Header";
import CommentsSection from "./CommentsSection";
import Footer from "../Footer/Footer";
import { findGameGuidesDoc } from "../Guides/guidesHelpers";

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
const WHITE_FILTER = "brightness(0) invert(1)";

function PlatformLogo({ type, size = 16 }) {
  const t = (type || "").toLowerCase();
  const base = { width: size, height: size, display: "inline-block", verticalAlign: "middle", flexShrink: 0, objectFit: "contain" };
  if (t.includes("rockstar")) return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      <path d="M8 8 h36 c17 0 27 10 27 23 c0 10-6 18-16 21 l18 28 h-19 l-17-26 h-13 v26 h-16 z M24 22 v16 h18 c5 0 9-3.5 9-8 s-4-8-9-8 z" fill="#1a1a1a"/>
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
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#ffffff" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
  );
}

function Separator({ label, style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "52px 0 28px", ...style }}>
      <div style={{ width: 5, height: 28, background: "#dd163b", borderRadius: 3, flexShrink: 0 }} />
      <div style={{ width: 32, height: 3, background: "#dd163b", borderRadius: 2, flexShrink: 0 }} />
      {label && (
        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "clamp(14px, 4vw, 25px)", color: "#ccc", letterSpacing: "clamp(1px, 0.8vw, 4px)", textTransform: "uppercase", whiteSpace: "normal", fontWeight: 800 }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(221,22,59,0.3), transparent)" }} />
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
  return <video ref={videoRef} controls muted playsInline preload="none" poster={poster || undefined} className={className} />;
}

function platformShortName(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("steam"))       return "PC - Steam";
  if (t.includes("ubisoft"))     return "PC - Ubisoft Connect";
  if (t.includes("rockstar"))    return "PC - Rockstar";
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

function GameDetail() {
  const { igId, steamId, title } = useParams();
  const user    = useSelector(selectUser);
  const userN   = auth.currentUser;
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

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
  const [adminRefreshing, setAdminRefreshing] = useState(false);
  const [adminForcingSteam, setAdminForcingSteam] = useState(false);
  const [adminDeleting,   setAdminDeleting]   = useState(false);
  const [adminDeleteConfirm, setAdminDeleteConfirm] = useState(false);
  const [tagsExpanded,   setTagsExpanded]   = useState(false);
  const adminScreenRef = useRef();
  const CLOUDINARY_CLOUD  = "dl0eijxyn";
  const CLOUDINARY_PRESET = "ml_default";

  const [inWishlist,     setInWishlist]     = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid || !igId) return;
    const ref = doc(db, "users", user.uid, "wishlist", `ig_${igId}`);
    getDoc(ref).then(snap => setInWishlist(snap.exists())).catch(() => {});
  }, [user?.uid, igId]);

  useEffect(() => {
    if (!igId) return;
    setGuidesPreview(undefined); // loading
    findGameGuidesDoc(igId)
      .then(found => setGuidesPreview(found && found.guidesCount > 0 ? found : null))
      .catch(() => setGuidesPreview(null));
  }, [igId]);

  const toggleWishlist = async () => {
    if (!user?.uid) { navigate("/Login"); return; }
    setWishlistLoading(true);
    try {
      const ref = doc(db, "users", user.uid, "wishlist", `ig_${igId}`);
      if (inWishlist) {
        await deleteDoc(ref); setInWishlist(false);
      } else {
        await setDoc(ref, { igId, name: gameTitle || "", img: igGame?.img || steamData?.header_image || "", price: chosenEntry?.price || igGame?.price || "", addedAt: serverTimestamp() });
        setInWishlist(true);
      }
    } catch (e) { console.warn("Wishlist error:", e.message); }
    finally { setWishlistLoading(false); }
  };

  const [steamData,    setSteamData]    = useState(null);
  const [igGame,       setIgGame]       = useState(null);
  const [allEditions,  setAllEditions]  = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingSteam, setLoadingSteam] = useState(false);
  const [activeTab,    setActiveTab]    = useState("description");
  const [activeMedia,  setActiveMedia]  = useState("video");
  const [comments,     setComments]     = useState([]);
  const [franchise,    setFranchise]    = useState([]);
  const [similar,      setSimilar]      = useState([]);
  const [articles,     setArticles]     = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedEdition,  setSelectedEdition]  = useState(null);
  const [heroImgError, setHeroImgError] = useState(false);
  const [guidesPreview, setGuidesPreview] = useState(null); // { gameName, gameImg, guidesCount } | null | undefined(loading)

  // ── Clé partagée commentaires/notes — ig_ du jeu courant (stable dès le début) ──
  const sharedGameKey = `ig_${igId}`;

  useEffect(() => { setHeroImgError(false); }, [igId]);

  const propagateSteamDataToEditions = async (steamDataObj, editions) => {
    if (!steamDataObj || !editions?.length) return;
    try {
      await Promise.all(
        editions
          .filter(ed => String(ed.id) !== String(igId))
          .map(ed => setDoc(doc(db, "games", `ig_${ed.id}`), { steamData: steamDataObj, savedAt: serverTimestamp() }, { merge: true }))
      );
    } catch (e) { console.warn("Propagation steamData editions:", e.message); }
  };

  useEffect(() => {
    if (!igId) { setLoadingSteam(false); return; }
    (async () => {
      try {
        const fbRef  = doc(db, "games", `ig_${igId}`);
        const fbSnap = await getDoc(fbRef);
        if (fbSnap.exists()) {
          const cached = fbSnap.data();
          const savedAt = cached.savedAt?.toMillis?.() || 0;
          const AGE_LIMIT = 7 * 24 * 60 * 60 * 1000;
          const isFresh = (Date.now() - savedAt) < AGE_LIMIT;
          const isConsoleCached = cached.steamData?.source === 'rawg';
          if (cached.steamData && !isConsoleCached) {
            setSteamData(cached.steamData);
            const [frRes, siRes] = await Promise.all([
              fetch(`${BACKEND_URL}/api/franchise/${igId}`).then(r => r.json()).catch(() => []),
              fetch(`${BACKEND_URL}/api/similar/${igId}`).then(r => r.json()).catch(() => []),
            ]);
            setFranchise(Array.isArray(frRes) ? frRes : []);
            setSimilar(Array.isArray(siRes) ? siRes : []);
            setLoadingSteam(false);
            if (!isFresh) {
              (async () => {
                try {
                  const steamAppId = cached.steamData?.steam_appid;
                  if (!steamAppId) return;
                  const fresh = await fetch(`${BACKEND_URL}/api/steam/${steamAppId}`).then(r => r.ok ? r.json() : null).catch(() => null);
                  if (fresh) {
                    setSteamData(fresh);
                    await setDoc(fbRef, { igId, savedAt: serverTimestamp(), steamData: fresh }, { merge: true });
                    const edSnap = await getDoc(fbRef);
                    if (edSnap.exists() && edSnap.data().editions?.length) {
                      await propagateSteamDataToEditions(fresh, edSnap.data().editions);
                    }
                  }
                } catch {}
              })();
            }
            return;
          }
        }
        const igGameData = await fetch(`${BACKEND_URL}/api/game/${igId}`).then(r => r.ok ? r.json() : null).catch(() => null);
        const gameType = (igGameData?.type || "").toLowerCase();
        let resolvedSteamId = steamId && steamId !== "0" ? steamId : null;
        const isConsole = gameType.includes("playstation") || gameType.includes("ps5") || gameType.includes("ps4") || gameType.includes("nintendo") || gameType.includes("switch") || gameType.includes("microsoft") || gameType.includes("xbox") || gameType.includes("ubisoft");
        if (!resolvedSteamId && !isConsole) {
          const isPC = gameType.includes("steam") || gameType.includes("epic") || gameType.includes("gog") || gameType.includes("battle") || gameType.includes("rockstar") || gameType.includes("ea app") || gameType.includes("other");
          if (isPC) {
            const editions = await fetch(`${BACKEND_URL}/api/editions/${igId}`).then(r => r.ok ? r.json() : []).catch(() => []);
            const found = editions.find(e => String(e.id) === String(igId));
            if (found?.steam_id) resolvedSteamId = found.steam_id;
          }
        }
        let steamIdFromSearch = null;
        if (!resolvedSteamId && isConsole && igGameData?.name) {
          const cleanName = (igGameData.name).replace(/[\u2018\u2019]/g, "'").replace(/:/g, "").replace(/\+.*$/, "").replace(/deluxe|ultimate|gold|premium|standard/gi, "").trim();
          const steamSearch = await fetch(`${BACKEND_URL}/api/steam-search?term=${encodeURIComponent(cleanName)}`).then(r => r.ok ? r.json() : null).catch(() => null);
          const items = steamSearch?.items || [];
          const nameLower = cleanName.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
          const match = items.find(i => i.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim() === nameLower)
            || items.find(i => { const iName = i.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim(); const iWords = iName.split(' ').slice(0, 4).join(' '); const gWords = nameLower.split(' ').slice(0, 4).join(' '); return gWords.length > 6 && iWords === gWords; });
          if (match?.id) steamIdFromSearch = match.id;
        }
        const finalSteamId = resolvedSteamId || steamIdFromSearch;
        const [gameDataRes, frRes, siRes] = await Promise.all([
          finalSteamId ? fetch(`${BACKEND_URL}/api/steam/${finalSteamId}`).then(r => r.ok ? r.json() : null).catch(() => null) : Promise.resolve(null),
          fetch(`${BACKEND_URL}/api/franchise/${igId}`).then(r => r.json()).catch(() => []),
          fetch(`${BACKEND_URL}/api/similar/${igId}`).then(r => r.json()).catch(() => []),
        ]);
        if (gameDataRes) {
          setSteamData(gameDataRes);
          try {
            await setDoc(fbRef, { igId, savedAt: serverTimestamp(), steamData: gameDataRes }, { merge: true });
            const edSnap = await getDoc(fbRef);
            if (edSnap.exists() && edSnap.data().editions?.length) {
              await propagateSteamDataToEditions(gameDataRes, edSnap.data().editions);
            }
          } catch (writeErr) { console.warn("Firebase write error:", writeErr.message); }
        } else if (igGameData) {
          setSteamData({ name: igGameData.name, short_description: "", detailed_description: "", header_image: igGameData.img || "", genres: [], developers: "", publishers: "", release_date: { date: "" }, screenshots: [], movies: [], source: "ig" });
        }
        setFranchise(Array.isArray(frRes) ? frRes : []);
        setSimilar(Array.isArray(siRes) ? siRes : []);
      } catch (e) { console.error("Steam/Firebase error", e); }
      finally { setLoadingSteam(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igId]);

  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/game/${igId}`);
        if (res.ok) { setIgGame(await res.json() || null); return; }
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

  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        const rawTitle = steamData?.name || igGame?.name || decodeURIComponent(title || "");
        const baseTitle = rawTitle.replace(/[-–:].*/,'').replace(/deluxe|ultimate|gold|premium|standard|edition/gi,'').trim().toLowerCase().split(' ').slice(0, 3).join(' ');
        const allSnap = await getDocs(collection(db, "articles"));
        const arts = allSnap.docs.map(d => ({ doc_id: d.id, ...d.data() }))
          .filter(a => {
            if (a.status !== "public") return false;
            const artName = (a.game_name || "").replace(/[-–:].*/,'').replace(/deluxe|ultimate|gold|premium|standard|edition/gi,'').trim().toLowerCase().split(' ').slice(0, 3).join(' ');
            return artName.includes(baseTitle) || baseTitle.includes(artName);
          })
          .sort((a, b) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0)).slice(0, 5);
        setArticles(arts);
      } catch (e) { console.warn("Articles fetch error", e); setArticles([]); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igId, igGame?.name, steamData?.name]);

  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        const fbRef = doc(db, "games", `ig_${igId}`);
        const fbSnap = await getDoc(fbRef);
        if (fbSnap.exists() && fbSnap.data().editions?.length) {
          setAllEditions(fbSnap.data().editions.filter(ed => !(ed.region || "").toLowerCase().includes("latin")));
          return;
        }
        const res = await fetch(`${BACKEND_URL}/api/editions/${igId}`);
        const data = await res.json();

        // ── Fetch aussi depuis le selfGame pour croiser les résultats ──
        const selfRes = await fetch(`${BACKEND_URL}/api/game/${igId}`);
        const selfGame = selfRes.ok ? await selfRes.json() : null;

        // Si selfGame a un igId différent (ex: édition standard), fetch ses éditions aussi
        let extraData = [];
        if (selfGame?.id && String(selfGame.id) !== String(igId)) {
          extraData = await fetch(`${BACKEND_URL}/api/editions/${selfGame.id}`)
            .then(r => r.ok ? r.json() : []).catch(() => []);
        }

        // Merge et déduplique par id
        const allData = [...(Array.isArray(data) ? data : []), ...(Array.isArray(extraData) ? extraData : [])];
        const seen = new Set();
        const mergedData = allData.filter(ed => {
          if (seen.has(ed.id)) return false;
          seen.add(ed.id); return true;
        });

        // Nom de base du jeu courant (retire edition/deluxe/region etc.)
        const baseName = (selfGame?.name || "")
          .toLowerCase()
          .replace(/[\u2018\u2019:+]/g, "")
          .replace(/\s*(deluxe|ultimate|gold|premium|standard|complete|collector|digital|accès|avant.première|early access)\s*(edition)?/gi, "")
          .replace(/\s*-\s*(europe|us|worldwide|fr|global).*/gi, "")
          .replace(/[^a-z0-9 ]/g, " ")
          .trim()
          .split(" ").filter(Boolean).slice(0, 3).join(" ");

        let filtered = mergedData.filter(ed => {
          const n = (ed.name || "").toLowerCase();
          // Filtre les contenus additionnels
          if (n.includes("upgrade") || n.includes("dlc") || n.includes("season pass") || n.includes("credits") || n.includes("traque") || n.includes("pack") || n.includes("klauen") || n.includes("awaji")) return false;
          if ((ed.region || "").toLowerCase().includes("latin")) return false;
          // ── Filtre les jeux d'une autre franchise ──
          if (baseName.length >= 4) {
            const edNameClean = n
              .replace(/[\u2018\u2019:+]/g, "")
              .replace(/[^a-z0-9 ]/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            // L'édition doit contenir AU MOINS les 3 premiers mots du nom de base
            const baseWords = baseName.split(" ").slice(0, 3).join(" ");
            if (!edNameClean.includes(baseWords)) return false;
          }
          return true;
        });
        const currentInList = filtered.find(e => String(e.id) === String(igId));
        if (!currentInList && selfGame?.id) filtered = [selfGame, ...filtered];
        setAllEditions(filtered);
        const currentEd = filtered.find(e => String(e.id) === String(igId));
        if (currentEd) {
          const currentRegion = (currentEd.region || "").toLowerCase();
          // Une région n'est "US/Worldwide à rediriger" que si elle ne
          // contient PAS déjà l'Europe — "Europe & US & Canada" ne doit
          // jamais déclencher cette redirection puisque l'Europe y est déjà.
          const includesEurope = currentRegion.includes("europe") || currentRegion.includes("fr");
          const isUSOrWorldwide = !includesEurope && (currentRegion.includes("us") || currentRegion === "worldwide");
          if (isUSOrWorldwide) {
            const europeEd = filtered.find(e => { const r = (e.region || "").toLowerCase(); return (r.includes("europe") || r.includes("fr")) && e.type === currentEd.type && parseFloat(e.price) > 0 && e.stock === 1; });
            if (europeEd) { const slug = europeEd.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, ""); const isEuSteam = (europeEd.type || "").toLowerCase().includes("steam"); navigate(`/store/${europeEd.id}/${isEuSteam ? (europeEd.steam_id || 0) : 0}/${slug}`, { replace: true }); return; }
          }
        }
        try {
          await Promise.all(filtered.map(ed => setDoc(doc(db, "games", `ig_${ed.id}`), { editions: filtered }, { merge: true })));
          const currentSteamSnap = await getDoc(fbRef);
          if (currentSteamSnap.exists() && currentSteamSnap.data().steamData) {
            await propagateSteamDataToEditions(currentSteamSnap.data().steamData, filtered);
          }
        } catch (e) { console.warn("Firebase editions write:", e); }
      } catch (e) { console.error("Editions fetch error", e); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igId]);

  useEffect(() => {
    if (!allEditions.length) return;
    const current = allEditions.find(e => String(e.id) === String(igId));
    if (current) {
      // Cas normal : l'igId de l'URL correspond à une entrée connue dans
      // allEditions (chargement initial, ou allEditions vient d'être
      // re-fetché pour ce nouvel igId après une navigation). On synchronise.
      setSelectedPlatform(current.type);
      setSelectedEdition(current.name);
    } else if (!selectedEdition) {
      // Cas "premier rendu" uniquement : aucune édition n'a encore été
      // sélectionnée, donc pas de risque d'écraser un choix utilisateur.
      // On choisit une édition par défaut (la première en stock).
      const first = allEditions.find(e => e.stock === 1) || allEditions[0];
      setSelectedPlatform(first?.type || null);
      setSelectedEdition(first?.name || null);
    }
    // Si current est introuvable MAIS qu'une édition est déjà sélectionnée,
    // c'est probablement allEditions qui n'a pas encore été re-fetché pour
    // le nouvel igId (juste après une navigation manuelle depuis le
    // dropdown) — on ne touche à rien plutôt que de deviner un fallback
    // potentiellement faux, en attendant le prochain re-render avec les
    // données à jour.
  }, [allEditions, igId, selectedEdition]);

  const platformGroups = allEditions.reduce((acc, ed) => { if (!acc[ed.type]) acc[ed.type] = []; acc[ed.type].push(ed); return acc; }, {});
  const gameBase = (igGame?.name || "").replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'").replace(/\s*(deluxe|ultimate|gold|premium|standard)\s*edition.*/gi, "").replace(/\s*edition.*/gi, "").replace(/[-–].*$/, "").trim();
  const shortEdName = (name) => {
    let short = name.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    const baseNorm = gameBase.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    short = short.replace(baseNorm, "").replace(/^\s*[-–]?\s*/, "").trim();
    if (!short || short.toLowerCase() === "edition") return "Standard Edition";
    if (!short.toLowerCase().includes("edition")) short = short + " Edition";
    return short;
  };

  const editionNamesForPlatform = selectedPlatform ? [...new Set(platformGroups[selectedPlatform]?.map(e => e.name) || [])] : [];
  const regionsForSelection = selectedPlatform && selectedEdition ? (platformGroups[selectedPlatform] || []).filter(e => e.name === selectedEdition) : [];
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    if (!regionsForSelection.length) return;
    const europeInStock = regionsForSelection.find(e => (e.region || "").toLowerCase().includes("europe") && e.stock === 1);
    const anyInStock = regionsForSelection.find(e => e.stock === 1);
    const best = europeInStock || anyInStock || regionsForSelection[0];
    setSelectedRegion(best?.region || null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, selectedEdition, allEditions.length]);

  const chosenEntry  = regionsForSelection.find(e => e.region === selectedRegion) || regionsForSelection[0] || null;
  const chosenPrice  = chosenEntry ? parseFloat(chosenEntry.price)  : null;
  const chosenRetail = chosenEntry ? parseFloat(chosenEntry.retail) : null;
  const chosenPromo  = chosenRetail && chosenPrice && chosenRetail > chosenPrice ? `-${Math.round(((chosenRetail - chosenPrice) / chosenRetail) * 100)}%` : null;
  const chosenInStock = chosenEntry ? chosenEntry.stock === 1 && chosenPrice > 0 : false;
  const chosenUrl    = chosenEntry?.url || null;
  const editionName  = chosenEntry ? shortEdName(chosenEntry.name) : "Standard Edition";

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
      setAdminDateByPlatform({ PC: sd?.release_date?.byPlatform?.PC || "", PlayStation: sd?.release_date?.byPlatform?.PlayStation || "", Xbox: sd?.release_date?.byPlatform?.Xbox || "", Nintendo: sd?.release_date?.byPlatform?.Nintendo || "" });
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

  // ── Vider le cache éditions Firebase (force rechargement depuis l'API) ──
  const handleClearEditionsCache = async () => {
    setAdminMsg(""); setAdminMsgType("success");
    try {
      const allIds = [...new Set([igId, ...allEditions.map(ed => String(ed.id))])];
      await Promise.all(allIds.map(id =>
        setDoc(doc(db, "games", `ig_${id}`), { editions: null }, { merge: true }).catch(() => {})
      ));
      setAllEditions([]);
      setAdminMsg(`✅ Cache éditions vidé pour ${allIds.length} document(s) — rechargement en cours...`);
      // Recharge les éditions depuis l'API
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) { setAdminMsg("Erreur : " + e.message); setAdminMsgType("error"); }
  };

  const handleForceRefreshSteamData = async () => {
    setAdminForcingSteam(true); setAdminMsg("");
    try {
      // Vide le steamData en cache pour CE jeu précis (souvent une édition
      // spéciale dont la résolution Steam avait échoué une première fois),
      // pour que le useEffect de résolution reparte de zéro au rechargement.
      await setDoc(doc(db, "games", `ig_${igId}`), { steamData: null, savedAt: null }, { merge: true });
      setAdminMsg("✅ Données Steam vidées — nouvelle récupération en cours...");
      setAdminMsgType("success");
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) { setAdminMsg("Erreur : " + e.message); setAdminMsgType("error"); }
    finally { setAdminForcingSteam(false); }
  };

  const handleDeleteFromFirebase = async () => {
    setAdminDeleting(true); setAdminMsg("");
    try {
      const allIds = [...new Set([igId, ...allEditions.map(ed => String(ed.id))])];
      await Promise.all(allIds.map(id => deleteDoc(doc(db, "games", `ig_${id}`)).catch(() => {})));
      setAdminMsg(`✅ ${allIds.length} document(s) supprimé(s) de Firebase`);
      setAdminMsgType("success");
      setAdminDeleteConfirm(false);
      // Reset local
      setSteamData(null);
      setAllEditions([]);
    } catch (e) { setAdminMsg("Erreur suppression : " + e.message); setAdminMsgType("error"); }
    finally { setAdminDeleting(false); }
  };

  const handleRefreshEditions = async () => {
    setAdminRefreshing(true); setAdminMsg("");
    try {
      const fbRef = doc(db, "games", `ig_${igId}`);
      const fbSnap = await getDoc(fbRef);
      const currentSteamData = fbSnap.exists() ? fbSnap.data().steamData : null;
      if (!currentSteamData) { setAdminMsg("❌ Aucune donnée Steam trouvée pour ce jeu"); setAdminMsgType("error"); return; }
      const editions = allEditions.length ? allEditions : (fbSnap.exists() ? fbSnap.data().editions || [] : []);
      const otherEditions = editions.filter(ed => String(ed.id) !== String(igId));
      if (!otherEditions.length) { setAdminMsg("ℹ️ Aucune autre édition à mettre à jour"); setAdminMsgType("success"); return; }
      await Promise.all(otherEditions.map(ed => setDoc(doc(db, "games", `ig_${ed.id}`), { steamData: currentSteamData, savedAt: serverTimestamp() }, { merge: true })));
      setAdminMsg(`✅ steamData propagé vers ${otherEditions.length} édition(s)`);
      setAdminMsgType("success");
    } catch (e) { setAdminMsg("Erreur : " + e.message); setAdminMsgType("error"); }
    finally { setAdminRefreshing(false); }
  };

  const handleAdminSave = async () => {
    setAdminSaving(true); setAdminMsg("");
    try {
      const uploaded = [];
      for (let i = 0; i < adminNewFiles.length; i++) {
        const fd = new FormData();
        fd.append("file", adminNewFiles[i]); fd.append("upload_preset", CLOUDINARY_PRESET); fd.append("folder", "nextgen/screenshots");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method:"POST", body:fd });
        const data = await res.json();
        uploaded.push({ id: Date.now()+i, path_full: data.secure_url, path_thumbnail: data.secure_url });
      }
      const allScreenshots = [...adminScreenshots, ...uploaded];
      const ytMatch = adminYoutube.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const ytId = ytMatch ? ytMatch[1] : null;
      const fbRef  = doc(db, "games", `ig_${igId}`);
      const fbSnap = await getDoc(fbRef);
      const existing = fbSnap.exists() ? fbSnap.data() : {};
      const newSteamData = { ...(existing.steamData || {}), short_description: adminDesc, developers: [adminDev], publishers: [adminPub], release_date: { ...(existing.steamData?.release_date || {}), date: adminDateMode === "global" ? adminDate : "", byPlatform: adminDateMode === "byplatform" ? adminDateByPlatform : null }, screenshots: allScreenshots, ...(ytId ? { youtube_id: ytId } : {}) };
      await setDoc(fbRef, {
        steamData: newSteamData,
        featured: adminReleased ? false : adminFeatured,
        featuredPlatforms: adminReleased ? adminReleasedPlatforms : (adminFeatured ? adminFeaturedPlatforms : []),
        featuredGame: (adminFeatured || adminReleased) ? { id: igId, name: igGame?.name || gameTitle, img: igGame?.img || "", type: igGame?.type || "" } : null,
        releasedAt: adminReleased ? (adminDate || adminDateByPlatform?.PlayStation || adminDateByPlatform?.Xbox || adminDateByPlatform?.Nintendo || "sorti") : null,
        trending: adminTrending,
        trendingGame: adminTrending ? { id: igId, name: igGame?.name || gameTitle, img: igGame?.img || "", type: igGame?.type || "" } : null,
        savedAt: serverTimestamp(),
      }, { merge: true });
      await propagateSteamDataToEditions(newSteamData, allEditions);
      setAdminScreenshots(allScreenshots); setAdminNewFiles([]); setAdminNewPreviews([]);
      setAdminMsg("✅ Fiche mise à jour et propagée !"); setAdminMsgType("success");
      setSteamData(prev => ({ ...prev, short_description: adminDesc, developers: [adminDev], publishers: [adminPub], screenshots: allScreenshots, ...(ytId ? { youtube_id: ytId } : {}) }));
    } catch (e) { setAdminMsg("Erreur : " + e.message); setAdminMsgType("error"); }
    finally { setAdminSaving(false); }
  };

  useEffect(() => {
    if (!steamData) return;
    const m = steamData?.movies?.[0];
    const hasVideo = m?.webm?.max || m?.webm?.["480"] || m?.mp4?.max || m?.mp4?.["480"] || m?.hls_h264 || steamData?.youtube_id;
    if (!hasVideo) setActiveMedia(0);
  }, [steamData]);

  useEffect(() => {
    if (!igId) return;
    // Récupère les commentaires de TOUTES les éditions du jeu
    const allKeys = allEditions.length > 0
      ? [...new Set(allEditions.map(ed => `ig_${ed.id}`))]
      : [`ig_${igId}`];
    // Firestore limite "in" à 30 valeurs max
    const keys = allKeys.slice(0, 30);
    const q = query(collection(db, "comments"), where("gameId", "in", keys));
    const unsub = onSnapshot(q,
      snap => { const arr = []; snap.forEach(d => arr.push({ ...d.data(), id: d.id })); setComments(arr); },
      err  => { console.warn("Firestore read denied:", err.message); setComments([]); }
    );
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igId, allEditions.length]);

  useEffect(() => {
    if (!igId || !user || comments.length === 0) return;
    (async () => {
      try {
        const gameKey = sharedGameKey;
        const avg = comments.reduce((a, c) => a + parseInt(c.rating || 0), 0) / comments.length;
        await setDoc(doc(db, "games", gameKey), { gameId: gameKey, averageRating: avg }, { merge: true });
      } catch (err) { console.warn("Firestore write denied:", err.message); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments, igId, user]);

  const averageRating = comments.length ? comments.reduce((a, c) => a + parseInt(c.rating || 0), 0) / comments.length : 0;
  const screenshots    = steamData?.screenshots || [];
  const movies         = steamData?.movies      || [];
  const youtubeId      = steamData?.youtube_id  || null;
  const getVideoSrc = (movie) => {
    if (!movie) return null;
    if (movie?.webm?.max)     return { url: movie.webm.max,    type: "mp4" };
    if (movie?.webm?.["480"]) return { url: movie.webm["480"], type: "mp4" };
    if (movie?.mp4?.max)      return { url: movie.mp4.max,     type: "mp4" };
    if (movie?.mp4?.["480"])  return { url: movie.mp4["480"],  type: "mp4" };
    if (movie?.hls_h264)      return { url: movie.hls_h264,    type: "hls" };
    return null;
  };
  const videoSrc         = getVideoSrc(movies[0]);
  const videoThumb       = movies[0]?.thumbnail || null;
  const pcReqs           = steamData?.pc_requirements;
  const steamReviewTotal = steamData?.recommendations?.total || 0;
  const steamReview      = getSteamReviewLabel(steamReviewTotal);
  const metacritic       = steamData?.metacritic || null;
  const steamCategories  = steamData?.categories || [];

  if (!igGame && !steamData) return (
    <><Header /><Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box></>
  );

  const gameTitle = chosenEntry?.name || steamData?.name || igGame?.name || decodeURIComponent(title || "");
  const pt = (chosenEntry?.type || igGame?.type || "Steam").toLowerCase();
  // eslint-disable-next-line no-unused-vars
  const platformLabel = pt.includes("rockstar") ? "Rockstar" : pt.includes("ubisoft") ? "Ubisoft Connect" : pt.includes("microsoft") ? "Microsoft Store" : pt.includes("xbox") ? "Xbox" : pt.includes("playstation") ? "PlayStation Store" : pt.includes("epic") ? "Epic Games" : pt.includes("gog") ? "GOG" : pt.includes("nintendo") ? "Nintendo eShop" : "Steam";
  const platformBg = pt.includes("rockstar") ? "#F7941D" : pt.includes("ubisoft") ? "#0070cc" : pt.includes("microsoft") || pt.includes("xbox") ? "#107c10" : pt.includes("playstation") ? "#003087" : pt.includes("epic") ? "#2a2a2a" : pt.includes("gog") ? "#6c4db9" : pt.includes("nintendo") ? "#e4000f" : "#14487b";

  function formatEdition(name) { return name.replace(/^[^:]+:\s*/, '').trim(); }
  const heroId = chosenEntry?.steam_id || steamData?.steam_appid || steamId;

  const SelectorsBlock = () => (
    allEditions.length > 0 ? (
      <div className="gd-selectors" style={{ marginTop: 0 }}>
        <div className="gd-selector-group">
          <label className="gd-selector-label">Plateforme</label>
          <div className="gd-select-wrapper">
            <select className="gd-select" value={selectedPlatform || ""} onChange={e => {
              const type = e.target.value; setSelectedPlatform(type);
              const first = platformGroups[type]?.find(ed => ed.stock === 1) || platformGroups[type]?.[0];
              setSelectedEdition(first?.name || null); setSelectedRegion(null);
              if (first && String(first.id) !== String(igId)) { const clean = first.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, ""); const isSteamType = (first.type || "").toLowerCase().includes("steam"); navigate(`/store/${first.id}/${isSteamType ? (first.steam_id || 0) : 0}/${clean}`); }
            }}>
              {Object.keys(platformGroups).map(type => <option key={type} value={type}>{platformShortName(type)}</option>)}
            </select>
            <span className="gd-select-arrow">▾</span>
          </div>
        </div>
        {editionNamesForPlatform.length > 1 && (
          <div className="gd-selector-group">
            <label className="gd-selector-label">Édition</label>
            <div className="gd-select-wrapper">
              <select className="gd-select" value={selectedEdition || ""} onChange={e => {
                const edName = e.target.value; setSelectedEdition(edName); setSelectedRegion(null);
                const entries = (platformGroups[selectedPlatform] || []).filter(e => e.name === edName);
                const best = entries.find(e => e.stock === 1) || entries[0];
                if (best && String(best.id) !== String(igId)) { const clean = best.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, ""); const isSteamType = (best.type || "").toLowerCase().includes("steam"); navigate(`/store/${best.id}/${isSteamType ? (best.steam_id || 0) : 0}/${clean}`); }
              }}>
                {editionNamesForPlatform.map(name => <option key={name} value={name}>{formatEdition(name)}</option>)}
              </select>
              <span className="gd-select-arrow">▾</span>
            </div>
          </div>
        )}
        {regionsForSelection.length > 1 && (
          <div className="gd-selector-group">
            <label className="gd-selector-label">Région</label>
            <div className="gd-select-wrapper">
              <select className="gd-select" value={selectedRegion || ""} onChange={e => setSelectedRegion(e.target.value)}>
                {regionsForSelection.map(entry => <option key={entry.region} value={entry.region}>{entry.region}{entry.stock === 0 ? " — Hors stock" : ` ✓ ${parseFloat(entry.price).toFixed(2)} €`}</option>)}
              </select>
              <span className="gd-select-arrow">▾</span>
            </div>
          </div>
        )}
      </div>
    ) : null
  );

  const BuyButtons = ({ style = {} }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, ...style }}>
      {chosenInStock && chosenUrl
        ? <a href={chosenUrl} target="_blank" rel="noopener noreferrer" className="nk-btn nk-btn-rounded nk-btn-color-main-1 gd-btn-instock" style={{ flex: 1 }}>🛒 Acheter maintenant</a>
        : <button className="nk-btn nk-btn-rounded gd-btn-outofstock" disabled aria-disabled="true" style={{ flex: 1 }}>⛔ Hors stock — {editionName}</button>
      }
      <button onClick={toggleWishlist} disabled={wishlistLoading}
        title={inWishlist ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", border: inWishlist ? "1px solid #dd163b" : "1px solid rgba(255,255,255,0.2)", background: inWishlist ? "rgba(221,22,59,0.15)" : "rgba(255,255,255,0.06)", cursor: wishlistLoading ? "default" : "pointer", opacity: wishlistLoading ? 0.6 : 1, transition: "all 0.2s", flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? "#dd163b" : "none"} stroke={inWishlist ? "#dd163b" : "rgba(255,255,255,0.6)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <Link to={`/guides/${igId}`}
        title="Guides & Astuces de ce jeu"
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", transition: "all 0.2s", flexShrink: 0, textDecoration: "none" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#dd163b"; e.currentTarget.style.background = "rgba(221,22,59,0.15)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}>
        <span style={{ fontSize: 19 }}>📖</span>
      </Link>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <Header />

      {/* ── Hero ── */}
      {((heroId && heroId !== "0") || screenshots?.[0]?.path_full || igGame?.img || allEditions?.[0]?.img) && (
        <div style={{
          position: "absolute", left: 0, right: 0, height: "580px",
          backgroundImage: (() => {
            const steamHero = heroId && heroId !== "0" && !heroImgError ? `url(https://images.weserv.nl/?url=cdn.akamai.steamstatic.com/steam/apps/${heroId}/library_hero.jpg)` : null;
            const igFallback = screenshots?.[0]?.path_full || igGame?.img || allEditions?.[0]?.img;
            const igUrl = igFallback ? `url(https://images.weserv.nl/?url=${igFallback.replace(/^https?:\/\//, "")})` : null;
            return steamHero || igUrl || "none";
          })(),
          backgroundSize: "cover", backgroundPosition: "center top", zIndex: 0,
        }}>
          {heroId && heroId !== "0" && !heroImgError && (
            <img src={`https://images.weserv.nl/?url=cdn.akamai.steamstatic.com/steam/apps/${heroId}/library_hero.jpg`} alt="" style={{ display: "none" }} onError={() => setHeroImgError(true)} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(23,30,34,0.9) 10%, rgba(23,30,34,0.4) 60%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(23,30,34,1) 0%, transparent 55%)" }} />
        </div>
      )}

      <div className="container gd-container" style={{ position: "relative", zIndex: 1 }}>

        {/* ── Breadcrumb ── */}
        <ul className="nk-breadcrumbs">
          <li><Link to="/">Accueil</Link></li>
          <li><span className="fa fa-angle-right" /></li>
          <li><Link to="/Catalogues/">Jeux</Link></li>
          <li><span className="fa fa-angle-right" /></li>
          <li><span>{gameTitle}</span></li>
        </ul>
        <div className="nk-gap-1" />

        {/* ══════════════════════════════════════════
            GRILLE PRINCIPALE : Lecteur | Infos achat
        ══════════════════════════════════════════ */}
        <div className="nk-store-product">
          <div className="row vertical-gap" style={{ alignItems: "start" }}>

            {/* ── COL GAUCHE : lecteur + miniatures uniquement ── */}
            <div className="col-12 col-md-6">
              <div className="gd-media-main">
                {activeMedia === "video" && videoSrc ? (
                  <HlsPlayer key={`hls-${igId}`} src={videoSrc.url} type={videoSrc.type} poster={videoThumb} className="gd-media-video" />
                ) : activeMedia === "video" && youtubeId ? (
                  <iframe key={youtubeId} className="gd-media-video" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`} title="YouTube video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ width: "100%", aspectRatio: "16/9", border: "none" }} />
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
                      {videoThumb ? <img src={videoThumb} alt="vidéo" className="gd-thumb" /> : youtubeId ? <img src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} alt="vidéo" className="gd-thumb" /> : <div className="gd-thumb gd-thumb-video-placeholder">▶</div>}
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
            </div>{/* fin col gauche */}

            {/* ── COL DROITE : titre + scores + buy-card ── */}
            <div className="col-12 col-md-6">

              {/* Badge plateforme + Titre */}
              {/* Scores : Avis Steam + Metacritic + Note communauté */}
              {(steamReview || metacritic || true) && (
                <div className="gd-scores-row" style={{ marginTop: 12, marginBottom: 4 }}>
                  {steamReview && steamReviewTotal > 0 && (
                    <div className="gd-score-block">
                      <div className="gd-score-label">Avis Steam</div>
                      <div className="gd-score-value" style={{ color: steamReview.color }}>{steamReview.label}</div>
                      <div className="gd-score-sub">{steamReviewTotal.toLocaleString("fr-FR")} avis</div>
                    </div>
                  )}
                  {metacritic && (
                    <a href={metacritic.url} target="_blank" rel="noopener noreferrer" className="gd-score-block gd-metacritic" style={{ textDecoration: "none" }}>
                      <div className="gd-score-label">Metacritic</div>
                      <div className="gd-metacritic-score" style={{ background: metacritic.score >= 75 ? "#66cc33" : metacritic.score >= 50 ? "#ffcc33" : "#ff0000" }}>{metacritic.score}</div>
                    </a>
                  )}
                  <div className="gd-score-block">
                    <div className="gd-score-label">Note communauté</div>
                    <div className="gd-score-value" style={{ fontSize: 13 }}>{getRatingDescription(averageRating)}</div>
                    <div className="gd-score-sub" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {getRatingIcon(averageRating)}
                      <span>{comments.length} avis</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloc achat : prix + sélecteurs + bouton */}
              <div className="gd-buy-card">
                {/* Prix sur 1 ligne + icône plateforme à droite */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "nowrap" }}>
                    {chosenRetail && chosenRetail > (chosenPrice || 0) && (
                      <span style={{ fontSize: 14, color: "#666", textDecoration: "line-through", fontWeight: 500 }}>{chosenRetail.toFixed(2)} €</span>
                    )}
                    {chosenPromo && <div className="priceSlidePromo">{chosenPromo}</div>}
                    {chosenPrice && chosenPrice > 0
                      ? <div className="price text-white">{chosenPrice.toFixed(2)} €</div>
                      : <div className="price text-white" style={{ fontSize: 22 }}>Indisponible</div>
                    }
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: platformBg, flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,0.4)" }}>
                    <PlatformLogo type={chosenEntry?.type || igGame?.type || "Steam"} size={28} />
                  </div>
                </div>
                <SelectorsBlock />
                <BuyButtons style={{ marginTop: 4 }} />
              </div>

            </div>{/* fin col droite */}

          </div>{/* fin row */}
        </div>{/* fin nk-store-product */}

        {/* ══════════════════════════════════════════
            SECTION INFOS : description + tags + meta
        ══════════════════════════════════════════ */}
        {(steamData?.short_description || steamCategories.length > 0 || steamData?.developers || steamData?.genres?.length) && (
          <div style={{
            marginTop: 20,
            padding: "20px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "transparent",
          }}>

            {/* Dev / Éditeur / Sortie / Genres — AU-DESSUS */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {steamData?.developers && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", minWidth: 120 }}>
                  <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", fontWeight: 700 }}>Développeur</span>
                  <span style={{ fontSize: 13, color: "#ddd", fontWeight: 600 }}>{Array.isArray(steamData.developers) ? steamData.developers[0] : steamData.developers}</span>
                </div>
              )}
              {steamData?.publishers && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", minWidth: 120 }}>
                  <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", fontWeight: 700 }}>Éditeur</span>
                  <span style={{ fontSize: 13, color: "#ddd", fontWeight: 600 }}>{Array.isArray(steamData.publishers) ? steamData.publishers[0] : steamData.publishers}</span>
                </div>
              )}
              {(() => {
                const byPlatform = steamData?.release_date?.byPlatform;
                const platformKey = pt.includes("playstation") || pt.includes("ps") ? "PlayStation" : pt.includes("xbox") || pt.includes("microsoft") ? "Xbox" : pt.includes("nintendo") || pt.includes("switch") ? "Nintendo" : "PC";
                const date = byPlatform ? (byPlatform[platformKey] || null) : steamData?.release_date?.date;
                return date ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", minWidth: 120 }}>
                    <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", fontWeight: 700 }}>Sortie</span>
                    <span style={{ fontSize: 13, color: "#ddd", fontWeight: 600 }}>{date}</span>
                  </div>
                ) : null;
              })()}
              {steamData?.genres?.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px" }}>
                  <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#555", fontWeight: 700 }}>Genres</span>
                  <span style={{ fontSize: 13, color: "#ddd", fontWeight: 600 }}>{steamData.genres.map(g => g.description).join(", ")}</span>
                </div>
              )}
            </div>

            {/* Titre À PROPOS + description */}
            {steamData?.short_description && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 16, background: "#dd163b", borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", fontFamily: "Montserrat, sans-serif" }}>À propos</span>
                </div>
                <p style={{ color: "#a0a8b4", fontSize: 13, lineHeight: 1.75, margin: 0 }}>
                  {steamData.short_description}
                </p>
              </div>
            )}

            {/* Tags Steam avec voir plus */}
            {steamCategories.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", flexWrap: tagsExpanded ? "wrap" : "nowrap", gap: 6, overflow: "hidden", maxHeight: tagsExpanded ? "none" : "30px" }}>
                  {steamCategories.map(cat => (
                    <span key={cat.id} className="gd-feature-tag" style={{ flexShrink: 0 }}>{cat.description}</span>
                  ))}
                </div>
                <button onClick={() => setTagsExpanded(v => !v)}
                  style={{ marginTop: 6, background: "none", border: "none", color: "#dd163b", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: "inherit", letterSpacing: "0.03em" }}>
                  {tagsExpanded ? "▲ Voir moins" : "▼ Voir plus"}
                </button>
              </div>
            )}

          </div>
        )}

        <Separator style={{ margin: "28px 0" }} />

        {/* ── Onglets ── */}
        <div className="nk-tabs">
          <style>{`
            .gd-tabs-nav{display:flex!important;flex-wrap:nowrap!important;gap:6px;list-style:none;padding:0;margin:0 0 16px 0;border-bottom:none!important;}
            .gd-tab-item{flex:1 1 0;min-width:0;}
            .gd-tab-btn{display:flex!important;align-items:center;justify-content:center;width:100%;padding:10px 6px;font-size:clamp(10px,2.5vw,13px);font-weight:700;font-family:inherit;text-transform:uppercase;letter-spacing:0.05em;text-align:center;white-space:nowrap;cursor:pointer;border:2px solid #333!important;border-radius:4px;color:#aaa!important;background:transparent!important;transition:all 0.18s ease;line-height:1.2;box-sizing:border-box;}
            .gd-tab-btn:hover{border-color:#dd163b!important;color:#fff!important;}
            .gd-tab-btn.gd-tab-active{background:#dd163b!important;border-color:#dd163b!important;color:#fff!important;}
          `}</style>
          <ul className="gd-tabs-nav" role="tablist">
            {[{ key: "description", label: "Description" }, { key: "config", label: "Config requise" }, { key: "comment", label: `Commentaires (${comments.length})` }, { key: "guides", label: "Guides & Astuces" }].map(t => (
              <li className="gd-tab-item" key={t.key}>
                <span className={`gd-tab-btn${activeTab === t.key ? " gd-tab-active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</span>
              </li>
            ))}
          </ul>
          <style>{`
            .gd-tabpane-content{font-family:"Rajdhani",sans-serif;font-size:15.5px;line-height:1.75;color:#cfd2d8;}
            .gd-tabpane-content h1,.gd-tabpane-content h2,.gd-tabpane-content h3{font-family:"Montserrat",sans-serif;color:#fff;font-weight:700;margin:24px 0 12px;}
            .gd-tabpane-content p{margin:0 0 14px;}
            .gd-tabpane-content img{max-width:100%;border-radius:6px;}
            .gd-tabpane-content a{color:#dd163b;}
            .gd-tabpane-content ul,.gd-tabpane-content ol{padding-left:22px;margin:0 0 14px;}
            .gd-tabpane-content strong{color:#fff;}

            .gd-config-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:20px 22px;height:100%;transition:border-color 0.2s, background 0.2s;}
            .gd-config-card:hover{border-color:rgba(221,22,59,0.35);background:rgba(255,255,255,0.045);}
            .gd-config-title{font-family:"Montserrat",sans-serif;font-size:14px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:#fff;margin:0 0 14px;display:flex;align-items:center;gap:8px;}
            .gd-config-content{font-family:"Rajdhani",sans-serif;font-size:14.5px;line-height:1.85;color:#b8bcc4;}
            .gd-config-content p{margin:0 0 6px;}
            .gd-config-content strong,.gd-config-content b{color:#e8e8ea;font-weight:700;}

            .gd-guides-panel{display:flex;flex-direction:column;gap:18px;}
            .gd-guides-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;padding:48px 24px;border:1px dashed rgba(255,255,255,0.14);border-radius:12px;background:rgba(255,255,255,0.02);}
            .gd-guides-empty-icon{font-size:34px;opacity:0.6;}
            .gd-guides-empty-text{font-family:"Rajdhani",sans-serif;font-size:15px;color:#8a8d94;max-width:380px;}
            .gd-guides-card{display:flex;align-items:center;gap:20px;padding:22px 24px;border-radius:14px;background:linear-gradient(135deg, rgba(221,22,59,0.10), rgba(255,255,255,0.025));border:1px solid rgba(221,22,59,0.25);text-decoration:none;transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s;}
            .gd-guides-card:hover{border-color:rgba(221,22,59,0.55);transform:translateY(-2px);box-shadow:0 14px 32px rgba(221,22,59,0.12);}
            .gd-guides-card-img{width:64px;height:86px;object-fit:cover;border-radius:8px;flex-shrink:0;outline:1px solid rgba(255,255,255,0.12);}
            .gd-guides-card-body{flex:1;min-width:0;}
            .gd-guides-card-eyebrow{font-family:"Montserrat",sans-serif;font-size:10.5px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#dd163b;margin-bottom:6px;}
            .gd-guides-card-title{font-family:"Montserrat",sans-serif;font-size:18px;font-weight:800;color:#fff;margin:0 0 6px;}
            .gd-guides-card-sub{font-family:"Rajdhani",sans-serif;font-size:13.5px;color:#9a9ea6;}
            .gd-guides-card-arrow{font-size:22px;color:#dd163b;flex-shrink:0;transition:transform 0.2s;}
            .gd-guides-card:hover .gd-guides-card-arrow{transform:translateX(4px);}
            .gd-guides-cta-btn{align-self:flex-start;font-family:"Montserrat",sans-serif;font-size:12px;font-weight:800;letter-spacing:0.07em;text-transform:uppercase;color:#fff;background:#dd163b;border:none;border-radius:6px;padding:12px 24px;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:transform 0.15s, box-shadow 0.15s;}
            .gd-guides-cta-btn:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(221,22,59,0.3);}
          `}</style>
          <div className="tab-content">
            {activeTab === "description" && (
              <div className="tab-pane fade show active">
                <Separator label="Description" />
                {steamData?.detailed_description
                  ? <div className="steam-desc-content gd-tabpane-content" dangerouslySetInnerHTML={{ __html: steamData.detailed_description }} />
                  : <p style={{ color: "#888" }}>Aucune description disponible.</p>}
              </div>
            )}
            {activeTab === "config" && (
              <div className="tab-pane fade show active">
                <Separator label="Configuration PC requise" />
                <div className="row gd-config-row">
                  {pcReqs?.minimum && <div className="col-12 col-md-6 gd-config-col"><div className="gd-config-card"><h4 className="gd-config-title">⚙️ Configuration minimale</h4><div className="gd-config-content" dangerouslySetInnerHTML={{ __html: pcReqs.minimum }} /></div></div>}
                  {pcReqs?.recommended && <div className="col-12 col-md-6 gd-config-col"><div className="gd-config-card"><h4 className="gd-config-title">🚀 Configuration recommandée</h4><div className="gd-config-content" dangerouslySetInnerHTML={{ __html: pcReqs.recommended }} /></div></div>}
                  {!pcReqs?.minimum && !pcReqs?.recommended && <p className="col-12" style={{ color: "#888", padding: "20px 15px" }}>Configuration non disponible.</p>}
                </div>
              </div>
            )}
            {activeTab === "comment" && (
              <div className="tab-pane fade show active">
                <Separator label="Commentaires" />
                <CommentsSection
                  gameKey={sharedGameKey}
                  gameKeys={allEditions.length > 0 ? allEditions.map(ed => `ig_${ed.id}`) : [`ig_${igId}`]}
                  user={user}
                  userN={userN}
                  releaseDate={steamData?.release_date?.date || null}
                />
              </div>
            )}
            {activeTab === "guides" && (
              <div className="tab-pane fade show active">
                <Separator label="Guides & Astuces" />
                <div className="gd-guides-panel">
                  {guidesPreview === undefined && (
                    <p style={{ color: "#888" }}>Chargement...</p>
                  )}
                  {guidesPreview === null && (
                    <div className="gd-guides-empty">
                      <span className="gd-guides-empty-icon">📖</span>
                      <p className="gd-guides-empty-text">
                        Aucun guide ou astuce n'a encore été publié pour ce jeu.
                      </p>
                      {isAdmin && (
                        <Link to={`/guides/${igId}`} className="gd-guides-cta-btn">+ Créer le premier guide</Link>
                      )}
                    </div>
                  )}
                  {guidesPreview && (
                    <>
                      <Link to={`/guides/${igId}`} className="gd-guides-card">
                        {guidesPreview.gameImg && (
                          <img src={guidesPreview.gameImg} alt={guidesPreview.gameName} className="gd-guides-card-img" />
                        )}
                        <div className="gd-guides-card-body">
                          <div className="gd-guides-card-eyebrow">Base de connaissances</div>
                          <h3 className="gd-guides-card-title">{guidesPreview.gameName}</h3>
                          <div className="gd-guides-card-sub">
                            {guidesPreview.guidesCount} {guidesPreview.guidesCount > 1 ? "guides & astuces disponibles" : "guide ou astuce disponible"}
                          </div>
                        </div>
                        <span className="gd-guides-card-arrow">→</span>
                      </Link>
                      {isAdmin && (
                        <Link to={`/guides/${igId}`} className="gd-guides-cta-btn">+ Ajouter un guide ou une astuce</Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>{/* fin gd-container */}

      {/* ── Articles ── */}
      {articles.length > 0 && (
        <div className="container gd-container">
          <Separator label="L'actualité du jeu" />
          <div className="gd-articles-list">
            {articles.map(a => {
              const img = a.photos?.[0]?.url || a.game_img || null;
              const excerpt = a.content ? a.content.replace(/<[^>]*>/g, "").slice(0, 180) + "…" : "";
              const date = a.created_at?.toDate ? a.created_at.toDate().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
              return (
                <Link key={a.doc_id} to={`/article/${a.doc_id}`} className="gd-article-card">
                  {img && <div className="gd-article-img"><img src={img} alt={a.title} /></div>}
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
              const price = parseFloat(g.price), retail = parseFloat(g.retail);
              const promo = retail && price && retail > price ? `-${Math.round(((retail - price) / retail) * 100)}%` : null;
              const gSteamId = g.steam_id || 0, gSlug = g.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
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
                      {g.stock === 1 && price > 0 ? (<>{retail > price && <span className="gd-related-retail">{retail.toFixed(2)} €</span>}<span className="gd-related-final">{price.toFixed(2)} €</span></>) : <span className="gd-related-na">Hors stock</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Similaires ── */}
      {similar.length > 0 && (
        <div className="container gd-container">
          <Separator label="Jeux similaires" />
          <div className="gd-related-grid">
            {similar.map(g => {
              const price = parseFloat(g.price), retail = parseFloat(g.retail);
              const promo = retail && price && retail > price ? `-${Math.round(((retail - price) / retail) * 100)}%` : null;
              const gSteamId = g.steam_id || 0, gSlug = g.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
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
                      {g.stock === 1 && price > 0 ? (<>{retail > price && <span className="gd-related-retail">{retail.toFixed(2)} €</span>}<span className="gd-related-final">{price.toFixed(2)} €</span></>) : <span className="gd-related-na">Hors stock</span>}
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

      {/* ══════ BOUTON ADMIN ══════ */}
      {isAdmin && (
        <button onClick={() => setAdminOpen(v => !v)}
          style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9000, width: 52, height: 52, borderRadius: "50%", background: adminOpen ? "#333" : "#dd163b", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", transition: "background 0.2s" }}
          title={adminOpen ? "Fermer le panneau admin" : "Modifier ce jeu"}>
          {adminOpen ? "✕" : "✏️"}
        </button>
      )}

      {/* ══════ PANNEAU ADMIN SLIDE-IN ══════ */}
      {isAdmin && (
        <>
          {adminOpen && <div onClick={() => setAdminOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:8000 }} />}
          <div style={{ position:"fixed", top:0, right: adminOpen ? 0 : "-480px", width:"100%", maxWidth:460, height:"100vh", background:"#0d0e13", borderLeft:"1px solid rgba(221,22,59,0.25)", zIndex:8001, transition:"right 0.3s ease", overflowY:"auto", padding:"24px 24px 100px", boxSizing:"border-box" }}>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:"Orbitron,sans-serif", fontSize:11, color:"#dd163b", letterSpacing:"0.15em", textTransform:"uppercase" }}>Console Admin</div>
                <div style={{ fontFamily:"Rajdhani,sans-serif", fontSize:18, fontWeight:700, color:"#fff", marginTop:2 }}>Modifier la fiche</div>
              </div>
              <button onClick={() => setAdminOpen(false)} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"50%", width:36, height:36, color:"#fff", cursor:"pointer", fontSize:16 }}>✕</button>
            </div>

            {igGame && (
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, marginBottom:16 }}>
                <img src={igGame.img} alt={igGame.name} style={{ width:48, height:30, objectFit:"cover", borderRadius:4 }} />
                <div>
                  <div style={{ fontFamily:"Rajdhani,sans-serif", fontSize:14, fontWeight:700, color:"#fff" }}>{igGame.name}</div>
                  <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, color:"#555" }}>#{igId} · {igGame.type} · {allEditions.length} édition(s)</div>
                </div>
              </div>
            )}

            <button onClick={handleRefreshEditions} disabled={adminRefreshing}
              style={{ width:"100%", padding:"12px", marginBottom:4, background: adminRefreshing ? "rgba(255,255,255,0.02)" : "rgba(71,142,255,0.1)", border:`1px solid ${adminRefreshing ? "#333" : "rgba(71,142,255,0.4)"}`, borderRadius:6, color: adminRefreshing ? "#555" : "#478eff", fontFamily:"Montserrat,sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", cursor: adminRefreshing ? "default" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.2s" }}>
              {adminRefreshing ? "⏳ Propagation en cours..." : "🔄 Propager steamData vers toutes les éditions"}
            </button>
            <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, color:"#444", marginBottom:12, textAlign:"center", lineHeight:1.5 }}>
              Copie les infos Steam du jeu standard vers toutes ses éditions dans Firebase
            </div>

            {/* ── Bouton vider cache éditions ── */}
            <button onClick={handleClearEditionsCache}
              style={{ width:"100%", padding:"12px", marginBottom:8, background:"rgba(243,156,18,0.08)", border:"1px solid rgba(243,156,18,0.3)", borderRadius:6, color:"#f39c12", fontFamily:"Montserrat,sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              🧹 Vider le cache des éditions
            </button>
            <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, color:"#444", marginBottom:16, textAlign:"center", lineHeight:1.5 }}>
              Force le rechargement des éditions depuis l'API IG
            </div>

            {/* ── Bouton forcer récupération données Steam ── */}
            <button onClick={handleForceRefreshSteamData} disabled={adminForcingSteam}
              style={{ width:"100%", padding:"12px", marginBottom:8, background: adminForcingSteam ? "rgba(255,255,255,0.02)" : "rgba(243,156,18,0.08)", border:`1px solid ${adminForcingSteam ? "#333" : "rgba(243,156,18,0.3)"}`, borderRadius:6, color: adminForcingSteam ? "#555" : "#f39c12", fontFamily:"Montserrat,sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", cursor: adminForcingSteam ? "default" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {adminForcingSteam ? "⏳ Récupération en cours..." : "🎮 Forcer la récupération Steam (ce jeu)"}
            </button>
            <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, color:"#444", marginBottom:16, textAlign:"center", lineHeight:1.5 }}>
              Utile si la description/config/screenshots Steam manquent (éditions Deluxe, Premium...). Vide le cache Steam de ce jeu précis et relance la résolution.
            </div>

            {/* ── Bouton suppression Firebase ── */}
            {!adminDeleteConfirm ? (
              <button onClick={() => setAdminDeleteConfirm(true)}
                style={{ width:"100%", padding:"12px", marginBottom:20, background:"rgba(221,22,59,0.07)", border:"1px solid rgba(221,22,59,0.25)", borderRadius:6, color:"#dd163b", fontFamily:"Montserrat,sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                🗑 Supprimer le jeu + toutes les éditions de Firebase
              </button>
            ) : (
              <div style={{ marginBottom:20, padding:"14px", background:"rgba(221,22,59,0.08)", border:"1px solid rgba(221,22,59,0.3)", borderRadius:8 }}>
                <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:12, color:"#fff", fontWeight:700, marginBottom:10, textAlign:"center" }}>
                  ⚠️ Supprimer {[igId, ...allEditions.map(e => e.id)].filter((v,i,a)=>a.indexOf(v)===i).length} document(s) Firebase ?
                </div>
                <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, color:"#888", marginBottom:12, textAlign:"center" }}>
                  Cette action est irréversible. Les données Steam seront rechargées automatiquement à la prochaine visite.
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setAdminDeleteConfirm(false)}
                    style={{ flex:1, padding:"10px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"#888", fontFamily:"Montserrat,sans-serif", fontSize:11, fontWeight:700, cursor:"pointer", textTransform:"uppercase" }}>
                    Annuler
                  </button>
                  <button onClick={handleDeleteFromFirebase} disabled={adminDeleting}
                    style={{ flex:1, padding:"10px", background:"#dd163b", border:"none", borderRadius:6, color:"#fff", fontFamily:"Montserrat,sans-serif", fontSize:11, fontWeight:700, cursor:adminDeleting?"default":"pointer", opacity:adminDeleting?0.6:1, textTransform:"uppercase" }}>
                    {adminDeleting ? "Suppression..." : "✓ Confirmer"}
                  </button>
                </div>
              </div>
            )}

            {(() => {
              const S = ({ children }) => <div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#555", marginBottom:8, marginTop:20 }}>{children}</div>;
              const Field = ({ label, children }) => <div style={{ marginBottom:14 }}><div style={{ fontFamily:"Montserrat,sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#444", marginBottom:6 }}>{label}</div>{children}</div>;
              const Input = (props) => <input {...props} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, color:"#ddd", fontSize:13, padding:"9px 12px", outline:"none", fontFamily:"Montserrat,sans-serif", boxSizing:"border-box", ...props.style }} />;
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
                      <label key={m} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontFamily:"Rajdhani,sans-serif", fontSize:12, color:adminDateMode===m?"#dd163b":"#666", background:adminDateMode===m?"rgba(221,22,59,0.08)":"rgba(255,255,255,0.02)", border:`1px solid ${adminDateMode===m?"#dd163b":"#333"}`, borderRadius:4, padding:"5px 10px" }}>
                        <input type="radio" checked={adminDateMode===m} onChange={()=>setAdminDateMode(m)} style={{ accentColor:"#dd163b" }} />
                        {m==="global" ? "Globale" : "Par plateforme"}
                      </label>
                    ))}
                  </div>
                  {adminDateMode==="global" && <Input value={adminDate} onChange={e=>setAdminDate(e.target.value)} placeholder="Ex: 26 mai 2026" />}
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
                          <button type="button" onClick={()=>setAdminScreenshots(prev=>prev.filter((_,idx)=>idx!==i))} style={{ position:"absolute", top:-6, right:-6, background:"#dd163b", border:"none", borderRadius:"50%", width:18, height:18, color:"#fff", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {adminNewPreviews.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                      {adminNewPreviews.map((src,i) => (
                        <div key={i} style={{ position:"relative" }}>
                          <img src={src} alt="" style={{ width:72, height:42, objectFit:"cover", borderRadius:4, opacity:0.7 }} />
                          <button type="button" onClick={()=>{ setAdminNewFiles(p=>p.filter((_,idx)=>idx!==i)); setAdminNewPreviews(p=>p.filter((_,idx)=>idx!==i)); }} style={{ position:"absolute", top:-6, right:-6, background:"#dd163b", border:"none", borderRadius:"50%", width:18, height:18, color:"#fff", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={()=>adminScreenRef.current?.click()} style={{ width:"100%", padding:"10px", background:"rgba(255,255,255,0.04)", border:"1px dashed rgba(255,255,255,0.15)", borderRadius:6, color:"#666", fontFamily:"Montserrat,sans-serif", fontSize:11, cursor:"pointer", marginBottom:4 }}>
                    🖼 Ajouter des screenshots
                  </button>
                  <input ref={adminScreenRef} type="file" accept="image/*" multiple style={{ display:"none" }}
                    onChange={e=>{ const files=Array.from(e.target.files); setAdminNewFiles(p=>[...p,...files]); setAdminNewPreviews(p=>[...p,...files.map(f=>URL.createObjectURL(f))]); }} />
                  <S>Mise en avant</S>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <CheckLabel checked={adminFeatured} onChange={e=>{ setAdminFeatured(e.target.checked); if(!e.target.checked) setAdminFeaturedPlatforms([]); }}>
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
                    <CheckLabel checked={adminReleased} onChange={e=>{ setAdminReleased(e.target.checked); if(e.target.checked) setAdminFeatured(false); if(!e.target.checked) setAdminReleasedPlatforms([]); }} color="#27ae60">
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
                  <div style={{ position:"sticky", bottom:0, background:"#0d0e13", padding:"16px 0 0", marginTop:20, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                    <button onClick={handleAdminSave} disabled={adminSaving}
                      style={{ width:"100%", padding:13, background:"#dd163b", border:"none", borderRadius:6, color:"#fff", fontFamily:"Montserrat,sans-serif", fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", cursor: adminSaving?"default":"pointer", opacity: adminSaving?0.6:1 }}>
                      {adminSaving ? "Sauvegarde..." : "💾 Sauvegarder"}
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