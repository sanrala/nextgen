import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot,
  serverTimestamp, orderBy
} from "firebase/firestore";
import { db } from "../../Firebase";

// ── Constantes ────────────────────────────────────────────────────────────────
const REACTIONS = [
  { key: "like",    emoji: "👍", label: "J'aime"    },
  { key: "dislike", emoji: "👎", label: "J'aime pas" },
  { key: "love",    emoji: "❤️", label: "J'adore"   },
  { key: "funny",   emoji: "😂", label: "Drôle"     },
  { key: "wow",     emoji: "😮", label: "Wow"       },
  { key: "sad",     emoji: "😢", label: "Triste"    },
];

const EMOJIS = ["😀","😂","❤️","👍","🔥","🎮","⚡","💯","🤯","😍","👏","🙌","💪","🤔","😎","🥇","👀","🤙"];

// ── Styles inline ─────────────────────────────────────────────────────────────
const S = {
  wrap: { padding: "0 0 40px" },
  sortBar: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  sortBtn: (active) => ({
    background: active ? "rgba(221,22,59,0.15)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? "#dd163b" : "rgba(255,255,255,0.1)"}`,
    color: active ? "#fff" : "#888",
    borderRadius: 6, padding: "5px 14px", fontSize: 12,
    fontFamily: "Montserrat,sans-serif", fontWeight: 600,
    cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase",
    transition: "all 0.2s",
  }),
  formWrap: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 20, marginBottom: 28,
  },
  formHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  avatar: { width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  inputTitle: {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    color: "#fff", fontSize: 14, padding: "10px 14px",
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    marginBottom: 10,
  },
  textarea: {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    color: "#fff", fontSize: 14, padding: "10px 14px",
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    resize: "vertical", minHeight: 90,
  },
  emojiRow: { display: "flex", flexWrap: "wrap", gap: 4, margin: "10px 0" },
  emojiBtn: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6, fontSize: 18, cursor: "pointer", padding: "3px 6px",
    transition: "transform 0.15s",
  },
  starsRow: { display: "flex", gap: 4, margin: "8px 0", alignItems: "center" },
  submitBtn: {
    background: "#dd163b", border: "none", borderRadius: 8,
    color: "#fff", fontFamily: "Montserrat,sans-serif", fontWeight: 700,
    fontSize: 12, padding: "10px 22px", cursor: "pointer",
    letterSpacing: "0.08em", textTransform: "uppercase", float: "right",
    transition: "opacity 0.2s",
  },
  loginPrompt: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: "24px", textAlign: "center", marginBottom: 28,
  },
  // Carte commentaire
  card: (isReply) => ({
    background: isReply ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: isReply ? 8 : 12, padding: isReply ? "12px 14px" : 16,
    marginBottom: isReply ? 8 : 14,
  }),
  cardHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  userName: { color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "Montserrat,sans-serif" },
  dateStr: { color: "#555", fontSize: 12, marginLeft: 6 },
  msgText: { color: "#bbb", fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" },
  titleText: { color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 4, fontFamily: "Montserrat,sans-serif" },
  actionsRow: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" },
  reactionWrap: { position: "relative", display: "inline-flex" },
  reactionMain: (myReact) => ({
    background: myReact ? "rgba(221,22,59,0.12)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${myReact ? "rgba(221,22,59,0.4)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 6, cursor: "pointer", padding: "4px 10px",
    fontSize: 13, display: "flex", alignItems: "center", gap: 4,
    color: myReact ? "#fff" : "#888", transition: "all 0.2s",
  }),
  reactionPicker: {
    position: "absolute", bottom: "calc(100% + 6px)", left: 0,
    background: "#1a1f27", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, padding: "8px 10px", display: "flex", gap: 6,
    zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
    flexWrap: "wrap", width: 220,
  },
  pickerBtn: {
    background: "none", border: "none", cursor: "pointer",
    fontSize: 22, padding: "2px 4px", borderRadius: 6,
    transition: "transform 0.15s",
  },
  replyBtn: {
    background: "none", border: "none", color: "#666",
    cursor: "pointer", fontSize: 12, padding: "4px 8px",
    fontFamily: "Montserrat,sans-serif", letterSpacing: "0.05em",
    transition: "color 0.2s",
  },
  deleteBtn: {
    background: "none", border: "none", color: "#444",
    cursor: "pointer", fontSize: 11, padding: "4px 8px",
    fontFamily: "Montserrat,sans-serif", marginLeft: "auto",
  },
  countBubble: (active) => ({
    background: active ? "rgba(221,22,59,0.15)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${active ? "rgba(221,22,59,0.3)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 5, padding: "1px 7px", fontSize: 11,
    color: active ? "#fff" : "#666",
  }),
  repliesWrap: { marginTop: 12, marginLeft: 20, borderLeft: "2px solid rgba(255,255,255,0.06)", paddingLeft: 14 },
};

