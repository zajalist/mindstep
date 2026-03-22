/**
 * ActivityBrowseController.ts
 * Manages the Browse tab in Dashboard.
 * Instantiates activity card items using GridContentCreator pattern.
 * First 2 items are interactive; rest are skeleton placeholders.
 * 3D world-space version – positions items using world transforms (no ScreenTransform).
 */

import { ExerciseData } from "./ExerciseData";
import { ActivityCardItem } from "./ActivityCardItem";

@component
export class ActivityBrowseController extends BaseScriptComponent {
  @ui.group_start("Activity Browse Setup")
  @input
  @hint("ScrollView container for activity cards")
  activityScrollView: SceneObject | null = null;

  @input
  @hint("Prefab to instantiate for each activity")
  activityCardPrefab: ObjectPrefab | null = null;

  @input
  @hint("Parent container for grid layout")
  gridContainer: SceneObject | null = null;

  @input
  @hint("Total activities to show (2 real + N skeleton)")
  totalActivitiesCount: number = 10;

  @input
  @hint("Vertical spacing between cards in cm")
  itemSpacing: number = 5.5;
  @ui.group_end

  private allExercises: any[] = [];

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[ActivityBrowseController] Initializing");
    this.loadActivities();
  }

  /**
   * Load all activities and populate the grid.
   */
  private loadActivities(): void {
    const realExercises = ExerciseData.getAllExercises();

    print("[ActivityBrowseController] Found " + realExercises.length + " real exercises");

    this.allExercises = [];

    for (let i = 0; i < realExercises.length; i++) {
      this.allExercises.push({
        exerciseId: realExercises[i].id,
        title: realExercises[i].title,
        difficulty: realExercises[i].difficulty,
        isSkeleton: false
      });
    }

    const skeletonCount = this.totalActivitiesCount - realExercises.length;
    for (let i = 0; i < skeletonCount; i++) {
      this.allExercises.push({
        exerciseId: "skeleton_" + i,
        title: "Coming Soon",
        difficulty: "unknown",
        isSkeleton: true
      });
    }

    print("[ActivityBrowseController] Total activities: " + this.allExercises.length);

    this.populateActivityGrid();
  }

  /**
   * Instantiate activity card items.
   * Uses world-space positioning (no ScreenTransform).
   */
  private populateActivityGrid(): void {
    if (!this.gridContainer || !this.activityCardPrefab) {
      print("[ActivityBrowseController] Missing grid container or prefab");
      return;
    }

    for (let i = 0; i < this.allExercises.length; i++) {
      const activity = this.allExercises[i];

      const cardItem = this.activityCardPrefab.instantiate(this.gridContainer);
      cardItem.enabled = true;

      // Position in world space
      const transform = cardItem.getTransform();
      const localPos = transform.getLocalPosition();
      transform.setLocalPosition(new vec3(localPos.x, -this.itemSpacing * i, localPos.z));

      const cardController = cardItem.getComponent(<any>"ActivityCardItem") as any as ActivityCardItem;
      if (cardController) {
        cardController.setExercise(activity.exerciseId, activity.title, activity.isSkeleton);
      }

      print(
        "[ActivityBrowseController] Created card: " +
          activity.title +
          (activity.isSkeleton ? " (skeleton)" : "")
      );
    }
  }

  /**
   * Get all activities.
   */
  getAllActivities(): any[] {
    return this.allExercises;
  }
}
