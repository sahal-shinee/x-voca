class NotificationModel {
  final String id;
  final String type; // 'VOTE_SPIKE', 'NEW_GAME_REQUEST', 'collab_requested', 'TODO_DEADLINE', 'SCHEDULE_REMINDER', 'BROADCASTING_START', 'SYSTEM_UPDATE'
  final String title;
  final String message;
  final bool read;
  final DateTime createdAt;
  final int? targetTab; // 0: Dashboard, 1: Schedule, 2: Votes & Collab, 3: Todo, 4: Settings
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

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    DateTime parseCreatedAt(dynamic val) {
      if (val is int) return DateTime.fromMillisecondsSinceEpoch(val);
      if (val is num) return DateTime.fromMillisecondsSinceEpoch(val.toInt());
      if (val is String) {
        final parsedInt = int.tryParse(val);
        if (parsedInt != null) return DateTime.fromMillisecondsSinceEpoch(parsedInt);
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