// ── Composant étoiles ─────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={S.starsRow}>
      <span style={{ fontSize: 12, color: "#666", fontFamily: "Montserrat,sans-serif" }}>Note :</span>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          style={{ fontSize: 20, cursor: "pointer", color: (hover || value) >= i ? "#f39c12" : "#333" }}
        >★</span>
      ))}
      {value > 0 && <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>{value}/5</span>}
    </div>
  );
}

// ── Picker réactions ─────────────────────────────────────────────────────────
function ReactionButton({ commentId, currentUserId, reactions = {} }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Ferme si clic extérieur
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Réaction actuelle de l'utilisateur
  const myReaction = currentUserId
    ? Object.entries(reactions).find(([,users]) => users?.includes(currentUserId))?.[0]
    : null;
  const myEmoji = myReaction ? REACTIONS.find(r => r.key === myReaction)?.emoji : null;

  // Total par réaction
  const totals = REACTIONS.map(r => ({
    ...r, count: (reactions[r.key] || []).length
  })).filter(r => r.count > 0);

  const handleReact = async (reactionKey) => {
    if (!currentUserId) return;
    setOpen(false);
    const ref2 = doc(db, "comments", commentId);
    const newReactions = { ...reactions };

    // Retire l'ancienne réaction si même touche
    REACTIONS.forEach(r => {
      if (newReactions[r.key]?.includes(currentUserId)) {
        newReactions[r.key] = newReactions[r.key].filter(u => u !== currentUserId);
      }
    });

    // Ajoute la nouvelle (sauf si c'était la même = toggle off)
    if (myReaction !== reactionKey) {
      newReactions[reactionKey] = [...(newReactions[reactionKey] || []), currentUserId];
    }

    try { await updateDoc(ref2, { reactions: newReactions }); } catch(e) { console.error(e); }
  };

  return (
    <div style={S.reactionWrap} ref={ref}>
      <button style={S.reactionMain(!!myReaction)} onClick={() => currentUserId && setOpen(v => !v)}>
        {myEmoji || "👍"} {myEmoji ? "Réagi" : "Réagir"}
      </button>
      {open && (
        <div style={S.reactionPicker}>
          {REACTIONS.map(r => (
            <button key={r.key} style={{ ...S.pickerBtn, transform: myReaction === r.key ? "scale(1.3)" : "scale(1)" }}
              title={r.label}
              onClick={() => handleReact(r.key)}>
              {r.emoji}
            </button>
          ))}
        </div>
      )}
      {/* Compteurs */}
      {totals.map(r => (
        <span key={r.key} style={{ ...S.countBubble(myReaction === r.key), marginLeft: 4, fontSize: 12 }}>
          {r.emoji} {r.count}
        </span>
      ))}
    </div>
  );
}

