class CollabModel {
  final int id;
  final String? viewerIdentifier;
  final String requestedStreamerName;
  final String? requestedStreamerSocial;
  final String? message;
  final String status; // 'pending', 'accepted', 'rejected'
  final int? reviewedBy;
  final String? reviewedAt;
  final String? reviewNotes;
  final String periodKey;
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