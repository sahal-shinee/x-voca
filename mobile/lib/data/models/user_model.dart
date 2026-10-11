class UserModel {
  final int id;
  final String name;
  final String email;
  final String role;
  final String? avatarUrl;
  final String? rigName;
  final String? rigVersion;
  final bool isBroadcasting;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.avatarUrl,
    this.rigName,
    this.rigVersion,
    this.isBroadcasting = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'creator',
      avatarUrl: json['avatar_url'],
      rigName: json['rig_name'],
      rigVersion: json['rig_version'],
      isBroadcasting: json['is_broadcasting'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'avatar_url': avatarUrl,
      'rig_name': rigName,
      'rig_version': rigVersion,
      'is_broadcasting': isBroadcasting,
    };
  }
}