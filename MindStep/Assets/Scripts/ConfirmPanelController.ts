/**
 * ConfirmPanelController.ts
 * Manages the Confirm panel that shows exercise details before starting.
 * Displays screenshot (placeholder for MVP), title, and description.
 */

import { ExerciseData } from "./ExerciseData";

@component
export class ConfirmPanelController extends BaseScriptComponent {
  @ui.group_start("Confirm Panel UI")
  @input
  @hint("Placeholder for exercise screenshot")
  screenshotImage: Image;

  @input
  exerciseTitleText: Text;

  @input
  exerciseDescriptionText: Text;
  @ui.group_end

  private selectedExerciseId: string = "";

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[ConfirmPanelController] Initializing");
  }

  /**
   * Set the selected exercise and display its details.
   */
  setSelectedExercise(exerciseId: string): void {
    this.selectedExerciseId = exerciseId;

    const exercise = ExerciseData.getExercise(exerciseId);

    if (!exercise) {
      print("[ConfirmPanelController] ERROR: Exercise not found: " + exerciseId);
      return;
    }

    print("[ConfirmPanelController] Displaying exercise: " + exercise.title);

    // Update title
    if (this.exerciseTitleText) {
      this.exerciseTitleText.text = exercise.title;
    }

    // Update description
    if (this.exerciseDescriptionText) {
      this.exerciseDescriptionText.text = exercise.description;
    }

    // Screenshot: placeholder for MVP
    // Phase 2: load exercise-specific image
    if (this.screenshotImage) {
      print("[ConfirmPanelController] Screenshot placeholder (to be filled by user)");
      // screenshotImage.texture = some_texture; // Phase 2
    }
  }

  /**
   * Get selected exercise ID.
   */
  getSelectedExerciseId(): string {
    return this.selectedExerciseId;
  }
}
