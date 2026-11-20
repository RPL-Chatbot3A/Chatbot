import React, { useState } from "react";
import { supabase } from "../config/supabase";
import { Mail, Lock, UserRound, Sun, Moon } from "lucide-react";
import MascotCharacter from "./MascotCharacter";

function Auth({ theme = "dark", onToggleTheme }) {
  const isDark = theme === "dark";

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        setMessage(
          "Registrasi berhasil. Periksa email untuk verifikasi jika diminta."
        );
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center font-sans p-4 relative transition-colors duration-200 ${
        isDark
          ? "bg-linear-to-b from-slate-900 via-slate-850 to-slate-950 text-zinc-100"
          : "bg-linear-to-b from-slate-100 via-white to-slate-100 text-slate-800"
      }`}
    >
      {/* Tombol Toggle Tema di Pojok Kanan Atas */}
      {onToggleTheme && (
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          className={`absolute top-5 right-5 p-2.5 rounded-full transition-all cursor-pointer border shadow-xs ${
            isDark
              ? "bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700"
              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
          }`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      <div className="w-full max-w-md">
        {/* Identitas AURA FST */}
        <div className="flex flex-col items-center mb-6">
          <MascotCharacter size="hero" theme={theme} className="scale-75 -my-6" />

          <h1
            className={`text-2xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            AURA-FST
          </h1>

          <p
            className={`text-sm text-center mt-2 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Asisten Informasi Akademik
            <br />
            Fakultas Sains dan Teknologi
          </p>
        </div>

        {/* Kartu Login / Register */}
        <div
          className={`border rounded-3xl p-7 sm:p-8 shadow-2xl transition-colors duration-200 ${
            isDark
              ? "bg-slate-800/90 border-slate-700/80 shadow-slate-950/60"
              : "bg-white border-slate-200 shadow-slate-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold text-center mb-2 ${
              isDark ? "text-zinc-100" : "text-slate-900"
            }`}
          >
            {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
          </h2>

          <p
            className={`text-sm text-center mb-7 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {isLogin
              ? "Silakan login untuk melanjutkan ke AURA-FST"
              : "Daftarkan akun untuk menggunakan AURA-FST"}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label
                  className={`block text-sm mb-2 font-medium ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Nama Lengkap
                </label>

                <div
                  className={`flex items-center gap-3 border rounded-xl px-4 transition-colors ${
                    isDark
                      ? "bg-slate-700/70 border-slate-600 focus-within:border-sky-400"
                      : "bg-slate-50 border-slate-300 focus-within:border-sky-500"
                  }`}
                >
                  <UserRound
                    size={18}
                    className={isDark ? "text-slate-400" : "text-slate-500"}
                  />
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={`w-full bg-transparent py-3 text-sm outline-none ${
                      isDark
                        ? "text-white placeholder:text-slate-400"
                        : "text-slate-900 placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label
                className={`block text-sm mb-2 font-medium ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Email
              </label>

              <div
                className={`flex items-center gap-3 border rounded-xl px-4 transition-colors ${
                  isDark
                    ? "bg-slate-700/70 border-slate-600 focus-within:border-sky-400"
                    : "bg-slate-50 border-slate-300 focus-within:border-sky-500"
                }`}
              >
                <Mail
                  size={18}
                  className={isDark ? "text-slate-400" : "text-slate-500"}
                />
                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full bg-transparent py-3 text-sm outline-none ${
                    isDark
                      ? "text-white placeholder:text-slate-400"
                      : "text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm mb-2 font-medium ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Password
              </label>

              <div
                className={`flex items-center gap-3 border rounded-xl px-4 transition-colors ${
                  isDark
                    ? "bg-slate-700/70 border-slate-600 focus-within:border-sky-400"
                    : "bg-slate-50 border-slate-300 focus-within:border-sky-500"
                }`}
              >
                <Lock
                  size={18}
                  className={isDark ? "text-slate-400" : "text-slate-500"}
                />
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`w-full bg-transparent py-3 text-sm outline-none ${
                    isDark
                      ? "text-white placeholder:text-slate-400"
                      : "text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 bg-linear-to-br from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-all shadow-lg shadow-sky-500/25 cursor-pointer"
            >
              {isLoading ? "Memproses..." : isLogin ? "Login" : "Daftar"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-5 p-3 rounded-xl border text-sm text-center ${
                message.toLowerCase().includes("berhasil")
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {message}
            </div>
          )}

          <div
            className={`mt-6 pt-5 border-t text-center ${
              isDark ? "border-slate-700/70" : "border-slate-200"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin((prev) => !prev);
                  setMessage("");
                }}
                className="text-sky-500 hover:text-sky-400 font-semibold cursor-pointer underline-offset-4 hover:underline ml-1"
              >
                {isLogin ? "Daftar Sekarang" : "Login di Sini"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
