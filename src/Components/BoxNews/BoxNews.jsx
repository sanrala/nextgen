import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";

function BoxNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, "articles"),
          where("status", "==", "public"),
          orderBy("created_at", "desc"),
          limit(5)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          doc_id: doc.id,
          ...doc.data(),
        }));
        setArticles(data);
      } catch (e) {
        console.error("Erreur chargement articles", e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading || articles.length === 0) return null;

  const main = articles[0];
  const rest = articles.slice(1);

  return (
    <div>
      <Link to="/actualités">
        <h3 className="nk-decorated-h-2">
          <span>
            <span className="text-main-1">Actualités</span> du jour
          </span>
        </h3>
      </Link>
      <div className="nk-gap"></div>

      <div className="nk-news-box">
        <div className="gallery-container">

          {/* Grande image — article le plus récent */}
          <div className="large-image-container">
            <Link to={`/article/${main.doc_id}`} className="nk-post-img">
              <img
                src={
                  main.photos && main.photos.length > 0
                    ? main.photos[0].url
                    : main.game_img
                }
                alt={main.title}
                className="large-image"
                onError={(e) => (e.target.style.display = "none")}
              />
              <span className="nk-post-categories">
                <span className="bg-main-1">NEWS</span>
              </span>
            </Link>
            <div className="image-title-large">{main.title}</div>
          </div>

          {/* Petites images — 4 articles suivants */}
          <div className="small-images-container">
            {rest.map((article) => (
              <div key={article.doc_id} className="small-image-container">
                <Link to={`/article/${article.doc_id}`} className="nk-post-img">
                  <img
                    src={
                      article.photos && article.photos.length > 0
                        ? article.photos[0].url
                        : article.game_img
                    }
                    alt={article.title}
                    className="small-image"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <span className="nk-post-categories">
                    <span className="bg-main-1">NEWS</span>
                  </span>
                </Link>
                <div className="image-title">{article.title}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default BoxNews;