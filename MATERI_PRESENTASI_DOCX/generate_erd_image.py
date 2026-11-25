import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import numpy as np
import os

def generate_erd():
    # Ultra-sharp 4K canvas (width: 26 inches, height: 17 inches, 300 DPI)
    fig, ax = plt.subplots(figsize=(26, 17), dpi=300)
    
    canvas_bg = '#F8FAFC' # Crisp modern Slate-50 background
    fig.patch.set_facecolor(canvas_bg)
    ax.set_facecolor(canvas_bg)
    
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Draw technical blueprint grid dots
    grid_x = np.linspace(2, 98, 65)
    grid_y = np.linspace(2, 98, 43)
    gx, gy = np.meshgrid(grid_x, grid_y)
    ax.scatter(gx, gy, color='#E2E8F0', s=1.8, zorder=0)

    # -------------------------------------------------------------
    # 1. TOP HEADER BANNER
    # -------------------------------------------------------------
    header_box = FancyBboxPatch(
        (3.0, 93.0), 94.0, 5.2,
        boxstyle="round,pad=0.2,rounding_size=0.8",
        facecolor='#1E3A8A', edgecolor='#0F172A', linewidth=1.5, zorder=2
    )
    ax.add_patch(header_box)

    ax.text(
        4.8, 96.2, "DIAGRAM ENTITY RELATIONSHIP (ERD) — PLATFORM SISTEM X-VOCA",
        fontsize=16.5, fontweight='bold', color='#FFFFFF', va='center', zorder=3,
        family='sans-serif'
    )
    ax.text(
        4.8, 94.4, "Visualisasi Relasi Antar-Tabel Relasional (MySQL / Sequelize ORM), Integritas Referensial (CASCADE / SET NULL), & Jalur Kunci Asing",
        fontsize=9.5, color='#93C5FD', va='center', zorder=3, family='sans-serif'
    )

    # Badges inside top header banner
    meta_badges = [
        ("ENGINE", "InnoDB (ACID)", '#1E40AF', '#DBEAFE'),
        ("CHARSET", "utf8mb4_unicode_ci", '#065F46', '#D1FAE5'),
        ("TOTAL TABEL", "8 Entitas Fisik", '#854D0E', '#FEF9C3')
    ]
    bx = 95.0
    for title, val, bcol, tcol in reversed(meta_badges):
        bw = len(f"{title}: {val}") * 0.48 + 1.2
        bx -= bw
        bb = FancyBboxPatch(
            (bx, 94.5), bw - 0.5, 2.2,
            boxstyle="round,pad=0.1,rounding_size=0.3",
            facecolor=bcol, edgecolor='none', zorder=3
        )
        ax.add_patch(bb)
        ax.text(bx + (bw - 0.5)/2, 96.0, title, fontsize=6.2, fontweight='bold',
                color='#94A3B8', ha='center', va='center', zorder=4)
        ax.text(bx + (bw - 0.5)/2, 94.9, val, fontsize=7.2, fontweight='bold',
                color=tcol, ha='center', va='center', zorder=4)
        bx -= 0.8

    # Anchor registry for exact connection points
    anchors = {}

    # -------------------------------------------------------------
    # 2. TABLE CARD DRAWING ENGINE
    # -------------------------------------------------------------
    def draw_table_card(x, y, w, h, tbl_name, subtitle, fields, theme_color='#1E3A8A'):
        """
        Draws an engineering-grade database table entity card.
        """
        # Drop shadow
        shadow = FancyBboxPatch(
            (x + 0.35, y - h - 0.35), w, h,
            boxstyle="round,pad=0.1,rounding_size=0.6",
            facecolor='#CBD5E1', edgecolor='none', alpha=0.45, zorder=1
        )
        ax.add_patch(shadow)

        # Card body
        card = FancyBboxPatch(
            (x, y - h), w, h,
            boxstyle="round,pad=0.1,rounding_size=0.6",
            facecolor='#FFFFFF', edgecolor='#94A3B8', linewidth=1.2, zorder=2
        )
        ax.add_patch(card)

        # Header bar
        header_h = 2.1
        header = FancyBboxPatch(
            (x, y - header_h), w, header_h,
            boxstyle="round,pad=0.1,rounding_size=0.6",
            facecolor=theme_color, edgecolor=theme_color, linewidth=1, zorder=3
        )
        ax.add_patch(header)
        # Rect to square off bottom corners of header
        header_sq = patches.Rectangle(
            (x, y - header_h), w, header_h / 2,
            facecolor=theme_color, edgecolor=theme_color, zorder=3
        )
        ax.add_patch(header_sq)

        # Table title
        ax.text(
            x + 0.8, y - 0.85, tbl_name,
            fontsize=11.5, fontweight='bold', color='#FFFFFF', va='center', zorder=4, family='sans-serif'
        )
        ax.text(
            x + w - 0.8, y - 0.9, subtitle,
            fontsize=7.5, color='#E2E8F0', ha='right', va='center', zorder=4, family='sans-serif'
        )

        # Calculate row height
        row_count = len(fields)
        row_h = (h - header_h - 0.3) / max(row_count, 1)

        for i, f in enumerate(fields):
            name, ftype, ktype, constraint = f
            row_top = y - header_h - 0.15 - (i * row_h)
            center_y = row_top - (row_h / 2)

            # Alternating row background
            if i % 2 == 1:
                row_bg = patches.Rectangle(
                    (x + 0.08, row_top - row_h), w - 0.16, row_h,
                    facecolor='#F8FAFC', edgecolor='none', zorder=3
                )
                ax.add_patch(row_bg)

            # Badge rendering
            badge_x = x + 0.5
            if ktype == 'PK':
                bp = FancyBboxPatch(
                    (badge_x, center_y - 0.42), 1.25, 0.84,
                    boxstyle="round,pad=0.04,rounding_size=0.2",
                    facecolor='#FEF3C7', edgecolor='#F59E0B', linewidth=0.8, zorder=4
                )
                ax.add_patch(bp)
                ax.text(badge_x + 0.62, center_y, "PK", fontsize=6.8, fontweight='bold',
                        color='#B45309', ha='center', va='center', zorder=5)
                # Register anchors for PK
                anchors[f"{tbl_name}.{name}"] = {
                    'left': (x, center_y),
                    'right': (x + w, center_y),
                    'top': (x + w/2, y),
                    'bottom': (x + w/2, y - h),
                    'center_y': center_y
                }

            elif ktype == 'FK':
                bp = FancyBboxPatch(
                    (badge_x, center_y - 0.42), 1.25, 0.84,
                    boxstyle="round,pad=0.04,rounding_size=0.2",
                    facecolor='#DBEAFE', edgecolor='#2563EB', linewidth=0.8, zorder=4
                )
                ax.add_patch(bp)
                ax.text(badge_x + 0.62, center_y, "FK", fontsize=6.8, fontweight='bold',
                        color='#1D4ED8', ha='center', va='center', zorder=5)
                # Register anchors for FK
                anchors[f"{tbl_name}.{name}"] = {
                    'left': (x, center_y),
                    'right': (x + w, center_y),
                    'top': (x + w/2, y),
                    'bottom': (x + w/2, y - h),
                    'center_y': center_y
                }

            elif ktype == 'IDX':
                bp = FancyBboxPatch(
                    (badge_x, center_y - 0.42), 1.25, 0.84,
                    boxstyle="round,pad=0.04,rounding_size=0.2",
                    facecolor='#F1F5F9', edgecolor='#64748B', linewidth=0.8, zorder=4
                )
                ax.add_patch(bp)
                ax.text(badge_x + 0.62, center_y, "IDX", fontsize=6.2, fontweight='bold',
                        color='#475569', ha='center', va='center', zorder=5)
            else:
                ax.text(badge_x + 0.62, center_y, "•", fontsize=9.0, color='#94A3B8',
                        ha='center', va='center', zorder=4)

            # Field name
            is_key = ktype in ['PK', 'FK']
            f_color = '#0F172A' if is_key else '#334155'
            f_weight = 'bold' if is_key else 'normal'
            ax.text(
                x + 2.0, center_y, name,
                fontsize=7.8, fontweight=f_weight, color=f_color, va='center', zorder=4, family='sans-serif'
            )

            # Constraint / details
            if constraint:
                ax.text(
                    x + 2.0 + len(name) * 0.42 + 0.8, center_y, constraint,
                    fontsize=6.5, color='#94A3B8', va='center', zorder=4, family='sans-serif', fontstyle='italic'
                )

            # Data Type
            ax.text(
                x + w - 0.6, center_y, ftype,
                fontsize=7.2, color='#64748B', ha='right', va='center', zorder=4, family='monospace'
            )

        # Store overall table anchors
        anchors[tbl_name] = {
            'left': (x, y - h/2),
            'right': (x + w, y - h/2),
            'top': (x + w/2, y),
            'bottom': (x + w/2, y - h),
            'x': x, 'y': y, 'w': w, 'h': h
        }

    # -------------------------------------------------------------
    # 3. DEFINE AND DRAW 8 ENTITIES
    # -------------------------------------------------------------

    # [TABLE 1] users (Center Top)
    users_fields = [
        ("id", "INT", "PK", "Auto Inc, Not Null"),
        ("name", "VARCHAR(255)", "", "Not Null"),
        ("email", "VARCHAR(255)", "", "UNIQUE, Not Null"),
        ("password", "VARCHAR(255)", "", "bcrypt Hash 60 chars"),
        ("role", "ENUM('admin','mod')", "", "Default: 'admin'"),
        ("avatar_url", "VARCHAR(500)", "", "Nullable"),
        ("bio", "TEXT", "", "Nullable"),
        ("is_broadcasting", "BOOLEAN", "", "Default: false"),
        ("created_at", "DATETIME", "", "CURRENT_TIMESTAMP"),
        ("updated_at", "DATETIME", "", "CURRENT_TIMESTAMP")
    ]
    draw_table_card(37.0, 90.5, 26.0, 12.0, "users", "Admin & Streamer (Parent Root)", users_fields, '#1E3A8A')

    # [TABLE 2] schedules (Row 2, Far Left)
    schedules_fields = [
        ("id", "INT", "PK", "Auto Inc, Not Null"),
        ("user_id", "INT", "FK", "Ref -> users.id"),
        ("title", "VARCHAR(255)", "", "Not Null"),
        ("description", "TEXT", "", "Nullable"),
        ("scheduled_at", "DATETIME", "", "Not Null"),
        ("status", "ENUM('live',..)", "", "Default: 'upcoming'"),
        ("game_category", "VARCHAR(100)", "", "Nullable"),
        ("stream_platform", "VARCHAR(50)", "", "Default: 'YouTube'"),
        ("youtube_url", "VARCHAR(500)", "", "Nullable"),
        ("created_at", "DATETIME", "", "CURRENT_TIMESTAMP"),
        ("updated_at", "DATETIME", "", "CURRENT_TIMESTAMP")
    ]
    draw_table_card(3.0, 71.0, 22.0, 12.8, "schedules", "Jadwal Siaran Live (1:N)", schedules_fields, '#0284C7')

    # [TABLE 3] todos (Row 2, Center Left)
    todos_fields = [
        ("id", "INT", "PK", "Auto Inc, Not Null"),
        ("user_id", "INT", "FK", "Ref -> users.id"),
        ("title", "VARCHAR(255)", "", "Not Null"),
        ("description", "TEXT", "", "Nullable"),
        ("status", "ENUM('done',..)", "", "Default: 'pending'"),
        ("priority", "ENUM('urgent',..)", "", "Default: 'medium'"),
        ("due_date", "DATETIME", "", "Nullable"),
        ("created_at", "DATETIME", "", "CURRENT_TIMESTAMP"),
        ("updated_at", "DATETIME", "", "CURRENT_TIMESTAMP")
    ]
    draw_table_card(27.5, 71.0, 21.5, 11.0, "todos", "Checklist Studio (1:N)", todos_fields, '#0D9488')

    # [TABLE 4] content_guides (Row 2, Center Right)
    content_fields = [
        ("id", "INT", "PK", "Auto Inc, Not Null"),
        ("user_id", "INT", "FK", "Ref -> users.id (SET NULL)"),
        ("title", "VARCHAR(255)", "", "Not Null"),
        ("description", "TEXT", "", "Nullable"),
        ("category", "VARCHAR(100)", "", "Not Null"),
        ("video_url", "VARCHAR(500)", "", "Not Null"),
        ("thumbnail_url", "MEDIUMTEXT", "", "Nullable"),
        ("duration", "VARCHAR(20)", "", "Nullable (HH:MM:SS)"),
        ("view_count", "INT", "", "Default: 0"),
        ("is_pinned", "BOOLEAN", "", "Default: false"),
        ("created_at", "DATETIME", "", "CURRENT_TIMESTAMP"),
        ("updated_at", "DATETIME", "", "CURRENT_TIMESTAMP")
    ]
    draw_table_card(51.5, 71.0, 22.5, 13.6, "content_guides", "Arsip Video VOD (1:N)", content_fields, '#10B981')

    # [TABLE 5] collab_requests (Row 2, Far Right)
    collab_fields = [
        ("id", "INT", "PK", "Auto Inc, Not Null"),
        ("streamer_name", "VARCHAR(255)", "", "Not Null"),
        ("platform", "VARCHAR(50)", "", "Default: 'YouTube'"),
        ("channel_url", "VARCHAR(500)", "", "Not Null"),
        ("contact", "VARCHAR(255)", "", "Email / Discord"),
        ("proposed_game", "VARCHAR(255)", "", "Not Null"),
        ("proposed_date", "DATE", "", "Not Null"),
        ("notes", "TEXT", "", "Nullable"),
        ("status", "ENUM('appr',..)", "", "Default: 'pending'"),
        ("reviewed_by", "INT", "FK", "Ref -> users.id (SET NULL)"),
        ("reviewed_at", "DATETIME", "", "Nullable"),
        ("admin_notes", "TEXT", "", "Nullable"),
        ("created_at", "DATETIME", "", "CURRENT_TIMESTAMP")
    ]
    draw_table_card(76.5, 71.0, 20.5, 14.8, "collab_requests", "Pengajuan Collab (1:N)", collab_fields, '#6366F1')

    # [TABLE 6] games (Row 3, Bottom Left)
    games_fields = [
        ("id", "INT", "PK", "Auto Inc, Not Null"),
        ("title", "VARCHAR(255)", "", "Not Null"),
        ("description", "TEXT", "", "Nullable"),
        ("genre", "VARCHAR(100)", "", "Nullable"),
        ("cover_url", "MEDIUMTEXT", "", "Tautan CDN / Base64"),
        ("vote_count", "INT", "", "Default: 0 (Denorm)"),
        ("status", "ENUM('active',..)", "", "Default: 'active'"),
        ("requested_by", "VARCHAR(255)", "", "Nullable (Penonton)"),
        ("requested_at", "DATETIME", "", "Nullable"),
        ("created_at", "DATETIME", "", "CURRENT_TIMESTAMP"),
        ("updated_at", "DATETIME", "", "CURRENT_TIMESTAMP")
    ]
    draw_table_card(3.0, 48.0, 22.0, 13.0, "games", "Katalog Voting (Parent)", games_fields, '#D97706')

    # [TABLE 7] votes (Row 3, Bottom Center Left)
    votes_fields = [
        ("id", "INT", "PK", "Auto Inc, Not Null"),
        ("game_id", "INT", "FK", "Ref -> games.id (CASCADE)"),
        ("ip_address", "VARCHAR(45)", "", "IPv4 / IPv6, Not Null"),
        ("fingerprint", "VARCHAR(255)", "", "FingerprintJS Hash"),
        ("user_agent", "VARCHAR(500)", "", "Browser / OS String"),
        ("period", "VARCHAR(7)", "", "Format: 'YYYY-MM'"),
        ("created_at", "DATETIME", "", "CURRENT_TIMESTAMP"),
        ("updated_at", "DATETIME", "", "CURRENT_TIMESTAMP"),
        ("idx_anti_spam", "Composite", "IDX", "[ip, fp, period]")
    ]
    draw_table_card(27.5, 48.0, 21.5, 11.2, "votes", "Transaksi Suara Publik (1:N)", votes_fields, '#EA580C')

    # [TABLE 8] audit_logs (Row 3, Bottom Far Right)
    audit_fields = [
        ("id", "INT", "PK", "Auto Inc, Not Null"),
        ("action_type", "VARCHAR(100)", "", "e.g. 'VOTE_MASUK'"),
        ("detail", "TEXT", "", "Rincian Transaksi"),
        ("sub_detail", "VARCHAR(255)", "", "IP / Metadata"),
        ("ip_address", "VARCHAR(45)", "", "Nullable"),
        ("user_agent", "VARCHAR(500)", "", "Nullable"),
        ("created_at", "DATETIME", "", "Timestamp Kejadian")
    ]
    draw_table_card(76.5, 48.0, 20.5, 9.4, "audit_logs", "Audit Trail Keamanan (Standalone)", audit_fields, '#475569')

    # -------------------------------------------------------------
    # 4. RELATIONSHIP LINES (JARING-JARING JALUR RELASI BERWARNA)
    # -------------------------------------------------------------
    def draw_connecting_network(start_pt, end_pt, waypoints, color, label_text, rule_text,
                                card_start="1", card_end="N", tag_offset=(0, 0)):
        """
        Draws high-visibility orthogonal network connector line with:
        - White glowing background line
        - High-contrast colored solid line
        - Parent endpoint ring & '1' cardinality mark
        - Child endpoint arrowhead pointing directly into the FK field row
        - Informative floating tag badge (Label + Rule)
        """
        full_path = [start_pt] + waypoints + [end_pt]
        xs = [p[0] for p in full_path]
        ys = [p[1] for p in full_path]

        # White glow under-layer to prevent any visual confusion
        ax.plot(xs, ys, color='#FFFFFF', linewidth=5.5, zorder=6, solid_capstyle='round')
        # Main relationship path
        ax.plot(xs, ys, color=color, linewidth=2.4, zorder=7, solid_capstyle='round')

        # Parent Endpoint (PK): White filled circle with colored border & '1' label
        ax.scatter([start_pt[0]], [start_pt[1]], color='#FFFFFF', edgecolors=color, s=65, linewidth=2.2, zorder=8)
        ax.text(
            start_pt[0] + (0.6 if start_pt[0] <= 50 else -0.6), start_pt[1] + 0.45,
            f"[{card_start}]", fontsize=8.2, fontweight='bold', color=color,
            ha='center', va='bottom', zorder=9, family='sans-serif'
        )

        # Child Endpoint (FK): Solid Arrowhead pointing directly into the FK field row
        dx = end_pt[0] - full_path[-2][0]
        dy = end_pt[1] - full_path[-2][1]
        dist = np.hypot(dx, dy)
        if dist > 0:
            dx /= dist
            dy /= dist

        ax.annotate(
            '', xy=end_pt, xytext=(end_pt[0] - dx * 0.1, end_pt[1] - dy * 0.1),
            arrowprops=dict(
                arrowstyle="-|>", color=color, lw=2.4,
                mutation_scale=18
            ),
            zorder=8
        )
        ax.text(
            end_pt[0] + (0.7 if dx >= 0 else -0.7), end_pt[1] + 0.45,
            f"[∞ {card_end}]", fontsize=8.2, fontweight='bold', color=color,
            ha='center', va='bottom', zorder=9, family='sans-serif'
        )

        # Place informative pill tag on the most prominent waypoint segment
        mid_idx = len(full_path) // 2
        p1 = full_path[mid_idx - 1]
        p2 = full_path[mid_idx]
        tx = (p1[0] + p2[0]) / 2 + tag_offset[0]
        ty = (p1[1] + p2[1]) / 2 + tag_offset[1]

        # Pill background
        pw, ph = 7.4, 1.55
        pill = FancyBboxPatch(
            (tx - pw/2, ty - ph/2), pw, ph,
            boxstyle="round,pad=0.1,rounding_size=0.35",
            facecolor='#FFFFFF', edgecolor=color, linewidth=1.4, zorder=10
        )
        ax.add_patch(pill)

        ax.text(
            tx, ty + 0.22, label_text,
            fontsize=7.4, fontweight='bold', color=color,
            ha='center', va='center', zorder=11, family='sans-serif'
        )
        ax.text(
            tx, ty - 0.32, rule_text,
            fontsize=6.4, fontweight='bold', color='#475569',
            ha='center', va='center', zorder=11, family='sans-serif'
        )

    # -------------------------------------------------------------
    # EXACT FIELD-TO-FIELD ROUTING (JARING-JARING BERSIH TANPA TABRAKAN)
    # -------------------------------------------------------------

    # Line 1: users.id (PK, Y ≈ 87.77) -> schedules.user_id (FK, Y ≈ 67.33)
    # Routes left via outer highway X = 1.4, enters left side of schedules.user_id directly
    l1_start = anchors["users.id"]['left']                      # (37.0, 87.77)
    l1_end = anchors["schedules.user_id"]['left']               # (3.0, 67.33)
    l1_waypoints = [
        (1.4, l1_start[1]),                                     # Out left to outer corridor
        (1.4, l1_end[1])                                        # Down outer corridor to row level
    ]
    draw_connecting_network(
        l1_start, l1_end, l1_waypoints, '#0284C7',
        "users (1) ───< schedules (N)", "ON DELETE CASCADE",
        tag_offset=(0, 0.4)
    )

    # Line 2: users.id (PK) -> todos.user_id (FK, Y ≈ 67.32)
    # Starts at users bottom-left (X=37.0, Y=78.5), down corridor X=26.25, enters todos.user_id left side
    l2_start = (37.0, 82.0)                                     # Lower left of users
    l2_end = anchors["todos.user_id"]['left']                   # (27.5, 67.32)
    l2_waypoints = [
        (26.25, 82.0),                                          # Into corridor between schedules & todos
        (26.25, l2_end[1])                                      # Down to todos.user_id row
    ]
    draw_connecting_network(
        l2_start, l2_end, l2_waypoints, '#0D9488',
        "users (1) ───< todos (N)", "ON DELETE CASCADE",
        tag_offset=(-0.4, 0.4)
    )

    # Line 3: users.id (PK) -> content_guides.user_id (FK, Y ≈ 67.35)
    # Starts at users bottom-right (X=63.0, Y=82.0), down corridor X=50.25, enters content_guides.user_id left side
    l3_start = (63.0, 82.0)                                     # Lower right of users
    l3_end = anchors["content_guides.user_id"]['left']          # (51.5, 67.35)
    l3_waypoints = [
        (50.25, 82.0),                                          # Into corridor between todos & content_guides
        (50.25, l3_end[1])                                      # Down to content_guides.user_id row
    ]
    draw_connecting_network(
        l3_start, l3_end, l3_waypoints, '#10B981',
        "users (1) ───< guides (N)", "ON DELETE SET NULL",
        tag_offset=(0.4, 0.4)
    )

    # Line 4: users.id (PK, Y ≈ 87.77) -> collab_requests.reviewed_by (FK, Y ≈ 59.69)
    # Routes right via corridor X=75.25, enters collab_requests.reviewed_by left side
    l4_start = anchors["users.id"]['right']                     # (63.0, 87.77)
    l4_end = anchors["collab_requests.reviewed_by"]['left']     # (76.5, 59.69)
    l4_waypoints = [
        (75.25, l4_start[1]),                                   # Out right to corridor between guides & collab
        (75.25, l4_end[1])                                      # Down corridor to reviewed_by row
    ]
    draw_connecting_network(
        l4_start, l4_end, l4_waypoints, '#6366F1',
        "users (1) ───< collabs (N)", "ON DELETE SET NULL",
        tag_offset=(0, 0.4)
    )

    # Line 5: games.id (PK, Y ≈ 45.27) -> votes.game_id (FK, Y ≈ 44.28)
    # Direct horizontal connection between games right side and votes left side
    l5_start = anchors["games.id"]['right']                     # (25.0, 45.27)
    l5_end = anchors["votes.game_id"]['left']                   # (27.5, 44.28)
    l5_waypoints = [
        (26.25, l5_start[1]),
        (26.25, l5_end[1])
    ]
    draw_connecting_network(
        l5_start, l5_end, l5_waypoints, '#D97706',
        "games (1) ───< votes (N)", "ON DELETE CASCADE",
        tag_offset=(0, 1.4)
    )

    # -------------------------------------------------------------
    # 5. LEGEND & NOTATION GUIDE CARD (Row 3, Center Right)
    # -------------------------------------------------------------
    leg_x, leg_y, leg_w, leg_h = 51.5, 48.0, 22.5, 12.0
    
    leg_shadow = FancyBboxPatch(
        (leg_x + 0.35, leg_y - leg_h - 0.35), leg_w, leg_h,
        boxstyle="round,pad=0.1,rounding_size=0.6",
        facecolor='#CBD5E1', edgecolor='none', alpha=0.45, zorder=1
    )
    ax.add_patch(leg_shadow)

    leg_card = FancyBboxPatch(
        (leg_x, leg_y - leg_h), leg_w, leg_h,
        boxstyle="round,pad=0.1,rounding_size=0.6",
        facecolor='#FFFFFF', edgecolor='#2563EB', linewidth=1.4, zorder=2
    )
    ax.add_patch(leg_card)

    leg_hdr = FancyBboxPatch(
        (leg_x, leg_y - 2.0), leg_w, 2.0,
        boxstyle="round,pad=0.1,rounding_size=0.6",
        facecolor='#EFF6FF', edgecolor='#EFF6FF', zorder=3
    )
    ax.add_patch(leg_hdr)
    ax.text(leg_x + 1.0, leg_y - 1.0, "PANDUAN NOTASI & INTEGRITAS REFERENSIAL",
            fontsize=9.2, fontweight='bold', color='#1E40AF', va='center', zorder=4, family='sans-serif')

    legend_rows = [
        ("[PK]", '#FEF3C7', '#B45309', "Primary Key (Kunci Utama Pengenal Unik)"),
        ("[FK]", '#DBEAFE', '#1D4ED8', "Foreign Key (Kunci Tamu Relasi Tabel)"),
        ("[IDX]", '#F1F5F9', '#475569', "Composite Index (Optimasi Kueri & Anti-Spam)"),
        ("[1] ──< [N]", '#E0E7FF', '#4338CA', "Kardinalitas 1 : N (One-to-Many Relasional)"),
        ("CASCADE", '#FEF2F2', '#DC2626', "On Delete CASCADE (Anak Terhapus Otomatis)"),
        ("SET NULL", '#ECFDF5', '#059669', "On Delete SET NULL (Kolom FK Di-set NULL)")
    ]

    for idx, (badge_str, b_bg, b_fg, desc_txt) in enumerate(legend_rows):
        ry = leg_y - 3.2 - (idx * 1.35)
        bp = FancyBboxPatch(
            (leg_x + 0.8, ry - 0.42), 3.2, 0.85,
            boxstyle="round,pad=0.04,rounding_size=0.2",
            facecolor=b_bg, edgecolor=b_fg, linewidth=0.8, zorder=4
        )
        ax.add_patch(bp)
        ax.text(leg_x + 2.4, ry, badge_str, fontsize=6.8, fontweight='bold',
                color=b_fg, ha='center', va='center', zorder=5, family='sans-serif')
        ax.text(leg_x + 4.4, ry, desc_txt, fontsize=7.2, color='#334155',
                va='center', zorder=5, family='sans-serif')

    # Standalone audit log explanation tag
    audit_tag = FancyBboxPatch(
        (76.5, 37.0), 20.5, 2.8,
        boxstyle="round,pad=0.1,rounding_size=0.4",
        facecolor='#FEF3C7', edgecolor='#F59E0B', linewidth=1.0, zorder=3
    )
    ax.add_patch(audit_tag)
    ax.text(77.2, 38.6, "ENTITAS AUDIT TRAIL INDEPENDEN (STANDALONE):",
            fontsize=7.2, fontweight='bold', color='#B45309', va='center', zorder=4)
    ax.text(77.2, 37.6, "Tabel `audit_logs` sengaja tidak memiliki Foreign Key\nagar rekam jejak sistem abadi (immutable) dan tidak\nterhapus bila akun admin atau jadwal dihapus.",
            fontsize=6.5, color='#78350F', va='center', zorder=4)

    # -------------------------------------------------------------
    # 6. BOTTOM ARCHITECTURAL PANELS (ROW 4: ENTERPRISE CONTEXT)
    # -------------------------------------------------------------
    # Panel A: Arsitektur Database Hibrida (Relasional + NoSQL)
    p1_x, p1_y, p1_w, p1_h = 3.0, 32.5, 30.5, 8.5
    p1_card = FancyBboxPatch(
        (p1_x, p1_y - p1_h), p1_w, p1_h,
        boxstyle="round,pad=0.1,rounding_size=0.6",
        facecolor='#FFFFFF', edgecolor='#0D9488', linewidth=1.2, zorder=2
    )
    ax.add_patch(p1_card)
    p1_hdr = FancyBboxPatch(
        (p1_x, p1_y - 1.8), p1_w, 1.8,
        boxstyle="round,pad=0.1,rounding_size=0.6",
        facecolor='#F0FDFA', edgecolor='#F0FDFA', zorder=3
    )
    ax.add_patch(p1_hdr)
    ax.text(p1_x + 0.8, p1_y - 0.9, "1. ARSITEKTUR HYBRID DATABASE (RDBMS + NOSQL)",
            fontsize=8.5, fontweight='bold', color='#0F766E', va='center', zorder=4)
    
    p1_text = (
        "• MySQL (RDBMS Relasional): Menyimpan data transaksional utama yang membutuhkan\n"
        "  integritas ACID tinggi (Akun Admin, Jadwal Siaran, Konten VOD, Katalog Game, dan Log).\n"
        "• Firebase RTDB (NoSQL Realtime): Menyinkronkan status streaming secara instan (<200ms)\n"
        "  ke ratusan ribu viewer tanpa membebani query relasional MySQL:\n"
        "  - /broadcasting/is_live -> Trigger visual status LIVE/STANDBY di Hero Section.\n"
        "  - /notifications -> Notifikasi push broadcast ke seluruh viewer & mobile app.\n"
        "  - /active_poll -> Polling interaktif penonton secara live waktu-nyata."
    )
    ax.text(p1_x + 0.8, p1_y - 5.3, p1_text, fontsize=6.8, color='#334155', va='center', zorder=4, family='sans-serif')

    # Panel B: Protokol Keamanan Anti-Spam Voting Multi-Layer
    p2_x, p2_y, p2_w, p2_h = 35.5, 32.5, 31.0, 8.5
    p2_card = FancyBboxPatch(
        (p2_x, p2_y - p2_h), p2_w, p2_h,
        boxstyle="round,pad=0.1,rounding_size=0.6",
        facecolor='#FFFFFF', edgecolor='#EA580C', linewidth=1.2, zorder=2
    )
    ax.add_patch(p2_card)
    p2_hdr = FancyBboxPatch(
        (p2_x, p2_y - 1.8), p2_w, 1.8,
        boxstyle="round,pad=0.1,rounding_size=0.6",
        facecolor='#FFF7ED', edgecolor='#FFF7ED', zorder=3
    )
    ax.add_patch(p2_hdr)
    ax.text(p2_x + 0.8, p2_y - 0.9, "2. PROTOKOL KEAMANAN VOTING PUBLIK MULTI-LAYER",
            fontsize=8.5, fontweight='bold', color='#C2410C', va='center', zorder=4)
    
    p2_text = (
        "• Partisipasi Terbuka Tanpa Login: Publik dapat memberikan suara tanpa perlu membuat akun.\n"
        "• Pencegahan Suara Ganda (Anti-Spam Tri-Layer Protection):\n"
        "  1. Layer Hardware Fingerprint: Menggunakan FingerprintJS untuk hashing identitas browser.\n"
        "  2. Layer Network IP Address: Menyimpan alamat IPv4/IPv6 dari socket pemilih.\n"
        "  3. Layer Temporal Period: Membatasi satu suara per entitas per bulan ('YYYY-MM').\n"
        "• Composite Index: [ip_address, fingerprint, period] menjamin pencarian pencegahan\n"
        "  duplikasi dieksekusi dengan kompleksitas O(log N) dalam hitungan milidetik."
    )
    ax.text(p2_x + 0.8, p2_y - 5.3, p2_text, fontsize=6.8, color='#334155', va='center', zorder=4, family='sans-serif')

    # Panel C: Standar Normalisasi Basis Data (1NF, 2NF, 3NF)
    p3_x, p3_y, p3_w, p3_h = 68.5, 32.5, 28.5, 8.5
    p3_card = FancyBboxPatch(
        (p3_x, p3_y - p3_h), p3_w, p3_h,
        boxstyle="round,pad=0.1,rounding_size=0.6",
        facecolor='#FFFFFF', edgecolor='#4F46E5', linewidth=1.2, zorder=2
    )
    ax.add_patch(p3_card)
    p3_hdr = FancyBboxPatch(
        (p3_x, p3_y - 1.8), p3_w, 1.8,
        boxstyle="round,pad=0.1,rounding_size=0.6",
        facecolor='#EEF2FF', edgecolor='#EEF2FF', zorder=3
    )
    ax.add_patch(p3_hdr)
    ax.text(p3_x + 0.8, p3_y - 0.9, "3. BUKTI NORMALISASI BASIS DATA (1NF s/d 3NF)",
            fontsize=8.5, fontweight='bold', color='#4338CA', va='center', zorder=4)
    
    p3_text = (
        "• 1NF (Bentuk Normal Pertama):\n"
        "  Seluruh atribut bersifat atomik (tidak ada multivalue atau repeating groups).\n"
        "• 2NF (Bentuk Normal Kedua):\n"
        "  Memenuhi 1NF dan seluruh atribut non-kunci bergantung penuh (Full Functional\n"
        "  Dependency) pada Primary Key tabel masing-masing.\n"
        "• 3NF (Bentuk Normal Ketiga):\n"
        "  Memenuhi 2NF dan bebas ketergantungan transitif (Transitive Dependency).\n"
        "  Setiap kolom non-key hanya bergantung langsung pada Primary Key (A -> B, B !-> C)."
    )
    ax.text(p3_x + 0.8, p3_y - 5.3, p3_text, fontsize=6.8, color='#334155', va='center', zorder=4, family='sans-serif')

    # -------------------------------------------------------------
    # 7. EXPORT HI-RES IMAGE
    # -------------------------------------------------------------
    output_path = os.path.join(os.path.dirname(__file__), "erd_diagram.png")
    plt.tight_layout(pad=0.4)
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"✅ Masterpiece ERD Diagram generated successfully at: {output_path}")

if __name__ == "__main__":
    generate_erd()
