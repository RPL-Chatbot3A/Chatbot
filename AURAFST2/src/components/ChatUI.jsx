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
  Sun,
  Moon,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";

/**
 * 4 Kartu Opsi Cepat untuk Tampilan Awal Hero (Sesuai Desain Referensi)
 */
const HERO_ACTION_CARDS = [
  {
    id: "krs",
    title: "Informasi KRS & SKS",
    subtitle: "Beban SKS & alur pengisian portal",
    icon: <GraduationCap size={20} className="text-sky-500" />,
    query: "Bagaimana jadwal dan alur pengisian KRS di FST?",
  },
  {
    id: "sidang",
    title: "Syarat Sidang TA",
    subtitle: "Pendaftaran skripsi & munaqasyah",
    icon: <FileText size={20} className="text-emerald-500" />,
    query: "Apa saja syarat dan ketentuan mendaftar Sidang Tugas Akhir (TA)?",
  },
  {
    id: "pmb",
    title: "Info PMB & Prodi",
    subtitle: "Jalur masuk & kebijakan transfer",
    icon: <School size={20} className="text-amber-500" />,
    query: "Apa saja program studi dan jalur pendaftaran PMB di FST?",
  },
  {
    id: "sains",
    title: "Sains & Koding",
    subtitle: "Tanya rumus matematika & materi kuliah",
    icon: <Code2 size={20} className="text-purple-500" />,
    query: "Bantu saya memahami materi kuliah sains dan teknologi di FST",
  },
];

/**
 * Komponen Utama ChatUI untuk Chatbot AURA-FST (FR-001)
 * Dilengkapi dengan Maskot Lingkaran Presisi, Pemisahan Try-Catch Gemini & Supabase,
 * Toggle Light/Dark Mode, Copy Message, Tombol Send interaktif, & Floating Scroll button.
 */
