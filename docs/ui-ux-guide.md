# UI/UX Design Guide

## Screen Flow Diagram

```
┌──────────────┐
│  HOME SCREEN │  (Welcome, Logo, Devlog, Start Button)
└──────────┬───┘
           │ Start
           ▼
┌──────────────────────────────────────────┐
│       DASHBOARD (Frame expands)          │
│                                          │
│ [MyTasks]  [Browse]  [Profile]          │ ← Tab Navigation
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  SELECTED TAB CONTENT:          │   │
│  │                                 │   │
│  │  MyTasks:                       │   │
│  │  ├─ Task 1: Tomato Prep        │   │
│  │  │  └─ 3 reps, 0/3 complete    │   │
│  │  │     [☐] Mark complete       │   │
│  │  │     Notes: Focus on grip... │   │
│  │  │                             │   │
│  │  ├─ Task 2: Set Table          │   │
│  │  │  └─ 2 reps, 0/2 complete    │   │
│  │  │     [☐] Mark complete       │   │
│  │  │     Notes: Practice coord... │   │
│  │  │                             │   │
│  │  Browse:                       │   │
│  │  ├─ [ACTIVE] Tomato Prep       │   │
│  │  ├─ [ACTIVE] Set Table         │   │
│  │  ├─ [SKELETON] Making Tea      │   │
│  │  ├─ [SKELETON] Washing Hands   │   │
│  │  ├─ [SKELETON] Folding Clothes │   │
│  │  └─ ... (scroll down)          │   │
│  │                                 │   │
│  │  Profile:                      │   │
│  │  ├─ Name: Test User            │   │
│  │  ├─ Session: Guest             │   │
│  │  └─ Logout (or close)          │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                          │
│  [Back to Home] [Start Exercise ▶]     │
│                                          │
└──────────────────────────────────────────┘
           │ Select Exercise
           ▼
┌──────────────────────────────────────────┐
│        CONFIRM PANEL (Frame stays large) │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │   [EXERCISE SCREENSHOT]         │   │
│  │   (Placeholder for MVP)         │   │
│  │                                 │   │
│  │   Title: Tomato Prep            │   │
│  │   Description:                  │   │
│  │   "Learn to prepare a tomato    │   │
│  │    for cooking. You'll practice │   │
│  │    grabbing, placing, and       │   │
│  │    cutting skills."             │   │
│  │                                 │   │
│  │   [Back to Browse] [Start ▶]    │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                          │
└──────────────────────────────────────────┘
           │ Confirm
           ▼
┌──────────────────────────────────────────┐
│      EXERCISE SCENE (AR Interaction)     │
│                                          │
│  3D Tomato + Knife + Countertop         │
│  (or Plate + Utensils + Table)          │
│                                          │
│  ┌─ HUD Overlay (top-left) ───────────┐ │
│  │ Step 1 of 4:                       │ │
│  │ "Grab tomato and place on table"   │ │
│  │ ⚫ ⚪ ⚪ ⚪ (progress dots)         │ │
│  │                      [Exit ✕]     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  (User interacts: grab, cut, place...)  │
│                                          │
│  On complete:                           │
│  ┌────────────────────────────────────┐ │
│  │     ✅ Exercise Complete!          │ │
│  │   Auto-checking your task...       │ │
│  │              [Continue] [Home]     │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
           │ Exit
           ▼
    (Return to Dashboard)
```

---

## Visual Design Principles

### Color Scheme

| Element | Color | Use |
|---|---|---|
| Primary CTA | **Bright Cyan** (`#00D9FF`) | Start, Confirm, Begin buttons |
| Secondary CTA | **Light Gray** (`#E0E0E0`) | Secondary buttons, tabs |
| Accent (Success) | **Lime Green** (`#00FF00`) | Checkmarks, step complete |
| Accent (Warning) | **Orange** (`#FFA500`) | "Try again", out-of-range objects |
| Text (Primary) | **White** (`#FFFFFF`) | Main text, titles |
| Text (Secondary) | **Light Gray** (`#B0B0B0`) | Hints, secondary info |
| Background | **Dark Charcoal** (`#1A1A1A`) | Panels, safe overlay areas |

### Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Heading (Screen) | **Bold Sans** | 32px | 700 |
| Heading (Task) | **Bold Sans** | 24px | 700 |
| Body Text | **Regular Sans** | 18px | 400 |
| Hint / Secondary | **Regular Sans** | 14px | 400 |
| Step Counter | **Mono** | 16px | 700 |

### Spacing & Padding

- **Frame padding:** 24px all sides
- **Panel gap:** 16px between content areas
- **Button spacing:** 12px (button to button)
- **Line height:** 1.5x font size

---

## Component Library (SIK Reuse)

### Navigation Buttons

**SIK Component:** `RectangleButton`

Used for:
- Dashboard tabs: MyTasks, Browse, Profile
- Secondary nav: Back buttons

```
[MyTasks]  [Browse]  [Profile]
     ^
   active (white background)
```

### Interactive Buttons

**SIK Component:** `PinchButton` (circle pinch target)

Used for:
- Home screen: Start (large, cyan)
- Exercise: Confirm, Exit, Continue (small, cyan)
- Dashboard: Exit exercise (corner position)

**Visual:** Circular hit target with fill animation on pinch detection.

### Checkmarks

**SIK Component:** `ToggleButton`

Used for:
- Task list: per-task completion toggle
- Exercise: optional step checkboxes (Phase 2)

