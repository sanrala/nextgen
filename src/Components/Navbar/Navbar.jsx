import React, { useState, useEffect } from "react";
import logo from "./../../assets/images/logoGames/logo.png";
import { Link } from "react-router-dom";
import Burger from "./Burger";

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <nav className={`nk-navbar nk-navbar-top nk-navbar-sticky nk-navbar-autohide${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <div className="nk-nav-table">
            <Link to={{ pathname: `/` }} className="nk-nav-logo">
              <img src={logo} alt="NextGen" width="199" />
            </Link>

            <ul
              className="nk-nav nk-nav-right d-none d-lg-table-cell"
              data-nav-mobile="#nk-nav-mobile"
            >
              <li>
                <Link to={{ pathname: `/actualités/` }}>Actualités</Link>
              </li>
              <li>
                <Link to={{ pathname: `/Sorties/` }}>Nouveautés</Link>
              </li>
              <li>
                <Link to={{ pathname: `/Populaires/` }}>Populaires</Link>
              </li>
              <li>
                <Link to={{ pathname: `/PrecoFull/` }}>Précommandes</Link>
              </li>
            </ul>

            <ul className="nk-nav nk-nav-right nk-nav-icons">
              <Burger />
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;