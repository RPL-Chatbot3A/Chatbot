
import React, { useState, useEffect, useRef } from "react";
import { validateAndSanitizeTopic } from "../utils/chatValidator";
import { askGeminiFST } from "../services/geminiService";
import { getOrCreateUserSession } from "../services/authService";

import {
  createConversation,
  getConversations,
  getMessages,
  saveUserMessage,
  saveAssistantMessage,
  updateConversationTime,
  updateConversationTitle,
  deleteConversation,
} from "../services/chatHistory";

import QuickReplyButtons from "./QuickReplyButtons";
import FormattedMessage from "./FormattedMessage";
import { Send, Sparkles, Maximize2, Minimize2, PanelLeft } from "lucide-react";

/**
 * Komponen Utama ChatUI untuk Chatbot AURA-FST (FR-001)
 * Didesain dengan antarmuka minimalis ala Google Gemini AI.
 */
export const ChatUI = ({ isSidebarOpen, onToggleSidebar, onLogout, onHistoryChange }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandBtn, setShowExpandBtn] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);
  // State untuk riwayat percakapan
const [userId, setUserId] = useState(null);
const [activeConversationId, setActiveConversationId] = useState(null);
const [conversations, setConversations] = useState([]);
const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Mengambil sesi login dan memuat riwayat percakapan
useEffect(() => {
  let cancelled = false;

  const initializeChatHistory = async () => {
    try {
      setIsHistoryLoading(true);

      const session = await getOrCreateUserSession();
      const currentUserId = session.user.id;

      if (cancelled) return;

      setUserId(currentUserId);

      const history = await getConversations(currentUserId);

      if (!cancelled) {
        setConversations(history || []);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat chat:", error);
      if (!cancelled) {
        setErrorMessage(error.message);
      }
    } finally {
      if (!cancelled) {
        setIsHistoryLoading(false);
      }
    }
  };

  initializeChatHistory();

  return () => {
    cancelled = true;
  };
}, []);

  // Inisialisasi Welcome Message saat pertama kali dibuka (FR-001)
  useEffect(() => {
    const welcomeMsg = {
      id: "welcome-aura-fst",
      sender: "bot",
      text: "Halo! Selamat datang di **AURA-FST** 👋\nSaya siap membantu memberikan informasi resmi akademik FST seputar KRS, Sidang TA, PMB, maupun materi sains & perkuliahan. Silakan klik menu cepat di bawah atau ketik pertanyaan Anda.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([welcomeMsg]);
  }, []);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Mengatur tinggi otomatis textarea & visibilitas tombol Maximize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    if (!inputText) {
      el.style.height = "auto";
      setIsExpanded(false);
      setShowExpandBtn(false);
      setIsMultiline(false);
      return;
    }

    el.style.height = "auto";
    const scrollHeight = el.scrollHeight;

    // Jika lebih dari 1 baris (> 48px), ubah bentuk rounded dari kapsul ke kotak membulat
    setIsMultiline(scrollHeight > 48);

    // Munculkan tombol Maximize jika teks mencapai ~3 baris (> 90px)
    if (scrollHeight > 90) {
      setShowExpandBtn(true);
    } else if (!isExpanded) {
      setShowExpandBtn(false);
    }

    if (isExpanded) {
      el.style.height = "320px";
    } else {
      el.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [inputText, isExpanded]);

  /**
   * Menangani pengiriman pesan baik dari tombol cepat maupun form input
   * @param {string} rawTopic
   */
  const handleSendMessage = async (rawTopic) => {
    setErrorMessage("");

    // 1. Validasi dan Sanitasi Input (SRP)
    const {
      isValid,
      sanitizedTopic,
      errorMessage: validationError,
    } = validateAndSanitizeTopic(rawTopic);

    if (!isValid) {
      setErrorMessage(validationError);
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    const botMessageId = `bot-${Date.now() + 1}`;
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage = {
      id: userMessageId,
      sender: "user",
      text: sanitizedTopic,
      timestamp: currentTime,
    };

    const placeholderBotMessage = {
      id: botMessageId,
      sender: "bot",
      text: "",
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, userMessage, placeholderBotMessage]);
    setInputText("");
    setIsLoading(true);

    try {
// Membuat percakapan baru jika belum ada
if (!userId) {
  throw new Error("Sesi pengguna belum siap. Silakan coba lagi.");
}

let conversationId = activeConversationId;

if (!conversationId) {
  const newConversation = await createConversation(
    userId,
    sanitizedTopic.slice(0, 50)
  );

  conversationId = newConversation.id;

  setActiveConversationId(conversationId);

  setConversations((prev) => [
    newConversation,
    ...prev,
  ]);
}

// Menyimpan pesan pengguna
await saveUserMessage(
  conversationId,
  userId,
  sanitizedTopic
);

await updateConversationTime(conversationId);
      // 2. Panggil Gemini dan tampung jawaban akhirnya
const assistantResponse = await askGeminiFST(
  sanitizedTopic,
  (currentAccumulatedText) => {
        setIsLoading(false);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: currentAccumulatedText }
              : msg,
          ),
        );
      })
// Menyimpan jawaban AI ke Supabase
await saveAssistantMessage(
  conversationId,
  userId,
  assistantResponse
);

await updateConversationTime(conversationId);;
    } catch (err) {
      console.error("Terjadi kesalahan pada ChatUI:", err);
      setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId));
      setErrorMessage(
        err.message ||
          "Gagal memproses pesan. Periksa koneksi internet atau kunci API Anda.",
      );
    } finally {
      setIsLoading(false);
    }
  };


  // Membuka percakapan lama dari riwayat
  const handleOpenConversation = async (conversationId) => {
    try {
      setIsHistoryLoading(true);
      setErrorMessage("");

      const historyMessages = await getMessages(conversationId);

      const formattedMessages = historyMessages.map((msg) => ({
        id: msg.id,
        sender: msg.role === "user" ? "user" : "bot",
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));


 

      setMessages(formattedMessages);
      setActiveConversationId(conversationId);
    } catch (error) {
      console.error("Gagal membuka percakapan:", error);
      setErrorMessage(error.message || "Gagal membuka riwayat percakapan.");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Membuat percakapan baru
const handleNewChat = () => {
  setActiveConversationId(null);
  setMessages([
    {
      id: "welcome-" + Date.now(),
      sender: "bot",
      text: "Halo! Selamat datang di **AURA-FST** 👋\nSaya siap membantu memberikan informasi resmi akademik FST seputar KRS, Sidang TA, PMB, maupun materi sains & perkuliahan. Silakan ketik pertanyaan Anda.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  setInputText("");
  setErrorMessage("");
};


  // Menghapus percakapan dari riwayat
  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId);

      setConversations((prev) =>
        prev.filter((conversation) => conversation.id !== conversationId)
      );

      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Gagal menghapus percakapan:", error);
      setErrorMessage(error.message || "Gagal menghapus percakapan.");
    }
  };


  // Mengirim data riwayat ke App.jsx
  useEffect(() => {
    onHistoryChange?.({
      conversations,
      isLoading: isHistoryLoading,
      onOpen: handleOpenConversation,
      onDelete: handleDeleteConversation,
       onNewChat: handleNewChat,
    });
  }, [conversations, isHistoryLoading]);


  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  // Kirim dengan Enter, baris baru dengan Shift + Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isLoading) {
        handleSendMessage(inputText);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col h-dvh w-full bg-linear-to-b from-slate-800 to-slate-900 text-slate-800 overflow-hidden font-sans">
      {/* Top Bar dengan Tombol Toggle Sidebar */}
      <header className="px-4 py-3 flex items-center gap-3">
  <button
    type="button"
    onClick={onToggleSidebar}
    title={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
    aria-label={isSidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
    className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-full transition-colors cursor-pointer"
  >
    <PanelLeft size={20} />
  </button>

  <span className="font-semibold text-base tracking-tight text-zinc-100">
    AURA-FST
  </span>

  <div className="flex-1" />
</header>

      {/* Area Chat */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl w-full mx-auto space-y-8">
          {messages.map((msg) => {
            if (!msg.text) return null;

            return msg.sender === "user" ? (
              /* Gelembung Pesan User */
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] bg-linear-to-t from-slate-600 to-slate-700 text-zinc-100 rounded-3xl rounded-tr-sm px-5 py-3.5 text-[15px] leading-relaxed">
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ) : (
              /* Balasan Bot */
              <div key={msg.id} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1 min-w-0 text-[15px] leading-relaxed text-zinc-200 pt-0.5">
                  <FormattedMessage content={msg.text} />
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Sparkles size={16} />
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Area Input Kapsul */}
      <footer className="w-full px-4 sm:px-6 pb-4 pt-2">
        <div className="max-w-3xl w-full mx-auto">
          {/* Banner Error UI */}
          {errorMessage && (
            <div className="mb-3 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex justify-between items-center">
              <span>⚠️ {errorMessage}</span>
              <button
                onClick={() => setErrorMessage("")}
                className="text-rose-500 font-bold hover:text-rose-800 text-sm ml-2"
              >
                &times;
              </button>
            </div>
          )}

          {/* Tombol Opsi Cepat (FR-001) */}
          <div className="mb-1 pl-2">
            <QuickReplyButtons
              onSelectOption={handleSendMessage}
              isDisabled={isLoading}
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className={`relative flex flex-col bg-linear-to-b bg-slate-600 to-slate-700 focus-within:bg-slate-700 focus-within:shadow-md focus-within:ring-1 focus-within:ring-slate-600 px-5 py-2.5 transition-all duration-200 ${
              isMultiline || isExpanded ? "rounded-2xl" : "rounded-full"
            }`}
          >
            {/* Baris Utama: Textarea & Tombol Send */}
            <div className="flex items-center gap-3">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Tanyakan jadwal KRS, syarat sidang, rumus matematika, koding..."
                disabled={isLoading}
                className="flex-1 bg-transparent py-1.5 text-sm text-zinc-100 placeholder:text-slate-300 focus:outline-none resize-none overflow-y-auto leading-relaxed break-all disabled:opacity-60 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full"
              />

              <div className="flex flex-col self-stretch items-center justify-between">
                {(showExpandBtn || isExpanded) && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    title={
                      isExpanded
                        ? "Kecilkan kotak input"
                        : "Perbesar kotak input"
                    }
                    className="flex w-10 h-10 items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <Minimize2 size={16} />
                    ) : (
                      <Maximize2 size={16} />
                    )}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  aria-label="Kirim pesan"
                  className={`mt-auto flex items-center justify-center w-10 h-10 rounded-full transition-all shrink-0 pr-0.5 ${
                    inputText.trim() && !isLoading
                      ? "bg-linear-to-br from-sky-600 to-cyan-500 hover:bg-linear-to-bl hover:from-sky-600 hover:to-cyan-500 hover:scale-105 text-white opacity-100 scale-100 shadow-sm cursor-pointer"
                      : "bg-transparent text-slate-400 opacity-0 scale-75 pointer-events-none"
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>

          <p className="text-xs text-center text-slate-400/90 mt-2.5">
            AURA-FST dapat membuat kesalahan. Periksa kembali informasi akademik
            penting.
          </p>
        </div>
      </footer>
          </div>
    </>
  );
};

export default ChatUI;
