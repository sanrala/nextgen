import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../Firebase";

const BACKEND_URL = "https://api.sm-artweb.fr";
const PER_PAGE = 15;

// ─── Platform helpers ──────────────────────────────────────────────────────────
function getPlatformKey(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("steam"))       return "Steam";
  if (t.includes("playstation") || t.includes("ps5") || t.includes("ps4")) return "PlayStation";
  if (t.includes("xbox") || t.includes("microsoft")) return "Xbox";
  if (t.includes("nintendo") || t.includes("switch")) return "Nintendo";
  if (t.includes("ubisoft"))     return "Ubisoft";
  if (t.includes("epic"))        return "Epic";
  if (t.includes("gog"))         return "GOG";
  if (t.includes("rockstar"))    return "Rockstar";
  if (t.includes("ea") || t.includes("origin") || t.includes("electronic arts")) return "EA";
  return "Autre";
}

function getPromo(retail, price) {
  const r = parseFloat(retail);
  const p = parseFloat(price);
  if (!r || !p || r <= p) return null;
  return `-${Math.round(((r - p) / r) * 100)}%`;
}

function cleanTitle(name) {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
}

const PLATFORM_FILTERS = [
  { key: "Tous",         label: "Tous" },
  { key: "Steam",        label: "Steam" },
  { key: "PlayStation",  label: "PlayStation" },
  { key: "Xbox",         label: "Xbox" },
  { key: "Nintendo",     label: "Nintendo" },
  { key: "Ubisoft",      label: "Ubisoft" },
  { key: "Epic",         label: "Epic" },
  { key: "Rockstar",     label: "Rockstar" },
  { key: "EA",           label: "EA" },
];

const SORT_OPTIONS = [
  { value: "date_desc",  label: "Date (récent)" },
  { value: "date_asc",   label: "Date (ancien)" },
  { value: "price_asc",  label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "promo",      label: "Meilleures promos" },
];

