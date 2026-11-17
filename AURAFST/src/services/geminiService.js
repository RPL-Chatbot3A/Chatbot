import { FAQ_KNOWLEDGE_BASE } from '../data/knowledgeBase';

/**
 * Respons instan lokal (< 20ms) untuk salam umum & FAQ resmi
 * Menjaga latensi tetap 0 detik untuk menu cepat.
 */
const INSTANT_MAP = [
  {
    keywords: ['siapa kamu', 'nama mu', 'namamu', 'siapa anda', 'kamu siapa', 'tentang kamu', 'profilmu'],
    response: `Halo! Saya **AURA-FST** (*Automated User Response Assistant* Fakultas Sains dan Teknologi UIN Syarif Hidayatullah Jakarta). Saya bertugas sebagai asisten resmi yang membantu Anda memberikan informasi Pedoman Akademik FST (KRS, Sidang TA, PMB, Cuti, Yudisium) serta materi sains, teknologi, dan perkuliahan.`,
  },
  {
    keywords: ['halo', 'hai', 'hello', 'assalamualaikum', 'pagi', 'siang', 'sore', 'malam'],
    response: `Halo! Selamat datang di **AURA-FST**. Ada yang bisa saya bantu seputar Pedoman Akademik atau materi perkuliahan di lingkungan FST?`,
  },
  {
    keywords: ['terima kasih', 'makasih', 'thanks', 'thank you'],
    response: `Sama-sama! Senang bisa membantu Anda. Jika ada pertanyaan lain seputar akademik atau perkuliahan FST, jangan ragu bertanya ya! 😊`,
  },

  // FAQ Berdasarkan SK Rektor No. 1617 Tahun 2024
  {
    keywords: ['krs', 'jadwal krs', 'alur krs', 'kartu rencana studi', 'beban sks'],
    response: `📋 **Ketentuan Beban SKS & KRS (Pedoman Akademik S1):**

• **Beban SKS Semester 1 & 2:** Maksimal **20 SKS**.
• **Semester 3 sampai Akhir:** Maksimal **24 SKS** (bergantung pada IP Semester sebelumnya).
• **Total SKS Kelulusan Sarjana:** Minimal **144 SKS**.
• **Alur Pengisian:** Dilakukan mandiri via portal akademik mahasiswa dan divalidasi oleh Dosen Penasihat Akademik (PA).`,
  },
  {
    keywords: ['sidang', 'sidang ta', 'syarat sidang', 'tugas akhir', 'skripsi', 'munaqasyah'],
    response: `🎓 **Persyaratan Pendaftaran Sidang Tugas Akhir / Munaqasyah:**

• Telah menyelesaikan beban kuliah minimal **138 SKS** dengan nilai minimal C.
• Bebas tanggungan administrasi perkuliahan dan perpustakaan.
• Memenuhi kelayakan Penomoran Ijazah Nasional (PIN).
• Telah melaksanakan bimbingan terstruktur minimal **6 kali per semester** tercatat di logbook/SIAKAD.
• Durasi ujian sidang maksimal **100 menit**.`,
  },
  {
    keywords: ['pmb', 'penerimaan mahasiswa', 'daftar', 'jalur masuk', 'pindah', 'transfer'],
    response: `🏫 **Informasi PMB & Kebijakan Transfer:**

• **Jalur Nasional:** SNBP, SNBT, SPAN-PTKIN, dan UM-PTKIN.
• **Jalur Mandiri:** Mandiri Reguler dan Mandiri Non-Reguler.
• **Aturan Pindah Kuliah (Tegas):** UIN Jakarta **TIDAK MENERIMA** mahasiswa pindahan dari perguruan tinggi lain dan **TIDAK MENERIMA** kepindahan program studi internal.`,
  },
  {
    keywords: ['tu', 'tata usaha', 'kontak tu', 'whatsapp tu', 'wa tu', 'dekanat', 'jam operasional'],
    response: `📞 **Kontak & Layanan Tata Usaha (TU) FST:**

• **Lokasi Kantor:** Gedung Dekanat Lantai 1, Ruang Pelayanan Administrasi FST UIN Syarif Hidayatullah Jakarta.
• **Kontak WhatsApp Resmi:** **0812-3456-7890**
• **Jam Layanan:** Senin – Jumat, pukul **08.00 – 16.00 WIB** (Sabtu, Minggu & Hari Libur Nasional Tutup).`,
  },
];

/**
 * Filter penolakan ketat untuk topik non-akademis/sensitif
 */
const FORBIDDEN_TOPICS = [
  'judi', 'slot', 'porn', 'bokep', 'politik praktis', 'pemilu', 'capres',
  'pacaran', 'jodoh', 'santet', 'resep masakan'
];

/**
 * Pengecekan respons instan
 * @param {string} text
 * @returns {string | null}
 */
export const findInstantAnswer = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // Tolak topik yang benar-benar tidak pantas / tidak relevan
  if (FORBIDDEN_TOPICS.some((topic) => lower.includes(topic))) {
    return `Mohon maaf, saya adalah asisten akademik Fakultas Sains dan Teknologi (FST). Saya hanya dapat membantu pertanyaan seputar aturan akademik, materi sains/teknologi, dan perkuliahan.`;
  }

  for (const item of INSTANT_MAP) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }

  return null;
};

