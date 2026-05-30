import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../Firebase";
import "./Admin.css";

const IG_CATALOG_URL =
  "https://www.instant-gaming.com/fr/exportCatalog/json/?igr=gamer-707207";

const CLOUDINARY_CLOUD = "dl0eijxyn";
const CLOUDINARY_PRESET = "ml_default";

function getYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("folder", "nextgen/articles");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const data = await res.json();
  return {
    url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
  };
}

function AdminConsole({ user }) {
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch(IG_CATALOG_URL);
        const data = await res.json();
        setCatalog(data);
      } catch (e) {
        console.error("Erreur chargement catalogue IG", e);
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }
    const lower = search.toLowerCase();
    const filtered = catalog
      .filter((g) => g.name.toLowerCase().includes(lower))
      .slice(0, 8);
    setResults(filtered);
  }, [search, catalog]);

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setSearch(game.name);
    setResults([]);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setPhotos((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setPhotoPreviews((prev) => [...prev, ...previews]);
    setErrorMsg("");
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedGame) {
      setErrorMsg("Veuillez sélectionner un jeu.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setErrorMsg("Le titre et le contenu sont obligatoires.");
      return;
    }

    setSubmitting(true);

    try {
      // Upload photos sur Cloudinary
      const photoData = [];
      for (let i = 0; i < photos.length; i++) {
        setUploadProgress(`Upload photo ${i + 1}/${photos.length}...`);
        const result = await uploadToCloudinary(photos[i]);
        photoData.push(result);
      }

      setUploadProgress("Sauvegarde de l'article...");

      const youtubeId = getYouTubeId(youtubeUrl);

      await addDoc(collection(db, "articles"), {
        ig_id: selectedGame.id,
        game_name: selectedGame.name,
        game_img: selectedGame.img,
        game_type: selectedGame.type,
        title: title.trim(),
        content: content.trim(),
        photos: photoData,         // [{ url, public_id, width, height }]
        youtube_id: youtubeId || null,
        youtube_url: youtubeUrl.trim() || null,
        status: "public",
        author_uid: user.uid,
        author_email: user.email,
        created_at: serverTimestamp(),
      });

      setSuccessMsg("Article publié avec succès ! 🎉");
      setTitle("");
      setContent("");
      setYoutubeUrl("");
      setPhotos([]);
      setPhotoPreviews([]);
      setSelectedGame(null);
      setSearch("");
      setUploadProgress("");
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur lors de la publication : " + err.message);
      setUploadProgress("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => signOut(auth);
  const youtubeId = getYouTubeId(youtubeUrl);

  return (
    <div className="admin-wrap">
      <div className="admin-topbar">
        <span className="admin-topbar-logo">NXTGEN</span>
        <span className="admin-topbar-sep">›</span>
        <span className="admin-topbar-title">Console Admin</span>
        <span className="admin-topbar-user">{user.email}</span>
        <button className="admin-logout-btn" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>

      <div className="admin-body">
        <div className="admin-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">Articles</div>
            <div className="sidebar-item active">
              <span className="sidebar-icon">✏</span> Créer un article
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

        <div className="admin-content">
          <form onSubmit={handleSubmit}>

            <div className="admin-section-title">
              <span className="step-badge">1</span>
              Rechercher un jeu
            </div>

            <div className="admin-search-wrap">
              <span className="admin-search-icon">🔍</span>
              <input
                className="admin-search-input"
                type="text"
                placeholder={
                  catalogLoading
                    ? "Chargement du catalogue..."
                    : "Ex: Cyberpunk 2077, Elden Ring..."
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (selectedGame && e.target.value !== selectedGame.name) {
                    setSelectedGame(null);
                  }
                }}
                disabled={catalogLoading}
                autoComplete="off"
              />
            </div>

            {results.length > 0 && (
              <div className="admin-results">
                {results.map((game) => (
                  <div
                    key={game.id}
                    className="admin-result-item"
                    onClick={() => handleSelectGame(game)}
                  >
                    <img
                      className="admin-result-img"
                      src={game.img}
                      alt={game.name}
                      onError={(e) => (e.target.style.background = "#2a2a2a")}
                    />
                    <div className="admin-result-name">{game.name}</div>
                    <span className="admin-type-badge">{game.type}</span>
                    <span className="admin-id-badge">#{game.id}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedGame && (
              <div className="admin-selected-game">
                <img
                  src={selectedGame.img}
                  alt={selectedGame.name}
                  onError={(e) => (e.target.style.background = "#2a2a2a")}
                />
                <div className="admin-selected-info">
                  <div className="admin-selected-name">{selectedGame.name}</div>
                  <div className="admin-selected-id">
                    ID Instant Gaming : #{selectedGame.id}
                  </div>
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
              <textarea
                className="admin-form-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Rédigez votre article ici..."
                rows={8}
              />
            </div>

            <div className="admin-divider" />

            <div className="admin-section-title">
              <span className="step-badge">3</span>
              Médias
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Photos</label>
              <div
                className="admin-dropzone"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="admin-dropzone-icon">📷</span>
                <span>Cliquez pour ajouter des photos</span>
                <span className="admin-dropzone-hint">
                  JPG, PNG, WEBP — hébergées sur Cloudinary
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
              {photoPreviews.length > 0 && (
                <div className="admin-photo-grid">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="admin-photo-thumb">
                      <img src={src} alt={`capture-${i}`} />
                      <button
                        type="button"
                        className="admin-photo-remove"
                        onClick={() => removePhoto(i)}
                      >
                        ✕
                      </button>
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
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                    alt="YouTube preview"
                  />
                  <div className="admin-yt-overlay">▶</div>
                </div>
              )}
            </div>

            {uploadProgress && (
              <div className="admin-msg admin-msg-progress">{uploadProgress}</div>
            )}
            {errorMsg && (
              <div className="admin-msg admin-msg-error">{errorMsg}</div>
            )}
            {successMsg && (
              <div className="admin-msg admin-msg-success">{successMsg}</div>
            )}

            <button
              className="admin-submit-btn"
              type="submit"
              disabled={submitting || !selectedGame}
            >
              {submitting ? uploadProgress || "PUBLICATION EN COURS..." : "PUBLIER L'ARTICLE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminConsole;