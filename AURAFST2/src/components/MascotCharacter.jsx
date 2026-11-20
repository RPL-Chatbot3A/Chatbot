import React from "react";

/**
 * Komponen Maskot Karakter Animasi SVG & CSS Murni AURA-FST
 * - Desain Bola 3D Glossy (Gradasi ungu-violet di atas hingga cyan-biru di bawah)
 * - Kilauan highlight cahaya lembut di sisi kiri atas
 * - Dua mata putih lonjong dengan animasi berkedip alami setiap 3-4 detik
 * - Bersinar/berdenyut lembut saat bot berpikir atau membalas chat (isThinking/isSpeaking/isTyping)
 * - Animasi melayang naik-turun halus (floating) dengan bayangan oval dinamis di bawahnya
 * - 100% transparan tanpa kotak latar belakang apa pun, sempurna di Light & Dark Mode
 */
export const MascotCharacter = ({
  size = "md", // "xs" (header/sidebar), "md" (chat bubble), "hero" (center screen)
  isSpeaking = false,
  isThinking = false,
  isTyping = false,
  showWave = false,
  theme = "dark",
  className = "",
  onClick,
}) => {
  const isDark = theme === "dark";
  const activeState = isSpeaking || isThinking || isTyping;

  // Dimensi per size
  const sizeMap = {
    hero: {
      container: "w-32 h-32 sm:w-36 sm:h-36", // 128px - 144px (sesuai permintaan 120px - 140px)
      shadow: "w-24 sm:w-28 h-3 -mt-1",
      showShadow: true,
    },
    md: {
      container: "w-10 h-10 sm:w-11 sm:h-11", // 40px - 44px
      shadow: "",
      showShadow: false,
    },
    xs: {
      container: "w-8 h-8", // 32px
      shadow: "",
      showShadow: false,
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Unique ID prefix untuk gradien SVG agar tidak konflik jika ada multiple instance
  const id = React.useId().replace(/:/g, "");

  const svgContent = (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full overflow-visible select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradasi 3D Utama Bola: Ungu-Violet atas -> Cyan-Biru cerah bawah */}
        <radialGradient
          id={`bodyGrad-${id}`}
          cx="38%"
          cy="28%"
          r="72%"
          fx="32%"
          fy="22%"
        >
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="18%" stopColor="#8B5CF6" />
          <stop offset="42%" stopColor="#6366F1" />
          <stop offset="68%" stopColor="#0EA5E9" />
          <stop offset="92%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>

        {/* Kilauan Cahaya Glossy di Sisi Kiri Atas */}
        <linearGradient
          id={`glossGrad-${id}`}
          x1="0%"
          y1="0%"
          x2="80%"
          y2="80%"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Pantulan Cahaya Tepi Halus (Rim Light) Bawah */}
        <radialGradient
          id={`rimGrad-${id}`}
          cx="60%"
          cy="85%"
          r="50%"
        >
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>

        {/* Filter Soft Glow saat Aktif/Berpikir */}
        <filter id={`eyeGlow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id={`ballDropShadow-${id}`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="10"
            floodColor={isDark ? "#0284C7" : "#0284C7"}
            floodOpacity={isDark ? "0.35" : "0.22"}
          />
        </filter>
      </defs>

      <style>{`
        @keyframes auraBlinkAnim {
          0%, 86%, 92%, 100% {
            transform: scaleY(1);
          }
          88%, 90% {
            transform: scaleY(0.08);
          }
        }
        @keyframes auraFloatAnim {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-9px);
          }
        }
        @keyframes auraEyePulse {
          0%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 12px rgba(56,189,248,0.8));
          }
          50% {
            opacity: 0.82;
            filter: drop-shadow(0 0 2px rgba(255,255,255,0.7)) drop-shadow(0 0 5px rgba(56,189,248,0.5));
          }
        }
        .aura-character-floating {
          animation: auraFloatAnim 3.8s ease-in-out infinite;
          transform-origin: center;
        }
        .aura-eye-left {
          transform-origin: 79px 96px;
          animation: auraBlinkAnim 3.6s ease-in-out infinite;
        }
        .aura-eye-right {
          transform-origin: 121px 94px;
          animation: auraBlinkAnim 3.6s ease-in-out infinite;
        }
        .aura-eye-active {
          animation: auraBlinkAnim 3.6s ease-in-out infinite, auraEyePulse 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* Konten Karakter dengan Animasi Melayang */}
      <g className="aura-character-floating">
        {/* 1. Bola 3D Glossy Sempurna */}
        <circle
          cx="100"
          cy="100"
          r="84"
          fill={`url(#bodyGrad-${id})`}
          filter={`url(#ballDropShadow-${id})`}
        />

        {/* 2. Rim Light Bawah (Kedalaman 3D) */}
        <circle
          cx="100"
          cy="100"
          r="84"
          fill={`url(#rimGrad-${id})`}
        />

        {/* 3. Kilauan Cahaya Glossy Utama di Kiri Atas */}
        <ellipse
          cx="76"
          cy="56"
          rx="46"
          ry="25"
          transform="rotate(-28 76 56)"
          fill={`url(#glossGrad-${id})`}
        />

        {/* Kilauan Cahaya Titik Lembut Tambahan */}
        <circle
          cx="60"
          cy="46"
          r="6.5"
          fill="#FFFFFF"
          opacity="0.65"
        />

        {/* 4. Dua Mata Putih Lonjong di Bagian Tengah-Atas */}
        {/* Mata Kiri */}
        <g
          className={`aura-eye-left ${activeState ? "aura-eye-active" : ""}`}
        >
          <ellipse
            cx="79"
            cy="96"
            rx="11.5"
            ry="17.5"
            transform="rotate(-4 79 96)"
            fill="#FFFFFF"
            filter={activeState ? `url(#eyeGlow-${id})` : "none"}
          />
        </g>

        {/* Mata Kanan */}
        <g
          className={`aura-eye-right ${activeState ? "aura-eye-active" : ""}`}
        >
          <ellipse
            cx="121"
            cy="94"
            rx="11.5"
            ry="17.5"
            transform="rotate(4 121 94)"
            fill="#FFFFFF"
            filter={activeState ? `url(#eyeGlow-${id})` : "none"}
          />
        </g>
      </g>
    </svg>
  );

  // ========================================================
  // RENDER BERDASARKAN SIZE
  // ========================================================

  // 1. Tampilan HERO (Tengah Layar)
  if (size === "hero") {
    return (
      <div
        className={`relative flex flex-col items-center justify-center select-none ${className}`}
        onClick={onClick}
      >
        {/* Soft Radial Ambient Glow di Belakang Karakter */}
        <div
          className={`absolute -inset-4 sm:-inset-6 rounded-full blur-3xl pointer-events-none transition-all duration-300 ${
            isDark
              ? "bg-linear-to-tr from-indigo-500/30 via-cyan-400/20 to-sky-500/25 opacity-70"
              : "bg-linear-to-tr from-indigo-200/40 via-sky-200/40 to-cyan-200/35 opacity-65"
          }`}
        />

        {/* Karakter SVG Melayang */}
        <div className={`relative ${currentSize.container} cursor-pointer`}>
          {svgContent}
        </div>

        {/* Bayangan Oval Melayang Dinamis di Bawah Karakter */}
        <div
          className={`${currentSize.shadow} rounded-full blur-md animate-shadow-pulse transition-colors ${
            isDark ? "bg-cyan-500/25" : "bg-slate-400/35"
          }`}
        />
      </div>
    );
  }

  // 2. Tampilan MINI (Header & Sidebar)
  if (size === "xs") {
    return (
      <div
        className={`relative ${currentSize.container} flex items-center justify-center shrink-0 ${className}`}
      >
        {svgContent}
        {activeState && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 animate-ping" />
        )}
      </div>
    );
  }

  // 3. Tampilan AVATAR CHAT BUBBLE (size === "md")
  return (
    <div className={`relative flex items-center gap-2 shrink-0 ${className}`}>
      <div
        className={`relative ${currentSize.container} flex items-center justify-center rounded-full transition-all duration-300 ${
          activeState
            ? `ring-2 ring-sky-400 ring-offset-2 ${
                isDark ? "ring-offset-slate-900" : "ring-offset-white"
              } scale-105`
            : ""
        }`}
      >
        {svgContent}
      </div>

      {/* Indikator Status Online / Berbicara */}
      <span
        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 transition-colors ${
          isDark ? "border-slate-900" : "border-white"
        } ${activeState ? "bg-sky-400 animate-pulse" : "bg-emerald-500"}`}
      />

      {/* Indikator Gelombang Suara (Voice Wave) saat berbicara */}
      {showWave && activeState && (
        <div
          className={`flex items-center gap-0.5 h-4 px-1.5 py-0.5 rounded-full border ${
            isDark
              ? "bg-sky-500/10 border-sky-400/30"
              : "bg-sky-100/80 border-sky-300"
          }`}
        >
          <span className="w-0.5 bg-sky-400 rounded-full animate-voice-1" />
          <span className="w-0.5 bg-sky-400 rounded-full animate-voice-2" />
          <span className="w-0.5 bg-sky-400 rounded-full animate-voice-3" />
          <span className="w-0.5 bg-sky-400 rounded-full animate-voice-4" />
        </div>
      )}
    </div>
  );
};

export default MascotCharacter;
