import React, { useEffect, useState, useCallback } from "react";
import ChatUI from "./components/ChatUI";
import Sidemenu from "./components/Sidemenu";
import Auth from "./components/Auth";
import { supabase } from "./config/supabase";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);
  const [sidebarPrompt, setSidebarPrompt] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chatHistory, setChatHistory] = useState({
    conversations: [],
    isLoading: false,
    onOpen: null,
    onDelete: null,
    onNewChat: null,
  });

  const handleHistoryChange = useCallback((historyData) => {
    setChatHistory(historyData);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Gagal mengambil sesi Supabase:", error);
      }
      setSession(data?.session ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout gagal:", error.message);
    }
  };

  const handleNewChat = () => {
    setSidebarPrompt(null);
    chatHistory.onNewChat?.();
    setChatSessionId((prev) => prev + 1);
  };

  const handleSelectPrompt = (promptText) => {
    setSidebarPrompt({ text: promptText, id: Date.now() });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-zinc-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Memuat AURA-FST...</p>
        </div>
      </div>
    );
  }

  // if (!session) {
  //   return <Auth />;
  // }

  return (
    <div className="h-dvh w-full bg-slate-900 flex flex-row overflow-hidden font-sans">
      {/* Sidemenu dengan transisi basis-0 ke basis-2/12 */}
      <aside
        className={`h-full bg-slate-900 overflow-hidden shrink-0 transition-[flex-basis,opacity,border-color] duration-300 ease-in-out ${
          isSidebarOpen
            ? "basis-64 md:basis-2/12 opacity-100 border-r border-slate-800"
            : "basis-0 opacity-0 border-r-0 border-transparent"
        }`}
      >
        <Sidemenu
          onNewChat={handleNewChat}
          onSelectPrompt={handleSelectPrompt}
          chatHistory={chatHistory}
          onLogout={handleLogout}
        />
      </aside>

      {/* Area ChatUI */}
      <div
        className={`flex-1 min-w-0 h-full transition-[flex-basis] duration-300 ease-in-out ${
          isSidebarOpen ? "basis-10/12" : "basis-full"
        }`}
      >
        <ChatUI
          key={chatSessionId}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          externalPrompt={sidebarPrompt}
          onLogout={handleLogout}
          onHistoryChange={handleHistoryChange}
        />
      </div>
    </div>
  );
}

export default App;
