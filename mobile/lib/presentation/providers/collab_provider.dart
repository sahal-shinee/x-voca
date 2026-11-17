import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/collab_model.dart';
import '../../data/services/collab_service.dart';
import 'auth_provider.dart';

/// State penampung data permohonan kolaborasi (Collab State).
///
/// Menyimpan list permohonan [requests], status loading [isLoading], dan pesan [error].
class CollabState {
  final bool isLoading;
  final List<CollabModel> requests;
  final String? error;

  CollabState({
    this.isLoading = false,
    this.requests = const [],
    this.error,
  });

  /// Menggandakan state secara immutable.
  CollabState copyWith({
    bool? isLoading,
    List<CollabModel>? requests,
    String? error,
  }) {
    return CollabState(
      isLoading: isLoading ?? this.isLoading,
      requests: requests ?? this.requests,
      error: error,
    );
  }
}

/// StateNotifier yang mengatur logika interaksi data kolaborasi.
///
/// Menerapkan pola Optimistic Update untuk memberikan respons UI instan saat:
/// - Mengubah status permohonan (`updateStatus`).
/// - Memperbarui catatan review admin (`updateNotes`).
/// - Menghapus permohonan kolaborasi (`deleteRequest`).
class CollabNotifier extends StateNotifier<CollabState> {
  final CollabService _collabService;

  CollabNotifier(this._collabService) : super(CollabState()) {
    fetchCollabRequests();
  }

  /// Mengambil seluruh permohonan kolaborasi aktif dari server.
  Future<void> fetchCollabRequests() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final list = await _collabService.getCollabRequests();
      state = state.copyWith(isLoading: false, requests: list);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Menambahkan permohonan collab baru secara manual.
  Future<void> addRequest({
    required String streamerName,
    String? streamerSocial,
    String? message,
  }) async {
    final newCollab = await _collabService.createCollabRequest(
      streamerName: streamerName,
      streamerSocial: streamerSocial,
      message: message,
    );
    state = state.copyWith(requests: [newCollab, ...state.requests]);
  }

  /// Memperbarui detail usulan collab (nama streamer, medsos, pesan/topik) secara optimis.
  Future<void> updateDetails({
    required int id,
    required String streamerName,
    String? streamerSocial,
    String? message,
  }) async {
    final previous = state.requests;
    state = state.copyWith(
      requests: state.requests.map((r) {
        if (r.id == id) {
          return r.copyWith(
            requestedStreamerName: streamerName,
            requestedStreamerSocial: streamerSocial,
            message: message,
          );
        }
        return r;
      }).toList(),
    );

    try {
      final updated = await _collabService.updateCollabDetails(
        id: id,
        streamerName: streamerName,
        streamerSocial: streamerSocial,
        message: message,
      );
      state = state.copyWith(
        requests: state.requests.map((r) => r.id == id ? updated : r).toList(),
      );
    } catch (e) {
      state = state.copyWith(requests: previous);
      rethrow;
    }
  }

  /// Memperbarui status peninjauan pengajuan collab secara optimis di UI sebelum konfirmasi backend.
  Future<void> updateStatus(int id, String status, {String? notes}) async {
    final previous = state.requests;
    // 1. Optimistic update lokal
    state = state.copyWith(
      requests: state.requests.map((r) {
        if (r.id == id) {
          return r.copyWith(
            status: status,
            reviewNotes: notes ?? r.reviewNotes,
            reviewedAt: DateTime.now().toIso8601String(),
          );
        }
        return r;
      }).toList(),
    );

    try {
      // 2. Sinkronisasi ke backend
      final updated = await _collabService.updateCollabStatus(
        id,
        status,
        notes: notes,
      );
      state = state.copyWith(
        requests: state.requests.map((r) => r.id == id ? updated : r).toList(),
      );
    } catch (e) {
      // 3. Rollback state jika terjadi kegagalan jaringan
      state = state.copyWith(requests: previous);
      rethrow;
    }
  }

  /// Memperbarui catatan review admin secara optimis di UI.
  Future<void> updateNotes(int id, String notes) async {
    final previous = state.requests;
    state = state.copyWith(
      requests: state.requests.map((r) {
        if (r.id == id) {
          return r.copyWith(reviewNotes: notes);
        }
        return r;
      }).toList(),
    );

    try {
      final updated = await _collabService.updateReviewNotes(id, notes);
      state = state.copyWith(
        requests: state.requests.map((r) => r.id == id ? updated : r).toList(),
      );
    } catch (e) {
      state = state.copyWith(requests: previous);
      rethrow;
    }
  }

  /// Menghapus permohonan kolaborasi dengan optimistic UI removal.
  Future<void> deleteRequest(int id) async {
    final previous = state.requests;
    state = state.copyWith(
      requests: state.requests.where((r) => r.id != id).toList(),
    );

    try {
      await _collabService.deleteCollabRequest(id);
    } catch (e) {
      state = state.copyWith(requests: previous);
      rethrow;
    }
  }
}

/// Provider instance [CollabService].
final collabServiceProvider = Provider<CollabService>((ref) {
  return CollabService(ref.watch(dioProvider));
});

/// Provider global data permohonan kolaborasi.
final collabProvider =
    StateNotifierProvider<CollabNotifier, CollabState>((ref) {
  final service = ref.watch(collabServiceProvider);
  return CollabNotifier(service);
});
