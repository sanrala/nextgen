import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { db, auth } from "../../Firebase";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { GAMING_AVATARS } from "./avatars";

// ── Séparateur (même que GameDetail) ─────────────────────────────────────────
function Separator({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:18, margin:"40px 0 24px" }}>
      <div style={{ width:5, height:28, background:"#dd163b", borderRadius:3, flexShrink:0 }} />
      <div style={{ width:32, height:3, background:"#dd163b", borderRadius:2, flexShrink:0 }} />
      {label && (
        <span style={{
          fontFamily:"Montserrat,sans-serif", fontSize:"clamp(13px,3.5vw,20px)",
          color:"#ccc", letterSpacing:"clamp(1px,0.6vw,3px)",
          textTransform:"uppercase", fontWeight:800,
        }}>{label}</span>
      )}
      <div style={{ flex:1, height:1, background:"linear-gradient(to right, rgba(221,22,59,0.3), transparent)" }} />
    </div>
  );
}

// ── Avatar picker ─────────────────────────────────────────────────────────────
function AvatarPicker({ current, onSelect }) {
  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(auto-fill, minmax(72px, 1fr))",
      gap:10, marginTop:16,
    }}>
      {GAMING_AVATARS.map(av => (
        <div
          key={av.id}
          onClick={() => onSelect(av)}
          title={av.name}
          style={{
            cursor:"pointer",
            borderRadius:10,
            border: current === av.url
              ? "2px solid #dd163b"
              : "2px solid rgba(255,255,255,0.06)",
            background: current === av.url
              ? "rgba(221,22,59,0.12)"
              : "rgba(255,255,255,0.03)",
            padding:6,
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            transition:"all 0.18s",
          }}
        >
          <img
            src={av.url} alt={av.name}
            style={{ width:48, height:48, borderRadius:8, objectFit:"cover" }}
          />
          <span style={{
            fontSize:9, color: current === av.url ? "#fff" : "#666",
            fontFamily:"Montserrat,sans-serif", textAlign:"center",
            lineHeight:1.2, fontWeight:600,
          }}>{av.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { uid }    = useParams();
  const navigate   = useNavigate();

  const [currentUser,  setCurrentUser]  = useState(null);
  const [profileData,  setProfileData]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [isOwner,      setIsOwner]      = useState(false);

  // Edit state
  const [editMode,     setEditMode]     = useState(false);
  const [editPseudo,   setEditPseudo]   = useState("");
  const [editAvatar,   setEditAvatar]   = useState("");
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState("");

  // Charge auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setCurrentUser(u);
      setIsOwner(u?.uid === uid);
    });
    return () => unsub();
  }, [uid]);

  // Charge profil Firebase
  useEffect(() => {
    if (!uid) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setProfileData(snap.data());
        } else {
          // Profil pas encore créé — données par défaut depuis auth
          const u = auth.currentUser;
          if (u && u.uid === uid) {
            setProfileData({
              displayName: u.displayName || "Joueur",
              photoURL: u.photoURL || GAMING_AVATARS[0].url,
              uid,
            });
          } else {
            setProfileData(null);
          }
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  const handleEditOpen = () => {
    setEditPseudo(profileData?.displayName || "");
    setEditAvatar(profileData?.photoURL    || "");
    setEditMode(true);
    setSaveMsg("");
  };

  const handleSave = async () => {
    if (!editPseudo.trim()) return;
    setSaving(true);
    try {
      const updated = {
        uid,
        displayName: editPseudo.trim(),
        photoURL:    editAvatar || GAMING_AVATARS[0].url,
        updatedAt:   new Date().toISOString(),
      };
      await setDoc(doc(db, "users", uid), updated, { merge: true });

      // Met aussi à jour le profil Firebase Auth
      if (currentUser && currentUser.uid === uid) {
        await updateProfile(currentUser, {
          displayName: updated.displayName,
          photoURL:    updated.photoURL,
        });
      }

      setProfileData(updated);
      setEditMode(false);
      setSaveMsg("✅ Profil mis à jour !");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch(e) {
      setSaveMsg("Erreur : " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <Header />
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"60vh" }}>
        <div style={{ width:40, height:40, border:"3px solid #dd163b", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  if (!profileData) return (
    <>
      <Header />
      <div style={{ textAlign:"center", padding:"80px 20px", color:"#666", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>👤</div>
        <p>Profil introuvable.</p>
        <Link to="/" style={{ color:"#dd163b" }}>Retour à l'accueil</Link>
      </div>
      <Footer />
    </>
  );

  const avatar      = profileData.photoURL || GAMING_AVATARS[0].url;
  const displayName = profileData.displayName || "Joueur";
  const avatarObj   = GAMING_AVATARS.find(a => a.url === avatar);

  return (
    <div style={{ background:"#0d0d0d", minHeight:"100vh" }}>
      <Header />

      {/* Hero banner */}
      <div style={{
        position:"relative", height:260,
        background:"linear-gradient(135deg, #0d0d0d 0%, #1a0808 50%, #0d0d0d 100%)",
        overflow:"hidden",
      }}>
        {/* Grille déco */}
        <div style={{
          position:"absolute", inset:0, opacity:0.06,
          backgroundImage:"linear-gradient(rgba(221,22,59,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(221,22,59,0.5) 1px, transparent 1px)",
          backgroundSize:"40px 40px",
        }} />
        {/* Lueur */}
        <div style={{
          position:"absolute", bottom:-60, left:"50%", transform:"translateX(-50%)",
          width:300, height:300,
          background:"radial-gradient(circle, rgba(221,22,59,0.15) 0%, transparent 70%)",
        }} />
      </div>

      <div className="container" style={{ position:"relative" }}>

        {/* Avatar flottant */}
        <div style={{
          display:"flex", alignItems:"flex-end", gap:24,
          marginTop:-70, marginBottom:32, flexWrap:"wrap",
        }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{
              width:120, height:120, borderRadius:16,
              border:"3px solid #dd163b",
              background:"#1a1a1a",
              boxShadow:"0 8px 32px rgba(221,22,59,0.3)",
              overflow:"hidden",
            }}>
              <img src={avatar} alt={displayName} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
            {/* Badge classe avatar */}
            {avatarObj && (
              <div style={{
                position:"absolute", bottom:-10, left:"50%", transform:"translateX(-50%)",
                background:"#dd163b", color:"#fff", fontSize:9, fontWeight:800,
                fontFamily:"Montserrat,sans-serif", letterSpacing:"0.1em",
                padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap",
                textTransform:"uppercase",
              }}>
                {avatarObj.name}
              </div>
            )}
          </div>

          <div style={{ flex:1, minWidth:0, paddingBottom:8 }}>
            <h1 style={{
              fontFamily:"Montserrat,sans-serif", fontWeight:900,
              fontSize:"clamp(20px,4vw,32px)", color:"#fff", margin:"0 0 6px",
            }}>{displayName}</h1>
            <div style={{ color:"#555", fontSize:12, fontFamily:"Montserrat,sans-serif" }}>
              Membre NextGen Gaming
            </div>
          </div>

          {isOwner && (
            <button
              onClick={handleEditOpen}
              style={{
                background:"rgba(221,22,59,0.12)",
                border:"1px solid rgba(221,22,59,0.4)",
                color:"#fff", borderRadius:8,
                padding:"10px 20px", cursor:"pointer",
                fontFamily:"Montserrat,sans-serif", fontWeight:700,
                fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase",
                alignSelf:"flex-end",
              }}
            >
              ✏️ Modifier le profil
            </button>
          )}
        </div>

        {saveMsg && (
          <div style={{
            background:"rgba(39,174,96,0.1)", border:"1px solid rgba(39,174,96,0.3)",
            borderRadius:8, padding:"10px 16px", color:"#27ae60",
            fontFamily:"Montserrat,sans-serif", fontSize:13, marginBottom:20,
          }}>{saveMsg}</div>
        )}

        {/* ── Panneau édition ── */}
        {editMode && isOwner && (
          <div style={{
            background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(221,22,59,0.2)",
            borderRadius:14, padding:24, marginBottom:32,
          }}>
            <div style={{
              fontFamily:"Montserrat,sans-serif", fontWeight:800,
              fontSize:14, color:"#fff", letterSpacing:"0.1em",
              textTransform:"uppercase", marginBottom:20,
            }}>
              ✏️ Modifier le profil
            </div>

            {/* Pseudo */}
            <div style={{ marginBottom:20 }}>
              <label style={{
                display:"block", fontSize:11, color:"#666",
                fontFamily:"Montserrat,sans-serif", fontWeight:700,
                letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8,
              }}>
                Pseudo
              </label>
              <input
                value={editPseudo}
                onChange={e => setEditPseudo(e.target.value)}
                maxLength={24}
                style={{
                  width:"100%", maxWidth:320,
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.12)",
                  borderRadius:8, color:"#fff", fontSize:15,
                  padding:"10px 14px", outline:"none",
                  fontFamily:"Montserrat,sans-serif", boxSizing:"border-box",
                }}
              />
            </div>

            {/* Choix avatar */}
            <div>
              <label style={{
                display:"block", fontSize:11, color:"#666",
                fontFamily:"Montserrat,sans-serif", fontWeight:700,
                letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4,
              }}>
                Avatar ({GAMING_AVATARS.length} personnages disponibles)
              </label>
              <AvatarPicker current={editAvatar} onSelect={av => setEditAvatar(av.url)} />
            </div>

            {/* Boutons */}
            <div style={{ display:"flex", gap:12, marginTop:24 }}>
              <button
                onClick={handleSave}
                disabled={saving || !editPseudo.trim()}
                style={{
                  background:"#dd163b", border:"none", borderRadius:8,
                  color:"#fff", fontFamily:"Montserrat,sans-serif",
                  fontWeight:700, fontSize:12, letterSpacing:"0.08em",
                  textTransform:"uppercase", padding:"11px 28px",
                  cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Sauvegarde..." : "💾 Enregistrer"}
              </button>
              <button
                onClick={() => setEditMode(false)}
                style={{
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:8, color:"#888",
                  fontFamily:"Montserrat,sans-serif", fontSize:12,
                  padding:"11px 20px", cursor:"pointer",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── Infos ── */}
        <Separator label="Profil du joueur" />
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))",
          gap:14, marginBottom:40,
        }}>
          {[
            { label:"Pseudo",   value: displayName },
            { label:"Classe",   value: avatarObj?.name || "—" },
            { label:"Statut",   value: "Membre" },
          ].map(item => (
            <div key={item.label} style={{
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:10, padding:"16px 18px",
            }}>
              <div style={{ fontSize:10, color:"#555", fontFamily:"Montserrat,sans-serif", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>
                {item.label}
              </div>
              <div style={{ fontSize:15, color:"#fff", fontFamily:"Montserrat,sans-serif", fontWeight:700 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  );
}