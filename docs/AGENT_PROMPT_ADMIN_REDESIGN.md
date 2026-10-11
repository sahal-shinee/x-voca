# AGENT PROMPT: Admin Dashboard Redesign
## X-VOCA - Modern, User-Friendly, Professional

---

## CONTEXT

Kamu adalah Frontend Developer yang akan meredesain panel admin X-VOCA. Aplikasi ini adalah dashboard untuk VTuber Xion Regalia.

**Goals:**
1. UI yang MODERN, PROFESSIONAL, USER-FRIENDLY
2. Color contrast yang BAIK (tidak bikin pusing mata)
3. Fitur yang WORKS (real-time, search, notifications)
4. Fungsionalitas yang MEMBANTU creator

**Reference Files:**
- `docs/DESIGN_TOKENS.md` - Design system lama (referensi)
- `docs/UI_SPEC_WEB.md` - Layout specifications
- `docs/ARCHITECTURE.md` - Arsitektur sistem
- `docs/PROJECT_CONTEXT.md` - Konteks proyek
- `docs/ADMIN_DASHBOARD_PLAN_v2.md` - Plan detail (WAJIB DIBACA)

---

## DESIGN PRINCIPLES

### 1. "Soft Dark" Philosophy
```
- Deep background tapi TIDAK hitam pure
- Text contrast cukup untuk readability
- Accent colors SOFT, tidak blinding
- Spacing GENEROUS
- Border-based design, bukan shadow-based
- Minimal decoration, maximum function
```

### 2. Color Palette (WAJIB DIGUNAKAN)

```css
/* Background - Soft & Warm */
--bg-base: #13111C;
--bg-surface: #1A1825;
--bg-card: #242136;
--bg-card-hover: #2D2A42;
--bg-input: #1E1B2E;
--bg-nav: #181622;

/* Text - High Contrast but Soft */
--text-primary: #F4F4F6;
--text-secondary: #A8A4B8;
--text-muted: #6B6778;
--text-accent: #6EE7B7;

/* Accent - Less Blinding */
--accent-cyan: #5EEAD4;
--accent-cyan-hover: #14B8A6;
--accent-purple: #A78BFA;
--accent-purple-hover: #8B5CF6;
--accent-gold: #FBBF24;
--accent-gold-hover: #F59E0B;

/* Status - Softer */
--status-live: #F87171;
--status-upcoming: #A78BFA;
--status-done: #5EEAD4;
--status-playing: #FBBF24;
--status-requested: #C4B5FD;
```

### 3. Typography System

```css
/* Fonts - Professional & Readable */
--font-sans: 'Inter', system-ui, sans-serif;
--font-display: 'Outfit', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Scale */
--text-hero: 72px/4.5rem, weight 800
--text-display: 32px/2rem, weight 700
--text-heading: 24px/1.5rem, weight 600
--text-body: 15px/0.9375rem, weight 400
--text-caption: 12px/0.75rem, weight 400
--text-badge: 11px/0.6875rem, weight 600, uppercase
```

---

## COMPONENT SPECIFICATIONS

### StatCard
```
LAYOUT:
┌─────────────────────────────────────┐
│ [Icon 24px]           [+12%] Badge │
│                                     │
│   1,247                               │
│   Total Votes This Month              │
│   ↑ 12% vs 30 days ago             │
└─────────────────────────────────────┘

STYLE:
- Background: bg-card
- Border: 1px solid border-subtle
- Border-radius: 12px
- Padding: 20px 24px
- Hover: background → bg-card-hover, border → accent-cyan/20
- Icon: 40x40px container, bg-surface
```

### ActionCard
```
LAYOUT:
┌─────────────────────────────────────┐
│ [Icon 48px] Title                   │
│             Description               │
│                               [→]   │
└─────────────────────────────────────┘

STYLE:
- Background: bg-surface
- Border: 1px solid border-subtle
- Border-radius: 12px
- Padding: 16px 20px
- Hover: background → bg-card, translateY(-2px)
- Arrow: opacity 0 → 1 on hover
```

