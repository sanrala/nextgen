import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";

const BACKEND_URL = "https://api.sm-artweb.fr";

// ── Animations ─────────────────────────────────────────────────────────────────
const expandWidth = keyframes`
  from { width: 36px; opacity: 0.6; }
  to   { width: 280px; opacity: 1; }
`;

// const collapseWidth = keyframes`
//   from { width: 280px; opacity: 1; }
//   to   { width: 36px;  opacity: 0.6; }
// `;

const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-8px) scaleY(0.92); }
  to   { opacity: 1; transform: translateY(0)   scaleY(1); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ── Styled Components ──────────────────────────────────────────────────────────

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  z-index: 1100;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  height: 36px;
  width: ${({ open }) => (open ? "280px" : "36px")};
  background: ${({ open }) =>
    open
      ? "rgba(10, 10, 15, 0.85)"
      : "rgba(255, 255, 255, 0.08)"};
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid ${({ open }) =>
    open ? "rgba(231, 76, 60, 0.5)" : "rgba(255,255,255,0.18)"};
  border-radius: ${({ open }) => (open ? "20px" : "50%")};
  transition:
    border-radius 0.35s ease,
    border-color 0.35s ease,
    background 0.35s ease;
  overflow: hidden;
  cursor: ${({ open }) => (open ? "default" : "pointer")};
  box-shadow: ${({ open }) =>
    open
      ? "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(231,76,60,0.15)"
      : "none"};

  ${({ open }) =>
    open
      ? css`animation: ${expandWidth} 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards;`
      : css``}
`;

const LoupeButton = styled.button`
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  min-width: 36px;
  height: 36px;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.2s ease, transform 0.25s ease;
  z-index: 2;

  &:hover {
    color: #e74c3c;
    transform: scale(1.1);
  }

  svg {
    width: 15px;
    height: 15px;
    pointer-events: none;
  }
`;

const Input = styled.input`
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: rgba(255, 255, 255, 0.92);
  font-family: "Montserrat", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0 10px 0 0;
  height: 100%;
  opacity: ${({ open }) => (open ? 1 : 0)};
  width: ${({ open }) => (open ? "100%" : "0")};
  transition: opacity 0.2s ease 0.15s;
  pointer-events: ${({ open }) => (open ? "auto" : "none")};

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
    font-weight: 500;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  flex-shrink: 0;
  margin-right: 4px;
  border-radius: 50%;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.12);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(231, 76, 60, 0.3);
  border-top-color: #e74c3c;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  flex-shrink: 0;
  margin-right: 8px;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: linear-gradient(
    160deg,
    rgba(12, 12, 18, 0.97) 0%,
    rgba(18, 18, 28, 0.96) 100%
  );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(231, 76, 60, 0.25);
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255,255,255,0.04);
  animation: ${fadeInDown} 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  max-height: 380px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(231, 76, 60, 0.35);
    border-radius: 2px;
  }
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.18s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(231, 76, 60, 0.1);
  }
`;

const GameThumb = styled.img`
  width: 46px;
  height: 28px;
  object-fit: cover;
  border-radius: 5px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.05);
`;

const GameInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const GameName = styled.div`
  font-family: "Montserrat", sans-serif;
  font-size: 0.73rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.03em;
`;

const GameMeta = styled.div`
  font-size: 0.63rem;
  color: rgba(255, 255, 255, 0.38);
  margin-top: 2px;
  font-family: "Montserrat", sans-serif;
`;

const GamePrice = styled.div`
  font-family: "Montserrat", sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  color: #e74c3c;
  white-space: nowrap;
  flex-shrink: 0;
`;

const NoResults = styled.div`
  padding: 20px 16px;
  text-align: center;
  font-family: "Montserrat", sans-serif;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.3);
  font-weight: 600;
  letter-spacing: 0.08em;
`;

const ResultsHeader = styled.div`
  padding: 8px 12px 6px;
  font-family: "Montserrat", sans-serif;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(231, 76, 60, 0.7);
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

