/**
 * ============================================================================
 * FILE: web/frontend/src/hooks/useFirebase.js
 * ============================================================================
 * FUNGSI UTAMA:
 * Pustaka Custom React Hook untuk komunikasi real-time dua arah dengan Firebase Realtime Database.
 * Mengatur:
 * 1. `useFirebase(path)`: Hook dasar listener WebSocket realtime pada path node database tertentu.
 * 2. `useVotes()`: Mendengarkan perolehan suara voting game (`/votes`) secara live tanpa reload.
 * 3. `useNextSchedule()`: Mendengarkan perubahan agenda siaran berikutnya (`/schedules/next`).
 * 4. `useBroadcastingStatus()`: Mendengarkan status streaming langsung kreator (`/broadcasting`).
 * 5. `useFirebaseWrite(path)`: Operasi penulisan manual ke Firebase.
 *
 * POIN PENJELASAN UNTUK GURU / PENGUJI:
 * - "Inilah inti dari sinkronisasi realtime frontend. Firebase Web SDK menggunakan koneksi
 *   WebSocket persisten. Ketika backend mengubah data di server, event `onValue` langsung
 *   memicu update state React seketika."
 * - "Tiap listener memiliki fungsi cleanup (`return () => unsubscribe()`) agar koneksi diputus
 *   bersih saat penonton berpindah halaman, mencegah Memory Leak."
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { getFirebaseDatabase, isFirebaseConfigured } from '../utils/firebase';

/**
 * Hook Dasar: useFirebase
 * Mengikat komponen React ke sebuah node path di Firebase Realtime Database
 *
 * @param {string} path - Alamat path node di Firebase (contoh: 'votes', 'broadcasting')
 * @returns {Object} { data, loading, error }
 */
export function useFirebase(path) {
  // State: menyimpan payload data terbaru dari Firebase
  const [data, setData] = useState(null);
  // State: status loading data awal
  const [loading, setLoading] = useState(true);
  // State: pencatatan error jika koneksi WebSocket terganggu
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Validasi: Lewati jika Firebase belum dikonfigurasi atau path kosong
    if (!isFirebaseConfigured() || !path) {
      setLoading(false);
      return;
    }

    try {
      // 2. Ambil instance koneksi Firebase Database
      const database = getFirebaseDatabase();
      if (!database) {
        setLoading(false);
        setError('Firebase database belum diinisialisasi');
        return;
      }

      // 3. Buat referensi pointer ke node path yang diinginkan
      const dataRef = ref(database, path);

      // 4. Daftarkan event listener `onValue`: dipanggil pertama kali DAN setiap kali data di node berubah
      const unsubscribe = onValue(
        dataRef,
        (snapshot) => {
          // snapshot.val() mengembalikan representasi objek JavaScript dari node tersebut
          setData(snapshot.val());
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firebase listener error pada path:', path, err);
          setError(err.message);
          setLoading(false);
        }
      );

      // 5. Cleanup Function: Wajib ada di React!
      // Mematikan listener saat komponen di-unmount agar tidak terjadi kebocoran memori (Memory Leak)
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        } else {
          off(dataRef);
        }
      };
    } catch (err) {
      console.error('Firebase hook error:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [path]);

  return { data, loading, error };
}

/**
 * Hook Khusus: useVotes
 * Mendengarkan data perolehan suara voting secara real-time dari path `/votes`
 *
 * @returns {Object} { votes, period, totalVotes, loading, error }
 */
export function useVotes() {
  // Langganan ke node 'votes' di Firebase
  const { data, loading, error } = useFirebase('votes');

  return {
    votes: data?.games || {},         // Objek kumpulan perolehan suara per ID game
    period: data?.period || null,     // Periode bulan aktif (misal "2026-11")
    totalVotes: data?.totalVotes || 0,// Akumulasi seluruh suara yang masuk
    loading,
    error,
  };
}

/**
 * Hook Khusus: useNextSchedule
 * Mendengarkan informasi jadwal siaran terdekat dari path `/schedules/next`
 * Digunakan oleh komponen Countdown Timer di Hero Section
 *
 * @returns {Object} { schedule, loading, error }
 */
export function useNextSchedule() {
  const { data, loading, error } = useFirebase('schedules/next');

  return {
    schedule: data, // Objek jadwal terdekat (judul, jam siaran, kategori)
    loading,
    error,
  };
}

/**
 * Hook Khusus: useBroadcastingStatus
 * Mendengarkan status siaran langsung kreator dari path `/broadcasting`
 * Digunakan untuk menampilkan indikator Live pulse di navbar dan hero
 *
 * @returns {Object} { isLive, isReady, loading, error }
 */
export function useBroadcastingStatus() {
  const { data, loading, error } = useFirebase('broadcasting');

  const isReady = typeof data === 'object' && data !== null
    ? Boolean(data.isReady)
    : Boolean(data);

  return {
    isLive: isReady,     // Boolean: true jika kreator sedang live streaming
    isReady,
    updatedAt: data?.updatedAt || null,
    loading,
    error,
  };
}

/**
 * Hook Khusus: useVoteCounts
 * Mendengarkan rincian angka suara spesifik per game dari path `/votes/games`
 */
export function useVoteCounts() {
  const { data, loading, error } = useFirebase('votes/games');

  return {
    voteCounts: data || {},
    loading,
    error,
  };
}

/**
 * Hook Khusus: useFirebaseWrite
 * Memungkinkan komponen menulis data ke Firebase secara terprogram (tanpa auto-subscribe listener)
 *
 * @param {string} path - Alamat path tujuan penulisan
 * @returns {Object} { write, loading, error }
 */
export function useFirebaseWrite(path) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const write = useCallback(async (value) => {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase belum terkonfigurasi');
    }

    const database = getFirebaseDatabase();
    if (!database) {
      throw new Error('Firebase database belum diinisialisasi');
    }

    setLoading(true);
    setError(null);

    try {
      // Import dinamis modul database untuk optimasi code-splitting
      const { set, ref: dbRef } = await import('firebase/database');
      const dataRef = dbRef(database, path);
      // Eksekusi penulisan data ke node
      await set(dataRef, value);
      return true;
    } catch (err) {
      console.error('Firebase write error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [path]);

  return { write, loading, error };
}

export default useFirebase;
