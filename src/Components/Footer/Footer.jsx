import React from "react";
import { Link } from "react-router-dom";
import logo from "./../../assets/images/logoGames/logo.png";
import logoGlitch from "./../../assets/video/logo-glitch.mp4";
import "./Footer.css";

function Footer() {
  return (
    <footer className="f-root">

      {/* Radar background */}
      <svg className="f-radar" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
        <circle cx="500" cy="500" r="80" fill="none" stroke="#cc1818" strokeWidth="1" />
        <circle cx="500" cy="500" r="150" fill="none" stroke="#cc1818" strokeWidth="1" />
        <circle cx="500" cy="500" r="220" fill="none" stroke="#cc1818" strokeWidth="1" />
        <circle cx="500" cy="500" r="290" fill="none" stroke="#cc1818" strokeWidth="1" />
        <line x1="500" y1="0" x2="500" y2="500" stroke="#cc1818" strokeWidth="0.5" />
        <line x1="0" y1="500" x2="500" y2="500" stroke="#cc1818" strokeWidth="0.5" />
      </svg>

      <div className="f-topbar" />

      <div className="f-wrap">

        {/* MAIN */}
        <div className="f-main">

          {/* Brand */}
          <div className="f-brand">
            <Link to="/" className="f-brand-logo">
              <img src={logo} alt="NextGen Gaming" />
            </Link>
            <p className="f-brand-desc">
              La plateforme gaming de r&eacute;f&eacute;rence - actualit&eacute;s, bons plans et communaut&eacute; passionn&eacute;e.
            </p>
            <div className="f-brand-highlights" aria-label="Points forts NextGen Gaming">
              <span>
                <strong>Actus</strong>
                <small>gaming</small>
              </span>
              <span>
                <strong>Bons plans</strong>
                <small>jeux &amp; cartes</small>
              </span>
              <span>
                <strong>Communaut&eacute;</strong>
                <small>passionn&eacute;e</small>
              </span>
            </div>
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
          <div>
            <h5 className="f-nav-heading">Navigation</h5>
            <nav className="f-nav-links">
              <Link to="/">Accueil</Link>
              <Link to="/Catalogues">Catalogue</Link>
              <Link to="/Catalogues?catFilter=nouveautes">Nouveaut&eacute;s</Link>
              <Link to="/Catalogues?catFilter=preorder">Pr&eacute;commandes</Link>
              <Link to="/Catalogues?platform=CartesCadeaux">Cartes Cadeaux</Link>
            </nav>
          </div>

          {/* Partner card */}
          <div className="pc">
            <div className="pc-label">Partenaire officiel</div>
            <Link to="#" className="pc-link">
              <div className="pc-img-wrap">
                <video
                  className="pc-img-video"
                  src={logoGlitch}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
              </div>
              <div className="pc-sep" />
              <div className="pc-texts">
                <span className="pc-name">Instant Gaming</span>
                <span className="pc-sub">Jeux PC &amp; consoles</span>
              </div>
            </Link>
            <p className="pc-note">
              <i className="ti ti-info-circle" aria-hidden="true" />
              <span>Les prix affich&eacute;s proviennent d'Instant Gaming, pas de NextGen.</span>
            </p>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="f-bottom">
          <div className="f-copy">
            <span className="f-copy-dot" />
            <strong>NextGen Gaming</strong>
            <span>&copy; 2024 - Tous droits r&eacute;serv&eacute;s</span>
          </div>
          <div className="f-legal">
            <Link to="/confidentialite">Confidentialit&eacute;</Link>
            <Link to="/cgu">CGU</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
