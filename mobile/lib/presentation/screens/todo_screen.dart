import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/todo_model.dart';
import '../providers/todo_provider.dart';

String _twoDigits(int value) => value.toString().padLeft(2, '0');

class TodoScreen extends ConsumerStatefulWidget {
  const TodoScreen({super.key});

  @override
  ConsumerState<TodoScreen> createState() => _TodoScreenState();
}

class _TodoScreenState extends ConsumerState<TodoScreen> {
  int _selectedStatusIndex = 0;
  final List<String> _statusFilters = ['Semua', 'Pending', 'Dikerjakan', 'Selesai'];

  String _selectedCategory = 'Semua Kategori';
  final List<String> _categories = [
    'Semua Kategori',
    'Stream & Jadwal',
    'Konten & Video',
    'Aset & Teknis',
    'Sosmed & Komunitas',
    'Umum & Evaluasi',
  ];

  final List<String> _priorities = ['low', 'medium', 'high', 'urgent'];

  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Floating SnackBar / Toast Helper yang modern, rounded, dan taktil
  void _showFloatingToast({
    required String message,
    required bool isSuccess,
    IconData? icon,
  }) {
    if (!mounted) return;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;

    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        elevation: 6,
        backgroundColor: bgSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: isSuccess
                ? AppColors.accentEmerald.withValues(alpha: 0.6)
                : AppColors.accentRed.withValues(alpha: 0.6),
            width: 1.2,
          ),
        ),
        margin: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        duration: const Duration(seconds: 3),
        content: Row(
          children: [
            Icon(
              icon ?? (isSuccess ? LucideIcons.circle_check : LucideIcons.circle_alert),
              color: isSuccess ? AppColors.accentEmerald : AppColors.accentRed,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: textPrimary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _isOverdue(TodoModel task) {
    if (task.isCompleted || task.deadline == null) return false;
    return task.deadline!.isBefore(DateTime.now());
  }

  String _getOverdueText(DateTime deadline) {
    final diff = DateTime.now().difference(deadline);
    if (diff.inDays > 0) return 'Terlambat ${diff.inDays} hari';
    if (diff.inHours > 0) return 'Terlambat ${diff.inHours} jam';
    return 'Batas waktu terlewat';
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Stream & Jadwal':
        return AppColors.accentEmerald;
      case 'Konten & Video':
        return AppColors.accentPurple;
      case 'Aset & Teknis':
        return AppColors.accentCyan;
      case 'Sosmed & Komunitas':
        return AppColors.accentPurple;
      case 'Umum & Evaluasi':
        return AppColors.accentGold;
      default:
        return AppColors.accentCyan;
    }
  }

  String _getTaskCategory(TodoModel task) {
    for (final tag in task.tags) {
      if (_categories.contains(tag)) return tag;
    }
    return 'Umum & Evaluasi';
  }

  @override
  Widget build(BuildContext context) {
    final todoState = ref.watch(todoProvider);
    final allTodos = todoState.todos;

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgBase = isDark ? AppColors.bgBase : AppColors.bgBaseLight;
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final bgInput = isDark ? AppColors.bgInput : AppColors.bgInputLight;
    final bgNav = isDark ? AppColors.bgNav : AppColors.bgNavLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    // Metrik Counter
    final totalCount = allTodos.length;
    final pendingCount = allTodos.where((t) => t.status == 'pending').length;
    final inProgressCount = allTodos.where((t) => t.status == 'in_progress').length;
    final completedCount = allTodos.where((t) => t.isCompleted).length;
    final overdueCount = allTodos.where(_isOverdue).length;

    final progressRatio = totalCount > 0 ? (completedCount / totalCount) : 0.0;
    final progressPercent = (progressRatio * 100).toInt();

    // Filter Task
    final filteredTodos = allTodos.where((task) {
      // 1. Status Filter
      if (_selectedStatusIndex == 1 && task.status != 'pending') return false;
      if (_selectedStatusIndex == 2 && task.status != 'in_progress') return false;
      if (_selectedStatusIndex == 3 && !task.isCompleted) return false;

      // 2. Category Filter
      if (_selectedCategory != 'Semua Kategori') {
        final taskCategory = _getTaskCategory(task);
        if (taskCategory != _selectedCategory) return false;
      }

      // 3. Search Query
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final matchTitle = task.title.toLowerCase().contains(query);
        final matchDesc = task.description?.toLowerCase().contains(query) ?? false;
        final matchResource = task.resourceInfo?.toLowerCase().contains(query) ?? false;
        if (!matchTitle && !matchDesc && !matchResource) return false;
      }

      return true;
    }).toList();

    return Scaffold(
      backgroundColor: bgBase,
      appBar: AppBar(
        backgroundColor: bgNav,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: borderSubtle, height: 1),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'CHECKLIST & OPERASIONAL',
              style: GoogleFonts.spaceMono(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: AppColors.primary(isDark),
                letterSpacing: 1.2,
              ),
            ),
            Text(
              'Todo List',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
          ],
        ),
        actions: [
          // Touch Target 44x44 dp: Refresh Button
          SizedBox(
            width: 44,
            height: 44,
            child: IconButton(
              tooltip: 'Segarkan Todo',
              icon: Icon(LucideIcons.refresh_cw, size: 18, color: textSecondary),
              onPressed: () {
                HapticFeedback.lightImpact();
                ref.read(todoProvider.notifier).fetchTodos();
                _showFloatingToast(
                  message: 'Daftar todo berhasil diperbarui',
                  isSuccess: true,
                  icon: LucideIcons.refresh_cw,
                );
              },
            ),
          ),
          const SizedBox(width: 6),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary(isDark),
        elevation: 4,
        icon: Icon(LucideIcons.plus, color: isDark ? Colors.black : Colors.white, size: 18),
        label: Text(
          'Tambah Todo',
          style: GoogleFonts.spaceGrotesk(
            color: isDark ? Colors.black : Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
        ),
        onPressed: () => _showTodoFormModal(context),
      ),
      body: Column(
        children: [
          // 1. Metric Stats Row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            color: bgNav,
            child: Row(
              children: [
                Expanded(child: _buildMiniStatItem('TOTAL', '$totalCount', textPrimary, isDark)),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(child: _buildMiniStatItem('PENDING', '$pendingCount', AppColors.gold(isDark), isDark)),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(child: _buildMiniStatItem('PROGRES', '$inProgressCount', AppColors.secondary(isDark), isDark)),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(child: _buildMiniStatItem('SELESAI', '$completedCount', AppColors.emerald(isDark), isDark)),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(child: _buildMiniStatItem('TERLAMBAT', '$overdueCount', AppColors.red(isDark), isDark)),
              ],
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // 2. Progress Penyelesaian Bar (Halus Beranimasi)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: bgSurface,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(LucideIcons.trending_up, size: 14, color: AppColors.primary(isDark)),
                        const SizedBox(width: 6),
                        Text(
                          'Progres Penyelesaian',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: textPrimary,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      '$completedCount dari $totalCount tugas selesai ($progressPercent%)',
                      style: GoogleFonts.spaceMono(
                        fontSize: 10,
                        color: textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  height: 6,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: bgInput,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: progressRatio.clamp(0.0, 1.0),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(4),
                        gradient: LinearGradient(
                          colors: progressPercent == 100
                              ? [AppColors.accentEmerald, AppColors.accentCyan]
                              : [AppColors.accentCyan, AppColors.accentPurple],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // 3. Search Field & Status Filter Tab
          Container(
            padding: const EdgeInsets.all(12),
            color: bgSurface,
            child: Column(
              children: [
                // Search Field dengan Clear Button X Min 44x44 dp
                Container(
                  decoration: BoxDecoration(
                    color: bgInput,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: borderSubtle),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _searchQuery = val.trim()),
                    style: GoogleFonts.spaceGrotesk(fontSize: 13, color: textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Cari tugas, deskripsi, referensi...',
                      hintStyle: GoogleFonts.spaceGrotesk(fontSize: 12, color: textMuted),
                      prefixIcon: Icon(LucideIcons.search, size: 16, color: textMuted),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? SizedBox(
                              width: 44,
                              height: 44,
                              child: IconButton(
                                icon: Icon(LucideIcons.x, size: 16, color: textMuted),
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
                                },
                              ),
                            )
                          : null,
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Status Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: List.generate(_statusFilters.length, (index) {
                      final isSelected = _selectedStatusIndex == index;
                      int badgeCount = totalCount;
                      if (index == 1) badgeCount = pendingCount;
                      if (index == 2) badgeCount = inProgressCount;
                      if (index == 3) badgeCount = completedCount;

                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: FilterChip(
                          showCheckmark: false,
                          label: Text(
                            '${_statusFilters[index]} ($badgeCount)',
                            style: GoogleFonts.spaceMono(
                              fontSize: 10,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              color: isSelected ? (isDark ? Colors.black : Colors.white) : textSecondary,
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: AppColors.primary(isDark),
                          backgroundColor: bgInput,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: BorderSide(
                              color: isSelected
                                  ? (AppColors.primary(isDark))
                                  : borderSubtle,
                            ),
                          ),
                          onSelected: (_) {
                            HapticFeedback.selectionClick();
                            setState(() => _selectedStatusIndex = index);
                          },
                        ),
                      );
                    }),
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // 4. Kategori Filter Chips Horizontal
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            color: bgNav,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _categories.map((category) {
                  final isSelected = _selectedCategory == category;
                  final categoryColor = _getCategoryColor(category);

                  int count;
                  if (category == 'Semua Kategori') {
                    count = totalCount;
                  } else {
                    count = allTodos.where((t) => _getTaskCategory(t) == category).length;
                  }

                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: InkWell(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        setState(() => _selectedCategory = category);
                      },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: isSelected ? categoryColor.withValues(alpha: 0.18) : bgInput,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? categoryColor : borderSubtle,
                            width: isSelected ? 1.2 : 1.0,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (category != 'Semua Kategori') ...[
                              Container(
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: categoryColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                            ],
                            Text(
                              '$category ($count)',
                              style: GoogleFonts.spaceGrotesk(
                                fontSize: 10,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                color: isSelected ? textPrimary : textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // 5. Todo List View
          Expanded(
            child: todoState.isLoading && allTodos.isEmpty
                ? Center(child: CircularProgressIndicator(color: AppColors.primary(isDark)))
                : todoState.error != null && allTodos.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(LucideIcons.circle_alert, color: AppColors.accentRed, size: 40),
                              const SizedBox(height: 12),
                              Text(
                                'Gagal mengambil data task',
                                style: GoogleFonts.spaceGrotesk(
                                  color: textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.primary(isDark),
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                icon: Icon(LucideIcons.refresh_cw, size: 16, color: isDark ? Colors.black : Colors.white),
                                onPressed: () {
                                  HapticFeedback.lightImpact();
                                  ref.read(todoProvider.notifier).fetchTodos();
                                },
                                label: Text('Coba Lagi',
                                    style: GoogleFonts.spaceGrotesk(
                                      color: Colors.black,
                                      fontWeight: FontWeight.bold,
                                    )),
                              ),
                            ],
                          ),
                        ),
                      )
                    : filteredTodos.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(LucideIcons.check_check, color: textMuted, size: 48),
                                  const SizedBox(height: 14),
                                  Text(
                                    'Semua task sudah terselesaikan!',
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Tidak ada task pada filter atau kategori aktif saat ini.',
                                    style: GoogleFonts.spaceGrotesk(
                                      fontSize: 12,
                                      color: textMuted,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () async {
                              HapticFeedback.lightImpact();
                              await ref.read(todoProvider.notifier).fetchTodos();
                              if (mounted) {
                                _showFloatingToast(
                                  message: 'Daftar todo disinkronkan',
                                  isSuccess: true,
                                  icon: LucideIcons.check_check,
                                );
                              }
                            },
                            color: AppColors.accentCyan,
                            child: ListView.builder(
                              padding: const EdgeInsets.only(left: 16, right: 16, top: 14, bottom: 84),
                              itemCount: filteredTodos.length,
                              itemBuilder: (context, index) {
                                final task = filteredTodos[index];
                                return _buildTodoCard(task, isDark);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStatItem(String title, String value, Color color, bool isDark) {
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    return Column(
      children: [
        Text(title, style: GoogleFonts.spaceMono(fontSize: 8.5, color: textMuted, letterSpacing: 0.5)),
        const SizedBox(height: 3),
        Text(
          value,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildTodoCard(TodoModel task, bool isDark) {
    final bgSurface = isDark ? AppColors.bgSurface : AppColors.bgSurfaceLight;
    final textPrimary = isDark ? AppColors.textPrimary : AppColors.textPrimaryLight;
    final textSecondary = isDark ? AppColors.textSecondary : AppColors.textSecondaryLight;
    final textMuted = isDark ? AppColors.textMuted : AppColors.textMutedLight;
    final borderSubtle = isDark ? AppColors.borderSubtle : AppColors.borderSubtleLight;

    Color priorityColor;
    switch (task.priority.toLowerCase()) {
      case 'urgent':
        priorityColor = AppColors.accentRed;
        break;
      case 'high':
        priorityColor = AppColors.accentGold;
        break;
      case 'medium':
        priorityColor = AppColors.accentCyan;
        break;
      default:
        priorityColor = textMuted;
    }

    final isOverdue = _isOverdue(task);
    final category = _getTaskCategory(task);
    final categoryColor = _getCategoryColor(category);

    Color statusColor = AppColors.gold(isDark);
    String statusLabel = 'Pending';
    if (task.status == 'in_progress') {
      statusColor = AppColors.secondary(isDark);
      statusLabel = 'Dikerjakan';
    } else if (task.isCompleted) {
      statusColor = AppColors.emerald(isDark);
      statusLabel = 'Selesai';
    }

    final deadlineDate = task.deadline;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isOverdue ? AppColors.accentRed.withValues(alpha: 0.6) : borderSubtle,
          width: isOverdue ? 1.2 : 1.0,
        ),
        boxShadow: isOverdue
            ? [
                BoxShadow(
                  color: AppColors.accentRed.withValues(alpha: isDark ? 0.16 : 0.08),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Checkbox Interaktif dengan Touch Area Min 44x44 dp
              InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () async {
                  HapticFeedback.lightImpact();
                  await ref.read(todoProvider.notifier).toggleStatus(task);
                  if (mounted) {
                    _showFloatingToast(
                      message: task.isCompleted
                          ? 'Task "${task.title}" dibuka kembali'
                          : 'Task "${task.title}" diselesaikan!',
                      isSuccess: true,
                      icon: task.isCompleted ? LucideIcons.circle_alert : LucideIcons.circle_check,
                    );
                  }
                },
                child: Container(
                  width: 44,
                  height: 44,
                  alignment: Alignment.center,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: task.isCompleted ? AppColors.accentEmerald : Colors.transparent,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: task.isCompleted ? AppColors.accentEmerald : textMuted,
                        width: 1.6,
                      ),
                    ),
                    child: task.isCompleted
                        ? const Icon(LucideIcons.check, size: 14, color: Colors.black)
                        : null,
                  ),
                ),
              ),
              const SizedBox(width: 4),

              // Title & Description
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        task.title,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: task.isCompleted ? textMuted : textPrimary,
                          decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                        ),
                      ),
                      if (task.description?.isNotEmpty == true) ...[
                        const SizedBox(height: 4),
                        Text(
                          task.description!,
                          style: GoogleFonts.spaceMono(
                            fontSize: 11,
                            color: textSecondary,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              // Edit & Delete Actions (Touch Targets Min 44x44 dp)
              Row(
                children: [
                  SizedBox(
                    width: 44,
                    height: 44,
                    child: IconButton(
                      tooltip: 'Edit Todo',
                      icon: const Icon(LucideIcons.pencil, size: 15, color: AppColors.accentCyan),
                      onPressed: () {
                        HapticFeedback.lightImpact();
                        _showTodoFormModal(context, todoToEdit: task);
                      },
                    ),
                  ),
                  SizedBox(
                    width: 44,
                    height: 44,
                    child: IconButton(
                      tooltip: 'Hapus Todo',
                      icon: Icon(LucideIcons.trash, size: 15, color: textMuted),
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
                                  'Hapus Task',
                                  style: GoogleFonts.spaceGrotesk(
                                    color: textPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                            content: Text(
                              'Apakah Anda yakin ingin menghapus task ini?\n\n"${task.title}"',
                              style: GoogleFonts.spaceGrotesk(
                                color: textSecondary,
                                fontSize: 13,
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
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                ),
                                onPressed: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(ctx, true);
                                },
                                child: Text(
                                  'Ya, Hapus',
                                  style: GoogleFonts.spaceMono(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        );

                        if (confirm == true && mounted) {
                          await ref.read(todoProvider.notifier).deleteTodo(task.id);
                          if (mounted) {
                            _showFloatingToast(
                              message: 'Task "${task.title}" dihapus',
                              isSuccess: true,
                              icon: LucideIcons.trash,
                            );
                          }
                        }
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Chips & Badge Row
          Wrap(
            spacing: 6,
            runSpacing: 6,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              // Badge Kategori
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: categoryColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: categoryColor.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(width: 5, height: 5, decoration: BoxDecoration(color: categoryColor, shape: BoxShape.circle)),
                    const SizedBox(width: 5),
                    Text(category, style: GoogleFonts.spaceGrotesk(fontSize: 9, fontWeight: FontWeight.bold, color: categoryColor)),
                  ],
                ),
              ),

              // Badge Priority
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(
                  color: priorityColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: priorityColor.withValues(alpha: 0.3)),
                ),
                child: Text(
                  task.priority.toUpperCase(),
                  style: GoogleFonts.spaceMono(fontSize: 8.5, fontWeight: FontWeight.bold, color: priorityColor),
                ),
              ),

              // Quick Status Dropdown (Touch Area Min 44x44 dp)
              PopupMenuButton<String>(
                tooltip: 'Ubah Status',
                onSelected: (newStatus) async {
                  HapticFeedback.selectionClick();
                  await ref.read(todoProvider.notifier).updateStatus(task.id, newStatus);
                  if (mounted) {
                    _showFloatingToast(
                      message: 'Status "${task.title}" diubah!',
                      isSuccess: true,
                    );
                  }
                },
                itemBuilder: (ctx) => [
                  PopupMenuItem(
                    value: 'pending',
                    child: Text('Pending',
                        style: GoogleFonts.spaceGrotesk(
                            color: AppColors.gold(isDark), fontWeight: FontWeight.bold)),
                  ),
                  PopupMenuItem(
                    value: 'in_progress',
                    child: Text('Dikerjakan',
                        style: GoogleFonts.spaceGrotesk(
                            color: AppColors.secondary(isDark), fontWeight: FontWeight.bold)),
                  ),
                  PopupMenuItem(
                    value: 'completed',
                    child: Text('Selesai',
                        style: GoogleFonts.spaceGrotesk(
                            color: AppColors.emerald(isDark), fontWeight: FontWeight.bold)),
                  ),
                ],
                child: Container(
                  constraints: const BoxConstraints(minHeight: 28),
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        statusLabel,
                        style: GoogleFonts.spaceMono(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: statusColor,
                        ),
                      ),
                      const SizedBox(width: 3),
                      Icon(LucideIcons.chevron_down, size: 10, color: statusColor),
                    ],
                  ),
                ),
              ),

              // Overdue Badge
              if (isOverdue)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.accentRed.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.accentRed.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.circle_alert, size: 10, color: AppColors.accentRed),
                      const SizedBox(width: 4),
                      Text(
                        _getOverdueText(deadlineDate!),
                        style: GoogleFonts.spaceMono(fontSize: 8.5, fontWeight: FontWeight.bold, color: AppColors.accentRed),
                      ),
                    ],
                  ),
                )
              else if (deadlineDate != null)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(LucideIcons.clock, size: 11, color: textMuted),
                    const SizedBox(width: 4),
                    Text(
                      '${_twoDigits(deadlineDate.day)}/${_twoDigits(deadlineDate.month)} ${_twoDigits(deadlineDate.hour)}:${_twoDigits(deadlineDate.minute)} WIB',
                      style: GoogleFonts.spaceMono(fontSize: 9, color: textMuted),
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }

  // Modal Form Tambah/Edit Todo (Responsif & Rapi)
  void _showTodoFormModal(BuildContext context, {TodoModel? todoToEdit}) {
    HapticFeedback.lightImpact();
    final isEdit = todoToEdit != null;

    final titleController = TextEditingController(text: isEdit ? todoToEdit.title : '');
    final descriptionController = TextEditingController(text: isEdit ? todoToEdit.description : '');

    String selectedCategory = isEdit ? _getTaskCategory(todoToEdit) : 'Stream & Jadwal';
    String selectedPriority = isEdit ? todoToEdit.priority : 'medium';
    String selectedStatus = isEdit ? todoToEdit.status : 'pending';

    DateTime selectedDeadline = isEdit && todoToEdit.deadline != null
        ? todoToEdit.deadline!
        : DateTime.now().add(const Duration(hours: 4));
    TimeOfDay selectedTime = TimeOfDay(hour: selectedDeadline.hour, minute: selectedDeadline.minute);

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
              border: Border(top: BorderSide(color: borderSubtle, width: 1.2)),
            ),
            padding: EdgeInsets.only(
              left: 20,
              right: 20,
              top: 20,
              bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('INTERNAL CHECKLIST',
                              style: GoogleFonts.spaceMono(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary(isDark),
                                letterSpacing: 0.5,
                              )),
                          const SizedBox(height: 2),
                          Text(
                            isEdit ? 'Edit Task' : 'Tambah Todo Baru',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: textPrimary,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(
                        width: 44,
                        height: 44,
                        child: IconButton(
                          icon: Icon(LucideIcons.x, color: textMuted),
                          onPressed: () {
                            HapticFeedback.selectionClick();
                            Navigator.pop(modalContext);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  Text('JUDUL TASK *',
                      style: GoogleFonts.spaceMono(
                          fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: titleController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Misal: Render Blender Sahall',
                      hintStyle: GoogleFonts.spaceGrotesk(color: textMuted, fontSize: 13),
                      filled: true,
                      fillColor: bgInput,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
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
                        borderSide: BorderSide(
                          color: AppColors.primary(isDark),
                          width: 1.2,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  Text('KATEGORI',
                      style: GoogleFonts.spaceMono(
                          fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: selectedCategory,
                    dropdownColor: bgInput,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                    decoration: InputDecoration(
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
                    ),
                    items: _categories.where((c) => c != 'Semua Kategori').map((cat) {
                      final catColor = _getCategoryColor(cat);
                      return DropdownMenuItem(
                        value: cat,
                        child: Row(
                          children: [
                            Container(width: 6, height: 6, decoration: BoxDecoration(color: catColor, shape: BoxShape.circle)),
                            const SizedBox(width: 8),
                            Text(cat),
                          ],
                        ),
                      );
                    }).toList(),
                    onChanged: (val) => setModalState(() => selectedCategory = val ?? 'Stream & Jadwal'),
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('PRIORITAS',
                                style: GoogleFonts.spaceMono(
                                    fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              initialValue: selectedPriority,
                              dropdownColor: bgInput,
                              style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: bgInput,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide(color: borderSubtle),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide(color: borderSubtle),
                                ),
                              ),
                              items: _priorities.map((p) {
                                Color pColor = AppColors.accentCyan;
                                if (p == 'urgent') pColor = AppColors.accentRed;
                                if (p == 'high') pColor = AppColors.accentGold;
                                if (p == 'low') pColor = textMuted;
                                return DropdownMenuItem(
                                  value: p,
                                  child: Row(
                                    children: [
                                      Container(width: 6, height: 6, decoration: BoxDecoration(color: pColor, shape: BoxShape.circle)),
                                      const SizedBox(width: 6),
                                      Text(p.toUpperCase()),
                                    ],
                                  ),
                                );
                              }).toList(),
                              onChanged: (val) => setModalState(() => selectedPriority = val ?? 'medium'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('STATUS',
                                style: GoogleFonts.spaceMono(
                                    fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              initialValue: selectedStatus,
                              dropdownColor: bgInput,
                              style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: bgInput,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide(color: borderSubtle),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide(color: borderSubtle),
                                ),
                              ),
                              items: const [
                                DropdownMenuItem(value: 'pending', child: Text('Pending')),
                                DropdownMenuItem(value: 'in_progress', child: Text('Dikerjakan')),
                                DropdownMenuItem(value: 'completed', child: Text('Selesai')),
                              ],
                              onChanged: (val) => setModalState(() => selectedStatus = val ?? 'pending'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('DEADLINE TANGGAL',
                                style: GoogleFonts.spaceMono(
                                    fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: () async {
                                HapticFeedback.selectionClick();
                                final picked = await showDatePicker(
                                  context: modalContext,
                                  initialDate: selectedDeadline,
                                  firstDate: DateTime.now().subtract(const Duration(days: 365)),
                                  lastDate: DateTime(2030),
                                );
                                if (picked != null) setModalState(() => selectedDeadline = picked);
                              },
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                                decoration: BoxDecoration(
                                  color: bgInput,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: borderSubtle),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '${_twoDigits(selectedDeadline.day)}/${_twoDigits(selectedDeadline.month)}/${selectedDeadline.year}',
                                      style: GoogleFonts.spaceMono(color: textPrimary, fontSize: 12),
                                    ),
                                    Icon(LucideIcons.calendar, size: 16, color: textMuted),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('JAM (WIB)',
                                style: GoogleFonts.spaceMono(
                                    fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: () async {
                                HapticFeedback.selectionClick();
                                final picked = await showTimePicker(context: modalContext, initialTime: selectedTime);
                                if (picked != null) setModalState(() => selectedTime = picked);
                              },
                              borderRadius: BorderRadius.circular(10),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                                decoration: BoxDecoration(
                                  color: bgInput,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: borderSubtle),
                                ),
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
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  Text('DESKRIPSI (OPSIONAL)',
                      style: GoogleFonts.spaceMono(
                          fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: descriptionController,
                    maxLines: 2,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Misal: Kamis Beres render aset',
                      hintStyle: GoogleFonts.spaceGrotesk(color: textMuted, fontSize: 13),
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
                    ),
                  ),
                  const SizedBox(height: 22),

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
                          _showFloatingToast(
                            message: 'Judul todo wajib diisi!',
                            isSuccess: false,
                          );
                          return;
                        }

                        HapticFeedback.lightImpact();
                        final deadline = DateTime(
                          selectedDeadline.year,
                          selectedDeadline.month,
                          selectedDeadline.day,
                          selectedTime.hour,
                          selectedTime.minute,
                        );

                        if (modalContext.mounted) {
                          Navigator.pop(modalContext);
                        }

                        try {
                          if (isEdit) {
                            await ref.read(todoProvider.notifier).updateTodo(
                                  id: todoToEdit.id,
                                  title: title,
                                  description: descriptionController.text.trim(),
                                  priority: selectedPriority,
                                  status: selectedStatus,
                                  deadline: deadline,
                                  tags: [selectedCategory],
                                );
                          } else {
                            await ref.read(todoProvider.notifier).addTodo(
                                  title: title,
                                  description: descriptionController.text.trim(),
                                  priority: selectedPriority,
                                  status: selectedStatus,
                                  deadline: deadline,
                                  tags: [selectedCategory],
                                );
                          }
                          if (mounted) {
                            _showFloatingToast(
                              message: isEdit ? 'Todo berhasil diperbarui!' : 'Todo baru berhasil disimpan!',
                              isSuccess: true,
                            );
                          }
                        } catch (e) {
                          if (mounted) {
                            _showFloatingToast(
                              message: 'Gagal menyimpan todo: $e',
                              isSuccess: false,
                            );
                          }
                        }
                      },
                      child: Text(
                        isEdit ? '✓ Simpan Perubahan' : '✓ Simpan Todo',
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
}
