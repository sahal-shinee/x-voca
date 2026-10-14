import { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Edit, Clock, X, Check, AlertTriangle } from 'lucide-react';
import { todoService } from '../../services/todoService';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-text-muted' },
  { value: 'medium', label: 'Medium', color: 'bg-accent-cyan' },
  { value: 'high', label: 'High', color: 'bg-accent-gold' },
  { value: 'urgent', label: 'Urgent', color: 'bg-status-live' },
];

function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: ''
  });

  // Fetch todos
  const fetchTodos = async () => {
    try {
      const response = await todoService.getAll();
      if (response?.data) {
        setTodos(Array.isArray(response.data) ? response.data : []);
      } else if (Array.isArray(response)) {
        setTodos(response);
      } else {
        setTodos([]);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      setTodos([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchTodos().finally(() => setLoading(false));
  }, []);

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return !todo.is_completed;
    if (filter === 'completed') return todo.is_completed;
    return true;
  });

  // Count stats
  const stats = {
    total: todos.length,
    pending: todos.filter(t => !t.is_completed).length,
    completed: todos.filter(t => t.is_completed).length,
  };

  // CRUD handlers
  const handleSave = async () => {
    if (!formData.title.trim()) return;

    try {
      if (editingTodo) {
        await todoService.update(editingTodo.id, formData);
      } else {
        await todoService.create(formData);
      }
      closeModal();
      fetchTodos();
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const handleToggle = async (todo) => {
    try {
      await todoService.toggleComplete(todo.id, !todo.is_completed);
      fetchTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await todoService.delete(id);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const openCreate = () => {
    setEditingTodo(null);
    setFormData({ title: '', description: '', priority: 'medium', deadline: '' });
    setShowModal(true);
  };

  const openEdit = (todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title || '',
      description: todo.description || '',
      priority: todo.priority || 'medium',
      deadline: todo.deadline || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTodo(null);
    setFormData({ title: '', description: '', priority: 'medium', deadline: '' });
  };

  const getPriorityInfo = (priorityValue) => {
    return PRIORITIES.find(p => p.value === priorityValue) || PRIORITIES[1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Todo List</h1>
          <p className="text-sm text-text-secondary mt-1">Kelola tugas dan checklist kerja</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-cyan text-bg-base rounded-xl hover:bg-accent-cyan/90 transition-colors font-semibold text-sm shadow-lg shadow-accent-cyan/20"
        >
          <Plus className="w-4 h-4" />
          Tambah Todo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-accent-purple" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              <p className="text-xs text-text-muted">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-accent-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.pending}</p>
              <p className="text-xs text-text-muted">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-status-done/10 border border-status-done/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-status-done" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{stats.completed}</p>
              <p className="text-xs text-text-muted">Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'pending', label: 'Pending' },
          { key: 'completed', label: 'Selesai' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-accent-cyan text-bg-base shadow-md'
                : 'bg-bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-surface'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-12 bg-bg-card border border-border-subtle rounded-xl">
            <CheckSquare className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-muted">Tidak ada todo</p>
            <button
              onClick={openCreate}
              className="mt-3 text-sm text-accent-cyan hover:underline"
            >
              + Tambah todo baru
            </button>
          </div>
        ) : (
          filteredTodos.map(todo => {
            const priority = getPriorityInfo(todo.priority);
            return (
              <div
                key={todo.id}
                className={`bg-bg-card p-4 rounded-xl border transition-all ${
                  todo.is_completed
                    ? 'border-border-subtle opacity-70'
                    : 'border-border-subtle hover:border-accent-cyan/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(todo)}
                    className="mt-0.5 flex-shrink-0"
                    aria-label={todo.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    <div className={`
                      w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                      ${todo.is_completed
                        ? 'bg-status-done border-status-done'
                        : 'border-border-subtle hover:border-accent-cyan'
                      }
                    `}>
                      {todo.is_completed && <Check className="w-4 h-4 text-bg-base" />}
                    </div>
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-base ${
                      todo.is_completed
                        ? 'line-through text-text-muted'
                        : 'text-text-primary'
                    }`}>
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-sm text-text-muted mt-1">{todo.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className={`
                        px-2.5 py-1 rounded-lg text-xs font-medium text-white
                        ${priority.color}
                      `}>
                        {priority.label}
                      </span>
                      {todo.deadline && (
                        <span className="text-xs text-text-muted flex items-center gap-1.5 bg-bg-surface px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(todo.deadline).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                      <span className="text-xs text-text-muted">
                        {todo.created_at ? new Date(todo.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short'
                        }) : ''}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(todo)}
                      className="p-2 text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-2 text-text-muted hover:text-status-live hover:bg-status-live/10 rounded-lg transition-colors"
                      aria-label="Delete"
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

      {/* Form Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-bg-base/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-text-primary">
                {editingTodo ? 'Edit Todo' : 'Tambah Todo'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Judul <span className="text-status-live">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Judul todo..."
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi tambahan (opsional)..."
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all resize-none"
                  rows={3}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                      className={`
                        px-3 py-2.5 rounded-xl text-xs font-medium border transition-all
                        ${formData.priority === p.value
                          ? `${p.color} text-white border-transparent`
                          : 'bg-bg-input border-border-subtle text-text-secondary hover:border-accent-cyan/50'
                        }
                      `}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="text-xs font-mono text-text-secondary uppercase tracking-wider block mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-3 bg-bg-input border border-border-subtle rounded-xl text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSave}
                disabled={!formData.title.trim()}
                className="w-full py-3 bg-accent-cyan text-bg-base font-semibold rounded-xl hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-accent-cyan/20 mt-2"
              >
                {editingTodo ? 'Simpan Perubahan' : 'Tambah Todo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoPage;
