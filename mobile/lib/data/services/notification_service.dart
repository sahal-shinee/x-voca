import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Top-level background message handler required by Firebase Messaging.
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  try {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp();
    }
  } catch (e) {
    debugPrint('[FCM Background] Firebase init warning: $e');
  }
  debugPrint('[FCM Background] Message ID: ${message.messageId}');
}

class NotificationService {
  NotificationService._internal();
  static final NotificationService instance = NotificationService._internal();

  static const String highImportanceChannelId = 'xvoca_high_importance_channel';
  static const String highImportanceChannelName = 'X-VOCA Stream & Collab Alerts';
  static const String highImportanceChannelDesc =
      'Notifikasi prioritas tinggi untuk status live, jadwal stream, dan collab request.';

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  bool _initialized = false;

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

  /// Initialize FCM + Local Notifications for heads-up / lockscreen alerts
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // 1. Request permission via FCM (iOS & Android 13+)
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      debugPrint('[FCM] Permission status: ${settings.authorizationStatus}');

      // 2. Initialize flutter_local_notifications
      const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
      const darwinInit = DarwinInitializationSettings();
      const initSettings = InitializationSettings(
        android: androidInit,
        iOS: darwinInit,
      );

      await _localNotifications.initialize(initSettings);

      // 3. Create high-importance Android notification channel & request Android 13+ runtime permission
      final androidPlugin =
          _localNotifications.resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      if (androidPlugin != null) {
        await androidPlugin.createNotificationChannel(_androidChannel);
        await androidPlugin.requestNotificationsPermission();
      }

      // 4. Foreground presentation options
      await _messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );

      // 5. Register background handler
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      // 6. Listen to foreground messages and display heads-up notification
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      _initialized = true;
      debugPrint('[FCM] NotificationService initialized successfully');
    } catch (e) {
      debugPrint('[FCM] NotificationService init error: $e');
    }
  }

  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    final notification = message.notification;
    final title = notification?.title ?? message.data['title'] ?? 'X-VOCA';
    final body = notification?.body ?? message.data['body'] ?? '';

    if (title.isEmpty && body.isEmpty) return;

    try {
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

  /// Subscribe creator device to both stream_alerts and creator_alerts topics
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
