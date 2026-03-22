/**
 * TomatoPrepExercise.ts
 * Rich HUD controller for the Tomato Prep exercise.
 * Shows ONE step at a time with responsive visual feedback.
 * Uses ContainerFrame close button and Previous/Next RoundButtons.
 * Step completion is auto-detected (Next advances, last step completes).
 *
 * Includes simple code-based gravity for the tomato (falls onto table/plate).
 *
 * Steps:
 *   1) Pick tomato, place on plate
 *   2) Pick knife
 *   3) Place knife on top of tomato
 *   4) Cut tomato (SDF slicer)
 */

import { ExerciseController } from "./ExerciseController";

const TAG = "TomatoPrep";
const GRAVITY = -50;       // cm/s^2 downward
const BOUNCE_DAMPING = 0.3;

interface TomatoStep {
  title: string;
  instruction: string;
  therapistNote: string;
  showModels: string[];
  highlightModel: string;
}

const TOMATO_STEPS: TomatoStep[] = [
  {
    title: "Pick Up the Tomato",
    instruction: "Reach out and pinch the tomato.\nPlace it on the plate.",
    therapistNote: "Steady grip \u2014 take your time.",
    showModels: ["table", "plate", "tomato", "knife"],
    highlightModel: "tomato"
  },
  {
    title: "Pick Up the Knife",
    instruction: "Carefully grab the knife\nby the handle.",
    therapistNote: "Fingers away from the blade.",
    showModels: ["table", "plate", "tomato", "knife"],
    highlightModel: "knife"
  },
  {
    title: "Position the Knife",
    instruction: "Bring the knife above the tomato.\nAlign the blade with the center.",
    therapistNote: "Slow and controlled motion.",
    showModels: ["table", "plate", "tomato", "knife"],
    highlightModel: "knife"
  },
  {
    title: "Cut the Tomato!",
    instruction: "Push down gently to slice through.\nWatch the cut animation!",
    therapistNote: "One smooth motion \u2014 great job!",
    showModels: ["table", "plate", "tomato", "knife", "slicer"],
    highlightModel: "slicer"
  }
];

@component
export class TomatoPrepExercise extends ExerciseController {

  // ==================== HUD TEXT ====================
  headerTitleText: Text | null = null;
  headerTimerText: Text | null = null;
  stepTitleText: Text | null = null;
  stepDescriptionText: Text | null = null;
  instructionText: Text | null = null;
  therapistNoteText: Text | null = null;
  completionText: Text | null = null;

  // ==================== NAVIGATION ====================
  prevButton: any = null;
  nextButton: any = null;
  containerFrame: any = null;

  // ==================== 3D MODELS ====================
  modelContainer: SceneObject | null = null;
  tomatoModel: SceneObject | null = null;
  knifeModel: SceneObject | null = null;
  cuttingBoardModel: SceneObject | null = null;
  slicerObject: SceneObject | null = null;
  plateModel: SceneObject | null = null;
  tableModel: SceneObject | null = null;

  // ==================== HUD PANELS ====================
  hudPanel: SceneObject | null = null;
  headerBar: SceneObject | null = null;
  stepCard: SceneObject | null = null;
  buttonBar: SceneObject | null = null;
  completionPanel: SceneObject | null = null;

  // ==================== INTERNAL STATE ====================
  private exerciseStartTime: number = 0;
  private timerEvent: any = null;
  private stepAnimEvent: any = null;
  private completionAnimEvent: any = null;
  private highlightAnimEvent: any = null;
  private pulseCount: number = 0;
  private readonly MAX_PULSES = 3;

  // ==================== GRAVITY STATE ====================
  private gravityEvent: any = null;
  private tomatoVelocityY: number = 0;
  private tomatoGravityActive: boolean = false;
  private tableSurfaceY: number = 0;
  private lastFrameTime: number = 0;