/**
 * System Instruction Berimbang:
 * 1. Otoritas Utama: Pedoman Akademik FST (SK Rektor No. 1617 Tahun 2024).
 * 2. Kemampuan Global Terbatas: Topik Sains, Teknologi, Koding, Matematika, dan Materi Kuliah.
 * 3. Batasan Tegas: Tidak melayani topik di luar perkuliahan & wajib ringkas.
 */
export const buildSystemInstruction = () => {
  return `
Anda adalah AURA-FST (Automated User Response Assistant of Fakultas Sains dan Teknologi UIN Syarif Hidayatullah Jakarta).

PERAN & BATASAN RUANG LINGKUP (GUARDRAILS):

1. PRIORITAS UTAMA (PEDOMAN AKADEMIK RESMI):
   - Jika pengguna bertanya mengenai aturan akademik kampus (KRS, SKS, masa studi, cuti, DO, predikat kelulusan/Cum Laude, syarat sidang TA, nilai PPB, alur PMB, layanan TU), Anda WAJIB menjawab sesuai DOKUMEN PEDOMAN AKADEMIK RESMI di bawah (SK Rektor No. 1617 Tahun 2024).
   - Jika pengguna bertanya mengenai siapa pembuat chatbotnya maka akan di jawab yaitu anak mahasiswa Teknik Informatika 25
2. PENGETAHUAN GLOBAL TERBATAS (KHUSUS SAINS & KULIAH):
   - Anda DIIZINKAN menjawab pertanyaan global TERBATAS HANYA pada lingkup:
     * Sains & Matematika (rumus, teori fisika, kimia, biologi, kalkulus, statistika).
     * Teknologi & Informatika (pemrograman, basis data, AI, jaringan, rekayasa perangkat lunak).
     * Bimbingan metodologi penulisan ilmiah & tips belajar mahasiswa.
   - Penulisan rumus matematika WAJIB memakai format LaTeX ($...$ untuk inline atau $$...$$ untuk baris baru) agar dapat dirender oleh KaTeX.

3. BATASAN PENOLAKAN (TOPIK DI LUAR KAMPUS):
   - DILARANG membahas topik non-akademik umum seperti gosip selebriti, percintaan, politik praktis, resep makanan, atau obrolan santai yang tidak berhubungan dengan keilmuan FST.
   - Jika ditanya hal tersebut, tolak secara sopan: "Mohon maaf, sebagai asisten akademik FST, saya difokuskan untuk membantu informasi pedoman akademik dan materi sains/teknologi."

4. EFISIENSI TOKEN & FORMAT:
   - Jawab secara SINGKAT, PADAT, dan gunakan bullet points.
   - Maksimal 3 sampai 4 poin per jawaban agar cepat dan hemat kuota.

DOKUMEN PEDOMAN AKADEMIK RESMI (SK REKTOR NO. 1617 TAHUN 2024):
${FAQ_KNOWLEDGE_BASE}
`;
};

/**
 * Mengirim pesan ke Gemini API dengan efisiensi tinggi
 * @param {string} userMessage - Pesan dari pengguna
 * @param {Function} [onChunk] - Callback realtime stream
 * @returns {Promise<string>}
 */
export const askGeminiFST = async (userMessage, onChunk) => {
  // 1. Cek instan respons lokal (0ms latency untuk sapaan & quick buttons)
  const instantAnswer = findInstantAnswer(userMessage);
  if (instantAnswer) {
    if (typeof onChunk === 'function') onChunk(instantAnswer, instantAnswer);
    return instantAnswer;
  }

  // 2. Cek API Key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('MASUKKAN_GEMINI_API_KEY')) {
    throw new Error('Kunci API Gemini (VITE_GEMINI_API_KEY) belum dikonfigurasi di file .env');
  }

  // 3. Konfigurasi model flash-lite
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:streamGenerateContent?alt=sse&key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: userMessage }] }],
    system_instruction: { parts: [{ text: buildSystemInstruction() }] },
    generationConfig: {
      temperature: 0.2,      // Cukup presisi untuk rumus & aturan, tetapi luwes untuk sains/koding
      maxOutputTokens: 300,  // Cepat dan hemat token
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData?.error?.message || '';

      if (response.status === 503 || response.status === 429 || errMsg.toLowerCase().includes('demand')) {
        const busyMsg = `⚠️ Server AI sedang padat. Namun Anda tetap dapat menggunakan menu cepat di atas atau hubungi WhatsApp TU FST di **0812-3456-7890**.`;
        if (typeof onChunk === 'function') onChunk(busyMsg, busyMsg);
        return busyMsg;
      }

      throw new Error(errMsg || `HTTP Error ${response.status}`);
    }

    // 4. Stream chunks realtime ke UI
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunkText) {
              accumulatedText += chunkText;
              if (typeof onChunk === 'function') {
                onChunk(accumulatedText, chunkText);
              }
            }
          } catch (e) {
            // Abaikan chunk parsial
          }
        }
      }
    }

    return accumulatedText.trim() || 'Maaf, saya tidak dapat merumuskan jawaban saat ini.';
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      const timeoutMsg = `⏱️ Respon server melebihi batas waktu. Silakan gunakan menu pilihan cepat atau ulangi pertanyaan Anda.`;
      if (typeof onChunk === 'function') onChunk(timeoutMsg, timeoutMsg);
      return timeoutMsg;
    }

    console.error('Error pada askGeminiFST:', err);
    throw err;
  }
};
