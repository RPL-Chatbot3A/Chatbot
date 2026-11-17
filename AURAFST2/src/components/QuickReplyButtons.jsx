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
      {/* <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Pilihan Cepat / FAQ:
      </p> */}
      <div className="flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelectOption && onSelectOption(item.query)}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-slate-400/10 bg-slate-700/95 backdrop-blur-3xl shadow-inner shadow-white/15 text-slate-100 hover:scale-105 hover:shadow-white/20 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplyButtons;
