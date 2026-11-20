import React, { useState, useEffect, useRef } from "react";
import { validateAndSanitizeTopic } from "../utils/chatValidator";
import { askGeminiFST } from "../services/geminiService";
import QuickReplyButtons from "./QuickReplyButtons";
import FormattedMessage from "./FormattedMessage";
import {
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelLeftOpen,
} from "lucide-react";

/**
 * Komponen Utama ChatUI untuk Chatbot AURA-FST (FR-001)
 * Didesain dengan UI minimalis ala Google Gemini AI.
 */
export const ChatUI = ({ isSidebarOpen, onOpenSidebar, externalPrompt }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandBtn, setShowExpandBtn] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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

  useEffect(() => {
    if (externalPrompt?.text && !isLoading) {
      handleSendMessage(externalPrompt.text);
    }
  }, [externalPrompt]);

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
      // 2. Panggil askGeminiFST dengan callback onChunk
      await askGeminiFST(sanitizedTopic, (currentAccumulatedText) => {
        setIsLoading(false);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: currentAccumulatedText }
              : msg,
          ),
        );
      });
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
    <div className="flex flex-col h-dvh w-full bg-linear-to-b from-slate-800 to-slate-900 text-slate-800 overflow-hidden font-sans">
      {/* Top Bar dengan Tombol Toggle Sidebar */}
      {!isSidebarOpen && (
        <header className="shrink-0 px-4 pt-3 pb-1 flex items-center gap-2.5 z-20">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="group relative p-2 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-full transition-colors cursor-pointer"
          >
            <PanelLeft size={19} className="block group-hover:hidden" />
            <PanelLeftOpen
              size={19}
              className="hidden group-hover:block text-slate-50"
            />

            <span className="pointer-events-none absolute top-full left-0 mt-1.5 px-2.5 py-1 rounded-lg bg-slate-950 text-zinc-100 text-[11px] font-medium whitespace-nowrap border border-slate-700/80 shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50">
              Open sidebar
            </span>
          </button>

          <div className="flex items-center gap-2 select-none">
            <div className="w-6 h-6 rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles size={13} />
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-100">
              AURA-FST
            </span>
          </div>
        </header>
      )}

      {/* Area Chat */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-3xl w-full mx-auto space-y-8">
          {messages.map((msg) => {
            if (!msg.text) return null;

            return msg.sender === "user" ? (
              /* Gelembung Pesan User */
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] bg-linear-to-b from-slate-600 to-slate-700 text-zinc-100 rounded-3xl rounded-tr-sm px-5 py-3.5 text-[15px] leading-relaxed">
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
      <footer className="shrink-0 w-full px-4 sm:px-6 pb-4 pt-2">
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
          <div className="mb-1 pl-1">
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
                placeholder="Tanya AURA"
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
  );
};

export default ChatUI;
