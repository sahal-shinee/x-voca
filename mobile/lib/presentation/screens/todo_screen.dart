import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/todo_model.dart';
import '../providers/todo_provider.dart';

// Helper function diletakkan di top-level agar selalu terdeteksi
String _twoDigits(int value) => value.toString().padLeft(2, '0');

class TodoScreen extends ConsumerStatefulWidget {
  const TodoScreen({super.key});

  @override
  ConsumerState<TodoScreen> createState() => _TodoScreenState();
}

class _TodoScreenState extends ConsumerState<TodoScreen> {
  int _selectedFilterIndex = 0; // 0: ALL, 1: URGENT, 2: PENDING, 3: COMPLETED
  final List<String> _filters = ['ALL TASKS', 'URGENT', 'PENDING', 'COMPLETED'];
  final List<String> _priorities = ['low', 'medium', 'high', 'urgent'];

  int _getPriorityWeight(String priority) {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 4;
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final todoState = ref.watch(todoProvider);
    final allTodos = todoState.todos;

    final filteredTodos = allTodos.where((todo) {
      if (_selectedFilterIndex == 1) return todo.isUrgent && !todo.isCompleted;
      if (_selectedFilterIndex == 2) return !todo.isCompleted;
      if (_selectedFilterIndex == 3) return todo.isCompleted;
      return true;
    }).toList();

    // Sorting: Pending di atas + Priority tertinggi
    filteredTodos.sort((a, b) {
      if (a.isCompleted != b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      final weightA = _getPriorityWeight(a.priority);
      final weightB = _getPriorityWeight(b.priority);
      return weightB.compareTo(weightA);
    });

    final completedCount = allTodos.where((t) => t.isCompleted).length;

    return Scaffold(
      backgroundColor: AppColors.bgBase,
      appBar: AppBar(
        backgroundColor: AppColors.bgNav,
        elevation: 0,
        title: Text(
          'INTERNAL TO-DO LIST',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
            letterSpacing: 1,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refresh_cw, size: 18, color: AppColors.textSecondary),
            onPressed: () => ref.read(todoProvider.notifier).fetchTodos(),
          ),
          IconButton(
            icon: const Icon(LucideIcons.plus, color: AppColors.accentCyan),
            onPressed: () => _showTodoFormModal(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Progress Header
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.bgSurface,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'TODAY\'S PROGRESS',
                      style: GoogleFonts.spaceMono(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.accentCyan,
                      ),
                    ),
                    Text(
                      '$completedCount OF ${allTodos.length} COMPLETED',
                      style: GoogleFonts.spaceMono(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: allTodos.isNotEmpty ? completedCount / allTodos.length : 0.0,
                    backgroundColor: AppColors.bgInput,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accentCyan),
                    minHeight: 6,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSubtle),

          // Filter Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: AppColors.bgSurface,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: List.generate(_filters.length, (index) {
                  final isSelected = _selectedFilterIndex == index;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: ChoiceChip(
                      label: Text(
                        _filters[index],
                        style: GoogleFonts.spaceMono(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.black : AppColors.textSecondary,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: AppColors.accentCyan,
                      backgroundColor: AppColors.bgInput,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: BorderSide(
                          color: isSelected ? AppColors.accentCyan : AppColors.borderSubtle,
                        ),
                      ),
                      onSelected: (_) => setState(() => _selectedFilterIndex = index),
                    ),
                  );
                }),
              ),
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSubtle),

