/**
 * ActivityCardItem.ts
 * Represents a single activity card in the Browse grid.
 * Interactive (first 2), or skeleton placeholder (rest).
 */

import { Interactable } from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable";
import { ExerciseData } from "./ExerciseData";
import { MindStepUIManager } from "./MindStepUIManager";

@component
export class ActivityCardItem extends BaseScriptComponent {
  @ui.group_start("Card UI")
  @input
  titleText: Text;

  @input
  difficultyText: Text;

  @input
  cardBacking: Interactable;

  @input
  iconImage: Image;
  @ui.group_end

  private exerciseId: string = "";
  private isSkeleton: boolean = false;
  private uiManager: MindStepUIManager | null = null;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[ActivityCardItem] Initializing");

    // Find UI manager in scene
    // (Would be set by scene search or dependency injection in full implementation)
  }

  /**
   * Set the exercise data for this card.
   */
  setExercise(exerciseId: string, title: string, isSkeleton: boolean): void {
    this.exerciseId = exerciseId;
    this.isSkeleton = isSkeleton;

    // Update UI
    if (this.titleText) {
      this.titleText.text = title;
    }

    if (isSkeleton) {
      // Skeleton styling
      if (this.difficultyText) {
        this.difficultyText.text = "Not yet available";
      }

      // Disable interactable for skeleton
      if (this.cardBacking) {
        this.cardBacking.sceneObject.enabled = false;
      }

      // Apply grayed-out style (Phase 2: implement visual)
      print("[ActivityCardItem] Set as skeleton: " + title);
    } else {
      // Real exercise: show difficulty
      const exercise = ExerciseData.getExercise(exerciseId);
      if (exercise && this.difficultyText) {
        this.difficultyText.text = "Difficulty: " + exercise.difficulty;
      }

      // Enable interactable
      if (this.cardBacking) {
        this.cardBacking.onTriggerEnd.add(() => {
          this.onCardSelected();
        });
      }

      print("[ActivityCardItem] Set as real exercise: " + title);
    }
  }

  /**
   * Called when card is selected (trigger on backing Interactable).
   */
  private onCardSelected(): void {
    if (this.isSkeleton) {
      print("[ActivityCardItem] Skeleton card clicked (no action)");
      return;
    }

    print("[ActivityCardItem] Exercise selected: " + this.exerciseId);

    // Find and notify MindStepUIManager
    // In a real implementation, this would use dependency injection
    // For now, we'll search the scene
    const rootScene = this.getSceneObject().getParent();
    if (rootScene) {
      const uiManager = rootScene.getComponent(<any>"MindStepUIManager") as any as MindStepUIManager;
      if (uiManager) {
        uiManager.transitionToConfirm(this.exerciseId);
      }
    }
  }

  /**
   * Get exercise ID.
   */
  getExerciseId(): string {
    return this.exerciseId;
  }
}
