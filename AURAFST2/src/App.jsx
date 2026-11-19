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
  };

  const handleSelectPrompt = (promptText) => {
    setSidebarPrompt({ text: promptText, id: Date.now() });
  };

  return (
    <div className="h-dvh w-full bg-slate-900 flex flex-row overflow-hidden">
      {/* Sidemenu dengan transisi basis-0 ke basis-2/12 */}
      <aside
        className={`h-full bg-slate-900 overflow-hidden shrink-0 transition-[flex-basis,opacity,border-color] duration-300 ease-in-out ${
          isSidebarOpen
            ? "basis-2/12 opacity-100 border-r border-slate-800"
            : "basis-0 opacity-0 border-r-0 border-transparent"
        }`}
      >
        <Sidemenu
          onNewChat={handleNewChat}
          onSelectPrompt={handleSelectPrompt}
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
        />
      </div>
    </div>
  );
}

export default App;