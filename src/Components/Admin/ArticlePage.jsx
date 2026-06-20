import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db, auth } from "../../Firebase";
import { useParams, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import CommentsSection from "../GameDetail/CommentsSection";

const SIDEBAR_STYLE = `
  .as-sidebar { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 36px; }
  .as-block-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #fff;
    margin: 0 0 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .as-block-title .as-dot { width: 4px; height: 14px; background: #cc1a1a; border-radius: 2px; flex-shrink: 0; }
  .as-block-title .as-accent { color: #cc1a1a; }

  .as-card {
    display: flex; gap: 12px;
    text-decoration: none;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 6px;
    transition: background 0.15s ease;
  }
  .as-card:hover { background: rgba(255,255,255,0.04); }
  .as-card-img {
    width: 90px; height: 58px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
    background: #111;
  }
  .as-card-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 13px; font-weight: 700;
    color: #ddd;
    line-height: 1.35;
    margin: 0 0 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .as-card-date {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    color: #555;
  }
  .as-empty {
    font-family: 'Rajdhani', sans-serif;
    font-size: 12px; color: #555;
  }
`;

function ArticleSidebar({ gameArticles, divArticles, formatDate }) {
  return (
    <div className="as-sidebar">
      <style>{SIDEBAR_STYLE}</style>

      <div>
        <h4 className="as-block-title">
          <span className="as-dot" />
          <span className="as-accent">Jeux vidéo</span>&nbsp;du moment
        </h4>
        {gameArticles.length > 0 ? (
          gameArticles.map((a) => (
            <Link key={a.doc_id} to={`/article/${a.doc_id}`} className="as-card">
              <img
                className="as-card-img"
                src={a.photos?.[0]?.url || a.game_img}
                alt={a.title}
                onError={(e) => (e.target.style.display = "none")}
              />
              <div>
                <p className="as-card-title">{a.title}</p>
                <span className="as-card-date">{formatDate(a.created_at)}</span>
              </div>
            </Link>
          ))
        ) : (
          <p className="as-empty">Aucun article pour le moment.</p>
        )}
      </div>

      <div>
        <h4 className="as-block-title">
          <span className="as-dot" />
          <span className="as-accent">High-tech</span>&nbsp;&amp; diverses
        </h4>
        {divArticles.length > 0 ? (
          divArticles.map((a) => (
            <Link key={a.doc_id} to={`/article/${a.doc_id}`} className="as-card">
              <img
                className="as-card-img"
                src={a.photos?.[0]?.url || a.game_img}
                alt={a.title}
                onError={(e) => (e.target.style.display = "none")}
              />
              <div>
                <p className="as-card-title">{a.title}</p>
                <span className="as-card-date">{formatDate(a.created_at)}</span>
              </div>
            </Link>
          ))
        ) : (
          <p className="as-empty">Aucun article pour le moment.</p>
        )}
      </div>

    </div>
  );
}

function ArticlePage() {
  const { doc_id } = useParams();
  const [article, setArticle] = useState(null);
  const [user,    setUser]    = useState(null);
  const [userN,   setUserN]   = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserN(u);
      setUser(u ? { displayName: u.displayName, uid: u.uid } : null);
    });
    return () => unsub();
  }, []);
  const [similarArticles, setSimilarArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [gameArticles, setGameArticles] = useState([]);
  const [divArticles, setDivArticles] = useState([]);

  const cleanTitle = (name) =>
    (name || "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");

  const gameLink = (igId, gameName) =>
    `/store/${igId}/0/${cleanTitle(gameName)}`;

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
          if (data.ig_id) {
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
        }
      } catch (e) {
        console.error("Erreur chargement article", e);
      } finally {
        setLoading(false);
      }
    };
    if (doc_id) fetchArticle();
  }, [doc_id]);

  // Sidebar : articles jeux vidéo récents + articles divers récents
  useEffect(() => {
    const fetchSidebarLists = async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("status", "==", "public"),
          orderBy("created_at", "desc"),
          limit(40)
        );
        const snap = await getDocs(q);
        const all = snap.docs
          .map((d) => ({ doc_id: d.id, ...d.data() }))
          .filter((a) => a.doc_id !== doc_id);

        setGameArticles(all.filter((a) => !a.isTest).slice(0, 6));
        setDivArticles(all.filter((a) => a.isTest).slice(0, 6));
      } catch (e) {
        console.error("Erreur chargement sidebar articles", e);
      }
    };
    fetchSidebarLists();
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

  const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const metaDescription = stripHtml(article.content).slice(0, 155);
  const metaImage = article.photos?.[0]?.url || article.game_img || "";
  const canonicalUrl = `https://nextgen-blue.vercel.app/article/${doc_id}`;
  const articleSchema = {
    "@context": "https://schema.org/",
    "@type": "Article",
    headline: article.title,
    image: metaImage ? [metaImage] : undefined,
    datePublished: article.created_at?.toDate ? article.created_at.toDate().toISOString() : undefined,
    author: { "@type": "Person", name: article.author_email || "NextGen Gaming" },
  };

  return (
    <div>
      <Helmet>
        <title>{article.title} — NextGen Gaming</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {metaImage && <meta property="og:image" content={metaImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>
      <Header />

      <div className="nk-main" style={{ paddingTop: 80, maxWidth: 1400, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div className="container">
          <ul className="nk-breadcrumbs">
            <li><Link to="/">Accueil</Link></li>
            <li><span className="fa fa-angle-right" /></li>
            {article.game_name && (
              <>
                <li>
                  <Link to={gameLink(article.ig_id, article.game_name)}>
                    {article.game_name}
                  </Link>
                </li>
                <li><span className="fa fa-angle-right" /></li>
              </>
            )}
            <li>{article.title}</li>
          </ul>
        </div>

        <div className="container" style={{ paddingBottom: 60 }}>
          <div className="row vertical-gap">
            <div className="col-lg-8">
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
                    {article.game_type && (
                      <span style={{
                        background: "rgba(204,26,26,0.15)", color: "#cc1a1a",
                        padding: "2px 10px", borderRadius: 4, fontWeight: 600, fontSize: 12
                      }}>
                        {article.game_type}
                      </span>
                    )}
                    {article.isTest && (
                      <span style={{
                        background: "rgba(255,255,255,0.08)", color: "#ddd",
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "2px 10px", borderRadius: 4, fontWeight: 600, fontSize: 12
                      }}>
                        {article.testCategory || "TESTS"}
                      </span>
                    )}
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
                      <Separator label={article.game_name ? `Autres articles — ${article.game_name}` : "Autres articles"} />
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
                  {article.game_name && (
                    <>
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
                            to={gameLink(article.ig_id, article.game_name)}
                            className="nk-btn nk-btn-rounded nk-btn-color-main-1"
                            style={{ fontSize: 12 }}
                          >
                            Voir le jeu
                          </Link>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── Commentaires ── */}
                  <Separator label="Commentaires" />
                  <CommentsSection
                    gameKey={`article_${doc_id}`}
                    user={user}
                    userN={userN}
                  />

                </div>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="col-lg-4">
              <ArticleSidebar gameArticles={gameArticles} divArticles={divArticles} formatDate={formatDate} />
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default ArticlePage;