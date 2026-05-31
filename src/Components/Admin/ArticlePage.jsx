import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";
import { useParams, Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

function ArticlePage() {
  const { doc_id } = useParams();
  const [article, setArticle] = useState(null);
  const [similarArticles, setSimilarArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  }

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "articles", doc_id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = { doc_id: snap.id, ...snap.data() };
          setArticle(data);
          const q = query(
            collection(db, "articles"),
            where("ig_id", "==", data.ig_id),
            where("status", "==", "public")
          );
          const similarSnap = await getDocs(q);
          setSimilarArticles(
            similarSnap.docs
              .map((d) => ({ doc_id: d.id, ...d.data() }))
              .filter((a) => a.doc_id !== doc_id)
              .slice(0, 4)
          );
        }
      } catch (e) {
        console.error("Erreur chargement article", e);
      } finally {
        setLoading(false);
      }
    };
    if (doc_id) fetchArticle();
  }, [doc_id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0d0d0d" }}>
        <CircularProgress sx={{ color: "#cc1a1a" }} />
      </Box>
    );
  }

  if (!article) {
    return (
      <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Article introuvable.</p>
      </div>
    );
  }

  const hasPhotos = article.photos && article.photos.length > 0;

  // Séparateur réutilisable
  const Separator = ({ label }) => (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      margin: "44px 0 32px"
    }}>
      <div style={{ width: 4, height: 20, background: "#cc1a1a", borderRadius: 2, flexShrink: 0 }} />
      <div style={{ width: 24, height: 2, background: "#cc1a1a", flexShrink: 0 }} />
      {label && (
        <span style={{
          fontFamily: "Orbitron, sans-serif", fontSize: 11,
          color: "#888", letterSpacing: 3, textTransform: "uppercase",
          whiteSpace: "nowrap", fontWeight: 700
        }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, #2a2a2a, transparent)" }} />
    </div>
  );

  return (
    <div>
      <Header />

      <div className="nk-main" style={{ paddingTop: 80, maxWidth: 1100, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div className="container">
          <ul className="nk-breadcrumbs">
            <li><Link to="/">Accueil</Link></li>
            <li><span className="fa fa-angle-right" /></li>
            <li>
              <Link to={`/PC/${article.ig_id}/${article.game_name}`}>
                {article.game_name}
              </Link>
            </li>
            <li><span className="fa fa-angle-right" /></li>
            <li>{article.title}</li>
          </ul>
        </div>

        <div className="container" style={{ paddingBottom: 60 }}>
          <div className="row vertical-gap">
            <div className="col-lg-12">
              <div className="nk-blog-post nk-blog-post-single">
                <div className="nk-post-text mt-0">

                  {/* ── Meta ── */}
                  <div style={{
                    display: "flex", gap: 12, marginBottom: 20,
                    fontSize: 13, color: "#888", fontFamily: "Rajdhani, sans-serif",
                    flexWrap: "wrap", alignItems: "center"
                  }}>
                    <span>
                      <i className="fa fa-calendar" style={{ marginRight: 6 }} />
                      {formatDate(article.created_at)}
                    </span>
                    <span style={{
                      background: "rgba(204,26,26,0.15)", color: "#cc1a1a",
                      padding: "2px 10px", borderRadius: 4, fontWeight: 600, fontSize: 12
                    }}>
                      {article.game_type}
                    </span>
                  </div>

                  {/* ── Photos ── */}
                  {hasPhotos && (
                    <>
                      <div style={{
                        width: "100%", maxHeight: 400, borderRadius: 10,
                        overflow: "hidden", marginBottom: 10,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.5)"
                      }}>
                        <img
                          src={article.photos[activePhoto].url}
                          alt={`Capture ${activePhoto + 1}`}
                          style={{
                            width: "100%", maxHeight: 400,
                            objectFit: "cover", display: "block"
                          }}
                        />
                      </div>

                      {article.photos.length > 1 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                          {article.photos.map((photo, i) => (
                            <div
                              key={i}
                              onClick={() => setActivePhoto(i)}
                              style={{
                                width: 72, height: 48, borderRadius: 6,
                                overflow: "hidden", cursor: "pointer",
                                border: i === activePhoto ? "2px solid #cc1a1a" : "2px solid transparent",
                                transition: "border-color 0.2s", flexShrink: 0,
                                opacity: i === activePhoto ? 1 : 0.6
                              }}
                            >
                              <img
                                src={photo.url}
                                alt={`Vignette ${i + 1}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* ── Séparateur avant texte ── */}
                  <Separator label="Article" />

                  {/* ── Contenu ── */}
                  <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  {/* ── Vidéo YouTube ── */}
                  {article.youtube_id && (
                    <>
                      <Separator label="Vidéo" />
                      <div style={{
                        borderRadius: 10, overflow: "hidden",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.5)"
                      }}>
                        <iframe
                          title="YouTube Video"
                          src={`https://www.youtube.com/embed/${article.youtube_id}`}
                          frameBorder="0"
                          allowFullScreen
                          style={{ width: "100%", aspectRatio: "16/9", display: "block" }}
                        />
                      </div>
                    </>
                  )}

                  {/* ── Autres articles ── */}
                  {similarArticles.length > 0 && (
                    <>
                      <Separator label={`Autres articles — ${article.game_name}`} />
                      {similarArticles.map((a) => (
                        <div key={a.doc_id} style={{
                          display: "flex", gap: 14, marginBottom: 12,
                          background: "#141414", borderRadius: 8, padding: 12,
                          border: "1px solid #1e1e1e",
                          transition: "border-color 0.2s"
                        }}>
                          <img
                            src={a.photos?.[0]?.url || a.game_img}
                            alt={a.title}
                            style={{ width: 80, height: 52, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
                            onError={(e) => (e.target.style.display = "none")}
                          />
                          <div>
                            <Link
                              to={`/article/${a.doc_id}`}
                              style={{ color: "#f0f0f0", fontFamily: "Rajdhani, sans-serif", fontWeight: 600, fontSize: 14 }}
                            >
                              {a.title}
                            </Link>
                            <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                              {formatDate(a.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* ── Carte Voir le jeu ── */}
                  <Separator label="Le jeu" />
                  <div style={{
                    display: "flex", alignItems: "center",
                    background: "#141414", border: "1px solid #1e1e1e",
                    borderRadius: 10, overflow: "hidden",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.4)"
                  }}>
                    <img
                      src={article.game_img}
                      alt={article.game_name}
                      style={{ width: 180, height: 110, objectFit: "cover", flexShrink: 0 }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <div style={{ padding: "16px 20px", flex: 1 }}>
                      <div style={{
                        fontFamily: "Orbitron, sans-serif", fontSize: 14,
                        fontWeight: 700, color: "#f0f0f0", marginBottom: 6
                      }}>
                        {article.game_name}
                      </div>
                      <div style={{
                        fontSize: 11, color: "#cc1a1a", fontFamily: "Orbitron, sans-serif",
                        letterSpacing: 1, marginBottom: 14
                      }}>
                        {article.game_type} · ID #{article.ig_id}
                      </div>
                      <Link
                        to={`/PC/${article.ig_id}/${article.game_name}`}
                        className="nk-btn nk-btn-rounded nk-btn-color-main-1"
                        style={{ fontSize: 12 }}
                      >
                        Voir le jeu
                      </Link>
                    </div>
                  </div>

                  {/* ── Commentaires ── */}
                  <Separator label="Commentaires" />

                  {/* Formulaire commentaire */}
                  <div style={{
                    background: "#141414", border: "1px solid #1e1e1e",
                    borderRadius: 10, padding: 24, marginBottom: 24
                  }}>
                    <div style={{
                      fontFamily: "Orbitron, sans-serif", fontSize: 12,
                      color: "#f0f0f0", letterSpacing: 1, marginBottom: 16
                    }}>
                      Laisser un commentaire
                    </div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <input
                        placeholder="Votre pseudo"
                        style={{
                          flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a",
                          borderRadius: 6, padding: "10px 14px", color: "#f0f0f0",
                          fontFamily: "Rajdhani, sans-serif", fontSize: 14, outline: "none"
                        }}
                      />
                      <input
                        placeholder="Votre email (optionnel)"
                        style={{
                          flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a",
                          borderRadius: 6, padding: "10px 14px", color: "#f0f0f0",
                          fontFamily: "Rajdhani, sans-serif", fontSize: 14, outline: "none"
                        }}
                      />
                    </div>
                    <textarea
                      placeholder="Votre commentaire..."
                      rows={4}
                      style={{
                        width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
                        borderRadius: 6, padding: "10px 14px", color: "#f0f0f0",
                        fontFamily: "Rajdhani, sans-serif", fontSize: 14, outline: "none",
                        resize: "vertical", marginBottom: 12
                      }}
                    />
                    <button style={{
                      background: "#cc1a1a", color: "#fff", border: "none",
                      borderRadius: 6, padding: "10px 24px",
                      fontFamily: "Orbitron, sans-serif", fontSize: 11,
                      fontWeight: 700, letterSpacing: 2, cursor: "pointer"
                    }}>
                      PUBLIER
                    </button>
                  </div>

                  {/* Liste commentaires (mock) */}
                  {[
                    { pseudo: "GamerX", date: "il y a 2 heures", texte: "Super article, merci pour les infos ! J'attendais vraiment ce jeu depuis longtemps.", avatar: "G" },
                    { pseudo: "NightWolf", date: "il y a 5 heures", texte: "Les notes sont impressionnantes, j'espère que le jeu est aussi bon que ce qu'on nous promet.", avatar: "N" },
                    { pseudo: "Shadow42", date: "hier", texte: "Dommage pour l'absence du doublage FR, c'est toujours frustrant.", avatar: "S" },
                  ].map((c, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 14, marginBottom: 16,
                      padding: "16px", background: "#111",
                      border: "1px solid #1e1e1e", borderRadius: 8
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "#cc1a1a22", border: "1px solid #cc1a1a44",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "Orbitron, sans-serif", fontSize: 14,
                        color: "#cc1a1a", fontWeight: 700, flexShrink: 0
                      }}>
                        {c.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{
                            fontFamily: "Orbitron, sans-serif", fontSize: 11,
                            color: "#f0f0f0", fontWeight: 700
                          }}>
                            {c.pseudo}
                          </span>
                          <span style={{ fontSize: 11, color: "#444", fontFamily: "Rajdhani, sans-serif" }}>
                            {c.date}
                          </span>
                        </div>
                        <p style={{
                          fontFamily: "Rajdhani, sans-serif", fontSize: 15,
                          color: "#aaa", lineHeight: 1.6, margin: 0
                        }}>
                          {c.texte}
                        </p>
                        <button style={{
                          background: "transparent", border: "none",
                          color: "#555", fontSize: 12, cursor: "pointer",
                          fontFamily: "Rajdhani, sans-serif", marginTop: 8,
                          padding: 0
                        }}>
                          👍 Répondre
                        </button>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default ArticlePage;