# X-VOCA - Planning Document

**Version:** 1.0  
**Date:** 2024  
**Status:** Planning Complete  

---

## 1. Project Overview

### 1.1 Tech Stack
- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express + Sequelize ORM
- **Database:** MySQL (Railway) + Firebase Realtime Database
- **Authentication:** JWT-based with bcrypt password hashing

### 1.2 Existing Structure

```
web/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin panel components
│   │   │   ├── common/         # Reusable UI components
│   │   │   └── viewer/         # Public viewer components
│   │   ├── pages/
│   │   │   ├── admin/          # Admin pages
│   │   │   └── viewer/        # Public pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service layers
│   │   ├── context/           # React context providers
│   │   └── styles/
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── models/            # Sequelize models
│   │   ├── controllers/       # API controllers
│   │   ├── routes/            # API routes
│   │   └── middleware/        # Auth & validation middleware
│   └── database/
│       └── migrations/         # Database migrations
```

---

## 2. Feature 1: Collab Request System

### 2.1 Overview
Viewer dapat request collab dengan streamer dengan menyebutkan nama/link sosial media creator yang diinginkan.

### 2.2 Database Changes

#### New Table: `collab_requests`

```sql
CREATE TABLE collab_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  viewer_identifier VARCHAR(255) NOT NULL,     -- fingerprint or IP
  requested_streamer_name VARCHAR(200),         -- nama streamer yang di-request
  requested_streamer_social VARCHAR(500),      -- link sosial media streamer
  message TEXT,                                 -- pesan opsional dari viewer
  status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
  reviewed_by INT NULL,                        -- admin yang review
  reviewed_at DATETIME NULL,
  review_notes TEXT NULL,
  period_key VARCHAR(7) NOT NULL,              -- YYYY-MM format
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_period (period_key)
);
```

#### New Field in `schedules` table (Optional)

```sql
ALTER TABLE schedules ADD COLUMN collab_guest VARCHAR(200) NULL AFTER description;
ALTER TABLE schedules ADD COLUMN collab_social VARCHAR(500) NULL AFTER collab_guest;
```

### 2.3 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/collab-requests` | Public | Viewer submits collab request |
| GET | `/api/collab-requests` | Protected | Admin lists all requests (with filters) |
| GET | `/api/collab-requests/:id` | Protected | Admin views single request |
| PATCH | `/api/collab-requests/:id/review` | Protected | Admin approves/rejects request |
| DELETE | `/api/collab-requests/:id` | Protected | Admin deletes request |
| GET | `/api/collab-requests/stats` | Protected | Admin gets statistics |

### 2.4 Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        VIEWER SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Landing/Schedule Page]                                       │
│        │                                                        │
│        ├── Click "Request Collab" button                        │
│        │                                                        │
│        ├── Modal opens with form:                               │
│        │   - Streamer Name (required)                           │
│        │   - Social Media Link (required)                       │
│        │   - Message (optional)                                  │
│        │                                                        │
│        └── Submit → POST /api/collab-requests                   │
│                    │                                            │
│                    └── Success: Show confirmation modal          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Admin Dashboard - Collab Requests Page]                      │
│        │                                                        │
│        ├── View all requests (filterable by status)            │
│        │   - Pending requests highlighted                        │
│        │   - Shows streamer name, social link, message        │
│        │                                                        │
│        ├── Admin actions:                                       │
│        │   ├── Approve → status = 'approved'                   │
│        │   │       └── Optional: Link to schedule to add guest │
│        │   ├── Reject → status = 'rejected'                    │
│        │   └── Delete → remove request                          │
│        │                                                        │
│        └── Stats card: Total, Pending, Approved, Rejected       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Schedule Display (Viewer)

Di halaman schedule viewer, tambahkan indicator jika schedule memiliki collab:

```
┌────────────────────────────────────────────────┐
│  Stream Title                                  │
│  Game Category                                 │
│                                                │
│  [Collab with: @StreamerName] ← New indicator  │
│                                                │
│  Date & Time  |  Platform                     │
└────────────────────────────────────────────────┘
```

