# Proyek Pengembangan Perangkat Lunak: AURA-FST

**Chatbot Layanan Fakultas Sains dan Teknologi (FST)**

---

## 👥 Anggota Kelompok & Kontribusi

1. **Haesam Abdullah (1251420101)** — Inisialisasi FR-001, implementasi modul validasi input (`chatValidator.js`), dan perancangan skenario pengujian (_Testing_).
2. **A Pajar Eko Putra (1251420033)** — Implementasi komponen antarmuka React (`ChatUI.jsx` & `QuickReplyButtons.jsx`).
3. **Mabruri Musahar (1251420005)** — Pelaksanaan _Code Review_ dan _Refactoring_ (penerapan prinsip DRY & _Single Responsibility Principle_).
4. **Ihsan Ushaim (1251420007)** — Eksekusi pengujian (_Normal, Invalid, Edge Case_) dan penyusunan dokumentasi repositori.

---

## 📌 Tahap 1 — Pemilihan Fitur (FR-001)

### 1. Identifikasi Kode dan Deskripsi FR

- **Kode FR:** `FR-001`
- **Deskripsi:** Sistem harus menampilkan pesan sambutan pembuka (_welcome template_) dan tombol menu opsi cepat (_Info KRS, Syarat Sidang TA, PMB, Kontak TU_) saat halaman web dibuka.
- **Aktor Terkait:** Mahasiswa / Masyarakat Umum
- **Prioritas:** _High_ (Tinggi)

### 2. Alur Proses Berdasarkan Rancangan Sebelumnya (UTS)

1. Pengguna membuka halaman web aplikasi chatbot AURA-FST melalui peramban (_browser_).
2. Komponen `ChatUI` memuat status awal dan merender pesan sambutan bersama tombol menu opsi cepat.
3. Pengguna mengeklik salah satu tombol opsi cepat (misalnya: `"Info KRS"`).
4. Sistem memvalidasi input, mencatatnya ke _state_ percakapan, lalu mengirimkan _payload_ topik ke modul `ChatController` via API.

### 3. Input, Proses, dan Output yang Diharapkan

- **Input:** Aksi pemuatan halaman (_page load_) atau klik pengguna pada tombol opsi cepat (_Quick Reply Buttons_).
- **Proses:**
  - Menjalankan fungsi inisialisasi teks sambutan.
  - Memvalidasi dan menyaring karakter input melalui modul utilitas `chatValidator.js`.
  - Memperbarui komponen _state_ obrolan secara reaktif di React.
- **Output:** Munculnya balon chat sambutan bot dan tombol pilihan interaktif di layar; klik pada tombol akan langsung mengirimkan topik pilihan ke sistem.

### 4. Modul yang Dikembangkan

- **`ChatUI.jsx`:** Komponen utama antarmuka ruang obrolan berbasis React.
- **`QuickReplyButtons.jsx`:** Komponen modular khusus untuk merender deretan tombol opsi cepat.
- **`chatValidator.js`:** Modul utilitas terpisah yang bertanggung jawab penuh terhadap validasi dan sanitasi input.

---

## 💻 Tahap 2 — Software Construction (Implementasi Kode React)

Berikut adalah struktur kode yang menerapkan prinsip **Meaningful Naming (camelCase)**, **Modularity**, **Single Responsibility Principle (SRP)**, **DRY**, **Input Validation**, dan **Error Handling**:

### A. Modul Validasi (`src/utils/chatValidator.js`)

```javascript
export const welcomeConfig = {
  greetingMessage:
    "Halo! Selamat datang di AURA-FST. Silakan pilih topik layanan di bawah ini atau ketik pertanyaan Anda:",
  quickReplyOptions: ["Info KRS", "Syarat Sidang TA", "PMB", "Kontak TU"],
};

export function validateAndSanitizeTopic(selectedTopic) {
  if (!selectedTopic || typeof selectedTopic !== "string") {
    throw new Error("Topik layanan tidak boleh kosong.");
  }

  const trimmedTopic = selectedTopic.trim();
  if (trimmedTopic.length === 0) {
    throw new Error("Topik layanan tidak boleh hanya berisi spasi.");
  }

  // Sanitasi karakter khusus berbahaya untuk mencegah XSS / Injection (Edge Case)
  const sanitizedTopic = trimmedTopic.replace(/[<>'"/;`%]/g, "");

  if (!welcomeConfig.quickReplyOptions.includes(sanitizedTopic)) {
    throw new Error(
      "Topik opsi cepat tidak terdaftar dalam layanan resmi FST.",
    );
  }

  return sanitizedTopic;
}
```

### B. Komponen Tombol Opsi Cepat (`src/components/QuickReplyButtons.jsx`)

```jsx
import React from "react";

export default function QuickReplyButtons({
  optionsList,
  onSelectOption,
  isLoading,
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {optionsList.map((optionText) => (
        <button
          key={optionText}
          type="button"
          disabled={isLoading}
          onClick={() => onSelectOption(optionText)}
          className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
        >
          {optionText}
        </button>
      ))}
    </div>
  );
}
```

### C. Komponen Utama Chat (`src/components/ChatUI.jsx`)

```jsx
import React, { useState } from "react";
import QuickReplyButtons from "./QuickReplyButtons";
import {
  welcomeConfig,
  validateAndSanitizeTopic,
} from "../utils/chatValidator";

