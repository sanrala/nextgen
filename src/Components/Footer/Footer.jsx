import React from "react";
import { Link } from "react-router-dom";
import logo from "./../../assets/images/logoGames/logo.png";
import instantgaming from "./../../assets/images/logoGames/instantgaming.png";
import "./Footer.css";

function Footer() {
  return (
    <footer className="f-root">

      {/* Radar background */}
      <svg className="f-radar" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <circle cx="300" cy="300" r="70"  fill="none" stroke="#cc1818" strokeWidth="1"/>
        <circle cx="300" cy="300" r="130" fill="none" stroke="#cc1818" strokeWidth="1"/>
        <circle cx="300" cy="300" r="190" fill="none" stroke="#cc1818" strokeWidth="1"/>
        <circle cx="300" cy="300" r="250" fill="none" stroke="#cc1818" strokeWidth="1"/>
        <circle cx="300" cy="300" r="295" fill="none" stroke="#cc1818" strokeWidth="1"/>
        <line x1="300" y1="5"   x2="300" y2="595" stroke="#cc1818" strokeWidth="0.5"/>
        <line x1="5"   y1="300" x2="595" y2="300" stroke="#cc1818" strokeWidth="0.5"/>
      </svg>

      <div className="f-topbar" />

      <div className="f-wrap">

        {/* MAIN : brand + nav */}
        <div className="f-main">

          <div>
            <Link to="/" className="f-brand-logo">
              <img src={logo} alt="NextGen Gaming" />
            </Link>
            <p className="f-brand-desc">
              La plateforme gaming de référence — actualités, bons plans et communauté passionnée.
            </p>
            <div className="f-socials">
              <Link to="#" className="f-soc" aria-label="Instagram">
                <i className="ti ti-brand-instagram" aria-hidden="true" />
              </Link>
              <Link to="#" className="f-soc" aria-label="Twitter / X">
                <i className="ti ti-brand-x" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <nav className="f-nav">
            <div className="f-nav-col">
              <h5>Navigation</h5>
              <Link to="/">Accueil</Link>
              <Link to="/catalogue">Catalogue</Link>
              <Link to="/nouveautes">Nouveautés</Link>
              <Link to="/promotions">Promotions</Link>
            </div>
            <div className="f-nav-col">
              <h5>À propos</h5>
              <Link to="/about">Qui sommes-nous</Link>
              <Link to="/actualites">Actualités</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </nav>
        </div>

        {/* PARTNER */}
        <div className="f-partner">
          <div className="f-partner-left">
            <span className="f-partner-tag">Partenaire<br/>officiel</span>
            <Link to="#" className="f-partner-badge">
              <img src={instantgaming} alt="Instant Gaming" className="f-partner-img" />
              <div className="f-partner-divider" />
              <div className="f-partner-info">
                <span className="f-partner-name">Instant Gaming</span>
                <span className="f-partner-sub">Jeux PC &amp; consoles au meilleur prix</span>
              </div>
              <i className="ti ti-arrow-up-right f-partner-arrow" aria-hidden="true" />
            </Link>
          </div>
          <div className="f-partner-note">
            <i className="ti ti-info-circle f-partner-note-icon" aria-hidden="true" />
            <p className="f-partner-note-text">
              Les prix affichés proviennent d'Instant Gaming, pas de NextGen.
            </p>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="f-bottom">
          <div className="f-copy">
            <span className="f-copy-dot" />
            <strong>NextGen Gaming</strong>
            <span className="f-copy-year">© 2024 — Tous droits réservés</span>
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