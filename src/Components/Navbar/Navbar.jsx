import React, { useEffect, useRef, useState } from "react";
import logo from "./../../assets/images/logoGames/logo.png";
import { Link, useNavigate } from "react-router-dom";
import Burger from "./Burger";
import SearchBar from "./SearchBar";
import { useAdmin } from "../../useAdmin";
import { signOut } from "firebase/auth";
import { auth, db } from "../../Firebase";
import { doc, getDoc } from "firebase/firestore";
import { GAMING_AVATARS } from "../Profile/avatars";

function NavBar() {
  const { user, isAdmin } = useAdmin();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const [profileAvatar, setProfileAvatar] = useState(null);
  const [profileName,   setProfileName]   = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setProfileAvatar(snap.data().photoURL || GAMING_AVATARS[0].url);
          setProfileName(snap.data().displayName || null);
        } else {
          setProfileAvatar(GAMING_AVATARS[0].url);
        }
      } catch { setProfileAvatar(GAMING_AVATARS[0].url); }
    })();
  }, [user?.uid]);

  const avatarSrc   = profileAvatar || GAMING_AVATARS[0].url;
  const displayName = profileName || user?.displayName || "Joueur";

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
              style={{ paddingRight: "100px" }}
            >
              <li><Link to={{ pathname: `/actualites/` }}>Actualités</Link></li>
              <li><Link to="/Catalogues?catFilter=nouveautes">Nouveautés</Link></li>
              <li><Link to="/Catalogues?catFilter=topseller">Populaires</Link></li>
              <li><Link to="/Catalogues?catFilter=preorder">Précommandes</Link></li>
            
              {isAdmin && (
                <li><Link to="/admin" style={{ fontSize:"10px", fontWeight:800, letterSpacing:"0.1em", color:"#dd163b", border:"1px solid rgba(221,22,59,0.4)", borderRadius:"4px", padding:"4px 10px", textTransform:"uppercase", textDecoration:"none" }}>Admin</Link></li>
              )}
            </ul>

            {/* SearchBar + icône profil — desktop uniquement */}
            <div
              className="d-none d-lg-flex"
              style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", zIndex: 1200, alignItems:"center", gap:10, marginLeft:"48px" }}
            >
              <SearchBar />
              {user && (
                <div style={{ position:"relative" }} ref={dropRef}>
                  <div onClick={() => setDropOpen(v => !v)} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      style={{ width:34, height:34, borderRadius:8, border:`2px solid ${dropOpen ? "#dd163b" : "rgba(221,22,59,0.5)"}`, objectFit:"cover", transition:"border-color 0.2s" }}
                    />
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition:"transform 0.2s", transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                      <path d="M1 1l4 4 4-4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  {dropOpen && (
                    <div style={{ position:"absolute", top:"calc(100% + 12px)", right:0, width:260, background:"#13131a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, boxShadow:"0 24px 80px rgba(0,0,0,0.8)", overflow:"hidden", zIndex:2000 }}>
                      <div style={{ padding:"16px", background:"rgba(255,255,255,0.03)", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:12 }}>
                        <img src={avatarSrc} alt="avatar" style={{ width:44, height:44, borderRadius:10, objectFit:"cover", border:"2px solid rgba(221,22,59,0.5)", flexShrink:0 }} />
                        <div style={{ minWidth:0 }}>
                          <div style={{ color:"#fff", fontSize:14, fontWeight:800, fontFamily:"Montserrat,sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</div>
                          <div style={{ color:"#555", fontSize:11, fontFamily:"Montserrat,sans-serif", marginTop:2 }}>Membre NextGen Gaming</div>
                        </div>
                      </div>
                      <Link to={`/profile/${user.uid}`} onClick={() => setDropOpen(false)} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 18px", textDecoration:"none", borderBottom:"1px solid rgba(255,255,255,0.05)" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{ fontSize:17, width:22, textAlign:"center" }}>👤</span>
                        <span style={{ color:"#ddd", fontSize:13, fontFamily:"Montserrat,sans-serif", fontWeight:600 }}>Mon profil</span>
                      </Link>
                      <Link to="/wishlist" onClick={() => setDropOpen(false)} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 18px", textDecoration:"none", borderBottom:"1px solid rgba(255,255,255,0.05)" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{ fontSize:17, width:22, textAlign:"center" }}>❤️</span>
                        <span style={{ color:"#ddd", fontSize:13, fontFamily:"Montserrat,sans-serif", fontWeight:600 }}>Wishlist</span>
                      </Link>
                      <div style={{ height:1, background:"rgba(255,255,255,0.06)", margin:"4px 0" }} />
                      <button onClick={() => { signOut(auth).then(() => { setDropOpen(false); navigate("/"); }); }} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 18px", width:"100%", background:"none", border:"none", cursor:"pointer" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(221,22,59,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                        <span style={{ fontSize:17, width:22, textAlign:"center" }}>🚪</span>
                        <span style={{ color:"#e74c3c", fontSize:13, fontFamily:"Montserrat,sans-serif", fontWeight:600 }}>Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!user && (
                <Link to="/Login" title="Se connecter" style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.06)", transition:"all 0.2s", textDecoration:"none" }} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(221,22,59,0.5)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </Link>
              )}
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