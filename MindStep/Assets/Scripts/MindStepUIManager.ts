/**
 * MindStepUIManager.ts
 * Central state machine managing all UI screens (Home, Dashboard, Confirm, Exercise).
 * 3D world-space version – panels are ContainerFrame objects; buttons typed as `any`
 * so they work with both RoundButton (SIK) and RectangleButton (SpectaclesUIKit).
 */

import { SessionManager } from "./SessionManager";
import { ConfirmPanelController } from "./ConfirmPanelController";
import { ExerciseController } from "./Exercises/ExerciseController";

enum UIState {
  Home = "Home",
  Dashboard = "Dashboard",
  Confirm = "Confirm",
  Exercise = "Exercise"
}

enum DashboardTab {
  MyTasks = "MyTasks",
  Browse = "Browse",
  Profile = "Profile"
}

@component
export class MindStepUIManager extends BaseScriptComponent {
  // === Screen Objects ===
  @ui.group_start("Screen Objects")
  @input
  homeScreen: SceneObject | null = null;

  @input
  dashboard: SceneObject | null = null;

  @input
  confirmPanel: SceneObject | null = null;

  @input
  exerciseScene: SceneObject | null = null;
  @ui.group_end

  // === Dashboard Tabs ===
  @ui.group_start("Dashboard Tabs")
  @input
  myTasksTab: any = null;

  @input
  browseTab: any = null;

  @input
  profileTab: any = null;

  @input
  myTasksPanel: SceneObject | null = null;

  @input
  browsePanel: SceneObject | null = null;

  @input
  profilePanel: SceneObject | null = null;
  @ui.group_end

  // === Navigation Buttons ===
  @ui.group_start("Navigation Buttons")
  @input
  homeStartButton: any = null;

  @input
  dashboardBackButton: any = null;

  @input
  confirmBackButton: any = null;

  @input
  confirmStartButton: any = null;

  @input
  exerciseExitButton: any = null;
  @ui.group_end

  // === Internal State ===
  private currentState: UIState = UIState.Home;
  private currentDashboardTab: DashboardTab = DashboardTab.MyTasks;
  private initialized: boolean = false;
  private selectedExerciseId: string = "";

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      const defer = this.createEvent("UpdateEvent");
      defer.bind(() => {
        defer.enabled = false;
        this.initialize();
      });
    });
  }

  private initialize(): void {
    if (this.initialized) return;

    print("[MindStepUIManager] Initializing");

    if (!this.homeScreen || !this.dashboard) {
      print("ERROR: MindStepUIManager - homeScreen and dashboard are required!");
      return;
    }

    const bindButton = (btn: any, callback: () => void) => {
      if (!btn) return;
      // Works with RoundButton (SIK UIStarter) and RectangleButton (SpectaclesUIKit)
      if (btn.onTriggerStart) {
        btn.onTriggerStart.add(callback);
      } else if (btn.onButtonPinched) {
        btn.onButtonPinched.add(callback);
      }
    };

    bindButton(this.homeStartButton, () => this.transitionToDashboard());
    bindButton(this.myTasksTab, () => this.switchDashboardTab(DashboardTab.MyTasks));
    bindButton(this.browseTab, () => this.switchDashboardTab(DashboardTab.Browse));
    bindButton(this.profileTab, () => this.switchDashboardTab(DashboardTab.Profile));
    bindButton(this.dashboardBackButton, () => this.transitionToHome());
    bindButton(this.confirmBackButton, () => {
      this.transitionToDashboard();
      this.switchDashboardTab(DashboardTab.Browse);
    });
    bindButton(this.confirmStartButton, () => this.transitionToExercise(this.selectedExerciseId));
    bindButton(this.exerciseExitButton, () => this.transitionToDashboard());

    this.transitionToHome();

    this.initialized = true;
    print("[MindStepUIManager] Ready");
  }

  private transitionToHome(): void {
    print("[MindStepUIManager] → Home");
    this.currentState = UIState.Home;
    this.hideAllScreens();
    if (this.homeScreen) this.homeScreen.enabled = true;
  }

  private transitionToDashboard(): void {
    print("[MindStepUIManager] → Dashboard");
    this.currentState = UIState.Dashboard;
    this.hideAllScreens();
    if (this.dashboard) this.dashboard.enabled = true;
    this.switchDashboardTab(DashboardTab.MyTasks);
  }

  private switchDashboardTab(tab: DashboardTab): void {
    print("[MindStepUIManager] Tab → " + tab);
    this.currentDashboardTab = tab;
    if (this.myTasksPanel) this.myTasksPanel.enabled = false;
    if (this.browsePanel) this.browsePanel.enabled = false;
    if (this.profilePanel) this.profilePanel.enabled = false;

    switch (tab) {
      case DashboardTab.MyTasks:
        if (this.myTasksPanel) this.myTasksPanel.enabled = true;
        break;
      case DashboardTab.Browse:
        if (this.browsePanel) this.browsePanel.enabled = true;
        break;
      case DashboardTab.Profile:
        if (this.profilePanel) this.profilePanel.enabled = true;
        break;
    }
  }

  transitionToConfirm(exerciseId: string): void {
    print("[MindStepUIManager] → Confirm: " + exerciseId);
    this.currentState = UIState.Confirm;
    this.selectedExerciseId = exerciseId;
    if (this.dashboard) this.dashboard.enabled = false;
    if (this.confirmPanel) this.confirmPanel.enabled = true;

    const confirmController = this.confirmPanel?.getComponent(<any>"ConfirmPanelController") as any as ConfirmPanelController;
    if (confirmController) {
      confirmController.setSelectedExercise(exerciseId);
    }
  }

  private transitionToExercise(exerciseId: string): void {
    print("[MindStepUIManager] → Exercise: " + exerciseId);
    this.currentState = UIState.Exercise;
    this.hideAllScreens();
    if (this.exerciseScene) this.exerciseScene.enabled = true;

    const exerciseController = this.exerciseScene?.getComponent(<any>"ExerciseController") as any as ExerciseController;
    if (exerciseController) {
      exerciseController.startExercise(exerciseId);
    }
  }

  onExerciseComplete(exerciseId: string): void {
    print("[MindStepUIManager] Exercise complete: " + exerciseId);
    this.transitionToDashboard();
  }

  private hideAllScreens(): void {
    if (this.homeScreen) this.homeScreen.enabled = false;
    if (this.dashboard) this.dashboard.enabled = false;
    if (this.confirmPanel) this.confirmPanel.enabled = false;
    if (this.exerciseScene) this.exerciseScene.enabled = false;
  }

  getCurrentState(): UIState { return this.currentState; }
  getCurrentDashboardTab(): DashboardTab { return this.currentDashboardTab; }
}
