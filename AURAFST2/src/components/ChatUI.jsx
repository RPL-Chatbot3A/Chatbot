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
  deleteConversation,
} from "../services/chatHistory";

import QuickReplyButtons from "./QuickReplyButtons";
import FormattedMessage from "./FormattedMessage";
import MascotCharacter from "./MascotCharacter";
import {
  Send,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelLeftOpen,
  GraduationCap,
  FileText,
  School,
  Code2,
} from "lucide-react";

/**
 * 4 Kartu Opsi Cepat untuk Tampilan Awal Hero (Sesuai Desain Referensi)
 */
const HERO_ACTION_CARDS = [
  {
    id: "krs",
    title: "Informasi KRS & SKS",
    subtitle: "Beban SKS & alur pengisian portal",
    icon: <GraduationCap size={20} className="text-sky-400" />,
    query: "Bagaimana jadwal dan alur pengisian KRS di FST?",
  },
  {
    id: "sidang",
    title: "Syarat Sidang TA",
    subtitle: "Pendaftaran skripsi & munaqasyah",
    icon: <FileText size={20} className="text-emerald-400" />,
    query: "Apa saja syarat dan ketentuan mendaftar Sidang Tugas Akhir (TA)?",
  },
  {
    id: "pmb",
    title: "Info PMB & Prodi",
    subtitle: "Jalur masuk & kebijakan transfer",
    icon: <School size={20} className="text-amber-400" />,
    query: "Apa saja program studi dan jalur pendaftaran PMB di FST?",
  },
  {
    id: "sains",
    title: "Sains & Koding",
    subtitle: "Tanya rumus matematika & materi kuliah",
    icon: <Code2 size={20} className="text-purple-400" />,
    query: "Bantu saya memahami materi kuliah sains dan teknologi di FST",
  },
];

/**
 * Komponen Utama ChatUI untuk Chatbot AURA-FST (FR-001)
 * Dilengkapi dengan Maskot Animasi Karakter tanpa latar belakang, ekspresi interaktif, dan integrasi Supabase.
 */
