import React from "react";
import { Plus, MessageSquare, Trash2, LogOut } from "lucide-react";
import { SIDEBAR_SECTIONS } from "../data/sidebarContent";
import SidebarmenuItems from "./SidebarmenuItems";
import MascotCharacter from "./MascotCharacter";

export const Sidemenu = ({
  onNewChat,
  onSelectPrompt,
  chatHistory,
  onLogout,
}) => {
  return (
    <div className="flex flex-col h-full w-full min-w-52.5 bg-slate-900 text-zinc-100 select-none gap-3 p-4">
      {/* Header Brand & Tombol Percakapan Baru */}
      <div className="space-y-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5 px-2 pt-1">
          <MascotCharacter size="xs" />
          <span className="font-semibold text-sm tracking-wide text-zinc-100 truncate">
            AURA-FST
          </span>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700/90 text-zinc-100 text-xs font-medium border border-slate-700/80 transition-all cursor-pointer shadow-sm"
        >
          <Plus size={16} className="text-sky-400 shrink-0" />
          <span className="truncate">Percakapan Baru</span>
        </button>
      </div>

      {/* Riwayat Percakapan (Supabase) */}
      {chatHistory && (
        <div className="space-y-1.5 pb-2 border-b border-slate-800">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
            Riwayat Percakapan
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1 px-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {chatHistory.isLoading ? (
              <p className="px-2 py-1 text-xs text-slate-400">Memuat riwayat...</p>
            ) : !chatHistory.conversations || chatHistory.conversations.length === 0 ? (
              <p className="px-2 py-1 text-xs text-slate-500">Belum ada riwayat percakapan.</p>
            ) : (
              chatHistory.conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-all duration-150 border border-transparent hover:border-slate-700/60"
                >
                  <button
                    type="button"
                    onClick={() => chatHistory.onOpen?.(conv.id)}
                    className="flex-1 min-w-0 text-left truncate cursor-pointer hover:text-sky-300 flex items-center gap-2"
                    title={conv.title}
                  >
                    <MessageSquare size={13} className="text-slate-400 shrink-0 group-hover:text-sky-400" />
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
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer shrink-0"
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

      {/* Daftar Menu Repeatable */}
      <div className="flex-1 overflow-y-auto py-3 space-y-5 gap-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-1">
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarmenuItems
                  key={item.id}
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
      <div className="pt-3 border-t border-slate-800 px-2 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">Fakultas Sains &amp; Teknologi</span>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidemenu;
