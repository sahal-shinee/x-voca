/// Model data untuk mencatat riwayat aktivitas (Audit Log) pada dashboard admin.
///
/// Digunakan untuk menampilkan log perubahan jadwal, update to-do,
/// review permohonan collab, maupun sesi login streamer.
class AuditLogModel {
  /// ID unik entri log dari database.
  final int id;

  /// Kategori atau tipe tindakan (misal: 'STREAM_UPDATE', 'COLLAB_REVIEW').
  final String actionType;

  /// Deskripsi singkat mengenai aktivitas yang dilakukan.
  final String description;

  /// Rincian tambahan (opsional) terkait entri aktivitas.
  final String? subDetail;

  /// Format teks waktu relatif (misal: '5 menit lalu', '2 jam lalu').
  final String timeAgo;

  /// Timestamp tepat saat tindakan tercatat di server.
  final DateTime? createdAt;

  AuditLogModel({
    required this.id,
    required this.actionType,
    required this.description,
    this.subDetail,
    required this.timeAgo,
    this.createdAt,
  });

  /// Factory constructor untuk memetakan respon JSON backend menjadi objek [AuditLogModel].
  factory AuditLogModel.fromJson(Map<String, dynamic> json) {
    return AuditLogModel(
      id: json['id'] is int
          ? json['id']
          : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      actionType: json['action_type']?.toString() ?? 'AKTIVITAS',
      description:
          json['detail']?.toString() ?? json['description']?.toString() ?? '-',
      subDetail: json['sub_detail']?.toString(),
      timeAgo: json['time_ago']?.toString() ?? 'Baru saja',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
    );
  }
}