---

## 3. Feature 2: Admin Panel Redesign

### 3.1 Theme System

#### Dark Mode (Default - Current)
```css
/* Background */
--bg-base: #13111C;
--bg-surface: #1A1825;
--bg-card: #242136;
--bg-nav: #181622;

/* Text */
--text-primary: #F4F4F6;
--text-secondary: #A8A4B8;
--text-muted: #6B6778;

/* Accent - Cyan */
--accent-cyan: #5EEAD4;
--accent-cyan-hover: #14B8A6;
--accent-cyan-muted: rgba(94, 234, 212, 0.1);

/* Accent - Purple */
--accent-purple: #A78BFA;
--accent-purple-hover: #8B5CF6;
--accent-purple-muted: rgba(167, 139, 250, 0.1);

/* Border */
--border-subtle: #2E2B3D;
--border-active: rgba(94, 234, 212, 0.25);
```

#### Light Mode (New)
```css
/* Background - Clean & Bright */
--bg-base: #F8F9FC;
--bg-surface: #FFFFFF;
--bg-card: #F1F3F8;
--bg-nav: #FFFFFF;

/* Text - Dark & Readable */
--text-primary: #1A1B2E;
--text-secondary: #4A4B6A;
--text-muted: #8B8CA8;

/* Accent - Cyan (darker for contrast on light) */
--accent-cyan: #0D9488;
--accent-cyan-hover: #0F766E;
--accent-cyan-muted: rgba(13, 148, 136, 0.08);

/* Accent - Purple (darker for contrast on light) */
--accent-purple: #7C3AED;
--accent-purple-hover: #6D28D9;
--accent-purple-muted: rgba(124, 58, 237, 0.08);

/* Border */
--border-subtle: #E2E4EB;
--border-active: rgba(13, 148, 136, 0.3);
```

#### Theme Implementation
- Store preference in `localStorage` (`xvoc-admin-theme`)
- Apply via `data-theme="dark"` or `data-theme="light"` on `<html>`
- Toggle button in sidebar header

### 3.2 Sidebar Redesign

#### Current Issues
- Colors contrasting/clashing
- Layout not neat
- Missing proper visual hierarchy

#### Proposed Design

```
┌──────────────────────────────────────────┐
│  [Logo]  X-VOCA              [Theme]    │  ← Compact header
├──────────────────────────────────────────┤
│                                          │
│  [User Avatar]                           │
│  Admin Name                  [Settings]  │  ← User section
│  Status indicator                       │
│                                          │
├──────────────────────────────────────────┤
│  MENU                                    │  ← Section label
│                                          │
│  [Icon] Dashboard                        │
│  [Icon] Jadwal Stream                   │
│  [Icon] Game Voting                      │
│  [Icon] Collab Requests      [Badge]     │  ← NEW
│  [Icon] Content Guide                    │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  [Icon] Settings                         │
│  [Icon] Logout                           │
│                                          │
├──────────────────────────────────────────┤
│  [Collapse Toggle]                       │  ← Bottom
└──────────────────────────────────────────┘
```

#### Sidebar States
- **Expanded:** 260px width, full labels
- **Collapsed:** 72px width, icons only with tooltips
- Smooth transition animation (200ms)

### 3.3 Dashboard Redesign

