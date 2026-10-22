class YouTubeStatsModel {
  final String channelName;
  final String customUrl;
  final String? avatarUrl;
  final int subscribers;
  final int totalViews;
  final int totalVideos;
  final DateTime? updatedAt;

  YouTubeStatsModel({
    required this.channelName,
    required this.customUrl,
    this.avatarUrl,
    required this.subscribers,
    required this.totalViews,
    required this.totalVideos,
    this.updatedAt,
  });

  factory YouTubeStatsModel.fromJson(Map<String, dynamic> json) {
    return YouTubeStatsModel(
      channelName: json['channel_name'] ?? 'Xion Regalia',
      customUrl: json['custom_url'] ?? '@xionregalia',
      avatarUrl: json['avatar_url'],
      subscribers: json['subscribers'] ?? 0,
      totalViews: json['total_views'] ?? 0,
      totalVideos: json['total_videos'] ?? 0,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'])
          : null,
    );
  }

  // Helper tampilan format angka subscriber
  String get formattedSubscribers {
    if (subscribers >= 1000000) {
      return '${(subscribers / 1000000).toStringAsFixed(1)}M';
    } else if (subscribers >= 1000) {
      return '${(subscribers / 1000).toStringAsFixed(2)} rb';
    }
    return subscribers.toString();
  }
}