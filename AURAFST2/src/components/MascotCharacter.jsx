import React, { useRef, useEffect } from "react";

/**
 * Komponen Maskot Karakter Interaktif AURA-FST
 * - Menampilkan karakter murni tanpa latar belakang (Transparan WebM VP9 + fallback MP4)
 * - Mengontrol animasi gerak mulut dan ekspresi sesuai status berbicara bot
 */
export const MascotCharacter = ({
  size = "md", // "xs" (header/sidebar), "md" (chat bubble), "hero" (center screen)
  isSpeaking = false,
  showWave = false,
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

  if (size === "hero") {
    return (
      <div
        className={`relative flex flex-col items-center justify-center select-none ${className}`}
        onClick={onClick}
      >
        {/* Efek Ambient Glow lembut di belakang karakter */}
        <div className="absolute -inset-4 bg-linear-to-tr from-sky-500/20 via-cyan-400/15 to-indigo-500/20 rounded-full blur-3xl opacity-75 pointer-events-none" />

        {/* Karakter Maskot Melayang murni tanpa latar kotak */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 animate-mascot-float flex items-center justify-center pointer-events-auto">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain mascot-blend cursor-pointer"
          >
            <source src="/mascot.webm" type="video/webm" />
            <source src="/mascot.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Efek Bayangan Melayang di bawah karakter */}
        <div className="w-28 sm:w-36 h-3 rounded-full bg-sky-500/20 blur-md animate-shadow-pulse -mt-2" />
      </div>
    );
  }

  if (size === "xs") {
    return (
      <div className={`relative w-8 h-8 flex items-center justify-center ${className}`}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain mascot-blend"
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
        className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isSpeaking
            ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-105"
            : ""
        }`}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain mascot-blend"
        >
          <source src="/mascot.webm" type="video/webm" />
          <source src="/mascot.mp4" type="video/mp4" />
        </video>
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 transition-colors ${
            isSpeaking ? "bg-sky-400 animate-pulse" : "bg-emerald-500"
          }`}
        />
      </div>

      {/* Indikator Gelombang Suara (Voice Wave) saat berbicara */}
      {showWave && isSpeaking && (
        <div className="flex items-center gap-0.5 h-4 px-1.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/30">
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
