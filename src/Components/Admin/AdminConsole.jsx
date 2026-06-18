import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  collection, addDoc, updateDoc, getDocs,
  doc, query, where, orderBy, serverTimestamp,
  getDoc, setDoc, deleteField
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

function getQuillModules(handleImageClick) {
  return {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: handleImageClick,
      },
    },
  };
}

const QUILL_FORMATS = [
  "header", "bold", "italic", "underline", "strike",
  "blockquote", "code-block", "list", "bullet",
  "color", "background", "link", "image",
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

  // ── State onglet Jeux ─────────────────────────────────────────────────────
  const [gameSearch, setGameSearch]       = useState("");
  const [gameResults, setGameResults]     = useState([]);
  const [selectedGameEdit, setSelectedGameEdit] = useState(null);
  const [gameFirebase, setGameFirebase]   = useState(null);
  const [gameLoading, setGameLoading]     = useState(false);
  const [gameSaving, setGameSaving]       = useState(false);
  const [gameMsg, setGameMsg]             = useState("");
  const [gameMsgType, setGameMsgType]     = useState("success");
  // ── State onglet Sliders ──────────────────────────────────────────────────
  const [sliderSearch, setSliderSearch]           = useState({ img: "", banner: "" });
  const [sliderResults, setSliderResults]         = useState({ img: [], banner: [] });
  const [sliderSelected, setSliderSelected]       = useState({ img: null, banner: null });
  const [sliderCurrent, setSliderCurrent]         = useState({ img: null, banner: null });
  const [sliderSaving, setSliderSaving]           = useState(false);
  const [sliderMsg, setSliderMsg]                 = useState("");
  const [sliderLoading, setSliderLoading]         = useState(false);
  const [sliderScreenshots, setSliderScreenshots] = useState({ img: [], banner: [] });
  const [sliderCover, setSliderCover]             = useState({ img: null, banner: null });
  const [sliderUploading, setSliderUploading]     = useState({ img: false, banner: false });
  const sliderScrollRef                           = useRef({ img: null, banner: null });
  // Champs éditables
  const [editDesc, setEditDesc]           = useState("");
  const [editDev, setEditDev]             = useState("");
  const [editPub, setEditPub]             = useState("");
  const [editDate, setEditDate]           = useState("");
  const [editDateMode, setEditDateMode]   = useState("global"); // "global" ou "byplatform"
  const [editDateByPlatform, setEditDateByPlatform] = useState({
    PC: "", PlayStation: "", Xbox: "", Nintendo: "",
  });
  const [editScreenshots, setEditScreenshots] = useState([]);
  const [newScreenFiles, setNewScreenFiles]   = useState([]);
  const [newScreenPreviews, setNewScreenPreviews] = useState([]);
  const [editCoverOptions, setEditCoverOptions]   = useState([]);
  const [editCover, setEditCover]                 = useState(null);
  const [editCoverUploading, setEditCoverUploading] = useState(false);
  const editCoverScrollRef                          = useRef(null);
  // Vidéos
  const [editMovies, setEditMovies]       = useState([]);
  const [newMovieHls, setNewMovieHls]     = useState("");
  const [newMovieName, setNewMovieName]   = useState("");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  // Mise en avant
  const [editFeatured, setEditFeatured]                   = useState(false);
  const [editFeaturedPlatforms, setEditFeaturedPlatforms] = useState([]);
  const [editMarkAsReleased, setEditMarkAsReleased]       = useState(false);
  const [editReleasedPlatforms, setEditReleasedPlatforms] = useState([]);
  const [editTrending, setEditTrending]                   = useState(false);
  const screenshotInputRef = useRef();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fileInputRef = useRef();

  // ── Upload d'image inline dans l'éditeur d'article (même mécanisme que
  // GuideQuillEditor.jsx : upload Cloudinary, insertion au curseur) ──
  const quillRef = useRef(null);
  const inlineImageInputRef = useRef(null);

  const handleInlineImageClick = useCallback(() => {
    inlineImageInputRef.current?.click();
  }, []);

  const handleInlineImageFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    // On mémorise la position du curseur AVANT l'upload (qui est async)
    const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };

    setUploadProgress("Upload de l'image...");
    try {
      const { url } = await uploadToCloudinary(file);
      editor.insertEmbed(range.index, "image", url, "user");
      editor.setSelection(range.index + 1, 0);
    } catch (err) {
      console.error("Erreur upload image article:", err);
      setErrorMsg("Erreur lors de l'upload de l'image : " + err.message);
    } finally {
      setUploadProgress("");
    }
  }, []);

  const quillModules = useMemo(
    () => getQuillModules(handleInlineImageClick),
    [handleInlineImageClick]
  );

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

  // Chargement config sliders au montage
  useEffect(() => {
    const loadSliderConfig = async () => {
      setSliderLoading(true);
      try {
        const snap = await getDoc(doc(db, "sliders", "config"));
        if (snap.exists()) {
          const data = snap.data();
          setSliderCurrent({
            img: data.imgSlider || null,
            banner: data.bannerSlider || null,
          });
          setSliderSelected({
            img: data.imgSlider || null,
            banner: data.bannerSlider || null,
          });
          setSliderCover({
            img: data.imgSlider?.customCover || null,
            banner: data.bannerSlider?.customCover || null,
          });
        }
      } catch (e) { console.error("Erreur chargement sliders", e); }
      finally { setSliderLoading(false); }
    };
    loadSliderConfig();
  }, []);

  // Recherche jeux pour les sliders
  useEffect(() => {
    const searchFor = (key) => {
      const q = sliderSearch[key].trim();
      if (q.length < 2) { setSliderResults(r => ({ ...r, [key]: [] })); return; }
      const lower = q.toLowerCase();
      setSliderResults(r => ({
        ...r,
        [key]: catalog.filter(g => g.name.toLowerCase().includes(lower)).slice(0, 6),
      }));
    };
    searchFor("img");
    searchFor("banner");
  }, [sliderSearch, catalog]);

  // Charger les screenshots Firebase quand un jeu est sélectionné
  const loadSliderScreenshots = async (key, igId) => {
    setSliderScreenshots(s => ({ ...s, [key]: [] }));
    setSliderCover(c => ({ ...c, [key]: null }));
    if (!igId) return;
    try {
      const snap = await getDoc(doc(db, "games", `ig_${igId}`));
      if (snap.exists()) {
        const d = snap.data();
        const steamId = d?.steamData?.steam_appid;
        const shots = d?.steamData?.screenshots || [];
        const options = [];
        // library_hero.jpg en premier si steam_id disponible
        if (steamId) {
          options.push({
            label: "Cover HD Steam (library hero)",
            url: `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/library_hero.jpg`,
            type: "hero",
          });
        }
        // Screenshots path_full
        shots.forEach((s, i) => {
          if (s.path_full) options.push({
            label: `Screenshot ${i + 1}`,
            url: s.path_full,
            type: "screenshot",
          });
        });
        setSliderScreenshots(prev => ({ ...prev, [key]: options }));
        // Pré-sélectionner library_hero si dispo
        if (options.length > 0) setSliderCover(c => ({ ...c, [key]: options[0].url }));
      }
    } catch (e) { console.error("Erreur chargement screenshots slider", e); }
  };

  const saveSliderConfig = async () => {
    setSliderSaving(true);
    setSliderMsg("");
    try {
      // Récupérer steam_id ET releaseDate depuis Firebase + API précommandes en une fois
      const enrichGame = async (igId) => {
        if (!igId) return { steam_id: 0, releaseDate: null };
        let steam_id = 0;
        let releaseDate = null;
        try {
          // 1. Firebase
          const snap = await getDoc(doc(db, "games", `ig_${igId}`));
          if (snap.exists()) {
            const d = snap.data();
            steam_id = d?.steamData?.steam_appid || 0;
            releaseDate = d?.steamData?.release_date?.date
            || d?.release_date?.date
            || null;
            if (!releaseDate) {
              const eds = d?.editions || [];
              const ed = eds.find(e => e.stock === 1 && parseFloat(e.price) > 0) || eds[0] || {};
              releaseDate = ed.releaseDate || null;
            }
          }
        } catch {}
        // 2. API précommandes si pas de date
        if (!releaseDate) {
          try {
            const preco = await fetch("https://api.sm-artweb.fr/api/precommandes")
              .then(r => r.ok ? r.json() : null).catch(() => null);
            if (preco) {
              const match = preco.find(g => g.id === igId || g.id === Number(igId));
              releaseDate = match?.releaseDate || match?.release_date || null;
            }
          } catch {}
        }
        return { steam_id, releaseDate };
      };

      const imgGame    = sliderSelected.img;
      const bannerGame = sliderSelected.banner;
      const imgId      = imgGame    ? (imgGame.id    ?? imgGame.igId    ?? null) : null;
      const bannerId   = bannerGame ? (bannerGame.id ?? bannerGame.igId ?? null) : null;

      const [imgExtra, bannerExtra] = await Promise.all([
        imgId    ? enrichGame(imgId)    : Promise.resolve({ steam_id: 0, releaseDate: null }),
        bannerId ? enrichGame(bannerId) : Promise.resolve({ steam_id: 0, releaseDate: null }),
      ]);

      await setDoc(doc(db, "sliders", "config"), {
        imgSlider: imgGame && imgId ? {
          igId:        imgId,
          name:        imgGame.name || "",
          img:         imgGame.img  || "",
          steam_id:    imgExtra.steam_id    || 0,
          releaseDate: imgExtra.releaseDate || null,
          customCover: sliderCover.img || null,
        } : null,
        bannerSlider: bannerGame && bannerId ? {
          igId:        bannerId,
          name:        bannerGame.name || "",
          img:         bannerGame.img  || "",
          steam_id:    bannerExtra.steam_id    || 0,
          releaseDate: bannerExtra.releaseDate || null,
          customCover: sliderCover.banner || null,
        } : null,
        updatedAt: new Date(),
      }, { merge: true });
      setSliderCurrent({ ...sliderSelected });
      setSliderMsg("✓ Configuration sauvegardée !");
    } catch (e) {
      console.error(e);
      setSliderMsg("✗ Erreur : " + e.message);
    } finally {
      setSliderSaving(false);
      setTimeout(() => setSliderMsg(""), 5000);
    }
  };

  // Filtrage recherche jeu
  useEffect(() => {
    if (search.trim().length < 2) { setResults([]); return; }
    const lower = search.toLowerCase();
    setResults(catalog.filter((g) => {
      const region = (g.region || "").toLowerCase();
      if (region.includes("latin") || (region.includes("us") && !region.includes("australia"))) return false;
      return g.name.toLowerCase().includes(lower);
    }).slice(0, 8));
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
    setIsBreaking(article.isBreaking || false);
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
    setIsBreaking(false);
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
        isBreaking: isBreaking,
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

  // ── Logique onglet Jeux ───────────────────────────────────────────────────

  // Recherche dans le catalogue
  useEffect(() => {
    if (gameSearch.trim().length < 2) { setGameResults([]); return; }
    const normalize = (s) => s.toLowerCase().replace(/[:\-''\u2018\u2019!?.,]/g, " ").replace(/\s+/g, " ").trim();
    const lower = normalize(gameSearch);
    const matching = catalog.filter(g => {
      const region = (g.region || "").toLowerCase();
      if (region.includes("latin") || (region.includes("us") && !region.includes("australia"))) return false;
      return normalize(g.name).includes(lower);
    });

    // Déduplique par nom de base uniquement (ignore la plateforme)
    // Garde : stock=1 en priorité, sinon hors stock quand même
    const seen = new Map();
    for (const g of matching) {
      const baseName = normalize(g.name)
        .replace(/deluxe|ultimate|gold|premium|standard|edition/g, "")
        .replace(/\s+/g, " ").trim();
      const key = baseName.slice(0, 40);
      const ex = seen.get(key);
      if (!ex) {
        seen.set(key, g);
      } else {
        // Préfère stock=1, sinon garde le moins cher
        if (g.stock === 1 && ex.stock !== 1) seen.set(key, g);
        else if (g.stock === ex.stock && parseFloat(g.price) < parseFloat(ex.price)) seen.set(key, g);
      }
    }
    setGameResults(Array.from(seen.values()).slice(0, 8));
  }, [gameSearch, catalog]);

  // Charge la fiche Firebase du jeu sélectionné
  const loadGameFirebase = async (game) => {
    setGameLoading(true);
    setGameFirebase(null);
    setGameMsg("");
    try {
      const fbRef = doc(db, "games", `ig_${game.id}`);
      const snap = await getDoc(fbRef);
      const data = snap.exists() ? snap.data() : null;
      setGameFirebase(data);
      // Pré-remplit les champs
      const sd = data?.steamData;
      setEditDesc(sd?.short_description || "");
      setEditDev(Array.isArray(sd?.developers) ? sd.developers[0] || "" : sd?.developers || "");
      setEditPub(Array.isArray(sd?.publishers) ? sd.publishers[0] || "" : sd?.publishers || "");
      setEditDate(sd?.release_date?.date || "");
      setEditDateMode(sd?.release_date?.byPlatform ? "byplatform" : "global");
      setEditDateByPlatform({
        PC:          sd?.release_date?.byPlatform?.PC          || "",
        PlayStation: sd?.release_date?.byPlatform?.PlayStation || "",
        Xbox:        sd?.release_date?.byPlatform?.Xbox        || "",
        Nintendo:    sd?.release_date?.byPlatform?.Nintendo    || "",
      });
      setEditScreenshots(sd?.screenshots || []);
      setEditMovies(sd?.movies || []);
      setNewMovieHls("");
      setNewMovieName("");
      setEditYoutubeUrl(sd?.youtube_id ? `https://www.youtube.com/watch?v=${sd.youtube_id}` : "");
      setNewScreenFiles([]);
      setNewScreenPreviews([]);

      // Construire les options de cover
      const steamId = sd?.steam_appid;
      const coverOpts = [];
      if (steamId) coverOpts.push({ label: "Cover HD Steam (library hero)", url: `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/library_hero.jpg`, type: "hero" });
      (sd?.screenshots || []).forEach((s, i) => {
        if (s.path_full) coverOpts.push({ label: `Screenshot ${i + 1}`, url: s.path_full, type: "screenshot" });
      });
      // Si une cover uploadée existe déjà, l'ajouter en fin de liste
      if (data?.customCover && !coverOpts.find(o => o.url === data.customCover)) {
        coverOpts.push({ label: "Upload", url: data.customCover, type: "upload" });
      }
      setEditCoverOptions(coverOpts);
      setEditCover(data?.customCover || (coverOpts.length > 0 ? coverOpts[0].url : null));
      // Mise en avant
      setEditFeatured(data?.featured || false);
      setEditFeaturedPlatforms(data?.featuredPlatforms || []);
      setEditMarkAsReleased(data?.releasedAt ? true : false);
      setEditReleasedPlatforms(data?.releasedAt ? (data?.featuredPlatforms || []) : []);
      setEditTrending(data?.trending || false);
    } catch (e) {
      setGameMsg("Erreur chargement Firebase : " + e.message);
      setGameMsgType("error");
    } finally {
      setGameLoading(false);
    }
  };

  const handleSelectGameEdit = (game) => {
    setSelectedGameEdit(game);
    setGameSearch(game.name);
    setGameResults([]);
    loadGameFirebase(game);
  };

  // Ajout de nouveaux screenshots
  const handleScreenshotFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setNewScreenFiles(prev => [...prev, ...files]);
    setNewScreenPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingScreen = (i) => {
    setEditScreenshots(prev => prev.filter((_, idx) => idx !== i));
  };

  const removeNewScreen = (i) => {
    setNewScreenFiles(prev => prev.filter((_, idx) => idx !== i));
    setNewScreenPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  // Sauvegarde dans Firebase
  const handleSaveGame = async () => {
    if (!selectedGameEdit) return;
    setGameSaving(true);
    setGameMsg("");
    try {
      // Upload nouveaux screenshots sur Cloudinary
      const uploaded = [];
      for (let i = 0; i < newScreenFiles.length; i++) {
        const formData = new FormData();
        formData.append("file", newScreenFiles[i]);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        formData.append("folder", "nextgen/screenshots");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: formData });
        const data = await res.json();
        uploaded.push({ id: Date.now() + i, path_full: data.secure_url, path_thumbnail: data.secure_url });
      }

      const allScreenshots = [...editScreenshots, ...uploaded];

      // Ajout nouvelle vidéo si renseignée
      let allMovies = [...editMovies];
      if (newMovieHls.trim()) {
        allMovies = [{
          id: Date.now(),
          name: newMovieName.trim() || "Bande-annonce",
          hls_h264: newMovieHls.trim(),
          highlight: true,
          thumbnail: "",
        }, ...allMovies];
      }

      // Extrait youtube_id depuis l'URL
      const ytMatch = editYoutubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const ytId = ytMatch ? ytMatch[1] : null;

      // Merge dans Firebase
      const fbRef = doc(db, "games", `ig_${selectedGameEdit.id}`);
      await setDoc(fbRef, {
        steamData: {
          ...(gameFirebase?.steamData || {}),
          short_description: editDesc,
          developers: [editDev],
          publishers: [editPub],
          release_date: {
            ...(gameFirebase?.steamData?.release_date || {}),
            date: editDateMode === "global" ? editDate : "",
            byPlatform: editDateMode === "byplatform" ? editDateByPlatform : null,
          },
          screenshots: allScreenshots,
          movies: allMovies,
          ...(ytId ? { youtube_id: ytId } : {}),
        },
        featured: editMarkAsReleased ? false : editFeatured,
        featuredPlatforms: editMarkAsReleased
          ? editReleasedPlatforms
          : (editFeatured ? editFeaturedPlatforms : []),
        featuredGame: (editFeatured || editMarkAsReleased) ? {
          id: selectedGameEdit.id,
          name: selectedGameEdit.name,
          img: selectedGameEdit.img,
          type: selectedGameEdit.type,
          platforms: editMarkAsReleased ? editReleasedPlatforms : editFeaturedPlatforms,
        } : null,
        releasedAt: editMarkAsReleased
          ? (editDate || editDateByPlatform?.PlayStation || editDateByPlatform?.Xbox || editDateByPlatform?.Nintendo || "sorti")
          : null,
        trending: editTrending,
        trendingGame: editTrending ? {
          id: selectedGameEdit.id,
          name: selectedGameEdit.name,
          img: selectedGameEdit.img,
          type: selectedGameEdit.type,
        } : null,
        customCover: editCover || null,
        savedAt: serverTimestamp(),
      }, { merge: true });

      setEditScreenshots(allScreenshots);
      setEditMovies(allMovies);
      setNewMovieHls("");
      setNewMovieName("");
      setNewScreenFiles([]);
      setNewScreenPreviews([]);
      setGameMsg("✅ Fiche mise à jour avec succès !");
      setGameMsgType("success");
    } catch (e) {
      setGameMsg("Erreur : " + e.message);
      setGameMsgType("error");
    } finally {
      setGameSaving(false);
    }
  };

  // Forcer un refresh (vide steamData du cache Firebase)
  const handleForceRefresh = async () => {
    if (!selectedGameEdit) return;
    if (!window.confirm(`Vider le cache Firebase de "${selectedGameEdit.name}" ? Il sera re-fetché à la prochaine visite.`)) return;
    setGameSaving(true);
    try {
      const fbRef = doc(db, "games", `ig_${selectedGameEdit.id}`);
      await setDoc(fbRef, { steamData: deleteField(), savedAt: deleteField() }, { merge: true });
      setGameFirebase(null);
      setEditDesc(""); setEditDev(""); setEditPub(""); setEditDate(""); setEditScreenshots([]);
      setGameMsg("🔄 Cache vidé. La fiche sera rechargée depuis Steam/RAWG à la prochaine visite.");
      setGameMsgType("success");
    } catch (e) {
      setGameMsg("Erreur : " + e.message);
      setGameMsgType("error");
    } finally {
      setGameSaving(false);
    }
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
            <div className="sidebar-label">Jeux</div>
            <div
              className={`sidebar-item ${activeTab === "games" ? "active" : ""}`}
              onClick={() => { setActiveTab("games"); setSidebarOpen(false); }}
            >
              <span className="sidebar-icon">🎮</span> Modifier une fiche
            </div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">Vitrines</div>
            <div
              className={`sidebar-item ${activeTab === "sliders" ? "active" : ""}`}
              onClick={() => { setActiveTab("sliders"); setSidebarOpen(false); }}
            >
              <span className="sidebar-icon">🖼</span> Sliders d'accueil
            </div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-label">Catalogue</div>
            <div className="sidebar-item">
              <span className="sidebar-icon">📦</span>
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
                        <div className="admin-article-card-game">
                          {article.game_name}
                          {article.isBreaking && (
                            <span style={{
                              marginLeft: 8, fontSize: 10, fontWeight: 700, color: "#fff",
                              background: "#dd163b", borderRadius: 4, padding: "2px 6px",
                              fontFamily: "Orbitron", letterSpacing: 0.5,
                            }}>
                              ⚡ IMPORTANTE
                            </span>
                          )}
                        </div>
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
                      {(() => {
                        const r = (game.region || "").toLowerCase();
                        const isEU = r.includes("europe") || r.includes("fr");
                        const isWW = r === "worldwide";
                        const isUS = r.includes("us") && !r.includes("australia");
                        if (!isEU && !isWW && !isUS) return null;
                        return <span style={{ fontSize: 10, fontWeight: 600, color: isEU ? "#27ae60" : isWW ? "#6666cc" : "#cc7700", opacity: 0.8 }}>{isEU ? "🇪🇺 EU" : isWW ? "🌍 WW" : "🇺🇸 US"}</span>;
                      })()}
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
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    formats={QUILL_FORMATS}
                    placeholder="Rédigez votre article ici. Utilisez le bouton image de la barre d'outils pour insérer une photo n'importe où dans le texte..."
                  />
                  <input
                    ref={inlineImageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleInlineImageFileChange}
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

              <div className="admin-divider" />

              <div className="admin-form-group">
                <label className="admin-form-label">⚡ News importante</label>
                <div style={{ fontSize: 11, color: "#888", fontFamily: "Rajdhani", marginBottom: 10 }}>
                  Active pour mettre cet article en avant dans le carousel des actualités importantes.
                </div>
                <label
                  style={{
                    display: "flex", alignItems: "center", gap: 10, cursor: "pointer", width: "fit-content",
                  }}
                  onClick={() => setIsBreaking(prev => !prev)}
                >
                  <span
                    style={{
                      position: "relative", width: 46, height: 26, borderRadius: 13,
                      background: isBreaking ? "#dd163b" : "rgba(255,255,255,0.12)",
                      border: `1px solid ${isBreaking ? "#dd163b" : "#444"}`,
                      transition: "background 0.2s, border-color 0.2s", flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute", top: 2, left: isBreaking ? 22 : 2,
                        width: 20, height: 20, borderRadius: "50%", background: "#fff",
                        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    />
                  </span>
                  <span style={{
                    fontFamily: "Rajdhani", fontSize: 15,
                    color: isBreaking ? "#dd163b" : "#aaa",
                  }}>
                    {isBreaking ? "Marquée comme news importante" : "Article standard"}
                  </span>
                </label>
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
          {/* ── TAB : JEUX ── */}
          {activeTab === "games" && (
            <div>
              <div className="admin-section-title">
                <span className="step-badge">🎮</span>
                Modifier une fiche jeu
              </div>

              {/* Recherche */}
              <div className="admin-search-wrap">
                <span className="admin-search-icon">🔍</span>
                <input
                  className="admin-search-input"
                  type="text"
                  placeholder={catalogLoading ? "Chargement..." : "Rechercher un jeu..."}
                  value={gameSearch}
                  onChange={e => {
                    setGameSearch(e.target.value);
                    if (selectedGameEdit && e.target.value !== selectedGameEdit.name) {
                      setSelectedGameEdit(null); setGameFirebase(null);
                    }
                  }}
                  disabled={catalogLoading}
                  autoComplete="off"
                />
              </div>

              {gameResults.length > 0 && (
                <div className="admin-results">
                  {gameResults.map(game => (
                    <div key={game.id} className="admin-result-item" onClick={() => handleSelectGameEdit(game)}>
                      <img className="admin-result-img" src={game.img} alt={game.name} onError={e => e.target.style.background="#2a2a2a"} />
                      <div className="admin-result-name">{game.name}</div>
                      <span className="admin-type-badge">{game.type}</span>
                      {(() => {
                        const r = (game.region || "").toLowerCase();
                        const isEU = r.includes("europe") || r.includes("fr");
                        const isWW = r === "worldwide";
                        const isUS = r.includes("us") && !r.includes("australia");
                        if (!isEU && !isWW && !isUS) return null;
                        return <span style={{ fontSize: 10, fontWeight: 600, color: isEU ? "#27ae60" : isWW ? "#6666cc" : "#cc7700", opacity: 0.8 }}>{isEU ? "🇪🇺 EU" : isWW ? "🌍 WW" : "🇺🇸 US"}</span>;
                      })()}
                      <span className="admin-id-badge">#{game.id}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedGameEdit && (
                <div className="admin-selected-game" style={{ marginBottom: 24 }}>
                  <img src={selectedGameEdit.img} alt={selectedGameEdit.name} onError={e => e.target.style.background="#2a2a2a"} />
                  <div className="admin-selected-info">
                    <div className="admin-selected-name">{selectedGameEdit.name}</div>
                    <div className="admin-selected-id">ID IG : #{selectedGameEdit.id} · {selectedGameEdit.type}</div>
                  </div>
                  <span className="admin-check">✔</span>
                </div>
              )}

              {gameLoading && (
                <div style={{ color: "#666", fontFamily: "Rajdhani", padding: "20px 0" }}>Chargement de la fiche Firebase...</div>
              )}

              {selectedGameEdit && !gameLoading && (
                <>
                  {!gameFirebase?.steamData && (
                    <div className="admin-msg" style={{ background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.25)", color: "#f39c12", marginBottom: 20 }}>
                      ⚠ Aucune fiche en cache Firebase pour ce jeu. Elle sera chargée depuis Steam/RAWG à la première visite.
                    </div>
                  )}

                  <div className="admin-divider" />

                  {/* Description */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Description courte</label>
                    <textarea
                      className="admin-form-input"
                      rows={4}
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      placeholder="Description courte du jeu..."
                      style={{ resize: "vertical", fontFamily: "Rajdhani, sans-serif" }}
                    />
                  </div>

                  {/* Développeur / Éditeur / Date */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div className="admin-form-group" style={{ flex: "1 1 180px" }}>
                      <label className="admin-form-label">Développeur</label>
                      <input className="admin-form-input" type="text" value={editDev} onChange={e => setEditDev(e.target.value)} placeholder="Ex: IO Interactive" />
                    </div>
                    <div className="admin-form-group" style={{ flex: "1 1 180px" }}>
                      <label className="admin-form-label">Éditeur</label>
                      <input className="admin-form-input" type="text" value={editPub} onChange={e => setEditPub(e.target.value)} placeholder="Ex: IO Interactive A/S" />
                    </div>
                  </div>

                  {/* Date de sortie */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Date de sortie</label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      {["global", "byplatform"].map(mode => (
                        <label key={mode} style={{
                          display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                          fontFamily: "Rajdhani", fontSize: 13,
                          color: editDateMode === mode ? "#dd163b" : "#aaa",
                          background: editDateMode === mode ? "rgba(221,22,59,0.08)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${editDateMode === mode ? "#dd163b" : "#333"}`,
                          borderRadius: 4, padding: "5px 12px",
                        }}>
                          <input
                            type="radio"
                            checked={editDateMode === mode}
                            onChange={() => setEditDateMode(mode)}
                            style={{ accentColor: "#dd163b" }}
                          />
                          {mode === "global" ? "Même date pour toutes les plateformes" : "Date différente par plateforme"}
                        </label>
                      ))}
                    </div>

                    {editDateMode === "global" && (
                      <input
                        className="admin-form-input"
                        type="text"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        placeholder="Ex: 26 mai 2026"
                      />
                    )}

                    {editDateMode === "byplatform" && (
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {["PC", "PlayStation", "Xbox", "Nintendo"].map(p => (
                          <div key={p} className="admin-form-group" style={{ flex: "1 1 140px" }}>
                            <label className="admin-form-label" style={{ fontSize: 11 }}>{p}</label>
                            <input
                              className="admin-form-input"
                              type="text"
                              value={editDateByPlatform[p]}
                              onChange={e => setEditDateByPlatform(prev => ({ ...prev, [p]: e.target.value }))}
                              placeholder={p === "PC" ? "Date inconnue" : "Ex: 26 mai 2026"}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="admin-divider" />

                  {/* Vidéos */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Bandes-annonces ({editMovies.length})</label>

                    {/* Vidéos existantes */}
                    {editMovies.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                        {editMovies.map((m, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            background: "rgba(255,255,255,0.03)", border: "1px solid #222",
                            borderRadius: 6, padding: "8px 12px",
                          }}>
                            {m.thumbnail && <img src={m.thumbnail} alt="" style={{ width: 60, height: 34, objectFit: "cover", borderRadius: 3 }} />}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, color: "#ccc", fontFamily: "Rajdhani", fontWeight: 700 }}>{m.name || "Bande-annonce"}</div>
                              <div style={{ fontSize: 10, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.hls_h264 || m.hls_h265 || "—"}</div>
                            </div>
                            <button type="button" className="admin-photo-remove" style={{ position: "static", flexShrink: 0 }}
                              onClick={() => setEditMovies(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ajouter une nouvelle vidéo via URL HLS */}
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed #333", borderRadius: 6, padding: 14 }}>
                      <div style={{ fontSize: 11, color: "#666", fontFamily: "Orbitron", letterSpacing: 1, marginBottom: 10 }}>AJOUTER UNE VIDÉO (URL HLS)</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input
                          className="admin-form-input"
                          type="text"
                          placeholder="Nom (ex: Trailer officiel)"
                          value={newMovieName}
                          onChange={e => setNewMovieName(e.target.value)}
                          style={{ flex: "1 1 160px" }}
                        />
                        <input
                          className="admin-form-input"
                          type="text"
                          placeholder="URL HLS (.m3u8) ou MP4"
                          value={newMovieHls}
                          onChange={e => setNewMovieHls(e.target.value)}
                          style={{ flex: "2 1 260px" }}
                        />
                      </div>
                      {newMovieHls && (
                        <div style={{ fontSize: 11, color: "#27ae60", marginTop: 6, fontFamily: "Rajdhani" }}>
                          ✓ URL renseignée — sera ajoutée en première position à la sauvegarde
                        </div>
                      )}
                    </div>

                    {/* YouTube */}
                    <div style={{ marginTop: 12, background: "rgba(255,0,0,0.04)", border: "1px dashed #8b0000", borderRadius: 6, padding: 14 }}>
                      <div style={{ fontSize: 11, color: "#8b0000", fontFamily: "Orbitron", letterSpacing: 1, marginBottom: 10 }}>▶ VIDÉO YOUTUBE (FALLBACK)</div>
                      <input
                        className="admin-form-input"
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={editYoutubeUrl}
                        onChange={e => setEditYoutubeUrl(e.target.value)}
                      />
                      {editYoutubeUrl && (() => {
                        const m = editYoutubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                        return m ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                            <img src={`https://img.youtube.com/vi/${m[1]}/mqdefault.jpg`} alt="preview" style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4 }} />
                            <span style={{ fontSize: 11, color: "#27ae60", fontFamily: "Rajdhani" }}>✓ YouTube ID : {m[1]}</span>
                          </div>
                        ) : <div style={{ fontSize: 11, color: "#e74c3c", marginTop: 6, fontFamily: "Rajdhani" }}>URL YouTube non reconnue</div>;
                      })()}
                    </div>
                  </div>

                  {/* Cover du slider */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Cover du slider</label>
                    <div style={{ fontSize: 11, color: "#666", fontFamily: "Rajdhani", marginBottom: 10 }}>
                      Image affichée dans ImgSlider / BannerSlider si ce jeu est sélectionné.
                    </div>
                    {editCoverOptions.length > 0 ? (
                      <>
                        <div ref={editCoverScrollRef} style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                          {editCoverOptions.map((opt, i) => (
                            <div key={i} onClick={() => setEditCover(opt.url)}
                              style={{ flexShrink: 0, cursor: "pointer", borderRadius: 4, overflow: "hidden", border: `2px solid ${editCover === opt.url ? "#dd163b" : "rgba(255,255,255,0.1)"}`, transition: "border-color 0.15s", position: "relative" }}>
                              <img src={opt.url} alt={opt.label} style={{ width: 140, height: 80, objectFit: "cover", display: "block" }} onError={e => e.target.style.display = "none"} />
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.75)", color: "#fff", fontSize: 8, fontFamily: "Orbitron,sans-serif", padding: "2px 6px", letterSpacing: 0.5 }}>
                                {opt.type === "hero" ? "⭐ HERO" : opt.type === "upload" ? "📤 UPLOAD" : `#${i}`}
                              </div>
                            </div>
                          ))}
                          {/* Upload Cloudinary */}
                          <label style={{ flexShrink: 0, width: 140, height: 80, cursor: editCoverUploading ? "wait" : "pointer", border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: editCoverUploading ? "#dd163b" : "#555", fontSize: 11, fontFamily: "Rajdhani", gap: 4, opacity: editCoverUploading ? 0.7 : 1 }}>
                            <span style={{ fontSize: 20 }}>{editCoverUploading ? "⏳" : "📁"}</span>
                            {editCoverUploading ? "Upload..." : "Upload manuel"}
                            <input type="file" accept="image/*" style={{ display: "none" }} disabled={editCoverUploading}
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setEditCoverUploading(true);
                                try {
                                  const fd = new FormData();
                                  fd.append("file", file); fd.append("upload_preset", CLOUDINARY_PRESET); fd.append("folder", "nextgen/covers");
                                  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: fd });
                                  const data = await res.json();
                                  if (data.secure_url) {
                                    setEditCoverOptions(prev => [...prev, { label: "Upload", url: data.secure_url, type: "upload" }]);
                                    setEditCover(data.secure_url);
                                    setTimeout(() => { if (editCoverScrollRef.current) editCoverScrollRef.current.scrollLeft = editCoverScrollRef.current.scrollWidth; }, 50);
                                  }
                                } catch (err) { console.error("Erreur upload cover", err); }
                                finally { setEditCoverUploading(false); }
                              }}
                            />
                          </label>
                        </div>
                        {editCover && <div style={{ fontSize: 11, color: "#27ae60", fontFamily: "Rajdhani", marginTop: 4 }}>✓ Cover sélectionnée</div>}
                      </>
                    ) : (
                      <div style={{ fontSize: 11, color: "#444", fontFamily: "Rajdhani" }}>
                        Aucune donnée Steam disponible — les options de cover apparaîtront après chargement Steam.
                      </div>
                    )}
                  </div>

                  {/* Screenshots */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Screenshots ({editScreenshots.length})</label>
                    {editScreenshots.length > 0 && (
                      <div className="admin-photo-grid" style={{ marginBottom: 12 }}>
                        {editScreenshots.map((s, i) => (
                          <div key={i} className="admin-photo-thumb">
                            <img src={s.path_thumbnail || s.path_full} alt={`screen ${i}`} />
                            <button type="button" className="admin-photo-remove" onClick={() => removeExistingScreen(i)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Nouveaux screenshots */}
                    <div className="admin-dropzone" onClick={() => screenshotInputRef.current.click()}>
                      <span className="admin-dropzone-icon">🖼</span>
                      <span>Ajouter des screenshots</span>
                      <span className="admin-dropzone-hint">JPG, PNG, WEBP — hébergés sur Cloudinary</span>
                    </div>
                    <input ref={screenshotInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleScreenshotFiles} />

                    {newScreenPreviews.length > 0 && (
                      <div className="admin-photo-grid" style={{ marginTop: 10 }}>
                        {newScreenPreviews.map((src, i) => (
                          <div key={i} className="admin-photo-thumb">
                            <img src={src} alt={`new ${i}`} />
                            <button type="button" className="admin-photo-remove" onClick={() => removeNewScreen(i)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Mise en avant ── */}
                  <div className="admin-divider" />
                  <div className="admin-form-group">
                    <label className="admin-form-label">⭐ Mise en avant — Sorties attendues</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "Rajdhani", fontSize: 15, color: editFeatured ? "#dd163b" : "#aaa" }}>
                        <input
                          type="checkbox"
                          checked={editFeatured}
                          onChange={e => {
                            setEditFeatured(e.target.checked);
                            if (!e.target.checked) setEditFeaturedPlatforms([]);
                          }}
                          style={{ width: 18, height: 18, accentColor: "#dd163b", cursor: "pointer" }}
                        />
                        Afficher dans "Sorties les plus attendues"
                      </label>
                    </div>

                    {editFeatured && (
                      <>
                        <div style={{ marginTop: 12, fontSize: 12, color: "#888", fontFamily: "Rajdhani", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                          Plateformes concernées :
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {["PlayStation", "Nintendo", "Xbox", "PC", "Tous"].map(p => (
                            <label key={p} style={{
                              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                              fontFamily: "Rajdhani", fontSize: 14,
                              color: editFeaturedPlatforms.includes(p) ? "#dd163b" : "#aaa",
                              background: editFeaturedPlatforms.includes(p) ? "rgba(221,22,59,0.08)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${editFeaturedPlatforms.includes(p) ? "#dd163b" : "#333"}`,
                              borderRadius: 4, padding: "6px 12px",
                            }}>
                              <input
                                type="checkbox"
                                checked={editFeaturedPlatforms.includes(p)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setEditFeaturedPlatforms(prev => [...prev, p]);
                                  } else {
                                    setEditFeaturedPlatforms(prev => prev.filter(x => x !== p));
                                  }
                                }}
                                style={{ accentColor: "#dd163b", cursor: "pointer" }}
                              />
                              {p}
                            </label>
                          ))}
                        </div>
                        {editFeaturedPlatforms.length > 0 && (
                          <div style={{ fontSize: 11, color: "#f39c12", fontFamily: "Rajdhani", marginTop: 8 }}>
                            ⚠ Ce jeu apparaîtra dans : {editFeaturedPlatforms.join(", ")}
                          </div>
                        )}
                        {editFeaturedPlatforms.length === 0 && (
                          <div style={{ fontSize: 11, color: "#e74c3c", fontFamily: "Rajdhani", marginTop: 8 }}>
                            ⚠ Sélectionne au moins une plateforme
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* ── Tendances ── */}
                  <div className="admin-divider" />
                  <div className="admin-form-group">
                    <label className="admin-form-label">📈 Tendances</label>
                    <div style={{ fontSize: 11, color: "#888", fontFamily: "Rajdhani", marginBottom: 10 }}>
                      Cocher pour afficher ce jeu dans le filtre "Populaires" de la page Jeux.
                    </div>
                    <label style={{
                      display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                      fontFamily: "Rajdhani", fontSize: 15,
                      color: editTrending ? "#f39c12" : "#aaa",
                    }}>
                      <input
                        type="checkbox"
                        checked={editTrending}
                        onChange={e => setEditTrending(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: "#f39c12", cursor: "pointer" }}
                      />
                      Afficher dans les tendances actuelles
                    </label>
                    {editTrending && (
                      <div style={{ fontSize: 11, color: "#f39c12", fontFamily: "Rajdhani", marginTop: 6 }}>
                        ✓ Ce jeu apparaîtra dans le filtre "🔥 Populaires" de la page Jeux.
                      </div>
                    )}
                  </div>

                  {/* ── Marquer comme sorti ── */}
                  <div className="admin-divider" />
                  <div className="admin-form-group">
                    <label className="admin-form-label">✅ Marquer comme sorti</label>
                    <div style={{ fontSize: 11, color: "#888", fontFamily: "Rajdhani", marginBottom: 10 }}>
                      Cocher pour retirer ce jeu de "Sorties attendues" et l'ajouter dans "Dernières sorties".
                    </div>
                    <label style={{
                      display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                      fontFamily: "Rajdhani", fontSize: 15,
                      color: editMarkAsReleased ? "#27ae60" : "#aaa",
                    }}>
                      <input
                        type="checkbox"
                        checked={editMarkAsReleased}
                        onChange={e => {
                          setEditMarkAsReleased(e.target.checked);
                          if (e.target.checked) setEditFeatured(false);
                          if (!e.target.checked) setEditReleasedPlatforms([]);
                        }}
                        style={{ width: 18, height: 18, accentColor: "#27ae60", cursor: "pointer" }}
                      />
                      Ce jeu est sorti — l'afficher dans "Dernières sorties"
                    </label>

                    {editMarkAsReleased && (
                      <>
                        <div style={{ marginTop: 12, fontSize: 12, color: "#888", fontFamily: "Rajdhani", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                          Plateformes concernées :
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {["PlayStation", "Nintendo", "Xbox", "PC"].map(p => (
                            <label key={p} style={{
                              display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                              fontFamily: "Rajdhani", fontSize: 14,
                              color: editReleasedPlatforms.includes(p) ? "#27ae60" : "#aaa",
                              background: editReleasedPlatforms.includes(p) ? "rgba(39,174,96,0.08)" : "rgba(255,255,255,0.03)",
                              border: `1px solid ${editReleasedPlatforms.includes(p) ? "#27ae60" : "#333"}`,
                              borderRadius: 4, padding: "6px 12px",
                            }}>
                              <input
                                type="checkbox"
                                checked={editReleasedPlatforms.includes(p)}
                                onChange={e => {
                                  if (e.target.checked) setEditReleasedPlatforms(prev => [...prev, p]);
                                  else setEditReleasedPlatforms(prev => prev.filter(x => x !== p));
                                }}
                                style={{ accentColor: "#27ae60", cursor: "pointer" }}
                              />
                              {p}
                            </label>
                          ))}
                        </div>
                        {editReleasedPlatforms.length > 0 && (
                          <div style={{ fontSize: 11, color: "#27ae60", fontFamily: "Rajdhani", marginTop: 6 }}>
                            ✓ Apparaîtra dans "Dernières sorties" : {editReleasedPlatforms.join(", ")}
                          </div>
                        )}
                        {editReleasedPlatforms.length === 0 && (
                          <div style={{ fontSize: 11, color: "#e74c3c", fontFamily: "Rajdhani", marginTop: 6 }}>
                            ⚠ Sélectionne au moins une plateforme
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {gameMsg && (
                    <div className={`admin-msg ${gameMsgType === "error" ? "admin-msg-error" : "admin-msg-success"}`}>
                      {gameMsg}
                    </div>
                  )}

                  {/* Boutons */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                    <button className="admin-submit-btn" onClick={handleSaveGame} disabled={gameSaving} style={{ flex: "1 1 200px" }}>
                      {gameSaving ? "SAUVEGARDE..." : "💾 SAUVEGARDER LA FICHE"}
                    </button>
                    <button
                      onClick={handleForceRefresh}
                      disabled={gameSaving}
                      style={{
                        flex: "0 0 auto",
                        background: "none",
                        border: "1px solid #444",
                        color: "#888",
                        fontFamily: "Orbitron, sans-serif",
                        fontSize: 11,
                        letterSpacing: 1,
                        padding: "10px 18px",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      🔄 VIDER LE CACHE
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "sliders" && (
            <div>
              <div className="admin-section-title">
                <span className="step-badge">🖼</span>
                Sliders d'accueil
              </div>

              {sliderLoading && (
                <div style={{ color: "#666", fontFamily: "Rajdhani", padding: "20px 0" }}>
                  Chargement de la configuration...
                </div>
              )}

              {!sliderLoading && (
                <>
                  {/* ── ImgSlider ── */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">🎬 Grand slider (ImgSlider)</label>
                    <div style={{ fontSize: 11, color: "#666", fontFamily: "Rajdhani", marginBottom: 10 }}>
                      Le grand bandeau en haut de page d'accueil. Choisissez un jeu pour afficher son cover HD Steam.
                    </div>

                    {sliderCurrent.img && (
                      <div className="admin-selected-game" style={{ marginBottom: 12 }}>
                        <img src={sliderCurrent.img.img} alt={sliderCurrent.img.name} onError={e => e.target.style.background="#2a2a2a"} />
                        <div className="admin-selected-info">
                          <div className="admin-selected-name">{sliderCurrent.img.name}</div>
                          <div className="admin-selected-id">Actuellement affiché · ID #{sliderCurrent.img.igId || sliderCurrent.img.id}</div>
                        </div>
                        <span className="admin-check">✔</span>
                      </div>
                    )}

                    <div className="admin-search-wrap">
                      <span className="admin-search-icon">🔍</span>
                      <input
                        className="admin-search-input"
                        type="text"
                        placeholder="Rechercher un jeu..."
                        value={sliderSearch.img}
                        onChange={e => {
                          setSliderSearch(s => ({ ...s, img: e.target.value }));
                          if (sliderSelected.img && e.target.value !== sliderSelected.img.name)
                            setSliderSelected(s => ({ ...s, img: null }));
                        }}
                        autoComplete="off"
                      />
                    </div>

                    {sliderResults.img.length > 0 && !sliderSelected.img && (
                      <div className="admin-results">
                        {sliderResults.img.map(game => (
                          <div key={game.id} className="admin-result-item" onClick={() => {
                            setSliderSelected(s => ({ ...s, img: game }));
                            setSliderSearch(s => ({ ...s, img: game.name }));
                            setSliderResults(r => ({ ...r, img: [] }));
                            loadSliderScreenshots("img", game.id);
                          }}>
                            <img className="admin-result-img" src={game.img} alt={game.name} onError={e => e.target.style.background="#2a2a2a"} />
                            <div className="admin-result-name">{game.name}</div>
                            <span className="admin-type-badge">{game.type}</span>
                            <span className="admin-id-badge">#{game.id}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {sliderSelected.img && (
                      <div className="admin-selected-game" style={{ marginTop: 10 }}>
                        <img src={sliderSelected.img.img} alt={sliderSelected.img.name} onError={e => e.target.style.background="#2a2a2a"} />
                        <div className="admin-selected-info">
                          <div className="admin-selected-name">{sliderSelected.img.name}</div>
                          <div className="admin-selected-id">Sélectionné · ID #{sliderSelected.img.id}</div>
                        </div>
                        <button onClick={() => { setSliderSelected(s => ({ ...s, img: null })); setSliderSearch(s => ({ ...s, img: "" })); setSliderScreenshots(s => ({ ...s, img: [] })); setSliderCover(c => ({ ...c, img: null })); }}
                          style={{ background: "none", border: "none", color: "#dd163b", cursor: "pointer", fontSize: 18 }}>✕</button>
                      </div>
                    )}

                    {/* Picker de cover */}
                    {sliderScreenshots.img.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, color: "#888", fontFamily: "Rajdhani", marginBottom: 8, letterSpacing: 0.5 }}>
                          CHOISIR LA COVER — {sliderScreenshots.img.length} options disponibles
                        </div>
                        <div ref={el => sliderScrollRef.current.img = el} style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                          {sliderScreenshots.img.map((opt, i) => (
                            <div key={i} onClick={() => setSliderCover(c => ({ ...c, img: opt.url }))}
                              style={{
                                flexShrink: 0, cursor: "pointer", borderRadius: 4, overflow: "hidden",
                                border: `2px solid ${sliderCover.img === opt.url ? "#dd163b" : "rgba(255,255,255,0.1)"}`,
                                transition: "border-color 0.15s", position: "relative",
                              }}>
                              <img src={opt.url} alt={opt.label}
                                style={{ width: 160, height: 90, objectFit: "cover", display: "block" }}
                                onError={e => e.target.style.display = "none"}
                              />
                              <div style={{
                                position: "absolute", bottom: 0, left: 0, right: 0,
                                background: "rgba(0,0,0,0.7)", color: "#fff",
                                fontSize: 9, fontFamily: "Orbitron", padding: "3px 6px",
                                letterSpacing: 0.5,
                              }}>
                                {opt.type === "hero" ? "⭐ HERO" : opt.type === "upload" ? "📤 UPLOAD" : `#${i}`}
                              </div>
                            </div>
                          ))}
                          {/* Upload manuel → Cloudinary */}
                          <label style={{
                            flexShrink: 0, width: 160, height: 90, cursor: sliderUploading.img ? "wait" : "pointer",
                            border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 4,
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            color: sliderUploading.img ? "#dd163b" : "#555", fontSize: 11, fontFamily: "Rajdhani", gap: 4,
                            opacity: sliderUploading.img ? 0.7 : 1,
                          }}>
                            <span style={{ fontSize: 22 }}>{sliderUploading.img ? "⏳" : "📁"}</span>
                            {sliderUploading.img ? "Upload..." : "Upload manuel"}
                            <input type="file" accept="image/*" style={{ display: "none" }}
                              disabled={sliderUploading.img}
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setSliderUploading(u => ({ ...u, img: true }));
                                try {
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  formData.append("upload_preset", "ml_default");
                                  const res = await fetch(
                                    "https://api.cloudinary.com/v1_1/dl0eijxyn/image/upload",
                                    { method: "POST", body: formData }
                                  );
                                  const data = await res.json();
                                  const url = data.secure_url;
                                  if (url) {
                                    setSliderScreenshots(s => ({
                                      ...s,
                                      img: [...s.img, { label: "Upload", url, type: "upload" }],
                                    }));
                                    setSliderCover(c => ({ ...c, img: url }));
                                    setTimeout(() => {
                                      const el = sliderScrollRef.current.img;
                                      if (el) el.scrollLeft = el.scrollWidth;
                                    }, 50);
                                  }
                                } catch (err) {
                                  console.error("Erreur upload Cloudinary slider img", err);
                                } finally {
                                  setSliderUploading(u => ({ ...u, img: false }));
                                }
                              }}
                            />
                          </label>
                        </div>
                        {sliderCover.img && (
                          <div style={{ marginTop: 8, fontSize: 11, color: "#27ae60", fontFamily: "Rajdhani" }}>
                            ✓ Cover sélectionnée
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="admin-divider" />

                  {/* ── BannerSlider ── */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">🎞 Petit slider (BannerSlider)</label>
                    <div style={{ fontSize: 11, color: "#666", fontFamily: "Rajdhani", marginBottom: 10 }}>
                      Le bandeau secondaire. Choisissez un jeu différent du grand slider.
                    </div>

                    {sliderCurrent.banner && (
                      <div className="admin-selected-game" style={{ marginBottom: 12 }}>
                        <img src={sliderCurrent.banner.img} alt={sliderCurrent.banner.name} onError={e => e.target.style.background="#2a2a2a"} />
                        <div className="admin-selected-info">
                          <div className="admin-selected-name">{sliderCurrent.banner.name}</div>
                          <div className="admin-selected-id">Actuellement affiché · ID #{sliderCurrent.banner.igId || sliderCurrent.banner.id}</div>
                        </div>
                        <span className="admin-check">✔</span>
                      </div>
                    )}

                    <div className="admin-search-wrap">
                      <span className="admin-search-icon">🔍</span>
                      <input
                        className="admin-search-input"
                        type="text"
                        placeholder="Rechercher un jeu..."
                        value={sliderSearch.banner}
                        onChange={e => {
                          setSliderSearch(s => ({ ...s, banner: e.target.value }));
                          if (sliderSelected.banner && e.target.value !== sliderSelected.banner.name)
                            setSliderSelected(s => ({ ...s, banner: null }));
                        }}
                        autoComplete="off"
                      />
                    </div>

                    {sliderResults.banner.length > 0 && !sliderSelected.banner && (
                      <div className="admin-results">
                        {sliderResults.banner.map(game => (
                          <div key={game.id} className="admin-result-item" onClick={() => {
                            setSliderSelected(s => ({ ...s, banner: game }));
                            setSliderSearch(s => ({ ...s, banner: game.name }));
                            setSliderResults(r => ({ ...r, banner: [] }));
                            loadSliderScreenshots("banner", game.id);
                          }}>
                            <img className="admin-result-img" src={game.img} alt={game.name} onError={e => e.target.style.background="#2a2a2a"} />
                            <div className="admin-result-name">{game.name}</div>
                            <span className="admin-type-badge">{game.type}</span>
                            <span className="admin-id-badge">#{game.id}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {sliderSelected.banner && (
                      <div className="admin-selected-game" style={{ marginTop: 10 }}>
                        <img src={sliderSelected.banner.img} alt={sliderSelected.banner.name} onError={e => e.target.style.background="#2a2a2a"} />
                        <div className="admin-selected-info">
                          <div className="admin-selected-name">{sliderSelected.banner.name}</div>
                          <div className="admin-selected-id">Sélectionné · ID #{sliderSelected.banner.id}</div>
                        </div>
                        <button onClick={() => { setSliderSelected(s => ({ ...s, banner: null })); setSliderSearch(s => ({ ...s, banner: "" })); setSliderScreenshots(s => ({ ...s, banner: [] })); setSliderCover(c => ({ ...c, banner: null })); }}
                          style={{ background: "none", border: "none", color: "#dd163b", cursor: "pointer", fontSize: 18 }}>✕</button>
                      </div>
                    )}

                    {/* Picker de cover banner */}
                    {sliderScreenshots.banner.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, color: "#888", fontFamily: "Rajdhani", marginBottom: 8, letterSpacing: 0.5 }}>
                          CHOISIR LA COVER — {sliderScreenshots.banner.length} options disponibles
                        </div>
                        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                          {sliderScreenshots.banner.map((opt, i) => (
                            <div key={i} onClick={() => setSliderCover(c => ({ ...c, banner: opt.url }))}
                              style={{
                                flexShrink: 0, cursor: "pointer", borderRadius: 4, overflow: "hidden",
                                border: `2px solid ${sliderCover.banner === opt.url ? "#dd163b" : "rgba(255,255,255,0.1)"}`,
                                transition: "border-color 0.15s", position: "relative",
                              }}>
                              <img src={opt.url} alt={opt.label}
                                style={{ width: 160, height: 90, objectFit: "cover", display: "block" }}
                                onError={e => e.target.style.display = "none"}
                              />
                              <div style={{
                                position: "absolute", bottom: 0, left: 0, right: 0,
                                background: "rgba(0,0,0,0.7)", color: "#fff",
                                fontSize: 9, fontFamily: "Orbitron", padding: "3px 6px",
                                letterSpacing: 0.5,
                              }}>
                                {opt.type === "hero" ? "⭐ HERO" : opt.type === "upload" ? "📤 UPLOAD" : `#${i}`}
                              </div>
                            </div>
                          ))}
                          {/* Upload manuel → Cloudinary */}
                          <label style={{
                            flexShrink: 0, width: 160, height: 90, cursor: sliderUploading.banner ? "wait" : "pointer",
                            border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 4,
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            color: sliderUploading.banner ? "#dd163b" : "#555", fontSize: 11, fontFamily: "Rajdhani", gap: 4,
                            opacity: sliderUploading.banner ? 0.7 : 1,
                          }}>
                            <span style={{ fontSize: 22 }}>{sliderUploading.banner ? "⏳" : "📁"}</span>
                            {sliderUploading.banner ? "Upload..." : "Upload manuel"}
                            <input type="file" accept="image/*" style={{ display: "none" }}
                              disabled={sliderUploading.banner}
                              onChange={async e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setSliderUploading(u => ({ ...u, banner: true }));
                                try {
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  formData.append("upload_preset", "ml_default");
                                  const res = await fetch(
                                    "https://api.cloudinary.com/v1_1/dl0eijxyn/image/upload",
                                    { method: "POST", body: formData }
                                  );
                                  const data = await res.json();
                                  const url = data.secure_url;
                                  if (url) {
                                    setSliderScreenshots(s => ({
                                      ...s,
                                      banner: [...s.banner, { label: "Upload", url, type: "upload" }],
                                    }));
                                    setSliderCover(c => ({ ...c, banner: url }));
                                    setTimeout(() => {
                                      const el = sliderScrollRef.current.banner;
                                      if (el) el.scrollLeft = el.scrollWidth;
                                    }, 50);
                                  }
                                } catch (err) {
                                  console.error("Erreur upload Cloudinary slider banner", err);
                                } finally {
                                  setSliderUploading(u => ({ ...u, banner: false }));
                                }
                              }}
                            />
                          </label>
                        </div>
                        {sliderCover.banner && (
                          <div style={{ marginTop: 8, fontSize: 11, color: "#27ae60", fontFamily: "Rajdhani" }}>
                            ✓ Cover sélectionnée
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="admin-divider" />

                  {/* ── Bouton Sauvegarder ── */}
                  {sliderMsg && (
                    <div className="admin-msg" style={{
                      background: sliderMsg.startsWith("✓") ? "rgba(39,174,96,0.08)" : "rgba(231,76,60,0.08)",
                      border: `1px solid ${sliderMsg.startsWith("✓") ? "rgba(39,174,96,0.25)" : "rgba(231,76,60,0.25)"}`,
                      color: sliderMsg.startsWith("✓") ? "#27ae60" : "#e74c3c",
                      marginBottom: 16,
                    }}>
                      {sliderMsg}
                    </div>
                  )}

                  <button
                    onClick={saveSliderConfig}
                    disabled={sliderSaving}
                    style={{
                      background: "#dd163b",
                      color: "#fff",
                      border: "none",
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: 12,
                      letterSpacing: 1,
                      padding: "12px 28px",
                      borderRadius: 4,
                      cursor: sliderSaving ? "not-allowed" : "pointer",
                      opacity: sliderSaving ? 0.7 : 1,
                    }}
                  >
                    {sliderSaving ? "Sauvegarde..." : "💾 SAUVEGARDER"}
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AdminConsole;