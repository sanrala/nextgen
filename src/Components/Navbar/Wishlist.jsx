import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/userSlice";
import { db } from "../../Firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

function Wishlist() {
  const user     = useSelector(selectUser);
  const navigate = useNavigate();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) { navigate("/Login"); return; }
    (async () => {
      try {
        const snap = await getDocs(collection(db, "users", user.uid, "wishlist"));
        const list = [];
        snap.forEach(d => list.push({ docId: d.id, ...d.data() }));
        // Tri par date ajout décroissant
        list.sort((a, b) => (b.addedAt?.toMillis?.() || 0) - (a.addedAt?.toMillis?.() || 0));
        setItems(list);
      } catch (e) {
        console.warn("Wishlist fetch error:", e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid, navigate]);

  const removeItem = async (docId) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "wishlist", docId));
      setItems(prev => prev.filter(i => i.docId !== docId));
    } catch (e) {
      console.warn("Remove error:", e.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0e13" }}>
      <Header />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "120px 20px 60px" }}>

        {/* Titre */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
          <div style={{ width: 5, height: 28, background: "#dd163b", borderRadius: 3 }} />
          <div style={{ width: 32, height: 3, background: "#dd163b", borderRadius: 2 }} />
          <h1 style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(18px, 3vw, 28px)",
            fontWeight: 800,
            color: "#fff",
            margin: 0,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}>
            Ma Wishlist
          </h1>
          {items.length > 0 && (
            <span style={{
              background: "rgba(221,22,59,0.15)",
              border: "1px solid rgba(221,22,59,0.3)",
              color: "#dd163b",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "Montserrat, sans-serif",
              padding: "3px 10px",
              borderRadius: 20,
            }}>
              {items.length} jeu{items.length > 1 ? "x" : ""}
            </span>
          )}
        </div>

        {/* Chargement */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#555", fontFamily: "Montserrat, sans-serif" }}>
            Chargement...
          </div>
        )}

        {/* Vide */}
        {!loading && items.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" style={{ marginBottom: 16 }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p style={{ color: "#444", fontFamily: "Montserrat, sans-serif", fontSize: 14, margin: "0 0 20px" }}>
              Ta wishlist est vide
            </p>
            <Link to="/Catalogues" style={{
              display: "inline-block",
              background: "#dd163b", color: "#fff",
              fontFamily: "Montserrat, sans-serif", fontWeight: 700,
              fontSize: 12, textTransform: "uppercase", letterSpacing: 1,
              padding: "10px 24px", borderRadius: 50, textDecoration: "none",
            }}>
              Parcourir les jeux
            </Link>
          </div>
        )}

        {/* Liste */}
        {!loading && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map(item => {
              const slug = (item.name || "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
              const price = item.price ? parseFloat(item.price).toFixed(2) + " €" : null;
              return (
                <div key={item.docId} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  transition: "border-color 0.2s",
                }}>
                  {/* Image */}
                  <Link to={`/store/${item.igId}/0/${slug}`} style={{ flexShrink: 0 }}>
                    <img
                      src={item.img}
                      alt={item.name}
                      style={{ width: 90, height: 54, objectFit: "cover", borderRadius: 8, display: "block" }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  </Link>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/store/${item.igId}/0/${slug}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 700, fontSize: 14,
                        color: "#fff",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        marginBottom: 4,
                      }}>
                        {item.name}
                      </div>
                    </Link>
                    {price && (
                      <div style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 700, fontSize: 16,
                        color: "#dd163b",
                      }}>
                        {price}
                      </div>
                    )}
                  </div>

                  {/* Boutons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <Link
                      to={`/store/${item.igId}/0/${slug}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#dd163b", color: "#fff",
                        fontFamily: "Montserrat, sans-serif", fontWeight: 700,
                        fontSize: 11, textTransform: "uppercase", letterSpacing: 1,
                        padding: "8px 16px", borderRadius: 50, textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Voir le jeu
                    </Link>
                    <button
                      onClick={() => removeItem(item.docId)}
                      title="Retirer de la wishlist"
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 36, height: 36, borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                        cursor: "pointer", color: "rgba(255,255,255,0.4)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#dd163b"; e.currentTarget.style.color = "#dd163b"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Wishlist;
