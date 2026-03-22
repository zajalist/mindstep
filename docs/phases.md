# Implementation Roadmap (Phases)

## Overview

MindStep development is divided into **4 phases**, each with specific deliverables and success criteria. The MVP (Phases 1–2) focuses on core functionality; Phases 3–4 add polish and new exercises.

---

## Phase 1: Foundation + Home Screen

**Duration:** Week 1
**Focus:** Scaffolding, state machine, UI framework setup

### Deliverables

| File | Responsibility | Status |
|---|---|---|
| `docs/` folder (6 files) | All architecture & design docs | ✅ |
| `SessionManager.ts` | User session state singleton | ◻ |
| `MindStepUIManager.ts` | Central state machine (Home → Dashboard → Exercise) | ◻ |
| `DevlogModal.ts` | Show/hide devlog with changelog array | ◻ |
| `LoginController.ts` | Guest bypass (no auth) | ◻ |
| HomeScreen scene objects | Logo, welcome text, buttons, devlog modal | ◻ |
| Dashboard skeleton scene objects | Frame structure, tab navigation (no content yet) | ◻ |

### Scene Setup
- ✓ Import SIK Interaction Manager + Hand Visual prefabs
- ✓ Create main UI Frame (headlocked)
- ✓ Create HomeScreen + Dashboard empty panels
- ✓ Wire Home → Dashboard transition button

### Acceptance Criteria
1. Preview on Spectacles Simulator
2. Home screen displays:
   - MindStep logo (from Assets/Logo.png)
   - "Welcome, Guest" text
   - Devlog modal (closable)
   - Version: "V.0.0.3 — Last Updated: 2026/03/21"
3. Click Start → Dashboard appears (frame animates larger via `animate()`)
4. Click Home button → Home screen reappears
5. No console errors

### Dependencies
- None (local TS, no Firebase)

---

## Phase 2: Dashboard + Firebase

**Duration:** Week 2
**Focus:** Data layer, task management, activity browsing

### Deliverables

| File | Responsibility | Status |
|---|---|---|
| `FirebaseService.ts` | Firestore REST API calls | ◻ |
| `ExerciseData.ts` | Static exercise definitions (2 exercises) | ◻ |
| `TaskListController.ts` | Fetch + instantiate task items | ◻ |
| `TaskItem.ts` + `TaskItem.prefab` | Per-task row with checkmark | ◻ |
| `ActivityBrowseController.ts` | Grid of activity cards (GridContentCreator) | ◻ |
| `ActivityCardItem.ts` + `ActivityCard.prefab` | Per-card (2 interactive, rest skeleton) | ◻ |
| `ConfirmPanelController.ts` | Show selected exercise description | ◻ |
| `firebase-seed.ts` | Script to populate Firestore (run once) | ◻ |
| Dashboard scene objects | MyTasks panel, Browse panel, Confirm panel | ◻ |

### Database Setup
- ✓ Create Firestore project (mindstep-f5149)
- ✓ Run seed script to populate:
  - 1 therapist
  - 1 patient (guest)
  - 2 exercises
  - 2 assignments (3 reps each)

### Acceptance Criteria
1. Launch app as guest (no login required)
2. Dashboard MyTasks tab shows:
   - 2 tasks: "Tomato Prep" + "Set Table"
   - Reps: "3" and "2" respectively
   - Doctor notes visible
   - Checkmarks not yet clickable (Phase 3+)
3. Browse tab shows:
   - 2 interactive cards: Tomato Prep, Set Table
   - 8 skeleton cards (grayed out, non-interactive)
   - Scrollable list
4. Select "Tomato Prep" → Confirm panel opens, shows description
5. Back button → Browse panel
6. No errors in console

### Dependencies
- Phase 1 (state machine + home screen working)

---

## Phase 3: Exercises

**Duration:** Week 3
**Focus:** AR interactions, exercise scripts, task completion flow

### Deliverables

| File | Responsibility | Status |
|---|---|---|
| `ExerciseController.ts` | Abstract base class for all exercises | ◻ |
| `TomatoPrepExercise.ts` | 4-step tomato cutting with SDF slicer | ◻ |
| `SetTableExercise.ts` | 4-step table setting with snap-to-grid | ◻ |
| Exercise scene objects | Tomato scene + Table scene with 3D props | ◻ |
| Auto-completion logic | Task checkmark on `onExerciseComplete()` + Firestore update | ◻ |
| Exercise HUD | Step text + progress dots + exit button | ◻ |

### Exercise Development

#### Tomato Prep (TomatoPrepExercise.ts)
- **Step 1:** Hand grab + drag tomato → snap to countertop
  - Detect pinch on tomato, enable dragging
  - On release over countertop → snap to center
  - Trigger next step
- **Step 2:** Grab knife → draggable
- **Step 3:** Position knife on tomato (detection + visual feedback)
  - Show green outline when ≤2cm from tomato
  - Sustain hold 1 second → unlock step 4
- **Step 4:** SDF Slicer plane animates
  - Use `SDF Slice Script.js` from `Assets/SDF Slicer.lspkg`
  - Plane Z position maps to touch input
  - On reach bottom → exercise complete

