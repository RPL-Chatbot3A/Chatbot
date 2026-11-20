import React, { useState } from "react";
import ChatUI from "./components/ChatUI";
import Sidemenu from "./components/Sidemenu";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(0);
  const [sidebarPrompt, setSidebarPrompt] = useState(null);

  const handleNewChat = () => {
    setSidebarPrompt(null);
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

  return (
    <div className="h-dvh w-full bg-slate-900 flex flex-row overflow-hidden">
      {/* Sidemenu */}
      <aside
        className={`h-full bg-slate-900 overflow-hidden shrink-0 transition-[flex-basis,opacity,border-color] duration-300 ease-in-out ${
          isSidebarOpen
            ? "lg:basis-3/12 md:basis-4/12 sm:basis-5/12 xs:basis-full opacity-100 border-r border-slate-800"
            : "basis-0 opacity-0 border-r-0 border-transparent pointer-events-none"
        }`}
      >
        <Sidemenu
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onNewChat={handleNewChat}
          onSelectPrompt={handleSelectPrompt}
        />
      </aside>

      {/* Area ChatUI */}
      <div
        className={`min-w-0 h-full overflow-hidden transition-[flex-basis,opacity] duration-300 ease-in-out ${
          isSidebarOpen
            ? "lg:basis-9/12 md:basis-8/12 sm:basis-7/12 xs:basis-0 opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto"
            : "basis-full opacity-100"
        }`}
      >
        <ChatUI
          key={chatSessionId}
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          externalPrompt={sidebarPrompt}
        />
      </div>
    </div>
  );
}

export default App;