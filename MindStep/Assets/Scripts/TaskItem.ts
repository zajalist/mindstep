/**
 * TaskItem.ts
 * Represents a single task in the MyTasks list.
 * Displays task info and allows marking completion.
 */

import { FirebaseService, FirebaseAssignment } from "./FirebaseService";
import { ExerciseData } from "./ExerciseData";
// @ts-ignore – SIK module resolved by Lens Studio's package system at runtime
import { ToggleButton } from "SpectaclesInteractionKit.lspkg/Components/UI/ToggleButton/ToggleButton";

@component
export class TaskItem extends BaseScriptComponent {
  @ui.group_start("Task Item UI")
  @input
  titleText: Text;

  @input
  repsText: Text;

  @input
  notesText: Text;

  @input
  completeToggle: ToggleButton;
  @ui.group_end

  private assignment: FirebaseAssignment | null = null;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[TaskItem] Initializing");

    // Set up toggle button
    if (this.completeToggle) {
      this.completeToggle.onStateChanged.add((value: boolean) => {
        if (value && this.assignment) {
          this.markTaskComplete();
        }
      });
    }
  }

  /**
   * Set the assignment data for this task item.
   */
  setAssignment(assignment: FirebaseAssignment): void {
    this.assignment = assignment;

    // Get exercise data
    const exercise = ExerciseData.getExercise(assignment.exerciseId);

    if (!exercise) {
      print("[TaskItem] ERROR: Exercise not found: " + assignment.exerciseId);
      return;
    }

    // Update UI
    if (this.titleText) {
      this.titleText.text = exercise.title;
    }

    if (this.repsText) {
      this.repsText.text =
        assignment.completedReps + " / " + assignment.reps + " done";
    }

    if (this.notesText) {
      this.notesText.text = assignment.doctorNotes;
    }

    // Update toggle state
    if (this.completeToggle) {
      this.completeToggle.isToggledOn = assignment.isCompleted;
    }

    print(
      "[TaskItem] Set assignment: " +
        exercise.title +
        " (" +
        assignment.completedReps +
        "/" +
        assignment.reps +
        ")"
    );
  }

  /**
   * Mark task as complete (increment reps in Firebase).
   */
  private async markTaskComplete(): Promise<void> {
    if (!this.assignment) {
      return;
    }

    print("[TaskItem] Marking task complete: " + this.assignment.id);

    const success = await FirebaseService.markAssignmentComplete(
      this.assignment.id
    );

    if (success) {
      print("[TaskItem] Task updated in Firebase");

      // Update local state
      this.assignment.completedReps++;

      if (this.repsText) {
        this.repsText.text =
          this.assignment.completedReps + " / " + this.assignment.reps + " done";
      }

      // Check if fully complete
      if (this.assignment.completedReps >= this.assignment.reps) {
        this.assignment.isCompleted = true;
        print("[TaskItem] Task fully completed!");
      }
    } else {
      print("[TaskItem] ERROR: Failed to update task");

      // Revert toggle state
      if (this.completeToggle) {
        this.completeToggle.isToggledOn = false;
      }
    }
  }

  /**
   * Get the current assignment.
   */
  getAssignment(): FirebaseAssignment | null {
    return this.assignment;
  }
}