#### New Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Welcome Header                                                  │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │ User Avatar + Name          │  │ Broadcasting Toggle     │  │
│  │ Current Date/Time            │  │ Theme Switcher          │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Stats Grid (4 columns)                                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │ Votes  │ │Schedule│ │ Tasks  │ │Content │                   │
│  │ 1,247  │ │   03   │ │   05   │ │   18   │                   │
│  │ +12%   │ │Upcoming│ │Pending │ │ Active │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
├─────────────────────────────────────────────────────────────────┤
│  Quick Actions (3 columns)                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ + Jadwal     │ │ Moderasi     │ │ + Content    │            │
│  │   Stream     │ │ Voting       │ │   Guide      │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│  Recent Activity Log                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Time        │ Action        │ Details                       ││
│  │─────────────│───────────────│───────────────────────────────││
│  │ 10 min ago  │ Vote Masuk    │ New vote for Elden Ring       ││
│  │ 30 min ago  │ Jadwal Update │ Schedule updated              ││
│  │ 2 hrs ago   │ Request Game  │ New request: Signalis        ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Upcoming Streams (Compact)                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Card] Stream 1  │ [Card] Stream 2  │ [Card] Stream 3     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Voting Moderation Page Redesign

#### Current Flow
- Table-based list with filter tabs
- Basic accept/reject buttons

#### Proposed Design
```
┌─────────────────────────────────────────────────────────────────┐
│  Voting Moderation                                               │
├─────────────────────────────────────────────────────────────────┤
│  Summary Cards                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Requested│ │ Accepted │ │ Playing  │ │ Done     │           │
│  │    12    │ │    08    │ │    03    │ │    45    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [Search...]                            [Filter▼] [Period▼] │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [Tab: ALL] [REQUESTED] [ACCEPTED] [PLAYING] [DONE]       │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Game Cards Grid                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │ [Cover Image]    │  │ [Cover Image]    │                     │
│  │ Title           │  │ Title           │                     │
│  │ Genre • Votes   │  │ Genre • Votes   │                     │
│  │ [Req by Viewer] │  │ [Req by Viewer] │                     │
│  │                 │  │                 │                     │
│  │ [✓] [▶] [🗑]   │  │ [✓] [▶] [🗑]   │                     │
│  └─────────────────┘  └─────────────────┘                     │
├─────────────────────────────────────────────────────────────────┤
│  [Export CSV]  [Reset Period]                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 New Page: Collab Requests Management

```
┌─────────────────────────────────────────────────────────────────┐
│  Collab Requests                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Summary Cards                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Pending  │ │ Approved │ │ Rejected │ │ Total    │           │
│  │    05    │ │    12    │ │    03    │ │    20    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [Search...]                            [Filter▼] [Period▼] │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Request Cards (Stacked List)                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [Avatar] @requested_streamer                   [Pending]  │ │
│  │ Social: twitter.com/streamer                             │ │
│  │ Message: "Ingin collab gaming bareng..."                 │ │
│  │ Requested: 2 hours ago                                   │ │
│  │                                         [Approve] [Reject] │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [Avatar] @another_streamer                   [Approved] │ │
│  │ Social: instagram.com/streamer                            │ │
│  │ Message: ""                                              │ │
│  │ Requested: 1 day ago                                     │ │
│  │ Reviewed by: Admin • 5 hours ago                         │ │
│  │                                         [Add to Schedule] │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Feature 3: Enhanced Functionality

### 4.1 Dashboard Quick Actions

| Action | Target | Description |
|--------|--------|-------------|
| Add Schedule | `/admin/schedules?action=create` | Opens create form |
| Voting Moderation | `/admin/voting` | Navigate to moderation |
| Add Content | `/admin/content?action=create` | Opens create form |
| Collab Requests | `/admin/collab-requests` | NEW - View collab requests |

### 4.2 Broadcasting Control

- Toggle switch in header
- Real-time sync with Firebase
- Visual indicator (ON AIR / OFFLINE)
- Quick toggle from dashboard

### 4.3 Notification System

#### Notification Types
| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `vote_received` | BarChart | cyan | New vote on game |
| `game_requested` | Gamepad | gold | New game request |
| `collab_requested` | Users | purple | NEW - New collab request |
| `schedule_upcoming` | Calendar | orange | Stream in 1 hour |

#### Notification Bell
- Badge count for unread
- Dropdown panel with recent notifications
- Mark as read functionality
- Click to navigate to relevant page

### 4.4 Search Functionality

Global search modal (Cmd/Ctrl + K):
- Search across: Games, Schedules, Content, Collab Requests
- Quick actions from search results
- Keyboard navigation

