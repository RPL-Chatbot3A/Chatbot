import React from 'react';
import ChatUI from './components/ChatUI';
import ChatUIGemini from './components/ChatUIGemini';

function App() {
  return (
    <div className="h-dvh w-full bg-slate-100 flex flex-row items-center overflow-hidden">
      <div className="flex flex-col w-full basis-2/12 items-center justify-center max-w-3xl">
        <h1 className="text-2xl font-bold text-center">[Sidemenu]</h1>
      </div>
      <div className="basis-10/12 w-full">
        {/* <ChatUI /> */}
        <ChatUIGemini />
      </div>
    </div>
  );
}

export default App;