### Sidebar
```
WIDTH: 240px (expanded) / 64px (collapsed)

LAYOUT:
┌──────────────────┐
│ Logo + Brand     │  ← 64px height
├──────────────────┤
│ User Avatar      │  ← 72px height
│ User Name        │
├──────────────────┤
│                  │
│ Dashboard        │  ← nav items
│ Schedule         │
│ Voting           │
│ Content          │
│                  │
├──────────────────┤
│ Settings         │  ← bottom items
│ Logout           │
└──────────────────┘

STYLE:
- Background: bg-nav
- Nav item: padding 12px 16px
- Active: left border 3px accent-cyan, bg bg-card
- Hover: bg bg-surface
```

### SearchModal (Command Palette)
```
LAYOUT:
┌─────────────────────────────────────┐
│ 🔍 [Search input.............] [Esc] │
├─────────────────────────────────────┤
│ RECENT SEARCHES                       │
│ ┌─────────────────────────────────┐ │
│ │ Clock  "Elden Ring schedule"     │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ QUICK NAVIGATE                        │
│ ┌─────────────────────────────────┐ │
│ │ 📊 Dashboard                    │ │
│ │ 📅 Schedule                    │ │
│ │ 🎮 Voting                      │ │
│ │ 📖 Content                    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

STYLE:
- Width: 560px max
- Background: bg-card
- Border: 1px solid border-subtle
- Border-radius: 16px
- Shadow: 0 25px 50px rgba(0,0,0,0.5)
- Backdrop: bg-base/80 with blur
```

### NotificationBell
```
LAYOUT:
┌─────────────────────────────────────┐
│ 🔔 Notifications              [Mark] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🟢 Vote spike detected          │ │
│ │    Elden Ring +50 votes        │ │
│ │    2 minutes ago        [Mark] │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🟣 New game request            │ │
│ │    Signalis requested          │ │
│ │    15 minutes ago       [Mark] │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

STYLE:
- Width: 400px
- Background: bg-card
- Border-radius: 12px
- Item padding: 16px
- Unread: left border accent color
```

---

## FEATURE IMPLEMENTATIONS

### 1. Real-Time Stats (Firebase)

```javascript
// FIREBASE PATH: /dashboard_stats
// STRUCTURE:
{
  total_votes: number,
  votes_today: number,
  votes_growth: number,
  upcoming_schedules: number,
  pending_todos: number,
  active_content: number,
  last_updated: timestamp
}

// CUSTOM HOOK: useDashboardStats.js
// - Auto-refresh every 30 seconds
// - Fallback to API if Firebase fails
// - Loading and error states
```

### 2. Working Quick Search

```javascript
// SEARCH FEATURES:
// 1. Command palette (Cmd+K / Ctrl+K)
// 2. Debounced search (300ms)
// 3. Multi-entity (schedules, games, content)
// 4. Keyboard navigation (↑↓ Enter Esc)
// 5. Recent searches (localStorage)
// 6. Category badges with colors
```

### 3. Notification System

```javascript
// FIREBASE PATH: /notifications/{userId}
// STRUCTURE:
{
  id: string,
  type: 'vote_spike' | 'game_request' | 'todo_deadline' | 'schedule_reminder',
  title: string,
  message: string,
  read: boolean,
  created_at: timestamp,
  link: string | null
}

// FEATURES:
// - Real-time listener
// - Unread count badge
// - Mark as read (single/all)
// - Click to navigate
// - Clear all
```

### 4. Creator-Focused Widgets

```javascript
// DASHBOARD WIDGETS:

// 1. Today's Focus
{
  urgent_tasks: number,
  today_schedule: Schedule | null,
  pending_reviews: number
}

// 2. Activity Feed
{
  recent_votes: Array<{game, count, time}>,
  recent_requests: Array<{game, requester, time}>
}

// 3. Quick Actions
[
  { label: 'Add Schedule', icon: 'calendar', path: '/admin/schedules', color: 'purple' },
  { label: 'Review Votes', icon: 'check', path: '/admin/voting', color: 'cyan' },
  { label: 'Create Content', icon: 'plus', path: '/admin/content', color: 'gold' }
]
```

---

## CODING STANDARDS

