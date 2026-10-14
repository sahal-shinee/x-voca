class GameModel {
  final int id;
  final String title;
  final String? genre;
  final String? publisher;
  final String? coverUrl;
  final int voteCount;
  final String status; // 'requested', 'accepted', 'playing', 'done'
  final String addedBy; // 'admin', 'viewer'
  final String? requesterInfo;
  final String periodKey;

  GameModel({
    required this.id,
    required this.title,
    this.genre,
    this.publisher,
    this.coverUrl,
    required this.voteCount,
    required this.status,
    required this.addedBy,
    this.requesterInfo,
    required this.periodKey,
  });

  factory GameModel.fromJson(Map<String, dynamic> json) {
    return GameModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      genre: json['genre'],
      publisher: json['publisher'],
      coverUrl: json['cover_url'],
      voteCount: json['vote_count'] ?? 0,
      status: json['status'] ?? 'requested',
      addedBy: json['added_by'] ?? 'admin',
      requesterInfo: json['requester_info'],
      periodKey: json['period_key'] ?? '',
    );
  }
}

class VoteStatsModel {
  final int totalGames;
  final int totalVotes;
  final int requested;
  final int accepted;
  final int playing;
  final int done;

  VoteStatsModel({
    required this.totalGames,
    required this.totalVotes,
    required this.requested,
    required this.accepted,
    required this.playing,
    required this.done,
  });

  factory VoteStatsModel.fromJson(Map<String, dynamic> json) {
    return VoteStatsModel(
      totalGames: json['total_games'] ?? 0,
      totalVotes: json['total_votes'] ?? 0,
      requested: json['requested'] ?? 0,
      accepted: json['accepted'] ?? 0,
      playing: json['playing'] ?? 0,
      done: json['done'] ?? 0,
    );
  }
}
