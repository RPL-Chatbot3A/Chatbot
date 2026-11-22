import React, { useEffect, useLayoutEffect, useState, useCallback } from "react";
import { flushSync } from "react-dom";
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

  // State Tema: Dark Mode (default) & Light Mode dengan persistensi LocalStorage
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("aura_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useLayoutEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("aura_theme", theme);
    } catch (e) {
      console.warn("Gagal menyimpan preferensi tema:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const updateTheme = () => flushSync(() => setTheme(nextTheme));

    if (document.startViewTransition) {
      document.startViewTransition(updateTheme);
    } else {
      updateTheme();
    }
  };

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
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectPrompt = (promptText) => {
    setSidebarPrompt({ text: promptText, id: Date.now() });
    if (window.innerWidth < 640) {
      setIsSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen w-full flex items-center justify-center font-sans transition-colors duration-200 ${
          theme === "dark" ? "bg-slate-900 text-zinc-100" : "bg-slate-50 text-slate-800"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Memuat AURA-FST...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <div
      className={`h-dvh w-full flex flex-row overflow-hidden font-sans transition-colors duration-200 ${
        theme === "dark" ? "bg-slate-900 text-zinc-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Sidemenu Responsif */}
      <aside
        className={`h-full overflow-hidden shrink-0 transition-[flex-basis,opacity,border-color,background-color] duration-300 ease-in-out ${
          isSidebarOpen
            ? `lg:basis-3/12 md:basis-4/12 sm:basis-5/12 xs:basis-full opacity-100 border-r ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200 shadow-sm"
              }`
            : "basis-0 opacity-0 border-r-0 border-transparent pointer-events-none"
        }`}
      >
        <Sidemenu
          theme={theme}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onNewChat={handleNewChat}
          onSelectPrompt={handleSelectPrompt}
          chatHistory={chatHistory}
          onLogout={handleLogout}
        />
      </aside>

      {/* Area ChatUI Responsif */}
      <div
        className={`min-w-0 h-full overflow-hidden transition-[flex-basis,opacity] duration-300 ease-in-out ${
          isSidebarOpen
            ? "lg:basis-9/12 md:basis-8/12 sm:basis-7/12 xs:basis-0 opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto"
            : "basis-full opacity-100"
        }`}
      >
        <ChatUI
          key={chatSessionId}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNewChat={handleNewChat}
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
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
