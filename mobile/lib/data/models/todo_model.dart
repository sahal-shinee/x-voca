import 'dart:convert';

class TodoModel {
  final int id;
  final int userId;
  final String title;
  final String? description;
  final String priority; // 'low', 'medium', 'high', 'urgent'
  final String status;   // 'pending', 'in_progress', 'completed'
  final DateTime? deadline;
  final List<String> tags;
  final String? resourceInfo;
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

  bool get isCompleted => status == 'completed';
  bool get isUrgent => priority == 'urgent' || priority == 'high';

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