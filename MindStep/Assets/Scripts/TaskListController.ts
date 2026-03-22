/**
 * TaskListController.ts
 * Fetches assignments from Firestore and instantiates TaskItem prefabs.
 * Manages the MyTasks panel in the Dashboard.
 * 3D world-space version - positions items using world transforms (no ScreenTransform).
 *
 * NOTE: Inputs wired by SceneWiring at runtime. No @input decorators to avoid
 * Lens Studio checkUndefined crash when Inspector inputs are unassigned.
 */

import { FirebaseService, FirebaseAssignment } from "./FirebaseService";
import { SessionManager } from "./SessionManager";
import { TaskItem } from "./TaskItem";
import { ExerciseData } from "./ExerciseData";

@component
export class TaskListController extends BaseScriptComponent {
  // Wired by SceneWiring
  taskScrollView: SceneObject | null = null;
  taskItemPrefab: ObjectPrefab | null = null;
  statusText: Text | null = null;
  itemSpacing: number = 5.5;

  private assignments: FirebaseAssignment[] = [];
  private isLoading: boolean = false;
  private hasInitialized = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      // Defer 2 frames so SceneWiring can wire our properties first
      const d1 = this.createEvent("UpdateEvent");
      d1.bind(() => {
        d1.enabled = false;
        const d2 = this.createEvent("UpdateEvent");
        d2.bind(() => {
          d2.enabled = false;
          if (!this.hasInitialized) this.initialize();
        });
      });
    });
  }

  private initialize(): void {
    if (this.hasInitialized) return;
    this.hasInitialized = true;
    print("[TaskListController] Initializing");
    this.fetchAndLoadTasks();
  }

  private async fetchAndLoadTasks(): Promise<void> {
    if (this.isLoading) return;
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

  private populateTaskList(tasks: FirebaseAssignment[]): void {
    const container = this.taskScrollView || this.getSceneObject();

    // Clear existing items
    const existingCount = container.getChildrenCount();
    for (let i = existingCount - 1; i >= 0; i--) {
      container.getChild(i).destroy();
    }

    if (!this.taskItemPrefab) {
      print("[TaskListController] No prefab - using text fallback");
      this.populateTasksFallback(tasks, container);
      return;
    }

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const taskItem = this.taskItemPrefab.instantiate(container);
      taskItem.enabled = true;

      const transform = taskItem.getTransform();
      const localPos = transform.getLocalPosition();
      transform.setLocalPosition(new vec3(localPos.x, -this.itemSpacing * i, localPos.z));

      const taskItemController = taskItem.getComponent("TaskItem" as any) as any as TaskItem;
      if (taskItemController) {
        taskItemController.setAssignment(task);
      }

      print("[TaskListController] Created task item: " + task.exerciseId);
    }
  }

  private populateTasksFallback(tasks: FirebaseAssignment[], container: SceneObject): void {
    if (tasks.length === 0) {
      if (this.statusText) this.statusText.text = "No tasks assigned.";
      return;
    }
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const exercise = ExerciseData.getExercise(task.exerciseId);
      const title = exercise ? exercise.title : task.exerciseId;

      const row = global.scene.createSceneObject("Task_" + title);
      row.setParent(container);
      row.getTransform().setLocalPosition(new vec3(0, -this.itemSpacing * i, 0));

      const t = row.createComponent("Component.Text") as Text;
      t.text =
        title + "\n" +
        task.completedReps + " / " + task.reps + " done" +
        (task.doctorNotes ? "\n" + task.doctorNotes : "");
      t.size = 16;

      print("[TaskListController] Fallback row: " + title);
    }
  }

  refreshTaskList(): void {
    print("[TaskListController] Refreshing task list");
    this.fetchAndLoadTasks();
  }

  getAssignments(): FirebaseAssignment[] {
    return this.assignments;
  }
}