  protected initialize(): void {
    super.initialize();
    print("[" + TAG + "] Initializing Tomato Exercise HUD");

    this.stepAnimEvent = this.createEvent("DelayedCallbackEvent");
    this.stepAnimEvent.bind(() => this.onStepAnimComplete());

    this.completionAnimEvent = this.createEvent("DelayedCallbackEvent");
    this.completionAnimEvent.bind(() => this.onCompletionAnimDone());

    this.highlightAnimEvent = this.createEvent("DelayedCallbackEvent");
    this.highlightAnimEvent.bind(() => this.onHighlightPulse());

    this.timerEvent = this.createEvent("UpdateEvent");
    this.timerEvent.bind(() => this.updateTimer());
    this.timerEvent.enabled = false;

    // Gravity update loop
    this.gravityEvent = this.createEvent("UpdateEvent");
    this.gravityEvent.bind(() => this.updateGravity());
    this.gravityEvent.enabled = false;

    // Wire Previous / Next RoundButtons
    this.bindBtn(this.prevButton, () => this.onPrevStep());
    this.bindBtn(this.nextButton, () => this.onNextStep());

    // Wire ContainerFrame close button to exit exercise
    if (this.containerFrame && this.containerFrame.closeButton) {
      this.containerFrame.closeButton.onTrigger.add(() => {
        print("[" + TAG + "] Close button pressed");
        this.exitExercise();
      });
    }

    if (this.completionPanel) this.completionPanel.enabled = false;
  }

  // ==================== EXERCISE LIFECYCLE ====================

  protected onExerciseStart(): void {
    print("[" + TAG + "] Exercise started");
    this.exerciseStartTime = getTime();

    if (this.hudPanel) this.hudPanel.enabled = true;
    if (this.headerBar) this.headerBar.enabled = true;
    if (this.stepCard) this.stepCard.enabled = true;
    if (this.buttonBar) this.buttonBar.enabled = true;
    if (this.completionPanel) this.completionPanel.enabled = false;

    if (this.headerTitleText) this.headerTitleText.text = "TOMATO PREP";
    if (this.timerEvent) this.timerEvent.enabled = true;

    // Calculate table surface Y for gravity collision
    this.computeTableSurfaceY();

    // Start gravity for tomato
    this.tomatoVelocityY = 0;
    this.tomatoGravityActive = true;
    this.lastFrameTime = getTime();
    if (this.gravityEvent) this.gravityEvent.enabled = true;

    this.displayTomatoStep();
  }

  protected displayStep(): void {
    this.displayTomatoStep();
  }

  private displayTomatoStep(): void {
    const stepIdx = this.currentStep;
    if (stepIdx < 0 || stepIdx >= TOMATO_STEPS.length) return;

    const step = TOMATO_STEPS[stepIdx];
    const stepNum = stepIdx + 1;
    const total = TOMATO_STEPS.length;

    // Hide ALL models first, then show only what this step needs
    this.hideAllModels();
    if (this.modelContainer) this.modelContainer.enabled = true;
    for (let m = 0; m < step.showModels.length; m++) {
      this.setModelVisible(step.showModels[m], true);
    }

    // Update rich HUD
    if (this.stepTitleText) this.stepTitleText.text = "STEP " + stepNum + " / " + total;
    if (this.stepDescriptionText) this.stepDescriptionText.text = step.title;
    if (this.instructionText) this.instructionText.text = step.instruction;
    if (this.therapistNoteText) this.therapistNoteText.text = step.therapistNote;

    // Update nav button visibility
    this.updateNavButtons();

    // Start highlight pulse on the focus model
    this.pulseCount = 0;
    this.triggerHighlightPulse(step.highlightModel);

    // Step entrance animation
    if (this.stepAnimEvent) this.stepAnimEvent.reset(0.3);

    print("[" + TAG + "] Step " + stepNum + ": " + step.title);
  }

  // ==================== GRAVITY ====================

