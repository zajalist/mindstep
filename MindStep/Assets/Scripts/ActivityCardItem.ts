/**
 * ActivityCardItem.ts
 * Represents a single activity card in the Browse grid.
 * Interactive (real exercises) or skeleton placeholder.
 */

// @ts-ignore – SIK module resolved by Lens Studio's package system at runtime
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
  private listenerAttached: boolean = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[ActivityCardItem] Initializing");
  }

  /**
   * Set exercise data for this card. Called by ActivityBrowseController after instantiation.
   */
  setExercise(exerciseId: string, title: string, isSkeleton: boolean): void {
    this.exerciseId = exerciseId;
    this.isSkeleton = isSkeleton;

    if (this.titleText) this.titleText.text = title;

    if (isSkeleton) {
      if (this.difficultyText) this.difficultyText.text = "Coming soon";
      if (this.cardBacking) this.cardBacking.enabled = false;
    } else {
      const exercise = ExerciseData.getExercise(exerciseId);
      if (exercise && this.difficultyText) {
        this.difficultyText.text = exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1);
      }

      if (this.cardBacking && !this.listenerAttached) {
        this.cardBacking.onTriggerEnd.add(() => this.onCardSelected());
        this.listenerAttached = true;
      }
    }
  }

  private onCardSelected(): void {
    if (this.isSkeleton) return;
    print("[ActivityCardItem] Selected: " + this.exerciseId);

    // Use singleton – works even from dynamically-instantiated prefabs
    const ui = MindStepUIManager.getInstance();
    if (ui) {
      ui.transitionToConfirm(this.exerciseId);
    } else {
      print("[ActivityCardItem] Warning: MindStepUIManager not found");
    }
  }

  getExerciseId(): string { return this.exerciseId; }
}
