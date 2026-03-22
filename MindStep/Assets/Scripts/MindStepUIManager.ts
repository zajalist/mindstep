/**
 * MindStepUIManager.ts
 * Central state machine managing all UI screens.
 * Also performs auto-wiring of all scene references (previously SceneWiring.ts).
 * 3D world-space: panels are SceneObjects with fixed world transforms (NOT headlocked).
 * Exposes static getInstance() so any script can reach it without @input wiring.
 */

import { SessionManager } from "./SessionManager";
import { ConfirmPanelController } from "./ConfirmPanelController";
import { ExerciseController } from "./Exercises/ExerciseController";
import { TomatoPrepExercise } from "./Exercises/TomatoPrepExercise";
import { LoginController } from "./LoginController";
import { DevlogModal } from "./DevlogModal";
import { TaskListController } from "./TaskListController";
import { ActivityBrowseController } from "./ActivityBrowseController";
import { ProfilePanelController } from "./ProfilePanelController";

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
  private static _instance: MindStepUIManager | null = null;
  static getInstance(): MindStepUIManager | null { return MindStepUIManager._instance; }

  // Screen Objects — auto-wired from scene
  homeScreen: SceneObject | null = null;
  dashboard: SceneObject | null = null;
  confirmPanel: SceneObject | null = null;
  exerciseScene: SceneObject | null = null;

  // Dashboard Tabs
  myTasksTab: any = null;
  browseTab: any = null;
  profileTab: any = null;
  myTasksPanel: SceneObject | null = null;
  browsePanel: SceneObject | null = null;
  profilePanel: SceneObject | null = null;

  // Navigation Buttons
  homeStartButton: any = null;
  dashboardBackButton: any = null;
  confirmBackButton: any = null;
  confirmStartButton: any = null;
  exerciseExitButton: any = null;

  welcomeText: Text | null = null;

  private currentState: UIState = UIState.Home;
  private currentDashboardTab: DashboardTab = DashboardTab.MyTasks;
  private initialized = false;
  private selectedExerciseId = "";

  // Scene object name index
  private objectMap: Map<string, SceneObject> = new Map();

  onAwake() {
    MindStepUIManager._instance = this;
    this.createEvent("OnStartEvent").bind(() => {
      // One-frame defer so all other onAwake/OnStart calls complete first
      const defer = this.createEvent("UpdateEvent");
      defer.bind(() => {
        defer.enabled = false;
        if (!this.initialized) {
          this.wireAndInitialize();
        }
      });
    });
  }

  // ==================== AUTO-WIRING (formerly SceneWiring.ts) ====================

  private wireAndInitialize(): void {
    print("[MindStepUIManager] Auto-wiring scene references...");
    this.buildObjectMap();

    // -- Screen containers --
    this.homeScreen    = this.find("Home Screen");
    this.dashboard     = this.find("Dashboard");
    this.confirmPanel  = this.findAny("Confirm Panel", "ConfirmPanel");
    this.exerciseScene = this.findAny("Exercise HUD", "ExerciseScene");
    this.myTasksPanel  = this.find("MyTasksPanel");
    this.browsePanel   = this.find("BrowsePanel");
    this.profilePanel  = this.find("ProfilePanel");

    // -- DevlogModal object --
    const devlogModalObj = this.find("DevlogModal");

    // -- Scroll containers --
    const taskScrollView = this.findAny("TaskScrollView");
    const browseScroll   = this.findAny("ActivityScrollView");
    const browseGrid     = this.findAny("ActivityGrid");

    // -- Buttons --
    const startBtn       = this.find("StartButton");
    const guestBtn       = this.find("GuestButton");
    const loginBtn       = this.find("LoginButton");
    const devlogBtn      = this.find("DevlogButton");
    const dlCloseBtn     = this.find("CloseButton");
    const myTasksTab     = this.find("MyTasksTab");
    const browseTab      = this.find("BrowseTab");
    const profileTab     = this.find("ProfileTab");
    const dashBackBtn    = this.findAny("DashboardBackButton", "DashBackButton");
    const confirmBackBtn = this.find("ConfirmBackButton");
    const confirmStartBtn = this.find("ConfirmStartButton");
    const exitBtn        = this.findAny("ExerciseExitButton", "ExitButton");
    const logoutBtn      = this.findAny("LogoutButton");

    // -- Text components --
    this.welcomeText         = this.findText("WelcomeText");
    const statusText         = this.findText("StatusText");
    const taskStatusText     = this.findText("TaskStatusText");
    const profileNameT       = this.findText("ProfileNameText");
    const profileSessT       = this.findText("ProfileSessionText");
    const profileIdT         = this.findText("ProfileIdText");
    const confirmTitleT      = this.findTextAny("ConfirmTitleText", "ExerciseTitleText");
    const confirmDescT       = this.findTextAny("ConfirmDescText", "ExerciseDescriptionText");
    const stepText           = this.findText("StepText");
    const progressDots       = this.findTextAny("ProgressDotsText", "ProgressDotsImage");
    const devlogVerT         = this.findText("VersionText");

    // -- Wire button proxies --
    this.myTasksTab          = this.buttonProxy(myTasksTab);
    this.browseTab           = this.buttonProxy(browseTab);
    this.profileTab          = this.buttonProxy(profileTab);
    this.homeStartButton     = this.buttonProxy(startBtn) || this.buttonProxy(guestBtn);
    this.dashboardBackButton = this.buttonProxy(dashBackBtn);
    this.confirmBackButton   = this.buttonProxy(confirmBackBtn);
    this.confirmStartButton  = this.buttonProxy(confirmStartBtn);
    this.exerciseExitButton  = this.buttonProxy(exitBtn);

    // -- Wire LoginController --
    const lc = this.getComp<LoginController>(this.homeScreen, LoginController.getTypeName());
    if (lc) {
      lc.guestButton  = this.buttonProxy(guestBtn);
      lc.loginButton  = this.buttonProxy(loginBtn);
      lc.statusText   = statusText;
      lc.devlogButton = this.buttonProxy(devlogBtn);
      print("[MindStepUIManager] LoginController wired");
    }

    // -- Wire DevlogModal --
    const dm = this.getComp<DevlogModal>(devlogModalObj, DevlogModal.getTypeName());
    if (dm) {
      dm.modalRoot           = devlogModalObj;
      dm.versionText         = devlogVerT;
      dm.changelogScrollView = this.findAny("ChangelogScrollView");
      dm.closeButton         = this.buttonProxy(dlCloseBtn);
      if (lc) lc.devlogModal = dm;
      dm.rebindButtons();
      print("[MindStepUIManager] DevlogModal wired");
    }

    // Bind LoginController buttons after devlogModal is wired
    if (lc) lc.rebindButtons();

    // -- Wire TaskListController --
    const tlc = this.getComp<TaskListController>(this.myTasksPanel, TaskListController.getTypeName());
    if (tlc) {
      tlc.taskScrollView = taskScrollView;
      tlc.statusText     = taskStatusText;
      tlc.itemSpacing    = 5.5;
      print("[MindStepUIManager] TaskListController wired");
    }

    // -- Wire ActivityBrowseController --
    const abc = this.getComp<ActivityBrowseController>(this.browsePanel, ActivityBrowseController.getTypeName());
    if (abc) {
      abc.activityScrollView   = browseScroll || this.browsePanel;
      abc.gridContainer        = browseGrid || this.browsePanel;
      abc.totalActivitiesCount = 10;
      abc.itemSpacing          = 5.5;
      abc.initialize();
      print("[MindStepUIManager] ActivityBrowseController wired + initialized");
    }

    // -- Wire ConfirmPanelController --
    const cpc = this.getComp<ConfirmPanelController>(this.confirmPanel, ConfirmPanelController.getTypeName());
    if (cpc) {
      cpc.exerciseTitleText       = confirmTitleT;
      cpc.exerciseDescriptionText = confirmDescT;
      print("[MindStepUIManager] ConfirmPanelController wired");
    }

    // -- Wire ProfilePanelController --
    const ppc = this.getComp<ProfilePanelController>(this.profilePanel, ProfilePanelController.getTypeName());
    if (ppc) {
      ppc.nameText        = profileNameT;
      ppc.sessionTypeText = profileSessT;
      ppc.patientIdText   = profileIdT;
      ppc.logoutButton    = this.buttonProxy(logoutBtn);
      print("[MindStepUIManager] ProfilePanelController wired");
    }

    // -- Wire ExerciseController (base + TomatoPrepExercise rich HUD) --
    const ec = this.findExerciseCtrl();
    if (ec) {
      // Rich HUD Text
      (ec as any).headerTitleText     = this.findText("HeaderTitleText");
      (ec as any).headerTimerText     = this.findText("HeaderTimerText");
      (ec as any).stepTitleText       = this.findText("StepTitleText");
      (ec as any).stepDescriptionText = this.findText("StepDescriptionText");
      (ec as any).instructionText     = this.findText("InstructionText");
      (ec as any).therapistNoteText   = this.findText("TherapistNoteText");
      (ec as any).completionText      = this.findText("CompletionText");

      // Navigation: Previous / Next RoundButtons (inside ButtonBar)
      (ec as any).prevButton = this.buttonProxy(this.find("Previous"));
      (ec as any).nextButton = this.buttonProxy(this.find("Next"));

      // ContainerFrame on HUDPanel (for close button)
      const hudPanel = this.find("HUDPanel");
      if (hudPanel) {
        const cf = this.getScriptByName(hudPanel, "ContainerFrame");
        if (cf) {
          (ec as any).containerFrame = cf;
          print("[MindStepUIManager] ContainerFrame wired to exercise");
        }
      }

      // 3D Model containers
      (ec as any).modelContainer    = this.find("ModelContainer");
      (ec as any).tomatoModel       = this.find("TomatoModel");
      (ec as any).knifeModel        = this.find("KnifeModel");
      (ec as any).cuttingBoardModel = this.find("CuttingBoardModel");
      (ec as any).slicerObject      = this.find("SlicerObject");
      (ec as any).plateModel        = this.find("PlateModel");
      (ec as any).tableModel        = this.find("TableModel");

      // HUD Panels
      (ec as any).hudPanel        = hudPanel;
      (ec as any).headerBar       = this.find("HeaderBar");
      (ec as any).stepCard        = this.find("StepCard");
      (ec as any).buttonBar       = this.find("ButtonBar");
      (ec as any).completionPanel = this.find("CompletionPanel");

      print("[MindStepUIManager] ExerciseController + TomatoPrepExercise wired");
    }

    // Now initialize the state machine (bind buttons, set initial state)
    this.initialize();
  }

  // ==================== STATE MACHINE ====================

  initialize(): void {
    if (this.initialized) return;
    print("[MindStepUIManager] Initializing state machine");

    if (!this.homeScreen || !this.dashboard) {
      print("ERROR: MindStepUIManager - homeScreen or dashboard not found in scene!");
      return;
    }

    this.bind(this.homeStartButton,     () => this.transitionToDashboard());
    this.bind(this.myTasksTab,          () => this.switchDashboardTab(DashboardTab.MyTasks));
    this.bind(this.browseTab,           () => this.switchDashboardTab(DashboardTab.Browse));
    this.bind(this.profileTab,          () => this.switchDashboardTab(DashboardTab.Profile));
    this.bind(this.dashboardBackButton, () => this.transitionToHome());
    this.bind(this.confirmBackButton,   () => {
      this.transitionToDashboard();
      this.switchDashboardTab(DashboardTab.Browse);
    });
    this.bind(this.confirmStartButton,  () => this.transitionToExercise(this.selectedExerciseId));
    this.bind(this.exerciseExitButton,  () => this.transitionToDashboard());

    this.transitionToHome();
    this.initialized = true;
    print("[MindStepUIManager] Ready");
  }

  private bind(btn: any, cb: () => void): void {
    if (!btn) return;
    if (btn.onTriggerUp)      { btn.onTriggerUp.add(cb);      return; }
    if (btn.onButtonPinched)  { btn.onButtonPinched.add(cb);  return; }
    if (btn.onTriggerStart)   { btn.onTriggerStart.add(cb);   return; }
    if (btn.onTriggerEnd)     { btn.onTriggerEnd.add(cb);     return; }
    print("[MindStepUIManager] Warning: no known event on button");
  }

  transitionToHome(): void {
    print("[MindStepUIManager] -> Home");
    this.currentState = UIState.Home;
    this.hideAll();
    if (this.homeScreen) this.homeScreen.enabled = true;
    this.refreshWelcome();
  }

  transitionToDashboard(): void {
    print("[MindStepUIManager] -> Dashboard");
    this.currentState = UIState.Dashboard;
    this.hideAll();
    if (this.dashboard) this.dashboard.enabled = true;
    this.switchDashboardTab(DashboardTab.MyTasks);
  }

  switchDashboardTab(tab: DashboardTab): void {
    print("[MindStepUIManager] Tab -> " + tab);
    this.currentDashboardTab = tab;
    if (this.myTasksPanel)  this.myTasksPanel.enabled  = false;
    if (this.browsePanel)   this.browsePanel.enabled   = false;
    if (this.profilePanel)  this.profilePanel.enabled  = false;

    switch (tab) {
      case DashboardTab.MyTasks: if (this.myTasksPanel)  this.myTasksPanel.enabled  = true; break;
      case DashboardTab.Browse:  if (this.browsePanel)   this.browsePanel.enabled   = true; break;
      case DashboardTab.Profile: if (this.profilePanel)  this.profilePanel.enabled  = true; break;
    }
  }

  transitionToConfirm(exerciseId: string): void {
    print("[MindStepUIManager] -> Confirm: " + exerciseId);
    this.currentState = UIState.Confirm;
    this.selectedExerciseId = exerciseId;
    if (this.dashboard)    this.dashboard.enabled    = false;
    if (this.confirmPanel) this.confirmPanel.enabled = true;

    const cc = this.confirmPanel?.getComponent(
      ConfirmPanelController.getTypeName() as any
    ) as ConfirmPanelController | null;
    if (cc) cc.setSelectedExercise(exerciseId);
  }

  private transitionToExercise(exerciseId: string): void {
    if (!exerciseId) return;
    print("[MindStepUIManager] -> Exercise: " + exerciseId);
    this.currentState = UIState.Exercise;
    this.hideAll();
    if (this.exerciseScene) this.exerciseScene.enabled = true;

    const ec = this.findExerciseCtrl();
    if (ec) {
      ec.setOnCompleteCallback(() => this.onExerciseComplete(exerciseId));
      ec.startExercise(exerciseId);
    }
  }

  onExerciseComplete(exerciseId: string): void {
    print("[MindStepUIManager] Exercise complete: " + exerciseId);
    this.transitionToDashboard();
  }

  private hideAll(): void {
    if (this.homeScreen)    this.homeScreen.enabled    = false;
    if (this.dashboard)     this.dashboard.enabled     = false;
    if (this.confirmPanel)  this.confirmPanel.enabled  = false;
    if (this.exerciseScene) this.exerciseScene.enabled = false;
  }

  private refreshWelcome(): void {
    if (this.welcomeText) {
      const user = SessionManager.getInstance().getCurrentUser();
      this.welcomeText.text = "Welcome, " + user.displayName;
    }
  }

  getCurrentState(): string { return this.currentState; }

  // ==================== SCENE HELPERS ====================

  private buildObjectMap(): void {
    const scene = global.scene;
    for (let i = 0; i < scene.getRootObjectsCount(); i++) {
      this.indexObj(scene.getRootObject(i));
    }
    print("[MindStepUIManager] Indexed " + this.objectMap.size + " scene objects");
  }

  private indexObj(obj: SceneObject): void {
    if (!this.objectMap.has(obj.name)) {
      this.objectMap.set(obj.name, obj);
    }
    for (let i = 0; i < obj.getChildrenCount(); i++) {
      this.indexObj(obj.getChild(i));
    }
  }

  private find(name: string): SceneObject | null {
    return this.objectMap.get(name) || null;
  }

  private findAny(...names: string[]): SceneObject | null {
    for (const n of names) {
      const obj = this.objectMap.get(n);
      if (obj) return obj;
    }
    return null;
  }

  private findText(name: string): Text | null {
    const obj = this.find(name);
    return obj ? (obj.getComponent("Component.Text") as Text | null) : null;
  }

  private findTextAny(...names: string[]): Text | null {
    const obj = this.findAny(...names);
    return obj ? (obj.getComponent("Component.Text") as Text | null) : null;
  }

  private getComp<T>(obj: SceneObject | null, typeName: any): T | null {
    if (!obj) return null;
    return obj.getComponent(typeName as any) as unknown as T | null;
  }

  private findExerciseCtrl(): ExerciseController | null {
    if (!this.exerciseScene) return null;
    let ec: any = this.exerciseScene.getComponent(TomatoPrepExercise.getTypeName() as any);
    if (ec) return ec as ExerciseController;
    ec = this.exerciseScene.getComponent(ExerciseController.getTypeName() as any);
    if (ec) return ec as ExerciseController;
    const scripts = this.exerciseScene.getComponents("Component.ScriptComponent");
    for (let i = 0; i < scripts.length; i++) {
      const sc = scripts[i] as any;
      if (sc && typeof sc.startExercise === "function") return sc as ExerciseController;
    }
    print("[MindStepUIManager] WARNING: No ExerciseController found on Exercise HUD");
    return null;
  }

  private getScriptByName(obj: SceneObject, name: string): any {
    const scripts = obj.getComponents("Component.ScriptComponent");
    for (let i = 0; i < scripts.length; i++) {
      const sc = scripts[i] as any;
      if (sc && sc.getTypeName && sc.getTypeName() === name) return sc;
      if (sc && sc.name === name) return sc;
    }
    const c = obj.getComponent(name as any) as any;
    if (c) return c;
    return null;
  }

  private buttonProxy(obj: SceneObject | null): any {
    if (!obj) return null;

    let btn: any = obj.getComponent(
      "SpectaclesUIKit.lspkg/Scripts/Components/Button/RectangleButton" as any
    );
    if (btn) return btn;

    btn = obj.getComponent("RectangleButton" as any);
    if (btn) return btn;

    btn = obj.getComponent(
      "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton" as any
    );
    if (btn) return btn;

    btn = obj.getComponent(
      "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable" as any
    );
    if (btn) return btn;

    const sc = obj.getComponent("Component.ScriptComponent") as any;
    if (sc && (sc.onTriggerUp || sc.onButtonPinched || sc.onTriggerStart)) return sc;

    return obj;
  }
}
