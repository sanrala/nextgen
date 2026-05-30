import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";
import { Link, useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function Actu() {
  const { id } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "articles"),
          where("ig_id", "==", parseInt(id)),
          where("status", "==", "public"),
          orderBy("created_at", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          doc_id: doc.id,
          ...doc.data(),
        }));
        setArticles(data);
      } catch (e) {
        console.error("Erreur chargement articles Firestore", e);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticles();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#cc1a1a" }} />
      </Box>
    );
  }

  if (articles.length === 0) {
    return (
      <div>
        <h3 className="nk-decorated-h-2">
          <span>
            <span className="text-main-1">L'actualité </span> du jeu
          </span>
        </h3>
        <p style={{ color: "#666", fontFamily: "Rajdhani, sans-serif", fontSize: 15 }}>
          Aucun article publié pour ce jeu pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="nk-decorated-h-2">
        <span>
          <span className="text-main-1">L'actualité </span> du jeu
        </span>
      </h3>

      {articles.map((article) => (
        <div
          className="nk-blog-post nk-blog-post-border-bottom"
          key={article.doc_id}
        >
          <div className="row vertical-gap">

            {/* Image principale — première photo ou image du jeu IG */}
            <div className="col-lg-3 col-md-5">
              <Link
                to={`/article/${article.doc_id}`}
                className="nk-post-img"
              >
                <img
                  src={
                    article.photos && article.photos.length > 0
                      ? article.photos[0].url
                      : article.game_img
                  }
                  alt={article.title}
                  className="img-fluid"
                  style={{ borderRadius: 6, objectFit: "cover", width: "100%", height: 140 }}
                />
                <span className="nk-post-categories">
                  <span className="bg-main-1">{article.game_type}</span>
                </span>
              </Link>
            </div>

            {/* Contenu */}
            <div className="col-lg-9 col-md-7">
              <h2 className="nk-post-title h4">
                <Link to={`/article/${article.doc_id}`}>
                  {article.title}
                </Link>
              </h2>

              <div className="nk-post-date mt-10 mb-10">
                <span className="fa fa-calendar" />{" "}
                {formatDate(article.created_at)}
                &nbsp;&nbsp;
                <span className="fa fa-user" />{" "}
                {article.author_email?.split("@")[0]}
              </div>

              <div className="nk-post-text">
                <p>{article.content.slice(0, 200)}...</p>

                {/* Badges médias */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  {article.photos && article.photos.length > 0 && (
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 4,
                      background: "rgba(204,26,26,0.15)", color: "#cc1a1a",
                      fontWeight: 600
                    }}>
                      📷 {article.photos.length} photo{article.photos.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {article.youtube_id && (
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 4,
                      background: "rgba(255,0,0,0.1)", color: "#ff4444",
                      fontWeight: 600
                    }}>
                      ▶ Vidéo
                    </span>
                  )}
                </div>

                <Link
                  to={`/article/${article.doc_id}`}
                  className="nk-btn nk-btn-rounded nk-btn-color-dark-3 nk-btn-hover-color-main-1"
                >
                  Lire l'article
                </Link>
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}

export default Actu;