export const ChatUI = ({
  theme = "dark",
  onToggleTheme,
  isSidebarOpen,
  onOpenSidebar,
  onToggleSidebar,
  externalPrompt,
  onLogout,
  onHistoryChange,
}) => {
  const isDark = theme === "dark";

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandBtn, setShowExpandBtn] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);

  // State Feedback Salin Pesan (Copy)
  const [copiedId, setCopiedId] = useState(null);

  // State Tombol Scroll ke Bawah
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // State untuk riwayat percakapan Supabase
  const [userId, setUserId] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const mainContainerRef = useRef(null);

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
        console.warn("Sesi belum aktif / mode guest (tidak ada riwayat cloud):", error?.message);
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

  // Auto-scroll halus ke pesan terbaru setiap kali pesan dikirim/diterima
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isLoading]);

  // Listener Scroll Container untuk menampilkan tombol "Scroll ke Bawah"
  const handleScroll = () => {
    const el = mainContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceToBottom > 140);
  };

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
    const newHeight = el.scrollHeight;

    if (newHeight > 56) {
      setIsMultiline(true);
      setShowExpandBtn(true);
    } else {
      setIsMultiline(false);
      setShowExpandBtn(false);
      setIsExpanded(false);
    }

    if (isExpanded) {
      el.style.height = "160px";
    } else {
      el.style.height = `${Math.min(newHeight, 120)}px`;
    }
  }, [inputText, isExpanded]);

  // Eksekusi prompt eksternal dari tombol quick card atau sidebar menu
  useEffect(() => {
    if (externalPrompt?.text) {
      handleSendMessage(externalPrompt.text);
    }
  }, [externalPrompt]);

  // Fungsi Salin Teks Jawaban AI
  const handleCopyMessage = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2000);
    } catch (err) {
      console.warn("Gagal menyalin teks:", err);
    }
  };

  // Membuka percakapan lama dari Supabase
  const handleOpenConversation = async (conversationId) => {
    if (conversationId === activeConversationId) return;

    try {
      setIsLoading(true);
      const historyMessages = await getMessages(conversationId);

      const formatted = historyMessages.map((msg) => ({
        id: msg.id,
        sender: msg.role === "user" ? "user" : "bot",
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(
        formatted.length > 0
          ? formatted
          : [
              {
                id: "empty-history",
                sender: "bot",
                text: "Percakapan ini belum memiliki riwayat pesan.",
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]
      );
      setActiveConversationId(conversationId);
      setErrorMessage("");
    } catch (error) {
      console.error("Gagal memuat pesan percakapan:", error);
      setErrorMessage("Gagal memuat percakapan dari riwayat.");
    } finally {
      setIsLoading(false);
    }
  };

  // Menghapus percakapan dari Supabase
  const handleDeleteConversation = async (conversationId) => {
    try {
      const success = await deleteConversation(conversationId);
      if (success) {
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (activeConversationId === conversationId) {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error("Gagal menghapus percakapan:", error);
    }
  };

  // Memulai chat baru
  const handleNewChat = () => {
    setActiveConversationId(null);
    setInputText("");
    setErrorMessage("");
    setMessages([
      {
        id: "welcome-aura-fst-new",
        sender: "bot",
        text: "Halo! Selamat datang di **AURA-FST** 👋\nSilakan pilih topik bantuan cepat di bawah atau tanyakan seputar KRS, TA, PMB, maupun rumus sains.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  // Mengirim data riwayat ke parent (App.jsx) untuk ditampilkan di Sidemenu
  useEffect(() => {
    if (onHistoryChange) {
      onHistoryChange({
        conversations,
        isLoading: isHistoryLoading,
        onOpen: handleOpenConversation,
        onDelete: handleDeleteConversation,
        onNewChat: handleNewChat,
      });
    }
  }, [conversations, isHistoryLoading, activeConversationId]);

  // Handler pengiriman pesan utama dengan pemisahan try-catch Gemini & Supabase
  const handleSendMessage = async (textToSend) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || isLoading) return;

    setErrorMessage("");

    const validation = validateAndSanitizeTopic(rawText);
    if (!validation.isValid) {
      setErrorMessage(validation.message);
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: validation.sanitizedText,
      timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    // ========================================================
    // 1. SIMPAN PESAN USER KE SUPABASE (ISOLATED TRY-CATCH)
    // ========================================================
    let currentConvId = activeConversationId;
    if (userId) {
      try {
        if (!currentConvId) {
          const title =
            validation.sanitizedText.length > 30
              ? `${validation.sanitizedText.substring(0, 30)}...`
              : validation.sanitizedText;

          const newConv = await createConversation(userId, title);
          if (newConv) {
            currentConvId = newConv.id;
            setActiveConversationId(newConv.id);
            setConversations((prev) => [newConv, ...prev]);
          }
        }

        if (currentConvId) {
          await saveUserMessage(currentConvId, userId, validation.sanitizedText);
          await updateConversationTime(currentConvId);
        }
      } catch (dbErr) {
        console.error("Catatan: Penyimpanan pesan user ke Supabase gagal (tetap lanjut ke Gemini):", dbErr);
      }
    }

    // ========================================================
    // 2. PEMANGGILAN API GEMINI (ISOLATED TRY-CATCH)
    // ========================================================
    let aiResponseText = "";
    try {
      const response = await askGeminiFST(validation.sanitizedText);
      aiResponseText =
        typeof response === "object" && response !== null
          ? response.text || response.response
          : response;

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (geminiError) {
      console.error("Detail error asli saat memanggil Gemini API:", geminiError);
      const fallbackMsg = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Maaf, terjadi kendala saat memproses jawaban. Silakan coba sesaat lagi.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setIsLoading(false);
      return; // Hentikan alur jika pemanggilan AI gagal
    } finally {
      setIsLoading(false);
    }

    // ========================================================
    // 3. SIMPAN JAWABAN BOT KE SUPABASE (ISOLATED TRY-CATCH)
    // Jawaban AI yang SUDAH didapat TIDAK akan hilang jika ini gagal!
    // ========================================================
    if (userId && currentConvId && aiResponseText) {
      try {
        await saveAssistantMessage(currentConvId, userId, aiResponseText);
      } catch (dbAssistantErr) {
        console.error("Catatan: Gagal menyimpan jawaban AI ke Supabase (jawaban tetap tampil di UI):", dbAssistantErr);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isInitialWelcome =
    messages.length === 1 && messages[0].sender === "bot";

  return (
    <div
      className={`relative h-full flex flex-col justify-between overflow-hidden select-text transition-colors duration-200 ${
        isDark ? "bg-slate-900 text-zinc-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Header Halaman Chat */}
      <header
        className={`shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b transition-colors duration-200 ${
          isDark
            ? "bg-slate-900/90 border-slate-800"
            : "bg-white/90 border-slate-200 shadow-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Tombol Buka Sidebar: Hanya Muncul Ketika Sidebar Sedang Tertutup */}
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={onOpenSidebar || onToggleSidebar}
              aria-label="Open sidebar"
              className={`group relative p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <PanelLeft size={18} className="block group-hover:hidden" />
              <PanelLeftOpen
                size={18}
                className={`hidden group-hover:block ${
                  isDark ? "text-slate-50" : "text-slate-900"
                }`}
              />

              <span
                className={`pointer-events-none absolute top-full left-0 mt-2 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 z-50 border ${
                  isDark
                    ? "bg-slate-950 text-zinc-100 border-slate-700/80"
                    : "bg-white text-slate-900 border-slate-200 shadow-slate-200"
                }`}
              >
                Open sidebar
              </span>
            </button>
          )}

          {/* Maskot Avatar Mini di Header */}
          <div className="flex items-center gap-2 select-none">
            <MascotCharacter size="xs" theme={theme} isSpeaking={isLoading} />
            <div className="flex items-center gap-1.5">
              <span
                className={`font-semibold text-sm sm:text-base tracking-tight ${
                  isDark ? "text-zinc-100" : "text-slate-900"
                }`}
              >
                AURA-FST
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isLoading ? "Berbicara..." : "Online"}
              </span>
            </div>
          </div>
        </div>

        {/* Pojok Kanan Header: Tombol Switch Tema & Status */}
        <div className="flex items-center gap-2.5">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
              title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
              className={`p-2 rounded-full transition-all cursor-pointer border ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border-slate-700/80 shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300 shadow-xs"
              }`}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}

          <span
            className={`text-xs hidden sm:inline ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Academic Chatbot FST
          </span>
        </div>
      </header>

      {/* Area Konten Utama: Padding atas lega agar maskot tidak terpotong, padding bawah pb-32/36 agar kartu tidak tertutup input */}
      <main
        ref={mainContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-32 sm:pb-36 flex flex-col justify-between"
      >
        {isInitialWelcome ? (
          /* TAMPILAN HERO: KARAKTER MURNI MELAYANG DI TENGAH DENGAN SPACING LEGA */
          <div className="my-auto flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full pt-2 sm:pt-4 pb-6">
            {/* Karakter Maskot Lingkaran Presisi Tanpa Kotak Background */}
            <div className="mb-3 sm:mb-4">
              <MascotCharacter size="hero" theme={theme} />
            </div>

            {/* Sapaan Karakter */}
            <h1
              className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Halo! Aku AURA-FST
            </h1>
            <p
              className={`text-xs sm:text-sm max-w-md leading-relaxed mb-6 sm:mb-8 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Siap nemenin kamu ngobrol, eksplorasi materi sains &amp; teknologi,
              serta bantu kebutuhan informasi akademik FST dengan cepat.
            </p>

            {/* 4 Kartu Opsi Cepat / Quick Cards (Sesuai Desain Referensi) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 w-full max-w-lg text-left">
              {HERO_ACTION_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSendMessage(card.query)}
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 group cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.02] ${
                    isDark
                      ? "bg-slate-800/90 hover:bg-slate-750 border-slate-700/80 hover:border-sky-500/50"
                      : "bg-white hover:bg-slate-50 border-slate-200/90 hover:border-sky-400 shadow-slate-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 transition-colors ${
                        isDark
                          ? "bg-slate-700/60 group-hover:bg-slate-700"
                          : "bg-slate-100 group-hover:bg-sky-50"
                      }`}
                    >
                      {card.icon}
                    </div>
                    <div className="min-w-0">
                      <h3
                        className={`text-xs sm:text-sm font-semibold transition-colors ${
                          isDark
                            ? "text-zinc-100 group-hover:text-sky-300"
                            : "text-slate-900 group-hover:text-sky-600"
                        }`}
                      >
                        {card.title}
                      </h3>
                      <p
                        className={`text-[11px] mt-0.5 truncate ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
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
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-3xl rounded-tr-sm px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                      isDark
                        ? "bg-linear-to-b from-slate-600 to-slate-700 text-zinc-100"
                        : "bg-linear-to-b from-sky-600 to-blue-600 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ) : (
                /* Balasan Karakter Maskot Bot */
                <div key={msg.id} className="flex items-start gap-3 sm:gap-4">
                  {/* Maskot Avatar dengan Lingkaran Presisi & Animasi Ekspresi Mulut */}
                  <MascotCharacter
                    size="md"
                    theme={theme}
                    isSpeaking={isCurrentlySpeaking}
                    showWave={isCurrentlySpeaking}
                  />

                  {/* Isi Pesan & Tombol Salin */}
                  <div className="flex-1 min-w-0 text-[15px] leading-relaxed pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-sky-500">
                        AURA-FST
                      </span>
                      {isCurrentlySpeaking && (
                        <span className="text-[11px] text-sky-500 font-medium animate-pulse">
                          • sedang berbicara...
                        </span>
                      )}
                      <span
                        className={`text-[10px] ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`${
                        isDark ? "text-zinc-200" : "text-slate-800"
                      }`}
                    >
                      <FormattedMessage content={msg.text} />
                    </div>

                    {/* Tombol Salin Jawaban AI */}
                    <div className="mt-2 flex items-center">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        title="Salin jawaban"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                          copiedId === msg.id
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : isDark
                            ? "bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700/60"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 border-slate-200"
                        }`}
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={12} className="text-emerald-500" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Indikator Menjawab / Memproses Pesan */}
            {isLoading && (
              <div className="flex items-start gap-3 sm:gap-4">
                <MascotCharacter
                  size="md"
                  theme={theme}
                  isSpeaking={true}
                  showWave={true}
                />
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center gap-2 text-sky-500 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                    <span>AURA-FST sedang membalas &amp; berbicara...</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Tombol Floating: Scroll ke Bawah jika user sedang scroll ke atas */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          aria-label="Scroll ke pesan terbaru"
          className={`fixed bottom-28 sm:bottom-32 right-6 sm:right-10 z-30 px-3 py-2 rounded-full shadow-lg border transition-all duration-200 flex items-center gap-1.5 text-xs font-medium cursor-pointer hover:scale-105 active:scale-95 ${
            isDark
              ? "bg-slate-800/95 text-sky-400 border-slate-700 hover:bg-slate-700 shadow-slate-950/60"
              : "bg-white/95 text-sky-600 border-slate-200 hover:bg-slate-50 shadow-slate-300/60"
          }`}
        >
          <ChevronDown size={15} />
          <span className="hidden sm:inline">Pesan terbaru</span>
        </button>
      )}

      {/* Area Input Kapsul (Footer) */}
      <footer
        className={`w-full px-4 sm:px-6 pb-4 pt-2 shrink-0 transition-colors duration-200 ${
          isDark ? "bg-slate-900/80" : "bg-slate-50/80"
        } backdrop-blur-md`}
      >
        <div className="max-w-3xl w-full mx-auto">
          {/* Banner Error UI */}
          {errorMessage && (
            <div className="mb-3 px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex justify-between items-center shadow-xs">
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
                theme={theme}
                onSelectOption={handleSendMessage}
                isDisabled={isLoading}
              />
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={`relative flex flex-col border transition-all duration-200 px-5 py-2.5 shadow-sm ${
              isDark
                ? "bg-linear-to-b from-slate-750 to-slate-800 focus-within:bg-slate-700/90 border-slate-700 focus-within:border-sky-500/70"
                : "bg-white focus-within:bg-white border-slate-300 focus-within:border-sky-500 shadow-slate-200/50"
            } ${isMultiline || isExpanded ? "rounded-2xl" : "rounded-full"}`}
          >
            {/* Baris Utama: Textarea, Tombol Expand, & Tombol Send */}
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
                className={`flex-1 bg-transparent py-1.5 text-sm focus:outline-none resize-none overflow-y-auto leading-relaxed break-all disabled:opacity-60 ${
                  isDark
                    ? "text-zinc-100 placeholder:text-slate-400"
                    : "text-slate-900 placeholder:text-slate-400"
                }`}
              />

              <div className="flex items-center gap-1.5 self-center shrink-0">
                {(showExpandBtn || isExpanded) && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    title={
                      isExpanded
                        ? "Kecilkan kotak input"
                        : "Perbesar kotak input"
                    }
                    className={`flex w-8 h-8 items-center justify-center rounded-full transition-colors cursor-pointer ${
                      isDark
                        ? "text-slate-300 hover:text-white hover:bg-slate-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {isExpanded ? (
                      <Minimize2 size={15} />
                    ) : (
                      <Maximize2 size={15} />
                    )}
                  </button>
                )}

                {/* Tombol Kirim Pesan (Ikon Send) Selalu Terlihat di Sisi Kanan */}
                <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  aria-label="Kirim pesan"
                  title="Kirim pesan"
                  className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all shrink-0 cursor-pointer ${
                    inputText.trim() && !isLoading
                      ? "bg-linear-to-br from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white shadow-md shadow-sky-500/25 scale-100 opacity-100 hover:scale-105 active:scale-95"
                      : isDark
                      ? "bg-slate-700/60 text-slate-500 opacity-60 cursor-not-allowed"
                      : "bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </form>

          <p
            className={`text-xs text-center mt-2.5 transition-colors ${
              isDark ? "text-slate-400/90" : "text-slate-500"
            }`}
          >
            AURA-FST dapat membuat kesalahan. Periksa kembali informasi akademik
            penting.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChatUI;
