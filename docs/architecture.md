# Architecture Overview

## Scene Hierarchy

The main scene (`MindStep/Assets/Scene.scene`) is a **non-demo** scene built from scratch. It follows a headlocked, screen-centric AR UI pattern with separate exercise scenes.

```
Scene
├── [SIK] Interaction Manager       ← Manages hand tracking, ray casting
├── [SIK] Hand Visual (L + R)       ← Hand glow visuals
│
├── UI Root [ContainerFrame]        ← Headlocked frame containing all UI
│   ├── HomeScreen [SceneObject]
│   │   ├── LogoImage [Image]
│   │   ├── WelcomeText [Text]
│   │   ├── DevlogModal [SceneObject]
│   │   │   ├── VersionText [Text]
│   │   │   ├── ChangelogScroll [ScrollView]
│   │   │   │   └── ChangelogItems (instantiated)
│   │   │   └── CloseButton [PinchButton]
│   │   ├── LoginButton [RectangleButton]
│   │   └── StartButton [PinchButton]
│   │
│   ├── Dashboard [SceneObject]
│   │   ├── SideNav [SceneObject]
│   │   │   ├── MyTasksTab [RectangleButton]
│   │   │   ├── BrowseTab [RectangleButton]
│   │   │   └── ProfileTab [RectangleButton]
│   │   │
│   │   ├── MyTasksPanel [SceneObject]
│   │   │   └── TaskScrollView [ScrollView]
│   │   │       └── [TaskItem.prefab] × N (instantiated per assignment)
│   │   │           ├── TitleText [Text]
│   │   │           ├── RepsText [Text]
│   │   │           ├── NotesText [Text]
│   │   │           └── CheckmarkToggle [ToggleButton]
│   │   │
│   │   ├── BrowsePanel [SceneObject]
│   │   │   └── ActivityScrollView [ScrollView + GridContentCreator]
│   │   │       └── [ActivityCard.prefab] × 10 (instantiated)
│   │   │           ├── IconImage [Image]
│   │   │           ├── TitleText [Text]
│   │   │           ├── DifficultyText [Text]
│   │   │           └── CardBacking [Interactable] ← trigger selects exercise
│   │   │
│   │   ├── ConfirmPanel [SceneObject]
│   │   │   ├── ScreenshotImage [Image] ← placeholder
│   │   │   ├── ExerciseTitleText [Text]
│   │   │   ├── ExerciseDescriptionText [Text]
│   │   │   ├── BackButton [RectangleButton]
│   │   │   └── ConfirmButton [RectangleButton]
│   │   │
│   │   └── ExerciseHUD [SceneObject]
│   │       ├── StepText [Text] ← "Step 1 of 4: Grab tomato"
│   │       ├── ProgressDots [Image] ← visual step indicator
│   │       └── ExitButton [PinchButton]
│   │
│   └── [Frame resizes on state transitions]
│
├── Exercise_TomatoPrep [SceneObject] ← disabled by default
│   ├── Tomato [RenderMeshVisual]
│   ├── CuttingKnife [RenderMeshVisual]
│   ├── Countertop [RenderMeshVisual]
│   └── SDFSliceController [with SDF Slice Script.js]
│
└── Exercise_SetTheTable [SceneObject] ← disabled by default
    ├── Plate [RenderMeshVisual]
    ├── Fork [RenderMeshVisual]
    ├── Knife [RenderMeshVisual]
    ├── Glass [RenderMeshVisual]
    └── DiningTable [RenderMeshVisual]
```

---

## Script Dependency Map

```
┌─ SessionManager (singleton)
│  └─ currentUser: { userId, displayName, isGuest }
│
├─ MindStepUIManager (central state machine)
│  ├─ reads: SessionManager
│  ├─ orchestrates: {HomeScreen, Dashboard, Exercise}
│  └─ states: Home → MyTasks | Browse → Confirm → Exercise
│
├─ HomeScreen Scripts
│  ├─ LoginController
│  │  └─ writes to: SessionManager
│  └─ DevlogModal
│
├─ Dashboard Scripts
│  ├─ TaskListController
│  │  ├─ reads: FirebaseService.fetchAssignments()
│  │  └─ instantiates: TaskItem.prefab
│  │
│  ├─ TaskItem
│  │  ├─ listens to: ToggleButton.onTriggerEnd
│  │  └─ calls: FirebaseService.markAssignmentComplete()
│  │
│  ├─ ActivityBrowseController
│  │  ├─ uses: GridContentCreator pattern
│  │  └─ instantiates: ActivityCard.prefab × 10
│  │
│  ├─ ActivityCardItem
│  │  ├─ listens to: Interactable.onTriggerEnd (first 2 only)
│  │  └─ notifies: MindStepUIManager.onExerciseSelected()
│  │
│  └─ ConfirmPanelController
│     ├─ receives: selected exercise (ExerciseData entry)
│     └─ on confirm: MindStepUIManager.startExercise()
│
├─ Exercise Scripts
│  ├─ ExerciseController (abstract base)
│  │  ├─ currentStep: number
│  │  ├─ onStepComplete()
│  │  └─ onExerciseComplete() → updates HUD + auto-checks assignment
│  │
│  ├─ TomatoPrepExercise extends ExerciseController
│  │  ├─ step 1-2: grab + place tomato/knife
│  │  └─ step 3-4: SDF slice plane animation
│  │
│  └─ SetTableExercise extends ExerciseController
│     ├─ steps 1-4: grab + snap-to-grid each utensil
│     └─ uses: Interactable + position lerp
│
├─ Data Services
│  ├─ ExerciseData (static, local)
│  │  ├─ EXERCISES: { id, title, description, steps[], assets[] }
│  │  └─ no Firestore calls
│  │
│  └─ FirebaseService (REST API calls)
│     ├─ fetchAssignments(patientId)
│     ├─ fetchExercise(exerciseId)
│     ├─ markAssignmentComplete(assignmentId)
│     └─ uses: RemoteServiceModule (global HTTP)
│
└─ Utilities
   ├─ SessionManager (lazy singleton)
   └─ animate (from SIK) — easing + frame size transitions
```

