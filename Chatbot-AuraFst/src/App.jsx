import React from 'react';
import ChatUI from './components/ChatUI';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-2 sm:p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl h-[90vh]">
        <ChatUI />
      </div>
    </div>
  );
}

export default App;

