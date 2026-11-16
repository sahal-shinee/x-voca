/// Model data statistik channel YouTube resmi streamer.
///
/// Menyimpan metrik pertumbuhan channel seperti jumlah subscriber,
/// total penayangan video (views), jumlah video, dan timestamp pembaruan data.
class YouTubeStatsModel {
  /// Nama channel YouTube (misal: "Xion Regalia Ch.").
  final String channelName;

  /// Kustom handle/URL YouTube (misal: "@xionregalia").
  final String customUrl;

  /// URL avatar foto profil channel YouTube.
  final String? avatarUrl;

  /// Jumlah pelanggan (subscriber) channel.
  final int subscribers;

  /// Akumulasi total tayangan seluruh video channel.
  final int totalViews;

  /// Total video publik yang telah diunggah di channel.
  final int totalVideos;

  /// Waktu terakhir data disinkronisasi dari YouTube Data API.
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

  /// Factory constructor untuk memetakan payload respons JSON backend ke [YouTubeStatsModel].
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

  /// Helper untuk memformat angka subscriber agar lebih ramah dibaca pada UI:
  /// - `>= 1.000.000` -> `1.2M`
  /// - `>= 1.000` -> `12.50 rb`
  /// - `< 1.000` -> angka langsung
  String get formattedSubscribers {
    if (subscribers >= 1000000) {
      return '${(subscribers / 1000000).toStringAsFixed(1)}M';
    } else if (subscribers >= 1000) {
      return '${(subscribers / 1000).toStringAsFixed(2)} rb';
    }
    return subscribers.toString();
  }
}
