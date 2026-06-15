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

function Separator({ label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 18,
      margin: "52px 0 28px"
    }}>
      <div style={{ width: 5, height: 28, background: "#dd163b", borderRadius: 3, flexShrink: 0 }} />
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

  const toggleWishlist = async () => {
    if (!user?.uid) { navigate("/Login"); return; }
    setWishlistLoading(true);
    try {
      const ref = doc(db, "users", user.uid, "wishlist", `ig_${igId}`);
      if (inWishlist) {
        await deleteDoc(ref);
        setInWishlist(false);
      } else {
        await setDoc(ref, {
          igId,
          name: gameTitle || "",
          img: igGame?.img || steamData?.header_image || "",
          price: chosenEntry?.price || igGame?.price || "",
          addedAt: serverTimestamp(),
        });
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

  useEffect(() => {
    setHeroImgError(false);
  }, [igId]);

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
                const fresh = await fetch(`${BACKEND_URL}/api/steam/${steamAppId}`)
                  .then(r => r.ok ? r.json() : null).catch(() => null);
                if (fresh) {
                  setSteamData(fresh);
                  await setDoc(fbRef, { igId, savedAt: serverTimestamp(), steamData: fresh }, { merge: true });
                }
              } catch {}
            })();
          }
          return;
        }
      }

      const igGameData = await fetch(`${BACKEND_URL}/api/game/${igId}`)
        .then(r => r.ok ? r.json() : null).catch(() => null);
      const gameType = (igGameData?.type || "").toLowerCase();

      let resolvedSteamId = steamId && steamId !== "0" ? steamId : null;

      const isConsole = gameType.includes("playstation") || gameType.includes("ps5") ||
        gameType.includes("ps4") || gameType.includes("nintendo") ||
        gameType.includes("switch") || gameType.includes("microsoft") ||
        gameType.includes("xbox") || gameType.includes("ubisoft");

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
        try {
          await setDoc(fbRef, { igId, savedAt: serverTimestamp(), steamData: gameDataRes }, { merge: true });
        } catch (writeErr) {
          console.warn("Firebase write error:", writeErr.message);
        }
      } else if (igGameData) {
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

  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/game/${igId}`);
        if (res.ok) {
          const game = await res.json();
          setIgGame(game || null);
          return;
        }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igId, igGame?.name, steamData?.name]);

  useEffect(() => {
    if (!igId) return;
    (async () => {
      try {
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
            return { ...cached, ...apiEd, price: apiEd.price, retail: apiEd.retail };
          });
        }

        const currentInList = filtered.find(e => String(e.id) === String(igId));
        if (!currentInList) {
          const selfRes = await fetch(`${BACKEND_URL}/api/game/${igId}`);
          if (selfRes.ok) {
            const self = await selfRes.json();
            if (self && self.id) filtered = [self, ...filtered];
          }
        }

        setAllEditions(filtered);

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

        try {
          await Promise.all(filtered.map(ed =>
            setDoc(doc(db, "games", `ig_${ed.id}`), { editions: filtered }, { merge: true })
          ));
        } catch (e) { console.warn("Firebase editions write:", e); }

      } catch (e) { console.error("Editions fetch error", e); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igId]);

  useEffect(() => {
    if (!allEditions.length) return;
    const current = allEditions.find(e => String(e.id) === String(igId));
    if (current) {
      setSelectedPlatform(current.type);
      setSelectedEdition(current.name);
    } else {
      const first = allEditions.find(e => e.stock === 1) || allEditions[0];
      setSelectedPlatform(first?.type || null);
      setSelectedEdition(first?.name || null);
    }
  }, [allEditions, igId]);

  const platformGroups = allEditions.reduce((acc, ed) => {
    if (!acc[ed.type]) acc[ed.type] = [];
    acc[ed.type].push(ed);
    return acc;
  }, {});

  const gameBase = (igGame?.name || "")
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/\s*(deluxe|ultimate|gold|premium|standard)\s*edition.*/gi, "")
    .replace(/\s*edition.*/gi, "")
    .replace(/[-–].*$/, "")
    .trim();

  const shortEdName = (name) => {
    let short = name.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    const baseNorm = gameBase.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    short = short.replace(baseNorm, "").replace(/^\s*[-–]?\s*/, "").trim();
    if (!short || short.toLowerCase() === "edition") return "Standard Edition";
    if (!short.toLowerCase().includes("edition")) short = short + " Edition";
    return short;
  };

  const editionNamesForPlatform = selectedPlatform
    ? [...new Set(platformGroups[selectedPlatform]?.map(e => e.name) || [])]
    : [];

  const regionsForSelection = selectedPlatform && selectedEdition
    ? (platformGroups[selectedPlatform] || []).filter(e => e.name === selectedEdition)
    : [];

  const [selectedRegion, setSelectedRegion] = useState(null);

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

  const handleAdminSave = async () => {
    setAdminSaving(true); setAdminMsg("");
    try {
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

      const fbRef  = doc(db, "games", `ig_${igId}`);
      const fbSnap = await getDoc(fbRef);
      const existing = fbSnap.exists() ? fbSnap.data() : {};

      await setDoc(fbRef, {
        steamData: {
          ...(existing.steamData || {}),
          short_description: adminDesc,
          developers: [adminDev],
          publishers: [adminPub],
          release_date: {
            ...(existing.steamData?.release_date || {}),
            date: adminDateMode === "global" ? adminDate : "",
            byPlatform: adminDateMode === "byplatform" ? adminDateByPlatform : null,
          },
          screenshots: allScreenshots,
          ...(ytId ? { youtube_id: ytId } : {}),
        },
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
        savedAt: serverTimestamp(),
      }, { merge: true });

      setAdminScreenshots(allScreenshots);
      setAdminNewFiles([]); setAdminNewPreviews([]);
      setAdminMsg("✅ Fiche mise à jour !");
      setAdminMsgType("success");
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

  useEffect(() => {
    if (!steamData) return;
    const m = steamData?.movies?.[0];
    const hasVideo = m?.webm?.max || m?.webm?.["480"] || m?.mp4?.max || m?.mp4?.["480"] || m?.hls_h264 || steamData?.youtube_id;
    if (!hasVideo) setActiveMedia(0);
  }, [steamData]);

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
        await setDoc(ref, { gameId: gameKey, averageRating: avg }, { merge: true });
      } catch (err) { console.warn("Firestore write denied:", err.message); }
    })();
  }, [comments, igId, user]);

  const averageRating = comments.length
    ? comments.reduce((a, c) => a + parseInt(c.rating || 0), 0) / comments.length : 0;

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
  const platformLabel = pt.includes("rockstar")    ? "Rockstar"
    : pt.includes("ubisoft")    ? "Ubisoft Connect"
    : pt.includes("microsoft")  ? "Microsoft Store"
    : pt.includes("xbox")       ? "Xbox"
    : pt.includes("playstation")? "PlayStation Store"
    : pt.includes("epic")       ? "Epic Games"
    : pt.includes("gog")        ? "GOG"
    : pt.includes("nintendo")   ? "Nintendo eShop"
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
    return name.replace(/^[^:]+:\s*/, '').trim();
  }

  const heroId = chosenEntry?.steam_id || steamData?.steam_appid || steamId;

  return (
    <div className="pg-wrapper">
      <Header />

      {/* HERO */}
      {((heroId && heroId !== "0") || screenshots?.[0]?.path_full || igGame?.img || allEditions?.[0]?.img) && (
        <div
          className="pg-hero"
          style={{
            backgroundImage: (() => {
              const steamHero = heroId && heroId !== "0" && !heroImgError
                ? `url(https://images.weserv.nl/?url=cdn.akamai.steamstatic.com/steam/apps/${heroId}/library_hero.jpg)`
                : null;
              const igFallback = screenshots?.[0]?.path_full || igGame?.img || allEditions?.[0]?.img;
              const igUrl = igFallback
                ? `url(https://images.weserv.nl/?url=${igFallback.replace(/^https?:\/\//, "")})`
                : null;
              return steamHero || igUrl || "none";
            })()
          }}
        >
          {heroId && heroId !== "0" && !heroImgError && (
            <img
              src={`https://images.weserv.nl/?url=cdn.akamai.steamstatic.com/steam/apps/${heroId}/library_hero.jpg`}
              alt="s"
              style={{ display: "none" }}
              onError={() => setHeroImgError(true)}
            />
          )}
        </div>
      )}

      {/* CONTENEUR PRINCIPAL */}
      <div className="pg-container">

        {/* ── GRILLE PRINCIPALE ── */}
        <div className="pg-grid" style={{ alignItems: "start" }}>

          {/* ── COLONNE GAUCHE : média + description + tags ── */}
          <div className="pg-media-col">

            {/* Lecteur principal */}
            <div className="pg-main-media-frame">
              {activeMedia === "video" && videoSrc ? (
                <HlsPlayer key={`hls-${igId}`} src={videoSrc.url} type={videoSrc.type} poster={videoThumb} />
              ) : activeMedia === "video" && youtubeId ? (
                <iframe
                  key={youtubeId}
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : screenshots[activeMedia] ? (
                <img src={screenshots[activeMedia].path_full} alt="screenshot" />
              ) : igGame?.img ? (
                <img src={igGame.img} alt={gameTitle} />
              ) : null}
            </div>

            {/* Miniatures */}
            {(videoSrc || youtubeId || screenshots.length > 0) && (
              <div className="pg-thumb-strip">
                {(videoSrc || youtubeId) && (
                  <div
                    className={`pg-thumb-box ${activeMedia === "video" ? "active" : ""}`}
                    onClick={() => setActiveMedia("video")}
                  >
                    {videoThumb
                      ? <img src={videoThumb} alt="vidéo" />
                      : youtubeId
                        ? <img src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} alt="vidéo" />
                        : <div style={{width:'100%', height:'100%', background:'#111'}} />
                    }
                    <div className="pg-thumb-play-icon">▶</div>
                  </div>
                )}
                {screenshots.slice(0, 7).map((s, i) => (
                  <div
                    key={i}
                    className={`pg-thumb-box ${activeMedia === i ? "active" : ""}`}
                    onClick={() => setActiveMedia(i)}
                  >
                    <img src={s.path_thumbnail} alt="miniature" />
                  </div>
                ))}
              </div>
            )}

            {/* ── Description courte sous les miniatures ── */}
            {steamData?.short_description && (
              <div style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.07)",
                color: "#a0a8b4",
                fontSize: "13px",
                lineHeight: "1.7",
              }}>
                {steamData.short_description}
              </div>
            )}

            {/* ── Tags Steam sous la description ── */}
            {steamCategories.length > 0 && (
              <div className="pg-meta-tags" style={{ marginTop: 14 }}>
                {steamCategories.map(cat => (
                  <span key={cat.id} className="pg-meta-tag">{cat.description}</span>
                ))}
              </div>
            )}

          </div>

          {/* ── COLONNE DROITE : infos + achat ── */}
          <div className="pg-info-col">

            {/* Badge plateforme */}
            <div className="pg-header-tags">
              <div className="pg-platform-tag">
                <PlatformLogo type={chosenEntry?.type || igGame?.type || "Steam"} size={16} />
                {platformLabel}
              </div>
            </div>

            {/* Titre */}
            <h1 className="pg-game-title">{gameTitle}</h1>

            {/* Dev / Éditeur / Date */}
            <div className="pg-dev-pub">
              {steamData?.developers && (
                <span>
                  <strong>Dev:</strong>{" "}
                  {Array.isArray(steamData.developers) ? steamData.developers[0] : steamData.developers}
                </span>
              )}
              {steamData?.publishers && (
                <span>
                  <strong>Éditeur:</strong>{" "}
                  {Array.isArray(steamData.publishers) ? steamData.publishers[0] : steamData.publishers}
                </span>
              )}
              {steamData?.release_date?.date && (
                <span><strong>Sortie:</strong> {steamData.release_date.date}</span>
              )}
            </div>

            {/* Scores */}
            {(steamReview || metacritic) && (
              <div className="pg-scores-row">
                {steamReview && steamReviewTotal > 0 && (
                  <div className="pg-score-card">
                    <span className="pg-score-label">Avis Steam</span>
                    <span className="pg-score-val" style={{color: steamReview.color}}>{steamReview.label}</span>
                  </div>
                )}
                {metacritic && (
                  <div className="pg-score-card">
                    <span className="pg-score-label">Metacritic</span>
                    <span className="pg-score-val" style={{color: metacritic.score >= 75 ? "#66cc33" : metacritic.score >= 50 ? "#ffcc33" : "#ff0000"}}>
                      {metacritic.score}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Bloc achat */}
            <div className="pg-buy-section">

              {/* Prix */}
              <div className="pg-price-display">
                {chosenPromo && <div className="pg-discount-badge">{chosenPromo}</div>}
                <div className="pg-price-numbers">
                  {chosenRetail && chosenRetail > (chosenPrice || 0) && (
                    <span className="pg-price-old">{chosenRetail.toFixed(2)} €</span>
                  )}
                  {chosenPrice && chosenPrice > 0 ? (
                    <span className="pg-price-new">{chosenPrice.toFixed(2)} €</span>
                  ) : (
                    <span className="pg-price-new" style={{fontSize:'22px'}}>Indisponible</span>
                  )}
                </div>
              </div>

              {/* Sélecteurs */}
              {allEditions.length > 0 && (
                <div className="pg-selectors-grid">
                  <div className="pg-select-group">
                    <label>Plateforme</label>
                    <select
                      className="pg-select-input"
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
                        <option key={type} value={type}>{platformShortName(type)}</option>
                      ))}
                    </select>
                  </div>

                  {editionNamesForPlatform.length > 1 && (
                    <div className="pg-select-group">
                      <label>Édition</label>
                      <select
                        className="pg-select-input"
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
                          <option key={name} value={name}>{formatEdition(name)}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {regionsForSelection.length > 1 && (
                    <div className="pg-select-group">
                      <label>Région</label>
                      <select
                        className="pg-select-input"
                        value={selectedRegion || ""}
                        onChange={e => setSelectedRegion(e.target.value)}
                      >
                        {regionsForSelection.map(entry => (
                          <option key={entry.region} value={entry.region}>
                            {entry.region}{entry.stock === 0 ? " — Hors stock" : ` ✓ ${parseFloat(entry.price).toFixed(2)} €`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons CTA */}
              <div className="pg-actions-row">
                {chosenInStock && chosenUrl ? (
                  <a href={chosenUrl} target="_blank" rel="noopener noreferrer" className="pg-btn-primary">
                    🛒 Acheter maintenant
                  </a>
                ) : (
                  <button className="pg-btn-primary pg-btn-disabled" disabled>⛔ Rupture de stock</button>
                )}
                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`pg-btn-wishlist ${inWishlist ? "active" : ""}`}
                  title="Wishlist"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── ONGLETS ── */}
        <div className="pg-tabs-container">
          <div className="pg-tabs-nav">
            <button className={`pg-tab-btn ${activeTab === "description" ? "active" : ""}`} onClick={() => setActiveTab("description")}>Description</button>
            <button className={`pg-tab-btn ${activeTab === "config" ? "active" : ""}`} onClick={() => setActiveTab("config")}>Configuration PC</button>
            <button className={`pg-tab-btn ${activeTab === "comment" ? "active" : ""}`} onClick={() => setActiveTab("comment")}>Avis communauté ({comments.length})</button>
          </div>

          <div className="pg-tab-content">
            {activeTab === "description" && (
              <div className="steam-desc-content" dangerouslySetInnerHTML={{ __html: steamData?.detailed_description || "<p>Aucune description disponible pour ce jeu.</p>" }} />
            )}
            {activeTab === "config" && (
              <div className="pg-config-grid">
                {pcReqs?.minimum && (
                  <div className="pg-config-card">
                    <h4>⚙️ Config Minimale</h4>
                    <div dangerouslySetInnerHTML={{ __html: pcReqs.minimum }} />
                  </div>
                )}
                {pcReqs?.recommended && (
                  <div className="pg-config-card">
                    <h4>🚀 Config Recommandée</h4>
                    <div dangerouslySetInnerHTML={{ __html: pcReqs.recommended }} />
                  </div>
                )}
                {!pcReqs?.minimum && !pcReqs?.recommended && (
                  <p style={{color:'#888'}}>Données de configuration non fournies.</p>
                )}
              </div>
            )}
            {activeTab === "comment" && (
              <CommentsSection gameKey={`ig_${igId}`} user={user} userN={userN} releaseDate={steamData?.release_date?.date || null} />
            )}
          </div>
        </div>

        {/* ── ARTICLES ── */}
        {articles.length > 0 && (
          <div style={{marginTop: '60px'}}>
            <Separator label="L'actualité du jeu" />
            <div className="gd-articles-list">
              {articles.map(a => {
                const img = a.photos?.[0]?.url || a.game_img || null;
                const excerpt = a.content ? a.content.replace(/<[^>]*>/g, "").slice(0, 180) + "…" : "";
                const date = a.created_at?.toDate ? a.created_at.toDate().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
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

        {/* ── FRANCHISE ── */}
        {franchise.length > 0 && (
          <div style={{marginTop: '60px'}}>
            <Separator label="Autres jeux de la franchise" />
            <div className="gd-related-grid">
              {franchise.map(g => {
                const price  = parseFloat(g.price);
                const retail = parseFloat(g.retail);
                const promo  = retail && price && retail > price ? `-${Math.round(((retail - price) / retail) * 100)}%` : null;
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

        {/* ── SIMILAIRES ── */}
        {similar.length > 0 && (
          <div style={{marginTop: '60px'}}>
            <Separator label="Jeux similaires" />
            <div className="gd-related-grid">
              {similar.map(g => {
                const price  = parseFloat(g.price);
                const retail = parseFloat(g.retail);
                const promo  = retail && price && retail > price ? `-${Math.round(((retail - price) / retail) * 100)}%` : null;
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

      </div>

      <Footer />

      {/* BOUTON ADMIN */}
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
            transition: "background 0.2s"
          }}
        >
          {adminOpen ? "✕" : "✏️"}
        </button>
      )}

    </div>
  );
}

export default GameDetail;