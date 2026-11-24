import os

def prepend_header(filepath, header_text):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "FILE: web/frontend/" in content:
        print(f"Already commented: {filepath}")
        return
        
    new_content = header_text.strip() + "\n\n" + content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully annotated: {filepath}")

# 1. PrivateRoute.jsx
prepend_header("web/frontend/src/components/admin/PrivateRoute.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/PrivateRoute.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Komponen pembungkus rute privat (Route Guard).
 * Memeriksa status login pengguna via `useAuth()`:
 * - Jika `isAuthenticated` bernilai true, merender halaman anak (`children`).
 * - Jika tidak memiliki sesi login aktif, otomatis mengarahkan ke `/admin/login`.
 * ============================================================================
 */""")

# 2. AdminLayout.jsx
prepend_header("web/frontend/src/components/admin/AdminLayout.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/AdminLayout.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Kerangka tata letak utama (Layout Shell) Studio Admin X-VOCA.
 * Menggabungkan `Sidebar` di sebelah kiri, `Topbar` di bagian atas, dan area konten dinamis
 * yang responsif baik di desktop maupun tablet/smartphone.
 * ============================================================================
 */""")

# 3. Sidebar.jsx
prepend_header("web/frontend/src/components/admin/Sidebar.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/Sidebar.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Menu navigasi samping Studio Admin (Dashboard, Jadwal, Moderasi Voting, Konten, Kolaborasi, To-Do, Settings).
 * Dilengkapi penanda aktif (active link styling) dan tombol cepat menuju portal penonton.
 * ============================================================================
 */""")

# 4. Topbar.jsx
prepend_header("web/frontend/src/components/admin/Topbar.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/Topbar.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Baris navigasi atas Studio Admin: menampilkan profil streamer, toggle live broadcasting,
 * lonceng notifikasi (NotificationBell), dan tombol keluar (Logout).
 * ============================================================================
 */""")

# 5. GameFormPanel.jsx
prepend_header("web/frontend/src/components/admin/GameFormPanel.jsx", """/**
 * ============================================================================
 * FILE: web/frontend/src/components/admin/GameFormPanel.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Panel formulir tambah dan edit data master game di Studio Admin.
 * ============================================================================
 */""")