// ─── Game Card — utilise les classes nk-blog-post du thème ─────────────────────
function GameCard({ game }) {
  const promo   = getPromo(game.retail, game.price);
  const price   = parseFloat(game.price);
  const retail  = parseFloat(game.retail);
  const type    = (game.type || "").toLowerCase();
  const isConsole = type.includes("playstation") || type.includes("ps5") || type.includes("ps4") ||
    type.includes("nintendo") || type.includes("switch") || type.includes("microsoft") ||
    type.includes("xbox") || type.includes("ubisoft") || type.includes("rockstar") ||
    type.includes("ea") || type.includes("origin") || type.includes("electronic arts");
  const steamId = isConsole ? 0 : (game.steam_id || 0);
  const path    = `/store/${game.id}/${steamId}/${cleanTitle(game.name)}`;

  return (
    <div className="col-md-6 col-lg-4">
      <div className="nk-blog-post">
        <Link to={path} className="nk-post-img">
          <img src={game.img} alt={game.name} />
          {promo && (
            <span className="nk-post-comments-count">{promo}</span>
          )}
        </Link>
        <div className="nk-gap" />
        <h2 className="nk-post-title h4">
          <Link to={path}>{game.name}</Link>
        </h2>
        <div className="nk-gap" />
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {game.releaseDate && <span>📅 {game.releaseDate}</span>}
          <span>🎮 {getPlatformKey(game.type)}</span>
          {(() => {
            const r = (game.region || "").toLowerCase();
            const isEU = r.includes("europe") || r.includes("fr");
            const isWW = r === "worldwide";
            const isUS = r.includes("us") && !r.includes("australia");
            if (!isEU && !isWW && !isUS) return null;
            return (
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: isEU ? "#27ae60" : isWW ? "#6666cc" : "#cc7700",
                opacity: 0.8,
              }}>
                {isEU ? "🇪🇺 EU" : isWW ? "🌍 WW" : "🇺🇸 US"}
              </span>
            );
          })()}
        </div>
        <div className="nk-gap" />
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          {retail > price && (
            <span className="priceOrigin" style={{ fontSize: 13 }}>{retail.toFixed(2)} €</span>
          )}
          {price > 0
            ? <span style={{ color: "#dd163b", fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16 }}>{price.toFixed(2)} €</span>
            : <span style={{ color: "#666" }}>N/A</span>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Pagination — utilise nk-pagination du thème ────────────────────────────────
function Pagination({ page, total, perPage, onChange }) {
  const numPages = Math.ceil(total / perPage);
  if (numPages <= 1) return null;

  const pages = [];
  const delta = 2;
  for (let i = 1; i <= numPages; i++) {
    if (i === 1 || i === numPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="nk-pagination nk-pagination-center">
      <button
        className="nk-pagination-prev"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        style={{ background: "none", border: "none", cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.3 : 1 }}
      >
        <span className="nk-icon-arrow-left" />
      </button>
      <nav>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`sep-${i}`} style={{ padding: "0 8px", color: "#555" }}>…</span>
          ) : (
            <a
              key={p}
              href="#!"
              className={p === page ? "nk-pagination-current" : ""}
              onClick={(e) => { e.preventDefault(); onChange(p); }}
            >
              {p}
            </a>
          )
        )}
      </nav>
      <button
        className="nk-pagination-next"
        disabled={page === numPages}
        onClick={() => onChange(page + 1)}
        style={{ background: "none", border: "none", cursor: page === numPages ? "default" : "pointer", opacity: page === numPages ? 0.3 : 1 }}
      >
        <span className="nk-icon-arrow-right" />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function Populaires() {
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [platform, setPlatform]   = useState("Tous");
  const [sort, setSort]           = useState("date_desc");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [showSort, setShowSort]   = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  const sortRef = useRef(null);
  const topRef  = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);

        // Populaires → jeux marqués "trending" dans Firebase
        if (catFilter === "topseller") {
          const snap = await getDocs(query(
            collection(db, "games"),
            where("trending", "==", true)
          ));
          const fbGames = snap.docs
            .map(d => ({ docId: d.id, ...d.data() }))
            .filter(g => g.trendingGame)
            .map(g => ({
              id: g.trendingGame.id,
              name: g.trendingGame.name,
              img: g.trendingGame.img,
              type: g.trendingGame.type,
              price: g.steamData?.price || "0.00",
              retail: g.steamData?.retail || "0.00",
              steam_id: g.steamData?.steam_appid || 0,
              region: "Europe",
              stock: 1,
            }));
          setAllGames(fbGames);
          return;
        }

        // Tous les autres filtres → catalogue complet
        const res  = await fetch(`${BACKEND_URL}/api/allgames`, {
          headers: { "User-Agent": "IG-ExportCatalog-Fetcher" },
        });
        const data = await res.json();
        if (!data || data.length === 0) { setAllGames([]); return; }
        setAllGames(data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les jeux.");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [catFilter]);

  useEffect(() => { setPage(1); }, [platform, sort, search]);

  const filtered = allGames
    .filter(g => {
      if ((g.region || "").toLowerCase().includes("latin")) return false;
      const region = (g.region || "").toLowerCase();
      if (region.includes("us") && !region.includes("australia")) return false;
      if (platform !== "Tous" && getPlatformKey(g.type) !== platform) return false;

      // Filtre catégorie
      if (catFilter === "preorder") {
        if (g.preorder !== 1) return false;
      } else if (catFilter === "upcoming") {
        // Prochaines sorties = jeux sans date de sortie connue
        if (g.releaseDate) return false;
      }

      if (search.trim()) {
        const ABBREV = {
          "gta 6": "grand theft auto vi",
          "gta vi": "grand theft auto vi",
          "gta 5": "grand theft auto v",
          "gta v": "grand theft auto v",
          "gta 4": "grand theft auto iv",
          "gta iv": "grand theft auto iv",
          "gta san andreas": "grand theft auto san andreas",
          "cod": "call of duty",
          "bf": "battlefield",
          "ac": "assassin's creed",
          "rdr": "red dead redemption",
          "rdr2": "red dead redemption 2",
          "ff": "final fantasy",
          "fifa": "ea sports fc",
          "pes": "efootball",
          "wow": "world of warcraft",
          "lol": "league of legends",
          "cs2": "counter-strike 2",
          "csgo": "counter-strike",
        };

        const normalize = (str) =>
          str.toLowerCase()
            .replace(/[:\-''\u2018\u2019!?.,]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const raw = normalize(search);
        const expanded = ABBREV[raw] || raw;
        const gameName = normalize(g.name);
        if (!gameName.includes(expanded) && !gameName.includes(raw)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === "date_desc")  return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      if (sort === "date_asc")   return new Date(a.releaseDate || 0) - new Date(b.releaseDate || 0);
      if (sort === "price_asc")  return parseFloat(a.price) - parseFloat(b.price);
      if (sort === "price_desc") return parseFloat(b.price) - parseFloat(a.price);
      if (sort === "promo") {
        const pA = getPromo(a.retail, a.price);
        const pB = getPromo(b.retail, b.price);
        return (pA ? parseInt(pA) : 0) - (pB ? parseInt(pB) : 0);
      }
      return 0;
    });

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handlePageChange = (p) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || "Trier";

  return (
    <div className="App">
      <Header />
      <div className="nk-main">
        <div ref={topRef} style={{ paddingTop: 100 }} />

        <div className="container">
          {/* ── Titre section ── */}
          <div className="row vertical-gap">
            <div className="col-lg-12">
              <h3 className="nk-decorated-h-2">
                <span>
                  <span className="text-main-1">Tendances</span> Récentes
                  {!loading && (
                    <span className="nk-badge" style={{ marginLeft: 12, fontSize: 11, verticalAlign: "middle" }}>
                      {filtered.length}
                    </span>
                  )}
                </span>
              </h3>

              <div className="nk-gap" />

              {/* ── Barre de filtres ── */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 20 }}>

                {/* Filtres catégorie */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, width: "100%", marginBottom: 4 }}>
                  {[
                    { key: "all",       label: "Tous",               icon: "🎮" },
                    { key: "topseller", label: "Populaires",         icon: "🔥" },
                    { key: "preorder",  label: "Précommandes",       icon: "⏳" },
                    { key: "upcoming",  label: "Prochaines sorties", icon: "📅" },
                  ].map(f => (
                    <label key={f.key} style={{
                      display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                      fontFamily: "Rajdhani, sans-serif", fontSize: 13, fontWeight: 600,
                      padding: "5px 14px", borderRadius: 20,
                      background: catFilter === f.key ? "rgba(221,22,59,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${catFilter === f.key ? "#dd163b" : "#333"}`,
                      color: catFilter === f.key ? "#dd163b" : "#aaa",
                      transition: "all 0.15s",
                    }} onClick={() => setCatFilter(f.key)}>
                      {f.icon} {f.label}
                    </label>
                  ))}
                </div>

                {/* Recherche */}
                <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 260 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Rechercher un jeu..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 12, fontSize: 13 }}
                  />
                </div>

                {/* Filtres plateforme */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PLATFORM_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setPlatform(f.key)}
                      className={platform === f.key
                        ? "nk-btn nk-btn-xs nk-btn-rounded nk-btn-color-main-1"
                        : "nk-btn nk-btn-xs nk-btn-rounded nk-btn-color-dark-3"
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Tri */}
                <div ref={sortRef} style={{ position: "relative", marginLeft: "auto" }}>
                  <button
                    className="nk-btn nk-btn-xs nk-btn-rounded nk-btn-color-dark-3"
                    onClick={() => setShowSort(v => !v)}
                  >
                    ⇅ {sortLabel}
                  </button>
                  {showSort && (
                    <div style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      background: "rgba(0,0,0,.92)",
                      border: "1px solid #293139",
                      borderBottom: "3px solid #dd163b",
                      borderRadius: 4,
                      minWidth: 180,
                      zIndex: 200,
                      overflow: "hidden",
                    }}>
                      {SORT_OPTIONS.map(o => (
                        <button
                          key={o.value}
                          onClick={() => { setSort(o.value); setShowSort(false); }}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            color: sort === o.value ? "#dd163b" : "#aaa",
                            fontSize: 12,
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: sort === o.value ? 700 : 400,
                            padding: "10px 16px",
                            cursor: "pointer",
                          }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Info résultats ── */}
              {!loading && !error && filtered.length > 0 && (
                <p style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>
                  Affichage {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} sur <strong style={{ color: "#888" }}>{filtered.length}</strong> résultats
                </p>
              )}

              {/* ── États ── */}
              {loading && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#555", fontFamily: "Montserrat, sans-serif", letterSpacing: 2 }}>
                  Chargement...
                </div>
              )}
              {error && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#dd163b" }}>{error}</div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#555", fontFamily: "Montserrat, sans-serif" }}>
                  Aucun jeu trouvé.
                </div>
              )}

              {/* ── Grille de jeux ── */}
              {!loading && !error && filtered.length > 0 && (
                <>
                  <div className="nk-blog-grid">
                    <div className="row vertical-gap">
                      {paginated.map(game => (
                        <GameCard key={game.id} game={game} />
                      ))}
                    </div>
                  </div>

                  <div className="nk-gap-2" />

                  <Pagination
                    page={page}
                    total={filtered.length}
                    perPage={PER_PAGE}
                    onChange={handlePageChange}
                  />
                </>
              )}

              <div className="nk-gap-2" />
            </div>
          </div>
        </div>
      </div>
      <div className="separator product-panel" />
      <Footer />
    </div>
  );
}

export default Populaires;