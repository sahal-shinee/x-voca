import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../data/models/youtube_stats_model.dart';
import 'auth_provider.dart' show dioProvider;

class YouTubeState {
  final bool isLoading;
  final YouTubeStatsModel? stats;
  final String? error;

  YouTubeState({
    this.isLoading = false,
    this.stats,
    this.error,
  });

  YouTubeState copyWith({
    bool? isLoading,
    YouTubeStatsModel? stats,
    String? error,
  }) {
    return YouTubeState(
      isLoading: isLoading ?? this.isLoading,
      stats: stats ?? this.stats,
      error: error,
    );
  }
}

class YouTubeNotifier extends StateNotifier<YouTubeState> {
  final Dio _dio;

  YouTubeNotifier(this._dio) : super(YouTubeState()) {
    fetchStats();
  }

  Future<void> fetchStats() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _dio.get('/youtube/stats');
      if (response.data['success'] == true && response.data['data'] != null) {
        final data = YouTubeStatsModel.fromJson(response.data['data']);
        state = state.copyWith(isLoading: false, stats: data);
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.data['message'] ?? 'Gagal mengambil statistik',
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final youtubeProvider =
    StateNotifierProvider<YouTubeNotifier, YouTubeState>((ref) {
  final dio = ref.watch(dioProvider);
  return YouTubeNotifier(dio);
}); 