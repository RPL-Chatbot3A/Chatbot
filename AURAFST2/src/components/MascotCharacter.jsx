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
        {/* Gradasi 3D Utama Bola AURA-FST: Cyan cerah di atas -> Biru Elektrik di bawah */}
        <radialGradient
          id={`bodyGrad-${id}`}
          cx="38%"
          cy="28%"
          r="74%"
          fx="34%"
          fy="22%"
        >
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="16%" stopColor="#38BDF8" />
          <stop offset="42%" stopColor="#0EA5E9" />
          <stop offset="70%" stopColor="#0284C7" />
          <stop offset="92%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#075985" />
        </radialGradient>

        {/* Gradasi Halo Cahaya Putih-Cyan di Busur Atas Karakter (persis avatar AURA-FST) */}
        <linearGradient
          id={`topHaloGrad-${id}`}
          x1="0%"
          y1="100%"
          x2="0%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
          <stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
        </linearGradient>

        {/* Kilauan Cahaya Glossy di Sisi Kiri Atas */}
        <linearGradient
          id={`glossGrad-${id}`}
          x1="0%"
          y1="0%"
          x2="80%"
          y2="80%"
        >
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Pantulan Cahaya Tepi Halus (Rim Light) Bawah */}
        <radialGradient
          id={`rimGrad-${id}`}
          cx="50%"
          cy="92%"
          r="48%"
        >
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </radialGradient>

        {/* Filter Soft Glow untuk Halo & Mata */}
        <filter id={`softGlow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id={`ballDropShadow-${id}`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="10"
            floodColor="#0284C7"
            floodOpacity={isDark ? "0.4" : "0.25"}
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
            filter: drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 12px rgba(56,189,248,0.85));
          }
          50% {
            opacity: 0.85;
            filter: drop-shadow(0 0 3px rgba(255,255,255,0.7)) drop-shadow(0 0 6px rgba(56,189,248,0.5));
          }
        }
        .aura-character-floating {
          animation: auraFloatAnim 3.8s ease-in-out infinite;
          transform-origin: center;
        }
        .aura-eye ellipse {
          transform-origin: center;
          animation: auraBlinkAnim 3.6s ease-in-out infinite;
        }
        .aura-eye-active ellipse {
          animation: auraBlinkAnim 3.6s ease-in-out infinite, auraEyePulse 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* Konten Karakter dengan Animasi Melayang */}
      <g className="aura-character-floating">
        {/* 1. Bola 3D Glossy Sempurna (Cyan-Biru Elektrik) */}
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

        {/* 3. Busur Halo Putih Glowing di Atas Karakter (Ciri Khas Maskot AURA-FST) */}
        <path
          d="M 36 78 A 82 82 0 0 1 164 78"
          fill="none"
          stroke={`url(#topHaloGrad-${id})`}
          strokeWidth="11"
          strokeLinecap="round"
          filter={`url(#softGlow-${id})`}
          opacity="0.95"
        />

        {/* Kilauan Cahaya Glossy di Sisi Kiri Atas */}
        <ellipse
          cx="74"
          cy="54"
          rx="44"
          ry="22"
          transform="rotate(-26 74 54)"
          fill={`url(#glossGrad-${id})`}
        />

        {/* Kilauan Titik Cahaya Halus */}
        <circle
          cx="58"
          cy="46"
          r="6.5"
          fill="#FFFFFF"
          opacity="0.75"
        />

        {/* 4. Dua Mata Putih Lonjong Miring Sejajar (Sesuai Persis dengan Avatar Foto AURA-FST) */}
        {/* Mata Kiri (cx=82, cy=108, tilt -16deg) */}
        <g
          transform="translate(82, 108) rotate(-16)"
          className={`aura-eye ${activeState ? "aura-eye-active" : ""}`}
        >
          <ellipse
            cx="0"
            cy="0"
            rx="12.5"
            ry="19.5"
            fill="#FFFFFF"
          />
        </g>

        {/* Mata Kanan (cx=124, cy=98, sedikit lebih tinggi, tilt -16deg) */}
        <g
          transform="translate(124, 98) rotate(-16)"
          className={`aura-eye ${activeState ? "aura-eye-active" : ""}`}
        >
          <ellipse
            cx="0"
            cy="0"
            rx="13.5"
            ry="20.5"
            fill="#FFFFFF"
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
