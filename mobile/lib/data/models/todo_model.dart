import 'dart:convert';

/// Model data tugas persiapan siaran / to-do list (Todo Model).
///
/// Digunakan oleh streamer untuk mencatat daftar pekerjaan, jadwal persiapan aset,
/// tenggat waktu (deadline), label tag, serta link aset gambar/audio.
class TodoModel {
  /// ID unik todo dari database.
  final int id;

  /// ID pemilik tugas.
  final int userId;

  /// Judul tugas.
  final String title;

  /// Deskripsi atau catatan detail tugas.
  final String? description;

  /// Tingkat prioritas tugas: `'low'`, `'medium'`, `'high'`, atau `'urgent'`.
  final String priority;

  /// Status penyelesaian tugas: `'pending'`, `'in_progress'`, atau `'completed'`.
  final String status;

  /// Batas waktu / tenggat pengerjaan.
  final DateTime? deadline;

  /// Label atau kategori tag tugas (misal: ['Asset', 'Rig', 'Stream']).
  final List<String> tags;

  /// Informasi atau tautan sumber daya/aset (Drive, Figma, file lokal).
  final String? resourceInfo;

  /// Waktu ketika tugas ini ditandai selesai.
  final DateTime? completedAt;

  TodoModel({
    required this.id,
    required this.userId,
    required this.title,
    this.description,
    this.priority = 'medium',
    this.status = 'pending',
    this.deadline,
    this.tags = const [],
    this.resourceInfo,
    this.completedAt,
  });

  /// Getter kenyamanan: Mengetahui apakah tugas sudah berstatus 'completed'.
  bool get isCompleted => status == 'completed';

  /// Getter kenyamanan: Mengetahui apakah tugas ini berprioritas 'urgent' atau 'high'.
  bool get isUrgent => priority == 'urgent' || priority == 'high';

  /// Factory constructor untuk memetakan data JSON dari backend ke [TodoModel].
  /// Mendukung format parsing `tags` baik berupa List array maupun string JSON encoded.
  factory TodoModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedTags = [];
    if (json['tags'] != null) {
      if (json['tags'] is String) {
        try {
          final List decoded = jsonDecode(json['tags']);
          parsedTags = decoded.map((e) => e.toString()).toList();
        } catch (_) {}
      } else if (json['tags'] is List) {
        parsedTags = (json['tags'] as List).map((e) => e.toString()).toList();
      }
    }

    return TodoModel(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'],
      priority: json['priority'] ?? 'medium',
      status: json['status'] ?? 'pending',
      deadline: json['deadline'] != null
          ? DateTime.tryParse(json['deadline'].toString())
          : null,
      tags: parsedTags,
      resourceInfo: json['resource_info'],
      completedAt: json['completed_at'] != null
          ? DateTime.tryParse(json['completed_at'].toString())
          : null,
    );
  }

  /// Membuat salinan objek todo dengan modifikasi nilai tertentu (misal: toggle complete).
  TodoModel copyWith({
    int? id,
    int? userId,
    String? title,
    String? description,
    String? priority,
    String? status,
    DateTime? deadline,
    List<String>? tags,
    String? resourceInfo,
    DateTime? completedAt,
  }) {
    return TodoModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      description: description ?? this.description,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      deadline: deadline ?? this.deadline,
      tags: tags ?? this.tags,
      resourceInfo: resourceInfo ?? this.resourceInfo,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  /// Mengonversi objek [TodoModel] menjadi Map JSON untuk disimpan atau dikirim ke backend.
  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'priority': priority,
      'status': status,
      'deadline': deadline?.toIso8601String(),
      'tags': tags,
      'resource_info': resourceInfo,
    };
  }
}
