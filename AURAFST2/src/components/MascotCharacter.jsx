import React, { useRef, useEffect } from "react";

/**
 * Komponen Maskot Karakter Interaktif AURA-FST
 * - Menampilkan karakter murni tanpa latar kotak dengan radial vignette halus
 * - Seamless blending baik di Dark Mode maupun Light Mode
 * - Animasi gerak mulut dan ekspresi sesuai status berbicara bot
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isSpeaking) {
      // Saat bot berbicara, putar video (gerakan mulut dan ekspresi aktif)
      video.playbackRate = 1.0;
      video.play().catch(() => {});
    } else if (size === "hero") {
      // Di tampilan utama hero, putar santai
      video.playbackRate = 0.9;
      video.play().catch(() => {});
    } else {
      // Saat bot diam/idle, jeda video agar mulut tidak terus bergerak
      video.pause();
    }
  }, [isSpeaking, size]);

  const blendClass =
    theme === "dark"
      ? "mascot-blend-dark mix-blend-screen"
      : "mascot-blend-light mix-blend-normal";

  if (size === "hero") {
    return (
      <div
        className={`relative flex flex-col items-center justify-center select-none ${className}`}
        onClick={onClick}
      >
        {/* Efek Ambient Glow lembut di belakang karakter disesuaikan dengan tema */}
        <div
          className={`absolute -inset-4 rounded-full blur-3xl pointer-events-none transition-all duration-300 ${
            theme === "dark"
              ? "bg-linear-to-tr from-sky-500/20 via-cyan-400/15 to-indigo-500/20 opacity-80"
              : "bg-linear-to-tr from-sky-300/40 via-cyan-200/40 to-blue-300/30 opacity-70"
          }`}
        />

        {/* Karakter Maskot Melayang murni dengan radial mask vignette halus */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 animate-mascot-float flex items-center justify-center pointer-events-auto">
          <div className="w-full h-full mascot-vignette flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-full object-contain cursor-pointer transition-all duration-300 ${blendClass}`}
            >
              <source src="/mascot.webm" type="video/webm" />
              <source src="/mascot.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        {/* Efek Bayangan Melayang di bawah karakter */}
        <div
          className={`w-28 sm:w-36 h-3 rounded-full blur-md animate-shadow-pulse -mt-2 transition-colors ${
            theme === "dark" ? "bg-sky-500/20" : "bg-sky-400/25"
          }`}
        />
      </div>
    );
  }

  if (size === "xs") {
    return (
      <div
        className={`relative w-8 h-8 flex items-center justify-center ${className}`}
      >
        <div className="w-full h-full mascot-vignette flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-contain ${blendClass}`}
          >
            <source src="/mascot.webm" type="video/webm" />
            <source src="/mascot.mp4" type="video/mp4" />
          </video>
        </div>
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
        className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isSpeaking
            ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-105"
            : ""
        }`}
      >
        <div className="w-full h-full mascot-vignette flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-contain ${blendClass}`}
          >
            <source src="/mascot.webm" type="video/webm" />
            <source src="/mascot.mp4" type="video/mp4" />
          </video>
        </div>
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 transition-colors ${
            theme === "dark" ? "border-slate-900" : "border-white"
          } ${isSpeaking ? "bg-sky-400 animate-pulse" : "bg-emerald-500"}`}
        />
      </div>

      {/* Indikator Gelombang Suara (Voice Wave) saat berbicara */}
      {showWave && isSpeaking && (
        <div
          className={`flex items-center gap-0.5 h-4 px-1.5 py-0.5 rounded-full border ${
            theme === "dark"
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
