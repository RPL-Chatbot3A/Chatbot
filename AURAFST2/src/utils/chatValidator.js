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
 * @returns {{ isValid: boolean, sanitizedTopic: string, sanitizedText: string, errorMessage: string | null, message: string | null }}
 */
export const validateAndSanitizeTopic = (topic) => {
  // 1. Validasi tipe data dan keberadaan teks
  if (!topic || typeof topic !== 'string') {
    const err = 'Pesan atau topik tidak boleh kosong.';
    return {
      isValid: false,
      sanitizedTopic: '',
      sanitizedText: '',
      errorMessage: err,
      message: err,
    };
  }

  // 2. Sanitasi string dari spasi berlebih dan karakter berbahaya
  const sanitizedTopic = topic.trim().replace(DANGEROUS_CHARS_REGEX, '');

  // 3. Validasi panjang minimal setelah sanitasi
  if (sanitizedTopic.length < MIN_TOPIC_LENGTH) {
    const err = 'Pesan tidak valid atau hanya berisi karakter terlarang / spasi.';
    return {
      isValid: false,
      sanitizedTopic: '',
      sanitizedText: '',
      errorMessage: err,
      message: err,
    };
  }

  // 4. Validasi panjang maksimal
  if (sanitizedTopic.length > MAX_TOPIC_LENGTH) {
    const err = `Pesan terlalu panjang (maksimal ${MAX_TOPIC_LENGTH} karakter).`;
    return {
      isValid: false,
      sanitizedTopic,
      sanitizedText: sanitizedTopic,
      errorMessage: err,
      message: err,
    };
  }

  return {
    isValid: true,
    sanitizedTopic,
    sanitizedText: sanitizedTopic,
    errorMessage: null,
    message: null,
  };
};
