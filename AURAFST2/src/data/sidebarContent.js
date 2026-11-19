import {
  BookOpen,
  GraduationCap,
  Calendar,
  FileText,
  Globe,
  HelpCircle,
  Building2,
} from "lucide-react";

export const SIDEBAR_SECTIONS = [
  {
    id: "topik-akademik",
    title: "Topik Bantuan Cepat",
    items: [
      {
        id: "krs",
        label: "Panduan & Jadwal KRS",
        icon: Calendar,
        prompt: "Bagaimana alur dan jadwal pengisian KRS semester ini di FST?",
      },
      {
        id: "sidang-ta",
        label: "Syarat Sidang TA / Skripsi",
        icon: GraduationCap,
        prompt: "Apa saja persyaratan berkas untuk mendaftar Sidang Tugas Akhir?",
      },
      {
        id: "pmb",
        label: "Informasi PMB FST",
        icon: BookOpen,
        prompt: "Jelaskan jalur masuk dan program studi yang ada di FST.",
      },
      {
        id: "konsultasi-sains",
        label: "Bantuan Materi & Koding",
        icon: HelpCircle,
        prompt: "Bantu saya memahami konsep dasar algoritma dan struktur data.",
      },
    ],
  },
  {
    id: "tautan-resmi",
    title: "Portal & Tautan Resmi",
    items: [
      {
        id: "web-fst",
        label: "Website Resmi FST",
        icon: Globe,
        href: "https://fst.uinjkt.ac.id",
        badge: "Web",
      },
      {
        id: "ais-portal",
        label: "Academic Information System",
        icon: Building2,
        href: "https://ais.uinjkt.ac.id",
        badge: "Web",
      },
      {
        id: "e-semesta",
        label: "E-Semesta",
        icon: Globe,
        href: "https://e-semesta.uinjkt.ac.id/",
        badge: "Web",
      },
      {
        id: "layanan-FST",
        label: "Layanan FST",
        icon: Globe,
        href: "https://layanan-fst.uinjakarta.id/",
        badge: "Web",
      },
    ],
  },
];