// ── Formulaire de commentaire / réponse ───────────────────────────────────────
function CommentForm({ user, userN, onSubmit, placeholder = "Écrire un commentaire...", isReply = false }) {
  const [message, setMessage] = useState("");
  const [title,   setTitle]   = useState("");
  const [rating,  setRating]  = useState(0);
  const [showEmojis, setShowEmojis] = useState(false);

  const insertEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await onSubmit({ title: title.trim(), message: message.trim(), rating });
    setTitle(""); setMessage(""); setRating(0);
  };

  return (
    <form onSubmit={handleSubmit} style={isReply ? { marginTop: 10 } : {}}>
      {!isReply && (
        <div style={S.formHeader}>
          <img src={userN?.photoURL || "https://zupimages.net/up/24/22/cib6.png"} alt="" style={S.avatar} />
          <span style={{ color: "#ccc", fontSize: 14, fontFamily: "Montserrat,sans-serif" }}>{user?.displayName}</span>
        </div>
      )}
      {!isReply && (
        <>
          <StarRating value={rating} onChange={setRating} />
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titre du commentaire (optionnel)"
            style={S.inputTitle}
          />
        </>
      )}
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={placeholder}
        style={{ ...S.textarea, minHeight: isReply ? 60 : 90 }}
        required
      />
      <div style={S.emojiRow}>
        <button type="button" style={S.emojiBtn} onClick={() => setShowEmojis(v => !v)} title="Emojis">
          😊
        </button>
        {showEmojis && EMOJIS.map(em => (
          <button key={em} type="button" style={S.emojiBtn}
            onMouseEnter={e => e.target.style.transform = "scale(1.3)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
            onClick={() => insertEmoji(em)}>
            {em}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button type="submit" style={S.submitBtn}>
          {isReply ? "Répondre" : "Publier"}
        </button>
      </div>
    </form>
  );
}

// ── Carte commentaire individuel ──────────────────────────────────────────────
function CommentCard({ comment, user, userN, gameKey, isReply = false }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState([]);
  const currentUserId = userN?.uid || null;

  // Charge les réponses (seulement pour les commentaires top-level)
  useEffect(() => {
    if (isReply) return;
    const q = query(
      collection(db, "comments"),
      where("parentId", "==", comment.id),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q,
      snap => setReplies(snap.docs.map(d => ({ ...d.data(), id: d.id }))),
      err  => console.warn("replies error:", err.message)
    );
    return () => unsub();
  }, [comment.id, isReply]);

  const handleReply = async ({ message }) => {
    if (!userN) return;
    await addDoc(collection(db, "comments"), {
      gameId: gameKey,
      parentId: comment.id,
      message,
      userName: userN.displayName || "Anonyme",
      userPhoto: userN.photoURL   || "",
      userId: userN.uid,
      reactions: {},
      createdAt: serverTimestamp(),
    });
    setShowReplyForm(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try { await deleteDoc(doc(db, "comments", comment.id)); } catch(e) { console.error(e); }
  };

  const date = comment.createdAt?.seconds
    ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })
    : "";

  const isOwner = userN?.uid && comment.userId === userN.uid;

  return (
    <div style={S.card(isReply)}>
      <div style={S.cardHeader}>
        <img src={comment.userPhoto || "https://zupimages.net/up/24/22/cib6.png"} alt="" style={{ ...S.avatar, width: isReply ? 28 : 36, height: isReply ? 28 : 36 }} />
        <div>
          <span style={S.userName}>{comment.userName}</span>
          <span style={S.dateStr}>{date}</span>
        </div>
        {/* Étoiles sur commentaire top-level */}
        {!isReply && comment.rating > 0 && (
          <span style={{ marginLeft: "auto", color: "#f39c12", fontSize: 14 }}>
            {"★".repeat(comment.rating)}{"☆".repeat(5 - comment.rating)}
          </span>
        )}
      </div>

      {comment.title && <div style={S.titleText}>{comment.title}</div>}
      <p style={S.msgText}>{comment.message}</p>

      {/* Actions */}
      <div style={S.actionsRow}>
        <ReactionButton commentId={comment.id} currentUserId={currentUserId} reactions={comment.reactions || {}} />
        {!isReply && user && (
          <button style={S.replyBtn}
            onMouseEnter={e => e.target.style.color = "#fff"}
            onMouseLeave={e => e.target.style.color = "#666"}
            onClick={() => setShowReplyForm(v => !v)}>
            💬 Répondre {replies.length > 0 && `(${replies.length})`}
          </button>
        )}
        {isOwner && (
          <button style={S.deleteBtn}
            onMouseEnter={e => e.target.style.color = "#dd163b"}
            onMouseLeave={e => e.target.style.color = "#444"}
            onClick={handleDelete}>
            🗑 Supprimer
          </button>
        )}
      </div>

      {/* Formulaire réponse */}
      {showReplyForm && (
        <div style={{ marginTop: 10 }}>
          <CommentForm user={user} userN={userN} onSubmit={handleReply}
            placeholder={`Répondre à ${comment.userName}...`} isReply />
        </div>
      )}

      {/* Réponses imbriquées */}
      {replies.length > 0 && (
        <div style={S.repliesWrap}>
          {replies.map(r => (
            <CommentCard key={r.id} comment={r} user={user} userN={userN} gameKey={gameKey} isReply />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function CommentsSection({ gameKey, user, userN }) {
  const [comments, setComments] = useState([]);
  const [sort, setSort]         = useState("recent"); // "recent" | "popular"
  const [submitting, setSubmitting] = useState(false);

  // Écoute commentaires top-level
  useEffect(() => {
    if (!gameKey) return;
    const q = query(
      collection(db, "comments"),
      where("gameId",   "==", gameKey),
      where("parentId", "==", null),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q,
      snap => setComments(snap.docs.map(d => ({ ...d.data(), id: d.id }))),
      err  => {
        // Fallback sans parentId==null si index manquant
        const q2 = query(collection(db, "comments"), where("gameId", "==", gameKey), orderBy("createdAt", "desc"));
        onSnapshot(q2,
          s2 => setComments(s2.docs.map(d => ({...d.data(), id: d.id})).filter(c => !c.parentId)),
          () => setComments([])
        );
      }
    );
    return () => unsub();
  }, [gameKey]);

  const handleSubmit = async ({ title, message, rating }) => {
    if (!userN || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        gameId: gameKey,
        parentId: null,
        title, message, rating,
        userName:  userN.displayName || "Anonyme",
        userPhoto: userN.photoURL    || "",
        userId:    userN.uid,
        reactions: {},
        createdAt: serverTimestamp(),
      });
    } catch(e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  // Tri
  const totalReactions = (c) =>
    Object.values(c.reactions || {}).reduce((a, arr) => a + (arr?.length || 0), 0);

  const sorted = [...comments].sort((a, b) => {
    if (sort === "popular") return totalReactions(b) - totalReactions(a);
    return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
  });

  // Moyenne étoiles
  const withRating = comments.filter(c => c.rating > 0);
  const avg = withRating.length
    ? (withRating.reduce((a, c) => a + c.rating, 0) / withRating.length).toFixed(1)
    : null;

  return (
    <div style={S.wrap}>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ color: "#fff", fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 16 }}>
          {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
        </span>
        {avg && (
          <span style={{ color: "#f39c12", fontSize: 14 }}>
            ★ {avg}/5 ({withRating.length} note{withRating.length !== 1 ? "s" : ""})
          </span>
        )}
      </div>

      {/* Tri */}
      <div style={S.sortBar}>
        <span style={{ color: "#666", fontSize: 12, fontFamily: "Montserrat,sans-serif" }}>Trier par :</span>
        <button style={S.sortBtn(sort === "recent")}  onClick={() => setSort("recent")}>🕐 Récents</button>
        <button style={S.sortBtn(sort === "popular")} onClick={() => setSort("popular")}>🔥 Populaires</button>
      </div>

      {/* Formulaire */}
      {user && userN?.emailVerified === false ? (
        <div style={S.loginPrompt}>
          <p style={{ color: "#f39c12", marginBottom: 8, fontFamily: "Montserrat,sans-serif", fontSize: 14, fontWeight: 700 }}>
            ✉️ Email non vérifié
          </p>
          <p style={{ color: "#888", marginBottom: 0, fontFamily: "Montserrat,sans-serif", fontSize: 13 }}>
            Vérifie ta boîte mail et clique sur le lien d'activation pour pouvoir commenter.
          </p>
        </div>
      ) : user ? (
        <div style={S.formWrap}>
          <CommentForm user={user} userN={userN} onSubmit={handleSubmit} />
        </div>
      ) : (
        <div style={S.loginPrompt}>
          <p style={{ color: "#888", marginBottom: 12, fontFamily: "Montserrat,sans-serif", fontSize: 14 }}>
            Connecte-toi pour laisser un commentaire
          </p>
          <Link to="/Login" style={{ background: "#dd163b", color: "#fff", borderRadius: 8, padding: "10px 24px", textDecoration: "none", fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 13 }}>
            Se connecter
          </Link>
        </div>
      )}

      {/* Liste */}
      {sorted.map(c => (
        <CommentCard key={c.id} comment={c} user={user} userN={userN} gameKey={gameKey} />
      ))}

      {comments.length === 0 && (
        <p style={{ color: "#555", fontFamily: "Montserrat,sans-serif", fontSize: 14, textAlign: "center", padding: "30px 0" }}>
          Aucun commentaire pour l'instant. Sois le premier !
        </p>
      )}
    </div>
  );
}