// GuideQuillEditor.jsx
// Éditeur React Quill avec bouton image custom : upload direct vers Cloudinary
// et insertion de l'URL à la position du curseur (texte + image librement mélangés).

import React, { useRef, useMemo, useCallback } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";

const CLOUDINARY_CLOUD = "dl0eijxyn";
const CLOUDINARY_PRESET = "ml_default";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("folder", "nextgen/guides");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const data = await res.json();
  return data.secure_url;
}

const QUILL_FORMATS = [
  "header", "bold", "italic", "underline", "strike",
  "blockquote", "list", "bullet", "color", "background",
  "link", "image", "align",
];

function GuideQuillEditor({ value, onChange, placeholder, onUploadStart, onUploadEnd }) {
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    // On mémorise la position du curseur AVANT l'upload (qui est async)
    const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };

    onUploadStart?.();
    try {
      const url = await uploadToCloudinary(file);
      editor.insertEmbed(range.index, "image", url, "user");
      editor.setSelection(range.index + 1, 0);
    } catch (err) {
      console.error("Erreur upload image guide:", err);
      alert("Erreur lors de l'upload de l'image : " + err.message);
    } finally {
      onUploadEnd?.();
    }
  }, [onUploadStart, onUploadEnd]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [2, 3, 4, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["blockquote", "link"],
        ["image"],
        ["clean"],
      ],
      handlers: {
        image: handleImageClick,
      },
    },
  }), [handleImageClick]);

  return (
    <div className="gd-guide-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={QUILL_FORMATS}
        placeholder={placeholder || "Rédigez votre guide ici. Utilisez le bouton image de la barre d'outils pour insérer une photo n'importe où dans le texte..."}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default GuideQuillEditor;
