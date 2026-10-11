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

| Nama Modul                                                                | Tanggung Jawab Utama                                                                                                                                                                                        | Alasan Pemisahan (Cohesion)                                                                                                                         |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ChatUI Module** *(Frontend / View)*                             | - Merender antarmuka obrolan (*chat bubbles*).- Menangkap input teks pengguna dan melakukan sanitasi input.- Menampilkan status balasan atau pesan bantuan rujukan.                                       | Berfokus murni pada pengalaman pengguna (*presentation layer*) tanpa mencampurkan logika pencocokan kata kunci.                                   |
| **ChatController Module** *(Backend Core)*                        | - Mengelola rute API endpoint (`POST /api/chat`).- Menerima *payload* JSON pesan dan memvalidasi sesi percakapan.- Mengoordinasikan pemanggilan ke modul parser dan mencatat log pesan.                 | Berfungsi sebagai orkestrator request-response (prinsip Controller pada MVC) tanpa menyimpan detail query database.                                 |
| **KnowledgeEngine Module** *(Logika Pencocokan / Business Logic)* | - Menormalisasi teks input (case folding, pembersihan tanda baca).- Membandingkan kata kunci masukan dengan kamus aturan FAQ.- Menentukan apakah sistem memberikan jawaban pasti atau respons *fallback*. | Fokus khusus pada pemrosesan semantik/kata kunci (*high cohesion*), sehingga jika kelak algoritma diganti ke LLM/RAG, modul lain tidak terganggu. |
| **KnowledgeData Module** *(Akses Data & Repositori)*              | - Mengelola operasi baca-tulis data FAQ (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).- Menyimpan log percakapan pengguna untuk audit riwayat.- Mengisolasi skema database dari logika aplikasi.         | Menerapkan*low coupling* agar perubahan skema database (MySQL/PostgreSQL/JSON) tidak merusak controller atau engine pencocokan.                   |
| **AdminCMS Module** *(Manajemen Pengetahuan)*                     | - Menyediakan form antarmuka bagi staf TU FST untuk pembaruan data FAQ.- Melakukan validasi hak akses staf TU FST sebelum perubahan disimpan.                                                               | Memisahkan jalur operasional admin dari interaksi obrolan umum mahasiswa.                                                                           |

---


---

## 4. Alur Satu Fitur (Termasuk Kondisi Gagal)

Fitur yang dipilih untuk dijelaskan alurnya adalah **Pencarian dan Balasan Informasi Obrolan (Chat Flow)**, yang mencakup layanan informasi akademik/admisi serta mekanisme *fallback helpdesk*.

### 4.1 Skenario Berhasil (Jawaban Ditemukan)

Alur ketika pengguna menanyakan informasi akademik dan sistem berhasil menemukan jawaban dalam basis pengetahuan:

1. **ChatUI Module (Frontend):** Pengguna memasukkan pertanyaan pada kolom obrolan (contoh: *"Bagaimana alur pengajuan surat aktif kuliah?"*). `ChatUI` melakukan sanitasi input dan mengirimkan permintaan via `POST /api/chat`.
2. **ChatController Module (Backend Core):** Menerima *payload* JSON, memvalidasi sesi percakapan, lalu meneruskan pesan pengguna ke `KnowledgeEngine`.
3. **KnowledgeEngine Module:** Melakukan normalisasi teks (*case folding* dan pembersihan tanda baca), lalu meminta daftar aturan/kata kunci ke `KnowledgeData`.
4. **KnowledgeData Module:** Mengambil data FAQ dari basis data dan mengembalikannya ke `KnowledgeEngine`.
5. **KnowledgeEngine Module:** Membandingkan kata kunci masukan dengan aturan FAQ. Karena kata kunci cocok (*match*), modul mengembalikan teks jawaban prosedur akademik ke `ChatController`.
6. **ChatController Module:** Memicu `KnowledgeData` untuk mencatat log percakapan, kemudian mengembalikan respons JSON berisi jawaban ke `ChatUI`.
7. **ChatUI Module:** Menerima respons JSON dan merender *chat bubble* berisi jawaban prosedur akademik secara interaktif kepada pengguna.

