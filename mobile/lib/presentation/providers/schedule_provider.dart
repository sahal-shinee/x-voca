import '../../data/models/collab_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/schedule_model.dart';
import '../../data/services/schedule_service.dart';
import '../../data/services/notification_service.dart';
import 'auth_provider.dart' show dioProvider, authProvider;

/// State penampung daftar jadwal streaming (Schedule State).
///
/// Menyimpan list jadwal [schedules], status loading [isLoading], dan pesan [error].
class ScheduleState {
  final bool isLoading;
  final List<ScheduleModel> schedules;
  final String? error;

  ScheduleState({
    this.isLoading = false,
    this.schedules = const [],
    this.error,
  });

  /// Menggandakan state secara immutable.
  ScheduleState copyWith({
    bool? isLoading,
    List<ScheduleModel>? schedules,
    String? error,
  }) {
    return ScheduleState(
      isLoading: isLoading ?? this.isLoading,
      schedules: schedules ?? this.schedules,
      error: error,
    );
  }
}

/// StateNotifier yang mengatur CRUD jadwal streaming VTuber.
///
/// Menggunakan Optimistic Update untuk operasi:
/// - Penambahan jadwal baru (`addSchedule`).
/// - Pembaruan info/status jadwal (`updateSchedule`).
/// - Penghapusan jadwal (`deleteSchedule`).
/// Dilengkapi rollback otomatis ke state sebelumnya jika terjadi error jaringan.
class ScheduleNotifier extends StateNotifier<ScheduleState> {
  final ScheduleService _scheduleService;
  final Ref _ref;

  ScheduleNotifier(this._scheduleService, this._ref) : super(ScheduleState()) {
    fetchSchedules();
  }

  /// Mengambil daftar semua jadwal siaran dari backend (`GET /schedules`).
  Future<void> fetchSchedules() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final schedules = await _scheduleService.getSchedules();
      state = state.copyWith(isLoading: false, schedules: schedules);

