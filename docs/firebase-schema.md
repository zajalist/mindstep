# Firebase Firestore Schema & Setup

## Overview

MindStep uses **Google Firestore** (real-time document database) to store:
- Patient information
- Therapist accounts
- Exercise definitions
- Task assignments (linking patient → exercise)
- Completion tracking

**Project ID:** `mindstep-f5149`
**Region:** us-central1 (auto)

---

## Firestore Collections Schema

### `/patients/{patientId}`

Patient profile & metadata.

```typescript
{
  patientId: string         // document ID (auto-generated or email hash)
  name: string              // e.g., "John Doe"
  email: string             // e.g., "john@example.com"
  dateOfBirth: Timestamp    // optional for privacy
  therapistId: string       // foreign key → /therapists/{therapistId}
  createdAt: Timestamp      // when profile created
  lastUpdated: Timestamp    // last login or update
}
```

**Seed example:**
```json
{
  "name": "Test User",
  "email": "testuser@mindstep.local",
  "therapistId": "therapist_001",
  "createdAt": "2025-03-21T10:00:00Z",
  "lastUpdated": "2025-03-21T10:00:00Z"
}
```

---

### `/therapists/{therapistId}`

Therapist account.

```typescript
{
  therapistId: string       // document ID
  name: string              // e.g., "Dr. Sample"
  email: string             // professional email
  licenseNumber: string     // optional
  organization: string      // clinic or hospital name
  createdAt: Timestamp
}
```

**Seed example:**
```json
{
  "name": "Dr. Sample",
  "email": "dr.sample@clinic.local",
  "licenseNumber": "OT-12345",
  "organization": "Rehab Clinic",
  "createdAt": "2025-03-21T10:00:00Z"
}
```

---

### `/exercises/{exerciseId}`

Exercise template (not a task — the blueprint).

```typescript
{
  exerciseId: string        // e.g., "exercise_001"
  title: string             // e.g., "Tomato Prep"
  description: string       // long description (shown in confirm panel)
  difficulty: string        // "easy" | "medium" | "hard"
  steps: string[]           // array of step descriptions
  category: string          // "cooking" | "cleaning" | "personal_care"
  isTemplate: boolean       // true = available for therapists to assign
  createdAt: Timestamp
}
```

**Seed examples:**
```json
[
  {
    "exerciseId": "exercise_001",
    "title": "Tomato Prep",
    "description": "Learn to prepare a tomato for cooking. You'll practice grabbing, placing, and cutting skills.",
    "difficulty": "easy",
    "steps": [
      "Grab tomato and place on your virtual table",
      "Grab knife",
      "Place knife on top of tomato",
      "Cut it"
    ],
    "category": "cooking",
    "isTemplate": true,
    "createdAt": "2025-03-21T10:00:00Z"
  },
  {
    "exerciseId": "exercise_002",
    "title": "Set the Table",
    "description": "Practice proper table setting. Arrange plate, utensils, and glass in the correct positions.",
    "difficulty": "easy",
    "steps": [
      "Grab plate from stack and place on table",
      "Grab fork and place to the left of the plate",
      "Grab knife and place to the right of the plate",
      "Grab glass and place at the top-right"
    ],
    "category": "cooking",
    "isTemplate": true,
    "createdAt": "2025-03-21T10:00:00Z"
  }
]
```

---

### `/assignments/{assignmentId}`

A **task** created by a therapist, assigning an exercise to a patient.

```typescript
{
  assignmentId: string      // document ID (auto-generated)
  patientId: string         // foreign key → /patients/{patientId}
  exerciseId: string        // foreign key → /exercises/{exerciseId}
  therapistId: string       // who assigned it
  reps: number              // target repetitions (e.g., 3)
  completedReps: number     // counter: 0–reps (auto-incremented by app)
  doctorNotes: string       // therapist notes (e.g., "Focus on grip strength")
  difficulty: string        // optional override (e.g., "medium" if pt struggles)
  dueDate: Timestamp        // optional deadline
  assignedDate: Timestamp   // when created
  isCompleted: boolean      // true when completedReps >= reps
  lastCompletedAt: Timestamp // most recent rep completion
}
```

**Seed examples:**
```json
[
  {
    "assignmentId": "assignment_001",
    "patientId": "patient_001",
    "exerciseId": "exercise_001",
    "therapistId": "therapist_001",
    "reps": 3,
    "completedReps": 0,
    "doctorNotes": "Focus on knife grip. Go slow.",
    "assignedDate": "2025-03-21T10:00:00Z",
    "isCompleted": false
  },
  {
    "assignmentId": "assignment_002",
    "patientId": "patient_001",
    "exerciseId": "exercise_002",
    "therapistId": "therapist_001",
    "reps": 2,
    "completedReps": 0,
    "doctorNotes": "Practice coordination and sequence memory.",
    "assignedDate": "2025-03-21T10:00:00Z",
    "isCompleted": false
  }
]
```

---

## Security Rules (Firestore)

**For MVP:** Open read/write (development only). Tighten before production.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Phase 2 (Auth rules):**
```
match /patients/{patientId} {
  allow read: if request.auth.uid == patientId ||
               get(/databases/$(database)/documents/therapists/$(request.auth.uid)).data.therapistId != null;
  allow write: if request.auth.uid == patientId;
}

match /assignments/{assignmentId} {
  allow read: if request.auth.uid == resource.data.patientId ||
               request.auth.uid == resource.data.therapistId;
  allow write: if request.auth.uid == resource.data.therapistId;
}
```

---

## REST API Endpoints (TypeScript Usage)

