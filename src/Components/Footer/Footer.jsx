import React from "react";
import { Link } from "react-router-dom";
import logo from "./../../assets/images/logoGames/logo.png";
import instantgaming from "./../../assets/images/logoGames/instantgaming.png";
import "./Footer.css";

function Footer() {
  return (


    
    <footer className="f-root">

      {/* Radar background */}
      <svg className="f-radar" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <circle cx="500" cy="500" r="80"  fill="none" stroke="#cc1818" strokeWidth="1"/>
        <circle cx="500" cy="500" r="150" fill="none" stroke="#cc1818" strokeWidth="1"/>
        <circle cx="500" cy="500" r="220" fill="none" stroke="#cc1818" strokeWidth="1"/>
        <circle cx="500" cy="500" r="290" fill="none" stroke="#cc1818" strokeWidth="1"/>
        <line x1="500" y1="0"   x2="500" y2="500" stroke="#cc1818" strokeWidth="0.5"/>
        <line x1="0"   y1="500" x2="500" y2="500" stroke="#cc1818" strokeWidth="0.5"/>
      </svg>

      <div className="f-topbar" />

      <div className="f-wrap">

        {/* MAIN */}
        <div className="f-main">

          {/* Brand */}
          <div>
            <Link to="/" className="f-brand-logo">
              <img src={logo} alt="NextGen Gaming" />
            </Link>
            <p className="f-brand-desc">
              La plateforme gaming de référence — actualités, bons plans et communauté passionnée.
            </p>
            {/* <div className="f-socials">
              <Link to="#" className="f-soc ig" aria-label="Instagram">
                <i className="ti ti-brand-instagram" aria-hidden="true" />
              </Link>
              <Link to="#" className="f-soc tw" aria-label="Twitter / X">
                <i className="ti ti-brand-x" aria-hidden="true" />
              </Link>
            </div> */}
          </div>

          {/* Nav */}
          <nav className="f-nav">
            <div className="f-nav-col">
              <h5>Navigation</h5>
              <Link to="/">Accueil</Link>
              <Link to="/Catalogues">Catalogue</Link>
              <Link to="//Catalogues?catFilter=nouveautes">Nouveautés</Link>
              <Link to="/Catalogues?catFilter=preorder">Précommandes</Link>
              <Link to="/Catalogues?platform=CartesCadeaux">Cartes Cadeaux</Link>
            </div>
            {/* <div className="f-nav-col">
              <h5>À propos</h5>
              <Link to="/about">Qui sommes-nous</Link>
              <Link to="/actualites">Actualités</Link>
              <Link to="/contact">Contact</Link>
            </div> */}
          </nav>

          {/* Partner card */}
          <div className="pc">
            <div className="pc-label">Partenaire officiel</div>
            <Link to="#" className="pc-link">
              <img src={instantgaming} alt="Instant Gaming" className="pc-img" />
              <div className="pc-sep" />
              <div className="pc-texts">
                <span className="pc-name">Instant Gaming</span>
                <span className="pc-sub">Jeux PC &amp; consoles</span>
              </div>
              <i className="ti ti-arrow-up-right pc-arrow" aria-hidden="true" />
            </Link>
            <div className="pc-note">
              <i className="ti ti-info-circle" aria-hidden="true" />
              <span>Les prix affichés proviennent d'Instant Gaming, pas de NextGen.</span>
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="f-bottom">
          <div className="f-copy">
            <span className="f-copy-dot" />
            <strong>NextGen Gaming</strong>
            <span>© 2024 — Tous droits réservés</span>
          </div>
          <div className="f-legal">
            <Link to="/confidentialite">Confidentialité</Link>
            <Link to="/cgu">CGU</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;