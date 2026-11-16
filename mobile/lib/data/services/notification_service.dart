import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
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
  static const String highImportanceChannelId = 'xvoca_high_importance_channel';
  static const String highImportanceChannelName = 'X-VOCA Stream & Collab Alerts';
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
      // 1. Meminta izin notifikasi pengguna (wajib untuk iOS dan Android 13+)
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      debugPrint('[FCM] Permission status: ${settings.authorizationStatus}');

      // 2. Inisialisasi plugin notifikasi lokal perangkat (ikon peluncur)
      const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
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
            priority: Priority.high,
            visibility: NotificationVisibility.public,
            icon: '@mipmap/ic_launcher',
            playSound: true,
            enableVibration: true,
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
  /// - `stream_alerts`: Notifikasi siaran langsung dan perubahan jadwal stream.
  /// - `creator_alerts`: Notifikasi aktivitas creator seperti voting dan pengajuan collab baru.
  Future<void> subscribeCreatorTopics() async {
    try {
      await _messaging.subscribeToTopic('stream_alerts');
      await _messaging.subscribeToTopic('creator_alerts');
      debugPrint('[FCM] Subscribed to stream_alerts & creator_alerts');
    } catch (e) {
      debugPrint('[FCM] Topic subscription error: $e');
    }
  }
}
