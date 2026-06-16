import React, { useState, useEffect, useRef } from "react";
import {  useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../Firebase";

function parseRelease(dateStr) {
  if (!dateStr) return null;
  const FR = {
    janvier:0, janv:0, fevrier:1, février:1, "févr":1, fev:1, mars:2,
    avril:3, avr:3, mai:4, juin:5, juillet:6, juil:6,
    aout:7, août:7, septembre:8, sept:8, octobre:9, oct:9,
    novembre:10, nov:10, decembre:11, décembre:11, dec:11, déc:11
  };
  const m = dateStr.match(/(\d{1,2})\s+([\wéèêëàâùûüîïôœç]+\.?)\s+(\d{4})/i);
  if (m) {
    const mn = m[2].toLowerCase().replace(/\.$/, "");
    const mo = FR[mn] ?? FR[mn.normalize("NFD").replace(/[\u0300-\u036f]/g,"")];
    if (mo !== undefined) return new Date(parseInt(m[3]), mo, parseInt(m[1]));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

const BACKEND_URL = "https://api.sm-artweb.fr";
const PER_PAGE = 18;

function getPlatformKey(type) {
  const t = (type || "").toLowerCase();
  if (t.includes("steam"))       return "Steam";
  if (t.includes("playstation") || t.includes("ps5") || t.includes("ps4")) return "PlayStation";
  if (t.includes("xbox") || t.includes("microsoft")) return "Xbox";
  if (t.includes("nintendo") || t.includes("switch")) return "Nintendo";
  if (t.includes("ubisoft"))     return "Ubisoft";
  if (t.includes("epic"))        return "Epic";
  if (t.includes("gog"))         return "GOG";
  if (t.includes("rockstar"))    return "Rockstar";
  if (t.includes("ea") || t.includes("origin") || t.includes("electronic arts")) return "EA";
  return "Autre";
}

function getPromo(retail, price) {
  const r = parseFloat(retail);
  const p = parseFloat(price);
  if (!r || !p || r <= p) return null;
  return `-${Math.round(((r - p) / r) * 100)}%`;
}

function cleanTitle(name) {
  return name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "");
}

const PLATFORM_FILTERS = [
  { key: "Tous",          label: "Tous" },
  { key: "Steam",         label: "PC / Steam" },
  { key: "PlayStation",   label: "PlayStation" },
  { key: "Xbox",          label: "Xbox" },
  { key: "Nintendo",      label: "Nintendo Switch" },
  { key: "Ubisoft",       label: "Ubisoft Connect" },
  { key: "Epic",          label: "Epic Games" },
  { key: "Rockstar",      label: "Rockstar" },
  { key: "EA",            label: "EA App" },
  { key: "CartesCadeaux", label: "Cartes Cadeaux" },
];

const SORT_OPTIONS = [
  { value: "date_desc",  label: "Plus récents" },
  { value: "date_asc",   label: "Plus anciens" },
  { value: "price_asc",  label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "promo",      label: "Meilleures promos" },
];

const CAT_FILTERS = [
  { key: "all",        label: "Tous les jeux" },
  { key: "topseller",  label: "Populaires" },
  { key: "nouveautes", label: "Nouveautés" },
  { key: "preorder",   label: "Précommandes" },
  { key: "upcoming",   label: "Prochaines sorties" },
];

const PAGE_TITLES = {
  all:        { accent: "Catalogue",   rest: "Complet" },
  topseller:  { accent: "Tendances",   rest: "Récentes" },
  nouveautes: { accent: "Dernières",   rest: "Nouveautés" },
  preorder:   { accent: "Jeux en",     rest: "Précommandes" },
  upcoming:   { accent: "Prochaines",  rest: "Sorties" },
};

const STYLES = `
  .pop-layout {
    display: flex;
    gap: 0;
    align-items: flex-start;
    padding-top: 92px;
    min-height: 100vh;
  }

  /* ── Sidebar ── */
  .pop-sidebar {
    width: 240px;
    flex-shrink: 0;
    padding: 24px 20px 24px;
    position: sticky;
    top: 92px;
    height: calc(100vh - 92px);
    overflow-y: auto;
    border-right: 1px solid rgba(255,255,255,0.08);
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.1) transparent;
  
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    align-self: flex-start;
  }
  .pop-sidebar::-webkit-scrollbar { width: 4px; }
  .pop-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

  .pop-sidebar-section {
    margin-bottom: 28px;
  }
  .pop-sidebar-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  /* Boutons sidebar catégorie */
  .pop-sb-cat-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 8px 10px;
    margin-bottom: 2px;
    border-radius: 4px;
    background: transparent;
    border: none;
    color: #aaa;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.14s;
  }
  .pop-sb-cat-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .pop-sb-cat-btn.active {
    background: rgba(221,22,59,0.12);
    color: #fff;
    font-weight: 700;
  }
  .pop-sb-cat-btn.active::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 14px;
    background: #dd163b;
    border-radius: 2px;
    margin-right: 8px;
    flex-shrink: 0;
  }
  .pop-sb-cat-btn:not(.active)::before {
    content: '';
    display: inline-block;
    width: 3px;
    height: 14px;
    background: transparent;
    margin-right: 8px;
    flex-shrink: 0;
  }

  /* Boutons sidebar plateforme */
  .pop-sb-plat-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 10px;
    margin-bottom: 1px;
    border-radius: 4px;
    background: transparent;
    border: none;
    color: #999;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: all 0.14s;
  }
  .pop-sb-plat-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .pop-sb-plat-btn.active {
    color: #fff;
    font-weight: 700;
  }
  .pop-sb-plat-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    background: rgba(255,255,255,0.15);
    transition: background 0.14s;
  }
  .pop-sb-plat-btn.active .pop-sb-plat-dot { background: #dd163b; }

  /* ── Contenu principal ── */
  .pop-main {
    flex: 1;
    min-width: 0;
    padding: 20px 24px 40px;
  }

  /* Header de la section */
  .pop-main-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .pop-main-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #fff;
    margin: 0;
    line-height: 1;
  }
  .pop-main-title .accent { color: #dd163b; }
  .pop-main-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pop-count {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    color: #444;
    letter-spacing: 0.06em;
  }
  .pop-count strong { color: #dd163b; }

  /* Barre recherche + tri */
  .pop-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .pop-search-wrap {
    position: relative;
    flex: 1;
    min-width: 200px;
    max-width: 360px;
  }
  .pop-search-wrap input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    color: #ccc;
    font-size: 12px;
    padding: 9px 12px 9px 34px;
    outline: none;
    font-family: 'Montserrat', sans-serif;
    transition: border-color 0.15s;
  }
  .pop-search-wrap input:focus { border-color: rgba(221,22,59,0.4); }
  .pop-search-wrap input::placeholder { color: #333; }
  .pop-search-icon {
    position: absolute;
    left: 11px; top: 50%;
    transform: translateY(-50%);
    color: #333; font-size: 13px;
    pointer-events: none;
  }

  /* Filtres actifs tags */
  .pop-active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  .pop-active-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(221,22,59,0.12);
    border: 1px solid rgba(221,22,59,0.3);
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 11px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    color: #dd163b;
    letter-spacing: 0.04em;
  }
  .pop-active-tag-remove {
    cursor: pointer;
    opacity: 0.6;
    font-size: 12px;
    line-height: 1;
    background: none;
    border: none;
    color: #dd163b;
    padding: 0;
  }
  .pop-active-tag-remove:hover { opacity: 1; }

  /* Tri dropdown */
  .pop-sort-wrap { position: relative; }
  .pop-sort-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #888;
    font-size: 11px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .pop-sort-btn:hover { border-color: rgba(255,255,255,0.2); color: #ccc; }
  .pop-sort-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    background: #0e0f14;
    border: 1px solid rgba(255,255,255,0.1);
    border-top: 2px solid #dd163b;
    border-radius: 6px;
    min-width: 200px;
    z-index: 300;
    overflow: hidden;
    box-shadow: 0 16px 40px rgba(0,0,0,0.7);
  }
  .pop-sort-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 16px;
    background: none;
    border: none;
    font-size: 11px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: background 0.1s;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .pop-sort-item:last-child { border-bottom: none; }
  .pop-sort-item:hover { background: rgba(255,255,255,0.04); }
  .pop-sort-item.active { color: #dd163b; }
  .pop-sort-item:not(.active) { color: #555; }
  .pop-sort-item.active::before { content: '▸'; margin-right: 6px; }

  /* ── Grille de jeux ── */
  .pop-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 1200px) { .pop-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 767px)  { .pop-grid { grid-template-columns: 1fr; } }

  /* ── Card ── */
  .pop-card {
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .pop-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
    border-color: rgba(221,22,59,0.25);
  }
  .pop-card-img {
    position: relative;
    aspect-ratio: 16/9;
    overflow: hidden;
  }
  .pop-card-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .pop-card:hover .pop-card-img img { transform: scale(1.04); }

  .pop-card-promo {
    position: absolute;
    top: 8px; right: 8px;
    background: #dd163b;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    padding: 3px 8px;
    border-radius: 3px;
    letter-spacing: 0.04em;
    box-shadow: 0 2px 8px rgba(221,22,59,0.5);
  }
  .pop-card-plat {
    position: absolute;
    top: 8px; left: 8px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 3px;
    padding: 2px 7px;
    font-size: 9px;
    font-weight: 800;
    font-family: 'Montserrat', sans-serif;
    color: rgba(255,255,255,0.65);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .pop-card-body {
    padding: 10px 12px 12px;
  }
  .pop-card-name {
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #ddd;
    line-height: 1.3;
    margin: 0 0 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s;
  }
  .pop-card:hover .pop-card-name { color: #fff; }

  .pop-card-tags {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .pop-card-tag {
    font-size: 9px;
    font-weight: 700;
    font-family: 'Montserrat', sans-serif;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .pop-card-tag.preco {
    background: rgba(221,22,59,0.12);
    border: 1px solid rgba(221,22,59,0.3);
    color: #dd163b;
  }
  .pop-card-tag.date {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: #666;
  }
  .pop-card-tag.eu   { color: #2ecc71; background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.25); }
  .pop-card-tag.ww   { color: #a0a0ff; background: rgba(100,100,200,0.1); border: 1px solid rgba(100,100,200,0.25); }
  .pop-card-tag.us   { color: #f39c12; background: rgba(243,156,18,0.1); border: 1px solid rgba(243,156,18,0.25); }

  .pop-card-price-row {
    display: flex;
    align-items: baseline;
    gap: 7px;
  }
  .pop-card-price {
    font-family: 'Rajdhani', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }
  .pop-card-retail {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    color: #444;
    text-decoration: line-through;
  }
  .pop-card-na {
    font-size: 11px;
    color: #444;
    font-family: 'Montserrat', sans-serif;
    font-style: italic;
  }

  /* ── Loading ── */
  .pop-loading {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 80px 0; gap: 16px;
  }
  .pop-spinner {
    width: 36px; height: 36px;
    border: 2px solid rgba(221,22,59,0.15);
    border-top-color: #dd163b;
    border-radius: 50%;
    animation: popSpin 0.75s linear infinite;
  }
  @keyframes popSpin { to { transform: rotate(360deg); } }
  .pop-spinner-text {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px; letter-spacing: 0.2em;
    color: #333; text-transform: uppercase;
  }
  .pop-empty {
    text-align: center; padding: 80px 0;
    color: #333; font-family: 'Montserrat', sans-serif;
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  }

  /* ── Pagination ── */
  .pop-pagination {
    display: flex; align-items: center;
    justify-content: center; gap: 4px;
    padding: 32px 0 8px; flex-wrap: wrap;
  }
  .pop-pg-btn {
    min-width: 36px; height: 36px;
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.07);
    background: transparent; color: #444;
    font-size: 12px; font-family: 'Montserrat', sans-serif; font-weight: 700;
    cursor: pointer; transition: all 0.14s; padding: 0 8px;
  }
  .pop-pg-btn:hover:not(:disabled) { border-color: rgba(221,22,59,0.4); color: #fff; background: rgba(221,22,59,0.08); }
  .pop-pg-btn.active { background: #dd163b; border-color: #dd163b; color: #fff; }
  .pop-pg-btn:disabled { opacity: 0.15; cursor: default; }
  .pop-pg-sep { color: #2a2a2a; padding: 0 2px; line-height: 36px; }

  /* ── Responsive sidebar ── */
  .pop-mobile-toggle { display: none; }
  .pop-sidebar-overlay { display: none; }
  .pop-sidebar-apply { display: none; }
  .pop-sidebar-close { display: none; }
  @media (max-width: 900px) {
    .pop-layout { flex-direction: column; padding-top: 92px; }
    .pop-sidebar {
      position: fixed;
      top: 0; left: -300px;
      width: 280px;
      height: 100vh;
      z-index: 1001;
      padding: 20px 20px 100px;
      transition: left 0.28s ease;
      border-right: 1px solid rgba(221,22,59,0.25);
      background: #0d0e13;
      backdrop-filter: none;
      align-self: auto;
    }
    .pop-sidebar.open { left: 0; }
    .pop-sidebar-overlay {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.28s;
    }
    .pop-sidebar-overlay.open { opacity: 1; pointer-events: all; }
    .pop-mobile-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 6px;
      background: rgba(221,22,59,0.1);
      border: 1px solid rgba(221,22,59,0.3);
      color: #fff;
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      margin-bottom: 16px;
    }
    .pop-sidebar-close {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 50%;
      width: 36px; height: 36px;
      color: #fff; cursor: pointer; font-size: 16px;
      position: static;
      margin-bottom: 20px;
    }
    .pop-sidebar-close:hover { background: rgba(221,22,59,0.2); border-color: #dd163b; }
    .pop-sidebar-apply {
      display: flex !important;
      position: sticky;
      bottom: 0;
      margin: 0 -20px;
      padding: 14px 20px;
      background: #0d0e13;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .pop-main { padding: 12px 14px 40px; }
  }
`;

/* ─── Game Card ─────────────────────────────────────────────────────────────── */
function GameCard({ game }) {
  const promo     = getPromo(game.retail, game.price);
  const price     = parseFloat(game.price);
  const retail    = parseFloat(game.retail);
  const type      = (game.type || "").toLowerCase();
  const isConsole = type.includes("playstation") || type.includes("ps5") || type.includes("ps4") ||
    type.includes("nintendo") || type.includes("switch") || type.includes("microsoft") ||
    type.includes("xbox") || type.includes("ubisoft") || type.includes("rockstar") ||
    type.includes("ea") || type.includes("origin") || type.includes("electronic arts");
  const steamId = isConsole ? 0 : (game.steam_id || 0);
  const path    = `/store/${game.id}/${steamId}/${cleanTitle(game.name)}`;
  const platKey = getPlatformKey(game.type);
  const region  = (game.region || "").toLowerCase();
  const isEU    = region.includes("europe") || region.includes("fr");
  const isWW    = region === "worldwide";
  const isUS    = region.includes("us") && !region.includes("australia");
  const isPreco = game.preorder === 1;
  const hasDate = game.releaseDate && game.releaseDate.trim();

  return (
    <div className="pop-card" onClick={() => window.location.href = path}>
      <div className="pop-card-img">
        <img src={game.img} alt={game.name} loading="lazy" />
        {promo && <span className="pop-card-promo">{promo}</span>}
        <span className="pop-card-plat">{platKey}</span>
      </div>
      <div className="pop-card-body">
        <div className="pop-card-name">{game.name}</div>
        <div className="pop-card-tags">
          {isPreco && <span className="pop-card-tag preco">⏳ Préco</span>}
          {hasDate && <span className="pop-card-tag date">📅 {game.releaseDate}</span>}
          {isEU && <span className="pop-card-tag eu">EU</span>}
          {isWW && <span className="pop-card-tag ww">WW</span>}
          {isUS && <span className="pop-card-tag us">US</span>}
        </div>
        <div className="pop-card-price-row">
          {retail > price && <span className="pop-card-retail">{retail.toFixed(2)} €</span>}
          {price > 0
            ? <span className="pop-card-price">{price.toFixed(2)} €</span>
            : <span className="pop-card-na">Prix à venir</span>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Pagination ──────────────────────────────────────────────────────────── */
function Pagination({ page, total, perPage, onChange }) {
  const numPages = Math.ceil(total / perPage);
  if (numPages <= 1) return null;
  const pages = [];
  const delta = 2;
  for (let i = 1; i <= numPages; i++) {
    if (i === 1 || i === numPages || (i >= page - delta && i <= page + delta)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="pop-pagination">
      <button className="pop-pg-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`s${i}`} className="pop-pg-sep">···</span>
          : <button key={p} className={`pop-pg-btn${p === page ? " active" : ""}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="pop-pg-btn" disabled={page === numPages} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
function Populaires() {
  const [allGames,  setAllGames]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const location    = useLocation();
  const _initParams = new URLSearchParams(location.search);
  const [platform,  setPlatform]  = useState(_initParams.get("platform")  || "Tous");
  const [sort,      setSort]      = useState("date_desc");
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [showSort,  setShowSort]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catFilter, setCatFilter] = useState(_initParams.get("catFilter") || "all");
  const sortRef = useRef(null);
  const topRef  = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const p  = params.get("platform");
    const cf = params.get("catFilter");
    if (p)  setPlatform(p);
    if (cf) setCatFilter(cf);
  }, [location.search]);

  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        if (catFilter === "topseller") {
          const snap = await getDocs(query(collection(db, "games"), where("trending", "==", true)));
          const today = new Date(); today.setHours(0,0,0,0);
          const fbGames = snap.docs
            .map(d => ({ docId: d.id, ...d.data() }))
            .filter(g => {
              if (!g.trendingGame) return false;
              const rd = parseRelease(g.release_date?.date || g.steamData?.release_date?.date || "");
              return rd && rd <= today;
            })
            .map(g => {
              const ed = (g.editions || []).find(e => e.stock === 1 && parseFloat(e.price) > 0) || (g.editions || [])[0] || {};
              return {
                id: g.trendingGame.id, name: g.trendingGame.name,
                img: g.trendingGame.img, type: g.trendingGame.type,
                price: ed.price || "0.00", retail: ed.retail || "0.00",
                steam_id: g.steamData?.steam_appid || ed.steam_id || 0,
                region: ed.region || "Europe", stock: 1,
                releaseDate: g.release_date?.date || ed.releaseDate || null,
              };
            });
          setAllGames(fbGames);
          return;
        }
        const res  = await fetch(`${BACKEND_URL}/api/allgames`, { headers: { "User-Agent": "IG-ExportCatalog-Fetcher" } });
        const data = await res.json();
        setAllGames(data || []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les jeux.");
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [catFilter]);

  useEffect(() => { setPage(1); }, [platform, sort, search, catFilter]);

  const filtered = allGames
    .filter(g => {
      if ((g.region || "").toLowerCase().includes("latin")) return false;
      const region = (g.region || "").toLowerCase();
      if (region.includes("us") && !region.includes("europe") && !region.includes("australia")) return false;
      if (platform === "CartesCadeaux") {
        if (!Array.isArray(g.category) || !g.category.some(c => c.toLowerCase().includes("carte"))) return false;
      } else if (platform !== "Tous" && getPlatformKey(g.type) !== platform) return false;
      if (catFilter === "preorder") {
        const rd = parseRelease(g.releaseDate || g.release_date);
        const isFuture = rd && rd > new Date();
        const hasPrice = parseFloat(g.price) > 0;
        if (g.preorder !== 1 && !(isFuture && hasPrice)) return false;
      }
      else if (catFilter === "nouveautes") { if (g.stock !== 1 || parseFloat(g.price) <= 0 || g.preorder === 1) return false; }
      else if (catFilter === "upcoming")   {
        const rd = parseRelease(g.releaseDate || g.release_date);
        const isFuture = rd && rd > new Date();
        if (g.preorder === 1 || isFuture || g.stock === 1 || parseFloat(g.price) > 0) return false;
      }
      if (search.trim()) {
        const ABBREV = {
          "gta 6":"grand theft auto vi","gta 5":"grand theft auto v",
          "cod":"call of duty","bf":"battlefield","ac":"assassin's creed",
          "rdr2":"red dead redemption 2","ff":"final fantasy",
          "fifa":"ea sports fc","pes":"efootball","wow":"world of warcraft",
          "lol":"league of legends","cs2":"counter-strike 2","csgo":"counter-strike",
        };
        const norm = s => s.toLowerCase().replace(/[:\-''\u2018\u2019!?.,]/g," ").replace(/\s+/g," ").trim();
        const raw = norm(search);
        if (!norm(g.name).includes(ABBREV[raw] || raw)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (catFilter === "nouveautes") return b.id - a.id;
      if (sort === "date_desc")  return new Date(b.releaseDate||0) - new Date(a.releaseDate||0);
      if (sort === "date_asc")   return new Date(a.releaseDate||0) - new Date(b.releaseDate||0);
      if (sort === "price_asc")  return parseFloat(a.price) - parseFloat(b.price);
      if (sort === "price_desc") return parseFloat(b.price) - parseFloat(a.price);
      if (sort === "promo") {
        const pA = getPromo(a.retail, a.price), pB = getPromo(b.retail, b.price);
        return (pA ? parseInt(pA) : 0) - (pB ? parseInt(pB) : 0);
      }
      return 0;
    });

  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || "Trier";
  const titleData = PAGE_TITLES[catFilter] || PAGE_TITLES.all;
  const catLabel  = CAT_FILTERS.find(f => f.key === catFilter)?.label;
  const platLabel = platform !== "Tous" ? PLATFORM_FILTERS.find(f => f.key === platform)?.label : null;

  const handlePageChange = (p) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="App" style={{ background: "transparent" }}>
      <style>{STYLES}</style>
      <Header />
      <div className="nk-main">
        <div ref={topRef} />
        <div className="pop-layout">

          {/* ── Sidebar ── */}
          <div className={`pop-sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />
          <aside className={`pop-sidebar${sidebarOpen ? " open" : ""}`}>
            <button className="pop-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

            <div className="pop-sidebar-section">
              <div className="pop-sidebar-title">Catégorie</div>
              {CAT_FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`pop-sb-cat-btn${catFilter === f.key ? " active" : ""}`}
                  onClick={() => setCatFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="pop-sidebar-section">
              <div className="pop-sidebar-title">Plateforme</div>
              {PLATFORM_FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`pop-sb-plat-btn${platform === f.key ? " active" : ""}`}
                  onClick={() => setPlatform(f.key)}
                >
                  <span className="pop-sb-plat-dot" />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Bouton Appliquer — mobile uniquement */}
            <div className="pop-sidebar-apply">
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#dd163b",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                ✓ Appliquer les filtres
              </button>
            </div>
          </aside>

          {/* ── Contenu ── */}
          <div className="pop-main">
            <button className="pop-mobile-toggle" onClick={() => setSidebarOpen(true)}>
              ☰ Filtres
            </button>

            <div className="pop-main-header">
              <h1 className="pop-main-title">
                <span className="accent">{titleData.accent}</span> {titleData.rest}
              </h1>
              {!loading && (
                <div className="pop-count">
                  <strong>{filtered.length}</strong> résultat{filtered.length > 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="pop-toolbar">
              <div className="pop-search-wrap">
                <span className="pop-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher un jeu..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="pop-sort-wrap" ref={sortRef}>
                <button className="pop-sort-btn" onClick={() => setShowSort(v => !v)}>
                  ⇅ {sortLabel}
                </button>
                {showSort && (
                  <div className="pop-sort-dropdown">
                    {SORT_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        className={`pop-sort-item${sort === o.value ? " active" : ""}`}
                        onClick={() => { setSort(o.value); setShowSort(false); }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filtres actifs */}
            {(catFilter !== "all" || platform !== "Tous") && (
              <div className="pop-active-filters">
                {catFilter !== "all" && (
                  <span className="pop-active-tag">
                    {catLabel}
                    <button className="pop-active-tag-remove" onClick={() => setCatFilter("all")}>✕</button>
                  </span>
                )}
                {platform !== "Tous" && (
                  <span className="pop-active-tag">
                    {platLabel}
                    <button className="pop-active-tag-remove" onClick={() => setPlatform("Tous")}>✕</button>
                  </span>
                )}
              </div>
            )}

            {loading && (
              <div className="pop-loading">
                <div className="pop-spinner" />
                <span className="pop-spinner-text">Chargement du catalogue</span>
              </div>
            )}
            {error && <div className="pop-empty" style={{ color: "#dd163b" }}>{error}</div>}
            {!loading && !error && filtered.length === 0 && (
              <div className="pop-empty">Aucun résultat pour ces filtres</div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <>
                <div className="pop-grid">
                  {paginated.map(game => <GameCard key={game.id} game={game} />)}
                </div>
                <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={handlePageChange} />
              </>
            )}

          </div>
        </div>
      </div>
      <div className="separator product-panel" />
      <Footer />
    </div>
  );
}

export default Populaires;