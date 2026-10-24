import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../hooks/useTheme';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit3,
  Clock,
  X,
  Check,
  AlertTriangle,
  Search,
  Calendar,
  Tag,
  Loader2,
  Layers,
  BarChart3,
  ExternalLink,
  Link as LinkIcon,
  RefreshCw,
  Flame,
  CheckCheck,
  LayoutGrid,
  List,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { todoService } from '../../services/todoService';
import { useToast } from '../../components/common/Toast';
import CustomSelect from '../../components/common/CustomSelect';

// ========== CONSTANTS ==========
const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30' },
  { value: 'high',   label: 'High',   badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30' },
  { value: 'medium', label: 'Medium', badge: 'bg-cyan-500/10 text-teal-700 dark:text-cyan-300 border border-cyan-500/30' },
  { value: 'low',    label: 'Low',    badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/30' },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    indicator: 'bg-amber-500',
  },
  in_progress: {
    label: 'Dalam Pengerjaan',
    badge: 'bg-cyan-500/10 text-teal-700 dark:text-cyan-300 border border-cyan-500/30',
    indicator: 'bg-cyan-500',
  },
  completed: {
    label: 'Selesai',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    indicator: 'bg-emerald-500',
  },
};

const CATEGORIES = [
  { id: 'all',     name: 'Semua Kategori',     color: '#7ee0d2' },
  { id: 'stream',  name: 'Stream & Jadwal',   color: '#7ee0d2', badge: 'bg-[#7ee0d2]/15 text-[#7ee0d2] border border-[#7ee0d2]/30' },
  { id: 'content', name: 'Konten & Video',    color: '#c084fc', badge: 'bg-[#c084fc]/15 text-[#c084fc] border border-[#c084fc]/30' },
  { id: 'tech',    name: 'Aset & Teknis',     color: '#60a5fa', badge: 'bg-[#60a5fa]/15 text-[#60a5fa] border border-[#60a5fa]/30' },
  { id: 'social',  name: 'Sosmed & Komunitas',color: '#f472b6', badge: 'bg-[#f472b6]/15 text-[#f472b6] border border-[#f472b6]/30' },
  { id: 'admin',   name: 'Umum & Evaluasi',   color: '#fbbf24', badge: 'bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/30' },
];

// Helper to convert date to YYYY-MM-DD for <input type="date" />
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// Localized date formatting helper
const safeFormatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('id-ID', options);
  } catch {
    return '';
  }
};

// Intelligent deadline helper
const getDeadlineInfo = (deadlineStr, status) => {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));

  if (status === 'completed') {
    return {
      text: target.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      badge: 'bg-bg-surface text-text-muted border border-border-subtle',
      isOverdue: false,
    };
  }

  if (diffDays < 0) {
    return {
      text: `Terlambat ${Math.abs(diffDays)} hari`,
      badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold',
      isOverdue: true,
    };
  } else if (diffDays === 0) {
    return {
      text: 'Hari ini',
      badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold',
      isOverdue: false,
      isToday: true,
    };
  } else if (diffDays === 1) {
    return {
      text: 'Besok',
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      isOverdue: false,
    };
  } else {
    return {
      text: target.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      badge: 'bg-bg-surface text-text-secondary border border-border-subtle',
      isOverdue: false,
    };
  }
};

// Helper to extract category from todo tags
const getTodoCategory = (todo) => {
  let catId = 'stream';
  if (Array.isArray(todo.tags) && todo.tags.length > 0) {
    catId = todo.tags[0];
  } else if (typeof todo.tags === 'string') {
    try {
      const parsed = JSON.parse(todo.tags);
      if (Array.isArray(parsed) && parsed.length > 0) catId = parsed[0];
    } catch {
      if (todo.tags) catId = todo.tags;
    }
  }
  return CATEGORIES.find((c) => c.id === catId) || CATEGORIES[1];
};