---

## 5. Feature 4: Additional Suggestions

### 5.1 Todo/Task Management (Expand)

Current `todos` table exists but no admin UI. Suggest adding:
- Todo list in sidebar or dashboard
- Quick add from dashboard
- Priority levels (low/medium/high/urgent)
- Deadline tracking

### 5.2 Analytics Dashboard

| Metric | Description |
|--------|-------------|
| Votes per day | Line chart of votes over time |
| Top games | Most voted games this period |
| Viewer engagement | Active viewers trend |
| Content performance | Most viewed content guides |

### 5.3 Quick Stats Widget

Real-time counter showing:
- Current viewers (if live)
- Active votes today
- Pending tasks

---

## 6. Implementation Order

### Phase 1: Database & Backend (Foundation)
1. Create `collab_requests` migration and model
2. Add `collab_guest` and `collab_social` fields to schedules
3. Create collab request API endpoints
4. Create audit log entries for collab actions

### Phase 2: Theme System (UI Foundation)
1. Create theme context provider
2. Implement CSS variable switching
3. Add theme toggle component
4. Apply light mode styles throughout

### Phase 3: Admin Layout Redesign
1. Redesign sidebar with proper styling
2. Add notification bell with dropdown
3. Implement theme switcher in sidebar
4. Fix color contrast issues

### Phase 4: Dashboard Enhancement
1. Redesign stat cards
2. Add upcoming streams preview
3. Improve activity log display
4. Add quick action cards

### Phase 5: Collab Requests Page
1. Create CollabRequestsPage component
2. Implement request list with filters
3. Add approve/reject functionality
4. Add "Add to Schedule" action

### Phase 6: Voting Moderation Redesign
1. Redesign with card-based layout
2. Improve filter/search UX
3. Add bulk actions
4. Enhance visual feedback

### Phase 7: Viewer-Side Integration
1. Add "Request Collab" button on schedule section
2. Create collab request form modal
3. Display collab info on schedule cards
4. Update schedule detail page

---

## 7. File Structure Changes

### New Files

```
web/frontend/src/
├── components/
│   └── admin/
│       ├── CollabRequestsPage.jsx      # NEW
│       ├── CollabRequestCard.jsx        # NEW
│       ├── CollabRequestModal.jsx       # NEW (viewer)
│       ├── ThemeToggle.jsx              # NEW
│       ├── NotificationDropdown.jsx      # NEW
│       ├── StatCardSkeleton.jsx         # NEW
│       └── PageHeader.jsx               # NEW (reusable header)
│
├── pages/
│   └── admin/
│       └── CollabRequestsPage.jsx       # Main collab requests page
│
├── services/
│   └── collabRequestService.js         # NEW
│
├── hooks/
│   ├── useTheme.js                      # NEW - Theme management
│   └── useCollabRequests.js             # NEW - Collab requests data
│
└── context/
    └── ThemeContext.jsx                 # NEW - Theme provider

web/backend/src/
├── models/
│   └── CollabRequest.js                 # NEW
│
├── controllers/
│   └── collabRequest.controller.js     # NEW
│
└── routes/
    └── collabRequest.routes.js         # NEW
```

### Modified Files

```
web/frontend/src/
├── components/admin/
│   ├── AdminLayout.jsx                 # Add theme provider, notification dropdown
│   ├── Sidebar.jsx                     # Redesign, add collab menu item
│   ├── Topbar.jsx                      # Add theme toggle, notification bell
│   └── NotificationBell.jsx            # Expand functionality
│
├── pages/admin/
│   ├── DashboardPage.jsx               # Redesign layout
│   ├── SchedulePage.jsx                # Minor updates
│   ├── VotingModerationPage.jsx        # Redesign layout
│   └── ContentManagementPage.jsx       # Minor updates
│
├── components/common/
│   ├── StatCard.jsx                    # Improve styling
│   ├── ActionCard.jsx                  # Improve styling
│   ├── Button.jsx                      # Add variants
│   ├── Input.jsx                       # Add variants
│   └── Badge.jsx                       # Add variants
│
├── index.css                           # Add light mode variables
├── tailwind.config.js                  # Add light mode colors
└── App.jsx                             # Add theme context provider

web/backend/src/
├── models/
│   └── Schedule.js                     # Add collab fields
│
├── controllers/
│   └── (existing controllers)          # Add audit logs
│
└── routes/
    └── (existing routes)               # Add collab request routes
```

