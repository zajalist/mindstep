# Exercises Definition

## Overview

MindStep MVP includes **2 full-featured exercises** designed to help patients practice daily living skills with step-by-step AR guidance.

---

## Exercise 1: Tomato Prep (Cutting)

**Difficulty:** Easy
**Duration:** ~2 min per rep
**Assets:** Food Pack (tomato), Kitchen Pack (knife), Home Pack (countertop)
**Animation:** SDF Slicer plane cutting through tomato mesh

### Steps

```
1. "Grab tomato and place on your virtual table"
   - Tomato rendered in front of user
   - User reaches out (hand detection) → grab gesture (pinch)
   - On pinch, tomato becomes draggable
   - User places hand on countertop → tomato snaps to surface
   - Trigger next step

2. "Grab knife"
   - Knife rendered above countertop surface
   - User reaches, pinches knife
   - On grasp, knife becomes draggable
   - Progress to step 3

3. "Place knife on top of tomato"
   - User must position knife on tomato surface
   - Detection: if knife position is within 2cm of tomato centroid + proper angle
   - Visual feedback: green outline on knife when positioned correctly
   - Trigger on sustained hold (1 second)

4. "Cut it"
   - SDF Slice Script plane becomes active
   - Plane starts at tomato top (Z = 0)
   - User pinches/swipes downward → plane moves through tomato
   - Shader reveals "cut" interior as plane passes
   - On plane reaching bottom, step completes
   - Tomato mesh splits into two pieces (optional visual, Phase 2)
```

### Technical Implementation

| Step | Script | Interaction | Outcome |
|---|---|---|---|
| 1 | `TomatoPrepExercise.onStep1()` | Hand grab + drag | Tomato position updates, snaps to counter |
| 2 | `TomatoPrepExercise.onStep2()` | Hand grab + drag | Knife position updates |
| 3 | `TomatoPrepExercise.onStep3()` | Position check + timer | Unlock knife movement, trigger SDF slicer |
| 4 | `TomatoPrepExercise.onStep4()` | SDF plane Z coordinate | Plane animates via SDF Slice Script JS |

### Asset Mappings

```
Mesh:     Food Pack > Meshes > C_tomato_GEO.mesh
Material: Food Pack > Materials > tomato.mat
Knife:    Kitchen Pack > Meshes > C_knife_chopping_GEO.mesh
Table:    Home Pack > Meshes > C_countertop_empty_GEO.mesh
```

### SDF Slicer Integration

The **SDF Slicer** package contains:
- `SDF Slice Script.js` — handles touch input + plane animation
- `Materials/SDF Slice Material.mat` — shader that blends based on plane position
- `Materials/Uber PBR Cut & Highlight.mat` — object material with SDF support

**Workflow:**
1. Tomato has `Uber PBR Cut & Highlight` material applied
2. SDF Slicer script listens to touch input (step 4)
3. On swipe down, script updates plane position (local Z)
4. Material shader samples SDF texture, reveals "cut" side of tomato
5. On plane reaching bottom, `ExerciseController.onStepComplete()` fires

---

## Exercise 2: Set the Table

**Difficulty:** Easy
**Duration:** ~3 min per rep
**Assets:** Kitchen Pack (plate, fork, knife, glass), Home Pack (dining table)
**Animation:** Snap-to-grid positioning (no complex VFX)

### Steps

```
1. "Grab plate from stack and place on table"
   - Plate rendered in user's left hand area
   - User grabs (pinch) → plate becomes draggable
   - On release over table surface → plate snaps to center-bottom position
   - Next step unlocks

2. "Grab fork and place to the left of the plate"
   - Fork rendered to the left
   - User grabs → draggable
   - On release near left side of plate → fork snaps to position (left of plate center)
   - Visual guide: dashed outline shows target position

3. "Grab knife and place to the right of the plate"
   - Knife rendered to the right
   - User grabs → draggable
   - On release near right side of plate → knife snaps to position
   - (Blade faces inward, handle outward — check asset orientation)

4. "Grab glass and place at the top-right"
   - Glass rendered above table
   - User grabs → draggable
   - On release near top-right → glass snaps to final position
   - Exercise complete ✓

Stretch (Phase 2+):
5. "Add napkin to the left of fork"
6. "Add spoon to the right of knife"
7. "Step back and admire your work"
```

