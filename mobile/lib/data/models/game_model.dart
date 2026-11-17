/// Model data untuk kandidat game streaming dalam sistem voting penonton.
///
/// Menyimpan informasi detail game, jumlah perolehan suara (vote count),
/// serta status tayang (requested, accepted, playing, done).
class GameModel {
  /// ID unik game dari database.
  final int id;

  /// Judul game.
  final String title;

  /// Genre game (misal: 'Horror', 'RPG', 'Action').
  final String? genre;

  /// Nama pengembang atau penerbit game.
  final String? publisher;

  /// URL poster atau cover art game.
  final String? coverUrl;

  /// Akumulasi jumlah vote yang diperoleh game ini.
  final int voteCount;

  /// Status siklus game: `'requested'`, `'accepted'`, `'playing'`, `'done'`.
  final String status;

  /// Pihak yang mendaftarkan game: `'admin'` atau `'viewer'`.
  final String addedBy;

  /// Informasi atau nama penonton pengusul game.
  final String? requesterInfo;

  /// Kunci periode voting aktif.
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

  /// Factory constructor untuk memetakan JSON backend ke objek [GameModel].
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

  /// Membuat salinan objek [GameModel] baru dengan nilai tertentu yang dimodifikasi.
  /// Sangat berguna untuk implementasi Optimistic Update pada UI voting.
  GameModel copyWith({
    int? id,
    String? title,
    String? genre,
    String? publisher,
    String? coverUrl,
    int? voteCount,
    String? status,
    String? addedBy,
    String? requesterInfo,
    String? periodKey,
  }) {
    return GameModel(
      id: id ?? this.id,
      title: title ?? this.title,
      genre: genre ?? this.genre,
      publisher: publisher ?? this.publisher,
      coverUrl: coverUrl ?? this.coverUrl,
      voteCount: voteCount ?? this.voteCount,
      status: status ?? this.status,
      addedBy: addedBy ?? this.addedBy,
      requesterInfo: requesterInfo ?? this.requesterInfo,
      periodKey: periodKey ?? this.periodKey,
    );
  }
}

/// Model data ringkasan metrik statistik voting game pada periode saat ini.
class VoteStatsModel {
  /// Total keseluruhan game yang terdaftar dalam polling.
  final int totalGames;

  /// Total seluruh suara/vote yang telah masuk dari penonton.
  final int totalVotes;

  /// Jumlah game berstatus diajukan (`requested`).
  final int requested;

  /// Jumlah game berstatus disetujui untuk dimainkan (`accepted`).
  final int accepted;

  /// Jumlah game yang sedang aktif dimainkan (`playing`).
  final int playing;

  /// Jumlah game yang telah selesai ditamatkan/ditayangkan (`done`).
  final int done;

  /// Kunci identitas periode aktif (misal: '2026-11').
  final String? periodKey;

  VoteStatsModel({
    required this.totalGames,
    required this.totalVotes,
    required this.requested,
    required this.accepted,
    required this.playing,
    required this.done,
    this.periodKey,
  });

  /// Factory constructor untuk memetakan respon statistik dari JSON backend.
  factory VoteStatsModel.fromJson(Map<String, dynamic> json, {String? periodKey}) {
    return VoteStatsModel(
      totalGames: json['total_games'] ?? 0,
      totalVotes: json['total_votes'] ?? 0,
      requested: json['requested'] ?? 0,
      accepted: json['accepted'] ?? 0,
      playing: json['playing'] ?? 0,
      done: json['done'] ?? 0,
      periodKey: periodKey ?? json['period_key'] as String?,
    );
  }

  /// Membuat salinan objek [VoteStatsModel] dengan nilai modifikasi tertentu.
  VoteStatsModel copyWith({
    int? totalGames,
    int? totalVotes,
    int? requested,
    int? accepted,
    int? playing,
    int? done,
    String? periodKey,
  }) {
    return VoteStatsModel(
      totalGames: totalGames ?? this.totalGames,
      totalVotes: totalVotes ?? this.totalVotes,
      requested: requested ?? this.requested,
      accepted: accepted ?? this.accepted,
      playing: playing ?? this.playing,
      done: done ?? this.done,
      periodKey: periodKey ?? this.periodKey,
    );
  }
}
