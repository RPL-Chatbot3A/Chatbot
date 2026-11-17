import React, { useState } from "react";
import ChatUI from "./components/ChatUI";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-dvh w-full bg-slate-900 flex flex-row overflow-hidden">
      {/* Sidemenu */}
      <aside
        className={`h-full bg-slate-900 text-zinc-100 overflow-hidden shrink-0 transition-[flex-basis,opacity,border-color] duration-300 ease-in-out ${
          isSidebarOpen
            ? "basis-2/12 opacity-100 border-r border-slate-700/80"
            : "basis-0 opacity-0 border-r-0 border-transparent"
        }`}
      >
        <div className="flex flex-col h-full w-full min-w-55 items-center justify-center whitespace-nowrap px-4">
          <h1 className="text-2xl font-bold text-center">[Sidemenu]</h1>
        </div>
      </aside>
      {/* ChatUI */}
      <div
        className={`flex-1 min-w-0 h-full transition-[flex-basis] duration-300 ease-in-out ${
          isSidebarOpen ? "basis-10/12" : "basis-full"
        }`}
      >
        <ChatUI
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
      </div>
    </div>
  );
}

export default App;
