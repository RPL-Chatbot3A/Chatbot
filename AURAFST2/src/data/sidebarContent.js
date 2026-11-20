import {
  Globe,
  Building2,
  GraduationCap,
  Layers,
} from "lucide-react";

/**
 * Daftar Portal & Tautan Resmi Fakultas Sains & Teknologi UIN Syarif Hidayatullah Jakarta
 */
export const OFFICIAL_PORTAL_LINKS = [
  {
    id: "web-fst",
    label: "Website Resmi FST",
    icon: Globe,
    href: "https://fst.uinjkt.ac.id",
    badge: "Web",
  },
  {
    id: "ais-portal",
    label: "Academic Info System (AIS)",
    icon: Building2,
    href: "https://ais.uinjkt.ac.id",
    badge: "AIS",
  },
  {
    id: "e-semesta",
    label: "E-Semesta Mahasiswa",
    icon: GraduationCap,
    href: "https://e-semesta.uinjkt.ac.id/",
    badge: "LMS",
  },
  {
    id: "layanan-fst",
    label: "Layanan Persuratan FST",
    icon: Layers,
    href: "https://layanan-fst.uinjakarta.id/",
    badge: "Layanan",
  },
];
