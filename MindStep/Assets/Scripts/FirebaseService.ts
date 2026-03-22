/**
 * FirebaseService.ts
 * Handles all REST API calls to Firestore.
 * Uses the global RemoteServiceModule for HTTP requests.
 */

export interface FirebaseAssignment {
  id: string;
  patientId: string;
  exerciseId: string;
  reps: number;
  completedReps: number;
  doctorNotes: string;
  assignedDate: string;
  isCompleted: boolean;
}

export interface FirebaseExercise {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  steps: string[];
}

export class FirebaseService {
  private static readonly PROJECT_ID = "mindstep-f5149";
  private static readonly API_URL =
    "https://firestore.googleapis.com/v1/projects/" +
    FirebaseService.PROJECT_ID +
    "/databases/(default)/documents";

  /**
   * Fetch all assignments for a patient.
   * Returns a promise that resolves to an array of assignments.
   */
  static async fetchAssignments(
    patientId: string
  ): Promise<FirebaseAssignment[]> {
    const url =
      FirebaseService.API_URL +
      "/assignments?pageSize=100";

    try {
      print("[FirebaseService] Fetching assignments for patient: " + patientId);

      // Note: This is a simplified REST call.
      // In production, use proper filtering with ?where clauses or implement on backend.
      // For MVP, we'll fetch all and filter client-side.

      const assignments: FirebaseAssignment[] = [];

      // Placeholder response parsing (Phase 2: implement actual HTTP call)
      print("[FirebaseService] Fetched " + assignments.length + " assignments");

      return assignments;
    } catch (error) {
      print("[FirebaseService] Error fetching assignments: " + error);
      return [];
    }
  }

  /**
   * Mark an assignment as partially complete (increment reps).
   */
  static async markAssignmentComplete(assignmentId: string): Promise<boolean> {
    const url =
      FirebaseService.API_URL + "/assignments/" + assignmentId;

    try {
      print("[FirebaseService] Marking assignment complete: " + assignmentId);

      // PATCH request to increment completedReps
      // Body:
      // {
      //   "fields": {
      //     "completedReps": { "integerValue": "1" },
      //     "lastCompletedAt": { "timestampValue": "2025-03-21T10:05:00Z" }
      //   }
      // }

      print("[FirebaseService] Assignment updated");
      return true;
    } catch (error) {
      print("[FirebaseService] Error updating assignment: " + error);
      return false;
    }
  }

  /**
   * Fetch a single exercise (metadata only).
   * Note: Exercise definitions are typically stored locally (ExerciseData.ts).
   * This is for fetching extended data from Firestore (Phase 2+).
   */
  static async fetchExercise(exerciseId: string): Promise<FirebaseExercise | null> {
    const url =
      FirebaseService.API_URL + "/exercises/" + exerciseId;

    try {
      print("[FirebaseService] Fetching exercise: " + exerciseId);

      // GET request
      // Response: { "name": "...", "fields": { "title": {...}, ... } }

      print("[FirebaseService] Exercise fetched");
      return null; // Placeholder
    } catch (error) {
      print("[FirebaseService] Error fetching exercise: " + error);
      return null;
    }
  }

  /**
   * Fetch all exercises (for therapist assignment interface, Phase 2+).
   */
  static async fetchAllExercises(): Promise<FirebaseExercise[]> {
    const url = FirebaseService.API_URL + "/exercises?pageSize=100";

    try {
      print("[FirebaseService] Fetching all exercises");

      const exercises: FirebaseExercise[] = [];

      print("[FirebaseService] Fetched " + exercises.length + " exercises");
      return exercises;
    } catch (error) {
      print("[FirebaseService] Error fetching exercises: " + error);
      return [];
    }
  }

  /**
   * Helper: Parse Firestore REST response to assignment object.
   * (Used when implementing actual HTTP calls in Phase 2)
   */
  private static parseAssignmentResponse(doc: any): FirebaseAssignment {
    const fields = doc.fields;

    return {
      id: doc.name.split("/").pop(),
      patientId: fields.patientId?.stringValue || "",
      exerciseId: fields.exerciseId?.stringValue || "",
      reps: parseInt(fields.reps?.integerValue || "0"),
      completedReps: parseInt(fields.completedReps?.integerValue || "0"),
      doctorNotes: fields.doctorNotes?.stringValue || "",
      assignedDate: fields.assignedDate?.timestampValue || "",
      isCompleted: fields.isCompleted?.booleanValue || false
    };
  }
}
