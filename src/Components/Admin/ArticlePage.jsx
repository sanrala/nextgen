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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

          // Charger d'autres articles du même jeu
          const q = query(
            collection(db, "articles"),
            where("ig_id", "==", data.ig_id),
            where("status", "==", "public")
          );
          const similarSnap = await getDocs(q);
          const similar = similarSnap.docs
            .map((d) => ({ doc_id: d.id, ...d.data() }))
            .filter((a) => a.doc_id !== doc_id)
            .slice(0, 4);
          setSimilarArticles(similar);
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

  return (
    <div>
      <Header />

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

      <div className="container">
        <div className="row vertical-gap">
          <div className="col-lg-8">
            <div className="nk-blog-post nk-blog-post-single">
              <div className="nk-post-text mt-0">

                {/* Image principale du jeu */}
                <img
                  src={article.game_img}
                  alt={article.game_name}
                  className="img-fluid"
                  style={{ borderRadius: 8, marginBottom: 20 }}
                  onError={(e) => (e.target.style.display = "none")}
                />

                {/* Meta */}
                <div style={{
                  display: "flex", gap: 16, marginBottom: 20,
                  fontSize: 13, color: "#888", fontFamily: "Rajdhani, sans-serif",
                  flexWrap: "wrap", alignItems: "center"
                }}>
                  <span>
                    <i className="fa fa-calendar" style={{ marginRight: 6 }} />
                    {formatDate(article.created_at)}
                  </span>
                  <span>
                    <i className="fa fa-user" style={{ marginRight: 6 }} />
                    {article.author_email?.split("@")[0]}
                  </span>
                  <span style={{
                    background: "rgba(204,26,26,0.15)", color: "#cc1a1a",
                    padding: "2px 10px", borderRadius: 4, fontWeight: 600, fontSize: 12
                  }}>
                    {article.game_type}
                  </span>
                </div>

                {/* Titre */}
                <h4 style={{ color: "#f0f0f0", marginBottom: 20 }}>{article.title}</h4>

                {/* Contenu */}
                <div style={{
                  fontFamily: "Rajdhani, sans-serif", fontSize: 16,
                  lineHeight: 1.8, color: "#ccc", whiteSpace: "pre-wrap", marginBottom: 32
                }}>
                  {article.content}
                </div>

                {/* Galerie photos */}
                {hasPhotos && (
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{
                      fontFamily: "Orbitron, sans-serif", fontSize: 13,
                      color: "#cc1a1a", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase"
                    }}>
                      Photos
                    </h3>

                    {/* Photo principale */}
                    <img
                      src={article.photos[activePhoto].url}
                      alt={`Capture ${activePhoto + 1}`}
                      className="img-fluid"
                      style={{ borderRadius: 8, marginBottom: 10, width: "100%" }}
                    />

                    {/* Thumbnails */}
                    {article.photos.length > 1 && (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {article.photos.map((photo, i) => (
                          <div
                            key={i}
                            onClick={() => setActivePhoto(i)}
                            style={{
                              width: 72, height: 48, borderRadius: 6,
                              overflow: "hidden", cursor: "pointer",
                              border: i === activePhoto ? "2px solid #cc1a1a" : "2px solid transparent",
                              transition: "border-color 0.2s", flexShrink: 0
                            }}
                          >
                            <img
                              src={photo.url}
                              alt={`Miniature ${i + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Vidéo YouTube */}
                {article.youtube_id && (
                  <div className="video-container" style={{ marginBottom: 32 }}>
                    <iframe
                      title="YouTube Video"
                      src={`https://www.youtube.com/embed/${article.youtube_id}`}
                      frameBorder="0"
                      allowFullScreen
                      style={{ width: "100%", aspectRatio: "16/9", borderRadius: 8 }}
                    />
                  </div>
                )}

                {/* Autres articles du même jeu */}
                {similarArticles.length > 0 && (
                  <div style={{ marginTop: 40 }}>
                    <h3 style={{
                      fontFamily: "Orbitron, sans-serif", fontSize: 13,
                      color: "#cc1a1a", letterSpacing: 2, marginBottom: 20, textTransform: "uppercase"
                    }}>
                      Autres articles sur {article.game_name}
                    </h3>
                    {similarArticles.map((a) => (
                      <div key={a.doc_id} style={{
                        display: "flex", gap: 14, marginBottom: 16,
                        background: "#141414", borderRadius: 8, padding: 12,
                        border: "1px solid #222"
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
                          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                            {formatDate(a.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <div style={{
              background: "#141414", border: "1px solid #222",
              borderRadius: 10, overflow: "hidden", position: "sticky", top: 20
            }}>
              <img
                src={article.game_img}
                alt={article.game_name}
                style={{ width: "100%", display: "block" }}
                onError={(e) => (e.target.style.display = "none")}
              />
              <div style={{ padding: 16 }}>
                <div style={{
                  fontFamily: "Orbitron, sans-serif", fontSize: 13,
                  fontWeight: 700, color: "#f0f0f0", marginBottom: 8
                }}>
                  {article.game_name}
                </div>
                <div style={{
                  fontSize: 12, color: "#cc1a1a", fontFamily: "Orbitron, sans-serif",
                  letterSpacing: 1, marginBottom: 14
                }}>
                  ID #{article.ig_id}
                </div>
                <Link
                  to={`/PC/${article.ig_id}/${article.game_name}`}
                  className="nk-btn nk-btn-rounded nk-btn-color-main-1"
                  style={{ display: "block", textAlign: "center", fontSize: 12 }}
                >
                  Voir le jeu
                </Link>
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