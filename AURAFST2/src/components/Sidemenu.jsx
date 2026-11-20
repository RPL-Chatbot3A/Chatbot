import React from "react";
import { Plus, Sparkles, PanelLeft, PanelLeftClose } from "lucide-react";
import { SIDEBAR_SECTIONS } from "../data/sidebarContent";
import SidebarmenuItems from "./SidebarmenuItems";

export const Sidemenu = ({ onCloseSidebar, onNewChat, onSelectPrompt }) => {
  return (
    <div className="flex flex-col h-full w-full bg-slate-900 text-zinc-100 p-3 select-none">
      {/* Header Sidebar: Logo di Kiri, Tombol Close di Kanan */}
      <div className="space-y-3 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2 pt-0.5 pl-1.5">
          {/* Kiri: Logo & Nama Aplikasi */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles size={14} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-100 truncate">
              AURA-FST
            </span>
          </div>

          {/* Kanan: Tombol Close Sidebar */}
          <button
            type="button"
            onClick={onCloseSidebar}
            aria-label="Close sidebar"
            className="group relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <PanelLeft size={18} className="block group-hover:hidden" />
            <PanelLeftClose
              size={18}
              className="hidden group-hover:block text-slate-50"
            />

            {/* Tooltip rata kanan (right-0) agar tidak terpotong tepi sidebar */}
            <span className="pointer-events-none absolute top-full right-0 mt-2 px-2.5 py-1 rounded-lg bg-slate-950 text-zinc-100 text-[11px] font-medium whitespace-nowrap border border-slate-700/80 shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50">
              Close sidebar
            </span>
          </button>
        </div>

        {/* Tombol Percakapan Baru */}
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700/90 text-zinc-100 text-xs font-medium border border-slate-700/80 transition-all cursor-pointer shadow-sm"
        >
          <Plus size={16} className="text-sky-400 shrink-0" />
          <span className="truncate">Percakapan Baru</span>
        </button>
      </div>

      {/* Daftar Menu / FAQ Repeatable */}
      <div className="flex-1 overflow-y-auto py-3 space-y-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
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

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800 px-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">Fakultas Sains &amp; Teknologi</span>
        </div>
      </div>
    </div>
  );
};

export default Sidemenu;