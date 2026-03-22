/**
 * TomatoPrepExercise.ts
 * Implements the Tomato Prep exercise with 4 steps:
 * 1. Grab tomato → place on table
 * 2. Grab knife
 * 3. Place knife on tomato
 * 4. Cut it (SDF slice animation)
 */

import { ExerciseController } from "./ExerciseController";
import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

@component
export class TomatoPrepExercise extends ExerciseController {
  @ui.group_start("Tomato Prep Objects")
  @input
  tomato: RenderMeshVisual;

  @input
  knife: RenderMeshVisual;

  @input
  countertop: RenderMeshVisual;

  @input
  sdfSlicerPlane: RenderMeshVisual;
  @ui.group_end

  private tomatoInteractable: Interactable | null = null;
  private knifeInteractable: Interactable | null = null;
  private isStep1Done: boolean = false;
  private isStep2Done: boolean = false;
  private isStep3Done: boolean = false;

  onAwake() {
    super.onAwake();
  }

  protected initialize(): void {
    super.initialize();
    print("[TomatoPrepExercise] Initialized");
  }

  protected onExerciseStart(): void {
    print("[TomatoPrepExercise] Starting tomato prep exercise");

    // Reset state
    this.isStep1Done = false;
    this.isStep2Done = false;
    this.isStep3Done = false;

    // Disable SDF slicer initially
    if (this.sdfSlicerPlane) {
      this.sdfSlicerPlane.sceneObject.enabled = false;
    }

    // Get interactables
    if (this.tomato) {
      this.tomatoInteractable = this.tomato.sceneObject.getComponent(
        <any>Interactable.getTypeName()
      ) as Interactable;
    }

    if (this.knife) {
      this.knifeInteractable = this.knife.sceneObject.getComponent(
        <any>Interactable.getTypeName()
      ) as Interactable;
    }

    // Set up step 1 interaction
    this.setupStep1();
  }

  /**
   * Step 1: Grab tomato and place on table.
   */
  private setupStep1(): void {
    print("[TomatoPrepExercise] Setting up step 1");

    if (!this.tomatoInteractable) {
      print("[TomatoPrepExercise] ERROR: tomato interactable not found");
      return;
    }

    // Listen to tomato trigger
    this.tomatoInteractable.onTriggerEnd.add(() => {
      if (!this.isStep1Done) {
        // Check if tomato is roughly on the countertop
        // For MVP: just mark as done on trigger
        this.completeStep1();
      }
    });
  }

  private completeStep1(): void {
    print("[TomatoPrepExercise] Step 1 complete");
    this.isStep1Done = true;

    // Enable knife for step 2
    this.setupStep2();

    // Advance to next step
    this.onStepComplete();
  }

  /**
   * Step 2: Grab knife.
   */
  private setupStep2(): void {
    print("[TomatoPrepExercise] Setting up step 2");

    if (!this.knifeInteractable) {
      print("[TomatoPrepExercise] ERROR: knife interactable not found");
      return;
    }

    // Listen to knife trigger
    this.knifeInteractable.onTriggerEnd.add(() => {
      if (!this.isStep2Done) {
        this.completeStep2();
      }
    });
  }

  private completeStep2(): void {
    print("[TomatoPrepExercise] Step 2 complete");
    this.isStep2Done = true;

    this.setupStep3();
    this.onStepComplete();
  }

  /**
   * Step 3: Place knife on tomato.
   * For MVP: sustain knife above tomato for 1 second.
   */
  private setupStep3(): void {
    print("[TomatoPrepExercise] Setting up step 3");

    if (!this.knifeInteractable) {
      return;
    }

    // Listen for knife position proximity to tomato
    // For MVP: simplified — just trigger on sustained hold
    const holdStartTime = 0.0;
    const holdDuration = 1.0; // 1 second

    let holdEvent: any = null;

    const checkProximity = () => {
      if (!this.isStep3Done && this.tomato && this.knife) {
        const tomatoPos = this.tomato.sceneObject.getTransform().getWorldPosition();
        const knifePos = this.knife.sceneObject.getTransform().getWorldPosition();

        const distance = tomatoPos.sub(knifePos).length;
        // Within 0.5 units (50cm AR distance)
        if (distance < 0.5) {
          // Start hold timer
          if (holdEvent === null) {
            print(
              "[TomatoPrepExercise] Knife in position, waiting for sustained hold..."
            );
            holdEvent = this.createEvent("DelayedCallbackEvent");
            holdEvent.bind(() => {
              this.completeStep3();
            });
            holdEvent.reset(holdDuration);
          }
        } else {
          // Out of range, reset timer
          if (holdEvent !== null) {
            holdEvent = null;
          }
        }
      }
    };

    // Check proximity continuously (Phase 2: use a proper update loop)
    const updateEvent = this.createEvent("UpdateEvent");
    updateEvent.bind(checkProximity);
  }

  private completeStep3(): void {
    print("[TomatoPrepExercise] Step 3 complete");
    this.isStep3Done = true;

    // Enable SDF slicer for step 4
    if (this.sdfSlicerPlane) {
      this.sdfSlicerPlane.sceneObject.enabled = true;
    }

    this.setupStep4();
    this.onStepComplete();
  }

  /**
   * Step 4: Cut it (SDF slice animation).
   * SDF slicer plane moves on touch input.
   */
  private setupStep4(): void {
    print("[TomatoPrepExercise] Setting up step 4");

    if (!this.sdfSlicerPlane) {
      print("[TomatoPrepExercise] ERROR: SDF slicer not found");
      return;
    }

    // Listen to touch move events on plane
    // The SDF Slice Script.js handles the plane movement
    // We just need to detect when slicing is complete (plane at bottom)

    const checkSliceProgress = () => {
      if (!this.isStep3Done) {
        return; // Only after step 3
      }

      // Get plane local Z position (0 = top, 1 = bottom of tomato)
      const planePos = this.sdfSlicerPlane.sceneObject
        .getTransform()
        .getLocalPosition();

      // When plane reaches bottom (Z ≈ -1), consider step done
      if (planePos.z < -0.8) {
        this.completeStep4();
      }
    };

    const updateEvent = this.createEvent("UpdateEvent");
    updateEvent.bind(checkSliceProgress);
  }

  private completeStep4(): void {
    print("[TomatoPrepExercise] Step 4 complete - Exercise done!");
    this.onStepComplete(); // This will call onExerciseComplete()
  }
}
