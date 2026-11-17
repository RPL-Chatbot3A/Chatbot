# LAPORAN REKAYASA PERANGKAT LUNAK: CHATBOT AURA-FST
**Fitur:** FR-001 (Welcome Template, Quick Reply Buttons & Gemini Knowledge Base Integration)  
**Tech Stack:** React (Vite), Tailwind CSS, JavaScript (ES6+), Google Gemini API (`gemini-2.5-flash`)  

---

## 📁 Struktur Direktori & Modul

```text
src/
├── components/
│   ├── ChatUI.jsx              # Komponen utama antarmuka & state management
│   └── QuickReplyButtons.jsx   # Komponen modular tombol opsi cepat (DRY)
├── data/
│   └── knowledgeBase.js        # Dokumen konstanta FAQ resmi FST (Knowledge Base)
├── services/
│   └── geminiService.js        # Service controller & pemanggilan REST API Gemini
└── utils/
    └── chatValidator.js        # Validasi dan sanitasi input pengguna (SRP)
```

---

## 🛠️ BAGIAN 2 — DOKUMENTASI CODE REVIEW & REFACTORING (TAHAP 3)

### Temuan 1: Prinsip DRY (Don't Repeat Yourself) pada Tombol Menu Cepat
* **Masalah (Before):** Tombol opsi cepat (*Info KRS, Syarat Sidang TA, PMB, Kontak TU*) ditulis secara manual satu per satu menggunakan elemen JSX berulang. Hal ini menyebabkan kode duplikatif dan sulit dipelihara jika terdapat penambahan menu.
* **Solusi Refactoring (After):** Memindahkan data ke array objek `QUICK_OPTIONS` dan merendernya secara dinamis menggunakan iterasi `.map()` di dalam komponen terpisah `QuickReplyButtons.jsx`.
* **Perbandingan Before vs After:**
  ```jsx
  // BEFORE (Duplikasi manual JSX)
  <div className="quick-buttons">
    <button onClick={() => send("Info KRS")}>Info KRS</button>
    <button onClick={() => send("Syarat Sidang TA")}>Syarat Sidang TA</button>
    <button onClick={() => send("PMB")}>PMB</button>
    <button onClick={() => send("Kontak TU")}>Kontak TU</button>
  </div>
  ```
  ```jsx
  // AFTER (DRY via .map() & data-driven)
  const QUICK_OPTIONS = [
    { id: 'krs', label: 'Info KRS', query: 'Bagaimana jadwal dan alur KRS?' },
    { id: 'sidang-ta', label: 'Syarat Sidang TA', query: 'Apa syarat sidang TA?' },
    { id: 'pmb', label: 'PMB', query: 'Informasi jalur PMB FST' },
    { id: 'kontak-tu', label: 'Kontak TU', query: 'Kontak WhatsApp TU FST' },
  ];

  {QUICK_OPTIONS.map((item) => (
    <button key={item.id} onClick={() => onSelectOption(item.query)}>
      {item.label}
    </button>
  ))}
  ```

---

### Temuan 2: Single Responsibility Principle (SRP) & Modularity
* **Masalah (Before):** Komponen tampilan `ChatUI.jsx` memuat seluruh logika bisnis: validasi regex string, fetch network langsung ke API, pembuatan prompt AI, hingga rendering gelembung chat. Komponen menjadi "fat component" yang sulit diuji secara mandiri (*untestable*).
* **Solusi Refactoring (After):** Memecah tanggung jawab ke dalam 3 modul spesifik:
  1. `src/utils/chatValidator.js`: Hanya bertanggung jawab atas sanitasi dan validasi format masukan.
  2. `src/services/geminiService.js`: Hanya bertanggung jawab atas komunikasi jaringan dengan Google Gemini API dan penyusunan prompt instruksi.
  3. `src/components/ChatUI.jsx`: Hanya fokus pada state management tampilan (UI).
