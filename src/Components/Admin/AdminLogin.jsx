import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase";
import "./Admin.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-logo">NXTGEN</div>
        <div className="admin-login-subtitle">CONSOLE ADMIN</div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label className="admin-form-label">Email</label>
            <input
              className="admin-form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nextgen.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Mot de passe</label>
            <input
              className="admin-form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button className="admin-submit-btn" type="submit" disabled={loading}>
            {loading ? "CONNEXION..." : "SE CONNECTER"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;