#### Set Table (SetTableExercise.ts)
- **Steps 1–4:** Grab each utensil → drag to target position → snap
  - Plate: snap to center
  - Fork: snap left of plate
  - Knife: snap right of plate
  - Glass: snap top-right
- **Snap logic:** Position check + lerp animation (0.3s)
- **Visual feedback:** Dashed outline shows target, green when in range

### Auto-Completion Flow
```
ExerciseController.onExerciseComplete()
  → MindStepUIManager.completeExercise(exerciseId)
  → FirebaseService.markAssignmentComplete(assignmentId)
  → PATCH /assignments/{id} (completedReps += 1)
  → TaskListController refreshes
  → TaskItem auto-checks ✓
```

### Acceptance Criteria
1. Start Tomato Prep exercise:
   - Step 1 text: "Grab tomato and place on your virtual table"
   - Tomato visible + draggable
   - Progress dots: ⚫ ⚪ ⚪ ⚪
2. Complete step 1 (tomato on counter):
   - Step 2 unlocks, knife appears
   - Progress dots: ⚫ ⚫ ⚪ ⚪
3. Complete all 4 steps:
   - Success message: "✅ Exercise Complete!"
   - Return to Dashboard automatically
   - Task checkmark is now visible in MyTasks
4. Firebase Console:
   - `assignments/assignment_001.completedReps` = 1
5. Set Table exercise: similar flow, 4 snappable objects

### Dependencies
- Phase 2 (dashboard + Firebase working)
- SDF Slicer.lspkg properly installed

---

## Phase 4: Polish + Login

**Duration:** Week 4
**Focus:** UI refinement, error handling, auth (optional)

### Deliverables

| Feature | Status |
|---|---|
| Transition animations (frame resize, panel fade) | ◻ |
| Loading states (spinner in TaskListController) | ◻ |
| Error handling (Firebase offline, 404, 500) | ◻ |
| Skeleton card visual styling (grayed out, disabled) | ◻ |
| Firebase Email/Password Auth REST | ◻ |
| Login screen (email + password inputs) | ◻ |
| Session persistence (localStorage token) | ◻ |
| Logout button (clear session) | ◻ |

### Optional Phase 4 Items (Time Permitting)

| Feature | Priority |
|---|---|
| Sound effects (chime on step complete) | Medium |
| Haptic feedback (vibrate on button press) | Medium |
| Devlog auto-pop on version update | Low |
| Therapist note tooltips (hover to expand) | Low |

### Acceptance Criteria
1. Smooth animations between screens (no jarring cuts)
2. Error message appears if Firebase is unreachable:
   - "Failed to load tasks. Check internet and retry."
   - Retry button visible
3. Skeleton cards styled distinctly (40% opacity, grayed text)
4. Login flow:
   - Email input field (optional)
   - Password input field (optional)
   - "Login" button → authenticate via Firebase REST
   - On success: session stored, app shows logged-in user name
   - On failure: error message with retry
5. Guest bypass still works (click "Continue as Guest")
6. Logout button in Profile tab → clears session, return to home

### Dependencies
- Phase 3 (exercises complete)

---

## Long-Term Roadmap (Future Phases)

### Phase 5: Additional Exercises (Q2 2026)
- **Making Tea:** kettle fill + boil + pour animation
- **Washing Hands:** tap + soap + rinse sequence
- **Folding Clothes:** grab + drag + snap to pile
- Particle effects for each exercise

### Phase 6: Therapist Dashboard (Web) (Q3 2026)
- Create React web app for therapists to:
  - View assigned patients
  - Create/edit assignments
  - View completion reports
- Backend: Cloud Functions + Firestore

### Phase 7: Analytics & Gamification (Q4 2026)
- Leaderboard (most exercises completed)
- Badges (milestone achievements)
- Progress charts (reps over time)
- Streaks (consecutive days active)

### Phase 8: Multi-Device & Sync (Q1 2027)
- Sync progress across multiple Spectacles
- Web progress dashboard (patient view)
- SMS/Email reminders for therapist

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| SDF Slicer complexity | Start Phase 3 early; test SDF script integration in isolation |
| Firestore schema changes | Keep schema doc (firebase-schema.md) as source of truth; version bump on breaking changes |
| TypeScript compilation errors | Build daily; use Lens Studio's **Build > Errors** panel |
| Performance (too many prefabs) | Max 10 activity cards in grid; cull off-screen items (Phase 4) |
| Hand tracking unreliable | Provide visual feedback (outline glow) + timeout for step hold (reduce frustration) |

---

## Success Metrics

### By End of Phase 1
- Home screen loads in < 3 seconds
- 0 TypeScript errors
- State transitions feel smooth

### By End of Phase 2
- Firebase queries respond in < 2 seconds
- All 2 tasks visible in MyTasks
- Browse grid scrolls smoothly (no lag)

### By End of Phase 3
- Complete 1 full exercise cycle in < 5 minutes
- Task auto-checkmarks on completion
- Firebase completedReps increments correctly

### By End of Phase 4
- App handles offline gracefully (error message, not crash)
- Login flow works for 100% of test users
- No console errors in any flow

