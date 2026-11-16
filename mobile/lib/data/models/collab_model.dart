/// Model data yang merepresentasikan permohonan kolaborasi (Collab Request).
///
/// Pengajuan dapat dikirim oleh penonton/kreator lain via portal web,
/// dan ditinjau (*reviewed*) oleh streamer/admin di aplikasi mobile.
class CollabModel {
  /// ID unik data collab request.
  final int id;

  /// Identifier penonton atau IP/fingerprint pengirim permohonan.
  final String? viewerIdentifier;

  /// Nama VTuber / Streamer yang diajak kolaborasi.
  final String requestedStreamerName;

  /// Akun media sosial / link channel dari streamer yang diajak kolaborasi.
  final String? requestedStreamerSocial;

  /// Pesan atau alasan pengajuan kolaborasi.
  final String? message;

  /// Status peninjauan: `'pending'`, `'accepted'`, atau `'rejected'`.
  final String status;

  /// ID admin/user yang melakukan review permohonan.
  final int? reviewedBy;

  /// Waktu kapan permohonan ini ditinjau (format ISO string).
  final String? reviewedAt;

  /// Catatan internal admin hasil review.
  final String? reviewNotes;

  /// Kunci periode aktif (misal: '2026-W46').
  final String periodKey;

  /// Tanggal dibuatnya pengajuan.
  final String? createdAt;

  CollabModel({
    required this.id,
    this.viewerIdentifier,
    required this.requestedStreamerName,
    this.requestedStreamerSocial,
    this.message,
    required this.status,
    this.reviewedBy,
    this.reviewedAt,
    this.reviewNotes,
    required this.periodKey,
    this.createdAt,
  });

  /// Factory constructor untuk memetakan JSON backend ke [CollabModel].
  factory CollabModel.fromJson(Map<String, dynamic> json) {
    return CollabModel(
      id: json['id'] ?? 0,
      viewerIdentifier: json['viewer_identifier'],
      requestedStreamerName: json['requested_streamer_name'] ?? '',
      requestedStreamerSocial: json['requested_streamer_social'],
      message: json['message'],
      status: json['status'] ?? 'pending',
      reviewedBy: json['reviewed_by'],
      reviewedAt: json['reviewed_at'],
      reviewNotes: json['review_notes'],
      periodKey: json['period_key'] ?? '',
      createdAt: json['created_at'],
    );
  }

  /// Membuat salinan objek dengan field tertentu yang diperbarui (immutability).
  CollabModel copyWith({
    int? id,
    String? viewerIdentifier,
    String? requestedStreamerName,
    String? requestedStreamerSocial,
    String? message,
    String? status,
    int? reviewedBy,
    String? reviewedAt,
    String? reviewNotes,
    String? periodKey,
    String? createdAt,
  }) {
    return CollabModel(
      id: id ?? this.id,
      viewerIdentifier: viewerIdentifier ?? this.viewerIdentifier,
      requestedStreamerName:
          requestedStreamerName ?? this.requestedStreamerName,
      requestedStreamerSocial:
          requestedStreamerSocial ?? this.requestedStreamerSocial,
      message: message ?? this.message,
      status: status ?? this.status,
      reviewedBy: reviewedBy ?? this.reviewedBy,
      reviewedAt: reviewedAt ?? this.reviewedAt,
      reviewNotes: reviewNotes ?? this.reviewNotes,
      periodKey: periodKey ?? this.periodKey,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
