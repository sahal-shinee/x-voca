# X-VOCA - Session Prompts Document

**Version:** 1.0  
**Date:** 2024  
**Purpose:** Step-by-step implementation prompts per session

---

## IMPORTANT: Read Planning Document First

**Before starting ANY session, you MUST read `docs/PLANNING_DOCUMENT.md` for complete reference.**

The planning document contains:
- Complete database schema and design specifications
- Detailed UI/UX mockups and layouts
- Component designs and specifications
- Design guidelines (colors, typography, spacing)
- API endpoint specifications
- Implementation notes and best practices

Each session prompt below provides a summary and key points. The planning document provides the full context and detailed specifications.

---

## Table of Contents

1. [Session 1: Theme System](#session-1-theme-system)
2. [Session 2: Collab Request - Backend](#session-2-collab-request---backend)
3. [Session 3: Collab Request - Admin UI](#session-3-collab-request---admin-ui)
4. [Session 4: Collab Request - Viewer UI](#session-4-collab-request---viewer-ui)
5. [Session 5: Admin Layout Redesign](#session-5-admin-layout-redesign)
6. [Session 6: Dashboard Redesign](#session-6-dashboard-redesign)
7. [Session 7: Voting Moderation Redesign](#session-7-voting-moderation-redesign)

---

## Session 1: Theme System

**Refer:** `docs/PLANNING_DOCUMENT.md` - Section 3.1 Theme System

### Objective
Implementasi sistem tema light/dark mode untuk admin panel.

### Files to Create
```
web/frontend/src/context/ThemeContext.jsx    # Theme provider
web/frontend/src/hooks/useTheme.js          # Theme hook
web/frontend/src/components/admin/ThemeToggle.jsx  # Toggle component
```

### Files to Modify
```
web/frontend/src/index.css         # Add light mode CSS variables
web/frontend/tailwind.config.js   # Add light mode colors
web/frontend/src/App.jsx          # Wrap with ThemeProvider
web/frontend/src/components/admin/Sidebar.jsx  # Add theme toggle
```

### Tasks

#### 1.1 Create ThemeContext
```javascript
// ThemeContext.jsx
- Create React Context for theme management
- State: 'dark' | 'light'
- Actions: toggleTheme, setTheme
- Persist to localStorage key: 'xvoc-admin-theme'
- Apply 'data-theme' attribute to <html> element
- Provide CSS variables based on theme
```

#### 1.2 Create useTheme Hook
```javascript
// useTheme.js
- Custom hook to use theme context
- Return: { theme, toggleTheme, isDark, isLight }
```

#### 1.3 Create ThemeToggle Component
```javascript
// ThemeToggle.jsx
- Toggle switch button
- Icon: Sun (light) / Moon (dark)
- Smooth transition animation
- Size: 40x40px button
```

#### 1.4 Update tailwind.config.js
```javascript
// Add light mode color palette
colors: {
  // ... existing dark colors ...
  light: {
    bg: {
      base: '#F8F9FC',
      surface: '#FFFFFF',
      card: '#F1F3F8',
      nav: '#FFFFFF',
    },
    text: {
      primary: '#1A1B2E',
      secondary: '#4A4B6A',
      muted: '#8B8CA8',
    },
    accent: {
      cyan: '#0D9488',
      cyanHover: '#0F766E',
      purple: '#7C3AED',
      purpleHover: '#6D28D9',
    },
    border: {
      subtle: '#E2E4EB',
      active: 'rgba(13, 148, 136, 0.3)',
    }
  }
}
```

#### 1.5 Update index.css
```css
/* Add light mode CSS variables */
[data-theme="light"] {
  --bg-base: #F8F9FC;
  --bg-surface: #FFFFFF;
  --bg-card: #F1F3F8;
  --bg-nav: #FFFFFF;
  --text-primary: #1A1B2E;
  --text-secondary: #4A4B6A;
  --text-muted: #8B8CA8;
  --accent-cyan: #0D9488;
  --accent-purple: #7C3AED;
  --border-subtle: #E2E4EB;
}
```

#### 1.6 Integrate ThemeToggle in Sidebar
```javascript
// Sidebar.jsx
- Add ThemeToggle component in sidebar header
- Position: Next to logo or in user section
```

### Acceptance Criteria
- [ ] Toggle switch visible in sidebar
- [ ] Clicking toggle switches between dark/light mode
- [ ] Theme preference persists after page reload
- [ ] All admin components use theme colors correctly
- [ ] No color contrast issues in both modes

---

## Session 2: Collab Request - Backend

**Refer:** `docs/PLANNING_DOCUMENT.md` - Section 2 (Feature 1: Collab Request System)

### Objective
Implementasi database table dan API endpoints untuk collab requests.

### Database Changes (SQL Script for Navicat/Railway)

```sql
-- ===============================================
-- Table: collab_requests
-- ===============================================
CREATE TABLE collab_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  viewer_identifier VARCHAR(255) NOT NULL COMMENT 'fingerprint or IP address',
  requested_streamer_name VARCHAR(200) NOT NULL COMMENT 'nama streamer yang di-request',
  requested_streamer_social VARCHAR(500) NULL COMMENT 'link sosial media streamer',
  message TEXT NULL COMMENT 'pesan opsional dari viewer',
  status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  reviewed_by INT NULL COMMENT 'admin yang review',
  reviewed_at DATETIME NULL,
  review_notes TEXT NULL COMMENT 'catatan admin saat review',
  period_key VARCHAR(7) NOT NULL COMMENT 'YYYY-MM format',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_period (period_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===============================================
-- Table: schedules (add new columns)
-- ===============================================
ALTER TABLE schedules 
ADD COLUMN collab_guest VARCHAR(200) NULL AFTER description,
ADD COLUMN collab_social VARCHAR(500) NULL AFTER collab_guest;
```

### Files to Create (Backend)
```
web/backend/src/models/CollabRequest.js
web/backend/src/controllers/collabRequest.controller.js
web/backend/src/routes/collabRequest.routes.js
```

### Files to Modify (Backend)
```
web/backend/src/models/index.js        # Add CollabRequest association
web/backend/src/routes/index.js        # Add collab request routes
web/backend/src/app.js                 # Mount routes
```

### Tasks

#### 2.1 Create CollabRequest Model
```javascript
// CollabRequest.js
- Define model with all fields from SQL schema
- Associations: belongsTo(User as reviewer)
- Hooks: none
- Methods: none
```

#### 2.2 Create CollabRequest Controller
```javascript
// collabRequest.controller.js

// Functions:
1. createCollabRequest(req, res)
   - Validate: requested_streamer_name (required)
   - Get period_key from current date (YYYY-MM)
   - Get viewer_identifier from fingerprint/IP
   - Create record with status='pending'
   - Create audit log
   - Return success response

2. getCollabRequests(req, res)
   - Query params: status, period, page, limit
   - Include reviewer info
   - Order by created_at DESC
   - Pagination support

3. getCollabRequestById(req, res)
   - Get single request by ID
   - Include reviewer info

4. reviewCollabRequest(req, res)
   - Validate: action (approve/reject), notes (optional)
   - Update: status, reviewed_by, reviewed_at, review_notes
   - Create audit log
   - Return updated record

5. deleteCollabRequest(req, res)
   - Soft delete or hard delete
   - Create audit log

6. getCollabRequestStats(req, res)
   - Count by status: pending, approved, rejected
   - Return summary object
```

#### 2.3 Create CollabRequest Routes
```javascript
// collabRequest.routes.js

POST   /api/collab-requests              - Public (viewer submits)
GET    /api/collab-requests             - Protected (admin lists)
GET    /api/collab-requests/stats       - Protected (admin stats)
GET    /api/collab-requests/:id         - Protected (admin view)
PATCH  /api/collab-requests/:id/review  - Protected (admin review)
DELETE /api/collab-requests/:id          - Protected (admin delete)
```

#### 2.4 Update Models Index
```javascript
// models/index.js
- Import CollabRequest
- Define associations (belongsTo User)
```

#### 2.5 Update Routes Index
```javascript
// routes/index.js
- Import collab request routes
- Mount at /api/collab-requests
```

#### 2.6 Update App.js
```javascript
// app.js
- Import collab request routes (if not via index)
```

### Acceptance Criteria
- [ ] Table created in database
- [ ] POST /api/collab-requests works (public)
- [ ] GET /api/collab-requests works (admin, protected)
- [ ] PATCH /api/collab-requests/:id/review works
- [ ] DELETE /api/collab-requests/:id works
- [ ] GET /api/collab-requests/stats works
- [ ] Schedule table has collab_guest and collab_social columns

---

## Session 3: Collab Request - Admin UI

**Refer:** `docs/PLANNING_DOCUMENT.md` - Section 2.5 (Schedule Display) & Section 3.5 (New Page: Collab Requests Management)

### Objective
Implementasi halaman manajemen collab requests di admin panel.

### Files to Create
```
web/frontend/src/pages/admin/CollabRequestsPage.jsx
web/frontend/src/components/admin/CollabRequestCard.jsx
web/frontend/src/services/collabRequestService.js
web/frontend/src/hooks/useCollabRequests.js
```

### Files to Modify
```
web/frontend/src/components/admin/Sidebar.jsx    # Add menu item
web/frontend/src/App.jsx                         # Add route
```

### Tasks

#### 3.1 Create collabRequestService
```javascript
// collabRequestService.js

// Functions:
1. getCollabRequests(params)      - GET /api/collab-requests
2. getCollabRequestById(id)       - GET /api/collab-requests/:id
3. reviewCollabRequest(id, data)  - PATCH /api/collab-requests/:id/review
4. deleteCollabRequest(id)         - DELETE /api/collab-requests/:id
5. getCollabRequestStats()        - GET /api/collab-requests/stats
```

#### 3.2 Create useCollabRequests Hook
```javascript
// useCollabRequests.js

// Returns:
{
  requests: [],           // List of collab requests
  stats: {},              // Summary stats
  loading: boolean,
  error: string | null,
  fetchRequests: function,
  reviewRequest: function,
  deleteRequest: function,
  refetch: function,
}
```

#### 3.3 Create CollabRequestCard Component
```javascript
// CollabRequestCard.jsx

// Props:
- request: object
- onApprove: function
- onReject: function
- onDelete: function
- onAddToSchedule: function

// UI:
┌─────────────────────────────────────────────────────────────┐
│  [Avatar Icon]  @requested_streamer           [Status]   │
│                                                             │
│  Social: twitter.com/streamer                             │
│                                                             │
│  Message: "Ingin collab gaming bareng..."                 │
│                                                             │
│  Requested: 2 hours ago                                   │
│  ─────────────────────────────────────────────────────────  │
│  [Approve] [Reject]                          [Add to Sched] │
└─────────────────────────────────────────────────────────────┘
```

#### 3.4 Create CollabRequestsPage
```javascript
// CollabRequestsPage.jsx

// Layout:
1. Page Header
   - Title: "Collab Requests"
   - Subtitle: "Kelola request collab dari viewer"

2. Stats Cards (4 columns)
   - Total Requests
   - Pending
   - Approved
   - Rejected

3. Filter Bar
   - Search input
   - Status filter (All/Pending/Approved/Rejected)
   - Period filter (dropdown)

4. Request List
   - Grid of CollabRequestCard components
   - Empty state if no requests
   - Loading skeleton state

5. Pagination
   - Page numbers
   - Items per page selector
```

#### 3.5 Add Route and Menu Item
```javascript
// Sidebar.jsx
- Add menu item: { path: '/admin/collab-requests', label: 'Collab Requests', icon: Users }

// App.jsx
- Add route: /admin/collab-requests -> CollabRequestsPage
```

### Acceptance Criteria
- [ ] Page accessible at /admin/collab-requests
- [ ] Menu item visible in sidebar
- [ ] Stats cards show correct counts
- [ ] Requests displayed in cards
- [ ] Approve button works and updates status
- [ ] Reject button works and updates status
- [ ] Delete button works
- [ ] Search and filter work correctly
- [ ] Empty state shown when no requests

---

## Session 4: Collab Request - Viewer UI

**Refer:** `docs/PLANNING_DOCUMENT.md` - Section 2.4 (Request Flow - Viewer Side)

### Objective
Implementasi fitur request collab untuk viewer di halaman schedule.

### Files to Create
```
web/frontend/src/components/viewer/CollabRequestModal.jsx
```

### Files to Modify
```
web/frontend/src/components/viewer/ScheduleSection.jsx  # Add request button
web/frontend/src/components/viewer/ScheduleCard.jsx      # Add collab indicator
```

### Tasks

#### 4.1 Create CollabRequestModal
```javascript
// CollabRequestModal.jsx

// Props:
- isOpen: boolean
- onClose: function
- onSuccess: function

// Form Fields:
1. Streamer Name (required)
   - Text input
   - Placeholder: "Nama streamer yang diinginkan"
   - Validation: min 2 chars

2. Social Media Link (required)
   - URL input
   - Placeholder: "twitter.com/streamer"
   - Validation: valid URL format

3. Message (optional)
   - Textarea
   - Placeholder: "Alasan ingin collab (opsional)"
   - Max: 500 chars

// Submit Button
- Label: "Kirim Request"
- Loading state during submission

// Success State
- Show confirmation message
- Auto close after 2 seconds
```

#### 4.2 Update ScheduleSection
```javascript
// ScheduleSection.jsx

// Add "Request Collab" button
// Position: Below schedule list or as floating action button

// Button UI:
┌──────────────────────────────────┐
│  [Plus Icon]  Request Collab    │
└──────────────────────────────────┘

// Click behavior:
- Opens CollabRequestModal
```

#### 4.3 Update ScheduleCard
```javascript
// ScheduleCard.jsx

// Add collab indicator if schedule has collab_guest:
┌────────────────────────────────────────────────┐
│  Stream Title                                  │
│  Game Category                                 │
│                                                │
│  [Users Icon] Collab with: @StreamerName      │
│                                                │
│  Date & Time  |  Platform                     │
└────────────────────────────────────────────────┘
```

### Acceptance Criteria
- [ ] "Request Collab" button visible on schedule section
- [ ] Modal opens when button clicked
- [ ] Form validates required fields
- [ ] Submission creates collab_request in database
- [ ] Success message shown after submission
- [ ] Schedule cards show collab info if present

---

## Session 5: Admin Layout Redesign

**Refer:** `docs/PLANNING_DOCUMENT.md` - Section 3.2 (Sidebar Redesign) & Section 3.3 (Dashboard Redesign)

### Objective
Perbaiki sidebar dan topbar agar lebih rapih dan warna tidaktabrakan.

### Files to Modify
```
web/frontend/src/components/admin/Sidebar.jsx
web/frontend/src/components/admin/Topbar.jsx
web/frontend/src/components/admin/AdminLayout.jsx
web/frontend/src/components/admin/NotificationBell.jsx
web/frontend/src/index.css
web/frontend/tailwind.config.js
```

### Tasks

#### 5.1 Sidebar Redesign
```javascript
// Sidebar.jsx - Complete redesign

// Design Requirements:
1. Logo Area
   - Clean, minimal logo
   - Theme toggle integrated

2. User Section
   - Avatar with initial
   - Username display
   - Online status indicator
   - Settings dropdown

3. Navigation Menu
   - Clear section label "MENU"
   - Active state with left border accent
   - Hover state with subtle background
   - Icon + Label for each item
   - Collapsed mode: icons only with tooltips

4. Bottom Section
   - Settings link
   - Logout button
   - Collapse toggle

// Menu Items:
- Dashboard (LayoutDashboard)
- Jadwal Stream (Calendar)
- Game Voting (Gamepad2)
- Collab Requests (Users) - NEW
- Content Guide (BookOpen)

// Color Updates:
- Background: bg-nav
- Active item: bg-accent-cyan/10, text-accent-cyan, left-border accent-cyan
- Hover item: bg-bg-surface
- Text: text-text-primary (active), text-text-secondary (inactive)
```

#### 5.2 Topbar Redesign
```javascript
// Topbar.jsx - Simplified redesign

// Elements:
1. Breadcrumb
   - Home / Current Page

2. Search Bar (center)
   - Placeholder: "Search..."
   - Keyboard shortcut hint: Cmd+K
   - Click opens SearchModal

3. Right Section
   - Broadcasting status indicator
   - Notification bell
   - User avatar dropdown

// Design:
- Clean, minimal
- Proper spacing
- Consistent with sidebar
```

#### 5.3 NotificationBell Enhancement
```javascript
// NotificationBell.jsx

// Features:
1. Bell Icon with badge
   - Badge count for unread notifications
   - Red dot for new notifications

2. Dropdown Panel
   - List of recent notifications
   - Mark as read functionality
   - Click to navigate

3. Notification Types:
   - vote_received (BarChart icon)
   - game_requested (Gamepad icon)
   - collab_requested (Users icon) - NEW
   - schedule_upcoming (Calendar icon)
```

#### 5.4 Color Contrast Fix
```css
// Review and fix color contrasts:

// Ensure:
- Text on dark backgrounds has sufficient contrast (4.5:1 minimum)
- Active states are visually distinct
- Hover states are visible but not jarring
- Accent colors used sparingly for emphasis
```

### Acceptance Criteria
- [ ] Sidebar looks clean and professional
- [ ] Colors don't clash or contrast badly
- [ ] Active menu item clearly visible
- [ ] Hover states work correctly
- [ ] Sidebar collapses properly
- [ ] Topbar is clean and functional
- [ ] Notification bell works with dropdown
- [ ] Theme toggle works in sidebar

---

## Session 6: Dashboard Redesign

**Refer:** `docs/PLANNING_DOCUMENT.md` - Section 3.3 (Dashboard Redesign) & Section 4 (Enhanced Functionality)

### Objective
Tingkatkan dashboard admin dengan layout yang lebih informatif dan interaktif.

### Files to Modify
```
web/frontend/src/pages/admin/DashboardPage.jsx
web/frontend/src/components/common/StatCard.jsx
web/frontend/src/components/common/ActionCard.jsx
```

### Tasks

#### 6.1 Dashboard Header Redesign
```javascript
// DashboardPage.jsx - Header section

// Current (from screenshots):
- Left: Avatar + Welcome message + Date
- Right: Broadcasting toggle

// Redesigned:
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │ [Avatar]                    │  │ BROADCASTING           │  │
│  │ Selamat datang, Admin      │  │ [Toggle Switch] READY  │  │
│  │ Jumat, 11 Oktober 2024     │  └─────────────────────────┘  │
│  └─────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘

// Features:
- Broadcasting status toggle
- Current date/time display
- Clean typography
```

#### 6.2 Stats Cards Improvement
```javascript
// StatCard.jsx - Enhanced

// Current stats:
1. Total Votes - cyan highlight
2. Jadwal Upcoming - default
3. Tugas Pending - default
4. Content Aktif - default

// Enhancements:
- Better visual hierarchy
- Subtle hover effects
- Trend indicators where applicable
- Consistent card sizing
- Loading skeleton states

// Card Design:
┌──────────────────────────────────┐
│  [Icon]                    [Trend]│
│                                  │
│  1,247                          │
│  Total Vote Bulan Ini            │
│  +12% dari bulan lalu           │
└──────────────────────────────────┘
```

#### 6.3 Quick Actions Redesign
```javascript
// DashboardPage.jsx - Quick Actions section

// Current:
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ + Jadwal     │ │ Moderasi     │ │ + Content    │
└──────────────┘ └──────────────┘ └──────────────┘

// Redesigned:
┌──────────────────────────────────────────────────────────────┐
│  Quick Actions                                                 │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  [+]        │  │  [Eye]      │  │  [BookOpen] │          │
│  │  Jadwal     │  │  Voting     │  │  Content    │          │
│  │  Baru       │  │  Moderation │  │  Guide      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐                            │
│  │  [Users]    │  │  [Plus]     │                            │
│  │  Collab     │  │  Todo       │                            │
│  │  Requests   │  │  Baru       │                            │
│  └─────────────┘  └─────────────┘                            │
└──────────────────────────────────────────────────────────────┘

// Action Cards:
1. Tambah Jadwal     - Navigate to /admin/schedules?action=create
2. Moderasi Voting   - Navigate to /admin/voting
3. Tambah Content   - Navigate to /admin/content?action=create
4. Collab Requests   - Navigate to /admin/collab-requests
5. Todo Baru         - Opens todo creation modal (optional)
```

#### 6.4 Upcoming Streams Preview
```javascript
// DashboardPage.jsx - Add upcoming streams section

// Section:
┌──────────────────────────────────────────────────────────────┐
│  Upcoming Streams                               [View All]  │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Game Title   │ │ Game Title   │ │ Game Title   │        │
│  │ Tomorrow 8PM │ │ Sun 6PM      │ │ Mon 9PM      │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

#### 6.5 Activity Log Improvement
```javascript
// DashboardPage.jsx - Activity Log section

// Current: Basic table

// Enhanced:
1. Better header with refresh button
2. Filter dropdown (All/Recent 24h/This Week)
3. Improved table styling
4. Better pagination
5. Empty state illustration
```

### Acceptance Criteria
- [ ] Dashboard header looks clean
- [ ] Stats cards have consistent styling
- [ ] Quick actions are visually appealing
- [ ] Upcoming streams preview shows (if any)
- [ ] Activity log is well-organized
- [ ] All sections have proper spacing

---

## Session 7: Voting Moderation Redesign

**Refer:** `docs/PLANNING_DOCUMENT.md` - Section 3.4 (Voting Moderation Page Redesign)

### Objective
Implementasi layout card-based untuk halaman moderasi voting.

### Files to Modify
```
web/frontend/src/pages/admin/VotingModerationPage.jsx
web/frontend/src/components/common/GameCard.jsx (reuse or create new)
```

### Tasks

#### 7.1 Stats Summary Cards
```javascript
// VotingModerationPage.jsx

// Stats to show:
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Requested │ │Accepted  │ │ Playing  │ │  Done    │
│   12     │ │    8     │ │    3     │ │   45     │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

#### 7.2 Filter Bar Enhancement
```javascript
// VotingModerationPage.jsx

┌────────────────────────────────────────────────────────────┐
│  [Search Icon] Search game...        [Filter ▼] [Period ▼] │
└────────────────────────────────────────────────────────────┘

// Filters:
- Status tabs: ALL | REQUESTED | ACCEPTED | PLAYING | DONE
- Period dropdown: This Month / Last Month / Custom
- Search: By title or genre
```

#### 7.3 Card-Based Game List
```javascript
// GameCard component (new or modified)

┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────┐                                          │
│  │             │  Elden Ring                               │
│  │  [Cover]    │  Action RPG  •  1,247 votes             │
│  │             │                                          │
│  │             │  Requested by: Viewer #4021               │
│  │             │  2 hours ago                             │
│  └─────────────┘                                          │
│                                                             │
│  [✓ Accept]  [▶ Set Playing]  [🗑 Delete]                │
└─────────────────────────────────────────────────────────────┘

// Card States:
- Requested: Yellow accent, accept button prominent
- Accepted: Green accent, playing button prominent
- Playing: Cyan accent, done button prominent
- Done: Gray accent, no action buttons

// Card Hover:
- Slight lift effect
- Border glow
```

#### 7.4 Bulk Actions Bar
```javascript
// VotingModerationPage.jsx

// When items selected:
┌────────────────────────────────────────────────────────────┐
│  3 items selected    [Accept All] [Delete All] [Clear]    │
└────────────────────────────────────────────────────────────┘
```

#### 7.5 Action Buttons
```javascript
// VotingModerationPage.jsx

// Actions:
1. Accept
   - Changes status to 'accepted'
   - Shows toast notification
   - Updates stats

2. Set Playing
   - Changes status to 'playing'
   - Optional: Auto-set as next schedule suggestion

3. Mark Done
   - Changes status to 'done'
   - Archives game

4. Delete
   - Confirmation modal
   - Removes from database
   - Shows toast notification

5. Reset Period
   - Clears all votes for current period
   - Confirmation required

6. Export CSV
   - Downloads voting data as CSV
```

### Acceptance Criteria
- [ ] Stats cards show correct counts
- [ ] Filter tabs work correctly
- [ ] Search filters games by title
- [ ] Games display in card format
- [ ] Accept button works
- [ ] Playing button works
- [ ] Done button works
- [ ] Delete button with confirmation works
- [ ] Reset period works
- [ ] Export CSV downloads file

---

## Implementation Notes

**Refer:** `docs/PLANNING_DOCUMENT.md` - Section 8 (Design Guidelines)

### General Guidelines

1. **Clean Code**
   - Use meaningful variable names
   - Add comments for complex logic
   - Follow existing code patterns

2. **Error Handling**
   - Show toast notifications for errors
   - Log errors to console
   - Show user-friendly error messages

3. **Loading States**
   - Use skeleton loaders
   - Disable buttons during loading
   - Show spinners where appropriate

4. **Responsive (Optional)**
   - Per user request, responsive is NOT priority
   - Focus on desktop-first layout

5. **No Emojis**
   - Use icons instead of emojis
   - Use text labels for buttons

---

## Database Scripts Summary

**Refer:** `docs/PLANNING_DOCUMENT.md` - Section 2.2 (Database Changes)

### Session 2 SQL Script

```sql
-- Collab Requests Table
CREATE TABLE collab_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  viewer_identifier VARCHAR(255) NOT NULL,
  requested_streamer_name VARCHAR(200) NOT NULL,
  requested_streamer_social VARCHAR(500) NULL,
  message TEXT NULL,
  status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  review_notes TEXT NULL,
  period_key VARCHAR(7) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_period (period_key)
);

-- Add columns to schedules
ALTER TABLE schedules 
ADD COLUMN collab_guest VARCHAR(200) NULL,
ADD COLUMN collab_social VARCHAR(500) NULL;
```

---

## Session Summary Table

| Session | Title | Complexity | Estimated Time |
|---------|-------|------------|----------------|
| 1 | Theme System | Low | 30-45 min |
| 2 | Collab Request - Backend | Medium | 45-60 min |
| 3 | Collab Request - Admin UI | Medium | 60-90 min |
| 4 | Collab Request - Viewer UI | Low | 30-45 min |
| 5 | Admin Layout Redesign | Medium | 60-90 min |
| 6 | Dashboard Redesign | Medium | 60-90 min |
| 7 | Voting Moderation Redesign | Medium | 60-90 min |

**Total Estimated Time:** 5-7 hours

---

*Document Version: 1.0*  
*Status: Ready for Implementation*
