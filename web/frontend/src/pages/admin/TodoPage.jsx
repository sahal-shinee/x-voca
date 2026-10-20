import { useState, useEffect, useMemo } from 'react';
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
  Filter,
  Calendar,
  Tag,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  AlertCircle,
  Layers,
  BarChart3,
  ChevronDown,
  ExternalLink,
  Link as LinkIcon,
  RefreshCw,
  Flame,
  CheckCheck
} from 'lucide-react';
import { todoService } from '../../services/todoService';
import { useToast } from '../../components/common/Toast';

// ========== CONSTANTS ==========
const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', badge: 'bg-rose-500/15 text-rose-300 border border-rose-500/30' },
  { value: 'high', label: 'High', badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/30' },
  { value: 'medium', label: 'Medium', badge: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' },
  { value: 'low', label: 'Low', badge: 'bg-slate-500/15 text-slate-300 border border-slate-500/30' },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-400/15 text-amber-300 border border-amber-400/30',
    indicator: 'bg-amber-400'
  },
  in_progress: {
    label: 'Dalam Pengerjaan',
    badge: 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/30',
    indicator: 'bg-cyan-400'
  },
  completed: {
    label: 'Selesai',
    badge: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30',
    indicator: 'bg-emerald-400'
  }
};

const CATEGORIES = [
  { id: 'all', name: 'Semua Kategori', color: '#7ee0d2' },
  { id: 'stream', name: 'Stream & Jadwal', color: '#7ee0d2', badge: 'bg-[#7ee0d2]/15 text-[#7ee0d2] border border-[#7ee0d2]/30' },
  { id: 'content', name: 'Konten & Video', color: '#c084fc', badge: 'bg-[#c084fc]/15 text-[#c084fc] border border-[#c084fc]/30' },
  { id: 'tech', name: 'Aset & Teknis', color: '#60a5fa', badge: 'bg-[#60a5fa]/15 text-[#60a5fa] border border-[#60a5fa]/30' },
  { id: 'social', name: 'Sosmed & Komunitas', color: '#f472b6', badge: 'bg-[#f472b6]/15 text-[#f472b6] border border-[#f472b6]/30' },
  { id: 'admin', name: 'Umum & Evaluasi', color: '#fbbf24', badge: 'bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/30' },
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
      isOverdue: false
    };
  }

  if (diffDays < 0) {
    return {
      text: `Terlambat ${Math.abs(diffDays)} hari`,
      badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold',
      isOverdue: true
    };
  } else if (diffDays === 0) {
    return {
      text: 'Hari ini',
      badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold',
      isOverdue: false,
      isToday: true
    };
  } else if (diffDays === 1) {
    return {
      text: 'Besok',
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      isOverdue: false
    };
  } else {
    return {
      text: target.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      badge: 'bg-bg-surface text-text-secondary border border-border-subtle',
      isOverdue: false
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
  return CATEGORIES.find(c => c.id === catId) || CATEGORIES[1];
};

function TodoPage() {
  const toast = useToast();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'in_progress' | 'completed'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' | 'priority' | 'newest'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingTodo, setDeletingTodo] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'stream',
    priority: 'medium',
    status: 'pending',
    deadline: '',
    resource_info: ''
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

  // Compute Stats
  const stats = useMemo(() => {
    const total = todos.length;
    const pending = todos.filter(t => t.status === 'pending').length;
    const inProgress = todos.filter(t => t.status === 'in_progress').length;
    const completed = todos.filter(t => t.status === 'completed').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = todos.filter(t => {
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

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Category Filter
    if (categoryFilter !== 'all') {
      result = result.filter(t => {
        const cat = getTodoCategory(t);
        return cat.id === categoryFilter;
      });
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.resource_info?.toLowerCase().includes(q)
      );
    }

    // Sort
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    result.sort((a, b) => {
      // Keep completed items at bottom when sorting by deadline or priority
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
      // Fallback: newest created
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return result;
  }, [todos, statusFilter, categoryFilter, searchQuery, sortBy]);

  // ========== CRUD ACTIONS ==========

  // 1-Click Toggle: switches pending/in_progress -> completed, or completed -> pending
  const handleToggle = async (todo) => {
    const isNowCompleted = todo.status !== 'completed';
    const nextStatus = isNowCompleted ? 'completed' : 'pending';

    // Optimistic update
    setTodos(prev => prev.map(t =>
      t.id === todo.id ? { ...t, status: nextStatus, completed_at: isNowCompleted ? new Date() : null } : t
    ));

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

  // Change status directly (pending <-> in_progress <-> completed)
  const handleStatusChange = async (todo, nextStatus) => {
    if (todo.status === nextStatus) return;

    // Optimistic update
    setTodos(prev => prev.map(t =>
      t.id === todo.id ? { ...t, status: nextStatus, completed_at: nextStatus === 'completed' ? new Date() : null } : t
    ));

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

  // Save (Create or Update)
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
        resource_info: formData.resource_info.trim() || null
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

  // Delete
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

  // Open Create Modal
  const openCreate = () => {
    setEditingTodo(null);
    setFormData({
      title: '',
      description: '',
      category: categoryFilter !== 'all' ? categoryFilter : 'stream',
      priority: 'medium',
      status: 'pending',
      deadline: '',
      resource_info: ''
    });
    setShowModal(true);
  };

  // Open Edit Modal
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
      resource_info: todo.resource_info || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTodo(null);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 rounded-full bg-accent-cyan" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Todo List</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Kelola checklist tugas, persiapan stream, dan target operasional
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-cyan text-bg-base rounded-xl hover:bg-accent-cyan/90 transition-all font-semibold text-sm shadow-lg shadow-accent-cyan/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Todo</span>
        </button>
      </div>

      {/* ========== STATS CARDS & PROGRESS ========== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Card */}
        <div className="bg-bg-card/90 backdrop-blur-md border border-border-subtle rounded-xl p-4 transition-all hover:border-accent-purple/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text-muted">Total Tugas</span>
            <div className="w-8 h-8 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">{stats.total}</div>
        </div>

        {/* Pending Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`cursor-pointer bg-bg-card/90 backdrop-blur-md border rounded-xl p-4 transition-all hover:border-amber-400/50 ${
            statusFilter === 'pending' ? 'border-amber-400/60 bg-amber-400/5 shadow-md shadow-amber-400/10' : 'border-border-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-amber-300">Pending</span>
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{stats.pending}</div>
        </div>

        {/* In Progress Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
          className={`cursor-pointer bg-bg-card/90 backdrop-blur-md border rounded-xl p-4 transition-all hover:border-cyan-400/50 ${
            statusFilter === 'in_progress' ? 'border-cyan-400/60 bg-cyan-400/5 shadow-md shadow-cyan-400/10' : 'border-border-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-cyan-300">Dikerjakan</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{stats.inProgress}</div>
        </div>

        {/* Completed Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`cursor-pointer bg-bg-card/90 backdrop-blur-md border rounded-xl p-4 transition-all hover:border-emerald-400/50 ${
            statusFilter === 'completed' ? 'border-emerald-400/60 bg-emerald-400/5 shadow-md shadow-emerald-400/10' : 'border-border-subtle'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-emerald-300">Selesai</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{stats.completed}</div>
        </div>

        {/* Overdue Alert Card */}
        <div className="bg-bg-card/90 backdrop-blur-md border border-border-subtle rounded-xl p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-rose-300">Terlambat</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              stats.overdue > 0 ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse' : 'bg-bg-surface text-text-muted border border-border-subtle'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${stats.overdue > 0 ? 'text-rose-400' : 'text-text-primary'}`}>
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* ========== COMPLETION PROGRESS BAR ========== */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan flex-shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-text-muted font-medium">Progres Penyelesaian</div>
            <div className="text-sm font-semibold text-text-primary">
              {stats.completed} dari {stats.total} tugas selesai ({stats.percent}%)
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md w-full">
          <div className="w-full h-2.5 bg-bg-surface rounded-full overflow-hidden border border-border-subtle">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${stats.percent}%`,
                background: 'linear-gradient(90deg, #7ee0d2, #5bc4b8, #c084fc)'
              }}
            />
          </div>
        </div>
      </div>

      {/* ========== CONTROLS: SEARCH, STATUS TABS, CATEGORY PILLS ========== */}
      <div className="space-y-3 bg-bg-card/70 border border-border-subtle rounded-xl p-4">
        {/* Top row: Search + Status Tabs + Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, deskripsi, referensi..."
              className="w-full pl-9 pr-8 py-2 bg-bg-input border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-bg-surface p-1 rounded-xl border border-border-subtle overflow-x-auto">
            {[
              { key: 'all', label: 'Semua', count: stats.total },
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'in_progress', label: 'Dikerjakan', count: stats.inProgress },
              { key: 'completed', label: 'Selesai', count: stats.completed },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? 'bg-accent-cyan text-bg-base font-semibold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                }`}
              >
                {tab.label} <span className="opacity-70 ml-1">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-text-muted hidden sm:inline">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-bg-surface border border-border-subtle rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent-cyan cursor-pointer"
            >
              <option value="deadline">Batas Waktu Terdekat</option>
              <option value="priority">Prioritas Tertinggi</option>
              <option value="newest">Terbaru Dibuat</option>
            </select>
          </div>
        </div>

        {/* Bottom row: Category Pills */}
        <div className="pt-2 border-t border-border-subtle/50 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-text-muted font-medium flex-shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Kategori:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => {
              const count = cat.id === 'all'
                ? todos.length
                : todos.filter(t => getTodoCategory(t).id === cat.id).length;

              const isActive = categoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/40 shadow-sm'
                      : 'bg-bg-surface/80 border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                  }`}
                >
                  {cat.id !== 'all' && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                  )}
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== TODO LIST ITEMS ========== */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-bg-card border border-border-subtle rounded-xl">
            <Loader2 className="w-8 h-8 text-accent-cyan animate-spin mb-3" />
            <p className="text-sm text-text-muted">Memuat daftar tugas...</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-16 bg-bg-card border border-border-subtle rounded-2xl p-6">
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
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="px-4 py-2 bg-bg-surface border border-border-subtle hover:border-accent-cyan/40 rounded-xl text-xs font-medium text-text-primary transition-all"
              >
                Reset Semua Filter
              </button>
            ) : (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-cyan text-bg-base font-semibold rounded-xl text-xs shadow-md shadow-accent-cyan/20 hover:bg-accent-cyan/90 transition-all"
              >
                <Plus className="w-4 h-4" />
                Tambah Todo Baru
              </button>
            )}
          </div>
        ) : (
          filteredTodos.map(todo => {
            const isCompleted = todo.status === 'completed';
            const isInProgress = todo.status === 'in_progress';
            const category = getTodoCategory(todo);
            const priorityInfo = PRIORITIES.find(p => p.value === todo.priority) || PRIORITIES[2];
            const deadlineInfo = getDeadlineInfo(todo.deadline, todo.status);
            const statusInfo = STATUS_CONFIG[todo.status] || STATUS_CONFIG.pending;

            return (
              <div
                key={todo.id}
                className={`group relative rounded-xl border p-4 transition-all duration-200 ${
                  isCompleted
                    ? 'bg-bg-card/40 border-border-subtle/60 opacity-80'
                    : isInProgress
                    ? 'bg-bg-card/90 border-cyan-500/30 hover:border-cyan-500/60 shadow-sm'
                    : 'bg-bg-card/90 border-border-subtle hover:border-accent-cyan/40 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Interactive Status Toggle Checkbox */}
                  <button
                    onClick={() => handleToggle(todo)}
                    title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                    className="mt-0.5 flex-shrink-0 group/btn focus:outline-none"
                    aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/30'
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
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3
                        className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${
                          isCompleted
                            ? 'line-through text-text-muted'
                            : 'text-text-primary group-hover:text-accent-cyan'
                        }`}
                      >
                        {todo.title}
                      </h3>
                    </div>

                    {/* Description */}
                    {todo.description && (
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                        isCompleted ? 'text-text-muted/70 line-through' : 'text-text-secondary'
                      }`}>
                        {todo.description}
                      </p>
                    )}

                    {/* Metadata & Badges Bar */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-border-subtle/40 text-xs">
                      {/* Category Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${category.badge}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: category.color }} />
                        {category.name}
                      </span>

                      {/* Priority Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${priorityInfo.badge}`}>
                        {priorityInfo.value === 'urgent' && <Flame className="w-3 h-3" />}
                        {priorityInfo.label}
                      </span>

                      {/* Status Selector Button */}
                      <div className="relative inline-block">
                        <select
                          value={todo.status || 'pending'}
                          onChange={(e) => handleStatusChange(todo, e.target.value)}
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md border cursor-pointer focus:outline-none transition-colors ${statusInfo.badge}`}
                        >
                          <option value="pending" className="bg-[#1b1732] text-amber-300">Pending</option>
                          <option value="in_progress" className="bg-[#1b1732] text-cyan-300">Dalam Pengerjaan</option>
                          <option value="completed" className="bg-[#1b1732] text-emerald-300">Selesai</option>
                        </select>
                      </div>

                      {/* Deadline Info */}
                      {deadlineInfo && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] ${deadlineInfo.badge}`}>
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>{deadlineInfo.text}</span>
                        </span>
                      )}

                      {/* Resource Link (if present) */}
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

                      {/* Completed At Tag */}
                      {isCompleted && todo.completed_at && (
                        <span className="text-[11px] text-text-muted ml-auto hidden sm:inline">
                          Selesai: {safeFormatDate(todo.completed_at, { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(todo)}
                      className="p-2 text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                      title="Edit Todo"
                      aria-label="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
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
          })
        )}
      </div>

      {/* ========== FORM MODAL (TAMBAH / EDIT) ========== */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="bg-bg-card border border-border-subtle rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in max-h-[92vh] overflow-y-auto"
            style={{ background: 'rgba(22, 18, 44, 0.98)' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-border-subtle">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {editingTodo ? 'Edit Todo' : 'Tambah Todo Baru'}
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Isi detail tugas checklist kerja dan deadline operasional
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-1.5">
                  Judul Tugas <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Contoh: Buat thumbnail & overlay stream collab..."
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-1.5">
                  Kategori
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-accent-cyan/15 border-accent-cyan text-accent-cyan font-semibold shadow-sm'
                            : 'bg-bg-input border-border-subtle text-text-secondary hover:border-accent-cyan/40 hover:text-text-primary'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Priority */}
                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-1.5">
                    Prioritas
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRIORITIES.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          formData.priority === p.value
                            ? `${p.badge} font-bold shadow-sm`
                            : 'bg-bg-input border-border-subtle text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-bg-input border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent-cyan transition-colors"
                  >
                    <option value="pending">Pending (Menunggu)</option>
                    <option value="in_progress">Dalam Pengerjaan</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-1.5">
                  Batas Waktu (Deadline)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-bg-input border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all"
                  />
                  {formData.deadline && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, deadline: '' }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-rose-400"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-1.5">
                  Deskripsi / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Rincian catatan tugas atau instruksi..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all resize-none"
                />
              </div>

              {/* Resource Info */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-1.5">
                  Tautan Sumber / Dokumen (Opsional)
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={formData.resource_info}
                    onChange={e => setFormData(prev => ({ ...prev, resource_info: e.target.value }))}
                    placeholder="Contoh: https://drive.google.com/... atau tautan aset"
                    className="w-full pl-9 pr-4 py-2 bg-bg-input border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!formData.title.trim() || isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-cyan text-bg-base font-semibold rounded-xl text-xs shadow-md shadow-accent-cyan/20 hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTodo ? 'Simpan Perubahan' : 'Buat Todo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== DELETE CONFIRMATION MODAL ========== */}
      {deletingTodo && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setDeletingTodo(null)}
        >
          <div
            className="bg-bg-card border border-border-subtle rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in text-center"
            style={{ background: 'rgba(22, 18, 44, 0.98)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-text-primary mb-1">Hapus Todo Ini?</h3>
            <p className="text-xs text-text-muted mb-4 line-clamp-2">
              Tugas <span className="text-text-primary font-medium">"{deletingTodo.title}"</span> akan dihapus permanen dari sistem.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingTodo(null)}
                className="flex-1 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-surface border border-border-subtle transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoPage;
