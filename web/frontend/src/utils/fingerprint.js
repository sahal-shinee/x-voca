/**
 * ============================================================================
 * FILE: web/frontend/src/utils/fingerprint.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Utilitas pembuatan identitas unik perangkat peramban (Browser Fingerprinting)
 * menggunakan pustaka resmi `@fingerprintjs/fingerprintjs`.
 *
 * MENGAPA INI PENTING UNTUK DIJELASKAN KE GURU?
 * - Sistem voting X-VOCA tidak mewajibkan penonton membuat akun Google/Email (Zero-Login / Frictionless).
 * - Sebagai gantinya, modul ini mengekstrak karakteristik perangkat keras fisik peramban
 *   (seperti GPU canvas rendering, WebGL signature, resolusi layar, timezone, dan audio stack)
 *   menjadi hash 32-karakter unik (`visitorId`).
 * - Hash ini dikirimkan ke backend bersama Alamat IP untuk memastikan 1 perangkat hanya
 *   bisa memberikan 1 suara per game dalam 1 periode bulan (period_key).
 * ============================================================================
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';

// Variabel singleton promise agar inisialisasi agen FingerprintJS hanya dieksekusi 1 kali
let fpPromise = null;

/**
 * Fungsi: getFingerprint
 * Mengambil atau menghasilkan kode hash identitas fisik browser unik
 * @returns {Promise<string>} 32-karakter hash unik (misal: "c3ab8ff13720e8ad9047dd39466b3c89")
 */
export async function getFingerprint() {
  // 1. Inisialisasi agen FingerprintJS jika belum pernah dimuat sebelumnya
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }

  try {
    // 2. Tunggu agen selesai mengumpulkan entropi hardware perangkat
    const fp = await fpPromise;
    // 3. Dapatkan hasil kalkulasi sidik jari (visitorId)
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Gagal mengekstrak hardware fingerprint:', error);
    // 4. Mekanisme Fallback Cerdas:
    // Jika peramban memblokir skrip analitik (misal karena adblocker agresif),
    // sistem menghasilkan ID acak berbasis timestamp entropy agar proses voting penonton tidak macet.
    return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Fungsi: hasVoted
 * Pengecekan cepat di sisi klien (Client-side fast check) pada localStorage:
 * Apakah penonton pada browser ini sudah pernah vote game tersebut di periode bulan ini?
 *
 * @param {string|number} gameId - ID game yang dicek
 * @param {string} periodKey - Kunci periode aktif (format: YYYY-MM)
 * @returns {boolean} true jika sudah pernah vote
 */
export function hasVoted(gameId, periodKey) {
  // Kunci penyimpanan spesifik per game dan per periode: `xvoca_voted_{gameId}_{periodKey}`
  const key = `xvoca_voted_${gameId}_${periodKey}`;
  return localStorage.getItem(key) !== null;
}

/**
 * Fungsi: markVoted
 * Menandai di penyimpanan lokal peramban bahwa game ini telah dipilih oleh penonton
 *
 * @param {string|number} gameId - ID game yang baru saja divote
 * @param {string} periodKey - Kunci periode aktif (format: YYYY-MM)
 */
export function markVoted(gameId, periodKey) {
  const key = `xvoca_voted_${gameId}_${periodKey}`;
  // Simpan nilai 'true' ke localStorage
  localStorage.setItem(key, 'true');
}

/**
 * Fungsi: getCurrentPeriodKey
 * Menghasilkan string periode bulan saat ini dalam format standar "YYYY-MM" (misal: "2026-11")
 * Digunakan untuk mengelompokkan suara voting bulanan secara otomatis.
 *
 * @returns {string} Contoh: "2026-11"
 */
export function getCurrentPeriodKey() {
  const now = new Date();
  const year = now.getFullYear();
  // Bulan pada JavaScript dimulai dari 0 (Januari = 0), sehingga perlu ditambah 1
  // padStart(2, '0') memastikan format 2 digit (misal: 01, 02, ..., 11, 12)
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
