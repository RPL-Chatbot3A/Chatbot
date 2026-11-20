import React, { useRef, useEffect } from "react";

/**
 * Komponen Maskot Karakter Interaktif AURA-FST
 * Menyesuaikan video berlatar belakang putih murni (public/mascot.mp4):
 *
 * 1. Saat Light Mode:
 *    - Menggunakan mix-blend-multiply sehingga latar putih video 100% transparan dan
 *      menyatu sempurna tanpa kotak dengan warna halaman, dilengkapi bayangan melayang lembut.
 * 2. Saat Dark Mode:
 *    - Dibungkus dalam container lingkaran presisi (rounded-full overflow-hidden) dengan
 *      zoom/scale 2.8x sehingga hanya bola karakter yang terlihat bulat tanpa sisa putih di luar,
 *      serta soft radial glow ungu-cyan di belakangnya.
 * 3. Video berjalan lancar: autoPlay, loop, muted, dan playsInline.
 */
export const MascotCharacter = ({
  size = "md", // "xs" (header/sidebar), "md" (chat bubble), "hero" (center screen)
  isSpeaking = false,
  showWave = false,
  theme = "dark",
  className = "",
  onClick,
}) => {
  const videoRef = useRef(null);
  const isDark = theme === "dark";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isSpeaking) {
      video.playbackRate = 1.0;
      video.play().catch(() => {});
    } else if (size === "hero") {
      video.playbackRate = 0.9;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isSpeaking, size]);

  // ========================================================
  // A. TAMPILAN HERO (TENGAH LAYAR)
  // ========================================================
  if (size === "hero") {
    return (
      <div
        className={`relative flex flex-col items-center justify-center select-none ${className}`}
        onClick={onClick}
      >
        {/* Soft Radial Glow di Belakang Lingkaran Maskot */}
        <div
          className={`absolute -inset-4 sm:-inset-6 rounded-full blur-2xl pointer-events-none transition-all duration-300 ${
            isDark
              ? "bg-linear-to-tr from-indigo-500/35 via-cyan-400/25 to-sky-500/30 opacity-80"
              : "bg-linear-to-tr from-sky-200/50 via-cyan-100/50 to-indigo-100/40 opacity-70"
          }`}
        />

        {/* Kontainer Maskot: Lingkaran Presisi di Dark Mode & Multiply Seamless di Light Mode */}
        <div
          className={`relative w-40 h-40 sm:w-48 sm:h-48 animate-mascot-float flex items-center justify-center pointer-events-auto ${
            isDark
              ? "rounded-full overflow-hidden bg-transparent shadow-lg shadow-cyan-950/40"
              : "rounded-full overflow-hidden bg-transparent"
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover scale-[2.8] cursor-pointer transition-all duration-300 ${
              isDark ? "mix-blend-normal" : "mix-blend-multiply"
            }`}
          >
            <source src="/mascot.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Bayangan Halus Melayang di Bawah Karakter */}
        <div
          className={`w-28 sm:w-36 h-3 rounded-full blur-md animate-shadow-pulse mt-2 transition-colors ${
            isDark ? "bg-cyan-500/20" : "bg-slate-400/30"
          }`}
        />
      </div>
    );
  }

  // ========================================================
  // B. TAMPILAN MINI (HEADER & SIDEBAR)
  // ========================================================
  if (size === "xs") {
    return (
      <div
        className={`relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${className} ${
          isDark ? "bg-transparent" : "bg-transparent"
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover scale-[2.8] ${
            isDark ? "mix-blend-normal" : "mix-blend-multiply"
          }`}
        >
          <source src="/mascot.mp4" type="video/mp4" />
        </video>
        {isSpeaking && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 animate-ping" />
        )}
      </div>
    );
  }

  // ========================================================
  // C. TAMPILAN AVATAR CHAT BUBBLE
  // ========================================================
  return (
    <div className={`relative flex items-center gap-2 shrink-0 ${className}`}>
      <div
        className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 ${
          isSpeaking
            ? `ring-2 ring-sky-400 ring-offset-2 ${
                isDark ? "ring-offset-slate-900" : "ring-offset-white"
              } scale-105`
            : ""
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover scale-[2.8] ${
            isDark ? "mix-blend-normal" : "mix-blend-multiply"
          }`}
        >
          <source src="/mascot.mp4" type="video/mp4" />
        </video>
      </div>

      <span
        className={`absolute bottom-0 left-7 sm:left-8 w-2.5 h-2.5 rounded-full border-2 transition-colors ${
          isDark ? "border-slate-900" : "border-white"
        } ${isSpeaking ? "bg-sky-400 animate-pulse" : "bg-emerald-500"}`}
      />

      {/* Indikator Gelombang Suara (Voice Wave) saat berbicara */}
      {showWave && isSpeaking && (
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
