# Quick Start Guide for MindStep Development

## TL;DR

1. **Read these first (5 min each):**
   - `docs/README.md` — overview
   - `docs/architecture.md` — how it all fits together
   - `IMPLEMENTATION_SUMMARY.md` — what's done, what's next

2. **Set up the scene (30 min):**
   - Open `MindStep/MindStep` in Lens Studio
   - Follow `docs/architecture.md` scene hierarchy
   - Attach scripts to scene objects

3. **Test Phase 1 (10 min):**
   - Click Preview in Lens Studio
   - Verify home screen loads

---

## Directory Map

```
D:/MindStep/
├── docs/                    ← READ THESE FIRST
│   ├── README.md           ← Start here (project overview)
│   ├── architecture.md      ← How scripts are organized
│   ├── phases.md           ← What to build when
│   └── ... (4 more docs)
│
├── MindStep/               ← Lens Studio project folder
│   └── Assets/Scripts/     ← All TypeScript source code
│       ├── SessionManager.ts
│       ├── MindStepUIManager.ts
│       ├── Exercises/      ← Exercise logic
│       └── ... (11 more files)
│
├── IMPLEMENTATION_SUMMARY.md ← Status report
└── QUICK_START.md          ← This file
```

---

## Scripts by Category

### State Management (What the user sees)
- `SessionManager.ts` — tracks logged-in user
- `MindStepUIManager.ts` — switches between screens
- `DevlogModal.ts` — version info popup

### Dashboard (Task list)
- `TaskListController.ts` — loads tasks from Firebase
- `TaskItem.ts` — one task row
- `ActivityBrowseController.ts` — scrollable exercise grid
- `ActivityCardItem.ts` — one exercise card

### Exercise (AR interaction)
- `ExerciseController.ts` — base class for all exercises
- `TomatoPrepExercise.ts` — tomato cutting (4 steps)
- `SetTableExercise.ts` — table setting (4 steps)

### Data (Info)
- `ExerciseData.ts` — hardcoded exercise info (NOT from Firebase)
- `FirebaseService.ts` — HTTP calls to Firestore

### Auth (Login)
- `LoginController.ts` — guest bypass (real auth in Phase 4)

---

## Common Tasks

### I want to add a new script file
1. Create `.ts` file in `Assets/Scripts/`
2. Use `@component` decorator
3. Extend `BaseScriptComponent`
4. Add `@input` fields for Inspector references

### I want to test a single exercise
1. Find scene object for that exercise
2. Attach the exercise script (e.g., `TomatoPrepExercise`)
3. Drag-and-drop object references to script inputs
4. Click Preview

### I want to trace execution
1. Look for `print("[ClassName] message")` calls in scripts
2. Open Lens Studio console (bottom panel)
3. Search for class name

### I want to add a phase 2 feature
1. Check `docs/phases.md` Phase 2 section
2. Find relevant script file
3. Look for `// Phase 2:` comments
4. Implement the feature

### I want to see where a button press does something
1. Find button in scene
2. Look at script attached to it
3. Search for `onTriggerUp.add()` in that script

---

## Common File Locations

| What | Where |
|---|---|
| Exercise definitions | `Scripts/ExerciseData.ts` |
| UI state logic | `Scripts/MindStepUIManager.ts` |
| Firebase calls | `Scripts/FirebaseService.ts` |
| Tomato Prep logic | `Scripts/Exercises/TomatoPrepExercise.ts` |
| Table Setting logic | `Scripts/Exercises/SetTableExercise.ts` |
| Task list | `Scripts/TaskListController.ts` |
| Activity grid | `Scripts/ActivityBrowseController.ts` |
| Documentation | `docs/*.md` |

---

## Debugging Checklist

**Lens Studio won't build?**
- Check **Build > Errors** panel
- Look for missing `@input` references
- Verify script is attached to correct scene object

**Home screen not showing?**
- Verify `MindStepUIManager` is on main Frame
- Check all button references are assigned
- Ensure HomeScreen scene object is enabled

**Task list empty?**
- Run `firebase-seed.ts` (see `docs/firebase-schema.md`)
- Check Firebase project ID in `FirebaseService.ts`
- Look for network errors in console

