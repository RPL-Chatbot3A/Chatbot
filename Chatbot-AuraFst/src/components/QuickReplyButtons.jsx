import React from 'react';

/**
 * Daftar opsi tombol cepat (Quick Reply) sesuai kebutuhan FR-001
 */
const QUICK_OPTIONS = [
  { id: 'krs', label: 'Info KRS', query: 'Bagaimana jadwal dan alur pengisian KRS di FST?' },
  { id: 'sidang-ta', label: 'Syarat Sidang TA', query: 'Apa saja syarat dan ketentuan mendaftar Sidang Tugas Akhir (TA)?' },
  { id: 'pmb', label: 'PMB', query: 'Apa saja program studi dan jalur pendaftaran PMB di FST?' },
  { id: 'kontak-tu', label: 'Kontak TU', query: 'Dimana alamat dan berapa nomor kontak WhatsApp Tata Usaha FST?' },
];

/**
 * Komponen QuickReplyButtons untuk merender tombol opsi cepat secara dinamis (DRY)
 * @param {Object} props
 * @param {Function} props.onSelectOption - Callback saat tombol dipilih
 * @param {boolean} props.isDisabled - Status nonaktif saat memuat jawaban
 */
export const QuickReplyButtons = ({ onSelectOption, isDisabled = false }) => {
  return (
    <div className="w-full py-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Pilihan Cepat / FAQ:
      </p>
      <div className="flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelectOption && onSelectOption(item.query)}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-300 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplyButtons;
