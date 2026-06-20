import React, { useEffect } from "react";
import "./NextGenLogoAnimated.css";

let fontInjected = false;
function ensureFontLoaded() {
  if (fontInjected) return;
  if (document.getElementById("ngl-font-face")) { fontInjected = true; return; }
  const style = document.createElement("style");
  style.id = "ngl-font-face";
  style.textContent = `
    @font-face {
      font-family: 'CalinorPegasus';
      src: url('${process.env.PUBLIC_URL}/fonts/CalinorPegasusBoldModernSpace.otf') format('opentype');
      font-weight: 700;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
  fontInjected = true;
}

function NextGenLogoAnimated({ width, className = "" }) {
  useEffect(() => { ensureFontLoaded(); }, []);

  const r1 = 42; // anneau extérieur plein
  const r2 = 32; // anneau pointillé 1
  const r3 = 23; // anneau pointillé 2
  const circ1 = 2 * Math.PI * r1;

  return (
    <div className={`ngl-wrap ${className}`} style={width ? { width, maxWidth: width } : undefined}>
      <svg viewBox="0 0 580 110" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", display: "block" }}>
        <defs>
          <linearGradient id="ngl-metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8a8f96" />
            <stop offset="20%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#5a6068" />
            <stop offset="50%" stopColor="#e8eaed" />
            <stop offset="65%" stopColor="#9aa3ad" />
            <stop offset="80%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#4a5058" />
          </linearGradient>
          <linearGradient id="ngl-shine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id="ngl-textmask">
            <text x="38" y="68" fontFamily="CalinorPegasus, Orbitron, sans-serif" fontWeight="700" fontSize="40" fill="#fff">NEXTGEN</text>
          </mask>
        </defs>

        {/* ── Cercle radar ── */}
        <g>
          <circle
            className="ngl-ring-outer"
            cx="55" cy="55" r={r1}
            fill="none" stroke="#dd163b" strokeWidth="2"
            style={{ "--circ": circ1 }}
          />
          <circle
            className="ngl-ring-dash-1"
            cx="55" cy="55" r={r2}
            fill="none" stroke="#dd163b" strokeWidth="1.4"
            strokeDasharray="4 5"
          />
          <circle
            className="ngl-ring-dash-2"
            cx="55" cy="55" r={r3}
            fill="none" stroke="#dd163b" strokeWidth="1.2"
            strokeDasharray="3 4"
          />

          {/* Petit point décoratif (style "satellite") */}
          <circle className="ngl-dot" cx="84" cy="24" r="2.2" fill="#dd163b" />
        </g>

        {/* ── Texte NEXTGEN (effet métallique chromé, le N chevauche le centre du cercle) ── */}
        <text
          className="ngl-text-nextgen"
          x="38" y="68"
          fontFamily="CalinorPegasus, Orbitron, sans-serif"
          fontWeight="700"
          fontSize="40"
          fill="url(#ngl-metal)"
          stroke="#2a2e33"
          strokeWidth="0.5"
        >
          NEXTGEN
        </text>
        {/* <rect
          className="ngl-shine-sweep"
          x="38" y="20" width="100" height="30"
          fill="url(#ngl-shine)"
          mask="url(#ngl-textmask)"
        /> */}

        {/* ── Bracket simple sous le texte, points aux deux extrémités ── */}
        <circle className="ngl-bracket-dot-1" cx="150" cy="90" r="3" fill="#fff" />
        <path
          className="ngl-bracket"
          d="M150,90 L165,90 L180,75 L240,75"
          fill="none" stroke="#fff" strokeWidth="1.5"
          style={{ "--bracket-len": 110 }}
        />
        <circle className="ngl-bracket-dot-2" cx="240" cy="75" r="3" fill="#fff" />
        <text
          className="ngl-text-gaming"
          x="180" y="92"
          fontFamily="Orbitron, sans-serif"
          fontWeight="700"
          fontSize="15"
          letterSpacing="4"
          fill="#dd163b"
        >
          GAMING
        </text>
      </svg>
    </div>
  );
}

export default NextGenLogoAnimated;