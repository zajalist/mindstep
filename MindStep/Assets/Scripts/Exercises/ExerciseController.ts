/**
 * ExerciseController.ts
 * Abstract base class for all exercises.
 * Manages step progression, user interaction, and completion callbacks.
 *
 * NOTE: Inputs wired by SceneWiring at runtime. No @input decorators.
 */

import { Exercise, ExerciseData } from "../ExerciseData";

@component
export class ExerciseController extends BaseScriptComponent {
  // Wired by SceneWiring
  stepText: Text | null = null;
  progressDotsText: Text | null = null;
  exitButton: any = null;

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

    if (this.exitButton) {
      const btn = this.exitButton;
      if (btn.onTriggerUp) {
        btn.onTriggerUp.add(() => this.exitExercise());
      } else if (btn.onButtonPinched) {
        btn.onButtonPinched.add(() => this.exitExercise());
      } else if (btn.onTriggerStart) {
        btn.onTriggerStart.add(() => this.exitExercise());
      }
    }
  }

  startExercise(exerciseId: string): void {
    this.exerciseData = ExerciseData.getExercise(exerciseId);

    if (!this.exerciseData) {
      print("[ExerciseController] ERROR: Exercise not found: " + exerciseId);
      return;
    }

    print("[ExerciseController] Starting exercise: " + this.exerciseData.title);

    this.currentStep = 0;
    this.isComplete = false;

    this.displayStep();
    this.onExerciseStart();
  }

  protected displayStep(): void {
    if (!this.exerciseData || this.currentStep >= this.exerciseData.steps.length) {
      return;
    }

    const stepNumber = this.currentStep + 1;
    const totalSteps = this.exerciseData.steps.length;
    const stepDescription = this.exerciseData.steps[this.currentStep];

    if (this.stepText) {
      this.stepText.text =
        "Step " + stepNumber + " of " + totalSteps + ":\n" + stepDescription;
    }

    this.updateProgressVisuals(stepNumber, totalSteps);

    print("[ExerciseController] Displaying step " + stepNumber + ": " + stepDescription);
  }

  protected onStepComplete(): void {
    this.currentStep++;

    if (this.currentStep >= this.exerciseData!.steps.length) {
      this.onExerciseComplete();
    } else {
      this.displayStep();
    }
  }

  protected onExerciseComplete(): void {
    this.isComplete = true;
    print("[ExerciseController] Exercise complete: " + this.exerciseData?.title);

    if (this.stepText) {
      this.stepText.text = "Exercise Complete!\nAuto-checking your task...";
    }

    const delayEvent = this.createEvent("DelayedCallbackEvent");
    delayEvent.bind(() => {
      if (this.onCompleteCallback && this.exerciseData) {
        this.onCompleteCallback(this.exerciseData.id);
      }
    });
    (delayEvent as any).reset(2.0);
  }

  protected exitExercise(): void {
    print("[ExerciseController] User exited exercise");

    if (this.onCompleteCallback && this.exerciseData) {
      this.onCompleteCallback(this.exerciseData.id);
    }
  }

  setOnCompleteCallback(callback: (exerciseId: string) => void): void {
    this.onCompleteCallback = callback;
  }

  protected onExerciseStart(): void {
    // Override in subclass
  }

  private updateProgressVisuals(current: number, total: number): void {
    if (!this.progressDotsText) return;
    const dots: string[] = [];
    for (let i = 1; i <= total; i++) {
      dots.push(i < current ? "o" : i === current ? "O" : ".");
    }
    this.progressDotsText.text = dots.join(" ");
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  isExerciseComplete(): boolean {
    return this.isComplete;
  }
}