MindStep uses **Firestore REST API v1** to avoid SDK bundle bloat.

### Endpoint Format
```
https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/{path}
```

where `projectId = "mindstep-f5149"`

### Common Operations

#### Fetch All Assignments for a Patient
```typescript
GET /v1/projects/mindstep-f5149/databases/(default)/documents/assignments?where=patientId=={patientId}
Response:
{
  "documents": [
    {
      "name": "projects/mindstep-f5149/databases/(default)/documents/assignments/assignment_001",
      "fields": {
        "patientId": { "stringValue": "patient_001" },
        "exerciseId": { "stringValue": "exercise_001" },
        "reps": { "integerValue": "3" },
        "completedReps": { "integerValue": "0" },
        ...
      }
    }
  ]
}
```

#### Fetch a Single Exercise
```typescript
GET /v1/projects/mindstep-f5149/databases/(default)/documents/exercises/exercise_001
Response:
{
  "name": "projects/mindstep-f5149/databases/(default)/documents/exercises/exercise_001",
  "fields": {
    "title": { "stringValue": "Tomato Prep" },
    "description": { "stringValue": "..." },
    "steps": { "arrayValue": { "values": [...] } }
  }
}
```

#### Mark Assignment as Complete (Increment Counter)
```typescript
PATCH /v1/projects/mindstep-f5149/databases/(default)/documents/assignments/assignment_001
Content-Type: application/json

{
  "fields": {
    "completedReps": { "integerValue": "1" },
    "lastCompletedAt": { "timestampValue": "2025-03-21T10:05:00Z" }
  }
}
Response: { "name": "…/assignment_001", "fields": {...} }
```

---

## Seed Data Script

**File:** `MindStep/Assets/Scripts/firebase-seed.ts`

Run this once to populate Firestore with MVP data:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDoY3yf3Uzn6AWH90eeQLZ7YReIOoUFS8Y",
  authDomain: "mindstep-f5149.firebaseapp.com",
  projectId: "mindstep-f5149",
  storageBucket: "mindstep-f5149.firebasestorage.app",
  messagingSenderId: "73810294428",
  appId: "1:73810294428:web:1917ba089fc2bca69b5f59",
  measurementId: "G-1RVZM5FPBF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  // 1. Create therapist
  await setDoc(doc(db, "therapists", "therapist_001"), {
    name: "Dr. Sample",
    email: "dr.sample@clinic.local",
    licenseNumber: "OT-12345",
    organization: "Rehab Clinic",
    createdAt: new Date()
  });

  // 2. Create patient (guest)
  await setDoc(doc(db, "patients", "patient_001"), {
    name: "Test User",
    email: "testuser@mindstep.local",
    therapistId: "therapist_001",
    createdAt: new Date(),
    lastUpdated: new Date()
  });

  // 3. Create exercises
  await setDoc(doc(db, "exercises", "exercise_001"), {
    title: "Tomato Prep",
    description: "Learn to prepare a tomato for cooking. You'll practice grabbing, placing, and cutting skills.",
    difficulty: "easy",
    steps: [
      "Grab tomato and place on your virtual table",
      "Grab knife",
      "Place knife on top of tomato",
      "Cut it"
    ],
    category: "cooking",
    isTemplate: true,
    createdAt: new Date()
  });

  await setDoc(doc(db, "exercises", "exercise_002"), {
    title: "Set the Table",
    description: "Practice proper table setting. Arrange plate, utensils, and glass in the correct positions.",
    difficulty: "easy",
    steps: [
      "Grab plate from stack and place on table",
      "Grab fork and place to the left of the plate",
      "Grab knife and place to the right of the plate",
      "Grab glass and place at the top-right"
    ],
    category: "cooking",
    isTemplate: true,
    createdAt: new Date()
  });

  // 4. Create assignments
  await addDoc(collection(db, "assignments"), {
    patientId: "patient_001",
    exerciseId: "exercise_001",
    therapistId: "therapist_001",
    reps: 3,
    completedReps: 0,
    doctorNotes: "Focus on knife grip. Go slow.",
    assignedDate: new Date(),
    isCompleted: false
  });

  await addDoc(collection(db, "assignments"), {
    patientId: "patient_001",
    exerciseId: "exercise_002",
    therapistId: "therapist_001",
    reps: 2,
    completedReps: 0,
    doctorNotes: "Practice coordination and sequence memory.",
    assignedDate: new Date(),
    isCompleted: false
  });

  console.log("✅ Seeded Firestore with MVP data");
}

seedDatabase().catch(err => console.error("❌ Seed failed:", err));
```

**To run (in Firebase console):** Use a Node.js script or Firebase CLI custom function.

---

## Testing Queries in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project `mindstep-f5149`
3. Open **Firestore Database**
4. Collections should show:
   - `assignments` (2 docs)
   - `exercises` (2 docs)
   - `patients` (1 doc)
   - `therapists` (1 doc)

5. Click into `assignments` → verify `completedReps: 0`
6. To test completion: click `assignment_001` → **Edit** → set `completedReps: 1` → **Save**

---

## Environment Variables (Lens Studio)

Store Firebase config in `RemoteServiceModule` or inline in `FirebaseService.ts`:

```typescript
// FirebaseService.ts
const FIREBASE_PROJECT_ID = "mindstep-f5149";
const FIREBASE_API_KEY = "AIzaSyDoY3yf3Uzn6AWH90eeQLZ7YReIOoUFS8Y";

const buildFirestoreUrl = (path: string) =>
  `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`;
```

**For Phase 2:** Migrate to `.env` file if using bundler (e.g., Webpack + Lens Studio TypeScript setup).

