
import React, { useEffect, useState, useCallback } from "react";
import ChatUI from "./components/ChatUI";
import Auth from "./components/Auth";
import { supabase } from "./config/supabase";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chatHistory, setChatHistory] = useState({
  conversations: [],
  isLoading: false,
  onOpen: null,
  onDelete: null,
});

const handleHistoryChange = useCallback((historyData) => {
  setChatHistory(historyData);
}, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error(error);
      }

      setSession(data?.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout gagal:", error.message);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Memuat...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="h-dvh w-full bg-slate-900 flex flex-row overflow-hidden">
      <aside
  className={`h-full bg-slate-950 text-zinc-100 overflow-hidden shrink-0 transition-all duration-300 ${
    isSidebarOpen
      ? "basis-64 opacity-100 border-r border-slate-700/80"
      : "basis-0 opacity-0"
  }`}
>
  <div className="flex flex-col h-full w-64 whitespace-nowrap p-4 bg-slate-950">

   <div className="mb-7 px-2">
  <h1 className="text-xl font-bold tracking-wide text-sky-400">
    AURA FST
  </h1>
  <p className="mt-1 text-xs text-slate-400">
    Academic Chatbot
  </p>
</div>
    

<div className="mb-4 px-2">
  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
    Riwayat Percakapan
  </h2>

  <button
    type="button"
    onClick={() => chatHistory.onNewChat?.()}
    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 rounded-lg transition-all duration-200"
  >
    + New Chat
  </button>
</div>


<div className="flex-1 overflow-y-auto space-y-2 px-2">
    {chatHistory.isLoading ? (
      <p className="text-xs text-slate-400">Memuat riwayat...</p>
    ) : chatHistory.conversations.length === 0 ? (
      <p className="text-xs text-slate-400">
        Belum ada riwayat percakapan.
      </p>
    ) : (
      chatHistory.conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/70 group transition-all duration-200"
        >
          <button
            type="button"
            onClick={() => chatHistory.onOpen?.(conversation.id)}
           className="flex-1 min-w-0 text-left text-sm text-slate-200 hover:text-sky-300 truncate transition-colors"
            title={conversation.title}
          >
            {conversation.title || "Percakapan Baru"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Hapus percakapan ini?")) {
                chatHistory.onDelete?.(conversation.id);
              }
            }}
            className="shrink-0 whitespace-nowrap px-2 py-1 text-[11px] font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all duration-200"
            title="Hapus percakapan"
          >
            Hapus
          </button>
        </div>
      ))
        )}
  </div>

 <button
  onClick={handleLogout}
  className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
>
  Logout
</button>

  </div>
</aside>

      <div className="flex-1 min-w-0 h-full">
        
        <div className="h-[calc(100%-48px)]">
          <ChatUI
  isSidebarOpen={isSidebarOpen}
  onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
  onLogout={handleLogout}
  onHistoryChange={handleHistoryChange}
/>
               </div>
      </div>
    </div>
  );
}

export default App;
