import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/schedule_model.dart';
import '../providers/schedule_provider.dart';
import '../providers/auth_provider.dart' show dioProvider;

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  int _selectedFilterIndex = 0;

  final List<String> _categories = [
    'Survival Horror',
    'Action RPG',
    'Adventure',
    'Simulation',
    'Strategy',
    'Indie',
    'Retro',
    'Multiplayer',
    'Lainnya',
  ];

  final List<String> _statuses = ['upcoming', 'live', 'done'];

  void _showFloatingBanner({
    required BuildContext context,
    required String message,
    bool isError = false,
    bool isSuccess = false,
  }) {
    HapticFeedback.lightImpact();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;

    final color = isError
        ? AppColors.accentRed
        : (isSuccess ? AppColors.accentEmerald : AppColors.accentCyan);

    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: bgSurface,
        elevation: 6,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: color.withValues(alpha: 0.35), width: 1),
        ),
        content: Row(
          children: [
            Icon(
              isError
                  ? LucideIcons.circle_alert
                  : (isSuccess ? LucideIcons.circle_check : LucideIcons.info),
              color: color,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.spaceGrotesk(
                  color: textPrimary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _copyToClipboard(BuildContext context, String text, String label) async {
    await Clipboard.setData(ClipboardData(text: text));
    if (context.mounted) {
      _showFloatingBanner(
        context: context,
        message: '$label disalin ke clipboard',
        isSuccess: true,
      );
    }
  }

  Future<void> _launchYouTubeUrl(BuildContext context, String rawUrl) async {
    HapticFeedback.lightImpact();
    String formattedUrl = rawUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://$formattedUrl';
    }
    final uri = Uri.tryParse(formattedUrl);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else if (context.mounted) {
      _showFloatingBanner(
        context: context,
        message: 'Tidak dapat membuka tautan YouTube ($rawUrl)',
        isError: true,
      );
    }
  }

  /// Membuka aplikasi YouTube Android utama secara native (LaunchMode.externalApplication)
  Future<void> _openYouTubeMainApp() async {
    HapticFeedback.lightImpact();
    final appUri = Uri.parse('vnd.youtube://');
    final webUri = Uri.parse('https://www.youtube.com');

    try {
      if (await canLaunchUrl(appUri)) {
        await launchUrl(appUri, mode: LaunchMode.externalApplication);
        return;
      }
    } catch (_) {}

    try {
      await launchUrl(webUri, mode: LaunchMode.externalApplication);
    } catch (_) {
      try {
        await launchUrl(webUri, mode: LaunchMode.platformDefault);
      } catch (_) {}
    }
  }

  /// Ekstraksi YouTube Video ID dan URL thumbnail standar (hqdefault 480x360)
  String? _extractYouTubeThumbnail(String url) {
    if (url.trim().isEmpty) return null;
    final regExp = RegExp(r'(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([^&\n?#]+)');
    final match = regExp.firstMatch(url);
    if (match != null && match.group(1) != null) {
      return 'https://img.youtube.com/vi/${match.group(1)}/hqdefault.jpg';
    }
    return null;
  }

  /// Placeholder saat gambar gagal dimuat
  Widget _buildImageErrorPlaceholder() {
    return Container(
      color: Colors.black26,
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(LucideIcons.image_off, color: Colors.white54, size: 24),
          const SizedBox(height: 4),
          Text(
            'Gagal memuat gambar',
            style: GoogleFonts.spaceMono(fontSize: 10, color: Colors.white54),
          ),
        ],
      ),
    );
  }

  /// Menampilkan thumbnail yang mendukung Data URI (Base64) dan URL Remote (CachedNetworkImage)
  Widget _buildThumbnailDisplay(String rawSource, {double? width, double? height, BoxFit fit = BoxFit.cover}) {
    final src = rawSource.trim();
    if (src.isEmpty) return const SizedBox.shrink();

    if (src.startsWith('data:image')) {
      try {
        final base64Str = src.contains(',') ? src.split(',').last : src;
        final bytes = base64Decode(base64Str);
        return Image.memory(
          bytes,
          width: width,
          height: height,
          fit: fit,
          errorBuilder: (_, __, ___) => _buildImageErrorPlaceholder(),
        );
      } catch (_) {
        return _buildImageErrorPlaceholder();
      }
    }

    return CachedNetworkImage(
      imageUrl: src,
      width: width,
      height: height,
      fit: fit,
      placeholder: (context, url) => Container(
        color: Colors.black12,
        child: const Center(
          child: SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        ),
      ),
      errorWidget: (context, url, error) => _buildImageErrorPlaceholder(),
    );
  }

  /// Memilih gambar dari galeri perangkat dan mengompres ke Base64 Data URI (16:9 960x540)
  Future<void> _pickAndCompressImage({
    required void Function(String dataUri, String fileName) onImagePicked,
    required void Function(bool loading) setLoading,
    required BuildContext context,
  }) async {
    try {
      final picker = ImagePicker();
      final XFile? file = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 960,
        maxHeight: 540,
        imageQuality: 85,
      );
      if (file == null) return;

      setLoading(true);
      final bytes = await file.readAsBytes();
      final base64String = base64Encode(bytes);
      final mimeType = file.mimeType ?? 'image/jpeg';
      final dataUri = 'data:$mimeType;base64,$base64String';

      onImagePicked(dataUri, file.name);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      if (context.mounted) {
        _showFloatingBanner(
          context: context,
          message: 'Gagal memilih gambar dari galeri: $e',
          isError: true,
        );
      }
    }
  }

  /// Mengambil judul dan thumbnail video/stream secara otomatis dari backend jika judul masih kosong
  Future<void> _autoFetchTitleFromYouTube(
    String url,
    TextEditingController titleController,
    void Function(void Function()) setModalState,
    BuildContext context, {
    void Function(String thumbUrl)? onThumbnailFetched,
  }) async {
    if (!url.contains('youtube.com') && !url.contains('youtu.be')) return;

    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post('/youtube/fetch', data: {'url': url});
      if (response.data != null && response.data['success'] == true) {
        final fetchedTitle = response.data['data']?['title']?.toString().trim();
        final fetchedThumb = response.data['data']?['thumbnail_url']?.toString().trim();

        if (titleController.text.trim().isEmpty && fetchedTitle != null && fetchedTitle.isNotEmpty) {
          setModalState(() {
            titleController.text = fetchedTitle;
          });
        }

        if (fetchedThumb != null && fetchedThumb.isNotEmpty && onThumbnailFetched != null) {
          setModalState(() {
            onThumbnailFetched(fetchedThumb);
          });
        }

        if (context.mounted && ((fetchedTitle != null && fetchedTitle.isNotEmpty) || (fetchedThumb != null && fetchedThumb.isNotEmpty))) {
          _showFloatingBanner(
            context: context,
            message: 'Data stream otomatis terisi dari YouTube!',
            isSuccess: true,
          );
        }
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final scheduleState = ref.watch(scheduleProvider);
    final allSchedules = scheduleState.schedules;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgBase = isDark ? AppColors.bgBase : AppColors.bgBaseLight;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final bgNav = isDark ? AppColors.bgNav : AppColors.bgNavLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    // Filter status count
    final liveCount = allSchedules.where((s) => s.status.toLowerCase() == 'live').length;
    final upcomingCount = allSchedules.where((s) => s.status.toLowerCase() == 'upcoming').length;
    final doneCount = allSchedules.where((s) {
      final st = s.status.toLowerCase();
      return st == 'done' || st == 'archived' || st == 'past' || st == 'completed';
    }).length;

    final filterLabels = [
      'SEMUA (${allSchedules.length})',
      'LIVE ($liveCount)',
      'UPCOMING ($upcomingCount)',
      'SELESAI ($doneCount)',
    ];

    final filteredSchedules = allSchedules.where((s) {
      final statusLower = s.status.toLowerCase();
      if (_selectedFilterIndex == 1) return statusLower == 'live';
      if (_selectedFilterIndex == 2) return statusLower == 'upcoming';
      if (_selectedFilterIndex == 3) {
        return statusLower == 'done' || statusLower == 'archived' || statusLower == 'past' || statusLower == 'completed';
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: bgBase,
      appBar: AppBar(
        backgroundColor: bgNav,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SIARAN & PENJADWALAN',
              style: GoogleFonts.spaceMono(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: AppColors.accentCyan,
                letterSpacing: 1.2,
              ),
            ),
            Text(
              'Manajemen Jadwal',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: 44,
            height: 44,
            child: IconButton(
              tooltip: 'Segarkan Data',
              icon: Icon(LucideIcons.refresh_cw, size: 18, color: textSecondary),
              onPressed: () {
                HapticFeedback.lightImpact();
                ref.read(scheduleProvider.notifier).fetchSchedules();
              },
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary(isDark),
        elevation: 4,
        icon: Icon(LucideIcons.plus, color: isDark ? Colors.black : Colors.white, size: 18),
        label: Text(
          'Tambah Jadwal',
          style: GoogleFonts.spaceGrotesk(
            color: isDark ? Colors.black : Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
        onPressed: () {
          HapticFeedback.selectionClick();
          _showAddScheduleDialog(context);
        },
      ),
      body: Column(
        children: [
          // Header Mini Summary
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: bgNav,
            child: Row(
              children: [
                Expanded(
                  child: _buildMiniStat(
                    title: 'Siaran Aktif',
                    value: liveCount > 0 ? '$liveCount LIVE' : 'Tidak ada',
                    color: liveCount > 0 ? AppColors.accentRed : textSecondary,
                    isLive: liveCount > 0,
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStat(
                    title: 'Slot Terjadwal',
                    value: '$upcomingCount Sesi',
                    color: AppColors.primary(isDark),
                    isDark: isDark,
                  ),
                ),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(
                  child: _buildMiniStat(
                    title: 'Selesai',
                    value: '$doneCount Sesi',
                    color: AppColors.emerald(isDark),
                    isDark: isDark,
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // Filter Chips Bar
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: bgSurface,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: List.generate(filterLabels.length, (index) {
                  final isSelected = _selectedFilterIndex == index;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: SizedBox(
                      height: 38,
                      child: ChoiceChip(
                        label: Text(
                          filterLabels[index],
                          style: GoogleFonts.spaceMono(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? (isDark ? Colors.black : Colors.white) : textSecondary,
                          ),
                        ),
                        selected: isSelected,
                        selectedColor: AppColors.primary(isDark),
                        backgroundColor: bgInput,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(
                            color: isSelected ? AppColors.primary(isDark) : borderSubtle,
                            width: 1,
                          ),
                        ),
                        onSelected: (_) {
                          HapticFeedback.selectionClick();
                          setState(() => _selectedFilterIndex = index);
                        },
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // Schedule List / State Handler
          Expanded(
            child: scheduleState.isLoading && allSchedules.isEmpty
                ? _buildLoadingSkeleton(isDark)
                : scheduleState.error != null && allSchedules.isEmpty
                    ? _buildErrorState(context, scheduleState.error!, isDark)
                    : filteredSchedules.isEmpty
                        ? _buildEmptyState(context, isDark)
                        : RefreshIndicator(
                            onRefresh: () async {
                              HapticFeedback.lightImpact();
                              await ref.read(scheduleProvider.notifier).fetchSchedules();
                            },
                            color: AppColors.primary(isDark),
                            backgroundColor: bgSurface,
                            child: ListView.builder(
                              physics: const AlwaysScrollableScrollPhysics(
                                parent: BouncingScrollPhysics(),
                              ),
                              padding: const EdgeInsets.only(
                                left: 16,
                                right: 16,
                                top: 16,
                                bottom: 84,
                              ),
                              itemCount: filteredSchedules.length,
                              itemBuilder: (context, index) =>
                                  _buildScheduleCard(filteredSchedules[index], isDark),
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat({
    required String title,
    required String value,
    required Color color,
    bool isLive = false,
    required bool isDark,
  }) {
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    return Column(
      children: [
        Text(title, style: GoogleFonts.spaceMono(fontSize: 9, color: textMuted)),
        const SizedBox(height: 3),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isLive) ...[
              const _PulsingLiveDot(),
              const SizedBox(width: 5),
            ],
            Text(
              value,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLoadingSkeleton(bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 3,
      itemBuilder: (context, index) => Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bgSurface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderSubtle),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 80,
                  height: 20,
                  decoration: BoxDecoration(
                    color: bgInput,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                Container(
                  width: 60,
                  height: 20,
                  decoration: BoxDecoration(
                    color: bgInput,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              height: 18,
              decoration: BoxDecoration(
                color: bgInput,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: 140,
              height: 14,
              decoration: BoxDecoration(
                color: bgInput,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String error, bool isDark) {
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.accentRed.withValues(alpha: 0.12),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.accentRed.withValues(alpha: 0.3)),
              ),
              child: const Icon(LucideIcons.circle_alert, color: AppColors.accentRed, size: 36),
            ),
            const SizedBox(height: 14),
            Text(
              'Gagal Memuat Jadwal',
              style: GoogleFonts.spaceGrotesk(
                color: textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              error,
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceMono(color: textSecondary, fontSize: 11),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 44,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary(isDark),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(LucideIcons.rotate_cw, size: 16),
                label: Text(
                  'Coba Lagi',
                  style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.bold),
                ),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ref.read(scheduleProvider.notifier).fetchSchedules();
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    String emptyTitle = 'Belum Ada Jadwal Stream';
    String emptySub = 'Buat jadwal siaran baru agar audiens mendapatkan informasi live.';
    if (_selectedFilterIndex == 1) {
      emptyTitle = 'Tidak Ada Siaran LIVE';
      emptySub = 'Sedang tidak ada stream yang aktif saat ini.';
    } else if (_selectedFilterIndex == 2) {
      emptyTitle = 'Tidak Ada Sesi Mendatang';
      emptySub = 'Semua agenda siaran telah rampung atau belum dijadwalkan.';
    } else if (_selectedFilterIndex == 3) {
      emptyTitle = 'Belum Ada Arsip Selesai';
      emptySub = 'Daftar riwayat siaran yang sudah usai akan tampil di sini.';
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight,
                ),
              ),
              child: Icon(LucideIcons.calendar_x, color: textMuted, size: 40),
            ),
            const SizedBox(height: 16),
            Text(
              emptyTitle,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              emptySub,
              textAlign: TextAlign.center,
              style: GoogleFonts.spaceMono(fontSize: 11, color: textSecondary),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 44,
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: AppColors.primary(isDark)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                ),
                icon: Icon(LucideIcons.plus, size: 16, color: AppColors.primary(isDark)),
                label: Text(
                  'Buat Jadwal Baru',
                  style: GoogleFonts.spaceGrotesk(
                    color: AppColors.primary(isDark),
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
                onPressed: () {
                  HapticFeedback.selectionClick();
                  _showAddScheduleDialog(context);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScheduleCard(ScheduleModel schedule, bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    final statusLower = schedule.status.toLowerCase();

    switch (statusLower) {
      case 'live':
        statusColor = AppColors.accentRed;
        statusLabel = 'LIVE NOW';
        statusIcon = LucideIcons.radio;
        break;
      case 'done':
      case 'archived':
      case 'past':
      case 'completed':
        statusColor = AppColors.accentEmerald;
        statusLabel = 'SELESAI';
        statusIcon = LucideIcons.circle_check;
        break;
      default:
        statusColor = AppColors.accentPurple;
        statusLabel = 'UPCOMING';
        statusIcon = LucideIcons.clock;
    }

    final scheduledDate = schedule.scheduledAt ?? DateTime.now();
    final hasYoutubeUrl = schedule.youtubeUrl?.isNotEmpty == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: statusLower == 'live' ? AppColors.accentRed : borderSubtle,
          width: statusLower == 'live' ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.05),
            offset: const Offset(0, 3),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row: Status Badge, Platform, Edit, Delete
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusColor.withValues(alpha: 0.35)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (statusLower == 'live') ...[
                      const _PulsingLiveDot(),
                      const SizedBox(width: 5),
                    ] else ...[
                      Icon(statusIcon, color: statusColor, size: 12),
                      const SizedBox(width: 4),
                    ],
                    Text(
                      statusLabel,
                      style: GoogleFonts.spaceMono(
                        fontSize: 10,
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              Row(
                children: [
                  Icon(
                    schedule.streamPlatform.toLowerCase() == 'youtube'
                        ? LucideIcons.video
                        : LucideIcons.tv,
                    color: textSecondary,
                    size: 13,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    schedule.streamPlatform,
                    style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary),
                  ),
                  const SizedBox(width: 6),
                  // Touch Target 44x44 dp: Edit Button
                  SizedBox(
                    width: 44,
                    height: 44,
                    child: IconButton(
                      tooltip: 'Edit Jadwal',
                      icon: const Icon(LucideIcons.pencil, size: 16, color: AppColors.accentCyan),
                      onPressed: () {
                        HapticFeedback.selectionClick();
                        _showEditScheduleDialog(context, schedule);
                      },
                    ),
                  ),
                  // Touch Target 44x44 dp: Delete Button
                  SizedBox(
                    width: 44,
                    height: 44,
                    child: IconButton(
                      tooltip: 'Hapus Jadwal',
                      icon: Icon(LucideIcons.trash, size: 16, color: textMuted),
                      onPressed: () async {
                        HapticFeedback.lightImpact();
                        final bool? confirm = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: bgSurface,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: borderSubtle),
                            ),
                            title: Row(
                              children: [
                                const Icon(LucideIcons.triangle_alert, color: AppColors.accentRed, size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'Konfirmasi Hapus',
                                  style: GoogleFonts.spaceGrotesk(
                                    color: textPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                            content: Text(
                              'Apakah Anda yakin ingin menghapus jadwal ini?\n\n"${schedule.title}"',
                              style: GoogleFonts.spaceMono(
                                color: textSecondary,
                                fontSize: 12,
                              ),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, false);
                                },
                                child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.accentRed,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, true);
                                },
                                child: Text(
                                  'Ya, Hapus',
                                  style: GoogleFonts.spaceMono(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );

                        if (confirm == true && mounted) {
                          try {
                            await ref.read(scheduleProvider.notifier).deleteSchedule(schedule.id);
                            if (mounted) {
                              _showFloatingBanner(
                                context: context,
                                message: 'Jadwal berhasil dihapus',
                                isSuccess: true,
                              );
                            }
                          } catch (e) {
                            if (mounted) {
                              _showFloatingBanner(
                                context: context,
                                message: 'Gagal menghapus jadwal: $e',
                                isError: true,
                              );
                            }
                          }
                        }
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (schedule.thumbnailUrl?.isNotEmpty == true) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: _buildThumbnailDisplay(schedule.thumbnailUrl!),
              ),
            ),
          ],
          const SizedBox(height: 10),

          // Judul Stream
          Text(
            schedule.title,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: textPrimary,
            ),
          ),
          const SizedBox(height: 8),

          // Kategori & Tag
          Row(
            children: [
              const Icon(LucideIcons.gamepad_2, color: AppColors.accentGold, size: 14),
              const SizedBox(width: 6),
              Text(
                schedule.gameCategory?.isNotEmpty == true ? schedule.gameCategory! : 'General Stream',
                style: GoogleFonts.spaceMono(
                  fontSize: 11,
                  color: AppColors.accentGold,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Waktu Pelaksanaan
          Row(
            children: [
              Icon(LucideIcons.calendar, color: textSecondary, size: 13),
              const SizedBox(width: 6),
              Text(
                '${scheduledDate.day}/${scheduledDate.month}/${scheduledDate.year} ${_twoDigits(scheduledDate.hour)}:${_twoDigits(scheduledDate.minute)} WIB',
                style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary),
              ),
            ],
          ),

          // Deskripsi (opsional)
          if (schedule.description?.isNotEmpty == true) ...[
            const SizedBox(height: 8),
            Text(
              schedule.description!,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 12,
                color: textSecondary,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],

          // Collab Guest (opsional)
          if (schedule.collabGuest?.isNotEmpty == true) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(LucideIcons.users, color: AppColors.primary(isDark), size: 13),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Collab: ${schedule.collabGuest!}${schedule.collabSocial?.isNotEmpty == true ? " (${schedule.collabSocial})" : ""}',
                    style: GoogleFonts.spaceMono(
                      fontSize: 11,
                      color: AppColors.primary(isDark),
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],

          // Banner YouTube Link + Quick Utilities (Buka & Salin)
          if (hasYoutubeUrl) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: bgInput,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: borderSubtle),
              ),
              child: Row(
                children: [
                  const Icon(Icons.smart_display_rounded, color: AppColors.accentRed, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: InkWell(
                      onTap: () => _launchYouTubeUrl(context, schedule.youtubeUrl!),
                      child: Text(
                        schedule.youtubeUrl!,
                        style: GoogleFonts.spaceMono(
                          fontSize: 10,
                          color: AppColors.accentRed,
                          decoration: TextDecoration.underline,
                          decorationColor: AppColors.accentRed,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  // Utility 1: Touch Target 44x44 dp Salin Link
                  SizedBox(
                    width: 36,
                    height: 36,
                    child: IconButton(
                      tooltip: 'Salin Tautan YouTube',
                      padding: EdgeInsets.zero,
                      icon: Icon(LucideIcons.copy, size: 14, color: textSecondary),
                      onPressed: () => _copyToClipboard(
                        context,
                        schedule.youtubeUrl!,
                        'Tautan YouTube',
                      ),
                    ),
                  ),
                  // Utility 2: Touch Target 44x44 dp Buka Eksternal
                  SizedBox(
                    width: 36,
                    height: 36,
                    child: IconButton(
                      tooltip: 'Buka di YouTube',
                      padding: EdgeInsets.zero,
                      icon: const Icon(LucideIcons.external_link, size: 14, color: AppColors.accentRed),
                      onPressed: () => _launchYouTubeUrl(context, schedule.youtubeUrl!),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildYouTubeInputField({
    required TextEditingController youtubeController,
    required TextEditingController titleController,
    required void Function(void Function()) setModalState,
    required BuildContext modalContext,
    required bool isDark,
    void Function(String url)? onUrlChanged,
    void Function(String thumbUrl)? onThumbnailAutoFetched,
  }) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Row(
              children: [
                _buildSectionLabel('LINK STREAM YOUTUBE', isDark),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: AppColors.red(isDark).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'OPSIONAL',
                    style: GoogleFonts.spaceMono(
                      fontSize: 8.5,
                      fontWeight: FontWeight.bold,
                      color: AppColors.red(isDark),
                    ),
                  ),
                ),
              ],
            ),
            // Tombol Buka Aplikasi YouTube Android Utama (LaunchMode.externalApplication)
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => _openYouTubeMainApp(),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.red(isDark).withValues(alpha: isDark ? 0.16 : 0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: AppColors.red(isDark).withValues(alpha: 0.35),
                      width: 0.8,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.play, size: 12, color: AppColors.red(isDark)),
                      const SizedBox(width: 4),
                      Text(
                        'Buka YouTube',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 10.5,
                          fontWeight: FontWeight.bold,
                          color: AppColors.red(isDark),
                        ),
                      ),
                      const SizedBox(width: 3),
                      Icon(LucideIcons.external_link, size: 10, color: AppColors.red(isDark)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        TextField(
          controller: youtubeController,
          style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
          keyboardType: TextInputType.url,
          onChanged: (val) {
            setModalState(() {});
            if (onUrlChanged != null) onUrlChanged(val);
          },
          decoration: InputDecoration(
            hintText: 'https://youtube.com/live/... atau watch?v=...',
            hintStyle: GoogleFonts.spaceGrotesk(color: textMuted, fontSize: 12),
            filled: true,
            fillColor: bgInput,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: borderSubtle),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: borderSubtle),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: AppColors.primary(isDark), width: 1.2),
            ),
            prefixIcon: Padding(
              padding: const EdgeInsets.only(left: 12, right: 8),
              child: Icon(LucideIcons.video, size: 18, color: AppColors.red(isDark)),
            ),
            prefixIconConstraints: const BoxConstraints(minWidth: 38, minHeight: 38),
            suffixIcon: Padding(
              padding: const EdgeInsets.only(right: 6),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (youtubeController.text.isNotEmpty)
                    SizedBox(
                      width: 30,
                      height: 30,
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        tooltip: 'Hapus Link',
                        icon: Icon(LucideIcons.x, size: 16, color: textMuted),
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          setModalState(() {
                            youtubeController.clear();
                          });
                          if (onUrlChanged != null) onUrlChanged('');
                        },
                      ),
                    ),
                  // Fitur Pendamping Terbaik: Tombol Tempel Otomatis
                  InkWell(
                    onTap: () async {
                      final clip = await Clipboard.getData(Clipboard.kTextPlain);
                      final text = clip?.text?.trim();
                      if (text != null && text.isNotEmpty) {
                        HapticFeedback.selectionClick();
                        setModalState(() {
                          youtubeController.text = text;
                        });
                        if (onUrlChanged != null) onUrlChanged(text);
                        if (modalContext.mounted) {
                          _autoFetchTitleFromYouTube(
                            text,
                            titleController,
                            setModalState,
                            modalContext,
                            onThumbnailFetched: onThumbnailAutoFetched,
                          );
                        }
                      } else {
                        HapticFeedback.lightImpact();
                        if (modalContext.mounted) {
                          _showFloatingBanner(
                            context: modalContext,
                            message: 'Clipboard kosong! Salin link YouTube terlebih dahulu.',
                            isError: true,
                          );
                        }
                      }
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 5),
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.primary(isDark).withValues(alpha: isDark ? 0.2 : 0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: AppColors.primary(isDark).withValues(alpha: 0.4),
                          width: 0.9,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(LucideIcons.clipboard_paste, size: 13, color: AppColors.primary(isDark)),
                          const SizedBox(width: 4),
                          Text(
                            'Tempel',
                            style: GoogleFonts.spaceMono(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary(isDark),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  /// Kolom Thumbnail Cover dengan 3 Opsi: Auto YouTube, Upload File, Tautan Web
  Widget _buildThumbnailCoverSection({
    required BuildContext modalContext,
    required bool isDark,
    required String thumbnailMode, // 'youtube' | 'upload' | 'url'
    required String? thumbnailUrl,
    required String? uploadedFileName,
    required bool isImageProcessing,
    required TextEditingController webUrlController,
    required TextEditingController youtubeController,
    required void Function(void Function()) setModalState,
    required void Function(String mode) onModeChanged,
    required void Function(String? newUrl, String? fileName) onThumbnailChanged,
  }) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                _buildSectionLabel('THUMBNAIL COVER', isDark),
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: AppColors.primary(isDark).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '16:9 RASIO',
                    style: GoogleFonts.spaceMono(
                      fontSize: 8.5,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary(isDark),
                    ),
                  ),
                ),
              ],
            ),
            if (thumbnailUrl != null && thumbnailUrl.isNotEmpty)
              GestureDetector(
                onTap: () {
                  HapticFeedback.selectionClick();
                  onThumbnailChanged(null, null);
                },
                child: Row(
                  children: [
                    Icon(LucideIcons.trash, size: 11, color: AppColors.red(isDark)),
                    const SizedBox(width: 3),
                    Text(
                      'Hapus Cover',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.red(isDark),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),

        // 3-Segmented Mode Switcher: Auto YouTube | Upload File | Tautan Web
        Container(
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            color: bgInput,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: borderSubtle, width: 0.8),
          ),
          child: Row(
            children: [
              _buildThumbnailModeTab(
                label: 'Auto YouTube',
                icon: LucideIcons.play,
                mode: 'youtube',
                currentMode: thumbnailMode,
                isDark: isDark,
                onTap: () => onModeChanged('youtube'),
              ),
              _buildThumbnailModeTab(
                label: 'Upload File',
                icon: LucideIcons.upload,
                mode: 'upload',
                currentMode: thumbnailMode,
                isDark: isDark,
                onTap: () => onModeChanged('upload'),
              ),
              _buildThumbnailModeTab(
                label: 'Tautan Web',
                icon: LucideIcons.link_2,
                mode: 'url',
                currentMode: thumbnailMode,
                isDark: isDark,
                onTap: () => onModeChanged('url'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),

        // Mode Content
        if (thumbnailMode == 'youtube') ...[
          // Keterangan Auto YouTube
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: youtubeController.text.trim().isNotEmpty
                  ? AppColors.emerald(isDark).withValues(alpha: 0.1)
                  : AppColors.primary(isDark).withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: youtubeController.text.trim().isNotEmpty
                    ? AppColors.emerald(isDark).withValues(alpha: 0.3)
                    : AppColors.primary(isDark).withValues(alpha: 0.25),
                width: 0.8,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  youtubeController.text.trim().isNotEmpty
                      ? LucideIcons.circle_check
                      : LucideIcons.sparkles,
                  size: 14,
                  color: youtubeController.text.trim().isNotEmpty
                      ? AppColors.emerald(isDark)
                      : AppColors.primary(isDark),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    youtubeController.text.trim().isNotEmpty
                        ? 'Thumbnail cover otomatis terhubung dari video YouTube!'
                        : 'Cover akan otomatis terpasang saat URL YouTube diisi di atas.',
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 11,
                      color: textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ] else if (thumbnailMode == 'upload') ...[
          // Upload File from Gallery Button
          InkWell(
            onTap: isImageProcessing
                ? null
                : () {
                    HapticFeedback.selectionClick();
                    _pickAndCompressImage(
                      context: modalContext,
                      setLoading: (loading) => setModalState(() => isImageProcessing = loading),
                      onImagePicked: (dataUri, name) {
                        onThumbnailChanged(dataUri, name);
                      },
                    );
                  },
            borderRadius: BorderRadius.circular(10),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: bgInput,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: AppColors.primary(isDark).withValues(alpha: 0.4),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (isImageProcessing) ...[
                    SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(AppColors.primary(isDark)),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Mengompres gambar...',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 12,
                        color: textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ] else ...[
                    Icon(LucideIcons.image_plus, size: 16, color: AppColors.primary(isDark)),
                    const SizedBox(width: 8),
                    Text(
                      uploadedFileName != null && uploadedFileName.isNotEmpty
                          ? 'Ganti: $uploadedFileName'
                          : 'Pilih Gambar dari Galeri HP',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary(isDark),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ),
        ] else if (thumbnailMode == 'url') ...[
          // Tautan Web TextField with Paste Button
          TextField(
            controller: webUrlController,
            style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
            keyboardType: TextInputType.url,
            onChanged: (val) {
              onThumbnailChanged(val.trim().isEmpty ? null : val.trim(), null);
            },
            decoration: InputDecoration(
              hintText: 'https://example.com/cover.jpg',
              hintStyle: GoogleFonts.spaceGrotesk(color: textMuted, fontSize: 12),
              filled: true,
              fillColor: bgInput,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: borderSubtle),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: borderSubtle),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(color: AppColors.primary(isDark), width: 1.2),
              ),
              prefixIcon: Padding(
                padding: const EdgeInsets.only(left: 10, right: 6),
                child: Icon(LucideIcons.link_2, size: 16, color: AppColors.primary(isDark)),
              ),
              prefixIconConstraints: const BoxConstraints(minWidth: 34, minHeight: 34),
              suffixIcon: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (webUrlController.text.isNotEmpty)
                    SizedBox(
                      width: 28,
                      height: 28,
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        icon: Icon(LucideIcons.x, size: 14, color: textMuted),
                        onPressed: () {
                          HapticFeedback.selectionClick();
                          webUrlController.clear();
                          onThumbnailChanged(null, null);
                        },
                      ),
                    ),
                  InkWell(
                    onTap: () async {
                      final clip = await Clipboard.getData(Clipboard.kTextPlain);
                      final text = clip?.text?.trim();
                      if (text != null && text.isNotEmpty) {
                        HapticFeedback.selectionClick();
                        webUrlController.text = text;
                        onThumbnailChanged(text, null);
                      }
                    },
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      margin: const EdgeInsets.only(right: 6),
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary(isDark).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Tempel',
                        style: GoogleFonts.spaceMono(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary(isDark),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
        const SizedBox(height: 10),

        // 16:9 Aspect Ratio Preview Container
        if (thumbnailUrl != null && thumbnailUrl.isNotEmpty) ...[
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: borderSubtle, width: 1),
              color: Colors.black26,
            ),
            clipBehavior: Clip.antiAlias,
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  _buildThumbnailDisplay(thumbnailUrl),
                  // Bottom gradient overlay for readability of badge
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 36,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [
                            Colors.black.withValues(alpha: 0.7),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Source Badge (Bottom Left)
                  Positioned(
                    bottom: 6,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.75),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: Colors.white24,
                          width: 0.6,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            thumbnailMode == 'youtube'
                                ? LucideIcons.play
                                : (thumbnailMode == 'upload' ? LucideIcons.image : LucideIcons.globe),
                            size: 10,
                            color: thumbnailMode == 'youtube'
                                ? AppColors.red(isDark)
                                : AppColors.primary(isDark),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            thumbnailMode == 'youtube'
                                ? 'YouTube Auto'
                                : (thumbnailMode == 'upload' ? 'Upload Galeri' : 'Tautan Web'),
                            style: GoogleFonts.spaceMono(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Quick Remove Button (Top Right)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          onThumbnailChanged(null, null);
                        },
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          width: 26,
                          height: 26,
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.65),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white30, width: 0.6),
                          ),
                          child: const Icon(LucideIcons.x, size: 14, color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ] else ...[
          // Empty Placeholder
          Container(
            height: 95,
            width: double.infinity,
            decoration: BoxDecoration(
              color: bgInput.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: borderSubtle,
                style: BorderStyle.solid,
                width: 0.8,
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(LucideIcons.image, size: 22, color: textMuted.withValues(alpha: 0.6)),
                const SizedBox(height: 5),
                Text(
                  'Pratinjau Thumbnail Cover (16:9)',
                  style: GoogleFonts.spaceMono(
                    fontSize: 10,
                    color: textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildThumbnailModeTab({
    required String label,
    required IconData icon,
    required String mode,
    required String currentMode,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    final isSelected = currentMode == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          HapticFeedback.selectionClick();
          onTap();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: isSelected ? (isDark ? AppColors.bgSurface : Colors.white) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ]
                : null,
            border: isSelected
                ? Border.all(
                    color: AppColors.primary(isDark).withValues(alpha: 0.5),
                    width: 0.8,
                  )
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 12,
                color: isSelected
                    ? AppColors.primary(isDark)
                    : (isDark ? AppColors.textMuted : AppColors.textMutedLight),
              ),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  label,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10.5,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                    color: isSelected
                        ? (isDark ? AppColors.textPrimary : AppColors.textPrimaryLight)
                        : (isDark ? AppColors.textMuted : AppColors.textMutedLight),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // HELPERS INPUT
  InputDecoration _inputDecoration(String hint, bool isDark) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.spaceGrotesk(color: textMuted),
      filled: true,
      fillColor: bgInput,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
    );
  }

  Widget _buildSectionLabel(String label, bool isDark) {
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    return Text(
      label,
      style: GoogleFonts.spaceMono(
        fontSize: 10,
        color: textSecondary,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildDatePicker(BuildContext context, DateTime selectedDate, Function(DateTime) onPick, bool isDark) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    return InkWell(
      onTap: () async {
        HapticFeedback.selectionClick();
        final picked = await showDatePicker(
          context: context,
          initialDate: selectedDate,
          firstDate: DateTime(2024),
          lastDate: DateTime(2030),
        );
        if (picked != null) onPick(picked);
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${_twoDigits(selectedDate.day)}/${_twoDigits(selectedDate.month)}/${selectedDate.year}',
              style: GoogleFonts.spaceMono(color: textPrimary, fontSize: 12),
            ),
            Icon(LucideIcons.calendar, size: 16, color: textMuted),
          ],
        ),
      ),
    );
  }

  Widget _buildTimePicker(BuildContext context, TimeOfDay selectedTime, Function(TimeOfDay) onPick, bool isDark) {
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;

    return InkWell(
      onTap: () async {
        HapticFeedback.selectionClick();
        final picked = await showTimePicker(context: context, initialTime: selectedTime);
        if (picked != null) onPick(picked);
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${_twoDigits(selectedTime.hour)}:${_twoDigits(selectedTime.minute)}',
              style: GoogleFonts.spaceMono(color: textPrimary, fontSize: 12),
            ),
            Icon(LucideIcons.clock, size: 16, color: textMuted),
          ],
        ),
      ),
    );
  }

  // TAMBAH JADWAL MODAL
  void _showAddScheduleDialog(BuildContext context) {
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    final youtubeController = TextEditingController();
    final webUrlController = TextEditingController();
    final collabGuestController = TextEditingController();
    final collabSocialController = TextEditingController();

    String thumbnailMode = 'youtube'; // 'youtube' | 'upload' | 'url'
    String? thumbnailUrl;
    String? uploadedFileName;
    bool isImageProcessing = false;

    String? selectedCategory;
    DateTime selectedDate = DateTime.now().add(const Duration(hours: 2));
    TimeOfDay selectedTime = TimeOfDay(hour: selectedDate.hour, minute: selectedDate.minute);
    bool countdownEnabled = true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        final isDark = Theme.of(modalContext).brightness == Brightness.dark;
        final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
        final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
        final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
        final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
        final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
        final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

        return StatefulBuilder(
          builder: (modalContext, setModalState) => Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              border: Border.all(color: borderSubtle, width: 1),
            ),
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 16,
              bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle Bar
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: borderSubtle,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('MODIFIKASI JADWAL',
                              style: GoogleFonts.spaceMono(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.accentCyan)),
                          Text('Tambah Jadwal Baru',
                              style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: textPrimary)),
                        ],
                      ),
                      SizedBox(
                        width: 44,
                        height: 44,
                        child: IconButton(
                          icon: Icon(LucideIcons.x, color: textMuted),
                          onPressed: () => Navigator.pop(modalContext),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // 1. YouTube URL di paling atas dengan tombol Buka YouTube App & Paste Otomatis
                  _buildYouTubeInputField(
                    youtubeController: youtubeController,
                    titleController: titleController,
                    setModalState: setModalState,
                    modalContext: modalContext,
                    isDark: isDark,
                    onUrlChanged: (url) {
                      if (thumbnailMode == 'youtube') {
                        setModalState(() {
                          thumbnailUrl = _extractYouTubeThumbnail(url);
                        });
                      }
                    },
                    onThumbnailAutoFetched: (fetchedThumb) {
                      if (thumbnailMode == 'youtube') {
                        setModalState(() {
                          thumbnailUrl = fetchedThumb;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 14),

                  // 2. Kolom Thumbnail Cover (3 Opsi: Auto YouTube, Upload File, Tautan Web)
                  _buildThumbnailCoverSection(
                    modalContext: modalContext,
                    isDark: isDark,
                    thumbnailMode: thumbnailMode,
                    thumbnailUrl: thumbnailUrl,
                    uploadedFileName: uploadedFileName,
                    isImageProcessing: isImageProcessing,
                    webUrlController: webUrlController,
                    youtubeController: youtubeController,
                    setModalState: setModalState,
                    onModeChanged: (newMode) {
                      setModalState(() {
                        thumbnailMode = newMode;
                        if (newMode == 'youtube') {
                          thumbnailUrl = _extractYouTubeThumbnail(youtubeController.text.trim());
                        } else if (newMode == 'url') {
                          thumbnailUrl = webUrlController.text.trim().isEmpty ? null : webUrlController.text.trim();
                        }
                      });
                    },
                    onThumbnailChanged: (newUrl, fileName) {
                      setModalState(() {
                        thumbnailUrl = newUrl;
                        uploadedFileName = fileName;
                        if (thumbnailMode == 'url') {
                          webUrlController.text = newUrl ?? '';
                        }
                      });
                    },
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('JUDUL STREAM', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: titleController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Judul stream...', isDark),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('KATEGORI GAME', isDark),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: selectedCategory,
                    dropdownColor: bgInput,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    hint: Text('Pilih kategori...', style: GoogleFonts.spaceGrotesk(color: textMuted)),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: bgInput,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    items: _categories.map((cat) => DropdownMenuItem(value: cat, child: Text(cat))).toList(),
                    onChanged: (val) => setModalState(() => selectedCategory = val),
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionLabel('TANGGAL', isDark),
                            const SizedBox(height: 6),
                            _buildDatePicker(modalContext, selectedDate, (d) => setModalState(() => selectedDate = d), isDark),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionLabel('WAKTU (WIB)', isDark),
                            const SizedBox(height: 6),
                            _buildTimePicker(modalContext, selectedTime, (t) => setModalState(() => selectedTime = t), isDark),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('DESKRIPSI', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: descriptionController,
                    maxLines: 2,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Deskripsi stream...', isDark),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('KOLABORASI / GUEST (OPSIONAL)', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: collabGuestController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Nama Guest / VTuber (contoh: Kobo Kanaeru)', isDark),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: collabSocialController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Handle / Akun Sosial (contoh: @kobokanaeru)', isDark),
                  ),
                  const SizedBox(height: 14),

                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Hitung Mundur Fansite',
                                style: GoogleFonts.spaceGrotesk(color: textPrimary, fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('Sinkronisasi banner publik portal',
                                style: GoogleFonts.spaceMono(color: textMuted, fontSize: 10)),
                          ],
                        ),
                        Switch(
                          value: countdownEnabled,
                          activeThumbColor: AppColors.primary(isDark),
                          onChanged: (val) {
                            HapticFeedback.selectionClick();
                            setModalState(() => countdownEnabled = val);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary(isDark),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () async {
                        final title = titleController.text.trim();
                        if (title.isEmpty) {
                          _showFloatingBanner(
                            context: context,
                            message: 'Judul jadwal stream wajib diisi!',
                            isError: true,
                          );
                          return;
                        }

                        HapticFeedback.lightImpact();
                        final bool? confirmSave = await showDialog<bool>(
                          context: modalContext,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: bgSurface,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: borderSubtle),
                            ),
                            title: Row(
                              children: [
                                Icon(LucideIcons.calendar, color: AppColors.primary(isDark), size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'Konfirmasi Simpan',
                                  style: GoogleFonts.spaceGrotesk(
                                    color: textPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                            content: Text(
                              'Apakah Anda yakin ingin menyimpan jadwal stream ini?\n\n"$title"',
                              style: GoogleFonts.spaceMono(color: textSecondary, fontSize: 12),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, false);
                                },
                                child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary(isDark),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, true);
                                },
                                child: Text(
                                  'Ya, Simpan',
                                  style: GoogleFonts.spaceMono(color: Colors.black, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        );

                        if (confirmSave != true) return;

                        final fullScheduledAt = DateTime(
                          selectedDate.year,
                          selectedDate.month,
                          selectedDate.day,
                          selectedTime.hour,
                          selectedTime.minute,
                        );

                        final newSchedule = ScheduleModel(
                          id: 0,
                          userId: 0,
                          title: title,
                          gameCategory: selectedCategory ?? 'Lainnya',
                          scheduledAt: fullScheduledAt,
                          description: descriptionController.text.trim().isEmpty
                              ? null
                              : descriptionController.text.trim(),
                          youtubeUrl: youtubeController.text.trim().isEmpty
                              ? null
                              : youtubeController.text.trim(),
                          thumbnailUrl: thumbnailUrl?.trim().isEmpty == true
                              ? null
                              : thumbnailUrl?.trim(),
                          streamPlatform: 'YouTube',
                          countdownEnabled: countdownEnabled,
                          status: 'upcoming',
                          collabGuest: collabGuestController.text.trim().isEmpty ? null : collabGuestController.text.trim(),
                          collabSocial: collabSocialController.text.trim().isEmpty ? null : collabSocialController.text.trim(),
                        );

                        if (modalContext.mounted) {
                          Navigator.pop(modalContext);
                        }

                        try {
                          await ref.read(scheduleProvider.notifier).addSchedule(newSchedule);
                          if (context.mounted) {
                            _showFloatingBanner(
                              context: context,
                              message: 'Jadwal berhasil disimpan & disinkronkan!',
                              isSuccess: true,
                            );
                          }
                        } catch (e) {
                          if (context.mounted) {
                            _showFloatingBanner(
                              context: context,
                              message: 'Gagal menambah jadwal: $e',
                              isError: true,
                            );
                          }
                        }
                      },
                      child: Text(
                        '✓ Simpan Jadwal',
                        style: GoogleFonts.spaceGrotesk(
                          color: isDark ? Colors.black : Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // EDIT JADWAL MODAL
  void _showEditScheduleDialog(BuildContext context, ScheduleModel schedule) {
    final titleController = TextEditingController(text: schedule.title);
    final descriptionController = TextEditingController(text: schedule.description ?? '');
    final youtubeController = TextEditingController(text: schedule.youtubeUrl ?? '');
    final collabGuestController = TextEditingController(text: schedule.collabGuest ?? '');
    final collabSocialController = TextEditingController(text: schedule.collabSocial ?? '');

    String initialMode = 'youtube';
    if (schedule.thumbnailUrl?.startsWith('data:image') == true) {
      initialMode = 'upload';
    } else if (schedule.thumbnailUrl != null &&
        (schedule.thumbnailUrl!.contains('youtube.com') || schedule.thumbnailUrl!.contains('ytimg.com'))) {
      initialMode = 'youtube';
    } else if (schedule.thumbnailUrl != null && schedule.thumbnailUrl!.isNotEmpty) {
      initialMode = 'url';
    }

    String thumbnailMode = initialMode;
    String? thumbnailUrl = schedule.thumbnailUrl;
    String? uploadedFileName = initialMode == 'upload' ? 'Gambar Tersimpan' : null;
    bool isImageProcessing = false;
    final webUrlController = TextEditingController(
      text: initialMode == 'url' ? (schedule.thumbnailUrl ?? '') : '',
    );

    String? selectedCategory = schedule.gameCategory;
    final initDate = schedule.scheduledAt ?? DateTime.now().add(const Duration(hours: 1));
    DateTime selectedDate = DateTime(initDate.year, initDate.month, initDate.day);
    TimeOfDay selectedTime = TimeOfDay(hour: initDate.hour, minute: initDate.minute);
    bool countdownEnabled = schedule.countdownEnabled;
    String selectedStatus = schedule.status.toLowerCase();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        final isDark = Theme.of(modalContext).brightness == Brightness.dark;
        final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
        final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
        final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
        final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
        final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
        final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

        return StatefulBuilder(
          builder: (modalContext, setModalState) => Container(
            decoration: BoxDecoration(
              color: bgSurface,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              border: Border.all(color: borderSubtle, width: 1),
            ),
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 16,
              bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle Bar
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 16),
                      decoration: BoxDecoration(
                        color: borderSubtle,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('MODIFIKASI JADWAL',
                              style: GoogleFonts.spaceMono(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.accentCyan)),
                          Text('Edit Jadwal Stream',
                              style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: textPrimary)),
                        ],
                      ),
                      SizedBox(
                        width: 44,
                        height: 44,
                        child: IconButton(
                          icon: Icon(LucideIcons.x, color: textMuted),
                          onPressed: () => Navigator.pop(modalContext),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // 1. YouTube URL di paling atas dengan tombol Buka YouTube App & Paste Otomatis
                  _buildYouTubeInputField(
                    youtubeController: youtubeController,
                    titleController: titleController,
                    setModalState: setModalState,
                    modalContext: modalContext,
                    isDark: isDark,
                    onUrlChanged: (url) {
                      if (thumbnailMode == 'youtube') {
                        setModalState(() {
                          thumbnailUrl = _extractYouTubeThumbnail(url);
                        });
                      }
                    },
                    onThumbnailAutoFetched: (fetchedThumb) {
                      if (thumbnailMode == 'youtube') {
                        setModalState(() {
                          thumbnailUrl = fetchedThumb;
                        });
                      }
                    },
                  ),
                  const SizedBox(height: 14),

                  // 2. Kolom Thumbnail Cover (3 Opsi: Auto YouTube, Upload File, Tautan Web)
                  _buildThumbnailCoverSection(
                    modalContext: modalContext,
                    isDark: isDark,
                    thumbnailMode: thumbnailMode,
                    thumbnailUrl: thumbnailUrl,
                    uploadedFileName: uploadedFileName,
                    isImageProcessing: isImageProcessing,
                    webUrlController: webUrlController,
                    youtubeController: youtubeController,
                    setModalState: setModalState,
                    onModeChanged: (newMode) {
                      setModalState(() {
                        thumbnailMode = newMode;
                        if (newMode == 'youtube') {
                          thumbnailUrl = _extractYouTubeThumbnail(youtubeController.text.trim());
                        } else if (newMode == 'url') {
                          thumbnailUrl = webUrlController.text.trim().isEmpty ? null : webUrlController.text.trim();
                        }
                      });
                    },
                    onThumbnailChanged: (newUrl, fileName) {
                      setModalState(() {
                        thumbnailUrl = newUrl;
                        uploadedFileName = fileName;
                        if (thumbnailMode == 'url') {
                          webUrlController.text = newUrl ?? '';
                        }
                      });
                    },
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('JUDUL STREAM', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: titleController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Judul stream...', isDark),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('KATEGORI GAME', isDark),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _categories.contains(selectedCategory) ? selectedCategory : null,
                    dropdownColor: bgInput,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    hint: Text('Pilih kategori...', style: GoogleFonts.spaceGrotesk(color: textMuted)),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: bgInput,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    items: _categories.map((cat) => DropdownMenuItem(value: cat, child: Text(cat))).toList(),
                    onChanged: (val) => setModalState(() => selectedCategory = val),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('STATUS STREAM', isDark),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: _statuses.contains(selectedStatus) ? selectedStatus : 'upcoming',
                    dropdownColor: bgInput,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: bgInput,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    items: [
                      DropdownMenuItem(value: 'upcoming', child: Text('Upcoming', style: GoogleFonts.spaceGrotesk(color: AppColors.accentPurple))),
                      DropdownMenuItem(value: 'live', child: Text('Live Now', style: GoogleFonts.spaceGrotesk(color: AppColors.accentRed))),
                      DropdownMenuItem(value: 'done', child: Text('Selesai (Done)', style: GoogleFonts.spaceGrotesk(color: AppColors.accentEmerald))),
                    ],
                    onChanged: (val) => setModalState(() => selectedStatus = val ?? 'upcoming'),
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionLabel('TANGGAL', isDark),
                            const SizedBox(height: 6),
                            _buildDatePicker(modalContext, selectedDate, (d) => setModalState(() => selectedDate = d), isDark),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildSectionLabel('WAKTU (WIB)', isDark),
                            const SizedBox(height: 6),
                            _buildTimePicker(modalContext, selectedTime, (t) => setModalState(() => selectedTime = t), isDark),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('DESKRIPSI', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: descriptionController,
                    maxLines: 2,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Deskripsi stream...', isDark),
                  ),
                  const SizedBox(height: 14),

                  _buildSectionLabel('KOLABORASI / GUEST (OPSIONAL)', isDark),
                  const SizedBox(height: 6),
                  TextField(
                    controller: collabGuestController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Nama Guest / VTuber (contoh: Kobo Kanaeru)', isDark),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: collabSocialController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: _inputDecoration('Handle / Akun Sosial (contoh: @kobokanaeru)', isDark),
                  ),
                  const SizedBox(height: 14),

                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Hitung Mundur Fansite',
                                style: GoogleFonts.spaceGrotesk(color: textPrimary, fontWeight: FontWeight.bold, fontSize: 13)),
                            Text('Sinkronisasi banner publik portal',
                                style: GoogleFonts.spaceMono(color: textMuted, fontSize: 10)),
                          ],
                        ),
                        Switch(
                          value: countdownEnabled,
                          activeThumbColor: AppColors.primary(isDark),
                          onChanged: (val) {
                            HapticFeedback.selectionClick();
                            setModalState(() => countdownEnabled = val);
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary(isDark),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () async {
                        final title = titleController.text.trim();
                        if (title.isEmpty) {
                          _showFloatingBanner(
                            context: context,
                            message: 'Judul jadwal stream wajib diisi!',
                            isError: true,
                          );
                          return;
                        }

                        HapticFeedback.lightImpact();
                        final bool? confirmSave = await showDialog<bool>(
                          context: modalContext,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: bgSurface,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(color: borderSubtle),
                            ),
                            title: Row(
                              children: [
                                Icon(LucideIcons.pencil, color: AppColors.primary(isDark), size: 20),
                                const SizedBox(width: 8),
                                Text(
                                  'Konfirmasi Simpan Perubahan',
                                  style: GoogleFonts.spaceGrotesk(
                                    color: textPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                            content: Text(
                              'Apakah Anda yakin ingin menyimpan perubahan pada jadwal ini?\n\n"$title"',
                              style: GoogleFonts.spaceMono(color: textSecondary, fontSize: 12),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, false);
                                },
                                child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted)),
                              ),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary(isDark),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, true);
                                },
                                child: Text(
                                  'Ya, Simpan',
                                  style: GoogleFonts.spaceMono(color: Colors.black, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        );

                        if (confirmSave != true) return;

                        final fullScheduledAt = DateTime(
                          selectedDate.year,
                          selectedDate.month,
                          selectedDate.day,
                          selectedTime.hour,
                          selectedTime.minute,
                        );

                        final updates = {
                          'title': title,
                          'game_category': selectedCategory ?? schedule.gameCategory,
                          'scheduled_at': fullScheduledAt.toIso8601String(),
                          'description': descriptionController.text.trim().isEmpty
                              ? null
                              : descriptionController.text.trim(),
                          'youtube_url': youtubeController.text.trim().isEmpty
                              ? null
                              : youtubeController.text.trim(),
                          'thumbnail_url': thumbnailUrl?.trim().isEmpty == true
                              ? null
                              : thumbnailUrl?.trim(),
                          'countdown_enabled': countdownEnabled ? 1 : 0,
                          'status': selectedStatus,
                          'collab_guest': collabGuestController.text.trim().isEmpty ? null : collabGuestController.text.trim(),
                          'collab_social': collabSocialController.text.trim().isEmpty ? null : collabSocialController.text.trim(),
                        };

                        if (modalContext.mounted) {
                          Navigator.pop(modalContext);
                        }

                        try {
                          await ref.read(scheduleProvider.notifier).updateSchedule(schedule.id, updates);
                          if (context.mounted) {
                            _showFloatingBanner(
                              context: context,
                              message: 'Jadwal berhasil diperbarui!',
                              isSuccess: true,
                            );
                          }
                        } catch (e) {
                          if (context.mounted) {
                            _showFloatingBanner(
                              context: context,
                              message: 'Gagal memperbarui jadwal: $e',
                              isError: true,
                            );
                          }
                        }
                      },
                      child: Text(
                        '✓ Simpan Perubahan',
                        style: GoogleFonts.spaceGrotesk(
                          color: isDark ? Colors.black : Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String _twoDigits(int n) => n.toString().padLeft(2, '0');
}

/// Widget dot berdenyut halus (pulsing) khusus saat siaran LIVE
class _PulsingLiveDot extends StatefulWidget {
  const _PulsingLiveDot();

  @override
  State<_PulsingLiveDot> createState() => _PulsingLiveDotState();
}

class _PulsingLiveDotState extends State<_PulsingLiveDot> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.35, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: AppColors.accentRed.withValues(alpha: _animation.value),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.accentRed.withValues(alpha: _animation.value * 0.6),
                blurRadius: 4,
                spreadRadius: 1,
              ),
            ],
          ),
        );
      },
    );
  }
}
