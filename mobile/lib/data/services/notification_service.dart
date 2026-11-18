import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import '../models/notification_model.dart';

/// Handler tingkat atas (top-level) untuk memproses pesan FCM yang masuk saat
/// aplikasi berada di background atau terminated state.
///
/// Wajib ditandai dengan `@pragma('vm:entry-point')` agar fungsi ini tidak
/// dihapus (tree-shaken) oleh compiler Dart saat build release.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    // Pastikan Firebase terinisialisasi pada isolate background
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp();
    }
  } catch (e) {
    debugPrint('[FCM Background] Firebase init warning: $e');
  }
  debugPrint('[FCM Background] Message ID: ${message.messageId}');
}

/// Service untuk menangani push notification (Firebase Cloud Messaging)
/// dan notifikasi lokal (Flutter Local Notifications).
///
/// Menggunakan pola Singleton (`NotificationService.instance`) agar
/// inisialisasi dan stream notifikasi terpusat di seluruh aplikasi.
class NotificationService {
  NotificationService._internal();

  /// Instance tunggal (Singleton) NotificationService.
  static final NotificationService instance = NotificationService._internal();

  // -------------------------------------------------------------
  // Konfigurasi Channel Notifikasi Android (High Importance)
  // -------------------------------------------------------------
  static const String highImportanceChannelId =
      'xvoca_high_importance_channel_v2';
  static const String highImportanceChannelName =
      'X-VOCA Stream & Collab Alerts';
  static const String highImportanceChannelDesc =
      'Notifikasi prioritas tinggi untuk status live, jadwal stream, dan collab request.';

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  /// Stream broadcast untuk meneruskan notifikasi masuk ke UI / Provider secara reaktif.
  static final StreamController<NotificationModel> notificationStream =
      StreamController<NotificationModel>.broadcast();

  bool _initialized = false;

  /// Definisi channel Android dengan prioritas maksimal (heads-up pop-up alert).
  static const AndroidNotificationChannel _androidChannel =
      AndroidNotificationChannel(
    highImportanceChannelId,
    highImportanceChannelName,
    description: highImportanceChannelDesc,
    importance: Importance.max,
    playSound: true,
    enableVibration: true,
    showBadge: true,
  );

  /// Melakukan inisialisasi lengkap layanan notifikasi FCM dan Local Notification.
  ///
  /// Meliputi permohonan izin (permission), konfigurasi channel Android,
  /// penyiapan handler foreground & background.
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Inisialisasi basis data zona waktu untuk scheduling alarm lokal
      tz.initializeTimeZones();

      // 1. Meminta izin notifikasi pengguna (wajib untuk iOS dan Android 13+)
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      debugPrint('[FCM] Permission status: ${settings.authorizationStatus}');

      // 2. Inisialisasi plugin notifikasi lokal perangkat (ikon notifikasi transparan)
      const androidInit =
          AndroidInitializationSettings('@drawable/ic_notification');
      const darwinInit = DarwinInitializationSettings();
      const initSettings = InitializationSettings(
        android: androidInit,
        iOS: darwinInit,
      );

      await _localNotifications.initialize(initSettings);

      // 3. Daftarkan notification channel ke sistem Android & minta runtime permission
      final androidPlugin =
          _localNotifications.resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      if (androidPlugin != null) {
        await androidPlugin.createNotificationChannel(_androidChannel);
        await androidPlugin.requestNotificationsPermission();
      }