export default function ChatUI() {
  const [chatMessages, setChatMessages] = useState([
    {
      id: "welcome-msg",
      senderType: "bot",
      messageText: welcomeConfig.greetingMessage,
      isWelcomeTemplate: true,
    },
  ]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  async function sendTopicToController(validTopic) {
    const apiResponse = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: validTopic }),
    });

    if (!apiResponse.ok) {
      throw new Error("Gagal terhubung ke server ChatController AURA-FST.");
    }
    return await apiResponse.json();
  }

  async function handleQuickReplySelect(selectedOption) {
    setErrorMessage(null);

    try {
      const validTopic = validateAndSanitizeTopic(selectedOption);
      setIsSending(true);

      const userBubble = {
        id: `user-${Date.now()}`,
        senderType: "user",
        messageText: validTopic,
      };
      setChatMessages((prev) => [...prev, userBubble]);

      const controllerData = await sendTopicToController(validTopic);

      const botReplyBubble = {
        id: `bot-${Date.now()}`,
        senderType: "bot",
        messageText:
          controllerData.reply ||
          `Menampilkan informasi resmi terkait ${validTopic}.`,
      };
      setChatMessages((prev) => [...prev, botReplyBubble]);
    } catch (errorObj) {
      setErrorMessage(errorObj.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-blue-700 text-white px-4 py-3 font-semibold">
        AURA-FST — Layanan Chatbot FST
      </div>

      <div className="p-4 space-y-4 h-96 overflow-y-auto bg-slate-50">
        {chatMessages.map((chatItem) => (
          <div
            key={chatItem.id}
            className={`flex flex-col ${
              chatItem.senderType === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                chatItem.senderType === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-800 border border-slate-200 shadow-sm"
              }`}
            >
              <p>{chatItem.messageText}</p>
              {chatItem.isWelcomeTemplate && (
                <QuickReplyButtons
                  optionsList={welcomeConfig.quickReplyOptions}
                  onSelectOption={handleQuickReplySelect}
                  isLoading={isSending}
                />
              )}
            </div>
          </div>
        ))}

        {errorMessage && (
          <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            Peringatan: {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔍 Tahap 3 — Code Review & Refactoring

Berikut adalah 3 temuan hasil _code review_ dan perbaikannya (_Before–After_):

### 1. Duplikasi Elemen JSX Tombol Opsi Cepat (Pelanggaran Prinsip DRY)

- **Masalah:** Tombol opsi cepat awalnya ditulis secara manual satu per satu (_hardcoded_) di dalam kode JSX sehingga terjadi pengulangan atribut dan fungsi klik.
- **Perbaikan:** Memindahkan daftar opsi ke dalam _array_ data dan menggunakan perulangan `.map()` pada komponen `QuickReplyButtons.jsx`.
- **Before:**
  ```jsx
  <div className="flex gap-2">
    <button onClick={() => klik_tombol("Info KRS")}>Info KRS</button>
    <button onClick={() => klik_tombol("Syarat Sidang TA")}>
      Syarat Sidang TA
    </button>
  </div>
  ```
- **After:**
  ```jsx
  {
    optionsList.map((optionText) => (
      <button key={optionText} onClick={() => onSelectOption(optionText)}>
        {optionText}
      </button>
    ));
  }
  ```

### 2. Pencampuran Logika Validasi di Dalam Komponen UI (Pelanggaran SRP)

- **Masalah:** Komponen React menangani tampilan antarmuka sekaligus memuat logika pengecekan string dan aturan bisnis di tempat yang sama.
- **Perbaikan:** Mengekstrak seluruh fungsi validasi dan sanitasi ke modul terpisah `chatValidator.js`.
- **Before:** Kode pengecekan string ditulis langsung menumpuk di dalam fungsi klik komponen.
- **After:** Menggunakan pemanggilan fungsi modular yang bersih: `validateAndSanitizeTopic(selectedOption)`.

### 3. Tidak Ada Penanganan Galat Jaringan (_Error Handling_)

- **Masalah:** Pemanggilan fungsi `fetch` API tidak dibungkus dengan blok `try-catch`, berpotensi menyebabkan kegagalan aplikasi saat server terputus.
- **Perbaikan:** Menambahkan penanganan galat menggunakan `try-catch-finally` serta menambahkan _state_ `errorMessage` untuk menampilkan umpan balik visual ke pengguna.
- **Before:** `const res = await fetch("/api/chat");` (Tanpa proteksi galat).
- **After:** Dibungkus dalam blok `try { ... } catch (errorObj) { setErrorMessage(errorObj.message); }`.

---

## 🧪 Tahap 4 — Testing (Pengujian Sistem)

|  Kode FR   | Kasus Uji                                          | Langkah Pengujian (Steps)                                                         | Expected Result                                                                      | Actual Result                                                                                 |  Sesuai?  |
| :--------: | -------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | :-------: |
| **FR-001** | **1. Normal Case** (Input Valid)                   | 1. Buka aplikasi React.<br>2. Klik tombol `"Info KRS"`.                           | Komponen merender balon chat pengguna `"Info KRS"` dan mengirim _request_ ke server. | Pesan sambutan & 4 tombol tampil; klik `"Info KRS"` berhasil menambah balon chat tanpa error. | ✅ Sesuai |
| **FR-001** | **2. Invalid Input** (Data Kosong / Spasi)         | 1. Uji fungsi klik dengan nilai string kosong atau spasi `"   "`.                 | Fungsi validasi melempar error dan UI menampilkan kotak peringatan merah.            | Pengiriman dibatalkan dan pesan peringatan validasi tampil di antarmuka.                      | ✅ Sesuai |
| **FR-001** | **3. Edge Case** (Injeksi Skrip / Karakter Khusus) | 1. Ubah nilai tombol melalui _DevTools_ menjadi `<script>alert('hack')</script>`. | Karakter berbahaya dibersihkan oleh _sanitizer_ dan ditolak oleh sistem.             | Karakter berbahaya berhasil diblokir dan sistem menampilkan peringatan aturan layanan.        | ✅ Sesuai |