export const ChatUI = ({
  isSidebarOpen,
  onOpenSidebar,
  onToggleSidebar,
  externalPrompt,
  onLogout,
  onHistoryChange,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandBtn, setShowExpandBtn] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);

  // State untuk riwayat percakapan Supabase
  const [userId, setUserId] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Mengambil sesi login dan memuat riwayat percakapan dari Supabase
  useEffect(() => {
    let cancelled = false;

    const initializeChatHistory = async () => {
      try {
        setIsHistoryLoading(true);

        const session = await getOrCreateUserSession();
        const currentUserId = session?.user?.id;

        if (cancelled) return;

        if (currentUserId) {
          setUserId(currentUserId);
          const history = await getConversations(currentUserId);
          if (!cancelled) {
            setConversations(history || []);
          }
        }
      } catch (error) {
        console.warn("Sesi belum aktif / mode guest:", error?.message);
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

    setIsMultiline(scrollHeight > 48);

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

  // Menangani input prompt yang dikirim dari sidebar
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
      let currentUserId = userId;
      if (!currentUserId) {
        try {
          const session = await getOrCreateUserSession();
          currentUserId = session?.user?.id;
          if (currentUserId) setUserId(currentUserId);
        } catch {
          // Guest mode
        }
      }

      let conversationId = activeConversationId;
      if (currentUserId) {
        if (!conversationId) {
          try {
            const newConversation = await createConversation(
              currentUserId,
              sanitizedTopic.slice(0, 50)
            );
            conversationId = newConversation.id;
            setActiveConversationId(conversationId);
            setConversations((prev) => [newConversation, ...prev]);
          } catch (e) {
            console.warn("Supabase conversation skip:", e);
          }
        }

        if (conversationId) {
          try {
            await saveUserMessage(conversationId, currentUserId, sanitizedTopic);
            await updateConversationTime(conversationId);
          } catch (e) {
            console.warn("Supabase save user message skip:", e);
          }
        }
      }

      // Panggil Gemini dan streaming respons
      const assistantResponse = await askGeminiFST(
        sanitizedTopic,
        (currentAccumulatedText) => {
          setIsLoading(false);
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, text: currentAccumulatedText }
                : msg
            )
          );
        }
      );

      if (currentUserId && conversationId) {
        try {
          await saveAssistantMessage(
            conversationId,
            currentUserId,
            assistantResponse
          );
          await updateConversationTime(conversationId);
        } catch (e) {
          console.warn("Supabase save assistant message skip:", e);
        }
      }
    } catch (err) {
      console.error("Terjadi kesalahan pada ChatUI:", err);
      setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId));
      setErrorMessage(
        err.message ||
          "Gagal memproses pesan. Periksa koneksi internet atau kunci API Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId);

      setConversations((prev) =>
        prev.filter((conversation) => conversation.id !== conversationId)
      );

      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        handleNewChat();
      }
    } catch (error) {
      console.error("Gagal menghapus percakapan:", error);
      setErrorMessage(error.message || "Gagal menghapus percakapan.");
    }
  };

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isLoading) {
        handleSendMessage(inputText);
      }
    }
  };

  const handleOpenClick = () => {
    if (onOpenSidebar) {
      onOpenSidebar();
    } else if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  // Menentukan apakah saat ini sedang dalam mode awal/welcome (belum ada chat dari user)
  const isInitialWelcome =
    messages.length === 0 ||
    (messages.length === 1 &&
      messages[0].sender === "bot" &&
      messages[0].id?.startsWith("welcome"));

  return (
    <div className="flex flex-col h-dvh w-full bg-linear-to-b from-slate-800 to-slate-900 text-slate-800 overflow-hidden font-sans">
      {/* Top Bar dengan Tombol Buka Sidebar & Identitas Karakter */}
      {!isSidebarOpen && (
        <header className="shrink-0 px-4 pt-3 pb-1 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenClick}
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

            {/* Maskot Avatar Mini di Header */}
            <div className="flex items-center gap-2 select-none">
              <MascotCharacter size="xs" isSpeaking={isLoading} />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-zinc-100">
                  AURA-FST
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isLoading ? "Berbicara..." : "Online"}
                </span>
              </div>
            </div>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Academic Chatbot FST
          </span>
        </header>
      )}

      {/* Area Konten Utama */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-between">
        {isInitialWelcome ? (
          /* TAMPILAN HERO: KARAKTER MURNI MELAYANG DI TENGAH (Tanpa Kotak Latar) */
          <div className="my-auto flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full py-2">
            {/* Karakter Maskot Melayang Murni Tanpa Frame Kotak */}
            <div className="mb-4">
              <MascotCharacter size="hero" />
            </div>

            {/* Sapaan Karakter */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Halo! Aku AURA-FST
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed mb-6">
              Siap nemenin kamu ngobrol, eksplorasi materi sains &amp; teknologi,
              serta bantu kebutuhan informasi akademik FST dengan cepat.
            </p>

            {/* 4 Kartu Opsi Cepat / Quick Cards (Sesuai Mockup) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
              {HERO_ACTION_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSendMessage(card.query)}
                  className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-sky-500/50 text-left transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-700/60 group-hover:bg-slate-650 shrink-0">
                      {card.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-sky-300 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* TAMPILAN PERCAKAPAN: CHAT MODE DENGAN KARAKTER BERBALAS & EKSPRESI MULUT */
          <div className="max-w-3xl w-full mx-auto space-y-7">
            {messages.map((msg, index) => {
              if (!msg.text) return null;

              const isLatestBotMessage =
                msg.sender === "bot" && index === messages.length - 1;
              const isCurrentlySpeaking = isLatestBotMessage && isLoading;

              return msg.sender === "user" ? (
                /* Gelembung Pesan User */
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] bg-linear-to-b from-slate-600 to-slate-700 text-zinc-100 rounded-3xl rounded-tr-sm px-5 py-3.5 text-[15px] leading-relaxed shadow-sm">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ) : (
                /* Balasan Karakter Maskot Bot */
                <div key={msg.id} className="flex items-start gap-3 sm:gap-4">
                  {/* Maskot Avatar dengan Animasi Ekspresi Mulut saat Berbicara */}
                  <MascotCharacter
                    size="md"
                    isSpeaking={isCurrentlySpeaking}
                    showWave={isCurrentlySpeaking}
                  />

                  {/* Isi Pesan */}
                  <div className="flex-1 min-w-0 text-[15px] leading-relaxed text-zinc-200 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-sky-400">
                        AURA-FST
                      </span>
                      {isCurrentlySpeaking && (
                        <span className="text-[11px] text-sky-400 font-medium animate-pulse">
                          • sedang berbicara...
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {msg.timestamp}
                      </span>
                    </div>
                    <FormattedMessage content={msg.text} />
                  </div>
                </div>
              );
            })}

            {/* Indikator Menjawab / Memproses Pesan */}
            {isLoading && (
              <div className="flex items-start gap-3 sm:gap-4">
                <MascotCharacter size="md" isSpeaking={true} showWave={true} />
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    <span>AURA-FST sedang membalas &amp; berbicara...</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
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
                className="text-rose-500 font-bold hover:text-rose-800 text-sm ml-2 cursor-pointer"
              >
                &times;
              </button>
            </div>
          )}

          {/* Tombol Opsi Cepat (Hanya muncul jika sudah dalam mode chat) */}
          {!isInitialWelcome && (
            <div className="mb-1 pl-1">
              <QuickReplyButtons
                onSelectOption={handleSendMessage}
                isDisabled={isLoading}
              />
            </div>
          )}

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
                placeholder="Tanya AURA..."
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
