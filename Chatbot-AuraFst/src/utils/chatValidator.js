/**
 * @file chatValidator.js
 * @module utils/chatValidator
 * @description Modul khusus validasi dan sanitasi input pengguna untuk AURA-FST.
 * Menerapkan Single Responsibility Principle (SRP) dan Clean Code.
 */

// Karakter berbahaya yang disaring untuk pencegahan XSS dan injeksi sederhana
const DANGEROUS_CHARS_REGEX = /[<>'";/%]/g;

// Batas panjang teks masukan
const MAX_TOPIC_LENGTH = 500;
const MIN_TOPIC_LENGTH = 1;

/**
 * Melakukan validasi dan sanitasi pada topik / pesan yang dikirim pengguna.
 * @param {string} topic - Pesan atau topik dari form obrolan / tombol cepat.
 * @returns {{ isValid: boolean, sanitizedTopic: string, errorMessage: string | null }}
 */
export const validateAndSanitizeTopic = (topic) => {
  // 1. Validasi tipe data dan keberadaan teks
  if (!topic || typeof topic !== 'string') {
    return {
      isValid: false,
      sanitizedTopic: '',
      errorMessage: 'Pesan atau topik tidak boleh kosong.',
    };
  }

  // 2. Sanitasi string dari spasi berlebih dan karakter berbahaya
  const sanitizedTopic = topic.trim().replace(DANGEROUS_CHARS_REGEX, '');

  // 3. Validasi panjang minimal setelah sanitasi
  if (sanitizedTopic.length < MIN_TOPIC_LENGTH) {
    return {
      isValid: false,
      sanitizedTopic: '',
      errorMessage: 'Pesan tidak valid atau hanya berisi karakter terlarang / spasi.',
    };
  }

  // 4. Validasi panjang maksimal
  if (sanitizedTopic.length > MAX_TOPIC_LENGTH) {
    return {
      isValid: false,
      sanitizedTopic,
      errorMessage: `Pesan terlalu panjang (maksimal ${MAX_TOPIC_LENGTH} karakter).`,
    };
  }

  return {
    isValid: true,
    sanitizedTopic,
    errorMessage: null,
  };
};
