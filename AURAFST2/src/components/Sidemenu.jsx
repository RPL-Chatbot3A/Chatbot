import React from "react";
import { Plus, MessageSquare, Trash2, LogOut, PanelLeft, PanelLeftClose } from "lucide-react";
import { SIDEBAR_SECTIONS } from "../data/sidebarContent";
import SidebarmenuItems from "./SidebarmenuItems";
import MascotCharacter from "./MascotCharacter";

export const Sidemenu = ({
  theme = "dark",
  onCloseSidebar,
  onNewChat,
  onSelectPrompt,
  chatHistory,
  onLogout,
}) => {
  const isDark = theme === "dark";

  return (
    <div
      className={`flex flex-col h-full w-full p-3 select-none transition-colors duration-200 ${
        isDark ? "bg-slate-900 text-zinc-100" : "bg-white text-slate-800"
      }`}
    >
      {/* Header Sidebar: Mascot/Logo di Kiri, Tombol Close di Kanan */}
      <div
        className={`space-y-3 pb-3 border-b ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between gap-2 pt-0.5 pl-1.5">
          {/* Kiri: Maskot Avatar & Nama Aplikasi */}
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

          {/* Kanan: Tombol Close Sidebar */}
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

              {/* Tooltip rata kanan (right-0) agar tidak terpotong tepi sidebar */}
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
          <span className="truncate">Percakapan Baru</span>
        </button>
      </div>

      {/* Riwayat Percakapan (Supabase) */}
      {chatHistory && (
        <div
          className={`space-y-1.5 py-2 border-b ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <p
            className={`px-2 text-[11px] font-semibold uppercase tracking-wider truncate ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Riwayat Percakapan
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1 px-1">
            {chatHistory.isLoading ? (
              <p
                className={`px-2 py-1 text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Memuat riwayat...
              </p>
            ) : !chatHistory.conversations || chatHistory.conversations.length === 0 ? (
              <p
                className={`px-2 py-1 text-xs ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Belum ada riwayat percakapan.
              </p>
            ) : (
              chatHistory.conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 border ${
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
              ))
            )}
          </div>
        </div>
      )}

      {/* Daftar Menu / FAQ Repeatable */}
      <div className="flex-1 overflow-y-auto py-3 space-y-5">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-1">
            <p
              className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider truncate ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarmenuItems
                  key={item.id}
                  theme={theme}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  badge={item.badge}
                  onClick={() => {
                    if (item.prompt && onSelectPrompt) {
                      onSelectPrompt(item.prompt);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info & Tombol Logout */}
      <div
        className={`pt-3 border-t px-2 space-y-2 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div
          className={`flex items-center gap-2 text-[11px] ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">Fakultas Sains &amp; Teknologi</span>
        </div>

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
