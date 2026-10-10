# System Requirement AURA FST

## 1. Kebutuhan Terpilih dan Asumsi

### 1.1 Kebutuhan Terpilih (Selected Requirements)
* **REQ-01 Layanan Informasi Prosedur Akademik & Kemahasiswaan:** Sistem mampu memberikan informasi terstruktur mengenai alur pengajuan surat akademik (surat aktif, cuti), kalender akademik (periode KRS, jadwal ujian), serta syarat pendaftaran seminar/sidang Tugas Akhir di lingkungan FST secara mandiri.
* **REQ-02 Layanan Informasi Publik & Admisi FST:** Sistem mampu menjawab pertanyaan masyarakat umum dan calon mahasiswa terkait profil fakultas, akreditasi program studi FST, dan jalur pendaftaran mahasiswa baru.
* **REQ-03 Eskalasi Layanan / Fallback Helpdesk:** Sistem menyediakan kontak resmi petugas Helpdesk/TU FST secara otomatis jika pertanyaan pengguna tidak dikenali atau memerlukan penanganan staf langsung.
* **REQ-04 Manajemen Basis Pengetahuan FAQ:** Staf TU FST (Admin) dapat menambah, memperbarui, dan menghapus data tanya-jawab (*knowledge base*) secara mandiri tanpa mengubah kode program.

### 1.2 Asumsi Desain
1. Pengguna (mahasiswa, staf, atau umum) mengakses layanan melalui peramban web modern tanpa kewajiban autentikasi awal untuk menanyakan informasi umum.
2. Respons awal sistem mengandalkan pencocokan kata kunci rule-based/keyword parser berbasis API internal yang berjalan secara deterministik dan cepat di lingkungan lokal/server.
3. Basis data FAQ selalu dijaga validitasnya oleh staf TU FST selaku administrator sistem.

---

## 2. Daftar Modul Beserta Tanggung Jawab (Modularitas)

Pemisahan modul dirancang berdasarkan prinsip **Separation of Concerns (SoC)** dan **High Cohesion**:

| Nama Modul | Tanggung Jawab Utama | Alasan Pemisahan (Cohesion) |
|---|---|---|
| **ChatUI Module** *(Frontend / View)* | - Merender antarmuka obrolan (*chat bubbles*).<br>- Menangkap input teks pengguna dan melakukan sanitasi input.<br>- Menampilkan status balasan atau pesan bantuan rujukan. | Berfokus murni pada pengalaman pengguna (*presentation layer*) tanpa mencampurkan logika pencocokan kata kunci. |
| **ChatController Module** *(Backend Core)* | - Mengelola rute API endpoint (`POST /api/chat`).<br>- Menerima *payload* JSON pesan dan memvalidasi sesi percakapan.<br>- Mengoordinasikan pemanggilan ke modul parser dan mencatat log pesan. | Berfungsi sebagai orkestrator request-response (prinsip Controller pada MVC) tanpa menyimpan detail query database. |
| **KnowledgeEngine Module** *(Logika Pencocokan / Business Logic)* | - Menormalisasi teks input (case folding, pembersihan tanda baca).<br>- Membandingkan kata kunci masukan dengan kamus aturan FAQ.<br>- Menentukan apakah sistem memberikan jawaban pasti atau respons *fallback*. | Fokus khusus pada pemrosesan semantik/kata kunci (*high cohesion*), sehingga jika kelak algoritma diganti ke LLM/RAG, modul lain tidak terganggu. |
| **KnowledgeData Module** *(Akses Data & Repositori)* | - Mengelola operasi baca-tulis data FAQ (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).<br>- Menyimpan log percakapan pengguna untuk audit riwayat.<br>- Mengisolasi skema database dari logika aplikasi. | Menerapkan *low coupling* agar perubahan skema database (MySQL/PostgreSQL/JSON) tidak merusak controller atau engine pencocokan. |
| **AdminCMS Module** *(Manajemen Pengetahuan)* | - Menyediakan form antarmuka bagi staf TU FST untuk pembaruan data FAQ.<br>- Melakukan validasi hak akses staf TU FST sebelum perubahan disimpan. | Memisahkan jalur operasional admin dari interaksi obrolan umum mahasiswa. |