          // Task List View
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
                              style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary, fontWeight: FontWeight.bold),
                            ),
                            if (todoState.error != null) ...[
                              const SizedBox(height: 6),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 24),
                                child: Text(
                                  todoState.error!,
                                  style: GoogleFonts.spaceMono(color: AppColors.textMuted, fontSize: 11),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ],
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
                                const Icon(LucideIcons.circle_check, color: AppColors.textMuted, size: 48),
                                const SizedBox(height: 12),
                                Text(
                                  'Tidak ada task di kategori ini',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 14,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () => ref.read(todoProvider.notifier).fetchTodos(),
                            color: AppColors.accentCyan,
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: filteredTodos.length,
                              itemBuilder: (context, index) {
                                final task = filteredTodos[index];
                                return _buildTodoCard(task);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildTodoCard(TodoModel task) {
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
        priorityColor = AppColors.textMuted;
    }

    final deadlineDate = task.deadline;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: task.isCompleted
              ? AppColors.borderSubtle
              : task.isUrgent
                  ? AppColors.accentRed.withValues(alpha: 0.6)
                  : AppColors.borderSubtle,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Checkbox Toggle Status
              GestureDetector(
                onTap: () async {
                  await ref.read(todoProvider.notifier).toggleStatus(task);
                },
                child: Container(
                  margin: const EdgeInsets.only(top: 2),
                  padding: const EdgeInsets.all(2),
                  decoration: BoxDecoration(
                    color: task.isCompleted ? AppColors.accentCyan : Colors.transparent,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: task.isCompleted ? AppColors.accentCyan : AppColors.textMuted,
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

              // Title & Description
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.title,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: task.isCompleted ? AppColors.textMuted : AppColors.textPrimary,
                        decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    if (task.description?.isNotEmpty == true) ...[
                      const SizedBox(height: 4),
                      Text(
                        task.description!,
                        style: GoogleFonts.spaceMono(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              // Priority Badge & Action Buttons
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: priorityColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      task.priority.toUpperCase(),
                      style: GoogleFonts.spaceMono(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: priorityColor,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Edit Button
                  IconButton(
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                    icon: const Icon(LucideIcons.pencil, size: 16, color: AppColors.accentCyan),
                    onPressed: () => _showTodoFormModal(context, todoToEdit: task),
                  ),
                  const SizedBox(width: 8),

                  // Delete Button
                  IconButton(
                    constraints: const BoxConstraints(),
                    padding: EdgeInsets.zero,
                    icon: const Icon(LucideIcons.trash, size: 16, color: AppColors.textMuted),
                    onPressed: () async {
                      final bool? confirm = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          backgroundColor: AppColors.bgSurface,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: const BorderSide(color: AppColors.borderSubtle),
                          ),
                          title: Row(
                            children: [
                              const Icon(LucideIcons.triangle_alert, color: AppColors.accentRed, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                'Konfirmasi Hapus',
                                style: GoogleFonts.spaceGrotesk(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                          content: Text(
                            'Apakah Anda yakin ingin menghapus data ini?\n("${task.title}")',
                            style: GoogleFonts.spaceMono(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, false),
                              child: Text(
                                'Batal',
                                style: GoogleFonts.spaceMono(color: AppColors.textMuted),
                              ),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.accentRed,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              onPressed: () => Navigator.pop(ctx, true),
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
                          await ref.read(todoProvider.notifier).deleteTodo(task.id);
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Task berhasil dihapus')),
                            );
                          }
                        } catch (e) {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Gagal menghapus task: $e')),
                            );
                          }
                        }
                      }
                    },
                  ),
                ],
              ),
            ],
          ),

          // Footer: Deadline & Resource Info
          if (task.tags.isNotEmpty || deadlineDate != null || task.resourceInfo != null) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                if (deadlineDate != null) ...[
                  Icon(LucideIcons.clock, size: 12, color: priorityColor),
                  const SizedBox(width: 4),
                  Text(
                    'Deadline: ${_twoDigits(deadlineDate.day)}/${_twoDigits(deadlineDate.month)} ${_twoDigits(deadlineDate.hour)}:${_twoDigits(deadlineDate.minute)} WIB',
                    style: GoogleFonts.spaceMono(fontSize: 10, color: priorityColor),
                  ),
                  const SizedBox(width: 10),
                ],
                if (task.resourceInfo != null && task.resourceInfo!.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                    decoration: BoxDecoration(
                      color: AppColors.bgInput,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: AppColors.borderSubtle),
                    ),
                    child: Text(
                      task.resourceInfo!,
                      style: GoogleFonts.spaceMono(fontSize: 9, color: AppColors.textSecondary),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ],

          if (task.tags.isNotEmpty) ...[
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              children: task.tags.map((tag) {
                final formattedTag = tag.startsWith('#') ? tag : '#$tag';
                return Text(
                  formattedTag,
                  style: GoogleFonts.spaceMono(
                    fontSize: 10,
                    color: AppColors.accentCyan,
                  ),
                );
              }).toList(),
            ),
          ],
        ],
      ),
    );
  }

  // Modal Dialog Form (Universal Tambah & Edit)
  // Modal Dialog Form (Universal Tambah & Edit)
  // Modal Dialog Form (Universal Tambah & Edit)
  void _showTodoFormModal(BuildContext context, {TodoModel? todoToEdit}) {
    final isEdit = todoToEdit != null;
    final messenger = ScaffoldMessenger.of(context);

    final titleController = TextEditingController(text: isEdit ? todoToEdit.title : '');
    final descriptionController = TextEditingController(text: isEdit ? todoToEdit.description : '');
    final tagsController = TextEditingController(text: isEdit ? todoToEdit.tags.join(', ') : '');
    final resourceController = TextEditingController(text: isEdit ? todoToEdit.resourceInfo : '');

    String selectedPriority = isEdit ? todoToEdit.priority : 'medium';
    DateTime selectedDeadline = isEdit && todoToEdit.deadline != null
        ? todoToEdit.deadline!
        : DateTime.now().add(const Duration(hours: 4));
    TimeOfDay selectedTime = TimeOfDay(hour: selectedDeadline.hour, minute: selectedDeadline.minute);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (modalContext) => StatefulBuilder(
        builder: (modalContext, setModalState) => Padding(
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
                        Text(
                          'INTERNAL WORKFLOW',
                          style: GoogleFonts.spaceMono(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.accentCyan,
                          ),
                        ),
                        Text(
                          isEdit ? 'Edit Task' : 'Tambah Task Baru',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x, color: AppColors.textMuted),
                      onPressed: () => Navigator.pop(modalContext),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // 1. JUDUL TASK
                Text(
                  'JUDUL TASK *',
                  style: GoogleFonts.spaceMono(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: titleController,
                  style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'Misal: Render YouTube Shorts...',
                    hintStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMuted),
                    filled: true,
                    fillColor: AppColors.bgInput,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 14),

                // 2. DESKRIPSI TASK
                Text(
                  'DESKRIPSI',
                  style: GoogleFonts.spaceMono(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: descriptionController,
                  maxLines: 2,
                  style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'Detail pekerjaan...',
                    hintStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMuted),
                    filled: true,
                    fillColor: AppColors.bgInput,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 14),

                // 3. PRIORITY & DEADLINE TANGGAL
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'PRIORITY',
                            style: GoogleFonts.spaceMono(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: selectedPriority,
                            dropdownColor: AppColors.bgInput,
                            style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                            decoration: InputDecoration(
                              filled: true,
                              fillColor: AppColors.bgInput,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                            ),
                            items: _priorities.map((p) {
                              return DropdownMenuItem(
                                value: p,
                                child: Text(p.toUpperCase(), style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary)),
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
                          Text(
                            'DEADLINE TANGGAL',
                            style: GoogleFonts.spaceMono(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          InkWell(
                            onTap: () async {
                              final picked = await showDatePicker(
                                context: modalContext,
                                initialDate: selectedDeadline,
                                firstDate: DateTime.now().subtract(const Duration(days: 365)),
                                lastDate: DateTime(2030),
                              );
                              if (picked != null) {
                                setModalState(() => selectedDeadline = picked);
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                              decoration: BoxDecoration(
                                color: AppColors.bgInput,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${_twoDigits(selectedDeadline.day)}/${_twoDigits(selectedDeadline.month)}/${selectedDeadline.year}',
                                    style: GoogleFonts.spaceMono(color: AppColors.textPrimary, fontSize: 12),
                                  ),
                                  const Icon(LucideIcons.calendar, size: 16, color: AppColors.textMuted),
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

                // 4. DEADLINE JAM
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'DEADLINE JAM (WIB)',
                      style: GoogleFonts.spaceMono(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    InkWell(
                      onTap: () async {
                        final picked = await showTimePicker(
                          context: modalContext,
                          initialTime: selectedTime,
                        );
                        if (picked != null) {
                          setModalState(() => selectedTime = picked);
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        decoration: BoxDecoration(
                          color: AppColors.bgInput,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${_twoDigits(selectedTime.hour)}:${_twoDigits(selectedTime.minute)} WIB',
                              style: GoogleFonts.spaceMono(color: AppColors.textPrimary, fontSize: 12),
                            ),
                            const Icon(LucideIcons.clock, size: 16, color: AppColors.textMuted),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // 5. PENGATURAN LANJUTAN (ExpansionTile)
                ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  shape: const Border(),
                  collapsedShape: const Border(),
                  title: Text(
                    'Pengaturan Lanjutan (Opsional)',
                    style: GoogleFonts.spaceMono(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.accentCyan,
                    ),
                  ),
                  iconColor: AppColors.accentCyan,
                  collapsedIconColor: AppColors.textMuted,
                  children: [
                    Text(
                      'TAGS (PISAHKAN DENGAN KOMA)',
                      style: GoogleFonts.spaceMono(
                        fontSize: 10,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: tagsController,
                      style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: 'stream, editing, urgent',
                        hintStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMuted),
                        filled: true,
                        fillColor: AppColors.bgInput,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'RESOURCE INFO',
                      style: GoogleFonts.spaceMono(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    TextField(
                      controller: resourceController,
                      style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                      decoration: InputDecoration(
                        hintText: '4K ProRes / VST Plugin',
                        hintStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMuted, fontSize: 12),
                        filled: true,
                        fillColor: AppColors.bgInput,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // TOMBOL SIMPAN / UPDATE
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accentCyan,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    onPressed: () async {
                      final title = titleController.text.trim();
                      if (title.isEmpty) {
                        messenger.showSnackBar(
                          const SnackBar(content: Text('Judul task wajib diisi!')),
                        );
                        return;
                      }

                      // 1. Dialog Konfirmasi
                      final bool? confirmSave = await showDialog<bool>(
                        context: modalContext,
                        builder: (ctx) => AlertDialog(
                          backgroundColor: AppColors.bgSurface,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                            side: const BorderSide(color: AppColors.borderSubtle),
                          ),
                          title: Row(
                            children: [
                              const Icon(LucideIcons.list_todo, color: AppColors.accentCyan, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                isEdit ? 'Konfirmasi Edit Task' : 'Konfirmasi Simpan Task',
                                style: GoogleFonts.spaceGrotesk(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                          content: Text(
                            isEdit
                                ? 'Apakah Anda yakin ingin menyimpan perubahan pada task ini?\n\n"$title"'
                                : 'Apakah Anda yakin ingin menyimpan task ini?\n\n"$title"',
                            style: GoogleFonts.spaceMono(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, false),
                              child: Text(
                                'Batal',
                                style: GoogleFonts.spaceMono(color: AppColors.textMuted),
                              ),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.accentCyan,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              onPressed: () => Navigator.pop(ctx, true),
                              child: Text(
                                'Ya, Simpan',
                                style: GoogleFonts.spaceMono(
                                  color: Colors.black,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );

                      if (confirmSave != true) return;

                      // 2. Olah variabel input
                      final deadline = DateTime(
                        selectedDeadline.year,
                        selectedDeadline.month,
                        selectedDeadline.day,
                        selectedTime.hour,
                        selectedTime.minute,
                      );
                      final tags = tagsController.text
                          .split(',')
                          .map((tag) => tag.trim())
                          .where((tag) => tag.isNotEmpty)
                          .toList();
                      final description = descriptionController.text.trim().isEmpty
                          ? null
                          : descriptionController.text.trim();
                      final resourceInfo = resourceController.text.trim().isEmpty
                          ? null
                          : resourceController.text.trim();

                      // 3. TUTUP MODAL SEGERA (Biar UI mulus dan tidak ada benturan Route)
                      if (modalContext.mounted) {
                        Navigator.pop(modalContext);
                      }

                      // 4. Eksekusi Provider di Background
                      try {
                        if (isEdit) {
                          await ref.read(todoProvider.notifier).updateTodo(
                                id: todoToEdit.id,
                                title: title,
                                description: description,
                                priority: selectedPriority,
                                deadline: deadline,
                                tags: tags,
                                resourceInfo: resourceInfo,
                              );
                        } else {
                          await ref.read(todoProvider.notifier).addTodo(
                                title: title,
                                description: description,
                                priority: selectedPriority,
                                deadline: deadline,
                                tags: tags,
                                resourceInfo: resourceInfo,
                              );
                        }

                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(isEdit ? 'Task berhasil diperbarui!' : 'Task berhasil disimpan!'),
                          ),
                        );
                      } catch (e) {
                        messenger.showSnackBar(
                          SnackBar(content: Text('Gagal menyimpan task: $e')),
                        );
                      }
                    },
                    child: Text(
                      isEdit ? 'Simpan Perubahan' : 'Simpan Task',
                      style: GoogleFonts.spaceGrotesk(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ).whenComplete(() {
      titleController.dispose();
      descriptionController.dispose();
      tagsController.dispose();
      resourceController.dispose();
    });
  }
}