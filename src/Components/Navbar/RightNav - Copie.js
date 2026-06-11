import React, { useState, useCallback, useRef } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "./../../features/userSlice";
import { auth } from "./../../Firebase";
import { Avatar } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const BACKEND_URL = "https://api.sm-artweb.fr";

/* OVERLAY */
const Overlay = styled.div`
  display: none;
  @media (max-width: 1279px) {
    display: ${({ open }) => (open ? "block" : "none")};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 998;
  }
`;

/* MENU */
const Ul = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  li { padding: 0 4px; }

  a {
    color: rgba(255,255,255,0.85);
    text-decoration: none;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 8px 16px;
    border-radius: 50px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(12px);
    transition: all 0.3s ease;
  }

  a:hover {
    color: #fff;
    background: rgba(231,76,60,0.15);
    border-color: rgba(231,76,60,0.4);
  }

  @media (max-width: 1279px) {
    flex-flow: column nowrap;
    align-items: stretch;
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 280px;
    transform: ${({ open }) => open ? "translateX(0)" : "translateX(100%)"};
    transition: transform 0.3s ease-in-out;
    background: linear-gradient(135deg, rgba(10,10,15,0.97), rgba(20,20,30,0.95));
    backdrop-filter: blur(30px);
    border-left: 1px solid rgba(231,76,60,0.3);
    box-shadow: -10px 0 60px rgba(0,0,0,0.8);
    z-index: 999;
    overflow-y: auto;
    padding-top: 8px;

    li {
      padding: 2px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    a {
      display: block;
      padding: 12px 24px;
      border-radius: 12px;
      background: transparent;
      border: none;
      position: relative;
    }

    a::before {
      content: "";
      position: absolute;
      left: 0; top: 50%;
      transform: translateY(-50%);
      width: 3px; height: 0%;
      background: #e74c3c;
      transition: height 0.3s ease;
    }

    a:hover::before { height: 60%; }
    a:hover { padding-left: 30px; background: rgba(231,76,60,0.08); }
  }
`;

/* BOUTON FERMER */
const CloseBtn = styled.button`
  display: none;
  @media (max-width: 1279px) {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px 16px 8px auto;
    background: rgba(231,76,60,0.2);
    border: 1px solid rgba(231,76,60,0.5);
    border-radius: 50%;
    width: 36px; height: 36px;
    color: white; cursor: pointer;
    &:hover { background: #e74c3c; }
  }
`;

/* RECHERCHE MOBILE */
const SearchSection = styled.div`
  display: none;
  @media (max-width: 1279px) {
    display: block;
    padding: 8px 16px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 0 12px;
  height: 42px;
  &:focus-within {
    border-color: rgba(231,76,60,0.5);
    background: rgba(255,255,255,0.09);
  }
`;

const SearchIcon = styled.span`
  color: rgba(255,255,255,0.4);
  display: flex; align-items: center; flex-shrink: 0;
  svg { width: 15px; height: 15px; }
`;

const SearchInput = styled.input`
  flex: 1; background: none; border: none; outline: none;
  color: white; font-size: 0.82rem; font-weight: 500;
  &::placeholder { color: rgba(255,255,255,0.3); }
`;

const SearchResults = styled.div`
  margin-top: 6px; border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  max-height: 220px; overflow-y: auto;
`;

const ResultItem = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.15s;
  &:hover { background: rgba(231,76,60,0.1); }
  &:last-child { border-bottom: none; }
`;

const ResultThumb = styled.img`
  width: 42px; height: 26px; object-fit: cover; border-radius: 4px; flex-shrink: 0;
`;

const ResultName = styled.div`
  flex: 1; font-size: 0.72rem; font-weight: 600;
  color: rgba(255,255,255,0.88);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const ResultPrice = styled.div`
  font-size: 0.7rem; font-weight: 800; color: #e74c3c; flex-shrink: 0;
`;

const RightNav = ({ open, setOpen }) => {
  const [anchorEl, setAnchorEl]           = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [catalog, setCatalog]             = useState(null);
  const debounceRef                       = useRef(null);
  const prefetchCache                     = useRef({});
  const dispatch                          = useDispatch();
  const user                              = useSelector(selectUser);
  const navigate                          = useNavigate();

  const handleSignOut = () => { auth.signOut().then(() => dispatch(logout())); };

  const fetchCatalog = useCallback(async () => {
    if (catalog) return catalog;
    try {
      const res  = await fetch(`${BACKEND_URL}/api/ig-catalog`);
      const data = await res.json();
      setCatalog(data);
      return data;
    } catch { return []; }
  }, [catalog]);

  const handleSearchChange = useCallback(async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(debounceRef.current);
    if (!q.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      const data = await fetchCatalog();
      if (!Array.isArray(data)) return;
      const lower = q.toLowerCase();
      setSearchResults(
       data.filter(g => g.name?.toLowerCase().includes(lower)).slice(0, 8)
      );
    }, 260);
  }, [fetchCatalog]);

  const handleHover = useCallback((game) => {
    if (prefetchCache.current[game.id] !== undefined) return;
    prefetchCache.current[game.id] = null;
    fetch(`${BACKEND_URL}/api/steamid/${game.id}`)
      .then(r => r.json())
      .then(d => { prefetchCache.current[game.id] = d.steamId || 0; })
      .catch(() => { prefetchCache.current[game.id] = 0; });
  }, []);

  const handleSelect = useCallback(async (game) => {
    const slug = game.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
    setOpen(false); setSearchQuery(""); setSearchResults([]);
    const cached = prefetchCache.current[game.id];
    const steamId = cached || await fetch(`${BACKEND_URL}/api/steamid/${game.id}`)
      .then(r => r.json()).then(d => d.steamId || 0).catch(() => 0);
    navigate(`/store/${game.id}/${steamId}/${slug}`);
  }, [navigate, setOpen]);

  return (
    <>
      <Overlay open={open} onClick={() => setOpen(false)} />

      <Ul open={open}>
        {/* Bouton fermer */}
        <CloseBtn onClick={() => setOpen(false)}>✕</CloseBtn>

        {/* Recherche — mobile uniquement via CSS, au-dessus des liens */}
        <li style={{ padding: 0, border: "none" }}>
          <SearchSection>
            <SearchRow>
              <SearchIcon>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <line x1="15.5" y1="15.5" x2="21" y2="21" />
                </svg>
              </SearchIcon>
              <SearchInput
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Rechercher un jeu..."
              />
              {searchQuery && (
                <SearchIcon style={{ cursor: "pointer" }} onClick={() => { setSearchQuery(""); setSearchResults([]); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </SearchIcon>
              )}
            </SearchRow>
            {searchResults.length > 0 && (
              <SearchResults>
                {searchResults.map(game => (
                  <ResultItem key={game.id} onClick={() => handleSelect(game)} onMouseEnter={() => handleHover(game)}>
                    <ResultThumb src={game.img} alt={game.name} onError={e => { e.target.style.opacity = 0.2; }} />
                    <ResultName>{game.name}</ResultName>
                    <ResultPrice>{parseFloat(game.price).toFixed(2)} €</ResultPrice>
                  </ResultItem>
                ))}
              </SearchResults>
            )}
          </SearchSection>
        </li>

        {/* Liens */}
        <li><Link to="/actualites" onClick={() => setOpen(false)}>Actualités</Link></li>
        <li><Link to="/Catalogues?catFilter=nouveautes" onClick={() => setOpen(false)}>Nouveautés</Link></li>
        <li><Link to="/Catalogues?catFilter=topseller" onClick={() => setOpen(false)}>Populaires</Link></li>
        <li><Link to="/Catalogues?catFilter=preorder" onClick={() => setOpen(false)}>Précommandes</Link></li>

        <li>
          {user ? (
            <>
              <Avatar
                src={auth.currentUser?.photoURL}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                style={{ cursor: "pointer", border: "2px solid rgba(231,76,60,0.5)", marginLeft: "10px" }}
              />
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem><Link to="/profile">Profil</Link></MenuItem>
                <MenuItem><Link to="/settings">Paramètres</Link></MenuItem>
                <MenuItem onClick={handleSignOut}>Déconnexion</MenuItem>
              </Menu>
            </>
          ) : (
            <Link to="/Login" onClick={() => setOpen(false)}>Connexion</Link>
          )}
        </li>
      </Ul>
    </>
  );
};

export default RightNav;