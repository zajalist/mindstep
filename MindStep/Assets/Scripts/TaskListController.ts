/**
 * TaskListController.ts
 * Fetches assignments from Firestore and instantiates TaskItem prefabs.
 * Manages the MyTasks panel in the Dashboard.
 * 3D world-space version – positions items using world transforms (no ScreenTransform).
 */

import { FirebaseService, FirebaseAssignment } from "./FirebaseService";
import { SessionManager } from "./SessionManager";
import { TaskItem } from "./TaskItem";

@component
export class TaskListController extends BaseScriptComponent {
  @ui.group_start("Task List Setup")
  @input
  @hint("ScrollView container for task items")
  taskScrollView: SceneObject | null = null;

  @input
  @hint("Prefab to instantiate for each task")
  taskItemPrefab: ObjectPrefab | null = null;

  @input
  @hint("Text to show loading state")
  statusText: Text | null = null;

  @input
  @hint("Vertical spacing between task items in cm")
  itemSpacing: number = 5.5;
  @ui.group_end

  private assignments: FirebaseAssignment[] = [];
  private isLoading: boolean = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[TaskListController] Initializing");
    this.fetchAndLoadTasks();
  }

  /**
   * Fetch assignments from Firestore and populate the task list.
   */
  private async fetchAndLoadTasks(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const sessionManager = SessionManager.getInstance();
    const currentUser = sessionManager.getCurrentUser();

    print("[TaskListController] Fetching tasks for user: " + currentUser.userId);

    if (this.statusText) {
      this.statusText.text = "Loading tasks...";
    }

    try {
      const tasks = await FirebaseService.fetchAssignments(currentUser.userId);

      this.assignments = tasks;

      print("[TaskListController] Fetched " + tasks.length + " tasks");

      this.populateTaskList(tasks);

      if (this.statusText) {
        this.statusText.text = tasks.length > 0 ? "" : "No tasks assigned.";
      }
    } catch (error) {
      print("[TaskListController] Error fetching tasks: " + error);

      if (this.statusText) {
        this.statusText.text = "Failed to load tasks. Check internet and refresh.";
      }
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Instantiate TaskItem prefabs for each assignment.
   * Uses world-space positioning (no ScreenTransform).
   */
  private populateTaskList(tasks: FirebaseAssignment[]): void {
    if (!this.taskScrollView || !this.taskItemPrefab) {
      print("[TaskListController] Missing scroll view or prefab");
      return;
    }

    // Clear existing items
    const children = this.taskScrollView.getChildrenCount();
    for (let i = children - 1; i >= 0; i--) {
      const child = this.taskScrollView.getChild(i);
      child.destroy();
    }

    // Instantiate prefab for each task
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      const taskItem = this.taskItemPrefab.instantiate(this.taskScrollView);
      taskItem.enabled = true;

      // Position in world space (SIK ScrollView handles layout via GridContentCreator)
      const transform = taskItem.getTransform();
      const localPos = transform.getLocalPosition();
      transform.setLocalPosition(new vec3(localPos.x, -this.itemSpacing * i, localPos.z));

      const taskItemController = taskItem.getComponent(<any>"TaskItem") as any as TaskItem;
      if (taskItemController) {
        taskItemController.setAssignment(task);
      }

      print("[TaskListController] Created task item: " + task.exerciseId);
    }
  }

  /**
   * Refresh task list (called when task is completed).
   */
  refreshTaskList(): void {
    print("[TaskListController] Refreshing task list");
    this.fetchAndLoadTasks();
  }

  /**
   * Get assignments (for external queries).
   */
  getAssignments(): FirebaseAssignment[] {
    return this.assignments;
  }
}
