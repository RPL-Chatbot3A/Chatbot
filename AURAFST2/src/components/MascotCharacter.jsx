import React, { useRef, useEffect } from "react";

/**
 * Komponen Maskot Karakter Interaktif AURA-FST
 * - Dibungkus dalam kontainer lingkaran presisi (rounded-full overflow-hidden)
 * - Tanpa mix-blend-mode agar tidak menghasilkan artefak kotak/abu-abu di Light Mode
 * - Memprioritaskan video "/mascot.webm" dengan transparansi alpha channel asli
 * - Dilengkapi efek soft radial glow halus di belakangnya
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

  if (size === "hero") {
    return (
      <div
        className={`relative flex flex-col items-center justify-center select-none ${className}`}
        onClick={onClick}
      >
        {/* Soft Radial Glow halus di belakang lingkaran karakter */}
        <div
          className={`absolute -inset-3 sm:-inset-4 rounded-full blur-2xl pointer-events-none transition-all duration-300 ${
            isDark
              ? "bg-sky-500/25 opacity-75"
              : "bg-sky-400/30 opacity-70"
          }`}
        />

        {/* Kontainer Lingkaran Presisi (rounded-full overflow-hidden) */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden animate-mascot-float flex items-center justify-center bg-transparent pointer-events-auto">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-105 cursor-pointer"
          >
            {/* Prioritas WebM dengan Alpha Channel */}
            <source src="/mascot.webm" type="video/webm" />
            <source src="/mascot.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Efek Bayangan Halus di bawah karakter */}
        <div
          className={`w-28 sm:w-36 h-3 rounded-full blur-md animate-shadow-pulse mt-1 transition-colors ${
            isDark ? "bg-sky-500/25" : "bg-sky-400/25"
          }`}
        />
      </div>
    );
  }

  if (size === "xs") {
    return (
      <div
        className={`relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${className}`}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105"
        >
          <source src="/mascot.webm" type="video/webm" />
          <source src="/mascot.mp4" type="video/mp4" />
        </video>
        {isSpeaking && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 animate-ping" />
        )}
      </div>
    );
  }

  // Ukuran "md" untuk Avatar di Percakapan Chat
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
          className="w-full h-full object-cover scale-105"
        >
          <source src="/mascot.webm" type="video/webm" />
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
