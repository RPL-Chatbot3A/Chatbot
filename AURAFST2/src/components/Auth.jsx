
import React, { useState } from "react";
import { supabase } from "../config/supabase";
import { Sparkles, Mail, Lock, UserRound } from "lucide-react";

function Auth() {
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
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-b from-slate-800 to-slate-900 text-zinc-100 font-sans p-4">

      <div className="w-full max-w-md">

        {/* Identitas AURA FST */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg mb-4">
            <Sparkles size={28} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            AURA-FST
          </h1>

          <p className="text-sm text-slate-400 text-center mt-2">
            Asisten Informasi Akademik
            <br />
            Fakultas Sains dan Teknologi
          </p>
        </div>

        {/* Kartu Login */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-7 sm:p-8 shadow-2xl">

          <h2 className="text-xl font-semibold text-center mb-2">
            {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
          </h2>

          <p className="text-sm text-slate-400 text-center mb-7">
            {isLogin
              ? "Silakan login untuk melanjutkan ke AURA-FST"
              : "Daftarkan akun untuk menggunakan AURA-FST"}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">

            {!isLogin && (
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Nama Lengkap
                </label>

                <div className="flex items-center gap-3 bg-slate-700/70 border border-slate-600 rounded-xl px-4">
                  <UserRound size={18} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-400 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email
              </label>

              <div className="flex items-center gap-3 bg-slate-700/70 border border-slate-600 rounded-xl px-4">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <div className="flex items-center gap-3 bg-slate-700/70 border border-slate-600 rounded-xl px-4">
                <Lock size={18} className="text-slate-400" />
                <input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 bg-linear-to-br from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold py-3 rounded-full transition-all shadow-lg shadow-sky-900/20"
            >
              {isLoading
                ? "Memproses..."
                : isLogin
                  ? "Login"
                  : "Daftar"}
            </button>
          </form>

          {message && (
            <div className="mt-5 p-3 rounded-xl bg-slate-700 border border-slate-600 text-sm text-center text-slate-200">
              {message}
            </div>
          )}

          <div className="text-center mt-6 text-sm text-slate-400">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
              className="text-sky-400 hover:text-cyan-300 font-semibold ml-1"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-slate-500 mt-6">
          AURA-FST · Fakultas Sains dan Teknologi
        </p>

      </div>
    </div>
  );
}

export default Auth;
