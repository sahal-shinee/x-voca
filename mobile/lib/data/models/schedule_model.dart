/// Model data jadwal siaran streaming (Stream Schedule).
///
/// Menyimpan rincian sesi stream seperti judul acara, kategori game,
/// tanggal & jam mulai, info bintang tamu kolaborasi, link platform (YouTube, dsb),
/// banner thumbnail, serta status siaran (`upcoming`, `live`, `done`, `archived`).
class ScheduleModel {
  /// ID unik jadwal streaming dari database.
  final int id;

  /// ID pengguna (streamer/admin) pemilik jadwal.
  final int userId;

  /// Judul sesi siaran (misal: "Night Chill & Minecraft Hardcore Ep. 4").
  final String title;

  /// Kategori atau nama game yang akan dimainkan.
  final String? gameCategory;

  /// Waktu dan tanggal tayang siaran.
  final DateTime? scheduledAt;

  /// Deskripsi atau sinopsis konten siaran.
  final String? description;

  /// Nama bintang tamu jika sesi merupakan stream kolaborasi.
  final String? collabGuest;

  /// Tautan profil/sosial media bintang tamu kolaborasi.
  final String? collabSocial;

  /// URL siaran langsung atau video YouTube.
  final String? youtubeUrl;

  /// URL gambar thumbnail poster siaran.
  final String? thumbnailUrl;

  /// Platform tempat siaran berlangsung (default: 'YouTube').
  final String streamPlatform;

  /// Flag penentu apakah widget hitung mundur (countdown timer) diaktifkan pada fansite.
  final bool countdownEnabled;

  /// Status siklus tayang jadwal: `'upcoming'`, `'live'`, `'done'`, `'archived'`.
  final String status;

  ScheduleModel({
    required this.id,
    required this.userId,
    required this.title,
    this.gameCategory,
    this.scheduledAt,
    this.description,
    this.collabGuest,
    this.collabSocial,
    this.youtubeUrl,
    this.thumbnailUrl,
    this.streamPlatform = 'YouTube',
    this.countdownEnabled = true,
    this.status = 'upcoming',
  });

  /// Factory constructor untuk memetakan payload JSON backend ke [ScheduleModel].
  factory ScheduleModel.fromJson(Map<String, dynamic> json) {
    return ScheduleModel(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      title: json['title'] ?? '',
      gameCategory: json['game_category'],
      scheduledAt: json['scheduled_at'] != null
          ? DateTime.tryParse(json['scheduled_at'].toString())
          : null,
      description: json['description'],
      collabGuest: json['collab_guest'],
      collabSocial: json['collab_social'],
      youtubeUrl: json['youtube_url'],
      thumbnailUrl: json['thumbnail_url'],
      streamPlatform: json['stream_platform'] ?? 'YouTube',
      countdownEnabled:
          json['countdown_enabled'] == 1 || json['countdown_enabled'] == true,
      status: json['status'] ?? 'upcoming',
    );
  }

  /// Membuat salinan objek jadwal dengan atribut termodifikasi.
  ScheduleModel copyWith({
    int? id,
    int? userId,
    String? title,
    String? gameCategory,
    DateTime? scheduledAt,
    String? description,
    String? collabGuest,
    String? collabSocial,
    String? youtubeUrl,
    String? thumbnailUrl,
    String? streamPlatform,
    bool? countdownEnabled,
    String? status,
  }) {
    return ScheduleModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      gameCategory: gameCategory ?? this.gameCategory,
      scheduledAt: scheduledAt ?? this.scheduledAt,
      description: description ?? this.description,
      collabGuest: collabGuest ?? this.collabGuest,
      collabSocial: collabSocial ?? this.collabSocial,
      youtubeUrl: youtubeUrl ?? this.youtubeUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      streamPlatform: streamPlatform ?? this.streamPlatform,
      countdownEnabled: countdownEnabled ?? this.countdownEnabled,
      status: status ?? this.status,
    );
  }

  /// Mengonversi objek [ScheduleModel] menjadi Map JSON untuk request POST/PATCH.
  Map<String, dynamic> toJson() {
    return {
      if (userId > 0) 'user_id': userId,
      'title': title,
      'game_category': gameCategory,
      'scheduled_at': scheduledAt?.toIso8601String(),
      'description': description,
      if (collabGuest != null && collabGuest!.isNotEmpty)
        'collab_guest': collabGuest,
      if (collabSocial != null && collabSocial!.isNotEmpty)
        'collab_social': collabSocial,
      'youtube_url': youtubeUrl,
      'thumbnail_url': thumbnailUrl,
      'stream_platform': streamPlatform,
      'countdown_enabled': countdownEnabled ? 1 : 0,
      'status': status,
    };
  }
}
