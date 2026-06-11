import React, { useEffect } from "react";
import Home from "./Home";
import Admin from "./Components/Admin/Admin";
import ArticlePage from "./Components/Admin/ArticlePage";
import { Routes, Route } from "react-router-dom";
import GameDetail from "./Components/GameDetail/GameDetail";
import Populaires from "./Components/Populaires/Populaires";
import LoginPage from "./Components/Login/LoginPage";
import ActualitesPage from "./Components/BoxNews/ActualitesPage";
import { useDispatch } from "react-redux";
import { login, logout } from "./features/userSlice";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase";

function App() {
  const dispatch = useDispatch();

  // ── Sync Firebase Auth → Redux ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        dispatch(login({
          uid:         u.uid,
          email:       u.email,
          displayName: u.displayName,
          photoURL:    u.photoURL,
        }));
      } else {
        dispatch(logout());
      }
    });
    return () => unsub();
  }, [dispatch]);

  return (
    <div className="App">
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/admin"               element={<Admin />} />
        <Route path="/article/:doc_id"     element={<ArticlePage />} />
        <Route path="/store/:igId/:steamId/:title" element={<GameDetail />} />
        <Route path="/Catalogues"          element={<Populaires />} />
        <Route path="/Catalogues/"         element={<Populaires />} />
        <Route path="/Login"               element={<LoginPage />} />
        <Route path="/Login/"              element={<LoginPage />} />
        <Route path="/actualites"          element={<ActualitesPage />} />
        <Route path="/actualités"          element={<ActualitesPage />} />
      </Routes>
    </div>
  );
}

export default App;