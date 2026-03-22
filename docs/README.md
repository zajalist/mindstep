# MindStep — AR Rehabilitation Task Manager

## Project Overview

**MindStep** is an augmented reality app built for Snapchat Spectacles that helps occupational therapists assign and track rehabilitation tasks for patients with executive dysfunction. Patients see assigned activities (cooking, cleaning, personal care) in AR and complete guided, step-by-step exercises while the app tracks completion.

This is the **MVP (Minimum Viable Product)** with:
- 2 full-featured exercises: Tomato Prep (cutting) + Set the Table
- Task assignment tracking via Firestore
- Multi-screen AR UI using SpectaclesInteractionKit
- Guest login + optional Firebase Auth

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Platform** | Snapchat Spectacles (Lens Studio 5+) |
| **Frontend** | TypeScript (compiled to JavaScript) |
| **UI Framework** | SpectaclesInteractionKit (SIK) + SpectaclesUIKit |
| **Backend** | Firestore (REST API) |
| **3D Assets** | Bitmoji packs (Food, Kitchen, Home), SDF Slicer for cutting animation |
| **VCS** | Git (no remote initially) |

---

## Quick Start

### Prerequisites
- Lens Studio 5.0+
- Node.js 16+ (for TypeScript compilation if using local tooling)
- Snapchat Spectacles Gen 4+
- Firebase project created (use config in `docs/firebase-schema.md`)

### Open the Project
1. Open Lens Studio
2. Load `MindStep/MindStep` (folder contains `.lsproj`)
3. Verify scene loads without TypeScript errors in **Build > Errors**

### Running in Simulator
1. Click **Preview** in Lens Studio top bar
2. Connect to Spectacles Simulator
3. Tap the lens to start the app
4. Home screen shows: MindStep logo, version, devlog, "Welcome, Guest", Start button

---

## Folder Structure

```
MindStep/MindStep/
├── Assets/
│   ├── Scripts/                    ← all TypeScript source files
│   │   ├── SessionManager.ts
│   │   ├── MindStepUIManager.ts
│   │   ├── FirebaseService.ts
│   │   ├── ExerciseData.ts
│   │   ├── ...
│   │   └── Exercises/
│   │       ├── ExerciseController.ts
│   │       ├── TomatoPrepExercise.ts
│   │       └── SetTableExercise.ts
│   │
│   ├── Food Pack.lspkg/            ← tomato + ingredients
│   ├── Kitchen Pack.lspkg/         ← plates, utensils, knives
│   ├── Home Pack.lspkg/            ← furniture, tables
│   ├── SDF Slicer.lspkg/           ← cutting animation material
│   │
│   ├── Scene.scene                 ← main scene (non-demo hierarchy)
│   ├── Logo.png                    ← home screen branding
│   └── Prefabs/                    ← UI prefabs (TaskItem, ActivityCard, etc.)
│
├── Cache/                          ← SIK source (read-only)
└── Support/
    └── StudioLib.d.ts              ← Lens Studio type definitions
```

---

## Architecture at a Glance

```
┌─ HomeScreen (logo + devlog + start button)
│
├─ Dashboard
│  ├─ MyTasks (assigned exercises with reps + checkmarks)
│  ├─ Browse (grid of 2 active + N skeleton exercises)
│  └─ Confirm (selected exercise preview + description)
│
└─ Exercise (TomatoPrep or SetTable with AR interactions)
```

**State machine:** `MindStepUIManager.ts` orchestrates transitions.
**Data flow:** UI → `FirebaseService` (Firestore) ← `ExerciseData` (local static definitions)

---

## Next Steps

1. **Read** `docs/architecture.md` to understand scene structure + script dependencies
2. **Read** `docs/phases.md` for implementation roadmap
3. **Read** `docs/exercises.md` for step sequences + animation details
4. **Check** `docs/firebase-schema.md` to seed test data

---

## Contact & Feedback

This project is under active development. For questions, refer to:
- Architecture docs: `docs/architecture.md`
- Firebase setup: `docs/firebase-schema.md`
- Phase roadmap: `docs/phases.md`