### File Naming
```
components/
  ├── admin/
  │   ├── AdminLayout.jsx
  │   ├── Sidebar.jsx
  │   ├── Topbar.jsx
  │   ├── SearchModal.jsx
  │   ├── NotificationBell.jsx
  │   └── [component-name].jsx
  └── common/
      ├── StatCard.jsx
      ├── ActionCard.jsx
      ├── Badge.jsx
      └── Button.jsx

hooks/
  ├── useDashboardStats.js
  ├── useNotifications.js
  └── useQuickSearch.js
```

### Component Structure
```javascript
// EXAMPLE: StatCard.jsx
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  loading = false,
  variant = 'default',
  className = ''
}) {
  // Implementation
}

// Default props
StatCard.defaultProps = {
  loading: false,
  variant: 'default'
};

export default StatCard;
```

### Styling Rules
```
1. Use Tailwind classes primarily
2. CSS variables for theme values
3. No inline styles except dynamic values
4. Consistent spacing (4px grid)
5. Border-radius: 8px (small), 12px (medium), 16px (large)
6. Transitions: 150ms ease
```

### Import Order
```javascript
// 1. React / hooks
import { useState, useEffect } from 'react';

// 2. External libraries
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// 3. Internal modules
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';

// 4. Utils / constants
import { formatDate } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../utils/constants';
```

---

## ANTI-PATTERNS (JANGAN LAKUKAN)

❌ `!important` untuk styling
❌ Inline styles `style={{ ... }}`
❌ Multiple nested shadows
❌ Hardcoded colors (gunakan CSS variables)
❌ Animasi yang terlalu lama (>200ms)
❌ Terlalu banyak decoration
❌ Campur font yang tidak perlu
❌ Inconsistent spacing
❌ Neon/bright accent colors

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core (High Priority)
1. Update CSS variables dan Tailwind config
2. Install fonts (Inter, Outfit, JetBrains Mono)
3. Create base components (StatCard, ActionCard, Badge, Button)
4. Create Sidebar component
5. Create Topbar component
6. Update AdminLayout

### Phase 2: Features (Medium Priority)
1. Enhance SearchModal
2. Enhance NotificationBell
3. Create useDashboardStats hook
4. Real-time stats integration
5. Create Dashboard page redesign

### Phase 3: Polish (Lower Priority)
1. Update other admin pages
2. Add loading states
3. Add empty states
4. Add error states
5. Test responsiveness

---

## VERIFICATION CHECKLIST

Sebelum dianggap selesai, pastikan:

- [ ] Color contrast WCAG AA compliant
- [ ] Tidak ada eye strain setelah 30 menit
- [ ] Real-time updates visible < 2s
- [ ] Quick search berfungsi dengan keyboard
- [ ] Notifications muncul dan berfungsi
- [ ] Semua button/links memiliki hover state
- [ ] Spacing konsisten (4px grid)
- [ ] Typography hierarchy jelas
- [ ] Mobile responsive (test 375px)
- [ ] No console errors
- [ ] No hardcoded colors

---

## FILES TO CREATE/MODIFY

### Create New:
- `src/hooks/useDashboardStats.js`
- `src/hooks/useQuickSearch.js`
- `src/components/admin/Sidebar.jsx`
- `src/components/admin/Topbar.jsx`
- `src/components/common/Badge.jsx`
- `src/components/common/Button.jsx`
- `src/components/common/Input.jsx`

### Modify Existing:
- `src/index.css` - Update CSS variables, fonts
- `tailwind.config.js` - Update colors, fonts
- `src/App.jsx` - Add providers
- `src/components/admin/AdminLayout.jsx` - Use new components
- `src/pages/admin/DashboardPage.jsx` - Full redesign
- `src/components/admin/SearchModal.jsx` - Enhance
- `src/components/admin/NotificationBell.jsx` - Enhance
- `src/components/common/StatCard.jsx` - Redesign
- `src/components/common/ActionCard.jsx` - Redesign
- `src/context/NotificationContext.jsx` - Enhance

---

## COMMUNICATION

Jika ada ambiguity atau pertanyaan:
1. Prioritaskan mengikuti plan ini
2. Jika tidak ada di plan, gunakan "Soft Dark" philosophy
3. Jika masih ragu, KONSULTASI dengan user
4. Jangan mengasumsikan terlalu banyak

Good luck! 🚀
