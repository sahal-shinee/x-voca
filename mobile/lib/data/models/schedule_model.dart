class ScheduleModel {
  final int id;
  final int userId;
  final String title;
  final String? gameCategory;
  final DateTime? scheduledAt;
  final String? description;
  final String? youtubeUrl;
  final String? thumbnailUrl;
  final String streamPlatform;
  final bool countdownEnabled;
  final String status; // 'upcoming', 'live', 'done', 'archived'

  ScheduleModel({
    required this.id,
    required this.userId,
    required this.title,
    this.gameCategory,
    this.scheduledAt,
    this.description,
    this.youtubeUrl,
    this.thumbnailUrl,
    this.streamPlatform = 'YouTube',
    this.countdownEnabled = true,
    this.status = 'upcoming',
  });

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
      youtubeUrl: json['youtube_url'],
      thumbnailUrl: json['thumbnail_url'],
      streamPlatform: json['stream_platform'] ?? 'YouTube',
      countdownEnabled: json['countdown_enabled'] == 1 || json['countdown_enabled'] == true,
      status: json['status'] ?? 'upcoming',
    );
  }

  ScheduleModel copyWith({
    int? id,
    int? userId,
    String? title,
    String? gameCategory,
    DateTime? scheduledAt,
    String? description,
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
      youtubeUrl: youtubeUrl ?? this.youtubeUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      streamPlatform: streamPlatform ?? this.streamPlatform,
      countdownEnabled: countdownEnabled ?? this.countdownEnabled,
      status: status ?? this.status,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (userId > 0) 'user_id': userId,
      'title': title,
      'game_category': gameCategory,
      'scheduled_at': scheduledAt?.toIso8601String(),
      'description': description,
      'youtube_url': youtubeUrl,
      'thumbnail_url': thumbnailUrl,
      'stream_platform': streamPlatform,
      'countdown_enabled': countdownEnabled ? 1 : 0,
      'status': status,
    };
  }
}