---

## 8. Design Guidelines

### 8.1 Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page Title | Outfit | 24px | 600 |
| Section Header | Outfit | 18px | 600 |
| Card Title | Inter | 16px | 500 |
| Body Text | Inter | 14px | 400 |
| Small/Caption | Inter | 12px | 400 |
| Mono/Code | JetBrains Mono | 12px | 400 |

### 8.2 Spacing System

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing, inline elements |
| sm | 8px | Icon gaps, tight padding |
| md | 12px | Standard padding |
| lg | 16px | Card padding, section gaps |
| xl | 24px | Section spacing |
| 2xl | 32px | Major section gaps |

### 8.3 Component Guidelines

#### Buttons
- **Primary:** Cyan background, dark text, rounded-lg
- **Secondary:** Transparent with border, cyan text
- **Danger:** Red background for destructive actions
- **Ghost:** Transparent, subtle hover state

#### Cards
- Rounded-xl (20px radius)
- Subtle border (1px)
- Slight hover lift effect
- Consistent padding (16-20px)

#### Inputs
- Rounded-lg
- Subtle border
- Focus state with accent color ring
- Clear labels and helper text

### 8.4 Animation Guidelines

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Micro-interaction | 150ms | ease-out | Button hover, toggle |
| Component | 200ms | ease-out | Modal open, sidebar collapse |
| Page transition | 300ms | ease-in-out | Route change |
| Loading | 1.5s | linear | Skeleton shimmer |

---

## 9. Testing Requirements

### 9.1 Functional Testing
- [ ] Collab request submission (viewer)
- [ ] Collab request moderation (admin)
- [ ] Theme switching (dark/light)
- [ ] Sidebar collapse/expand
- [ ] All CRUD operations

### 9.2 Visual Testing
- [ ] Color contrast (WCAG AA compliance)
- [ ] Dark mode appearance
- [ ] Light mode appearance
- [ ] Responsive layout
- [ ] Loading states
- [ ] Error states

### 9.3 Integration Testing
- [ ] API endpoints
- [ ] Database operations
- [ ] Firebase real-time sync
- [ ] Authentication flow

---

## 10. Notes

### 10.1 Priority
1. Collab Request System (new feature)
2. Theme System (foundation)
3. Admin Layout Redesign (UX improvement)
4. Dashboard Enhancement (UX improvement)
5. Additional Features (suggestions)

### 10.2 Backward Compatibility
- Maintain existing API contracts where possible
- Add new fields as nullable
- Deprecate old features gracefully

### 10.3 Performance
- Lazy load Collab Requests page
- Optimize re-renders with React.memo
- Debounce search inputs
- Virtualize long lists

---

## 11. Questions & Clarifications

### Pending from User
1. **Collab Request Flow:** Viewer requests a streamer, creator decides whether to collab or not. (Confirmed)
2. **Theme Preference:** Admin can switch between dark/light mode. (Confirmed)
3. **UI Issues:** Color contrast and sidebar neatness to be fixed. (Confirmed)
4. **Responsive:** User mentioned not to focus on responsive design.

### Suggested for Confirmation
1. Should collab requests have an expiration date?
2. Should there be a limit on how many collab requests a viewer can make?
3. Should approved collab requests automatically appear in schedule suggestions?
4. Any specific analytics metrics needed beyond what was suggested?

---

*Document Version: 1.0*  
*Last Updated: 2024*  
*Status: Ready for Implementation*
