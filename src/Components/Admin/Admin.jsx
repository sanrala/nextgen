import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../Firebase";
import AdminLogin from "./AdminLogin";
import AdminConsole from "./AdminConsole";

function Admin() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div
        style={{
          background: "#0d0d0d",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#cc1a1a",
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 13,
          letterSpacing: 3,
        }}
      >
        CHARGEMENT...
      </div>
    );
  }

  return user ? <AdminConsole user={user} /> : <AdminLogin />;
}

export default Admin;