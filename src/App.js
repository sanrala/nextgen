import React, { useEffect } from "react";
import Home from "./Home";
import Admin from "./Components/Admin/Admin";
import ArticlePage from "./Components/Admin/ArticlePage";
import { Routes, Route } from "react-router-dom";
import GameDetail from "./Components/GameDetail/GameDetail";
import Populaires from "./Components/Populaires/Populaires";
import LoginPage from "./Components/Login/LoginPage";
import ActualitesPage from "./Components/BoxNews/ActualitesPage";
import ProfilePage from "./Components/Profile/ProfilePage";
import { useDispatch } from "react-redux";
import { login, logout } from "./features/userSlice";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./Firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { GAMING_AVATARS } from "./Components/Profile/avatars";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        dispatch(login({
          uid:         u.uid,
          email:       u.email,
          displayName: u.displayName,
          photoURL:    u.photoURL,
        }));

        try {
          // Attend 2s pour laisser updateProfile se propager
          await new Promise(r => setTimeout(r, 2000));
          await u.reload();
          const fresh = auth.currentUser;
          const ref  = doc(db, "users", u.uid);
          const snap = await getDoc(ref);

          if (!snap.exists()) {
            await setDoc(ref, {
              uid:         u.uid,
              displayName: fresh?.displayName || u.displayName || "Joueur",
              photoURL:    fresh?.photoURL    || GAMING_AVATARS[0].url,
              createdAt:   new Date().toISOString(),
            });
          }

          // Met à jour Redux avec les données fraîches
          dispatch(login({
            uid:         u.uid,
            email:       u.email,
            displayName: fresh?.displayName || u.displayName,
            photoURL:    fresh?.photoURL    || u.photoURL || GAMING_AVATARS[0].url,
          }));
        } catch(e) { console.warn("Profil init error:", e.message); }
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
        <Route path="/profile/:uid"        element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;