/**
 * ExerciseController.ts
 * Abstract base class for all exercises.
 * Manages step progression, user interaction, and completion callbacks.
 */

import { Exercise, ExerciseData } from "../ExerciseData";
import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";

@component
export class ExerciseController extends BaseScriptComponent {
  // UI HUD references
  @ui.group_start("Exercise HUD")
  @input
  stepText: Text;

  @input
  progressDotsImage: Image;

  @input
  exitButton: any;
  @ui.group_end

  protected exerciseData: Exercise | null = null;
  protected currentStep: number = 0;
  protected isComplete: boolean = false;
  protected onCompleteCallback: ((exerciseId: string) => void) | null = null;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  protected initialize(): void {
    print("[ExerciseController] Initializing base exercise controller");

    // Exit button handler
    if (this.exitButton) {
      this.exitButton.onTriggerStart.add(() => {
        this.exitExercise();
      });
    }
  }

  /**
   * Start an exercise by ID.
   */
  startExercise(exerciseId: string): void {
    this.exerciseData = ExerciseData.getExercise(exerciseId);

    if (!this.exerciseData) {
      print("[ExerciseController] ERROR: Exercise not found: " + exerciseId);
      return;
    }

    print("[ExerciseController] Starting exercise: " + this.exerciseData.title);

    this.currentStep = 0;
    this.isComplete = false;

    // Show first step
    this.displayStep();

    // Subclass-specific setup
    this.onExerciseStart();
  }

  /**
   * Display the current step text and progress.
   */
  protected displayStep(): void {
    if (!this.exerciseData || this.currentStep >= this.exerciseData.steps.length) {
      return;
    }

    const stepNumber = this.currentStep + 1;
    const totalSteps = this.exerciseData.steps.length;
    const stepDescription = this.exerciseData.steps[this.currentStep];

    // Update step text
    if (this.stepText) {
      this.stepText.text =
        "Step " +
        stepNumber +
        " of " +
        totalSteps +
        ":\n" +
        stepDescription;
    }

    // Update progress dots (Phase 2: implement visual progress bar)
    this.updateProgressVisuals(stepNumber, totalSteps);

    print(
      "[ExerciseController] Displaying step " +
        stepNumber +
        ": " +
        stepDescription
    );
  }

  /**
   * Called when a step is completed (subclass implements logic).
   */
  protected onStepComplete(): void {
    this.currentStep++;

    if (this.currentStep >= this.exerciseData!.steps.length) {
      // All steps done
      this.onExerciseComplete();
    } else {
      // Show next step
      this.displayStep();
    }
  }

  /**
   * Called when the entire exercise is complete.
   */
  protected onExerciseComplete(): void {
    this.isComplete = true;
    print("[ExerciseController] Exercise complete: " + this.exerciseData?.title);

    // Update step text
    if (this.stepText) {
      this.stepText.text = "✅ Exercise Complete!\nAuto-checking your task...";
    }

    // Delay before returning to dashboard (allow user to see completion message)
    const delayEvent = this.createEvent("DelayedCallbackEvent");
    delayEvent.bind(() => {
      if (this.onCompleteCallback && this.exerciseData) {
        this.onCompleteCallback(this.exerciseData.id);
      }
    });
    delayEvent.reset(2.0); // 2 second delay
  }

  /**
   * Exit exercise early.
   */
  protected exitExercise(): void {
    print("[ExerciseController] User exited exercise");

    // In Phase 2: don't mark as complete, just return to dashboard
    // For now, just trigger the callback (dashboard will handle return)
    if (this.onCompleteCallback && this.exerciseData) {
      this.onCompleteCallback(this.exerciseData.id);
    }
  }

  /**
   * Set the completion callback (called by MindStepUIManager).
   */
  setOnCompleteCallback(callback: (exerciseId: string) => void): void {
    this.onCompleteCallback = callback;
  }

  /**
   * Subclass hook: called when exercise starts.
   */
  protected onExerciseStart(): void {
    // Override in subclass
  }

  /**
   * Update progress dot visuals (Phase 2: implement proper visualization).
   */
  private updateProgressVisuals(current: number, total: number): void {
    // For MVP, just a placeholder.
    // Phase 2: render filled/empty circles based on progress
  }

  /**
   * Get current step number (for internal checks).
   */
  getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * Get whether exercise is complete.
   */
  isExerciseComplete(): boolean {
    return this.isComplete;
  }
}
