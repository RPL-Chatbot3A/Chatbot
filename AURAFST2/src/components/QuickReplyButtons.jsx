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
 * Mendukung scroll horizontal pada perangkat mobile/tablet agar hemat ruang vertikal
 * @param {Object} props
 * @param {Function} props.onSelectOption - Callback saat tombol dipilih
 * @param {boolean} props.isDisabled - Status nonaktif saat memuat jawaban
 * @param {string} props.theme - Tema aktif ('dark' | 'light')
 */
export const QuickReplyButtons = ({ onSelectOption, isDisabled = false, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  return (
    <div className="w-full py-1.5 overflow-x-auto whitespace-nowrap scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-2 pb-0.5">
        {QUICK_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelectOption && onSelectOption(item.query)}
            className={`shrink-0 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer shadow-xs ${
              isDark
                ? "border-slate-700/80 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600"
                : "border-slate-300 bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 shadow-slate-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplyButtons;