### 4.2 Skenario Gagal / Kondisi Gagal (Jawaban Tidak Ditemukan / Fallback)

Alur ketika pertanyaan pengguna tidak dikenali atau tidak memiliki kecocokan kata kunci pada basis pengetahuan (*edge case/failure path*):

1. **ChatUI Module (Frontend):** Pengguna memasukkan pertanyaan di luar lingkup FAQ (contoh: *"Berapa biaya sewa kantin FST?"*). Input dikirimkan via `POST /api/chat`.
2. **ChatController Module (Backend Core):** Menerima request, memvalidasi sesi, lalu meneruskan pesan ke `KnowledgeEngine`.
3. **KnowledgeEngine Module:** Menormalisasi teks dan meminta data aturan FAQ dari `KnowledgeData`.
4. **KnowledgeData Module:** Mengirimkan data daftar aturan FAQ ke `KnowledgeEngine`.
5. **KnowledgeEngine Module:** Membandingkan kata kunci masukan dengan basis data FAQ. **Hasil pencocokan gagal / tidak ditemukan (*no match found*)**.
6. **KnowledgeEngine Module:** Mengembalikan status respons penanda *FALLBACK* ke `ChatController`.
7. **ChatController Module:** Membaca status *FALLBACK* dan menyusun respons bantuan otomatis yang memuat kontak resmi Helpdesk/TU FST (sesuai `REQ-03`).
8. **ChatController Module:** Mengirim instruksi pencatatan log percakapan gagal ke `KnowledgeData` dan merespons `ChatUI` dengan *payload fallback*.
9. **ChatUI Module:** Merender *chat bubble* berisi pesan maaf serta informasi rujukan kontak Helpdesk/TU FST agar pengguna dapat menghubungi staf langsung.

## 5. Dua Keputusan Desain Beserta Alasannya

### 5.1 Memisahkan KnowledgeEngine dan KnowledgeData

Kebutuhan terkait: REQ-01, REQ-02, dan REQ-04.

Keputusan desain:
Sistem memisahkan KnowledgeEngine Module sebagai pengolah dan pencocok kata kunci dari KnowledgeData Module sebagai pengelola penyimpanan data FAQ. KnowledgeEngine mengakses data FAQ melalui KnowledgeData tanpa perlu mengetahui detail struktur database.

Alternatif desain:
Proses pencocokan kata kunci dan operasi database digabungkan dalam satu modul.

Alasan pemilihan:
Pemisahan ini menerapkan prinsip Separation of Concerns, High Cohesion, dan Low Coupling. KnowledgeEngine dapat dikembangkan atau diganti algoritmanya tanpa harus mengubah cara penyimpanan data FAQ. Selain itu, perubahan database tidak secara langsung memengaruhi logika pencocokan kata kunci.

### 5.2 Menggunakan Fallback Helpdesk ketika Jawaban Tidak Ditemukan

Kebutuhan terkait: REQ-03.

Keputusan desain:
KnowledgeEngine menentukan apakah pertanyaan pengguna cocok dengan aturan FAQ yang tersedia. Jika jawaban tidak ditemukan atau pertanyaan memerlukan penanganan staf, sistem memberikan respons fallback. ChatController mengoordinasikan respons tersebut agar ChatUI dapat menampilkan arahan untuk menghubungi kontak resmi Helpdesk/TU FST.

Alternatif desain:
Sistem tetap memberikan jawaban berdasarkan perkiraan meskipun tidak menemukan kecocokan pada basis pengetahuan FAQ.

Alasan pemilihan:
Fallback membantu mengurangi risiko penyampaian informasi yang tidak didukung oleh basis pengetahuan. Pengguna tetap memperoleh arahan ketika sistem tidak dapat menjawab pertanyaan. Keputusan ini juga menjaga agar tanggung jawab KnowledgeEngine, ChatController, dan ChatUI tetap jelas.