* **Perbandingan Before vs After:**
  ```javascript
  // BEFORE (Semua logika menumpuk di UI)
  const handleSend = async (text) => {
    if (!text || text.trim() === '') return;
    const clean = text.replace(/<[^>]*>?/gm, '');
    const res = await fetch(`https://api.gemini...?key=${key}`, { ... });
    // update state...
  };
  ```
  ```javascript
  // AFTER (Modular & SRP)
  import { validateAndSanitizeTopic } from '../utils/chatValidator';
  import { askGeminiFST } from '../services/geminiService';

  const handleSendMessage = async (rawTopic) => {
    const { isValid, sanitizedTopic, errorMessage } = validateAndSanitizeTopic(rawTopic);
    if (!isValid) return setErrorMessage(errorMessage);

    const reply = await askGeminiFST(sanitizedTopic);
    // UI hanya menerima hasil bersih
  };
  ```

---

### Temuan 3: Input Validation & Error Handling (try-catch-finally)
* **Masalah (Before):** Tidak ada pencegahan terhadap masukan spasi kosong atau karakter injeksi berbahaya. Selain itu, pemanggilan jaringan API tidak dilengkapi penanganan galat yang memadai sehingga jika internet terputus atau kuota API habis, state `isLoading` terus berjalan dan form obrolan membeku (*frozen UI*).
* **Solusi Refactoring (After):** Menambahkan filter regex karakter bahaya (`< > ' " ; / %`), membatasi panjang teks 1-500 karakter, dan membungkus pemanggilan API dalam blok `try-catch-finally` yang menampilkan pesan galat interaktif pada antarmuka.
* **Perbandingan Before vs After:**
  ```javascript
  // BEFORE (Tanpa sanitasi & error handling rawan unhandled rejection)
  fetch(endpoint, { method: 'POST', body: JSON.stringify({ prompt: text }) })
    .then(r => r.json())
    .then(d => setReply(d.text));
  ```
  ```javascript
  // AFTER (Sanitasi ketat & blok try-catch-finally aman)
  const sanitizedTopic = topic.trim().replace(/[<>'";/%]/g, '');

  try {
    setIsLoading(true);
    const reply = await askGeminiFST(sanitizedTopic);
    setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
  } catch (err) {
    setErrorMessage(err.message || 'Gagal terhubung ke layanan AURA-FST.');
  } finally {
    setIsLoading(false); // Form selalu dibuka kembali
  }
  ```

---

## 🧪 BAGIAN 3 — TABEL PENGUJIAN / TESTING (TAHAP 4)

| No | Modul / Kode FR | Skenario Pengujian (Steps) | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **FR-001 (Normal Case)** | Klik tombol cepat **"Info KRS"** saat halaman dimuat. | Muncul pertanyaan ke chat, bot menampilkan jawaban akurat: jadwal KRS 1–15 September 2026 via SIAKAD dalam format bullet points. | Jawaban ditampilkan dari Gemini `gemini-2.5-flash` sesuai dokumen resmi FST. | **PASS (Berhasil)** |
| 2 | **FR-001 (Normal Case)** | Klik tombol cepat **"Syarat Sidang TA"**. | Bot menjawab dengan poin-poin syarat: minimal 138 SKS, IPK >= 2.00, bebas perpus, bebas SPP, dan lulus Sempro. | Sesuai dengan dokumen `knowledgeBase.js`. | **PASS (Berhasil)** |
| 3 | **FR-001 (Normal Case)** | Klik tombol cepat **"Kontak TU"**. | Bot menginformasikan lokasi Gedung Dekanat Lt. 1 dan WhatsApp 0812-3456-7890 pada jam kerja. | Sesuai dan akurat tanpa halusinasi. | **PASS (Berhasil)** |
| 4 | **FR-001 (Invalid Input)** | Mengirim pesan kosong atau hanya spasi pada kotak input form. | Sistem menolak pengiriman, form tidak memanggil API, dan muncul banner error peringatan: *"Pesan atau topik tidak boleh kosong."* | Pesan galat merah muncul di antarmuka, loading tidak terpicu. | **PASS (Berhasil)** |
| 5 | **FR-001 (Security / Sanitasi)** | Mengirim pesan berisi tag HTML / injeksi: `<script>alert('test')</script> Info PMB;%` | Karakter `< > ' " ; / %` otomatis dibersihkan oleh `chatValidator.js` sebelum dikirim ke Gemini API. | Karakter bahaya dieliminasi, API menerima pesan bersih dan aman. | **PASS (Berhasil)** |
| 6 | **FR-001 (Fallback Out-of-Scope)** | Menanyakan topik di luar kampus FST, misal: *"Berapa resep nasi goreng enak?"* | Bot menolak berhalusinasi dan mengarahkan pengguna ke kontak WhatsApp TU FST 0812-3456-7890. | System instruction menahan halusinasi dan memberikan fallback WA TU FST. | **PASS (Berhasil)** |
| 7 | **FR-001 (Error Handling)** | Menguji saat koneksi internet offline / simulasi API Key salah. | Aplikasi tidak crash, muncul pesan peringatan galat di atas form, dan tombol kembali aktif (*tidak macet*). | Muncul banner galat merah ramah pengguna (*user-friendly*). | **PASS (Berhasil)** |
