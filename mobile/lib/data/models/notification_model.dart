/// Model data yang merepresentasikan item notifikasi (FCM & In-App Alert).
///
/// Menyimpan informasi konten pemberitahuan, status telah dibaca (`read`),
/// waktu masuk, serta target tab navigasi untuk direct routing saat notifikasi ditekan.
class NotificationModel {
  /// ID unik notifikasi (misal: message ID dari FCM atau ID lokal unik).
  final String id;

  /// Kategori notifikasi:
  /// `'VOTE_SPIKE'`, `'NEW_GAME_REQUEST'`, `'collab_requested'`,
  /// `'TODO_DEADLINE'`, `'SCHEDULE_REMINDER'`, `'BROADCASTING_START'`, `'SYSTEM_UPDATE'`.
  final String type;

  /// Judul singkat notifikasi.
  final String title;

  /// Pesan rincian notifikasi.
  final String message;

  /// Status apakah notifikasi ini sudah dibaca atau belum oleh pengguna.
  final bool read;

  /// Tanggal dan waktu saat notifikasi diterima atau diterbitkan.
  final DateTime createdAt;

  /// Indeks tab aplikasi tujuan navigasi saat notifikasi ditekan:
  /// - `0`: Dashboard
  /// - `1`: Schedule (Jadwal)
  /// - `2`: Votes & Collab
  /// - `3`: Todo
  /// - `4`: Settings
  final int? targetTab;

  /// Tautan web eksternal opsional (misal: tautan live stream YouTube).
  final String? link;

  NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.read = false,
    required this.createdAt,
    this.targetTab,
    this.link,
  });

  /// Membuat salinan objek dengan modifikasi nilai tertentu (misal: menandai `read = true`).
  NotificationModel copyWith({
    String? id,
    String? type,
    String? title,
    String? message,
    bool? read,
    DateTime? createdAt,
    int? targetTab,
    String? link,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      message: message ?? this.message,
      read: read ?? this.read,
      createdAt: createdAt ?? this.createdAt,
      targetTab: targetTab ?? this.targetTab,
      link: link ?? this.link,
    );
  }

  /// Mengonversi objek [NotificationModel] menjadi Map JSON untuk disimpan di cache lokal.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'message': message,
      'read': read,
      'createdAt': createdAt.millisecondsSinceEpoch,
      'targetTab': targetTab,
      'link': link,
    };
  }

  /// Factory constructor untuk memetakan data Map JSON menjadi [NotificationModel].
  /// Dilengkapi parser tanggal fleksibel (mendukung integer timestamp maupun string ISO).
  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    DateTime parseCreatedAt(dynamic val) {
      if (val is int) return DateTime.fromMillisecondsSinceEpoch(val);
      if (val is num) return DateTime.fromMillisecondsSinceEpoch(val.toInt());
      if (val is String) {
        final parsedInt = int.tryParse(val);
        if (parsedInt != null) {
          return DateTime.fromMillisecondsSinceEpoch(parsedInt);
        }
        final parsedDate = DateTime.tryParse(val);
        if (parsedDate != null) return parsedDate;
      }
      return DateTime.now();
    }

    return NotificationModel(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'SYSTEM_UPDATE',
      title: json['title']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      read: json['read'] == true,
      createdAt: parseCreatedAt(json['createdAt']),
      targetTab: json['targetTab'] is int ? json['targetTab'] as int : null,
      link: json['link']?.toString(),
    );
  }
}
