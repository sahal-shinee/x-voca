import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/config/env.dart';
import '../../data/models/notification_model.dart';
import '../../data/services/notification_service.dart';
import 'auth_provider.dart' show dioProvider;

class NotificationState {
  final bool isLoading;
  final List<NotificationModel> notifications;
  final String? error;

  NotificationState({
    this.isLoading = false,
    this.notifications = const [],
    this.error,
  });

  int get unreadCount => notifications.where((n) => !n.read).length;

  NotificationState copyWith({
    bool? isLoading,
    List<NotificationModel>? notifications,
    String? error,
  }) {
    return NotificationState(
      isLoading: isLoading ?? this.isLoading,
      notifications: notifications ?? this.notifications,
      error: error,
    );
  }
}

class NotificationNotifier extends StateNotifier<NotificationState> {
  final Dio _dio;
  static const String _storageKey = 'xvoca_cached_notifications_v1';
  StreamSubscription? _fcmSubscription;
  StreamSubscription? _rtdbSubscription;

  NotificationNotifier(this._dio) : super(NotificationState(isLoading: true)) {
    _init();
  }

  Future<void> _init() async {
    // 1. Load from local cache first for instant UI response
    await _loadFromLocal();

    // 2. Fetch fresh list from backend API
    await fetchNotifications();

    // 3. Listen to FCM foreground push messages in real-time
    _fcmSubscription = NotificationService.notificationStream.stream.listen((notif) {
      addNotification(notif);
    });

    // 4. Listen to Firebase Realtime Database at /notifications/default
    _listenToFirebaseRTDB();
  }

  void _listenToFirebaseRTDB() {
    try {
      if (Firebase.apps.isNotEmpty) {
        final db = FirebaseDatabase.instanceFor(
          app: Firebase.app(),
          databaseURL: Env.firebaseDatabaseUrl,
        );

        _rtdbSubscription = db.ref('notifications/default').onValue.listen(
          (event) {
            final data = event.snapshot.value;
            if (data is Map) {
              final List<NotificationModel> list = [];
              data.forEach((k, v) {
                if (v is Map) {
                  final map = Map<String, dynamic>.from(v);
                  map['id'] = k.toString();
                  try {
                    list.add(NotificationModel.fromJson(map));
                  } catch (e) {
                    debugPrint('[RTDB] Parse error: $e');
                  }
                }
              });

              list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
              if (list.isNotEmpty) {
                state = state.copyWith(notifications: list, isLoading: false);
                _saveToLocal(list);
              }
            }
          },
          onError: (err) {
            debugPrint('[RTDB] notifications listener error: $err');
          },
        );
      }
    } catch (e) {
      debugPrint('[RTDB] notifications init warning: $e');
    }
  }

  Future<void> _loadFromLocal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_storageKey);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        final List decoded = jsonDecode(jsonStr);
        final list = decoded.map((e) => NotificationModel.fromJson(Map<String, dynamic>.from(e))).toList();
        state = state.copyWith(notifications: list, isLoading: false);
      }
    } catch (e) {
      debugPrint('[Notif] Local load error: $e');
    }
  }

  Future<void> _saveToLocal(List<NotificationModel> list) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = jsonEncode(list.take(50).map((n) => n.toJson()).toList());
      await prefs.setString(_storageKey, jsonStr);
    } catch (e) {
      debugPrint('[Notif] Local save error: $e');
    }
  }

  Future<void> fetchNotifications() async {
    try {
      final res = await _dio.get('/notifications');
      if (res.data != null && res.data['success'] == true) {
        final List raw = res.data['data'] ?? [];
        final list = raw.map((e) => NotificationModel.fromJson(Map<String, dynamic>.from(e))).toList();
        state = state.copyWith(notifications: list, isLoading: false);
        await _saveToLocal(list);
      }
    } catch (e) {
      debugPrint('[Notif] fetch error: $e');
      state = state.copyWith(isLoading: false);
    }
  }

  void _safeApiCall(Future<dynamic> Function() call) {
    unawaited(() async {
      try {
        await call();
      } catch (_) {}
    }());
  }

  void markAsRead(String id) {
    final updated = state.notifications.map((n) {
      if (n.id == id) {
        return n.copyWith(read: true);
      }
      return n;
    }).toList();

    state = state.copyWith(notifications: updated);
    _saveToLocal(updated);

    _safeApiCall(() => _dio.patch('/notifications/$id/read'));
  }

  void markAllAsRead() {
    final updated = state.notifications.map((n) => n.copyWith(read: true)).toList();
    state = state.copyWith(notifications: updated);
    _saveToLocal(updated);

    _safeApiCall(() => _dio.patch('/notifications/read-all'));
  }

  void deleteNotification(String id) {
    final updated = state.notifications.where((n) => n.id != id).toList();
    state = state.copyWith(notifications: updated);
    _saveToLocal(updated);

    _safeApiCall(() => _dio.delete('/notifications/$id'));
  }

  void clearAll() {
    state = state.copyWith(notifications: const []);
    _saveToLocal(const []);

    _safeApiCall(() => _dio.delete('/notifications'));
  }

  void addNotification(NotificationModel notif) {
    final existingIndex = state.notifications.indexWhere((n) => n.id == notif.id);
    List<NotificationModel> updated;
    if (existingIndex >= 0) {
      updated = List.from(state.notifications);
      updated[existingIndex] = notif;
    } else {
      updated = [notif, ...state.notifications];
    }
    state = state.copyWith(notifications: updated);
    _saveToLocal(updated);
  }

  @override
  void dispose() {
    _fcmSubscription?.cancel();
    _rtdbSubscription?.cancel();
    super.dispose();
  }
}

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  final dio = ref.watch(dioProvider);
  return NotificationNotifier(dio);
});

final unreadNotificationsCountProvider = Provider<int>((ref) {
  return ref.watch(notificationProvider).unreadCount;
});