---

## State Machine Flow

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Home Screen                                            │
│  ├─ Logo, Welcome, Devlog, Start button               │
│  └─ onStart → Dashboard(MyTasks)                       │
│                                                         │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Dashboard                                              │
│  ├─ MyTasks: task list + checkmarks                   │
│  ├─ Browse: activity grid (2 interactive + N skeleton) │
│  ├─ Profile: user info (optional)                      │
│  │                                                      │
│  └─ on select → ConfirmPanel                           │
│                                                         │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Confirm Panel                                          │
│  ├─ Screenshot (placeholder in MVP)                    │
│  ├─ Title + Description                                │
│  ├─ Back button → Browse                               │
│  └─ Confirm → Exercise                                 │
│                                                         │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Exercise (AR Interaction)                              │
│  ├─ Step 1 → interact (grab, cut, place)              │
│  ├─ Step 2 → interact                                  │
│  ├─ … → Step N                                         │
│  ├─ Complete → auto-checks task in Dashboard           │
│  └─ Exit button → return to Dashboard                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## UI Framework Pattern (SIK)

MindStep reuses these core SIK components:

| Component | Used For | Docs |
|---|---|---|
| **Frame** | Resizable container for all screens | [SIK > ContainerFrame](https://github.com/Snapchat/Spectacles-Sample/blob/main/SIK-Samples/Assets/SIK%20Examples) |
| **RectangleButton** | Static nav buttons (MyTasks, Browse tabs) | SpectaclesUIKit |
| **PinchButton** | Circle interactive buttons (Start, Confirm, Exit) | SpectaclesInteractionKit |
| **ToggleButton** | Task checkmarks | SpectaclesInteractionKit |
| **ScrollView** | Task list + activity grid | SIK ScrollView docs |
| **GridContentCreator** | Instantiate activity cards dynamically | Cache: `Components/UI/ScrollView/GridContentCreator.ts` |
| **Interactable** | Detects hand trigger (card select, exercise manipulation) | SIK Interactable docs |
| **animate** utility | Smooth frame size transitions | Cache: `Utils/animate` |

---

## Firebase Schema Integration

Scripts interact with Firestore via **REST API** (no SDK, to keep bundle size small):

```
GET /v1/projects/{projectId}/databases/(default)/documents/patients/{patientId}/assignments
  → TaskListController reads response
  → instantiates TaskItem prefabs

GET /v1/projects/{projectId}/databases/(default)/documents/exercises/{exerciseId}
  → ConfirmPanelController reads response
  → populates description

PATCH /v1/projects/{projectId}/databases/(default)/documents/assignments/{assignmentId}
  → TaskItem updates completedReps on checkmark
  → RemoteServiceModule handles HTTP
```

See `docs/firebase-schema.md` for full schema & seed data.

---

## Animation Strategy

### Frame Resize (State Transitions)
- Uses `animate({ duration: 0.4, easing: "ease-in-out-cubic", ... })`
- Smoothly resizes `Frame.innerSize` between states (e.g., home → dashboard larger)

### Exercise Interactions
- **Tomato Prep**: SDF Slice Script plane animates via touch input → updates shader UV
- **Set Table**: Each object snaps to grid position on Interactable trigger, no complex animation

### No VFX Required MVP
- Particle effects deferred to Phase 2+
- Focus on solid step-by-step guidance + checkmark feedback

---

## Performance Considerations

1. **UI Panel Culling**: Only 1 dashboard panel visible at a time (others disabled)
2. **Exercise Culling**: Only 1 exercise scene active (others disabled)
3. **Grid Prefabs**: Max 10 activity cards instantiated (dummy skeletons, not full-featured)
4. **Firestore Caching**: Minimal API calls in MVP (fetch on app start + task complete)

---

## Error Handling Strategy

| Layer | Handling |
|---|---|
| **Firebase 404/500** | Log to console, show "Failed to load. Try again." overlay |
| **Missing Prefabs** | Log warning, skip instantiation (graceful degradation) |
| **Missing Inputs (@input)** | Lens Studio validation at build time |

No error boundaries in MVP — app terminates with console log.

