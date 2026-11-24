/**
 * ============================================================================
 * FILE: web/frontend/src/hooks/useCountdown.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Custom React Hook penghitung mundur waktu dinamis (Dynamic Countdown Timer).
 * Mengatur:
 * 1. Kalkulasi selisih matematis antara timestamp jadwal target dengan waktu saat ini (`Date.now()`).
 * 2. Pemecahan milidetik menjadi unit Hari (days), Jam (hours), Menit (minutes), dan Detik (seconds).
 * 3. Pembaruan perhitungan secara real-time setiap 1000 ms (1 detik) via `setInterval`.
 * 4. Fungsi format tampilan `formatCountdown` untuk menghasilkan badge visual "LIVE NOW"
 *    jika waktu siaran telah tiba.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook: useCountdown
 * @param {string|Date} targetDate - Tanggal & jam target siaran (format ISO string atau Date object)
 * @returns {Object} { days, hours, minutes, seconds, total, isExpired }
 */
export function useCountdown(targetDate) {
  // State: menyimpan sisa waktu dalam unit terstruktur
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isExpired: false, // Menandakan apakah waktu target sudah tercapai / terlewat
  });

  useEffect(() => {
    // 1. Validasi: jika tidak ada tanggal target, tandai sebagai expired
    if (!targetDate) {
      setTimeLeft((prev) => ({ ...prev, isExpired: true }));
      return;
    }

    // 2. Fungsi logika matematis kalkulasi sisa waktu
    const calculateTimeLeft = () => {
      // Dapatkan milidetik dari target siaran
      const target = new Date(targetDate).getTime();
      // Dapatkan milidetik waktu lokal saat ini
      const now = Date.now();
      // Hitung selisih waktu dalam milidetik
      const difference = target - now;

      // KONDISI: Waktu siaran sudah tiba atau sudah lewat
      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
          isExpired: true, // Countdown selesai, siaran LIVE NOW!
        });
        return;
      }

      // KONDISI: Siaran masih di masa depan, pecah milidetik menjadi Hari, Jam, Menit, Detik
      setTimeLeft({
        // 1 hari = 1000ms * 60s * 60m * 24h = 86.400.000 ms
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        // Sisa jam dihitung dengan modulo 24
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        // Sisa menit dihitung dengan modulo 60
        minutes: Math.floor((difference / 1000 / 60) % 60),
        // Sisa detik dihitung dengan modulo 60
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
        isExpired: false,
      });
    };

    // Eksekusi kalkulasi pertama kali secara instan agar UI tidak kosong selama 1 detik
    calculateTimeLeft();

    // Pasang interval timer untuk memicu kalkulasi ulang setiap 1000 ms (1 detik)
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup: Bersihkan interval timer saat targetDate berubah atau komponen di-unmount
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

/**
 * Helper: formatCountdown
 * Mengonversi objek sisa waktu menjadi string teks yang rapi untuk ditampilkan di UI
 *
 * @param {Object} timeLeft - Objek hasil dari hook useCountdown
 * @returns {Object} { display: string, isLive: boolean }
 */
export function formatCountdown(timeLeft) {
  // Jika waktu habis, ubah label menjadi 'LIVE NOW'
  if (timeLeft.isExpired) {
    return { display: 'LIVE NOW', isLive: true };
  }

  const { days, hours, minutes, seconds } = timeLeft;

  // Jika masih ada sisa hari: tampilkan format "X hari Y jam Z menit"
  if (days > 0) {
    return {
      display: `${days}d ${hours}h ${minutes}m`,
      isLive: false,
    };
  }

  // Jika kurang dari 24 jam: tampilkan format "X jam Y menit Z detik"
  if (hours > 0) {
    return {
      display: `${hours}h ${minutes}m ${seconds}s`,
      isLive: false,
    };
  }

  // Jika kurang dari 1 jam: tampilkan format menit dan detik saja
  return {
    display: `${minutes}m ${seconds}s`,
    isLive: false,
  };
}

export default useCountdown;