**Exercise not starting?**
- Verify exercise script attached to scene object
- Check all `@input` fields are assigned
- Ensure Interactable components exist on 3D objects

**Steps not advancing?**
- Check console for `[ExerciseName] Step X complete` messages
- Verify trigger conditions (e.g., proximity checks)
- Look at `onStepComplete()` calls in exercise script

---

## Key Concepts

### State Machine
MindStepUIManager tracks `UIState`:
- `Home` — home screen
- `Dashboard` — task list + grid
- `Confirm` — exercise preview
- `Exercise` — AR interaction

Transitions happen on button clicks.

### Frame Resizing
When switching states, the Frame animates to a new size using SIK's `animate()` utility. Defined in `MindStepUIManager`:
- Home: 33 × 18 units
- Dashboard/Confirm: 33 × 28 units

### Exercise Steps
Each exercise has a `steps` array (e.g., 4 steps for Tomato Prep). When user completes an action, call `onStepComplete()` to advance.

### Firebase Structure
Collections:
- `patients` — user profiles
- `assignments` — tasks assigned to patients
- `exercises` — exercise definitions
- `therapists` — therapist profiles

See `docs/firebase-schema.md` for details.

---

## Phase Roadmap (At a Glance)

| Phase | Duration | Main Task | Status |
|---|---|---|---|
| 1 | Week 1 | Home screen + state machine | ✅ Done (scripts) |
| 2 | Week 2 | Firebase + dashboard | 🔲 Scripts done, need HTTP |
| 3 | Week 3 | Exercise logic | 🔲 Scripts done, need SIK wiring |
| 4 | Week 4 | Polish + auth | 🔲 Placeholder scripts only |

See `docs/phases.md` for detailed acceptance criteria.

---

## Quick Reference: Adding an Exercise

1. **Create script:**
   ```typescript
   import { ExerciseController } from "./ExerciseController";

   @component
   export class MyExercise extends ExerciseController {
     protected onExerciseStart(): void {
       // setup here
     }
   }
   ```

2. **Add to ExerciseData.ts:**
   ```typescript
   MY_EXERCISE: {
     id: "exercise_003",
     title: "My Exercise",
     steps: ["Step 1", "Step 2"],
     ...
   }
   ```

3. **Scene:**
   - Create scene object for exercise
   - Attach your script
   - Assign 3D object references

4. **Test:**
   - Launch preview
   - Select exercise in Browse
   - Confirm → start

---

## Keyboard Shortcuts (Lens Studio)

| Key | Action |
|---|---|
| Ctrl+B | Build |
| Ctrl+P | Preview |
| Ctrl+Space | Search |
| Ctrl+Alt+I | Inspector |

---

## Useful Console Commands

```typescript
print("Debug message");          // Log to console
print(vector.toString());        // Print vec3
print(object.getTransform());    // Print transform info
```

---

## Links

- **Lens Studio Docs:** https://docs.snap.com/lens-studio/references/guides
- **SIK Examples:** See Cache/TypeScript/Src/Packages/SpectaclesInteractionKitExamples.lspkg
- **Firestore REST API:** https://firebase.google.com/docs/firestore/use-rest-api

---

## Getting Help

1. **Script doesn't compile?**
   - Check `Build > Errors` in Lens Studio
   - Match `@input` type to actual component type

2. **Button not working?**
   - Verify RectangleButton/PinchButton assigned in Inspector
   - Check `onTriggerUp.add()` handler in script

3. **Scene object not showing?**
   - Toggle `enabled` checkbox in Inspector
   - Check parent object is enabled
   - Verify position/scale are not zero

4. **Exercise not responding?**
   - Look for Interactable component on 3D object
   - Check `onTriggerEnd` event binding
   - Print step completion messages to console

---

## Summary

- **14 scripts** provide full framework
- **7 docs** explain architecture + design
- **Phase 1 done** (foundation)
- **Phase 2–4** require scene wiring + feature implementation

Start with `docs/README.md`, then `docs/architecture.md`, then wire up the scene in Lens Studio.

Good luck! 🚀

---

**Version:** 0.0.3
**Last Updated:** 2026-03-22