      // Sinkronkan alarm pengingat 30 menit untuk seluruh jadwal upcoming
      for (final s in schedules) {
        if (s.scheduledAt != null && s.status.toLowerCase() == 'upcoming') {
          NotificationService.instance.scheduleStreamReminder(
            scheduleId: s.id,
            title: s.title,
            streamTime: s.scheduledAt!,
          );
        }
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Menambahkan jadwal streaming baru dengan Optimistic UI insertion.
  Future<void> addSchedule(ScheduleModel schedule) async {
    final activeUser = _ref.read(authProvider).value;
    final activeUserId = (activeUser != null && activeUser.id > 0)
        ? activeUser.id
        : (schedule.userId > 0 ? schedule.userId : 1);

    final previousSchedules = state.schedules;
    final tempId = schedule.id > 0
        ? schedule.id
        : -DateTime.now().millisecondsSinceEpoch;
    final optimisticSchedule =
        schedule.copyWith(id: tempId, userId: activeUserId);

    // 1. Optimistic Update: Langsung tambahkan ke list jadwal lokal
    state = state.copyWith(schedules: [optimisticSchedule, ...state.schedules]);

    try {
      // 2. Kirim ke backend
      final newSchedule = await _scheduleService.createSchedule(
        optimisticSchedule,
        userId: activeUserId,
      );
      // 3. Sinkronkan ID resmi yang digenerate oleh server
      state = state.copyWith(
        schedules: state.schedules
            .map((s) => s.id == tempId ? newSchedule : s)
            .toList(),
      );

      // Pasang alarm pengingat 30 menit
      if (newSchedule.scheduledAt != null &&
          newSchedule.status.toLowerCase() == 'upcoming') {
        NotificationService.instance.scheduleStreamReminder(
          scheduleId: newSchedule.id,
          title: newSchedule.title,
          streamTime: newSchedule.scheduledAt!,
        );
      }
    } catch (e) {
      // 4. Rollback jika request server gagal
      state = state.copyWith(schedules: previousSchedules);
      rethrow;
    }
  }

  /// Memperbarui rincian jadwal streaming dengan Optimistic Update lokal.
  Future<void> updateSchedule(int id, Map<String, dynamic> updates) async {
    final activeUser = _ref.read(authProvider).value;
    final activeUserId =
        (activeUser != null && activeUser.id > 0) ? activeUser.id : 1;

    final previousSchedules = state.schedules;

    // Normalisasi countdownEnabled agar selalu bertipe bool
    final dynamic rawCountdown = updates['countdown_enabled'];
    final bool parsedCountdown = rawCountdown is bool
        ? rawCountdown
        : (rawCountdown == 1 || rawCountdown == '1' || rawCountdown == true);

    // 1. Optimistic Update lokal seketika
    state = state.copyWith(
      schedules: state.schedules.map((s) {
        if (s.id == id) {
          return s.copyWith(
            title: updates['title'] ?? s.title,
            gameCategory: updates.containsKey('game_category')
                ? updates['game_category'] as String?
                : s.gameCategory,
            scheduledAt: updates['scheduled_at'] != null
                ? (updates['scheduled_at'] is DateTime
                    ? updates['scheduled_at'] as DateTime
                    : DateTime.tryParse(updates['scheduled_at'].toString()) ??
                        s.scheduledAt)
                : s.scheduledAt,
            description: updates.containsKey('description')
                ? updates['description'] as String?
                : s.description,
            streamPlatform: updates['stream_platform'] ?? s.streamPlatform,
            youtubeUrl: updates.containsKey('youtube_url')
                ? updates['youtube_url'] as String?
                : s.youtubeUrl,
            thumbnailUrl: updates.containsKey('thumbnail_url')
                ? updates['thumbnail_url'] as String?
                : s.thumbnailUrl,
            countdownEnabled: updates.containsKey('countdown_enabled')
                ? parsedCountdown
                : s.countdownEnabled,
            status: updates['status'] ?? s.status,
            collabGuest: updates.containsKey('collab_guest')
                ? updates['collab_guest'] as String?
                : s.collabGuest,
            collabSocial: updates.containsKey('collab_social')
                ? updates['collab_social'] as String?
                : s.collabSocial,
          );
        }
        return s;
      }).toList(),
    );

    try {
      // 2. Kirim update ke server
      final updated = await _scheduleService.updateSchedule(
        id,
        updates,
        userId: activeUserId,
      );
      state = state.copyWith(
        schedules:
            state.schedules.map((s) => s.id == id ? updated : s).toList(),
      );

      // Sinkronkan alarm pengingat 30 menit
      if (updated.scheduledAt != null &&
          updated.status.toLowerCase() == 'upcoming') {
        NotificationService.instance.scheduleStreamReminder(
          scheduleId: updated.id,
          title: updated.title,
          streamTime: updated.scheduledAt!,
        );
      } else {
        NotificationService.instance.cancelStreamReminder(id);
      }
    } catch (e) {
      // 3. Rollback jika server error
      state = state.copyWith(schedules: previousSchedules);
      rethrow;
    }
  }

  /// Menghapus jadwal streaming dengan Optimistic UI removal.
  Future<void> deleteSchedule(int id) async {
    final activeUser = _ref.read(authProvider).value;
    final activeUserId =
        (activeUser != null && activeUser.id > 0) ? activeUser.id : 1;

    final previousSchedules = state.schedules;

    // Langsung hapus dari UI tanpa menunggu response server
    state = state.copyWith(
      schedules: state.schedules.where((s) => s.id != id).toList(),
    );

    // Batalkan alarm pengingat 30 menit
    NotificationService.instance.cancelStreamReminder(id);

    try {
      await _scheduleService.deleteSchedule(id, userId: activeUserId);
    } catch (e) {
      state = state.copyWith(schedules: previousSchedules);
      rethrow;
    }
  }
}

/// Provider instance [ScheduleService].
final scheduleServiceProvider = Provider<ScheduleService>((ref) {
  return ScheduleService(ref.watch(dioProvider));
});

/// Provider global daftar jadwal streaming.
final scheduleProvider =
    StateNotifierProvider<ScheduleNotifier, ScheduleState>((ref) {
  final scheduleService = ref.watch(scheduleServiceProvider);
  return ScheduleNotifier(scheduleService, ref);
});

/// Provider state indeks tab navigasi aktif pada Dashboard.
final dashboardTabProvider = StateProvider<int>((ref) => 0);

/// Provider penampung sementara data collab yang akan dikonversi menjadi jadwal stream.
final pendingScheduleCollabProvider = StateProvider<CollabModel?>((ref) => null);
