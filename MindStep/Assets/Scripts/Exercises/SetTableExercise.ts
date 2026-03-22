/**
 * SetTableExercise.ts
 * Implements the Set the Table exercise with 4 steps:
 * 1. Grab plate → snap to center of table
 * 2. Grab fork → snap to left of plate
 * 3. Grab knife → snap to right of plate
 * 4. Grab glass → snap to top-right
 */

import { ExerciseController } from "./ExerciseController";
import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";

interface Utensil {
  name: string;
  renderMesh: RenderMeshVisual;
  targetPosition: vec3;
  targetRotation: quat;
  snapDistance: number;
  interactable: Interactable | null;
  isPlaced: boolean;
}

@component
export class SetTableExercise extends ExerciseController {
  @ui.group_start("Set Table Objects")
  @input
  plate: RenderMeshVisual;

  @input
  fork: RenderMeshVisual;

  @input
  knife: RenderMeshVisual;

  @input
  glass: RenderMeshVisual;

  @input
  diningTable: RenderMeshVisual;
  @ui.group_end

  @ui.group_start("Snap Targets")
  @input
  plateCenterPosition: vec3 = new vec3(0, 0, 0);

  @input
  forkLeftPosition: vec3 = new vec3(-2, 0, 0);

  @input
  knifeRightPosition: vec3 = new vec3(2, 0, 0);

  @input
  glassTopRightPosition: vec3 = new vec3(2, 1, 0);

  @input
  snapTolerance: number = 0.5;
  @ui.group_end

  private utensils: Utensil[] = [];
  private currentUtensil: number = 0;
  private snapAnimationCancel: any = null;

  onAwake() {
    super.onAwake();
  }

  protected initialize(): void {
    super.initialize();
    print("[SetTableExercise] Initialized");
  }

  protected onExerciseStart(): void {
    print("[SetTableExercise] Starting set the table exercise");

    // Initialize utensils array
    this.utensils = [
      {
        name: "Plate",
        renderMesh: this.plate,
        targetPosition: this.plateCenterPosition,
        targetRotation: quat.fromEulerAngles(0, 0, 0),
        snapDistance: this.snapTolerance,
        interactable: null,
        isPlaced: false
      },
      {
        name: "Fork",
        renderMesh: this.fork,
        targetPosition: this.forkLeftPosition,
        targetRotation: quat.fromEulerAngles(0, 0, 0),
        snapDistance: this.snapTolerance,
        interactable: null,
        isPlaced: false
      },
      {
        name: "Knife",
        renderMesh: this.knife,
        targetPosition: this.knifeRightPosition,
        targetRotation: quat.fromEulerAngles(0, 0, 0),
        snapDistance: this.snapTolerance,
        interactable: null,
        isPlaced: false
      },
      {
        name: "Glass",
        renderMesh: this.glass,
        targetPosition: this.glassTopRightPosition,
        targetRotation: quat.fromEulerAngles(0, 0, 0),
        snapDistance: this.snapTolerance,
        interactable: null,
        isPlaced: false
      }
    ];

    // Get interactables and set up step 1
    this.setupCurrentUtensil();
  }

  /**
   * Set up the current utensil for interaction.
   */
  private setupCurrentUtensil(): void {
    if (this.currentUtensil >= this.utensils.length) {
      print("[SetTableExercise] All utensils placed!");
      return;
    }

    const utensil = this.utensils[this.currentUtensil];
    print("[SetTableExercise] Setting up: " + utensil.name);

    if (!utensil.renderMesh) {
      print("[SetTableExercise] ERROR: " + utensil.name + " mesh not found");
      this.currentUtensil++;
      this.setupCurrentUtensil();
      return;
    }

    // Get interactable component
    utensil.interactable = utensil.renderMesh.sceneObject.getComponent(
      <any>Interactable.getTypeName()
    ) as Interactable;

    if (!utensil.interactable) {
      print("[SetTableExercise] ERROR: " + utensil.name + " interactable not found");
      this.currentUtensil++;
      this.setupCurrentUtensil();
      return;
    }

    // Disable all utensils except current
    for (let i = 0; i < this.utensils.length; i++) {
      if (this.utensils[i].renderMesh) {
        this.utensils[i].renderMesh.sceneObject.enabled = (i === this.currentUtensil);
      }
    }

    // Listen for release/trigger on this utensil
    utensil.interactable.onTriggerEnd.add(() => {
      if (!utensil.isPlaced) {
        this.checkUtensilPlacement(utensil);
      }
    });

    // Update HUD with current step info
    const stepNum = this.currentUtensil + 1;
    if (this.stepText) {
      this.stepText.text =
        "Step " +
        stepNum +
        " of " +
        this.utensils.length +
        ": " +
        this.exerciseData!.steps[this.currentUtensil];
    }
  }

  /**
   * Check if utensil is within snapping distance of target.
   */
  private checkUtensilPlacement(utensil: Utensil): void {
    if (!utensil.renderMesh) {
      return;
    }

    const utensilPos = utensil.renderMesh.sceneObject
      .getTransform()
      .getWorldPosition();
    const distance = utensilPos.sub(utensil.targetPosition).length;

    print(
      "[SetTableExercise] " +
        utensil.name +
        " placement distance: " +
        distance.toFixed(2)
    );

    if (distance <= utensil.snapDistance) {
      // Snap to target
      this.snapUtensilToTarget(utensil);
    } else {
      // Too far, reset
      print("[SetTableExercise] " + utensil.name + " too far from target!");
      if (this.stepText) {
        this.stepText.text =
          "Try again! Place " + utensil.name + " closer to the target position.";
      }
    }
  }

  /**
   * Snap utensil to target position with animation.
   */
  private snapUtensilToTarget(utensil: Utensil): void {
    if (!utensil.renderMesh) {
      return;
    }

    print("[SetTableExercise] Snapping " + utensil.name + " to target");

    utensil.isPlaced = true;

    const startPos = utensil.renderMesh.sceneObject
      .getTransform()
      .getWorldPosition();
    const startRot = utensil.renderMesh.sceneObject
      .getTransform()
      .getWorldRotation();

    const snapDuration = 0.3;
    let elapsed = 0;

    const snapUpdate = () => {
      if (!utensil.renderMesh) {
        return;
      }

      elapsed += 0.016; // ~60 FPS
      const t = Math.min(elapsed / snapDuration, 1.0);

      const newPos = vec3.lerp(startPos, utensil.targetPosition, t);
      const newRot = quat.lerp(startRot, utensil.targetRotation, t);

      utensil.renderMesh.sceneObject.getTransform().setWorldPosition(newPos);
      utensil.renderMesh.sceneObject.getTransform().setWorldRotation(newRot);

      if (t < 1.0) {
        // Continue animation next frame
        const updateEvent = this.createEvent("UpdateEvent");
        updateEvent.bind(snapUpdate);
      } else {
        // Animation complete
        this.onUtensilPlaced(utensil);
      }
    };

    snapUpdate();
  }

  /**
   * Called when a utensil snaps successfully.
   */
  private onUtensilPlaced(utensil: Utensil): void {
    print("[SetTableExercise] " + utensil.name + " placed successfully!");

    // Disable this utensil
    if (utensil.renderMesh) {
      utensil.renderMesh.sceneObject.enabled = false;
    }

    this.currentUtensil++;

    if (this.currentUtensil >= this.utensils.length) {
      // All utensils placed!
      print("[SetTableExercise] All utensils placed!");
      this.onStepComplete();
    } else {
      // Move to next utensil
      this.setupCurrentUtensil();
      this.onStepComplete();
    }
  }
}
