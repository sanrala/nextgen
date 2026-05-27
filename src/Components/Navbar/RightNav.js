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

  li {
    padding: 18px 10px;
  }

  @media (max-width: 1279px) {
    flex-flow: column nowrap;
    align-items: center;
    backdrop-filter: blur(60px);
    border-radius: 10px;
    border-left: 1px solid #666;
    position: fixed;
    transform: ${({ open }) => (open ? "translateX(0)" : "translateX(100%)")};
    top: 0;
    right: 0;
    height: 50vh;
    width: 250px;
    padding-top: 3.5rem;
    transition: transform 0.3s ease-in-out;
    display: flex;

    li {
      color: white;
    }

    a {
      color: white;
      text-decoration: none;
    }

    a:hover {
      color: #e74c3c;
    }
  }
`;

const RightNav = ({ open }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    auth.signOut().then(() => {
      dispatch(logout());
    });
  };

  // SEARCH
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
  };

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
        <div>
          <li><Link to="/actualites">Actualités</Link></li>
          <li><Link to="/Sorties">Nouveautés</Link></li>
          <li><Link to="/Populaires">Populaires</Link></li>
          <li><Link to="/PrecoFull">Précommandes</Link></li>

          <li>
            {user ? (
              <>
                <Avatar
                  src={auth.currentUser?.photoURL}
                  onClick={handleMenuOpen}
                  style={{ cursor: "pointer" }}
                />

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleMenuClose}>
                    <Link to="/profile">Profil</Link>
                  </MenuItem>

                  <MenuItem onClick={handleMenuClose}>
                    <Link to="/settings">Paramètres</Link>
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleSignOut();
                      handleMenuClose();
                    }}
                  >
                    Déconnexion
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Link to="/Login">Connexion</Link>
            )}
          </li>

          {/* SEARCH */}
          <li>
            <button onClick={handleSearchToggle}>
              🔍
            </button>

            {searchOpen && (
              <div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Rechercher..."
                />

                <div>
                  {searchResults.map((result) => (
                    <div key={result.id}>
                      <Link to={`/PC/${result.id}/${result.title}`}>
                        {result.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </li>

        </div>
      </Ul>
    </div>
  );
};

export default RightNav;