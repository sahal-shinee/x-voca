import 'package:flutter/material.dart';
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

  bool _isOverdue(TodoModel task) {
    if (task.isCompleted || task.deadline == null) return false;
    return task.deadline!.isBefore(DateTime.now());
  }

  String _getOverdueText(DateTime deadline) {
    final diff = DateTime.now().difference(deadline);
    if (diff.inDays > 0) return 'Terlambat ${diff.inDays} hari';
    if (diff.inHours > 0) return 'Terlambat ${diff.inHours} jam';
    return 'Terlambat';
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Stream & Jadwal':
        return const Color(0xFF10B981);
      case 'Konten & Video':
        return AppColors.accentPurple;
      case 'Aset & Teknis':
        return AppColors.accentCyan;
      case 'Sosmed & Komunitas':
        return Colors.pinkAccent;
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
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'CHECKLIST & OPERASIONAL',
              style: GoogleFonts.spaceMono(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: AppColors.accentCyan,
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
          IconButton(
            icon: Icon(LucideIcons.refresh_cw, size: 18, color: textSecondary),
            onPressed: () => ref.read(todoProvider.notifier).fetchTodos(),
          ),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.accentCyan,
        elevation: 4,
        icon: const Icon(LucideIcons.plus, color: Colors.black, size: 18),
        label: Text(
          'Tambah Todo',
          style: GoogleFonts.spaceGrotesk(
            color: Colors.black,
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
                Expanded(child: _buildMiniStatItem('Total Tugas', '$totalCount', textPrimary, isDark)),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(child: _buildMiniStatItem('Pending', '$pendingCount', AppColors.accentGold, isDark)),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(child: _buildMiniStatItem('Dikerjakan', '$inProgressCount', AppColors.accentCyan, isDark)),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(child: _buildMiniStatItem('Selesai', '$completedCount', const Color(0xFF10B981), isDark)),
                Container(width: 1, height: 26, color: borderSubtle),
                Expanded(child: _buildMiniStatItem('Terlambat', '$overdueCount', AppColors.accentRed, isDark)),
              ],
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // 2. Progress Penyelesaian Bar
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
                        const Icon(LucideIcons.trending_up, size: 14, color: AppColors.accentCyan),
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
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progressRatio,
                    backgroundColor: bgInput,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accentCyan),
                    minHeight: 5,
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // 3. Search Field & Status Filter
          Container(
            padding: const EdgeInsets.all(12),
            color: bgSurface,
            child: Column(
              children: [
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
                          ? IconButton(
                              icon: Icon(LucideIcons.x, size: 16, color: textMuted),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _searchQuery = '');
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Status Chips
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
                        child: ChoiceChip(
                          label: Text(
                            '${_statusFilters[index]} ($badgeCount)',
                            style: GoogleFonts.spaceMono(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.black : textSecondary,
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: AppColors.accentCyan,
                          backgroundColor: bgInput,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                            side: BorderSide(
                              color: isSelected ? AppColors.accentCyan : borderSubtle,
                            ),
                          ),
                          onSelected: (_) => setState(() => _selectedStatusIndex = index),
                        ),
                      );
                    }),
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: borderSubtle),

          // 4. Kategori Filter Chips
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
                      onTap: () => setState(() => _selectedCategory = category),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: isSelected ? categoryColor.withValues(alpha: 0.2) : bgInput,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? categoryColor : borderSubtle,
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
                ? const Center(child: CircularProgressIndicator(color: AppColors.accentCyan))
                : todoState.error != null && allTodos.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, color: AppColors.accentRed, size: 40),
                            const SizedBox(height: 8),
                            Text(
                              'Gagal mengambil data task',
                              style: GoogleFonts.spaceGrotesk(color: textPrimary, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentCyan),
                              onPressed: () => ref.read(todoProvider.notifier).fetchTodos(),
                              child: Text('Coba Lagi', style: GoogleFonts.spaceGrotesk(color: Colors.black)),
                            ),
                          ],
                        ),
                      )
                    : filteredTodos.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.circle_check, color: textMuted, size: 48),
                                const SizedBox(height: 12),
                                Text(
                                  'Tidak ada task pada kategori ini',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 14,
                                    color: textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () => ref.read(todoProvider.notifier).fetchTodos(),
                            color: AppColors.accentCyan,
                            child: ListView.builder(
                              padding: const EdgeInsets.only(left: 16, right: 16, top: 14, bottom: 80),
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
        Text(title, style: GoogleFonts.spaceMono(fontSize: 8, color: textMuted)),
        const SizedBox(height: 2),
        Text(
          value,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 12,
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
        priorityColor = Colors.orangeAccent;
        break;
      case 'medium':
        priorityColor = AppColors.accentGold;
        break;
      default:
        priorityColor = textMuted;
    }

    final isOverdue = _isOverdue(task);
    final category = _getTaskCategory(task);
    final categoryColor = _getCategoryColor(category);

    Color statusColor = AppColors.accentGold;
    String statusLabel = 'Pending';
    if (task.status == 'in_progress') {
      statusColor = AppColors.accentCyan;
      statusLabel = 'Dikerjakan';
    } else if (task.isCompleted) {
      statusColor = const Color(0xFF10B981);
      statusLabel = 'Selesai';
    }

    final deadlineDate = task.deadline;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isOverdue ? AppColors.accentRed.withValues(alpha: 0.5) : borderSubtle,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: () async {
                  await ref.read(todoProvider.notifier).toggleStatus(task);
                },
                child: Container(
                  margin: const EdgeInsets.only(top: 2),
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: task.isCompleted ? const Color(0xFF10B981) : Colors.transparent,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: task.isCompleted ? const Color(0xFF10B981) : textMuted,
                      width: 1.5,
                    ),
                  ),
                  child: Icon(
                    LucideIcons.check,
                    size: 14,
                    color: task.isCompleted ? Colors.black : Colors.transparent,
                  ),
                ),
              ),
              const SizedBox(width: 12),

              Expanded(
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
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              Row(
                children: [
                  IconButton(
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                    icon: const Icon(LucideIcons.pencil, size: 16, color: AppColors.accentCyan),
                    onPressed: () => _showTodoFormModal(context, todoToEdit: task),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                    icon: Icon(LucideIcons.trash, size: 16, color: textMuted),
                    onPressed: () async {
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
                              Text('Hapus Task', style: GoogleFonts.spaceGrotesk(color: textPrimary, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          content: Text('Yakin ingin menghapus task "${task.title}"?', style: GoogleFonts.spaceMono(color: textSecondary, fontSize: 12)),
                          actions: [
                            TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text('Batal', style: GoogleFonts.spaceMono(color: textMuted))),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentRed),
                              onPressed: () => Navigator.pop(ctx, true),
                              child: Text('Ya, Hapus', style: GoogleFonts.spaceMono(color: Colors.white, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      );

                      if (confirm == true && mounted) {
                        await ref.read(todoProvider.notifier).deleteTodo(task.id);
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Chips & Badge Row (Identik dengan Web)
          Wrap(
            spacing: 6,
            runSpacing: 6,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              // Badge Kategori
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: categoryColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
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
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: priorityColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  task.priority.toUpperCase(),
                  style: GoogleFonts.spaceMono(fontSize: 9, fontWeight: FontWeight.bold, color: priorityColor),
                ),
              ),

              // Status Dropdown / Quick Switch
              PopupMenuButton<String>(
                onSelected: (newStatus) async {
                  await ref.read(todoProvider.notifier).updateStatus(task.id, newStatus);
                },
                itemBuilder: (ctx) => [
                  PopupMenuItem(value: 'pending', child: Text('Pending', style: GoogleFonts.spaceGrotesk(color: AppColors.accentGold))),
                  PopupMenuItem(value: 'in_progress', child: Text('Dikerjakan', style: GoogleFonts.spaceGrotesk(color: AppColors.accentCyan))),
                  PopupMenuItem(value: 'completed', child: Text('Selesai', style: GoogleFonts.spaceGrotesk(color: const Color(0xFF10B981)))),
                ],
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: statusColor.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(statusLabel, style: GoogleFonts.spaceMono(fontSize: 9, fontWeight: FontWeight.bold, color: statusColor)),
                      const SizedBox(width: 3),
                      Icon(LucideIcons.chevron_down, size: 10, color: statusColor),
                    ],
                  ),
                ),
              ),

              // Overdue Badge
              if (isOverdue)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.accentRed.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: AppColors.accentRed.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.clock, size: 10, color: AppColors.accentRed),
                      const SizedBox(width: 4),
                      Text(
                        _getOverdueText(deadlineDate!),
                        style: GoogleFonts.spaceMono(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.accentRed),
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

  void _showTodoFormModal(BuildContext context, {TodoModel? todoToEdit}) {
    final isEdit = todoToEdit != null;
    final messenger = ScaffoldMessenger.of(context);

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
            color: bgSurface,
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
                              style: GoogleFonts.spaceMono(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.accentCyan)),
                          Text(isEdit ? 'Edit Task' : 'Tambah Todo Baru',
                              style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.bold, color: textPrimary)),
                        ],
                      ),
                      IconButton(icon: Icon(LucideIcons.x, color: textMuted), onPressed: () => Navigator.pop(modalContext)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  Text('JUDUL TASK *', style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: titleController,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Misal: Render Blender Sahall',
                      hintStyle: GoogleFonts.spaceGrotesk(color: textMuted),
                      filled: true,
                      fillColor: bgInput,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 14),

                  Text('KATEGORI', style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    initialValue: selectedCategory,
                    dropdownColor: bgInput,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: bgInput,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                    items: _categories.where((c) => c != 'Semua Kategori').map((cat) {
                      return DropdownMenuItem(value: cat, child: Text(cat));
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
                            Text('PRIORITAS', style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              initialValue: selectedPriority,
                              dropdownColor: bgInput,
                              style: GoogleFonts.spaceGrotesk(color: textPrimary),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: bgInput,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                              ),
                              items: _priorities.map((p) => DropdownMenuItem(value: p, child: Text(p.toUpperCase()))).toList(),
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
                            Text('STATUS', style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              initialValue: selectedStatus,
                              dropdownColor: bgInput,
                              style: GoogleFonts.spaceGrotesk(color: textPrimary),
                              decoration: InputDecoration(
                                filled: true,
                                fillColor: bgInput,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
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
                            Text('DEADLINE TANGGAL', style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: () async {
                                final picked = await showDatePicker(
                                  context: modalContext,
                                  initialDate: selectedDeadline,
                                  firstDate: DateTime.now().subtract(const Duration(days: 365)),
                                  lastDate: DateTime(2030),
                                );
                                if (picked != null) setModalState(() => selectedDeadline = picked);
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                                decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('${_twoDigits(selectedDeadline.day)}/${_twoDigits(selectedDeadline.month)}/${selectedDeadline.year}',
                                        style: GoogleFonts.spaceMono(color: textPrimary, fontSize: 12)),
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
                            Text('JAM (WIB)', style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            InkWell(
                              onTap: () async {
                                final picked = await showTimePicker(context: modalContext, initialTime: selectedTime);
                                if (picked != null) setModalState(() => selectedTime = picked);
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                                decoration: BoxDecoration(color: bgInput, borderRadius: BorderRadius.circular(10)),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('${_twoDigits(selectedTime.hour)}:${_twoDigits(selectedTime.minute)}',
                                        style: GoogleFonts.spaceMono(color: textPrimary, fontSize: 12)),
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

                  Text('DESKRIPSI (OPSIONAL)', style: GoogleFonts.spaceMono(fontSize: 10, color: textSecondary, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: descriptionController,
                    maxLines: 2,
                    style: GoogleFonts.spaceGrotesk(color: textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Misal: Kamis Beres',
                      hintStyle: GoogleFonts.spaceGrotesk(color: textMuted),
                      filled: true,
                      fillColor: bgInput,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                    ),
                  ),
                  const SizedBox(height: 20),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentCyan,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: () async {
                        final title = titleController.text.trim();
                        if (title.isEmpty) {
                          messenger.showSnackBar(const SnackBar(content: Text('Judul todo wajib diisi!')));
                          return;
                        }

                        final deadline = DateTime(
                          selectedDeadline.year,
                          selectedDeadline.month,
                          selectedDeadline.day,
                          selectedTime.hour,
                          selectedTime.minute,
                        );

                        if (modalContext.mounted) Navigator.pop(modalContext);

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
                          messenger.showSnackBar(SnackBar(content: Text(isEdit ? 'Todo berhasil diperbarui!' : 'Todo berhasil disimpan!')));
                        } catch (e) {
                          messenger.showSnackBar(SnackBar(content: Text('Gagal menyimpan todo: $e')));
                        }
                      },
                      child: Text(isEdit ? '✓ Simpan Perubahan' : '✓ Simpan Todo',
                          style: GoogleFonts.spaceGrotesk(color: Colors.black, fontWeight: FontWeight.bold)),
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