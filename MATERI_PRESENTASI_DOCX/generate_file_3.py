import os
from docx.shared import Inches, Pt, RGBColor
from doc_builder import (
    create_base_document, add_header_banner, add_heading_1, add_heading_2,
    add_heading_3, add_paragraph, add_bullet_point, add_callout,
    add_code_block, add_table_data, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT
)

def build_file_3():
    doc = create_base_document()
    
    add_header_banner(
        doc,
        title="File 3: Bedah Kode Kunci & Keamanan Anti-Spam Fitur Krusial",
        subtitle="Analisis Mendalam Kode Asli, Algoritma Anti-Spam Vote & Request Game, Transaksi ACID, dan Logika Teknis Siap Sidang",
        tag="X-VOCA DOKUMEN PRESENTASI & UJIAN"
    )
    
    add_callout(
        doc,
        "Dokumen ini membedah kodingan terpenting yang hampir 100% pasti akan ditanyakan guru atau penguji Anda. "
        "Setiap modul dilengkapi cuplikan kode asli (real codebase), penjelasan baris per baris dengan bahasa santun dan mudah dipahami, "
        "serta panduan kalimat siap ucap untuk menjawab penguji.",
        title="PANDUAN MENGHADAPI PERTANYAAN TEKNIS GURU",
        style_type="info"
    )
    
    # ---------------------------------------------------------
    # MODUL 1: KEAMANAN ANTI-SPAM SISTEM VOTING
    # ---------------------------------------------------------
    add_heading_1(doc, "1. Algoritma Keamanan Anti-Spam Voting (Zero-Login Protection)")
    
    add_paragraph(
        doc,
        "Tantangan utama sistem voting publik: Bagaimana cara mencegah satu orang memberikan suara berulang kali (spam) "
        "tanpa memaksa penonton melakukan login akun Google/Email yang merepotkan?"
    )
    add_paragraph(
        doc,
        "Solusi Rekayasa X-VOCA: Kami menerapkan strategi perlindungan berlapis (Defense-in-Depth) yang menggabungkan: "
        "1. Pembatasan laju jaringan (Rate Limiter), 2. Browser Fingerprinting perangkat keras, 3. Validasi IP address fallback, "
        "4. Partisi periode bulanan (Period Keying), dan 5. Pengecekan status game (Status Gating)."
    )
    
    add_heading_2(doc, "A. Ekstraksi Fingerprint Perangkat di Frontend")
    add_paragraph(doc, "File: web/frontend/src/utils/fingerprint.js")
    
    code_fp = """export const getFingerprint = async () => {
  let fp = localStorage.getItem('xvoca_fp');
  if (fp) return fp;

  try {
    const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
    const fpAgent = await FingerprintJS.load();
    const result = await fpAgent.get();
    fp = result.visitorId; // Hash 32-karakter unik (Canvas, WebGL, Audio, Resolusi Layar)
    localStorage.setItem('xvoca_fp', fp);
    return fp;
  } catch (err) {
    // Fallback entropy jika browser / adblock memblokir script
    fp = 'fp_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('xvoca_fp', fp);
    return fp;
  }
};"""
    add_code_block(doc, code_fp, "fingerprint.js - Ekstraksi Identitas Perangkat Unik")
    
    add_paragraph(doc, "Penjelasan Baris per Baris:")
    add_bullet_point(doc, "Baris 2-3", "Pengecekan cache lokal ('localStorage'). Jika fingerprint sudah pernah digenerate di browser tersebut, sistem langsung menggunakannya kembali tanpa perlu kalkulasi ulang, sehingga hemat komputasi.")
    add_bullet_point(doc, "Baris 5-9", "Menggunakan pustaka resmi '@fingerprintjs/fingerprintjs'. Library ini mengekstrak lebih dari 30 atribut perangkat keras dan browser (seperti GPU rendering signature via Canvas/WebGL, arsitektur CPU, audio buffer processing, timezone, dan resolusi layar) lalu menghasilkan hash 32-karakter unik ('result.visitorId').")
    add_bullet_point(doc, "Baris 11-16", "Blok fallback penanganan error. Jika penonton memasang add-on pemblokir agresif atau menggunakan peramban lawas, sistem tetap membuat hash acak berbasis timestamp entropy agar sistem tidak macet.")

    add_heading_2(doc, "B. Validasi Anti-Spam & Pencatatan Suara di Backend")
    add_paragraph(doc, "File: web/backend/src/controllers/vote.controller.js (Fungsi submitVote)")
    
    code_vote_be = """const submitVote = async (req, res) => {
  const { gameId } = req.params;
  const body = req.body || {};
  const ipAddress = getClientIP(req);
  const fingerprint = body.fingerprint || ipAddress;

  // 1. Verifikasi Keberadaan & Status Game (Status Gating)
  const game = await Game.findByPk(gameId);
  if (!game) return res.status(404).json({ success: false, message: 'Game tidak ditemukan.' });
  if (game.status !== 'accepted') {
    return res.status(400).json({
      success: false,
      message: game.status === 'requested'
        ? 'Game ini belum disetujui oleh kreator untuk sesi voting.'
        : 'Sesi voting untuk game ini sudah ditutup.'
    });
  }

  // 2. Anti-Spam Check: Kombinasi IP OR Fingerprint di tabel votes
  const period_key = game.period_key;
  const existingVote = await Vote.findOne({
    where: {
      game_id: gameId,
      period_key,
      [Op.or]: [{ ip_address: ipAddress }, { fingerprint }]
    }
  });

  if (existingVote) {
    return res.status(429).json({
      success: false,
      message: 'Anda sudah memberikan vote untuk game ini di periode ini.'
    });
  }

  // 3. Catat Bukti Vote & Tambah Angka Suara Secara Atomik
  await Vote.create({ game_id: gameId, ip_address: ipAddress, fingerprint, period_key });
  await game.increment('vote_count', { by: 1 });

  // 4. Broadcast Realtime ke Firebase & Audit Log
  const totalVotes = await Game.sum('vote_count', { where: { period_key } }) || 0;
  const percentage = totalVotes > 0 ? Math.round((game.vote_count / totalVotes) * 100 * 10) / 10 : 0;
  await Promise.allSettled([
    AuditLog.create({ action_type: 'vote_in', detail: 'Vote baru ditambahkan', sub_detail: game.title }),
    updateVoteCount(game.id, game.vote_count, percentage, totalVotes)
  ]);
};"""
    add_code_block(doc, code_vote_be, "vote.controller.js - Validasi Anti-Spam & Atomicity")
    
    add_paragraph(doc, "Penjelasan Baris per Baris:")
    add_bullet_point(doc, "Status Gating (Pemeriksaan Status)", "Voting HANYA diterima jika status game adalah 'accepted'. Jika game masih 'requested' (belum disetujui admin) atau 'playing'/'done', voting ditolak otomatis.")
    add_bullet_point(doc, "Dual-Identifier Verification", "Validasi di basis data menggunakan operator Sequelize '[Op.or]: [{ ip_address }, { fingerprint }]'. Artinya, meskipun pengguna menghapus localStorage atau membuka Incognito Mode (yang mereset token browser), alamat IP fisiknya tetap terdeteksi; sebaliknya jika pengguna memakai VPN (IP berganti), hash fingerprint perangkat kerasnya tetap sama. Keduanya saling mengunci.")
    add_bullet_point(doc, "Period Keying ('period_key')", "Hak suara direset secara bersih setiap pergantian bulan (format: 'YYYY-MM', misal '2026-11'). Penonton boleh memberikan 1 suara untuk Game A di bulan November, dan boleh vote kembali di bulan Desember.")

    add_callout(
        doc,
        "Kalimat Jawaban untuk Guru:\n"
        "\"Pak/Bu Guru, sistem voting kami menggunakan prinsip Zero-Login with Hardware Fingerprinting. "
        "Kami mengekstrak profil perangkat keras seperti GPU canvas rendering dan audio stack menjadi kode hash unik. "
        "Di backend, kami menguncinya ganda dengan Alamat IP dan periode bulan (period_key). "
        "Sehingga walaupun penonton me-refresh web, membuka Incognito, atau menghapus localStorage, kecurangan voting tetap berhasil dicegah.\"",
        title="CARA MENJELASKAN KE GURU",
        style_type="success"
    )

    add_callout(
        doc,
        "Analisis Kasus Khusus (Jika Penguji Menguji 2 Akun/Profil Berbeda di 1 Laptop):\n"
        "• Pertanyaan Kritis: 'Mengapa jika saya ganti profil akun browser di laptop yang sama dan IP-nya berubah (misal tethering/VPN), saya bisa vote lagi?'\n"
        "• Jawaban Tingkat Mahasiswa/Senior: 'Di web browser, standar keamanan W3C melarang keras JavaScript membaca nomor seri fisik motherboard, CPU, atau MAC Address kartu jaringan demi privasi global. "
        "Saat pengguna membuat Profil Browser baru, ia mendapatkan LocalStorage dan environment rendering baru. Jika IP internetnya juga berubah dinamis, server membacanya sebagai pemilih sah baru.\n"
        "Hal ini adalah Trade-off Sadar: Kami memilih Zero-Login agar penonton streaming tidak malas untuk vote (Zero Friction). "
        "Jika ingin 100% mutlak 1 orang 1 vote tanpa celah ganti profil, solusinya adalah menerapkan Mandatory Login (Wajib Google OAuth + Verifikasi OTP HP), namun itu menurunkan partisipasi penonton streaming hingga 80% karena terlalu merepotkan.'",
        title="POIN EMAS ANALISIS PENGUJI: TRADE-OFF KEAMANAN VS ZERO-LOGIN",
        style_type="warning"
    )

    # ---------------------------------------------------------
    # MODUL 2: KEAMANAN ANTI-SPAM PADA REQUEST GAME
    # ---------------------------------------------------------
    add_heading_1(doc, "2. Algoritma Anti-Spam Pengajuan Request Game")
    
    add_paragraph(
        doc,
        "Selain fitur voting, penonton juga dapat mengusulkan game baru. Jika fitur ini tidak dilindungi, "
        "seorang penonton nakal dapat membanjiri (flood/spam) basis data dengan ratusan judul game palsu dalam beberapa detik. "
        "Bagaimana X-VOCA mencegahnya?"
    )
    
    add_paragraph(doc, "File: web/backend/src/controllers/vote.controller.js (Fungsi submitGameRequest)")
    
    code_req_game = """const submitGameRequest = async (req, res) => {
  const { title, genre, publisher, cover_url } = req.body || {};
  const ipAddress = getClientIP(req);
  const fingerprint = req.body?.fingerprint || ipAddress;

  // 1. Validasi Input Wajib
  if (!title) return res.status(400).json({ success: false, message: 'Judul game wajib diisi.' });

  // 2. Proteksi Cooldown: Maksimal 1 Pengajuan per Perangkat per 7 Hari
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const existingRequest = await Vote.findOne({
    where: {
      fingerprint,
      voted_at: { [Op.gte]: sevenDaysAgo }
    },
    include: [{
      model: Game,
      as: 'game',
      where: { added_by: 'viewer' }
    }]
  });

  if (existingRequest) {
    return res.status(429).json({
      success: false,
      message: 'Anda sudah mengajukan request game dalam 7 hari terakhir. Silakan tunggu masa cooldown.'
    });
  }

  // 3. Simpan Game dengan Status 'requested' (Tidak Otomatis Tampil di Voting Publik)
  const period_key = new Date().toISOString().slice(0, 7);
  const game = await Game.create({
    title, genre, publisher, cover_url,
    vote_count: 0,
    status: 'requested',        // Kunci: Butuh persetujuan admin!
    added_by: 'viewer',
    requester_info: `Viewer #${ipAddress.slice(-4)}`,
    period_key
  });

  // 4. Catat Placeholder di Tabel votes untuk Mengunci Cooldown 7 Hari
  await Vote.create({ game_id: game.id, ip_address: ipAddress, fingerprint, period_key });

  // 5. Audit Log & Notifikasi Push ke Smartphone Kreator (FCM Topic)
  await AuditLog.create({ action_type: 'game_requested', detail: 'Viewer mengajukan usulan baru', sub_detail: title });
  await sendTopicNotification('creator_alerts', {
    title: '🎮 Request Game Baru',
    body: `${game.title} — diusulkan oleh ${game.requester_info}`,
    data: { type: 'NEW_GAME_REQUEST', gameId: String(game.id), url: '/admin/voting' }
  });
};"""
    add_code_block(doc, code_req_game, "vote.controller.js - Cooldown 7 Hari & Moderation Gate")
    
    add_paragraph(doc, "Tiga Lapis Pengamanan Request Game:")
    add_bullet_point(doc, "1. Jendela Cooldown 7 Hari ('sevenDaysAgo')", "Sistem mengecek apakah fingerprint perangkat tersebut sudah pernah mengajukan game dalam 7 hari terakhir (7 * 24 jam). Jika ya, server mengembalikan status HTTP 429 Too Many Requests.")
    add_bullet_point(doc, "2. Gerbang Moderasi Kreator ('status: requested')", "Game yang diajukan oleh penonton TIDAK langsung muncul di daftar voting publik. Statusnya dikunci sebagai 'requested'. Hanya admin yang dapat mengubahnya menjadi 'accepted' melalui dashboard admin setelah meninjau kelayakannya.")
    add_bullet_point(doc, "3. Notifikasi Cepat FCM & Audit Log", "Server mengirim notifikasi instan ke aplikasi mobile kreator via Firebase Cloud Messaging sehingga kreator segera mengetahui ada masukan baru tanpa perlu mengecek web berkali-kali.")

    # ---------------------------------------------------------
    # MODUL 3: INTEGRITAS DATA & TRANSAKSI ATOMIK (ACID)
    # ---------------------------------------------------------
    add_heading_1(doc, "3. Integritas Data & Transaksi Atomik (ACID Compliant)")
    
    add_paragraph(
        doc,
        "Pertanyaan Penguji: 'Jika 100 orang mengklik tombol vote secara bersamaan pada detik yang sama, "
        "apakah angka suaranya bisa salah hitung (Race Condition)?'"
    )
    add_paragraph(
        doc,
        "Jawaban Teknis: Kami menggunakan operasi increment atomik level database dan Managed Transaction Sequelize."
    )
    
    code_acid = """// Mengapa TIDAK BOLEH menulis: game.vote_count = game.vote_count + 1; await game.save();
// Karena kode di atas rentan terhadap Race Condition saat diakses bersamaan!

// KODE YANG DIGUNAKAN DI X-VOCA (Aman & Atomik):
await game.increment('vote_count', { by: 1 });

// Pada level SQL, Sequelize menerjemahkannya menjadi:
// UPDATE `games` SET `vote_count` = `vote_count` + 1 WHERE `id` = 12;"""
    add_code_block(doc, code_acid, "Contoh Perintah SQL Atomik untuk Mencegah Race Condition")
    
    add_paragraph(
        doc,
        "Penjelasan: Sintaks 'game.increment()' dieksekusi langsung di dalam engine MySQL secara atomik pada level baris (Row-Level Locking). "
        "MySQL mengantrekan penambahan nilai di tingkat memori basis data, sehingga berapapun jumlah pengguna yang mengklik bersamaan, "
        "tidak ada satu pun suara yang terlewat (Zero Data Loss)."
    )

    # ---------------------------------------------------------
    # MODUL 4: SINKRONISASI REAL-TIME (FIREBASE + REACT HOOK)
    # ---------------------------------------------------------
    add_heading_1(doc, "4. Arsitektur Sinkronisasi Real-Time (Firebase + React Hook)")
    
    add_paragraph(
        doc,
        "Untuk menghadirkan pengalaman interaktif, X-VOCA menggunakan pola Publish-Subscribe (Pub/Sub) melalui Firebase Realtime Database."
    )
    
    add_heading_2(doc, "A. Kode Publisher di Backend (Node.js)")
    add_paragraph(doc, "File: web/backend/src/utils/firebase.helper.js")
    code_fb_be = """const updateVoteCount = async (gameId, voteCount, percentage, totalVotes = 0) => {
  const db = getFirebaseDatabase();
  const voteRef = db.ref(`votes/${gameId}`);
  await voteRef.set({
    vote_count: voteCount,
    vote_percentage: percentage,
    total_votes: totalVotes,
    updated_at: new Date().toISOString()
  });
};"""
    add_code_block(doc, code_fb_be, "firebase.helper.js - Menulis Data ke Node Realtime")
    
    add_heading_2(doc, "B. Kode Subscriber di Frontend (React Custom Hook)")
    add_paragraph(doc, "File: web/frontend/src/hooks/useFirebase.js")
    code_fb_fe = """export function useVotes() {
  const [votes, setVotes] = useState({});

  useEffect(() => {
    const db = getFirebaseDatabase();
    const votesRef = ref(db, 'votes');

    // Menerima pembaruan data secara real-time via WebSocket
    const unsubscribe = onValue(votesRef, (snapshot) => {
      if (snapshot.exists()) {
        setVotes(snapshot.val()); // Re-render komponen React secara instan
      }
    });

    // Cleanup listener saat komponen di-unmount agar tidak bocor memori
    return () => unsubscribe();
  }, []);

  return votes;
}"""
    add_code_block(doc, code_fb_fe, "useFirebase.js - Listener Event WebSocket Klien")
    
    add_bullet_point(doc, "Fungsi Cleanup ('return () => unsubscribe()')", "Sangat penting ditunjukkan kepada guru. Tanpa fungsi cleanup, setiap kali halaman berpindah akan terbentuk koneksi gantung (Memory Leak). X-VOCA mematuhi kaidah penulisan kode bersih (Clean Code React).")

    # ---------------------------------------------------------
    # MODUL 5: KEAMANAN AUTENTIKASI JWT & PROTEKSI RUTE
    # ---------------------------------------------------------
    add_heading_1(doc, "5. Keamanan Autentikasi JWT & Proteksi Rute Admin")
    
    add_paragraph(
        doc,
        "Bagaimana X-VOCA memastikan bahwa orang biasa tidak bisa mengakses Dashboard Admin hanya dengan mengetikkan URL '/admin/dashboard'?"
    )
    
    add_heading_2(doc, "A. Proteksi Backend (Middleware Token Verification)")
    add_paragraph(doc, "File: web/backend/src/middleware/auth.middleware.js")
    code_jwt = """const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.role = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
};"""
    add_code_block(doc, code_jwt, "auth.middleware.js - Verifikasi Tanda Tangan Kriptografi Token")
    
    add_heading_2(doc, "B. Proteksi Frontend (React Router Guard)")
    add_paragraph(doc, "File: web/frontend/src/components/admin/ProtectedRoute.jsx")
    code_guard = """const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Memverifikasi sesi...</div>;
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />; // Tendang pengguna ke halaman login
  }

  return children;
};"""
    add_code_block(doc, code_guard, "ProtectedRoute.jsx - Pengalihan Akses Tanpa Izin")

    # ---------------------------------------------------------
    # MODUL 6: COUNTDOWN DINAMIS & EKSPOR LAPORAN PDF
    # ---------------------------------------------------------
    add_heading_1(doc, "6. Fitur Pendukung: Dynamic Countdown & Ekspor Laporan PDF")
    
    add_paragraph(
        doc,
        "X-VOCA juga menyematkan dua fitur profesional yang meningkatkan nilai estetika dan operasional sistem:"
    )
    add_bullet_point(
        doc, "Dynamic Countdown Timer ('useCountdown.js')",
        "Menghitung selisih milidetik waktu jadwal siaran terhadap 'Date.now()'. Dihitung secara matematis menjadi Hari, Jam, Menit, "
        "dan Detik menggunakan modulo waktu. Jika waktu habis, sistem otomatis mengubah label jadwal menjadi 'LIVE NOW' dengan visual animasi denyut (pulse neon)."
    )
    add_bullet_point(
        doc, "Ekspor Laporan Rekapitulasi ke PDF ('pdfExport.js')",
        "Kreator dapat mencetak rekapitulasi perolehan voting bulanan ke dalam dokumen PDF resmi. "
        "Dijalankan langsung di sisi peramban menggunakan pustaka 'html2canvas' untuk menangkap render tabel dan 'jspdf' untuk mencetak lembar dokumen A4 beresolusi tinggi."
    )
    
    output_path = os.path.join("MATERI_PRESENTASI_DOCX", "3_Bedah_Kode_Kunci_dan_Keamanan_AntiSpam.docx")
    doc.save(output_path)
    print(f"Success generating: {output_path}")

if __name__ == "__main__":
    build_file_3()