**States:**
- OFF: empty square (`☐`)
- ON: filled square with checkmark (`☑`)
- DISABLED: grayed out

### Scrollable Lists

**SIK Component:** `ScrollView` + `GridContentCreator`

Used for:
- Task list (MyTasks panel)
- Activity grid (Browse panel)
- Changelog (DevLog modal)

**Item height:** 5.4 units (standard spacing for SIK)

**Max visible:** 3–4 items per screen (rest scrollable)

---

## Screen Specifications

### Home Screen Layout

```
┌─────────────────────────────────┐
│                                 │
│        [MindStep Logo]          │  (centered, 4x4 unit image)
│                                 │
│      Welcome, Test User         │  (or "Welcome, Guest")
│                                 │
│      ┌───────────────────────┐  │
│      │  V.0.0.3 — Last      │  │
│      │  Updated: 2026/03/21 │  │
│      │                       │  │
│      │  Devlog               │  │
│      │  ─────────────────── │  │
│      │  0.0.1 · Home Screen │  │
│      │  + Welcome header    │  │
│      │  + Devlog modal      │  │
│      │                       │  │
│      │      [x] Close       │  │
│      └───────────────────────┘  │
│                                 │
│      [Login Button] [Start ▶]   │  (bottom right)
│                                 │
└─────────────────────────────────┘

Frame Size: 33 × 18 units (headlocked)
```

### Dashboard Layout

```
┌─────────────────────────────────┐
│                                 │
│  [MyTasks] [Browse] [Profile]   │  (tab bar)
│                                 │
│  ┌───────────────────────────┐  │
│  │  MyTasks Panel (visible)  │  │
│  │                           │  │
│  │  Tomato Prep              │  │
│  │  3 reps | 0/3 done        │  │
│  │  [☐] Doctor notes: ...    │  │
│  │                           │  │
│  │  Set Table                │  │
│  │  2 reps | 0/2 done        │  │
│  │  [☐] Doctor notes: ...    │  │
│  │                           │  │
│  │  (scroll if more tasks)   │  │
│  └───────────────────────────┘  │
│                                 │
│  [Back to Home]  [Start ▶]      │  (bottom nav)
│                                 │
└─────────────────────────────────┘

Frame Size: 33 × 28 units (headlocked)
```

### Confirm Panel Layout

```
┌─────────────────────────────────┐
│                                 │
│  [Exercise Screenshot]          │  (placeholder gray box)
│  (3:2 aspect, centered)         │  (will be filled in Phase 2)
│                                 │
│  Title: Tomato Prep             │  (bold, 24px)
│                                 │
│  Description:                   │  (14px, justified)
│  "Learn to prepare a tomato     │
│   for cooking. You'll practice  │
│   grabbing, placing, and        │
│   cutting skills."              │
│                                 │
│  [Back] [Start ▶]              │  (bottom buttons)
│                                 │
└─────────────────────────────────┘

Frame Size: 33 × 28 units (same as Dashboard, no resize)
```

### Exercise HUD Overlay

```
┌─ Step Counter ─────────────────┐
│ Step 1 of 4:                   │
│ "Grab tomato and place on      │
│  table"                        │
│ ⚫ ⚪ ⚪ ⚪                   │ (filled circle = done)
│              [Exit ✕]          │
└────────────────────────────────┘

Position: Top-left, headlocked
Font: 18px body + 16px mono for counter
Background: dark semi-transparent (alpha 0.8)
```

---

## Interaction Patterns

### Button Feedback

| State | Visual | Duration |
|---|---|---|
| Idle | Neutral color | — |
| Hover | Outline glow | instant |
| Press (pinch) | Scale 0.9, color shift | 100ms |
| Release | Scale 1.0, reset | 100ms |
| Active (selected) | Filled background | until deselected |

### Scroll Behavior

- **Flick** to scroll (momentum)
- **Grab middle** to drag slowly
- **Auto-snap** to nearest item on release
- **Loop** at boundaries (optional, Phase 2)

### Exercise Interactions

| Action | Feedback |
|---|---|
| Grab object | Outline glow + slight scale |
| Move correctly | Green outline when near target |
| Move incorrectly | Red outline + hint text |
| Snap success | Checkmark animation + next step unlocks |
| Step complete | Green flash + progress dot fills |

---

## Accessibility Considerations

### Text Sizing
- All text readable from arm's length (24px minimum for headers)
- High contrast: light text on dark background

### Color Independence
- Don't rely solely on color (use checkmarks, outlines, icons)
- Colorblind-safe palette (use cyan + lime + gray, not red + green)

### Audio Cues
- Success: gentle chime sound
- Error: low beep (Phase 2)

### Haptic Feedback
- Button press: light rumble (Spectacles native, Phase 2)
- Step complete: longer rumble pulse (Phase 2)

---

## MVP vs. Future Polish

### MVP (Phase 1)
- ✓ Basic UI layouts, text-only
- ✓ Solid color buttons (no gradients)
- ✓ Simple transitions (no particles)
- ✓ Monospace step counter

### Phase 2 (Polish)
- ◻ Gradient backgrounds
- ◻ Particle effects (celebration on step complete)
- ◻ Animated transitions between screens
- ◻ Sound effects
- ◻ Haptic feedback
- ◻ Status icons (loading spinner, checkmark animation)

### Phase 3+ (Premium)
- ◻ Voice guidance for steps
- ◻ 3D avatar demonstrations
- ◻ Leaderboards / progress tracking
- ◻ Dark mode toggle
- ◻ Therapist dashboard (web)

