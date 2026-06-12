import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { db, auth } from "../../Firebase";
import Header from "../Header/Header";
import { useAdmin } from "../../useAdmin";
import Footer from "../Footer/Footer";
import { GAMING_AVATARS, ADMIN_AVATAR } from "./avatars";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Montserrat:wght@400;600;700;900&display=swap');

  .profile-page { background: #0a0a0f; min-height: 100vh; color: #fff; }

  .profile-hero {
    position: relative;
    height: 320px;
    background: #0a0a0f;
    overflow: hidden;
  }
  .profile-hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(221,22,59,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(221,22,59,0.07) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .profile-hero-glow {
    position: absolute;
    bottom: -80px; left: 50%; transform: translateX(-50%);
    width: 500px; height: 300px;
    background: radial-gradient(ellipse, rgba(221,22,59,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .profile-hero-scan {
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      to bottom, transparent 0, transparent 3px,
      rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px
    );
    pointer-events: none;
  }
  .profile-hero-corner {
    position: absolute;
    width: 24px; height: 24px;
    border-color: rgba(221,22,59,0.4);
    border-style: solid;
  }
  .profile-hero-corner.tl { top:24px; left:24px; border-width: 2px 0 0 2px; }
  .profile-hero-corner.tr { top:24px; right:24px; border-width: 2px 2px 0 0; }
  .profile-hero-corner.bl { bottom:24px; left:24px; border-width: 0 0 2px 2px; }
  .profile-hero-corner.br { bottom:24px; right:24px; border-width: 0 2px 2px 0; }

  .profile-card-wrap {
    max-width: 900px; margin: -80px auto 0;
    padding: 0 20px 60px; position: relative; z-index: 2;
  }

  .profile-card {
    background: rgba(14,14,20,0.95);
    border: 1px solid rgba(221,22,59,0.2);
    border-radius: 16px;
    padding: 32px;
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
  }

  .profile-identity {
    display: flex; align-items: flex-start; gap: 24px; flex-wrap: wrap;
  }
  .profile-avatar-frame {
    position: relative; flex-shrink: 0;
  }
  .profile-avatar-img {
    width: 100px; height: 100px;
    border-radius: 12px;
    border: 2px solid rgba(221,22,59,0.6);
    object-fit: cover;
    display: block;
    box-shadow: 0 0 0 4px rgba(221,22,59,0.08), 0 8px 24px rgba(0,0,0,0.5);
  }
  .profile-avatar-badge {
    position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
    background: #dd163b; color: #fff;
    font-family: Montserrat, sans-serif; font-size: 9px; font-weight: 800;
    letter-spacing: 0.12em; text-transform: uppercase;
    padding: 3px 10px; border-radius: 20px; white-space: nowrap;
    box-shadow: 0 2px 8px rgba(221,22,59,0.4);
  }
  .profile-meta { flex: 1; min-width: 0; padding-top: 4px; }
  .profile-name {
    font-family: Montserrat, sans-serif; font-weight: 900;
    font-size: clamp(22px, 4vw, 34px); color: #fff;
    margin: 0 0 6px; line-height: 1.1; letter-spacing: -0.02em;
  }
  .profile-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: Montserrat, sans-serif; font-size: 11px; font-weight: 700;
    color: #dd163b; letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 14px;
  }
  .profile-tag::before {
    content: ''; display: block;
    width: 6px; height: 6px; border-radius: 50%;
    background: #dd163b;
    box-shadow: 0 0 6px #dd163b;
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .profile-stats {
    display: flex; gap: 20px; flex-wrap: wrap; margin-top: 4px;
  }
  .profile-stat {
    display: flex; flex-direction: column; gap: 2px;
  }
  .profile-stat-val {
    font-family: Rajdhani, sans-serif; font-size: 20px; font-weight: 700; color: #fff;
  }
  .profile-stat-label {
    font-family: Montserrat, sans-serif; font-size: 10px; color: #555;
    font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  }

  .profile-edit-btn {
    margin-left: auto; flex-shrink: 0;
    background: rgba(221,22,59,0.1);
    border: 1px solid rgba(221,22,59,0.35);
    color: #fff; border-radius: 8px;
    padding: 10px 18px; cursor: pointer;
    font-family: Montserrat, sans-serif; font-weight: 700;
    font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
    transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }
  .profile-edit-btn:hover { background: rgba(221,22,59,0.2); border-color: #dd163b; }

  .profile-divider {
    height: 1px;
    background: linear-gradient(to right, rgba(221,22,59,0.3), rgba(255,255,255,0.05), transparent);
    margin: 28px 0;
  }

  /* Edit panel */
  .edit-panel {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(221,22,59,0.15);
    border-radius: 12px; padding: 24px; margin-top: 24px;
  }
  .edit-section-title {
    font-family: Montserrat, sans-serif; font-size: 10px; font-weight: 800;
    color: #555; letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 12px;
  }
  .edit-input {
    width: 100%; max-width: 360px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: #fff; font-size: 15px;
    padding: 11px 14px; outline: none;
    font-family: Montserrat, sans-serif; font-weight: 600;
    box-sizing: border-box; transition: border-color 0.2s;
  }
  .edit-input:focus { border-color: rgba(221,22,59,0.5); }

  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px; margin-top: 12px;
  }
  .avatar-item {
    cursor: pointer; border-radius: 10px; padding: 8px 6px;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    border: 2px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.02);
    transition: all 0.15s;
  }
  .avatar-item:hover { border-color: rgba(221,22,59,0.4); background: rgba(221,22,59,0.06); transform: translateY(-2px); }
  .avatar-item.selected { border-color: #dd163b; background: rgba(221,22,59,0.12); }
  .avatar-item img { width: 52px; height: 52px; border-radius: 8px; object-fit: cover; display: block; }
  .avatar-item span {
    font-size: 9px; color: #888; font-family: Montserrat, sans-serif;
    font-weight: 600; text-align: center; line-height: 1.2;
  }
  .avatar-item.selected span { color: #fff; }

  .edit-actions { display: flex; gap: 10px; margin-top: 20px; }
  .btn-save {
    background: #dd163b; border: none; border-radius: 8px;
    color: #fff; font-family: Montserrat, sans-serif; font-weight: 800;
    font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 12px 28px; cursor: pointer; transition: opacity 0.2s;
  }
  .btn-save:disabled { opacity: 0.5; cursor: default; }
  .btn-cancel {
    background: transparent; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; color: #666; font-family: Montserrat, sans-serif;
    font-size: 11px; padding: 12px 20px; cursor: pointer; transition: all 0.2s;
  }
  .btn-cancel:hover { border-color: rgba(255,255,255,0.2); color: #aaa; }

  .save-msg {
    margin-top: 12px; padding: 10px 14px;
    background: rgba(39,174,96,0.1); border: 1px solid rgba(39,174,96,0.25);
    border-radius: 8px; color: #27ae60;
    font-family: Montserrat, sans-serif; font-size: 13px;
  }

  @media (max-width: 600px) {
    .profile-card { padding: 20px 16px; }
    .profile-identity { gap: 16px; }
    .profile-edit-btn { margin-left: 0; width: 100%; justify-content: center; }
  }
`;

export default function ProfilePage() {
  const { uid } = useParams();
  const { isAdmin: viewerIsAdmin } = useAdmin();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [isOwner,     setIsOwner]     = useState(false);
  const [editMode,    setEditMode]    = useState(searchParams.get('edit') === '1');
  const [editPseudo,  setEditPseudo]  = useState("");
  const [editAvatar,  setEditAvatar]  = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setCurrentUser(u);
      setIsOwner(u?.uid === uid);
    });
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          setProfileData(snap.data());
        } else {
          const u = auth.currentUser;
          if (u?.uid === uid) {
            // Recharge pour avoir displayName à jour après inscription email
            try { await u.reload(); } catch {}
            const fresh = auth.currentUser;
            setProfileData({
              displayName: fresh?.displayName || u.displayName || "",
              photoURL: fresh?.photoURL || u.photoURL || GAMING_AVATARS[0].url,
              uid,
            });
          } else {
            setProfileData(null);
          }
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [uid]);

  const handleEditOpen = () => {
    setEditPseudo(profileData?.displayName || "");
    setEditAvatar(profileData?.photoURL    || GAMING_AVATARS[0].url);
    setEditMode(true); setSaveMsg("");
  };

  const handleSave = async () => {
    if (!editPseudo.trim()) return;
    setSaving(true);
    try {
      const updated = {
        uid,
        displayName: editPseudo.trim(),
        photoURL: editAvatar || GAMING_AVATARS[0].url,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", uid), updated, { merge: true });
      if (currentUser?.uid === uid) {
        await updateProfile(currentUser, { displayName: updated.displayName, photoURL: updated.photoURL });
      }
      setProfileData(updated);
      setEditMode(false);
      setSaveMsg("Profil mis à jour !");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch(e) { setSaveMsg("Erreur : " + e.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <>
      <Header />
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"60vh" }}>
        <div style={{ width:36, height:36, border:"3px solid #dd163b", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </>
  );

  if (!profileData) return (
    <>
      <Header />
      <div style={{ textAlign:"center", padding:"100px 20px", fontFamily:"Montserrat,sans-serif" }}>
        <div style={{ fontSize:52, marginBottom:16 }}>👤</div>
        <p style={{ color:"#555", marginBottom:20 }}>Ce profil n'existe pas.</p>
        <Link to="/" style={{ color:"#dd163b", fontWeight:700 }}>Retour à l'accueil</Link>
      </div>
      <Footer />
    </>
  );

  const avatar    = profileData.photoURL    || GAMING_AVATARS[0].url;
  const name      = profileData.displayName || "Joueur";
  const avatarObj = [ADMIN_AVATAR, ...GAMING_AVATARS].find(a => a.url === avatar);

  return (
    <div className="profile-page">
      <style>{CSS}</style>
      <Header />

      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-hero-grid" />
        <div className="profile-hero-glow" />
        <div className="profile-hero-scan" />
        <div className="profile-hero-corner tl" />
        <div className="profile-hero-corner tr" />
        <div className="profile-hero-corner bl" />
        <div className="profile-hero-corner br" />
        {/* Titre dans le hero */}
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          textAlign:"center", pointerEvents:"none",
        }}>
          <div style={{
            fontFamily:"Montserrat,sans-serif", fontSize:10, fontWeight:800,
            color:"rgba(221,22,59,0.6)", letterSpacing:"0.3em",
            textTransform:"uppercase", marginBottom:8,
          }}>NEXTGEN GAMING</div>
          <div style={{
            fontFamily:"Montserrat,sans-serif", fontSize:"clamp(28px,5vw,48px)",
            fontWeight:900, color:"rgba(255,255,255,0.06)",
            letterSpacing:"-0.03em", lineHeight:1,
          }}>PROFIL JOUEUR</div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="profile-card-wrap">
        <div className="profile-card">

          {/* Identité */}
          <div className="profile-identity">
            <div className="profile-avatar-frame">
              <img src={avatar} alt={name} className="profile-avatar-img" />
              {avatarObj && <div className="profile-avatar-badge">{avatarObj.name}</div>}
            </div>

            <div className="profile-meta">
              <h1 className="profile-name">{name}</h1>
              <div className="profile-tag">Membre NextGen Gaming</div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="profile-stat-val">{avatarObj?.name || "—"}</span>
                  <span className="profile-stat-label">Classe</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-val">Actif</span>
                  <span className="profile-stat-label">Statut</span>
                </div>
              </div>
            </div>

            {isOwner && !editMode && (
              <button className="profile-edit-btn" onClick={handleEditOpen}>
                <span>✏️</span> Modifier
              </button>
            )}
          </div>

          {saveMsg && <div className="save-msg" style={{ marginTop:16 }}>✅ {saveMsg}</div>}

          {/* Panneau édition */}
          {editMode && isOwner && (
            <div className="edit-panel">
              <div className="profile-divider" style={{ marginTop:0 }} />

              {/* Pseudo */}
              <div style={{ marginBottom:24 }}>
                <div className="edit-section-title">Pseudo</div>
                <input
                  className="edit-input"
                  value={editPseudo}
                  onChange={e => setEditPseudo(e.target.value)}
                  maxLength={24}
                  placeholder="Ton pseudo..."
                />
              </div>

              {/* Avatars */}
              <div>
                <div className="edit-section-title">
                  Choisir un avatar — {viewerIsAdmin ? GAMING_AVATARS.length + 1 : GAMING_AVATARS.length} personnages{viewerIsAdmin ? " (+ exclusif admin)" : ""}
                </div>
                <div className="avatar-grid">
                  {(viewerIsAdmin ? [ADMIN_AVATAR, ...GAMING_AVATARS] : GAMING_AVATARS).map(av => (
                    <div
                      key={av.id}
                      className={`avatar-item${editAvatar === av.url ? " selected" : ""}`}
                      onClick={() => setEditAvatar(av.url)}
                      title={av.name}
                    >
                      <img src={av.url} alt={av.name} />
                      <span>{av.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="edit-actions">
                <button className="btn-save" onClick={handleSave} disabled={saving || !editPseudo.trim()}>
                  {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
                <button className="btn-cancel" onClick={() => setEditMode(false)}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div className="profile-divider" />

          {/* Section infos bas */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px,1fr))", gap:12 }}>
            {[
              { icon:"🎮", label:"Plateforme", val:"NextGen Gaming" },
              { icon:"🏆", label:"Rang",       val:"Joueur"         },
              { icon:"⚡", label:"Activité",   val:"En ligne"       },
            ].map(item => (
              <div key={item.label} style={{
                background:"rgba(255,255,255,0.02)",
                border:"1px solid rgba(255,255,255,0.06)",
                borderRadius:10, padding:"14px 16px",
                display:"flex", alignItems:"center", gap:12,
              }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize:10, color:"#444", fontFamily:"Montserrat,sans-serif", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" }}>{item.label}</div>
                  <div style={{ fontSize:14, color:"#ccc", fontFamily:"Montserrat,sans-serif", fontWeight:600, marginTop:2 }}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}