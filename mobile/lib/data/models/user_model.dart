/// Model data profil akun pengguna / streamer (User Model).
///
/// Menyimpan informasi profil kreator VTuber seperti nama, email, role,
/// spesifikasi rig model 2D/3D, dan status siaran langsung aktif (*broadcasting*).
class UserModel {
  /// ID unik pengguna di database.
  final int id;

  /// Nama lengkap atau nama panggung VTuber.
  final String name;

  /// Alamat email akun.
  final String email;

  /// Role hak akses pengguna: `'superadmin'`, `'creator'`, atau `'admin'`.
  final String role;

  /// URL foto profil atau avatar streamer.
  final String? avatarUrl;

  /// Nama model rig VTuber yang digunakan (misal: "Xion Regalia Mk-II").
  final String? rigName;

  /// Versi model rig aktif (misal: "v3.4.1").
  final String? rigVersion;

  /// Status apakah streamer sedang mengudara/siaran langsung saat ini.
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

  /// Factory constructor untuk memetakan payload profil JSON dari backend ke [UserModel].
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

  /// Mengonversi objek [UserModel] menjadi Map JSON.
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

  /// Membuat salinan objek [UserModel] dengan nilai termodifikasi.
  UserModel copyWith({
    int? id,
    String? name,
    String? email,
    String? role,
    String? avatarUrl,
    String? rigName,
    String? rigVersion,
    bool? isBroadcasting,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      rigName: rigName ?? this.rigName,
      rigVersion: rigVersion ?? this.rigVersion,
      isBroadcasting: isBroadcasting ?? this.isBroadcasting,
    );
  }
}
