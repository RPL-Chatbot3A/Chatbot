import React, { useState } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Globe,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { OFFICIAL_PORTAL_LINKS } from "../data/sidebarContent";
import MascotCharacter from "./MascotCharacter";

export const Sidemenu = ({
  theme = "dark",
  onCloseSidebar,
  onNewChat,
  chatHistory,
  onLogout,
}) => {
  const isDark = theme === "dark";
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  return (
    <div
      className={`flex flex-col h-full w-full select-none transition-colors duration-200 ${
        isDark ? "bg-slate-900 text-zinc-100" : "bg-white text-slate-800"
      }`}
    >
      {/* ========================================================
          A. HEADER ATAS (shrink-0)
          - Logo AURA-FST & Maskot Mini
          - Tombol Tutup Sidebar
          - Tombol "+ Percakapan Baru"
          ======================================================== */}
      <div
        className={`shrink-0 p-3 pb-3 space-y-3 border-b ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between gap-2 pt-0.5 pl-1">
          {/* Logo & Maskot */}
          <div className="flex items-center gap-2.5 min-w-0">
            <MascotCharacter size="xs" theme={theme} />
            <span
              className={`font-semibold text-sm tracking-tight truncate ${
                isDark ? "text-zinc-100" : "text-slate-900"
              }`}
            >
              AURA-FST
            </span>
          </div>

          {/* Tombol Tutup Sidebar */}
          {onCloseSidebar && (
            <button
              type="button"
              onClick={onCloseSidebar}
              aria-label="Close sidebar"
              className={`group relative p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <PanelLeft size={18} className="block group-hover:hidden" />
              <PanelLeftClose
                size={18}
                className={`hidden group-hover:block ${
                  isDark ? "text-slate-50" : "text-slate-900"
                }`}
              />

              <span
                className={`pointer-events-none absolute top-full right-0 mt-2 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50 border ${
                  isDark
                    ? "bg-slate-950 text-zinc-100 border-slate-700/80"
                    : "bg-white text-slate-900 border-slate-200 shadow-slate-200"
                }`}
              >
                Close sidebar
              </span>
            </button>
          )}
        </div>

        {/* Tombol Percakapan Baru */}
        <button
          type="button"
          onClick={onNewChat}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-xs ${
            isDark
              ? "bg-slate-800 hover:bg-slate-700/90 text-zinc-100 border-slate-700/80"
              : "bg-slate-100 hover:bg-slate-200/90 text-slate-800 border-slate-300/80"
          }`}
        >
          <Plus size={16} className="text-sky-500 shrink-0" />
          <span className="truncate font-semibold">Percakapan Baru</span>
        </button>
      </div>

      {/* ========================================================
          B. BAGIAN TENGAH (flex-1 overflow-y-auto)
          - Khusus hanya untuk "RIWAYAT PERCAKAPAN"
          - Hanya ada 1 scrollbar yang bersih di seluruh sidebar
          ======================================================== */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between px-2 pt-1 pb-1">
          <p
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Riwayat Percakapan
          </p>
          {chatHistory?.conversations?.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
              }`}
            >
              {chatHistory.conversations.length}
            </span>
          )}
        </div>

        {chatHistory?.isLoading ? (
          <div className="px-3 py-6 text-center">
            <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p
              className={`text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Memuat riwayat...
            </p>
          </div>
        ) : !chatHistory?.conversations || chatHistory.conversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare
              size={24}
              className={`mx-auto mb-2 opacity-40 ${
                isDark ? "text-slate-600" : "text-slate-400"
              }`}
            />
            <p
              className={`text-xs ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Belum ada riwayat percakapan.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {chatHistory.conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between gap-1.5 px-2.5 py-2 rounded-xl text-xs transition-all duration-150 border ${
                  isDark
                    ? "hover:bg-slate-800 text-slate-300 hover:text-white border-transparent hover:border-slate-700/60"
                    : "hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-transparent hover:border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => chatHistory.onOpen?.(conv.id)}
                  className="flex-1 min-w-0 text-left truncate cursor-pointer hover:text-sky-500 flex items-center gap-2"
                  title={conv.title}
                >
                  <MessageSquare
                    size={13}
                    className="text-slate-400 shrink-0 group-hover:text-sky-500"
                  />
                  <span className="truncate">{conv.title || "Percakapan Baru"}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Hapus percakapan ini?")) {
                      chatHistory.onDelete?.(conv.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all cursor-pointer shrink-0"
                  title="Hapus percakapan"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          C. FOOTER BAWAH (shrink-0 border-t)
          - Menu Dropdown Popover "Portal & Tautan Resmi"
          - Status Profil & Tombol Keluar Akun
          ======================================================== */}
      <div
        className={`shrink-0 p-3 space-y-2 border-t ${
          isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
        }`}
      >
        {/* Dropdown Popover Portal & Tautan Resmi */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPortalOpen((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
              isDark
                ? "bg-slate-800/80 hover:bg-slate-850 text-slate-300 border-slate-750"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-sky-500 shrink-0" />
              <span className="truncate">Portal &amp; Tautan Resmi</span>
            </div>
            {isPortalOpen ? (
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            ) : (
              <ChevronUp size={14} className="text-slate-400 shrink-0" />
            )}
          </button>

          {/* Isi Popover Link Resmi */}
          {isPortalOpen && (
            <div
              className={`absolute bottom-full left-0 right-0 mb-2 p-2 rounded-2xl border shadow-xl z-50 space-y-1 transition-all ${
                isDark
                  ? "bg-slate-850 border-slate-700 text-zinc-100 shadow-slate-950/80"
                  : "bg-white border-slate-200 text-slate-800 shadow-slate-300/60"
              }`}
            >
              <p
                className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Pilih Portal Akademik:
              </p>
              {OFFICIAL_PORTAL_LINKS.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isDark
                        ? "hover:bg-slate-750 text-slate-300 hover:text-white"
                        : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent
                        size={14}
                        className="text-sky-500 shrink-0"
                      />
                      <span className="truncate">{link.label}</span>
                    </div>
                    <ExternalLink
                      size={12}
                      className="text-slate-400 shrink-0 opacity-70"
                    />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Profil Instansi */}
        <div
          className={`flex items-center gap-2 px-1 text-[11px] ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate font-medium">Fakultas Sains &amp; Teknologi</span>
        </div>

        {/* Tombol Logout */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                : "text-slate-600 hover:text-rose-600 hover:bg-rose-50"
            }`}
          >
            <LogOut size={14} className="shrink-0" />
            <span>Keluar Akun</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidemenu;
