/**
 * FirebaseService.ts
 * Handles all REST API calls to Firestore via Lens Studio's RemoteServiceModule.
 */

//@ts-ignore
const remoteServiceModule: RemoteServiceModule = require("LensStudio:RemoteServiceModule");

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
  private static readonly BASE_URL =
    "https://firestore.googleapis.com/v1/projects/" +
    FirebaseService.PROJECT_ID +
    "/databases/(default)/documents";

  // ---------- HTTP helpers ----------

  private static httpGet(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = RemoteServiceHttpRequest.create();
      request.url = url;
      request.method = RemoteServiceHttpRequest.HttpRequestMethod.Get;
      request.setHeader("Content-Type", "application/json");
      remoteServiceModule.performHttpRequest(request, (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            resolve(JSON.parse(response.body));
          } catch (e) {
            reject(new Error("JSON parse error: " + e));
          }
        } else {
          reject(new Error("HTTP " + response.statusCode + ": " + response.body));
        }
      });
    });
  }

  private static httpPatch(url: string, body: object): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = RemoteServiceHttpRequest.create();
      request.url = url;
      request.method = RemoteServiceHttpRequest.HttpRequestMethod.Patch;
      request.setHeader("Content-Type", "application/json");
      request.body = JSON.stringify(body);
      remoteServiceModule.performHttpRequest(request, (response) => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try { resolve(JSON.parse(response.body)); } catch (e) { resolve({}); }
        } else {
          reject(new Error("HTTP " + response.statusCode + ": " + response.body));
        }
      });
    });
  }

  // ---------- Assignments ----------

  /**
   * Fetch all assignments (filters client-side by patientId).
   * Guest users (patient_001) see all assignments in the collection.
   */
  static async fetchAssignments(patientId: string): Promise<FirebaseAssignment[]> {
    const url = FirebaseService.BASE_URL + "/assignments?pageSize=100";
    print("[FirebaseService] Fetching assignments for: " + patientId);
    try {
      const data = await FirebaseService.httpGet(url);
      const docs: any[] = data.documents || [];
      const all = docs.map((doc) => FirebaseService.parseAssignment(doc));
      const filtered = all.filter(
        (a) => a.patientId === patientId || patientId === "patient_001"
      );
      print("[FirebaseService] Got " + filtered.length + " assignments");
      return filtered;
    } catch (err) {
      print("[FirebaseService] fetchAssignments error: " + err);
      return [];
    }
  }

  /**
   * Increment completedReps for an assignment (fetch current, then PATCH +1).
   */
  static async markAssignmentComplete(assignmentId: string): Promise<boolean> {
    print("[FirebaseService] Marking complete: " + assignmentId);
    try {
      const docUrl = FirebaseService.BASE_URL + "/assignments/" + assignmentId;
      const doc = await FirebaseService.httpGet(docUrl);
      const currentReps = parseInt(doc.fields?.completedReps?.integerValue || "0");
      const newReps = currentReps + 1;
      const now = new Date().toISOString();
      const patchUrl =
        docUrl +
        "?updateMask.fieldPaths=completedReps&updateMask.fieldPaths=lastCompletedAt";
      await FirebaseService.httpPatch(patchUrl, {
        fields: {
          completedReps: { integerValue: String(newReps) },
          lastCompletedAt: { timestampValue: now }
        }
      });
      print("[FirebaseService] Updated completedReps to " + newReps);
      return true;
    } catch (err) {
      print("[FirebaseService] markAssignmentComplete error: " + err);
      return false;
    }
  }

  /** Fetch a single exercise by ID. */
  static async fetchExercise(exerciseId: string): Promise<FirebaseExercise | null> {
    const url = FirebaseService.BASE_URL + "/exercises/" + exerciseId;
    print("[FirebaseService] Fetching exercise: " + exerciseId);
    try {
      const doc = await FirebaseService.httpGet(url);
      return FirebaseService.parseExercise(doc);
    } catch (err) {
      print("[FirebaseService] fetchExercise error: " + err);
      return null;
    }
  }

  /** Fetch all exercises. */
  static async fetchAllExercises(): Promise<FirebaseExercise[]> {
    const url = FirebaseService.BASE_URL + "/exercises?pageSize=100";
    print("[FirebaseService] Fetching all exercises");
    try {
      const data = await FirebaseService.httpGet(url);
      const docs: any[] = data.documents || [];
      return docs.map((doc) => FirebaseService.parseExercise(doc));
    } catch (err) {
      print("[FirebaseService] fetchAllExercises error: " + err);
      return [];
    }
  }

  // ---------- Parsers ----------

  private static parseAssignment(doc: any): FirebaseAssignment {
    const f = doc.fields || {};
    return {
      id: (doc.name as string).split("/").pop() || "",
      patientId: f.patientId?.stringValue || "",
      exerciseId: f.exerciseId?.stringValue || "",
      reps: parseInt(f.reps?.integerValue || "1"),
      completedReps: parseInt(f.completedReps?.integerValue || "0"),
      doctorNotes: f.doctorNotes?.stringValue || "",
      assignedDate: f.assignedDate?.timestampValue || "",
      isCompleted: f.isCompleted?.booleanValue || false
    };
  }

  private static parseExercise(doc: any): FirebaseExercise {
    const f = doc.fields || {};
    const stepsArr: string[] =
      f.steps?.arrayValue?.values?.map((v: any) => v.stringValue || "") || [];
    return {
      id: (doc.name as string).split("/").pop() || "",
      title: f.title?.stringValue || "",
      description: f.description?.stringValue || "",
      difficulty: f.difficulty?.stringValue || "easy",
      steps: stepsArr
    };
  }
}
