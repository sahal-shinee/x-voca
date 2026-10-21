class AuditLogModel {
  final int id;
  final String actionType;
  final String description;
  final String? subDetail;
  final String timeAgo;
  final DateTime? createdAt;

  AuditLogModel({
    required this.id,
    required this.actionType,
    required this.description,
    this.subDetail,
    required this.timeAgo,
    this.createdAt,
  });

  factory AuditLogModel.fromJson(Map<String, dynamic> json) {
    return AuditLogModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      actionType: json['action_type']?.toString() ?? 'AKTIVITAS',
      description: json['detail']?.toString() ?? json['description']?.toString() ?? '-',
      subDetail: json['sub_detail']?.toString(),
      timeAgo: json['time_ago']?.toString() ?? 'Baru saja',
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at'].toString()) : null,
    );
  }
}
