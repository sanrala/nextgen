import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../../Firebase";

const STYLES = `
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }
  .login-page::before {
    content: '';
    position: absolute;
    top: -200px; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(221,22,59,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .login-card {
    width: 100%;
    max-width: 400px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 40px 36px;
    position: relative;
    z-index: 1;
  }
  .login-logo {
    text-align: center;
    margin-bottom: 8px;
  }
  .login-logo img { height: 56px; }
  .login-title {
    text-align: center;
    font-family: 'Rajdhani', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .login-sub {
    text-align: center;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    color: #444;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }
  .login-field {
    margin-bottom: 14px;
  }
  .login-field label {
    display: block;
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #555;
    margin-bottom: 6px;
  }
  .login-field input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    color: #ddd;
    font-size: 13px;
    padding: 10px 14px;
    outline: none;
    font-family: 'Montserrat', sans-serif;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .login-field input:focus { border-color: rgba(221,22,59,0.5); }
  .login-btn-main {
    width: 100%;
    padding: 12px;
    background: #dd163b;
    border: none;
    border-radius: 6px;
    color: #fff;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 4px;
    transition: background 0.15s;
  }
  .login-btn-main:hover:not(:disabled) { background: #bb1230; }
  .login-btn-main:disabled { opacity: 0.5; cursor: default; }
  .login-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
  }
  .login-divider::before, .login-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.07);
  }
  .login-divider span {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    color: #333;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .login-btn-google {
    width: 100%;
    padding: 11px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    color: #ccc;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.15s;
    box-sizing: border-box;
  }
  .login-btn-google:hover { border-color: rgba(255,255,255,0.2); color: #fff; background: rgba(255,255,255,0.08); }
  .login-error {
    background: rgba(221,22,59,0.1);
    border: 1px solid rgba(221,22,59,0.3);
    border-radius: 6px;
    color: #dd163b;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    padding: 10px 14px;
    margin-bottom: 14px;
  }
  .login-back {
    text-align: center;
    margin-top: 20px;
  }
  .login-back a {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    color: #444;
    text-decoration: none;
    transition: color 0.15s;
  }
  .login-back a:hover { color: #dd163b; }
`;

function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  // Redirige si déjà connecté
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) navigate("/", { replace: true });
    });
    return () => unsub();
  }, [navigate]);

  const handleEmail = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      setError("Connexion Google échouée : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{STYLES}</style>
      <div className="login-card">
        <div className="login-logo">
          <img src="/images/logo.png" alt="NextGen" onError={e => e.target.style.display="none"} />
        </div>
        <div className="login-title">Connexion</div>
        <div className="login-sub">NextGen Gaming</div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleEmail}>
          <div className="login-field">
            <label>Email</label>
            <input
              type="email" value={email} required autoComplete="email"
              placeholder="votre@email.com"
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="login-field">
            <label>Mot de passe</label>
            <input
              type="password" value={password} required autoComplete="current-password"
              placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="login-btn-main" type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="login-divider"><span>ou</span></div>

        <button className="login-btn-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>

        <div className="login-back">
          <Link to="/">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;