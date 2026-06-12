import React, { useState, useEffect } from "react";
import logo from "./../../assets/images/logoGames/logo.png";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../../Firebase";

const GAMING_IMAGES = [
  { url: "https://cdn.akamai.steamstatic.com/steam/apps/1174180/library_hero.jpg", pos: "90% center" },  // RDR2
  { url: "https://cdn.akamai.steamstatic.com/steam/apps/292030/library_hero.jpg",  pos: "80% center" },  // Witcher 3
  { url: "https://cdn.akamai.steamstatic.com/steam/apps/271590/library_hero.jpg",  pos: "90% center" },  // GTA V
  { url: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_hero.jpg", pos: "80% center" },  // Cyberpunk 2077
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Rajdhani:wght@600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    display: flex;
    background: #111118;
    font-family: 'Montserrat', sans-serif;
  }

  .auth-left {
    width: 480px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    padding: 28px 44px;
    position: relative;
    z-index: 2;
    overflow-y: auto;
    background: #111118;
  }

  .auth-logo { margin-bottom: 24px; }
  .auth-logo img {
    height: 80px;
    object-fit: contain;
    filter: brightness(1.4);
  }

  .auth-heading {
    font-family: 'Rajdhani', sans-serif;
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1;
    margin-bottom: 4px;
    white-space: nowrap;
  }
  .auth-heading span { color: #dd163b; }

  .auth-sub {
    font-size: 12px;
    color: #aaaaaa;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .auth-tabs {
    display: flex;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    padding: 4px;
    margin-bottom: 16px;
    gap: 4px;
  }
  .auth-tab {
    flex: 1;
    padding: 9px;
    border: none;
    border-radius: 6px;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: #aaaaaa;
  }
  .auth-tab.active {
    background: #dd163b;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(221,22,59,0.4);
  }

  .auth-google {
    width: 100%;
    padding: 12px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    color: #ffffff;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.2s;
    margin-bottom: 14px;
    letter-spacing: 0.05em;
  }
  .auth-google:hover:not(:disabled) {
    background: rgba(255,255,255,0.14);
    border-color: rgba(255,255,255,0.35);
  }
  .auth-google:disabled { opacity: 0.4; cursor: default; }

  .auth-sep {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .auth-sep::before, .auth-sep::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.2);
  }
  .auth-sep span {
    font-size: 11px;
    color: #aaaaaa;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .auth-field { margin-bottom: 10px; }
  .auth-field label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #cccccc;
    margin-bottom: 7px;
  }
  .auth-field input {
    width: 100%;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 8px;
    color: #ffffff;
    font-size: 13px;
    padding: 10px 12px;
    outline: none;
    font-family: 'Montserrat', sans-serif;
    transition: border-color 0.2s, background 0.2s;
  }
  .auth-field input:focus {
    border-color: #dd163b;
    background: rgba(255,255,255,0.11);
  }
  .auth-field input::placeholder { color: #666; }

  .auth-submit {
    width: 100%;
    padding: 13px;
    background: #dd163b;
    border: none;
    border-radius: 8px;
    color: #ffffff;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.2s;
  }
  .auth-submit:hover:not(:disabled) {
    background: #c01232;
    box-shadow: 0 6px 20px rgba(221,22,59,0.4);
  }
  .auth-submit:disabled { opacity: 0.4; cursor: default; }

  .auth-error {
    background: rgba(221,22,59,0.12);
    border: 1px solid rgba(221,22,59,0.4);
    border-radius: 8px;
    color: #ff8080;
    font-size: 11px;
    padding: 10px 14px;
    margin-bottom: 12px;
    line-height: 1.5;
  }
  .auth-success {
    background: rgba(39,174,96,0.12);
    border: 1px solid rgba(39,174,96,0.4);
    border-radius: 8px;
    color: #4cd97b;
    font-size: 11px;
    padding: 10px 14px;
    margin-bottom: 12px;
  }

  .auth-footer {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  .auth-footer a {
    font-size: 11px;
    color: #aaaaaa;
    text-decoration: none;
    transition: color 0.2s;
    letter-spacing: 0.04em;
  }
  .auth-footer a:hover { color: #dd163b; }

  .auth-right {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  .auth-right-img {
    position: absolute;
    inset: 0;
    background-size: cover;
    transition: opacity 0.8s ease;
  }
  .auth-right-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, #111118 0%, rgba(17,17,24,0.2) 35%, transparent 100%);
  }
  .auth-right-content {
    position: absolute;
    bottom: 48px;
    right: 48px;
    text-align: right;
  }
  .auth-right-tag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #dd163b;
    margin-bottom: 8px;
  }
  .auth-right-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: clamp(28px, 3vw, 44px);
    font-weight: 700;
    color: #ffffff;
    line-height: 1.1;
    text-shadow: 0 2px 20px rgba(0,0,0,0.8);
  }

  .auth-bar {
    position: absolute;
    left: 480px;
    top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, transparent, #dd163b 30%, #dd163b 70%, transparent);
    z-index: 3;
  }

  @media (max-width: 768px) {
    .auth-right { display: none; }
    .auth-bar { display: none; }
    .auth-left { width: 100%; padding: 32px 24px; }
  }
`;

export default function LoginPage() {
  const [tab,      setTab]     = useState("login");
  const [email,    setEmail]   = useState("");
  const [password, setPassword]= useState("");
  const [pseudo,   setPseudo]  = useState("");
  const [confirm,  setConfirm] = useState("");
  const [error,    setError]   = useState("");
  const [success,  setSuccess] = useState("");
  const [loading,  setLoading] = useState(false);
  const [bgIdx,    setBgIdx]   = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      // Ne redirige que si email vérifié OU connexion Google
      if (u && (u.emailVerified || u.providerData?.[0]?.providerId === "google.com")) {
        navigate("/", { replace: true });
      }
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    const t = setInterval(() => setBgIdx(i => (i + 1) % GAMING_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const reset = () => { setError(""); setSuccess(""); };

  const handleLogin = async (e) => {
    e.preventDefault(); reset(); setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
   if (!cred.user.emailVerified) {
  setError("Ton email n'est pas encore vérifié. Consulte ta boîte mail et clique sur le lien d'activation.");
  return;
}
      navigate("/");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); reset(); setLoading(true);
    if (!pseudo.trim()) { setError("Choisis un pseudo."); setLoading(false); return; }
    if (password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères."); setLoading(false); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); setLoading(false); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(cred.user, { displayName: pseudo.trim() });
      await sendEmailVerification(cred.user, {
        url: window.location.origin + "/Login",
        handleCodeInApp: false,
      });
      await auth.signOut();
      setSuccess("✅ Compte créé ! Un email de confirmation a été envoyé à " + email + ". Pensez à vérifier dans vos spams.");
      setTab("login");
      setEmail(""); setPassword(""); setPseudo(""); setConfirm("");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Cet email est déjà utilisé.");
      else setError("Erreur : " + err.message);
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    reset(); setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch {
      setError("Connexion Google échouée.");
    } finally { setLoading(false); }
  };

  const isLogin = tab === "login";
  const bg = GAMING_IMAGES[bgIdx];

  return (
    <div className="auth-root">
      <style>{CSS}</style>

      <div className="auth-left">
        <div className="auth-logo">
          <Link to="/"><img src={logo} alt="NextGen Gaming" /></Link>
        </div>

        <div className="auth-heading">
          {isLogin ? <><span>Content</span> de te revoir !</> : <>Rejoins <span>NextGen</span></>}
        </div>
        <div className="auth-sub">
          {isLogin ? "Connecte-toi pour continuer" : "Crée ton compte gratuitement"}
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === "login" ? " active" : ""}`} onClick={() => { setTab("login"); reset(); }}>Connexion</button>
          <button className={`auth-tab${tab === "register" ? " active" : ""}`} onClick={() => { setTab("register"); reset(); }}>Inscription</button>
        </div>

        <button className="auth-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>

        <div className="auth-sep"><span>ou</span></div>

        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
{auth.currentUser && !auth.currentUser.emailVerified && (
  <button 
    onClick={() => sendEmailVerification(auth.currentUser)}
    style={{
      marginBottom: "10px",
      padding: "10px",
      width: "100%",
      background: "#444",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer"
    }}
  >
    Renvoyer email de confirmation
  </button>
)}
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <div className="auth-field">
              <label>Pseudo</label>
              <input type="text" placeholder="TonPseudo" value={pseudo} onChange={e => setPseudo(e.target.value)} required maxLength={24} />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="auth-field">
            <label>Mot de passe</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={isLogin ? "current-password" : "new-password"} />
          </div>
          {!isLogin && (
            <div className="auth-field">
              <label>Confirmer le mot de passe</label>
              <input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
          )}
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "..." : isLogin ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/">← Accueil</Link>
          {isLogin && <a href="#forgot" onClick={e => { e.preventDefault(); setError("Fonctionnalité à venir."); }}>Mot de passe oublié</a>}
        </div>
      </div>

      <div className="auth-bar" />

      <div className="auth-right">
        <div className="auth-right-img" style={{ backgroundImage: `url(${bg.url})`, backgroundPosition: bg.pos, backgroundSize: "cover" }} />
        <div className="auth-right-overlay" />
        <div className="auth-right-content">
          <div className="auth-right-tag">NextGen Gaming</div>
          <div className="auth-right-title">Les meilleures offres,<br/>une communauté passionnée.</div>
        </div>
      </div>
    </div>
  );
}