  private computeTableSurfaceY(): void {
    // Get the table top Y position (table position + approximate height of table mesh)
    if (this.tableModel) {
      const tablePos = this.tableModel.getTransform().getLocalPosition();
      const tableScale = this.tableModel.getTransform().getLocalScale();
      // Table mesh is roughly 10 units tall at scale 1.0, surface is at top
      this.tableSurfaceY = tablePos.y + (5 * tableScale.y);
      print("[" + TAG + "] Table surface Y: " + this.tableSurfaceY);
    } else if (this.plateModel) {
      const platePos = this.plateModel.getTransform().getLocalPosition();
      this.tableSurfaceY = platePos.y;
    } else {
      this.tableSurfaceY = -3;
    }
  }

  private updateGravity(): void {
    if (!this.tomatoGravityActive || !this.tomatoModel) return;

    const now = getTime();
    const dt = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Clamp dt to avoid physics explosion on lag spikes
    const clampedDt = Math.min(dt, 0.05);

    const t = this.tomatoModel.getTransform();
    const pos = t.getLocalPosition();

    // Apply gravity acceleration
    this.tomatoVelocityY += GRAVITY * clampedDt;
    let newY = pos.y + this.tomatoVelocityY * clampedDt;

    // Collision with table surface (+ tomato radius offset)
    const tomatoRadius = 1.5;  // approximate radius at current scale
    const floorY = this.tableSurfaceY + tomatoRadius;

    if (newY <= floorY) {
      newY = floorY;
      // Bounce with damping or settle
      if (Math.abs(this.tomatoVelocityY) < 5) {
        // Settled
        this.tomatoVelocityY = 0;
        this.tomatoGravityActive = false;
        if (this.gravityEvent) this.gravityEvent.enabled = false;
        print("[" + TAG + "] Tomato settled on surface at Y=" + newY);
      } else {
        // Bounce
        this.tomatoVelocityY = -this.tomatoVelocityY * BOUNCE_DAMPING;
      }
    }

    t.setLocalPosition(new vec3(pos.x, newY, pos.z));
  }

  // ==================== NAV BUTTONS ====================

  private updateNavButtons(): void {
    if (this.prevButton) {
      const so = this.prevButton.getSceneObject ? this.prevButton.getSceneObject() : null;
      if (so) so.enabled = this.currentStep > 0;
    }
  }

  // ==================== MODEL VISIBILITY ====================

  private hideAllModels(): void {
    if (this.tomatoModel) this.tomatoModel.enabled = false;
    if (this.knifeModel) this.knifeModel.enabled = false;
    if (this.cuttingBoardModel) this.cuttingBoardModel.enabled = false;
    if (this.slicerObject) this.slicerObject.enabled = false;
    if (this.plateModel) this.plateModel.enabled = false;
    if (this.tableModel) this.tableModel.enabled = false;
  }

  private setModelVisible(name: string, visible: boolean): void {
    switch (name) {
      case "tomato": if (this.tomatoModel) this.tomatoModel.enabled = visible; break;
      case "knife":  if (this.knifeModel)  this.knifeModel.enabled  = visible; break;
      case "board":  if (this.cuttingBoardModel) this.cuttingBoardModel.enabled = visible; break;
      case "slicer": if (this.slicerObject) this.slicerObject.enabled = visible; break;
      case "plate":  if (this.plateModel)  this.plateModel.enabled  = visible; break;
      case "table":  if (this.tableModel)  this.tableModel.enabled  = visible; break;
    }
  }

  private getModelByName(name: string): SceneObject | null {
    switch (name) {
      case "tomato": return this.tomatoModel;
      case "knife":  return this.knifeModel;
      case "board":  return this.cuttingBoardModel;
      case "slicer": return this.slicerObject;
      case "plate":  return this.plateModel;
      case "table":  return this.tableModel;
    }
    return null;
  }

  // ==================== HIGHLIGHT PULSE ====================

  private currentHighlightTarget: string = "";