### Technical Implementation

| Step | Script | Interaction | Outcome |
|---|---|---|---|
| 1 | `SetTableExercise.onStep1()` | Grab + drag plate → snap | Plate position locked, fork enabled |
| 2 | `SetTableExercise.onStep2()` | Grab + drag fork → snap | Fork position locked, knife enabled |
| 3 | `SetTableExercise.onStep3()` | Grab + drag knife → snap | Knife position locked, glass enabled |
| 4 | `SetTableExercise.onStep4()` | Grab + drag glass → snap | Glass position locked, exercise complete |

### Asset Mappings

```
Plate:        Kitchen Pack > Meshes > C_plate_GEO.mesh
Fork:         Kitchen Pack > Meshes > C_fork_GEO.mesh
Knife:        Kitchen Pack > Meshes > C_knife_GEO.mesh
Glass:        Kitchen Pack > Meshes > C_jar_GEO.mesh (repurposed)
Dining Table: Home Pack > Meshes > C_table_dining_GEO.mesh
```

### Snap-to-Grid Logic

Each utensil has a **target position** defined in `ExerciseData.ts`:

```ts
interface Utensil {
  name: string
  targetPosition: vec3      // world position where it snaps
  targetRotation: quat      // final orientation
  snapDistance: number      // tolerance (0.5 = 50cm in AR space)
  enabled: boolean          // locked until previous step completes
}
```

**Flow:**
1. User releases dragged object
2. Check distance to target position
3. If < `snapDistance` → snap via `vec3.lerp()` over 0.3 seconds
4. If too far → reset to start position, show "Try again" hint
5. On snap complete → unlock next utensil

### Visual Guidance

- **Dashed outline** on table shows target snap position
- **Green highlight** on utensil when within snap distance
- **Red highlight** when too far — hint text: "Place closer to position"
- **Checkmark animation** on snap success

---

## Exercise Data Lookup

Both exercises are defined in `ExerciseData.ts`:

```ts
export const EXERCISES = {
  TOMATO_PREP: {
    id: "exercise_001",
    title: "Tomato Prep",
    description: "Follow the steps to prepare a tomato for cooking.",
    difficulty: "easy",
    steps: [
      "Grab tomato and place on your virtual table",
      "Grab knife",
      "Place knife on top of tomato",
      "Cut it"
    ],
    assetRefs: {
      tomato: "Food Pack/Meshes/C_tomato_GEO",
      knife: "Kitchen Pack/Meshes/C_knife_chopping_GEO",
      table: "Home Pack/Meshes/C_countertop_empty_GEO"
    }
  },

  SET_TABLE: {
    id: "exercise_002",
    title: "Set the Table",
    description: "Arrange place settings correctly for a meal.",
    difficulty: "easy",
    steps: [
      "Grab plate from stack and place on table",
      "Grab fork and place to the left of the plate",
      "Grab knife and place to the right of the plate",
      "Grab glass and place at the top-right"
    ],
    assetRefs: {
      plate: "Kitchen Pack/Meshes/C_plate_GEO",
      fork: "Kitchen Pack/Meshes/C_fork_GEO",
      knife: "Kitchen Pack/Meshes/C_knife_GEO",
      glass: "Kitchen Pack/Meshes/C_jar_GEO",
      table: "Home Pack/Meshes/C_table_dining_GEO"
    }
  }
}
```

Exercises are **not fetched from Firestore** in MVP — they are static local definitions. This keeps the app fast and allows offline use.

---

## Progression & Scoring

When a user completes all steps:

```
1. ExerciseController.onExerciseComplete() fires
2. Sends callback to MindStepUIManager
3. UIManager finds the assignment in Firestore
4. Increments completedReps by 1
5. If completedReps >= reps: mark assignment as complete ✓
6. TaskItem UI auto-updates with checkmark
7. Navigate back to Dashboard > MyTasks
```

---

## Future Exercises (Phase 3+)

Template for new exercises:

1. **Washing Hands** — sequence of tap, soap, rinse, dry with particle effects
2. **Making Tea** — fill kettle, boil, pour (pouring animation)
3. **Brushing Teeth** — grab brush, apply toothpaste, brush sequence
4. **Folding Clothes** — grab item, drag to fold, place in pile

Each follows the same `ExerciseController` abstract base.

