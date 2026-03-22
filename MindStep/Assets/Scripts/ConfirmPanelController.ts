/**
 * ConfirmPanelController.ts
 * Manages the Confirm panel that shows exercise details before starting.
 * Displays screenshot (placeholder for MVP), title, and description.
 *
 * NOTE: Inputs wired by SceneWiring at runtime. No @input decorators.
 */

import { ExerciseData } from "./ExerciseData";

@component
export class ConfirmPanelController extends BaseScriptComponent {
  // Wired by SceneWiring
  screenshotImage: Image | null = null;
  exerciseTitleText: Text | null = null;
  exerciseDescriptionText: Text | null = null;

  private selectedExerciseId: string = "";

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[ConfirmPanelController] Initializing");
  }

  setSelectedExercise(exerciseId: string): void {
    this.selectedExerciseId = exerciseId;

    const exercise = ExerciseData.getExercise(exerciseId);

    if (!exercise) {
      print("[ConfirmPanelController] ERROR: Exercise not found: " + exerciseId);
      return;
    }

    print("[ConfirmPanelController] Displaying exercise: " + exercise.title);

    if (this.exerciseTitleText) {
      this.exerciseTitleText.text = exercise.title;
    }

    if (this.exerciseDescriptionText) {
      this.exerciseDescriptionText.text = exercise.description;
    }

    if (this.screenshotImage) {
      print("[ConfirmPanelController] Screenshot placeholder (to be filled by user)");
    }
  }

  getSelectedExerciseId(): string {
    return this.selectedExerciseId;
  }
}
