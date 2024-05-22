import React, { useState } from "react";
import logo from "./../../assets/images/logoGames/logo.png";
import { Link } from "react-router-dom";
function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <nav class="nk-navbar nk-navbar-top nk-navbar-sticky nk-navbar-autohide">
        <div class="container">
          <div class="nk-nav-table">
            <Link
              to={{
                pathname: `/`,
                // Passer les données de l'élément à la page BlocArticle
              }}
              class="nk-nav-logo"
            >
              <img src={logo} alt="NextGen" width="199" />
            </Link>

            <ul
              class="nk-nav nk-nav-right d-none d-lg-table-cell"
              data-nav-mobile="#nk-nav-mobile"
            >
              <li>
              <Link

to={{
  pathname: `/actualités/`,

}}>Actualités</Link>
              </li>
              <li>
                <a href="">Populaires</a>
              </li>
              <li>
                <a href="">Précommandes</a>
              </li>
              <li>
                <a href="">Meilleures ventes</a>
              </li>
            </ul>
            <ul class="nk-nav nk-nav-right nk-nav-icons">
              <li class="single-icon d-lg-none">
                <a
                  href="#"
                  class="no-link-effect"
                  data-nav-toggle="#nk-nav-mobile"
                >
                  <span
                    class={`nk-icon-burger ${isOpen ? "open" : ""}`}
                    onClick={toggleMenu}
                  >
                    <span class="nk-t-1"></span>
                    <span class="nk-t-2"></span>
                    <span class="nk-t-3"></span>
                  </span>
                </a>
                <div className={`menu ${isOpen ? "open" : ""}`}>
                  <div className="close-icon" onClick={toggleMenu}>
                    <div className="close-line"></div>
                    <div className="close-line"></div>
                  </div>
            
                  <ul>
                  <li>
                <a href="">Actualités</a>
              </li>
              <li>
                <a href="">Populaires</a>
              </li>
              <li>
                <a href="">Précommandes</a>
              </li>
              <li>
                <a href="">Meilleures ventes</a>
              </li>
                    <li>
                      <a href="">Mon compte</a>
                    </li>
                    
                  </ul>
                 
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