  private triggerHighlightPulse(modelName: string): void {
    this.currentHighlightTarget = modelName;
    this.pulseCount = 0;
    if (this.highlightAnimEvent) this.highlightAnimEvent.reset(0.2);
  }

  private onHighlightPulse(): void {
    const target = this.getModelByName(this.currentHighlightTarget);
    if (!target) return;

    this.pulseCount++;
    const t = target.getTransform();
    const baseScale = t.getLocalScale();

    t.setLocalScale(baseScale.uniformScale(1.2));

    const resetEvt = this.createEvent("DelayedCallbackEvent");
    resetEvt.bind(() => {
      if (target) t.setLocalScale(baseScale);
      if (this.pulseCount < this.MAX_PULSES && this.highlightAnimEvent) {
        this.highlightAnimEvent.reset(0.4);
      }
    });
    (resetEvt as any).reset(0.2);
  }

  // ==================== STEP NAVIGATION ====================

  private onPrevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.displayTomatoStep();
      print("[" + TAG + "] -> Previous step");
    }
  }

  private onNextStep(): void {
    if (this.currentStep >= TOMATO_STEPS.length - 1) {
      this.triggerCompletion();
    } else {
      this.currentStep++;
      this.displayTomatoStep();
      print("[" + TAG + "] -> Next step");
    }
  }

  // ==================== COMPLETION ====================

  private triggerCompletion(): void {
    print("[" + TAG + "] All steps complete!");

    if (this.timerEvent) this.timerEvent.enabled = false;
    if (this.gravityEvent) this.gravityEvent.enabled = false;
    if (this.stepCard) this.stepCard.enabled = false;
    if (this.buttonBar) this.buttonBar.enabled = false;
    if (this.completionPanel) this.completionPanel.enabled = true;

    const elapsed = Math.round(getTime() - this.exerciseStartTime);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = mins + "m " + secs + "s";

    if (this.completionText) {
      this.completionText.text =
        "EXERCISE COMPLETE!\n\n" +
        "Tomato Prep\n" +
        "All " + TOMATO_STEPS.length + " steps finished\n" +
        "Time: " + timeStr + "\n\n" +
        "Great job! You practiced safe\n" +
        "knife skills and food prep.\n\n" +
        "Returning to dashboard...";
    }

    if (this.modelContainer) this.modelContainer.enabled = true;
    if (this.tableModel) this.tableModel.enabled = true;
    if (this.plateModel) this.plateModel.enabled = true;
    if (this.tomatoModel) this.tomatoModel.enabled = true;
    if (this.knifeModel) this.knifeModel.enabled = true;

    if (this.completionAnimEvent) this.completionAnimEvent.reset(3.5);
  }

  private onCompletionAnimDone(): void {
    if (this.onCompleteCallback && this.exerciseData) {
      this.onCompleteCallback(this.exerciseData.id);
    }
  }

  // ==================== HUD HELPERS ====================

  private updateTimer(): void {
    const elapsed = Math.floor(getTime() - this.exerciseStartTime);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
    if (this.headerTimerText) this.headerTimerText.text = timeStr;
  }

  private bindBtn(btn: any, cb: () => void): void {
    if (!btn) return;
    if (btn.onTriggerUp)     { btn.onTriggerUp.add(cb);     return; }
    if (btn.onButtonPinched) { btn.onButtonPinched.add(cb);  return; }
    if (btn.onTriggerEnd)    { btn.onTriggerEnd.add(cb);     return; }
    if (btn.onTriggerStart)  { btn.onTriggerStart.add(cb);   return; }
  }

  private onStepAnimComplete(): void {
    print("[" + TAG + "] Step transition complete for step " + (this.currentStep + 1));
  }

  // ==================== CLEANUP ====================

  protected exitExercise(): void {
    print("[" + TAG + "] Exiting exercise");
    if (this.timerEvent) this.timerEvent.enabled = false;
    if (this.gravityEvent) this.gravityEvent.enabled = false;
    this.tomatoGravityActive = false;
    super.exitExercise();
  }
}
