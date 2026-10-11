import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_lucide/flutter_lucide.dart';
import '../../core/theme/app_theme.dart';

class TodoTask {
  final String id;
  final String title;
  final String subtitle;
  final String category;
  bool isCompleted;
  final bool isUrgent;

  TodoTask({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.category,
    this.isCompleted = false,
    this.isUrgent = false,
  });
}

class TodoScreen extends ConsumerStatefulWidget {
  const TodoScreen({super.key});

  @override
  ConsumerState<TodoScreen> createState() => _TodoScreenState();
}

class _TodoScreenState extends ConsumerState<TodoScreen> {
  String _activeFilter = 'ALL'; // 'ALL', 'PENDING', 'DONE'

  final List<TodoTask> _tasks = [
    TodoTask(
      id: 't1',
      title: 'Check OBS Audio Filters',
      subtitle: 'Virtual DSP gain compensation (-3.2dB)',
      category: 'AUDIO / OBS',
      isCompleted: false,
      isUrgent: true,
    ),
    TodoTask(
      id: 't2',
      title: 'Render YouTube Shorts',
      subtitle: 'Clip 1080x1920 60FPS high-moments',
      category: 'CONTENT',
      isCompleted: false,
      isUrgent: false,
    ),
    TodoTask(
      id: 't3',
      title: 'Update Stream Overlay Layout',
      subtitle: 'Fix chat widget z-index & border radius in Browser Source',
      category: 'STREAM SETUP',
      isCompleted: true,
      isUrgent: false,
    ),
    TodoTask(
      id: 't4',
      title: 'Backup Save File Resident Evil 4',
      subtitle: 'Save state sebelum chapter Professional Mode',
      category: 'GAME DATA',
      isCompleted: false,
      isUrgent: true,
    ),
    TodoTask(
      id: 't5',
      title: 'Schedule Thumbnail Canva Design',
      subtitle: 'Export 1920x1080 PNG for weekend stream schedule',
      category: 'DESIGN',
      isCompleted: true,
      isUrgent: false,
    ),
  ];

  List<TodoTask> get _filteredTasks {
    if (_activeFilter == 'PENDING') {
      return _tasks.where((t) => !t.isCompleted).toList();
    } else if (_activeFilter == 'DONE') {
      return _tasks.where((t) => t.isCompleted).toList();
    }
    return _tasks;
  }

  @override
  Widget build(BuildContext context) {
    final completedCount = _tasks.where((t) => t.isCompleted).length;

    return Scaffold(
      backgroundColor: AppColors.bgBase,
      appBar: AppBar(
        backgroundColor: AppColors.bgNav,
        elevation: 0,
        title: Text(
          'TASKS & CHECKLIST',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
            letterSpacing: 1,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus, color: AppColors.accentCyan),
            onPressed: () => _showAddTaskDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Header Stats & Filter Chips
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.bgNav,
            child: Column(
              children: [
                // Progress Bar Container
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.bgSurface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.list_checks, color: AppColors.accentCyan, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'PROGRESS TASKS',
                                  style: GoogleFonts.spaceMono(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                Text(
                                  '$completedCount / ${_tasks.length} Selesai',
                                  style: GoogleFonts.spaceMono(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.accentCyan,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: _tasks.isEmpty ? 0 : completedCount / _tasks.length,
                                backgroundColor: AppColors.bgInput,
                                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accentCyan),
                                minHeight: 6,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Filter Buttons
                Row(
                  children: [
                    _buildFilterChip('ALL', 'Semua (${_tasks.length})'),
                    const SizedBox(width: 8),
                    _buildFilterChip('PENDING', 'Pending (${_tasks.length - completedCount})'),
                    const SizedBox(width: 8),
                    _buildFilterChip('DONE', 'Selesai ($completedCount)'),
                  ],
                ),
              ],
            ),
          ),

          // List Tasks
          Expanded(
            child: _filteredTasks.isEmpty
                ? Center(
                    child: Text(
                      'Tidak ada task di kategori ini.',
                      style: GoogleFonts.spaceGrotesk(color: AppColors.textMuted),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredTasks.length,
                    itemBuilder: (context, index) {
                      final task = _filteredTasks[index];
                      return _buildTaskCard(task);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final bool isSelected = _activeFilter == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeFilter = key),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.accentCyan.withOpacity(0.15) : AppColors.bgSurface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? AppColors.accentCyan : AppColors.borderSubtle,
            ),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isSelected ? AppColors.accentCyan : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTaskCard(TodoTask task) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: task.isUrgent && !task.isCompleted
              ? AppColors.accentRed.withOpacity(0.5)
              : AppColors.borderSubtle,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Checkbox Toggle
          GestureDetector(
            onTap: () {
              setState(() {
                task.isCompleted = !task.isCompleted;
              });
            },
            child: Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: task.isCompleted ? AppColors.accentCyan : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: task.isCompleted ? AppColors.accentCyan : AppColors.textMuted,
                  width: 1.5,
                ),
              ),
              child: task.isCompleted
                  ? const Icon(LucideIcons.check, size: 14, color: Colors.black)
                  : null,
            ),
          ),
          const SizedBox(width: 12),

          // Content Text
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.bgInput,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        task.category,
                        style: GoogleFonts.spaceMono(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    if (task.isUrgent && !task.isCompleted) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.accentRed.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'URGENT',
                          style: GoogleFonts.spaceMono(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: AppColors.accentRed,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  task.title,
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: task.isCompleted ? AppColors.textMuted : AppColors.textPrimary,
                    decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  task.subtitle,
                  style: GoogleFonts.spaceMono(
                    fontSize: 10,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),

          // Delete Action
          // Delete Action
          IconButton(
            icon: const Icon(LucideIcons.trash, size: 16, color: AppColors.textMuted),
            onPressed: () {
              setState(() {
                _tasks.removeWhere((t) => t.id == task.id);
              });
            },
          ),
        ],
      ),
    );
  }

  void _showAddTaskDialog(BuildContext context) {
    final titleController = TextEditingController();
    final subTitleController = TextEditingController();
    bool isUrgent = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'TAMBAH TASK BARU',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: titleController,
                style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: 'Judul Task',
                  labelStyle: GoogleFonts.spaceGrotesk(color: AppColors.textSecondary),
                  filled: true,
                  fillColor: AppColors.bgInput,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: subTitleController,
                style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary),
                decoration: InputDecoration(
                  labelText: 'Keterangan / Detail',
                  labelStyle: GoogleFonts.spaceGrotesk(color: AppColors.textSecondary),
                  filled: true,
                  fillColor: AppColors.bgInput,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Checkbox(
                    value: isUrgent,
                    activeColor: AppColors.accentRed,
                    onChanged: (val) => setModalState(() => isUrgent = val ?? false),
                  ),
                  Text(
                    'Tandai sebagai Urgent',
                    style: GoogleFonts.spaceGrotesk(color: AppColors.textPrimary, fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentCyan,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    if (titleController.text.trim().isNotEmpty) {
                      setState(() {
                        _tasks.insert(
                          0,
                          TodoTask(
                            id: DateTime.now().millisecondsSinceEpoch.toString(),
                            title: titleController.text.trim(),
                            subtitle: subTitleController.text.trim().isEmpty
                                ? 'Tidak ada keterangan detail'
                                : subTitleController.text.trim(),
                            category: 'GENERAL',
                            isUrgent: isUrgent,
                          ),
                        );
                      });
                      Navigator.pop(context);
                    }
                  },
                  child: Text(
                    'Simpan Task',
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
    );
  }
}