// ── Component ──────────────────────────────────────────────────────────────────
export default function SearchBar() {
  const [open, setOpen]           = useState(false);
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [catalog, setCatalog]     = useState(null);
  const [showDrop, setShowDrop]   = useState(false);
  const inputRef                  = useRef(null);
  const wrapperRef                = useRef(null);
  const debounceRef               = useRef(null);
  const prefetchCache             = useRef({});
  const navigate                  = useNavigate();

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Prefetch catalog once when search opens ───────────────────────────────
  const fetchCatalog = useCallback(async () => {
    if (catalog) return catalog;
    try {
      const res  = await fetch(`${BACKEND_URL}/api/ig-catalog`);
      const data = await res.json();
      setCatalog(data);
      return data;
    } catch {
      return [];
    }
  }, [catalog]);

  // ── Open handler ──────────────────────────────────────────────────────────
  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 180);
    fetchCatalog();
  };

  // ── Close handler ────────────────────────────────────────────────────────
  const handleClose = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setShowDrop(false);
  };

  // ── Helpers pour dédupliquer les éditions ─────────────────────────────────
  // Extrait le nom de base d'un jeu (sans "Deluxe", "Ultimate", etc.)
  const getBaseName = (name) => {
    return name
      .replace(/[-–—].*$/i, "")                                        // tout après un tiret
      .replace(/\b(deluxe|ultimate|gold|premium|standard|complete|definitive|enhanced|remastered|anniversary|edition|pack|bundle|season pass|year one|goty|game of the year)\b.*$/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  };

  // Parmi les doublons d'une même base, garde le plus "standard" :
  // priorité : stock=1, puis moins de mots dans le nom (= moins d'éditions), puis prix bas
  // const deduplicateEditions = (games) => {
  //   const map = new Map();
  //   for (const g of games) {
  //     const base = getBaseName(g.name);
  //     const existing = map.get(base);
  //     if (!existing) {
  //       map.set(base, g);
  //     } else {
  //       // Préfère stock disponible
  //       if (g.stock === 1 && existing.stock === 0) { map.set(base, g); continue; }
  //       if (g.stock === 0 && existing.stock === 1) continue;
  //       // Préfère le nom le plus court (= édition standard / moins de mots)
  //       if (g.name.length < existing.name.length) { map.set(base, g); }
  //     }
  //   }
  //   return Array.from(map.values());
  // };

  // ── Search logic ──────────────────────────────────────────────────────────
  const doSearch = useCallback(async (q, cat) => {
    if (!q.trim()) { setResults([]); setShowDrop(false); return; }
    setLoading(true);
    setShowDrop(true);

    const data = cat || (await fetchCatalog());
    if (!data || !Array.isArray(data)) { setLoading(false); return; }

    const lower = q.toLowerCase();
 const matching = data.filter(
  (g) => g.name?.toLowerCase().includes(lower)
);

    // Déduplique par nom de base, mais en choisissant le meilleur igId :
    // priorité Europe en stock, puis stock=1, puis prix le plus bas
    const map = new Map();
    for (const g of matching) {
      const platform = (g.platform || g.type || "").toLowerCase();
const base = getBaseName(g.name) + "|" + platform;
      const existing = map.get(base);
      if (!existing) {
        map.set(base, g);
      } else {
        const gEu   = (g.region   || "").toLowerCase().includes("europe");
        const exEu  = (existing.region || "").toLowerCase().includes("europe");
        const gSt   = g.stock === 1;
        const exSt  = existing.stock === 1;
        // Préfère Europe en stock
        if (gEu && gSt && !(exEu && exSt)) { map.set(base, g); continue; }
        if (exEu && exSt) continue;
        // Puis stock disponible
        if (gSt && !exSt) { map.set(base, g); continue; }
        if (!gSt && exSt) continue;
        // Puis prix le plus bas
        if (parseFloat(g.price) < parseFloat(existing.price)) { map.set(base, g); }
      }
    }
    const deduped = Array.from(map.values());

    // Trie : commence par la query d'abord, puis contient
    const sorted = deduped.sort((a, b) => {
      if (b.stock !== a.stock) return b.stock - a.stock;
      const aStarts = a.name.toLowerCase().startsWith(lower) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(lower) ? 0 : 1;
      return aStarts - bStarts;
    });

    setResults(sorted.slice(0, 10));
    setLoading(false);
  }, [fetchCatalog]);

  // ── Debounced input ───────────────────────────────────────────────────────
  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); setShowDrop(false); return; }
    debounceRef.current = setTimeout(() => doSearch(val, catalog), 260);
  };

  // ── Navigate to game ─────────────────────────────────────────────────────
 const handleSelect = async (game) => {
  const slug = game.name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");

  const platform = (game.platform || game.type || "").toLowerCase();
  const isPS5 = platform.includes("ps5") || platform.includes("playstation");

  // Jeu PS5 → route dédiée sans steamId
  if (isPS5) {
    handleClose();
    navigate(`/store/${game.id}/0/${slug}`);
    return;
  }

  // Si steam_id déjà présent dans le catalogue enrichi → direct
  if (game.steam_id) {
    handleClose();
    navigate(`/store/${game.id}/${game.steam_id}/${slug}`);
    return;
  }

  // Utilise le cache prefetch si disponible (hover préalable)
  const cached = prefetchCache.current[game.id];
  if (cached) {
    handleClose();
    navigate(`/store/${game.id}/${cached}/${slug}`);
    return;
  }

  // Sinon fetch /api/editions pour récupérer le steam_id
  try {
    const res  = await fetch(`${BACKEND_URL}/api/editions/${game.id}`);
    const data = await res.json();
    const exact    = Array.isArray(data) && data.find(g => String(g.id) === String(game.id));
    const fallback = Array.isArray(data) && data.find(g => g.steam_id);
    const entry    = (exact?.steam_id ? exact : fallback) || null;
    const steamId  = entry?.steam_id || 0;
    handleClose();
    navigate(`/store/${game.id}/${steamId}/${slug}`);
  } catch {
    handleClose();
    navigate(`/store/${game.id}/0/${slug}`);
  }
};

  // ── ESC key ───────────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleClose();
  };

  return (
    <Wrapper ref={wrapperRef}>
      <SearchContainer open={open} onClick={!open ? handleOpen : undefined}>
        {/* Loupe icon */}
        <LoupeButton
          onClick={open ? undefined : handleOpen}
          aria-label="Rechercher"
          tabIndex={open ? -1 : 0}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <line x1="15.5" y1="15.5" x2="21" y2="21" />
          </svg>
        </LoupeButton>

        {/* Input */}
        <Input
          ref={inputRef}
          open={open}
          type="text"
          placeholder="Rechercher un jeu..."
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
        />

        {/* Spinner or clear */}
        {open && loading && <Spinner />}
        {open && !loading && query && (
          <ClearButton
            onClick={(e) => {
              e.stopPropagation();
              setQuery("");
              setResults([]);
              setShowDrop(false);
              inputRef.current?.focus();
            }}
            aria-label="Effacer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ClearButton>
        )}
      </SearchContainer>

      {/* Dropdown results */}
      {open && showDrop && (
        <Dropdown>
          {results.length > 0 ? (
            <>
              <ResultsHeader>{results.length} résultat{results.length > 1 ? "s" : ""}</ResultsHeader>
              {results.map((game) => {
                const price  = parseFloat(game.price);
                const retail = parseFloat(game.retail);
                const promo  = retail > price
                  ? `-${Math.round(((retail - price) / retail) * 100)}%`
                  : null;
                const platform = (game.platform || game.type || "").toLowerCase();

                return (
                  <ResultItem key={game.id} onClick={() => handleSelect(game)}>
                    <GameThumb
                      src={game.img}
                      alt={game.name}
                      onError={(e) => { e.target.style.opacity = 0.2; }}
                    />
                    <GameInfo>
                      <GameName>{game.name}</GameName>
                      {platform && (
                        <GameMeta>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          {promo && (
                            <span style={{
                              marginLeft: 6,
                              color: "#27ae60",
                              fontWeight: 700,
                            }}>
                              {promo}
                            </span>
                          )}
                        </GameMeta>
                      )}
                    </GameInfo>
                 <GamePrice style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", fontWeight: 600 }}>
  {parseFloat(game.price) > 0 ? `${parseFloat(game.price).toFixed(2)} €` : "Prochainement"}
</GamePrice>
                  </ResultItem>
                );
              })}
            </>
          ) : (
            !loading && <NoResults>Aucun résultat pour « {query} »</NoResults>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
}