function TodoPage() {
  const toast = useToast();
  let theme = 'dark';
  try {
    const themeCtx = useTheme();
    if (themeCtx?.theme) theme = themeCtx.theme;
  } catch {
    theme = 'dark';
  }

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'list' (Studio List) vs 'kanban' (Kanban Board)
  const [viewMode, setViewMode] = useState('list');

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('deadline');

  // Quick-Add Inline state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('stream');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTodo, setDeletingTodo] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'stream',
    priority: 'medium',
    status: 'pending',
    deadline: '',
    resource_info: '',
  });

  // Fetch todos from API
  const fetchTodos = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await todoService.getAll();
      let items = [];

      if (response?.data?.todos) {
        items = response.data.todos;
      } else if (response?.data?.data?.todos) {
        items = response.data.data.todos;
      } else if (Array.isArray(response?.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }

      setTodos(items);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Gagal mengambil daftar todo');
      setTodos([]);
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal || deletingTodo || showClearModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal, deletingTodo, showClearModal]);

  // Compute Stats
  const stats = useMemo(() => {
    const total = todos.length;
    const pending = todos.filter((t) => t.status === 'pending').length;
    const inProgress = todos.filter((t) => t.status === 'in_progress').length;
    const completed = todos.filter((t) => t.status === 'completed').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = todos.filter((t) => {
      if (t.status === 'completed' || !t.deadline) return false;
      const d = new Date(t.deadline);
      d.setHours(0, 0, 0, 0);
      return d < today;
    }).length;

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, pending, inProgress, completed, overdue, percent };
  }, [todos]);

  // Filter & Sort Todos
  const filteredTodos = useMemo(() => {
    let result = [...todos];

    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((t) => {
        const cat = getTodoCategory(t);
        return cat.id === categoryFilter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.resource_info?.toLowerCase().includes(q)
      );
    }

    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    result.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      if (sortBy === 'priority') {
        const diff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
        if (diff !== 0) return diff;
      } else if (sortBy === 'deadline') {
        if (!a.deadline && b.deadline) return 1;
        if (a.deadline && !b.deadline) return -1;
        if (a.deadline && b.deadline) {
          const diff = new Date(a.deadline) - new Date(b.deadline);
          if (diff !== 0) return diff;
        }
      }
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return result;
  }, [todos, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Actions
  const handleToggle = async (todo) => {
    const isNowCompleted = todo.status !== 'completed';
    const nextStatus = isNowCompleted ? 'completed' : 'pending';

    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, status: nextStatus, completed_at: isNowCompleted ? new Date() : null } : t
      )
    );

    try {
      await todoService.toggleComplete(todo.id, isNowCompleted);
      toast.success(isNowCompleted ? 'Tugas diselesaikan' : 'Tugas dikembalikan ke pending');
      fetchTodos(true);
    } catch (error) {
      console.error('Error toggling todo:', error);
      toast.error('Gagal memperbarui status tugas');
      fetchTodos(true);
    }
  };

  const handleStatusChange = async (todo, nextStatus) => {
    if (todo.status === nextStatus) return;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, status: nextStatus, completed_at: nextStatus === 'completed' ? new Date() : null } : t
      )
    );

    try {
      await todoService.updateStatus(todo.id, nextStatus);
      const label = STATUS_CONFIG[nextStatus]?.label || nextStatus;
      toast.success(`Status diubah ke ${label}`);
      fetchTodos(true);
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error('Gagal mengubah status');
      fetchTodos(true);
    }
  };

  // Quick Add task inline
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setIsQuickAdding(true);
    try {
      await todoService.create({
        title: quickTitle.trim(),
        tags: [quickCategory],
        priority: quickPriority,
        status: 'pending',
      });
      toast.success('Tugas baru berhasil ditambahkan!');
      setQuickTitle('');
      fetchTodos(true);
    } catch (error) {
      console.error('Error quick adding todo:', error);
      toast.error('Gagal menambahkan tugas cepat');
    } finally {
      setIsQuickAdding(false);
    }
  };

  // Save Modal (Create or Update)
  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Judul tugas wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        status: formData.status,
        deadline: formData.deadline || null,
        tags: [formData.category],
        resource_info: formData.resource_info.trim() || null,
      };

      if (editingTodo) {
        await todoService.update(editingTodo.id, payload);
        toast.success('Todo berhasil diperbarui');
      } else {
        await todoService.create(payload);
        toast.success('Todo baru berhasil ditambahkan');
      }

      closeModal();
      fetchTodos(true);
    } catch (error) {
      console.error('Error saving todo:', error);
      toast.error('Gagal menyimpan todo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTodo) return;

    try {
      await todoService.delete(deletingTodo.id);
      toast.success('Todo berhasil dihapus');
      setDeletingTodo(null);
      fetchTodos(true);
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Gagal menghapus todo');
    }
  };

  // Clear all completed todos
  const handleClearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.status === 'completed');
    if (completedTodos.length === 0) return;

    setIsSubmitting(true);
    try {
      await Promise.all(completedTodos.map((t) => todoService.delete(t.id)));
      toast.success(`${completedTodos.length} tugas selesai telah dibersihkan.`);
      setShowClearModal(false);
      fetchTodos(true);
    } catch (error) {
      console.error('Error clearing completed todos:', error);
      toast.error('Gagal membersihkan tugas selesai');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreate = () => {
    setEditingTodo(null);
    setFormData({
      title: '',
      description: '',
      category: categoryFilter !== 'all' ? categoryFilter : 'stream',
      priority: 'medium',
      status: 'pending',
      deadline: '',
      resource_info: '',
    });
    setShowModal(true);
  };

  const openEdit = (todo) => {
    setEditingTodo(todo);
    const cat = getTodoCategory(todo);
    setFormData({
      title: todo.title || '',
      description: todo.description || '',
      category: cat.id,
      priority: todo.priority || 'medium',
      status: todo.status || 'pending',
      deadline: formatDateForInput(todo.deadline),
      resource_info: todo.resource_info || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTodo(null);
    setIsSubmitting(false);
  };

  // Helper render clean task card
  const renderTaskCard = (todo) => {
    const isCompleted = todo.status === 'completed';
    const isInProgress = todo.status === 'in_progress';
    const category = getTodoCategory(todo);
    const priorityInfo = PRIORITIES.find((p) => p.value === todo.priority) || PRIORITIES[2];
    const deadlineInfo = getDeadlineInfo(todo.deadline, todo.status);

    return (
      <div
        key={todo.id}
        className={`group relative rounded-2xl border p-4 transition-all duration-200 ${
          isCompleted
            ? 'bg-bg-card/50 border-border-subtle/60 opacity-80'
            : isInProgress
            ? 'bg-bg-card border-cyan-500/40 shadow-sm'
            : 'bg-bg-card border-border-subtle hover:border-accent-cyan/40 shadow-sm'
        }`}
      >
        <div className="flex items-start gap-3 sm:gap-3.5">
          {/* Checkbox */}
          <button
            type="button"
            onClick={() => handleToggle(todo)}
            title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
            className="mt-0.5 flex-shrink-0 group/btn focus:outline-none"
            aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          >
            <div
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                isCompleted
                  ? 'bg-emerald-500 border-emerald-500 shadow-sm'
                  : isInProgress
                  ? 'border-cyan-400 bg-cyan-400/10 group-hover/btn:border-cyan-300'
                  : 'border-border-subtle bg-bg-surface group-hover/btn:border-accent-cyan'
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5 text-bg-base stroke-[3]" />
              ) : isInProgress ? (
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-transparent group-hover/btn:bg-accent-cyan/40 transition-all" />
              )}
            </div>
          </button>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${
                isCompleted
                  ? 'line-through text-text-muted'
                  : 'text-text-primary group-hover:text-accent-cyan'
              }`}
            >
              {todo.title}
            </h3>

            {todo.description && (
              <p
                className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                  isCompleted ? 'text-text-muted/70 line-through' : 'text-text-secondary'
                }`}
              >
                {todo.description}
              </p>
            )}

            {/* Badges bar */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-border-subtle/50 text-xs">
              {/* Category */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${category.badge}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: category.color }} />
                {category.name}
              </span>

              {/* Priority */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${priorityInfo.badge}`}>
                {priorityInfo.value === 'urgent' && <Flame className="w-3 h-3" />}
                {priorityInfo.label}
              </span>

              {/* Status Select */}
              <div className="w-32">
                <CustomSelect
                  value={todo.status || 'pending'}
                  onChange={(e) => handleStatusChange(todo, e.target.value)}
                  options={[
                    { value: 'pending',     label: 'Pending' },
                    { value: 'in_progress', label: 'Pengerjaan' },
                    { value: 'completed',   label: 'Selesai' },
                  ]}
                  size="sm"
                  aria-label="Ubah Status Todo"
                />
              </div>

              {/* Deadline */}
              {deadlineInfo && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] ${deadlineInfo.badge}`}>
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>{deadlineInfo.text}</span>
                </span>
              )}

              {/* Resource */}
              {todo.resource_info && (
                <a
                  href={todo.resource_info.startsWith('http') ? todo.resource_info : `https://${todo.resource_info}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-accent-cyan hover:underline bg-accent-cyan/10 px-2 py-0.5 rounded-md border border-accent-cyan/20"
                  title={todo.resource_info}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span className="max-w-[120px] truncate">Tautan Referensi</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}

              {/* Completed time */}
              {isCompleted && todo.completed_at && (
                <span className="text-[11px] text-text-muted ml-auto hidden sm:inline font-mono">
                  Selesai: {safeFormatDate(todo.completed_at, { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => openEdit(todo)}
              className="p-2 text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
              title="Edit Todo"
              aria-label="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingTodo(todo)}
              className="p-2 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Hapus Todo"
              aria-label="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* ── 1. Page Header & Command Toolbar ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-bg-card border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Todo List
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Kelola checklist tugas, persiapan stream, dan target operasional studio
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Dual View Mode Switcher */}
          <div className="flex items-center p-1 bg-bg-surface border border-border-subtle rounded-xl h-9">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`h-7 px-2.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-accent-cyan/15 text-accent-cyan font-bold border border-accent-cyan/30 shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Daftar Checklist"
              aria-label="Tampilan Daftar Checklist"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">Daftar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`h-7 px-2.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-accent-cyan/15 text-accent-cyan font-bold border border-accent-cyan/30 shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Tampilan Papan Kanban"
              aria-label="Tampilan Papan Kanban"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-mono">Kanban</span>
            </button>
          </div>

          {/* Refresh Manual */}
          <button
            type="button"
            onClick={() => fetchTodos()}
            disabled={loading}
            className="h-9 flex items-center gap-1.5 px-3.5 text-xs font-semibold text-text-secondary bg-bg-surface border border-border-subtle rounded-xl hover:bg-bg-card-hover transition-colors disabled:opacity-50"
            title="Muat ulang daftar todo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Bersihkan Selesai Button (If completed > 0) */}
          {stats.completed > 0 && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="h-9 flex items-center gap-1.5 px-3.5 text-xs font-semibold text-status-live bg-status-live/10 border border-status-live/30 rounded-xl hover:bg-status-live/20 transition-colors"
              title="Bersihkan semua tugas yang sudah selesai"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bersihkan Selesai ({stats.completed})</span>
            </button>
          )}

          {/* Tambah Todo Button */}
          <button
            type="button"
            onClick={openCreate}
            className="h-9 flex items-center gap-1.5 px-4 text-xs font-bold bg-accent-cyan text-white rounded-xl hover:bg-accent-cyan-hover active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tambah Todo</span>
          </button>
        </div>
      </div>

      {/* ── 2. Integrated Metric Ribbon & Smart Progress Strip ────────────────── */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Tugas */}
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`
              p-3.5 rounded-xl border text-left transition-all hover:bg-bg-surface
              ${statusFilter === 'all'
                ? 'bg-accent-purple/10 border-accent-purple/50 shadow-sm'
                : 'bg-bg-surface/50 border-border-subtle hover:border-accent-purple/40'}
            `}
          >
            <div className="flex items-center justify-between text-xs text-text-muted mb-1">
              <span className="font-medium text-text-secondary">Total Tugas</span>
              <Layers className="w-4 h-4 text-accent-purple" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-text-primary">
              {stats.total}
            </div>
          </button>

          {/* Pending */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
            className={`
              p-3.5 rounded-xl border text-left transition-all hover:bg-bg-surface
              ${statusFilter === 'pending'
                ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                : 'bg-bg-surface/50 border-border-subtle hover:border-amber-500/30'}
            `}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-amber-700 dark:text-amber-300">Pending</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-text-primary">
              {stats.pending}
            </div>
          </button>

          {/* Dikerjakan */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
            className={`
              p-3.5 rounded-xl border text-left transition-all hover:bg-bg-surface
              ${statusFilter === 'in_progress'
                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-sm'
                : 'bg-bg-surface/50 border-border-subtle hover:border-cyan-500/30'}
            `}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-teal-700 dark:text-cyan-300">Dikerjakan</span>
              <RefreshCw className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-text-primary">
              {stats.inProgress}
            </div>
          </button>

          {/* Selesai */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
            className={`
              p-3.5 rounded-xl border text-left transition-all hover:bg-bg-surface
              ${statusFilter === 'completed'
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                : 'bg-bg-surface/50 border-border-subtle hover:border-emerald-500/30'}
            `}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-emerald-700 dark:text-emerald-300">Selesai</span>
              <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-text-primary">
              {stats.completed}
            </div>
          </button>

          {/* Terlambat */}
          <div className="p-3.5 rounded-xl border border-border-subtle bg-bg-surface/50 text-left col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={`font-medium ${stats.overdue > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-text-muted'}`}>Terlambat</span>
              <AlertTriangle className={`w-4 h-4 ${stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-text-muted'}`} />
            </div>
            <div className={`text-xl sm:text-2xl font-bold font-mono ${stats.overdue > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-text-primary'}`}>
              {stats.overdue}
            </div>
          </div>
        </div>

        {/* Integrated Progress Strip */}
        <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <BarChart3 className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="text-text-muted">Progres Penyelesaian:</span>
            <strong className="text-text-primary font-mono">
              {stats.completed} dari {stats.total} tugas ({stats.percent}%)
            </strong>
          </div>
          <div className="w-full sm:max-w-sm h-2 bg-bg-surface rounded-full overflow-hidden border border-border-subtle">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-accent-cyan to-accent-purple"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 3. Quick-Add Inline Bar ──────────────────────────────────────────── */}
      <form
        onSubmit={handleQuickAdd}
        className="bg-bg-card border border-border-subtle rounded-2xl p-2.5 sm:p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Tambah tugas cepat (ketik lalu tekan Enter)..."
            className="w-full pl-3.5 pr-3 py-2 bg-bg-surface border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Select */}
          <div className="w-36">
            <CustomSelect
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              options={CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              size="sm"
              aria-label="Kategori Cepat"
            />
          </div>

          {/* Priority Select */}
          <div className="w-28">
            <CustomSelect
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value)}
              options={PRIORITIES.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              size="sm"
              aria-label="Prioritas Cepat"
            />
          </div>

          {/* Quick Submit Button */}
          <button
            type="submit"
            disabled={!quickTitle.trim() || isQuickAdding}
            className="h-8 px-4 text-xs font-bold bg-accent-cyan text-white rounded-xl hover:bg-accent-cyan-hover transition-all disabled:opacity-40 flex-shrink-0"
          >
            {isQuickAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '+ Tambah'}
          </button>
        </div>
      </form>

      {/* ── 4. Controller: Search, Filter Tabs, Categories & Sort ────────────── */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-3 shadow-sm">
        {/* Row 1: Search, Status Tabs, Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { key: 'all',         label: 'SEMUA',       count: stats.total },
              { key: 'pending',     label: 'PENDING',     count: stats.pending },
              { key: 'in_progress', label: 'DIKERJAKAN',  count: stats.inProgress },
              { key: 'completed',   label: 'SELESAI',     count: stats.completed },
            ].map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`
                    px-3 py-2 text-xs font-mono font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5
                    ${isActive
                      ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/35 shadow-xs font-bold'
                      : 'bg-bg-surface text-text-muted hover:text-text-primary border border-border-subtle'}
                  `}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-bg-card text-text-muted'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, deskripsi..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="w-44">
              <CustomSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'deadline', label: 'Batas Waktu Terdekat' },
                  { value: 'priority', label: 'Prioritas Tertinggi' },
                  { value: 'newest',   label: 'Terbaru Dibuat' },
                ]}
                size="sm"
                aria-label="Urutkan Todo"
              />
            </div>

            {/* Reset */}
            {(statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery !== '') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-accent-cyan hover:underline whitespace-nowrap px-2 py-1 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Category Pills */}
        <div className="pt-2 border-t border-border-subtle flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-text-muted font-medium flex-shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Kategori:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((cat) => {
              const count = cat.id === 'all'
                ? todos.length
                : todos.filter((t) => getTodoCategory(t).id === cat.id).length;

              const isActive = categoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/40 shadow-sm font-semibold'
                      : 'bg-bg-surface border border-border-subtle text-text-muted hover:text-text-primary hover:bg-bg-surface/80'
                  }`}
                >
                  {cat.id !== 'all' && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                  )}
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 5. Main Content: List View vs Kanban Board ───────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-bg-card border border-border-subtle rounded-2xl">
          <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-3" />
          <p className="text-sm text-text-muted">Memuat daftar tugas...</p>
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="text-center py-16 bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mx-auto mb-4">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Tidak ada todo yang sesuai filter'
              : 'Belum ada todo'}
          </h3>
          <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto mb-5">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Coba atur ulang kata kunci pencarian atau ubah filter status/kategori.'
              : 'Mulai buat tugas pertama Anda untuk mengorganisir jadwal dan persiapan stream.'}
          </p>
          {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="px-4 py-2 bg-bg-surface border border-border-subtle hover:border-accent-cyan/40 rounded-xl text-xs font-semibold text-text-primary transition-all"
            >
              Reset Semua Filter
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-cyan text-bg-base font-bold rounded-xl text-xs shadow-md shadow-accent-cyan/20 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Todo Baru</span>
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        // ── List View ──
        <div className="space-y-3">
          {filteredTodos.map((todo) => renderTaskCard(todo))}
        </div>
      ) : (
        // ── Kanban Board View (3 Columns) ──
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Column 1: Pending */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                  Menunggu (Pending)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20">
                {filteredTodos.filter((t) => t.status === 'pending').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {filteredTodos.filter((t) => t.status === 'pending').length === 0 ? (
                <div className="py-8 text-center text-text-muted text-xs">
                  Tidak ada tugas pending
                </div>
              ) : (
                filteredTodos
                  .filter((t) => t.status === 'pending')
                  .map((todo) => (
                    <div key={todo.id} className="space-y-2">
                      {renderTaskCard(todo)}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(todo, 'in_progress')}
                        className="w-full py-1 text-center text-[11px] font-mono text-cyan-400 bg-cyan-400/5 hover:bg-cyan-400/15 rounded-lg border border-cyan-400/20 transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Mulai Kerjakan</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                  Dalam Pengerjaan
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                {filteredTodos.filter((t) => t.status === 'in_progress').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {filteredTodos.filter((t) => t.status === 'in_progress').length === 0 ? (
                <div className="py-8 text-center text-text-muted text-xs">
                  Tidak ada tugas sedang dikerjakan
                </div>
              ) : (
                filteredTodos
                  .filter((t) => t.status === 'in_progress')
                  .map((todo) => (
                    <div key={todo.id} className="space-y-2">
                      {renderTaskCard(todo)}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(todo, 'pending')}
                          className="py-1 text-center text-[11px] font-mono text-text-muted hover:text-text-primary bg-bg-surface rounded-lg border border-border-subtle transition-colors flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Pending</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(todo, 'completed')}
                          className="py-1 text-center text-[11px] font-mono text-emerald-400 bg-emerald-400/5 hover:bg-emerald-400/15 rounded-lg border border-emerald-400/20 transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Selesai</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                  Telah Selesai
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                {filteredTodos.filter((t) => t.status === 'completed').length}
              </span>
            </div>

            <div className="space-y-3 min-h-[160px]">
              {filteredTodos.filter((t) => t.status === 'completed').length === 0 ? (
                <div className="py-8 text-center text-text-muted text-xs">
                  Belum ada tugas diselesaikan
                </div>
              ) : (
                filteredTodos
                  .filter((t) => t.status === 'completed')
                  .map((todo) => (
                    <div key={todo.id} className="space-y-2">
                      {renderTaskCard(todo)}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(todo, 'pending')}
                        className="w-full py-1 text-center text-[11px] font-mono text-text-muted hover:text-amber-400 bg-bg-surface rounded-lg border border-border-subtle transition-colors flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Buka Kembali Tugas</span>
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Form Modal (Tambah / Edit) ────────────────────────────────────── */}
      {showModal && createPortal(
        <div
          data-admin-theme={theme}
          data-theme={theme}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-2xl shadow-2xl animate-scale-in max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-7 py-5.5 sm:px-8 sm:py-6 border-b border-border-subtle flex-shrink-0 bg-bg-surface/85 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25 flex items-center justify-center shrink-0 shadow-xs">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-display text-text-primary leading-tight">
                    {editingTodo ? 'Edit Todo' : 'Tambah Todo Baru'}
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
                    Isi detail tugas checklist kerja dan deadline operasional
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors border border-transparent hover:border-border-subtle shrink-0"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="flex-1 min-h-0 overflow-y-auto px-7 py-6 sm:px-8 sm:py-7 space-y-6 overscroll-contain">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-2">
                  Judul Tugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Buat thumbnail & overlay stream collab..."
                  className="w-full px-4 py-3 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-2">
                  Kategori
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-medium border text-left flex items-center gap-2.5 transition-all ${
                          isSelected
                            ? 'bg-accent-cyan/15 border-accent-cyan text-accent-cyan font-semibold shadow-xs ring-1 ring-accent-cyan/30'
                            : 'bg-bg-surface border-border-subtle text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary hover:bg-bg-card'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-2">
                  Prioritas
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRIORITIES.map((p) => {
                    const isSelected = formData.priority === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, priority: p.value }))}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                          isSelected
                            ? `${p.badge} ring-1 ring-current shadow-xs`
                            : 'bg-bg-surface border-border-subtle text-text-muted hover:text-text-primary hover:border-border-active'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status & Deadline (Side by Side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-2">
                    Status
                  </label>
                  <CustomSelect
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    options={[
                      { value: 'pending',     label: 'Pending (Menunggu)' },
                      { value: 'in_progress', label: 'Dalam Pengerjaan' },
                      { value: 'completed',   label: 'Selesai' },
                    ]}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-2">
                    Batas Waktu (Deadline)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                      className="w-full px-4 py-2.5 sm:py-3 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all"
                    />
                    {formData.deadline && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, deadline: '' }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-text-muted hover:text-rose-500 font-medium hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-2">
                  Deskripsi / Catatan Tambahan <span className="text-[11px] text-text-muted font-normal">(Opsional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Rincian catatan tugas, instruksi pengerjaan, atau poin penting..."
                  rows={3}
                  className="w-full px-4 py-3 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Resource Info */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-2">
                  Tautan Sumber / Dokumen <span className="text-[11px] text-text-muted font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={formData.resource_info}
                    onChange={(e) => setFormData((prev) => ({ ...prev, resource_info: e.target.value }))}
                    placeholder="Contoh: https://drive.google.com/... atau tautan aset figma / drive"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-bg-surface border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-cyan/30 focus:border-accent-cyan transition-colors"
                  />
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3.5 px-7 py-4.5 sm:px-8 sm:py-5 border-t border-border-subtle flex-shrink-0 bg-bg-surface/85 backdrop-blur-md">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!formData.title.trim() || isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-cyan text-white font-semibold rounded-xl text-xs hover:bg-accent-cyan-hover disabled:opacity-50 transition-all shadow-sm"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingTodo ? 'Simpan Perubahan' : 'Buat Todo'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 7. Delete Confirmation Modal ─────────────────────────────────────── */}
      {deletingTodo && createPortal(
        <div
          data-admin-theme={theme}
          data-theme={theme}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setDeletingTodo(null)}
        >
          <div className="bg-bg-card border border-border-subtle rounded-3xl p-7 sm:p-8 w-full max-w-sm shadow-2xl animate-scale-in text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text-primary">Hapus Todo Ini?</h3>
              <p className="text-xs text-text-muted line-clamp-2 mt-1 leading-relaxed">
                Tugas <strong className="text-text-primary">"{deletingTodo.title}"</strong> akan dihapus permanen.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTodo(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-surface border border-border-subtle transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 8. Clear Completed Confirmation Modal ────────────────────────────── */}
      {showClearModal && createPortal(
        <div
          data-admin-theme={theme}
          data-theme={theme}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowClearModal(false)}
        >
          <div className="bg-bg-card border border-border-subtle rounded-3xl p-7 sm:p-8 w-full max-w-sm shadow-2xl animate-scale-in text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-status-live/15 border border-status-live/30 flex items-center justify-center text-status-live mx-auto shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text-primary">Bersihkan Tugas Selesai?</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Sebanyak <strong className="text-text-primary font-mono">{stats.completed} tugas</strong> yang telah selesai akan dihapus permanen.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-surface border border-border-subtle transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleClearCompleted}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-status-live hover:opacity-95 transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Bersihkan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

export default TodoPage;
