// GuideCreateModal.jsx
// Modale admin : créer ou modifier un guide/astuce pour un jeu donné.
// - Type (guide / astuce)
// - Titre
// - Contenu riche (texte + images libres, via GuideQuillEditor)
// Le titre du jeu vient automatiquement de l'ID Instant Gaming déjà résolu
// par GameGuides.jsx (existingGameName / existingGameImg).

import React, { useState } from "react";
import {
  doc, setDoc, addDoc, updateDoc, collection,
  serverTimestamp, increment,
} from "firebase/firestore";
import { db, auth } from "../../Firebase";
import { ensureGameGuidesDoc, recordRecentGuide } from "./guidesHelpers";
import GuideQuillEditor from "./GuideQuillEditor";
import "./GuidesAstuces.css";

function GuideCreateModal({ igId, existingGameName, existingGameImg, editingItem, onClose, onSaved }) {
  const [type, setType] = useState(editingItem?.type || "guide");
  const [title, setTitle] = useState(editingItem?.title || "");
  const [content, setContent] = useState(editingItem?.content || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editingItem;

  const handleSave = async () => {
    setError("");
    if (!title.trim()) { setError("Le titre est obligatoire."); return; }
    if (!content || content === "<p><br></p>") { setError("Le contenu ne peut pas être vide."); return; }

    setSaving(true);
    try {
      const pivotId = await ensureGameGuidesDoc({
        igId,
        gameName: existingGameName,
        gameImg: existingGameImg,
        gameType: null,
      });

      const itemData = {
        type,
        title: title.trim(),
        content,
        updatedAt: serverTimestamp(),
        authorUid: auth.currentUser?.uid || null,
      };

      if (isEditing) {
        await updateDoc(doc(db, "gameGuides", pivotId, "items", editingItem.id), itemData);
        await recordRecentGuide({
          itemId: editingItem.id,
          pivotId,
          igId,
          gameName: existingGameName,
          gameImg: existingGameImg,
          type,
          title: title.trim(),
        });
      } else {
        itemData.createdAt = serverTimestamp();
        const newDocRef = await addDoc(collection(db, "gameGuides", pivotId, "items"), itemData);
        await setDoc(doc(db, "gameGuides", pivotId), {
          guidesCount: increment(1),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        await recordRecentGuide({
          itemId: newDocRef.id,
          pivotId,
          igId,
          gameName: existingGameName,
          gameImg: existingGameImg,
          type,
          title: title.trim(),
        });
      }

      onSaved();
    } catch (e) {
      console.error("Erreur sauvegarde guide:", e);
      setError("Erreur : " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ga-modal-overlay" onClick={onClose}>
      <div className="ga-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ga-modal-header">
          <h2>{isEditing ? "Modifier" : "Nouveau"} {type === "guide" ? "guide" : "astuce"}</h2>
          <button className="ga-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="ga-modal-body">
          <div className="ga-modal-game-pill">
            {existingGameImg && <img src={existingGameImg} alt="" />}
            <span>{existingGameName}</span>
          </div>

          <div className="ga-form-group">
            <label className="ga-form-label">Type</label>
            <div className="ga-type-toggle">
              <button
                className={`ga-type-btn ${type === "guide" ? "ga-type-active" : ""}`}
                onClick={() => setType("guide")}
                disabled={isEditing}
              >
                📖 Guide
              </button>
              <button
                className={`ga-type-btn ${type === "astuce" ? "ga-type-active" : ""}`}
                onClick={() => setType("astuce")}
                disabled={isEditing}
              >
                💡 Astuce
              </button>
            </div>
          </div>

          <div className="ga-form-group">
            <label className="ga-form-label">Titre</label>
            <input
              className="ga-form-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "guide" ? "Ex: Walkthrough complet du chapitre 3" : "Ex: Comment battre le boss final facilement"}
            />
          </div>

          <div className="ga-form-group">
            <label className="ga-form-label">Contenu</label>
            <GuideQuillEditor
              value={content}
              onChange={setContent}
              onUploadStart={() => setUploading(true)}
              onUploadEnd={() => setUploading(false)}
            />
            {uploading && <div className="ga-upload-hint">📤 Upload de l'image en cours...</div>}
          </div>

          {error && <div className="ga-form-error">{error}</div>}
        </div>

        <div className="ga-modal-footer">
          <button className="ga-btn-secondary" onClick={onClose} disabled={saving}>
            Annuler
          </button>
          <button className="ga-btn-primary" onClick={handleSave} disabled={saving || uploading}>
            {saving ? "Sauvegarde..." : isEditing ? "💾 Mettre à jour" : "💾 Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuideCreateModal;
