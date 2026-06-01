import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  collection, addDoc, updateDoc, getDocs,
  doc, query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../Firebase";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Admin.css";

const IG_CATALOG_URL =
  "https://api.sm-artweb.fr/api/ig-catalog";
const CLOUDINARY_CLOUD = "dl0eijxyn";
const CLOUDINARY_PRESET = "ml_default";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header", "bold", "italic", "underline", "strike",
  "blockquote", "code-block", "list", "bullet",
  "color", "background", "link",
];

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("folder", "nextgen/articles");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: "POST", body: formData,
  });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const data = await res.json();
  return { url: data.secure_url, public_id: data.public_id, width: data.width, height: data.height };
}

function AdminConsole({ user }) {
  const [activeTab, setActiveTab] = useState("create");
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fileInputRef = useRef();

  // Chargement catalogue IG
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch(IG_CATALOG_URL);
        const data = await res.json();
        setCatalog(data);
      } catch (e) {
        console.error("Erreur catalogue", e);
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Chargement articles publiés
  const fetchArticles = useCallback(async () => {
    setArticlesLoading(true);
    try {
      const q = query(
        collection(db, "articles"),
        where("author_uid", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      setArticles(snap.docs.map((d) => ({ doc_id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Erreur articles", e);
    } finally {
      setArticlesLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    if (activeTab === "list") fetchArticles();
  }, [activeTab, fetchArticles]);

  // Filtrage recherche jeu
  useEffect(() => {
    if (search.trim().length < 2) { setResults([]); return; }
    const lower = search.toLowerCase();
    setResults(catalog.filter((g) => g.name.toLowerCase().includes(lower)).slice(0, 8));
  }, [search, catalog]);

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setSearch(game.name);
    setResults([]);
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setContent(article.content);
    setYoutubeUrl(article.youtube_url || "");
    setExistingPhotos(article.photos || []);
    setPhotos([]);
    setPhotoPreviews([]);
    const game = catalog.find((g) => g.id === article.ig_id);
    if (game) {
      setSelectedGame(game);
      setSearch(game.name);
    } else {
      setSelectedGame({ id: article.ig_id, name: article.game_name, img: article.game_img, type: article.game_type });
      setSearch(article.game_name);
    }
    setActiveTab("create");
    setSuccessMsg("");
    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewArticle = () => {
    setEditingArticle(null);
    setTitle("");
    setContent("");
    setYoutubeUrl("");
    setSelectedGame(null);
    setSearch("");
    setPhotos([]);
    setPhotoPreviews([]);
    setExistingPhotos([]);
    setSuccessMsg("");
    setErrorMsg("");
    setActiveTab("create");
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setPhotos((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setErrorMsg("");
  };

  const removeNewPhoto = (i) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const removeExistingPhoto = (i) => {
    setExistingPhotos((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    if (!selectedGame) { setErrorMsg("Veuillez sélectionner un jeu."); return; }
    if (!title.trim() || !content || content === "<p><br></p>") {
      setErrorMsg("Le titre et le contenu sont obligatoires."); return;
    }
    setSubmitting(true);
    try {
      const newPhotoData = [];
      for (let i = 0; i < photos.length; i++) {
        setUploadProgress(`Upload photo ${i + 1}/${photos.length}...`);
        newPhotoData.push(await uploadToCloudinary(photos[i]));
      }
      setUploadProgress("Sauvegarde...");

      const allPhotos = [...existingPhotos, ...newPhotoData];
      const youtubeId = getYouTubeId(youtubeUrl);
      const isEditing = !!editingArticle;

      const articleData = {
        ig_id: selectedGame.id,
        game_name: selectedGame.name,
        game_img: selectedGame.img,
        game_type: selectedGame.type,
        title: title.trim(),
        content,
        photos: allPhotos,
        youtube_id: youtubeId || null,
        youtube_url: youtubeUrl.trim() || null,
        status: "public",
        author_uid: user.uid,
        author_email: user.email,
        updated_at: serverTimestamp(),
      };

      if (isEditing) {
        await updateDoc(doc(db, "articles", editingArticle.doc_id), articleData);
      } else {
        articleData.created_at = serverTimestamp();
        await addDoc(collection(db, "articles"), articleData);
      }

      const msg = isEditing ? "Article mis à jour avec succès ! ✅" : "Article publié avec succès ! 🎉";
      handleNewArticle();
      setSuccessMsg(msg);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur : " + err.message);
    } finally {
      setSubmitting(false);
      setUploadProgress("");
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const youtubeId = getYouTubeId(youtubeUrl);

  return (
    <div className="admin-wrap">
      {/* Topbar */}
      <div className="admin-topbar">
        <button className="admin-burger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <span className="admin-topbar-logo">NXTGEN</span>
        <span className="admin-topbar-sep">›</span>
        <span className="admin-topbar-title">Console Admin</span>
        <span className="admin-topbar-user">{user.email}</span>
        <button className="admin-logout-btn" onClick={() => signOut(auth)}>Déconnexion</button>
      </div>

      <div className="admin-body">
        {/* Sidebar */}
        <div className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""}`}>
          <div className="sidebar-section">
            <div className="sidebar-label">Articles</div>
            <div
              className={`sidebar-item ${activeTab === "create" ? "active" : ""}`}
              onClick={() => { handleNewArticle(); setSidebarOpen(false); }}
            >
              <span className="sidebar-icon">✏</span>
              {editingArticle ? "Modifier l'article" : "Créer un article"}
            </div>
            <div
              className={`sidebar-item ${activeTab === "list" ? "active" : ""}`}
              onClick={() => { setActiveTab("list"); setSidebarOpen(false); }}
            >
              <span className="sidebar-icon">📋</span> Mes articles
            </div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">Catalogue</div>
            <div className="sidebar-item">
              <span className="sidebar-icon">🎮</span>
              {catalogLoading ? "Chargement..." : `${catalog.length} jeux`}
            </div>
          </div>
        </div>

        {/* Overlay mobile */}
        {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Contenu principal */}
        <div className="admin-content">

          {/* ── TAB : LISTE ── */}
          {activeTab === "list" && (
            <div>
              <div className="admin-section-title">
                <span className="step-badge">📋</span>
                Mes articles publiés
              </div>

              {articlesLoading ? (
                <div style={{ color: "#666", fontFamily: "Rajdhani", padding: "20px 0" }}>Chargement...</div>
              ) : articles.length === 0 ? (
                <div style={{ color: "#666", fontFamily: "Rajdhani", padding: "20px 0" }}>
                  Aucun article publié pour l'instant.
                </div>
              ) : (
                <div className="admin-articles-list">
                  {articles.map((article) => (
                    <div key={article.doc_id} className="admin-article-card">
                      <img
                        src={article.photos?.[0]?.url || article.game_img}
                        alt={article.title}
                        className="admin-article-card-img"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                      <div className="admin-article-card-body">
                        <div className="admin-article-card-game">{article.game_name}</div>
                        <div className="admin-article-card-title">{article.title}</div>
                        <div className="admin-article-card-meta">
                          {formatDate(article.created_at)}
                          {article.photos?.length > 0 && ` · 📷 ${article.photos.length}`}
                          {article.youtube_id && " · ▶ Vidéo"}
                        </div>
                      </div>
                      <button className="admin-edit-btn" onClick={() => handleEdit(article)}>
                        ✏ Modifier
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB : CRÉER / MODIFIER ── */}
          {activeTab === "create" && (
            <form onSubmit={handleSubmit}>

              {editingArticle && (
                <div className="admin-edit-banner">
                  ✏ Modification de : <strong>{editingArticle.title}</strong>
                  <button type="button" className="admin-edit-cancel" onClick={handleNewArticle}>
                    Annuler
                  </button>
                </div>
              )}

              <div className="admin-section-title">
                <span className="step-badge">1</span>
                Rechercher un jeu
              </div>

              <div className="admin-search-wrap">
                <span className="admin-search-icon">🔍</span>
                <input
                  className="admin-search-input"
                  type="text"
                  placeholder={catalogLoading ? "Chargement du catalogue..." : "Ex: Cyberpunk 2077, Elden Ring..."}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (selectedGame && e.target.value !== selectedGame.name) setSelectedGame(null);
                  }}
                  disabled={catalogLoading}
                  autoComplete="off"
                />
              </div>

              {results.length > 0 && (
                <div className="admin-results">
                  {results.map((game) => (
                    <div key={game.id} className="admin-result-item" onClick={() => handleSelectGame(game)}>
                      <img className="admin-result-img" src={game.img} alt={game.name} onError={(e) => (e.target.style.background = "#2a2a2a")} />
                      <div className="admin-result-name">{game.name}</div>
                      <span className="admin-type-badge">{game.type}</span>
                      <span className="admin-id-badge">#{game.id}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedGame && (
                <div className="admin-selected-game">
                  <img src={selectedGame.img} alt={selectedGame.name} onError={(e) => (e.target.style.background = "#2a2a2a")} />
                  <div className="admin-selected-info">
                    <div className="admin-selected-name">{selectedGame.name}</div>
                    <div className="admin-selected-id">ID Instant Gaming : #{selectedGame.id}</div>
                  </div>
                  <span className="admin-check">✔</span>
                </div>
              )}

              <div className="admin-divider" />

              <div className="admin-section-title">
                <span className="step-badge">2</span>
                Rédiger l'article
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Titre de l'article</label>
                <input
                  className="admin-form-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Notre test complet de Cyberpunk 2077..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Contenu</label>
                <div className="admin-quill-wrap">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    placeholder="Rédigez votre article ici..."
                  />
                </div>
              </div>

              <div className="admin-divider" />

              <div className="admin-section-title">
                <span className="step-badge">3</span>
                Médias
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Photos</label>

                {existingPhotos.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontFamily: "Orbitron", letterSpacing: 1 }}>
                      PHOTOS EXISTANTES
                    </div>
                    <div className="admin-photo-grid">
                      {existingPhotos.map((photo, i) => (
                        <div key={i} className="admin-photo-thumb">
                          <img src={photo.url} alt={`Existante ${i}`} />
                          <button type="button" className="admin-photo-remove" onClick={() => removeExistingPhoto(i)}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="admin-dropzone" onClick={() => fileInputRef.current.click()}>
                  <span className="admin-dropzone-icon">📷</span>
                  <span>Cliquez pour ajouter des photos</span>
                  <span className="admin-dropzone-hint">JPG, PNG, WEBP — hébergées sur Cloudinary</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handlePhotoChange} />

                {photoPreviews.length > 0 && (
                  <div className="admin-photo-grid" style={{ marginTop: 10 }}>
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="admin-photo-thumb">
                        <img src={src} alt={`Nouvelle ${i}`} />
                        <button type="button" className="admin-photo-remove" onClick={() => removeNewPhoto(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Vidéo YouTube (optionnel)</label>
                <input
                  className="admin-form-input"
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {youtubeId && (
                  <div className="admin-yt-preview">
                    <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt="Aperçu YouTube" />
                    <div className="admin-yt-overlay">▶</div>
                  </div>
                )}
              </div>

              {uploadProgress && <div className="admin-msg admin-msg-progress">{uploadProgress}</div>}
              {errorMsg && <div className="admin-msg admin-msg-error">{errorMsg}</div>}
              {successMsg && <div className="admin-msg admin-msg-success">{successMsg}</div>}

              <button className="admin-submit-btn" type="submit" disabled={submitting || !selectedGame}>
                {submitting
                  ? uploadProgress || "EN COURS..."
                  : editingArticle ? "METTRE À JOUR L'ARTICLE" : "PUBLIER L'ARTICLE"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminConsole;