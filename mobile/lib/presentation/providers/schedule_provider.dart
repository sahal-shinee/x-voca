import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/schedule_model.dart';
import '../../data/services/schedule_service.dart';
import 'auth_provider.dart' show dioProvider, authProvider;

class ScheduleState {
  final bool isLoading;
  final List<ScheduleModel> schedules;
  final String? error;

  ScheduleState({
    this.isLoading = false,
    this.schedules = const [],
    this.error,
  });

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

class ScheduleNotifier extends StateNotifier<ScheduleState> {
  final ScheduleService _scheduleService;
  final Ref _ref;

  ScheduleNotifier(this._scheduleService, this._ref) : super(ScheduleState()) {
    fetchSchedules();
  }

  Future<void> fetchSchedules() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final schedules = await _scheduleService.getSchedules();
      state = state.copyWith(isLoading: false, schedules: schedules);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> addSchedule(ScheduleModel schedule) async {
    final activeUser = _ref.read(authProvider).value;
    final activeUserId = (activeUser != null && activeUser.id > 0)
        ? activeUser.id
        : (schedule.userId > 0 ? schedule.userId : 1);

    final previousSchedules = state.schedules;
    final tempId = schedule.id > 0 ? schedule.id : -DateTime.now().millisecondsSinceEpoch;
    final optimisticSchedule = schedule.copyWith(id: tempId, userId: activeUserId);

    // Optimistic Update: Langsung tambahkan ke UI
    state = state.copyWith(schedules: [optimisticSchedule, ...state.schedules]);

    try {
      final newSchedule = await _scheduleService.createSchedule(
        optimisticSchedule,
        userId: activeUserId,
      );
      // Sinkronkan ID & data resmi dari server tanpa re-fetch
      state = state.copyWith(
        schedules: state.schedules.map((s) => s.id == tempId ? newSchedule : s).toList(),
      );
    } catch (e) {
      // Rollback jika request server gagal
      state = state.copyWith(schedules: previousSchedules);
      rethrow;
    }
  }

  Future<void> updateSchedule(int id, Map<String, dynamic> updates) async {
    final activeUser = _ref.read(authProvider).value;
    final activeUserId = (activeUser != null && activeUser.id > 0) ? activeUser.id : 1;

    final previousSchedules = state.schedules;

    // Parsir countdownEnabled agar selalu bertipe bool bagi ScheduleModel.copyWith
    final dynamic rawCountdown = updates['countdown_enabled'];
    final bool parsedCountdown = rawCountdown is bool
        ? rawCountdown
        : (rawCountdown == 1 || rawCountdown == '1' || rawCountdown == true);

    // Optimistic Update: Perbarui item di lokal seketika
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
                    : DateTime.tryParse(updates['scheduled_at'].toString()) ?? s.scheduledAt)
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
          );
        }
        return s;
      }).toList(),
    );

    try {
      final updated = await _scheduleService.updateSchedule(id, updates, userId: activeUserId);
      state = state.copyWith(
        schedules: state.schedules.map((s) => s.id == id ? updated : s).toList(),
      );
    } catch (e) {
      // Rollback jika request server gagal
      state = state.copyWith(schedules: previousSchedules);
      rethrow;
    }
  }

  Future<void> deleteSchedule(int id) async {
    final activeUser = _ref.read(authProvider).value;
    final activeUserId = (activeUser != null && activeUser.id > 0) ? activeUser.id : 1;

    final previousSchedules = state.schedules;

    // Optimistic Update: Langsung hapus dari UI tanpa menunggu response server
    state = state.copyWith(
      schedules: state.schedules.where((s) => s.id != id).toList(),
    );

    try {
      await _scheduleService.deleteSchedule(id, userId: activeUserId);
    } catch (e) {
      // Rollback jika gagal menghapus di server
      state = state.copyWith(schedules: previousSchedules);
      rethrow;
    }
  }
}

final scheduleServiceProvider = Provider<ScheduleService>((ref) {
  return ScheduleService(ref.watch(dioProvider));
});

final scheduleProvider = StateNotifierProvider<ScheduleNotifier, ScheduleState>((ref) {
  final scheduleService = ref.watch(scheduleServiceProvider);
  return ScheduleNotifier(scheduleService, ref);
});