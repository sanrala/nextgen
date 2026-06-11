import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./Firebase";

export function useAdmin() {
  const [user,    setUser]    = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("useAdmin — auth state changed, user:", u?.uid || "null");
      setUser(u);
      if (u) {
        try {
          const ref  = doc(db, "admins", u.uid);
          const snap = await getDoc(ref);
          console.log("useAdmin — admins doc exists:", snap.exists(), "data:", snap.data());
          setIsAdmin(snap.exists() && snap.data()?.isAdmin === true);
        } catch(e) {
          console.error("useAdmin — Firestore error:", e.message);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, isAdmin, loading };
}