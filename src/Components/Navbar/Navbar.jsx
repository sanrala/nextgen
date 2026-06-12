import React, { useEffect, useRef } from "react";
import logo from "./../../assets/images/logoGames/logo.png";
import { Link } from "react-router-dom";
import Burger from "./Burger";
import SearchBar from "./SearchBar";
import { useAdmin } from "../../useAdmin";
// import { signOut } from "firebase/auth";
// import { auth } from "../../Firebase";

function NavBar() {
  const { user, isAdmin } = useAdmin();
  const navRef = useRef(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    nav.style.setProperty('background', 'transparent', 'important');
    nav.style.setProperty('background-color', 'transparent', 'important');
    nav.style.setProperty('box-shadow', 'none', 'important');
    nav.style.setProperty('border-bottom', 'none', 'important');
    nav.style.setProperty('position', 'fixed', 'important');
    nav.style.setProperty('top', '0', 'important');
    nav.style.setProperty('left', '0', 'important');
    nav.style.setProperty('right', '0', 'important');
    nav.style.setProperty('z-index', '1000', 'important');
    nav.style.setProperty('transition', 'background 0.3s ease, backdrop-filter 0.3s ease', 'important');

    const handleScroll = () => {
      if (window.scrollY > 10) {
        nav.style.setProperty('background', 'rgba(10, 10, 15, 0.88)', 'important');
        nav.style.setProperty('backdrop-filter', 'blur(14px)', 'important');
        nav.style.setProperty('-webkit-backdrop-filter', 'blur(14px)', 'important');
        nav.style.setProperty('box-shadow', '0 2px 24px rgba(0,0,0,0.5)', 'important');
      } else {
        nav.style.setProperty('background', 'transparent', 'important');
        nav.style.setProperty('background-color', 'transparent', 'important');
        nav.style.setProperty('backdrop-filter', 'none', 'important');
        nav.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        nav.style.setProperty('box-shadow', 'none', 'important');
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
      <nav ref={navRef} className="nk-navbar nk-navbar-top nk-navbar-sticky nk-navbar-autohide">
        <div className="container">
          <div className="nk-nav-table" style={{ minHeight: "70px" }}>
            <Link to={{ pathname: `/` }} className="nk-nav-logo">
              <img src={logo} alt="NextGen" width="199" />
            </Link>

            <ul
              className="nk-nav nk-nav-right d-none d-lg-table-cell"
              data-nav-mobile="#nk-nav-mobile"
            >
              <li><Link to={{ pathname: `/actualites/` }}>Actualités</Link></li>
              <li><Link to="/Catalogues?catFilter=nouveautes">Nouveautés</Link></li>
              <li><Link to="/Catalogues?catFilter=topseller">Populaires</Link></li>
              <li><Link to="/Catalogues?catFilter=preorder">Précommandes</Link></li>
            
              <li>
                {user ? (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {isAdmin && (
                      <Link to="/admin" style={{
                        fontSize:"10px", fontWeight:800, letterSpacing:"0.1em",
                        color:"#dd163b", border:"1px solid rgba(221,22,59,0.4)",
                        borderRadius:"4px", padding:"4px 10px", textTransform:"uppercase",
                        textDecoration:"none"
                      }}>Admin</Link>
                    )}
                    <Link to={`/profile/${user.uid}`} style={{ display:"inline-block", lineHeight:0 }}>
                      <img
                        src={user.photoURL || "https://zupimages.net/up/24/22/cib6.png"}
                        alt="avatar"
                        style={{ width:32, height:32, borderRadius:8, border:"2px solid rgba(221,22,59,0.5)", cursor:"pointer", objectFit:"cover" }}
                        title="Mon profil"
                      />
                    </Link>
                  </div>
                ) : (
                  <Link to="/Login">Connexion</Link>
                )}
              </li>
            </ul>

            {/* SearchBar — positionnée absolument à droite, par-dessus les liens quand ouverte */}
            <div
              className="d-none d-lg-block"
              style={{ position: "absolute", right: "50px", top: "50%", transform: "translateY(-50%)", zIndex: 1200 }}
            >
              <SearchBar />
            </div>

            <ul className="nk-nav nk-nav-right nk-nav-icons">
              <Burger />
            </ul>
          </div>
        </div>
      </nav>
  );
}

export default NavBar;