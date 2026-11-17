import React, { useState, useEffect, useRef } from "react";
import { validateAndSanitizeTopic } from "../utils/chatValidator";
import { askGeminiFST } from "../services/geminiService";
import QuickReplyButtons from "./QuickReplyButtons";
import FormattedMessage from "./FormattedMessage";
import { ArrowUpFromLine, Send } from "lucide-react";

/**
 * Komponen Utama ChatUI untuk Chatbot AURA-FST (FR-001)
 * Dilengkapi dengan KaTeX Math Renderer & Markdown Parser untuk tampilan rumus yang elegan.
 */
export const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const messagesEndRef = useRef(null);

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

  return (
    <div className="flex flex-col h-dvh w-full mx-auto bg-slate-50 border border-slate-200 shadow-xl overflow-hidden font-sans">
      {/* Header */}
      <header className="hidden bg-sky-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center font-bold text-lg border border-sky-400">
            🤖
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">AURA-FST</h1>
            <p className="text-xs text-sky-200">
              Asisten Virtual Fakultas Sains &amp; Teknologi
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          Online
        </span>
      </header>

      {/* Area Chat */}
      <main className="flex-1 overflow-y-auto p-4 justify-center items-center space-y-4">
        {messages.map((msg) => {
          if (!msg.text) return null;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-sky-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}
              >
                {/* Gunakan FormattedMessage untuk bot agar rumus matematika & markdown dirender cantik */}
                {msg.sender === "bot" ? (
                  <FormattedMessage content={msg.text} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}

                <span
                  className={`block text-[10px] mt-2 text-right ${
                    msg.sender === "user" ? "text-sky-200" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic pl-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            <span>AURA sedang merespon...</span>
          </div>
        )}

        {/* Tombol Opsi Cepat (FR-001) */}
        <QuickReplyButtons
          onSelectOption={handleSendMessage}
          isDisabled={isLoading}
        />

        <div ref={messagesEndRef} />
      </main>

      {/* Banner Error UI */}
      {errorMessage && (
        <div className="mx-4 mb-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex justify-between items-center">
          <span>⚠️ {errorMessage}</span>
          <button
            onClick={() => setErrorMessage("")}
            className="text-rose-500 font-bold hover:text-rose-800 text-sm ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Input Form */}
      <footer className="p-4 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-white border border-slate-300 rounded-full px-4 py-1.5 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Tanyakan jadwal KRS, syarat sidang, rumus matematika, koding..."
            disabled={isLoading}
            className="flex-1 py-2.5 pl-2 pr-3 bg-transparent text-sm text-slate-800 focus:outline-none disabled:bg-transparent"
          />

          {inputText.trim() && (
            <button
              type="submit"
              disabled={isLoading}
              aria-label="Kirim pesan"
              className="flex items-center justify-center w-10 h-100 bg-sky-600 hover:bg-sky-700 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
            >
              {/* <Send size={20} /> */}
              <ArrowUpFromLine size={20} />
            </button>
          )}
        </form>
      </footer>
    </div>
  );
};

export default ChatUI;
