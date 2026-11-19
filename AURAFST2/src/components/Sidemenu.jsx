import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { SIDEBAR_SECTIONS } from "../data/sidebarContent";
import SidebarmenuItems from "./SidebarmenuItems";

export const Sidemenu = ({ onNewChat, onSelectPrompt }) => {
  return (
    <div className="flex flex-col h-full w-full min-w-52.5 bg-slate-900 text-zinc-100 select-none gap-3 p-4">
      {/* Header Brand & Tombol Percakapan Baru */}
      <div className="space-y-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-6 h-6 rounded-lg bg-linear-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles size={13} />
          </div>
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

      {/* Daftar Menu Repeatable */}
      <div className="flex-1 overflow-y-auto py-3 space-y-5 gap-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkizt-scrollbar-thumb]:rounded-full">
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
