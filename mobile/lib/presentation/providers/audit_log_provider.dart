import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/audit_log_model.dart';
import 'auth_provider.dart';

/// State untuk menyimpan status riwayat aktivitas (Audit Log) pada aplikasi.
///
/// Berisi list log aktivitas [logs], status pemuatan [isLoading], dan pesan [error].
class AuditLogState {
  final List<AuditLogModel> logs;
  final bool isLoading;
  final String? error;

  AuditLogState({
    this.logs = const [],
    this.isLoading = false,
    this.error,
  });

  /// Menggandakan state dengan nilai baru yang dimodifikasi secara immutable.
  AuditLogState copyWith({
    List<AuditLogModel>? logs,
    bool? isLoading,
    String? error,
  }) {
    return AuditLogState(
      logs: logs ?? this.logs,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// StateNotifier yang bertugas mengambil dan mengelola daftar riwayat aktivitas dari backend.
class AuditLogNotifier extends StateNotifier<AuditLogState> {
  final Ref _ref;

  AuditLogNotifier(this._ref) : super(AuditLogState()) {
    fetchLogs();
  }

  /// Mengambil riwayat aktivitas terbaru dari endpoint `GET /audit-logs`.
  Future<void> fetchLogs() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final dio = _ref.read(dioProvider);
      final response = await dio.get(
        '/audit-logs',
        queryParameters: {'page': 1, 'limit': 10},
      );

      if (response.data['success'] == true) {
        final List list = response.data['data']['logs'] ?? [];
        final logs = list.map((item) => AuditLogModel.fromJson(item)).toList();
        state = state.copyWith(logs: logs, isLoading: false, error: null);
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.data['message']?.toString(),
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

/// Provider global untuk memantau data dan aksi [AuditLogNotifier] di UI.
final auditLogProvider =
    StateNotifierProvider<AuditLogNotifier, AuditLogState>((ref) {
  return AuditLogNotifier(ref);
});
