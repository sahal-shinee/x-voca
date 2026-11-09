import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/notification_model.dart';

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
  NotificationNotifier() : super(NotificationState()) {
    _loadInitialNotifications();
  }

  void _loadInitialNotifications() {
    final now = DateTime.now();
    // Default studio notifications matching the Web platform (NotificationContext.jsx)
    final initialList = [
      NotificationModel(
        id: 'notif_1',
        type: 'VOTE_SPIKE',
        title: 'Vote Spike Terdeteksi',
        message: 'Game "Elden Ring" mendapat 50 vote dalam 10 menit terakhir',
        read: false,
        createdAt: now.subtract(const Duration(minutes: 5)),
        targetTab: 2, // Game Voting Tab
      ),
      NotificationModel(
        id: 'notif_2',
        type: 'NEW_GAME_REQUEST',
        title: 'Request Game Baru',
        message: '"Signalis" telah diminta oleh viewer untuk voting komunitas',
        read: false,
        createdAt: now.subtract(const Duration(minutes: 30)),
        targetTab: 2, // Game Voting Tab
      ),
      NotificationModel(
        id: 'notif_3',
        type: 'TODO_DEADLINE',
        title: 'Deadline Mendekat',
        message: 'Tugas "Edit Thumbnail Stream" harus selesai dalam 2 jam',
        read: true,
        createdAt: now.subtract(const Duration(hours: 2)),
        targetTab: 3, // Todo Tab
      ),
      NotificationModel(
        id: 'notif_4',
        type: 'SCHEDULE_REMINDER',
        title: 'Reminder Jadwal',
        message: 'Stream "Cyberpunk 2077 Night Stream" akan dimulai dalam 1 jam',
        read: true,
        createdAt: now.subtract(const Duration(days: 1)),
        targetTab: 1, // Schedule Tab
      ),
      NotificationModel(
        id: 'notif_5',
        type: 'collab_requested',
        title: 'Request Collab Baru',
        message: 'Viewer mengajukan usulan collab bersama @KoboKanaeru',
        read: false,
        createdAt: now.subtract(const Duration(minutes: 15)),
        targetTab: 2, // Collab Requests Tab
      ),
    ];

    state = state.copyWith(notifications: initialList);
  }

  void markAsRead(String id) {
    state = state.copyWith(
      notifications: state.notifications.map((n) {
        if (n.id == id) {
          return n.copyWith(read: true);
        }
        return n;
      }).toList(),
    );
  }

  void markAllAsRead() {
    state = state.copyWith(
      notifications: state.notifications.map((n) => n.copyWith(read: true)).toList(),
    );
  }

  void deleteNotification(String id) {
    state = state.copyWith(
      notifications: state.notifications.where((n) => n.id != id).toList(),
    );
  }

  void clearAll() {
    state = state.copyWith(notifications: const []);
  }

  void addNotification(NotificationModel notif) {
    state = state.copyWith(
      notifications: [notif, ...state.notifications],
    );
  }
}

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  return NotificationNotifier();
});

final unreadNotificationsCountProvider = Provider<int>((ref) {
  return ref.watch(notificationProvider).unreadCount;
});
