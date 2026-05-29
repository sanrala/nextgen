import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "./../../features/userSlice";
import { auth } from "./../../Firebase";
import { Avatar } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import gamesData from "../../games.json";

const Ul = styled.ul`
  list-style: none;
  display: none;
  flex-flow: row nowrap;
  margin: 0;
  padding: 0;

  @media (max-width: 1279px) {
    flex-flow: column nowrap;
    align-items: stretch;
    position: fixed;
    transform: ${({ open }) => (open ? "translateX(0)" : "translateX(100%)")};
    top: 0;
    right: 0;
    height: auto;
    min-height: unset;
    width: 260px;
    padding: 1rem 0 1.5rem 0;
    transition: transform 0.3s ease-in-out;
    display: flex;
    background: linear-gradient(135deg, rgba(10, 10, 15, 0.97) 0%, rgba(20, 20, 30, 0.95) 100%);
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    border-left: 1px solid rgba(231, 76, 60, 0.3);
    box-shadow: -10px 0 60px rgba(0, 0, 0, 0.8);
    border-radius: 0 0 0 16px;
    z-index: 999;
    overflow-y: auto;

    li {
      padding: 2px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    li:last-child {
      border-bottom: none;
    }

    a {
      display: block;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 12px;
      border: 1px solid transparent;
      transition: all 0.3s ease;
      position: relative;
    }

    a::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 0%;
      background: #e74c3c;
      border-radius: 0 3px 3px 0;
      transition: height 0.3s ease;
    }

    a:hover::before {
      height: 60%;
    }

    a:hover {
      color: #ffffff;
      background: rgba(231, 76, 60, 0.08);
      border-color: rgba(231, 76, 60, 0.2);
      padding-left: 30px;
    }
  }
`;

const CloseButton = styled.button`
  display: none;

  @media (max-width: 1279px) {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: flex-end;
    margin: 0 16px 8px auto;
    background: rgba(231, 76, 60, 0.15);
    border: 1px solid rgba(231, 76, 60, 0.4);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(231, 76, 60, 0.4);
      border-color: #e74c3c;
    }
  }
`;

const SearchButton = styled.button`
  background: rgba(231, 76, 60, 0.15);
  border: 1px solid rgba(231, 76, 60, 0.4);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  margin: 4px auto;

  &:hover {
    background: rgba(231, 76, 60, 0.35);
    border-color: #e74c3c;
    transform: scale(1.1);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 8px 12px;
  color: white;
  font-size: 0.8rem;
  margin-top: 6px;
  outline: none;
  transition: border 0.3s ease;

  &:focus {
    border-color: rgba(231, 76, 60, 0.6);
    background: rgba(255, 255, 255, 0.09);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`;

const SearchResults = styled.div`
  margin-top: 6px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);

  a {
    font-size: 0.7rem !important;
    letter-spacing: 0.1em !important;
    padding: 8px 12px !important;
    border-radius: 0 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
  }
`;

const RightNav = ({ open, setOpen }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleSignOut = () => {
    auth.signOut().then(() => dispatch(logout()));
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchToggle = () => setSearchOpen(!searchOpen);

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 0) {
      const results = gamesData.filter((game) =>
        game.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="burgerNav">
      <Ul open={open}>

        {/* Bouton fermer */}
        <CloseButton onClick={() => setOpen(false)}>✕</CloseButton>

        <li><Link to="/actualites" onClick={() => setOpen(false)}>Actualités</Link></li>
        <li><Link to="/Sorties" onClick={() => setOpen(false)}>Nouveautés</Link></li>
        <li><Link to="/Populaires" onClick={() => setOpen(false)}>Populaires</Link></li>
        <li><Link to="/PrecoFull" onClick={() => setOpen(false)}>Précommandes</Link></li>

        <li>
          {user ? (
            <>
              <Avatar
                src={auth.currentUser?.photoURL}
                onClick={handleMenuOpen}
                style={{ cursor: "pointer", border: "2px solid rgba(231,76,60,0.5)", margin: "8px auto" }}
              />
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}><Link to="/profile">Profil</Link></MenuItem>
                <MenuItem onClick={handleMenuClose}><Link to="/settings">Paramètres</Link></MenuItem>
                <MenuItem onClick={() => { handleSignOut(); handleMenuClose(); }}>Déconnexion</MenuItem>
              </Menu>
            </>
          ) : (
            <Link to="/Login" onClick={() => setOpen(false)}>Connexion</Link>
          )}
        </li>

        <li>
          <SearchButton onClick={handleSearchToggle}>🔍</SearchButton>
          {searchOpen && (
            <>
              <SearchInput
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Rechercher..."
              />
              {searchResults.length > 0 && (
                <SearchResults>
                  {searchResults.map((result) => (
                    <div key={result.id}>
                      <Link to={`/PC/${result.id}/${result.title}`} onClick={() => setOpen(false)}>
                        {result.title}
                      </Link>
                    </div>
                  ))}
                </SearchResults>
              )}
            </>
          )}
        </li>

      </Ul>
    </div>
  );
};

export default RightNav;