      // 4. Konfigurasi opsi tampilan notifikasi saat aplikasi berada di latar depan (foreground)
      await _messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // 5. Daftarkan background message handler
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // 6. Pasang listener untuk pesan yang diterima saat aplikasi sedang dibuka
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      _initialized = true;
      debugPrint('[FCM] NotificationService initialized successfully');
    } catch (e) {
      debugPrint('[FCM] NotificationService init error: $e');
    }
  }

  /// Memproses pesan FCM yang diterima saat aplikasi sedang aktif di latar depan.
  ///
  /// Memetakan jenis pesan ke tab navigasi yang sesuai, mengirimkannya ke
  /// `notificationStream`, dan menampilkan banner heads-up notification lokal.
  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    final notification = message.notification;
    final title = notification?.title ?? message.data['title'] ?? 'X-VOCA';
    final body = notification?.body ?? message.data['body'] ?? '';

    // Abaikan jika tidak ada judul maupun pesan konten
    if (title.isEmpty && body.isEmpty) return;

    try {
      final type = message.data['type'] ?? 'SYSTEM_UPDATE';

      // Filter khusus: HP Host tidak perlu menampilkan notifikasi penonton saat diri sendiri mulai LIVE
      if (type == 'BROADCASTING_START' ||
          message.from?.contains('stream_alerts') == true) {
        debugPrint('[FCM] Mengabaikan notifikasi stream_alerts pada HP host');
        return;
      }

      // Menentukan tab tujuan navigasi berdasarkan tipe notifikasi
      int? targetTab;
      if (type.contains('GAME') || type.contains('VOTE')) {
        targetTab = 2; // Tab Games / Voting
      } else if (type.contains('COLLAB')) {
        targetTab = 2; // Tab Collab / Community
      } else if (type.contains('SCHEDULE') || type.contains('BROADCAST')) {
        targetTab = 1; // Tab Jadwal / Broadcast
      } else if (type.contains('TODO')) {
        targetTab = 3; // Tab Todo / Task List
      }

      // Bungkus data notifikasi ke dalam model aplikasi
      final notifModel = NotificationModel(
        id: message.messageId ?? 'fcm_${DateTime.now().millisecondsSinceEpoch}',
        type: type,
        title: title,
        message: body,
        read: false,
        createdAt: DateTime.now(),
        targetTab: targetTab,
        link: message.data['url'],
      );

      // Emit ke stream agar widget notifikasi memperbarui badge/list secara instan
      notificationStream.add(notifModel);

      // Munculkan floating heads-up banner menggunakan Local Notifications
      await _localNotifications.show(
        message.hashCode,
        title,
        body,
        NotificationDetails(
          android: AndroidNotificationDetails(
            _androidChannel.id,
            _androidChannel.name,
            channelDescription: _androidChannel.description,
            importance: Importance.max,
            priority: Priority.max,
            visibility: NotificationVisibility.public,
            icon: '@drawable/ic_notification',
            color: const Color(0xFF863BFF),
            playSound: true,
            enableVibration: true,
            channelShowBadge: true,
            ticker: 'X-VOCA Alert',
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
      );
    } catch (e) {
      debugPrint('[FCM] Failed to show foreground notification: $e');
    }
  }

  /// Mendaftarkan (subscribe) perangkat ke topik FCM khusus creator/streamer:
  /// - `creator_alerts`: Notifikasi aktivitas creator seperti voting, usulan game, dan pengajuan collab baru.
  ///
  /// Catatan Arsitektur:
  /// HP Host secara otomatis di-unsubscribe dari `stream_alerts` (notifikasi "Xion Regalia Sedang LIVE!"),
  /// karena topik tersebut khusus ditujukan untuk fans/penonton fansite, sehingga HP host tidak membunyikan notifikasi live ke diri sendiri.
  Future<void> subscribeCreatorTopics() async {
    try {
      // Pastikan unsubscribe dari stream_alerts (topik penonton)
      await _messaging.unsubscribeFromTopic('stream_alerts');
      // Berlangganan HANYA ke topik creator/host
      await _messaging.subscribeToTopic('creator_alerts');
      debugPrint('[FCM] Berhasil berlangganan creator_alerts saja (unsubscribed dari stream_alerts)');
    } catch (e) {
      debugPrint('[FCM] Gagal registrasi topik FCM creator: $e');
    }
  }

  /// Membatalkan langganan (unsubscribe) dari semua topik saat notifikasi dinonaktifkan di Settings atau logout.
  Future<void> unsubscribeAllTopics() async {
    try {
      await _messaging.unsubscribeFromTopic('stream_alerts');
      await _messaging.unsubscribeFromTopic('creator_alerts');
      debugPrint('[FCM] Unsubscribed dari seluruh topik FCM');
    } catch (e) {
      debugPrint('[FCM] Topic unsubscription error: $e');
    }
  }

  /// Memasang alarm lokal pengingat siaran (Tepat 30 Menit sebelum jam tayang).
  ///
  /// Menggunakan [FlutterLocalNotificationsPlugin.zonedSchedule] dengan AlarmManager native Android.
  /// Bekerja mandiri di HP host tanpa bergantung pada server internet.
  Future<void> scheduleStreamReminder({
    required int scheduleId,
    required String title,
    required DateTime streamTime,
  }) async {
    try {
      // Hitung waktu pengingat: Tepat 30 menit sebelum jadwal live
      final reminderTime = streamTime.subtract(const Duration(minutes: 30));
      final now = DateTime.now();

      // Jika waktu 30 menit sebelum jadwal sudah lewat, lewati
      if (reminderTime.isBefore(now)) {
        debugPrint('[REMINDER] Waktu 30m sebelum jadwal sudah lewat untuk: "$title"');
        return;
      }

      final scheduledDate = tz.TZDateTime.from(reminderTime, tz.local);
      final notifId = 10000 + (scheduleId > 0 ? scheduleId : scheduleId.abs());

      final hourStr = streamTime.hour.toString().padLeft(2, '0');
      final minStr = streamTime.minute.toString().padLeft(2, '0');

      await _localNotifications.zonedSchedule(
        notifId,
        '⏰ Siaran 30 Menit Lagi!',
        'Sesi "$title" akan dimulai pukul $hourStr:$minStr WIB. Siapkan OBS & rig sekarang!',
        scheduledDate,
        NotificationDetails(
          android: AndroidNotificationDetails(
            _androidChannel.id,
            _androidChannel.name,
            channelDescription: _androidChannel.description,
            importance: Importance.max,
            priority: Priority.max,
            visibility: NotificationVisibility.public,
            icon: '@drawable/ic_notification',
            color: const Color(0xFF863BFF),
            playSound: true,
            enableVibration: true,
            ticker: 'Pengingat Siaran 30 Menit',
          ),
          iOS: const DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        ),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
      );

      debugPrint('[REMINDER] Alarm 30m terpasang pada: $scheduledDate untuk "$title"');
    } catch (e) {
      debugPrint('[REMINDER] Gagal pasang alarm pengingat 30m: $e');
    }
  }

  /// Membatalkan alarm pengingat siaran jika jadwal dihapus atau sudah selesai.
  Future<void> cancelStreamReminder(int scheduleId) async {
    try {
      final notifId = 10000 + (scheduleId > 0 ? scheduleId : scheduleId.abs());
      await _localNotifications.cancel(notifId);
      debugPrint('[REMINDER] Alarm pengingat dibatalkan untuk ID: $scheduleId');
    } catch (e) {
      debugPrint('[REMINDER] Gagal membatalkan alarm: $e');
    }
  }
}
