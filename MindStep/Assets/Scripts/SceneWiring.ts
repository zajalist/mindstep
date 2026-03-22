/**
 * SceneWiring.ts
 * Attach to the MindStep root object. Runs one frame after OnStart so all
 * script onAwake() calls have completed. Finds every named scene object and
 * auto-wires all @input references -- no manual Inspector drag-and-drop needed.
 *
 * Object names expected in the scene (case-sensitive):
 *   Home Screen, Dashboard, Confirm Panel, Exercise HUD
 *   MyTasksPanel, BrowsePanel, ProfilePanel
 *   StartButton, GuestButton, LoginButton, DevlogButton
 *   DevlogModal  ->  CloseButton (child)
 *   MyTasksTab, BrowseTab, ProfileTab
 *   DashboardBackButton, ConfirmBackButton, ConfirmStartButton
 *   ExerciseExitButton, LogoutButton
 *   WelcomeText, StatusText, VersionText, TaskStatusText
 *   ProfileNameText, ProfileSessionText, ProfileIdText
 *   ExerciseTitleText, ExerciseDescriptionText
 *   StepText, ProgressDotsText (or ProgressDotsImage)
 */

import { MindStepUIManager } from "./MindStepUIManager";
import { LoginController } from "./LoginController";
import { DevlogModal } from "./DevlogModal";
import { TaskListController } from "./TaskListController";
import { ActivityBrowseController } from "./ActivityBrowseController";
import { ConfirmPanelController } from "./ConfirmPanelController";
import { ProfilePanelController } from "./ProfilePanelController";
import { ExerciseController } from "./Exercises/ExerciseController";

@component
export class SceneWiring extends BaseScriptComponent {
  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      const defer = this.createEvent("UpdateEvent");
      defer.bind(() => {
        defer.enabled = false;
        this.wire();
      });
    });
  }

  private wire(): void {
    print("[SceneWiring] Auto-wiring scene references...");
    this.buildObjectMap();

    // -- Screen containers -------------------------------------------------------
    const homeScreen    = this.find("Home Screen");
    const dashboard     = this.find("Dashboard");
    const confirmPanel  = this.findAny("Confirm Panel", "ConfirmPanel");
    const exerciseScene = this.findAny("Exercise HUD", "ExerciseScene");
    const myTasksPanel  = this.find("MyTasksPanel");
    const browsePanel   = this.find("BrowsePanel");
    const profilePanel  = this.find("ProfilePanel");

    // -- DevlogModal object (child of Home Screen) --------------------------------
    const devlogModalObj = this.find("DevlogModal");

    // -- Scroll containers --------------------------------------------------------
    const taskScrollView = this.findAny("TaskScrollView");
    const browseScroll   = this.findAny("ActivityScrollView");
    const browseGrid     = this.findAny("ActivityGrid");

    // -- Buttons ------------------------------------------------------------------
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

    // -- Text components ----------------------------------------------------------
    const welcomeText    = this.findText("WelcomeText");
    const statusText     = this.findText("StatusText");
    const taskStatusText = this.findText("TaskStatusText");
    const profileNameT   = this.findText("ProfileNameText");
    const profileSessT   = this.findText("ProfileSessionText");
    const profileIdT     = this.findText("ProfileIdText");
    const confirmTitleT  = this.findTextAny("ConfirmTitleText", "ExerciseTitleText");
    const confirmDescT   = this.findTextAny("ConfirmDescText", "ExerciseDescriptionText");
    const stepText       = this.findText("StepText");
    const progressDots   = this.findTextAny("ProgressDotsText", "ProgressDotsImage");
    const devlogVerT     = this.findText("VersionText");

    // -- MindStepUIManager (singleton -- no object-name dependency) ---------------
    const uim = MindStepUIManager.getInstance();
    if (uim) {
      uim.homeScreen    = homeScreen;
      uim.dashboard     = dashboard;
      uim.confirmPanel  = confirmPanel;
      uim.exerciseScene = exerciseScene;
      uim.myTasksTab    = this.buttonProxy(myTasksTab);
      uim.browseTab     = this.buttonProxy(browseTab);
      uim.profileTab    = this.buttonProxy(profileTab);
      uim.myTasksPanel  = myTasksPanel;
      uim.browsePanel   = browsePanel;
      uim.profilePanel  = profilePanel;
      uim.homeStartButton     = this.buttonProxy(startBtn) || this.buttonProxy(guestBtn);
      uim.dashboardBackButton = this.buttonProxy(dashBackBtn);
      uim.confirmBackButton   = this.buttonProxy(confirmBackBtn);
      uim.confirmStartButton  = this.buttonProxy(confirmStartBtn);
      uim.exerciseExitButton  = this.buttonProxy(exitBtn);
      uim.welcomeText         = welcomeText;
      uim.initialize();
      print("[SceneWiring] MindStepUIManager wired + initialized");
    } else {
      print("[SceneWiring] MindStepUIManager singleton not found -- is it in the scene?");
    }

    // -- LoginController -----------------------------------------------------------
    const lc = this.getComp<LoginController>(homeScreen, LoginController.getTypeName());
    if (lc) {
      lc.guestButton  = this.buttonProxy(guestBtn);
      lc.loginButton  = this.buttonProxy(loginBtn);
      lc.statusText   = statusText;
      lc.devlogButton = this.buttonProxy(devlogBtn);
      print("[SceneWiring] LoginController wired");
    }

    // -- DevlogModal (component is on the DevlogModal child object) ----------------
    const dm = this.getComp<DevlogModal>(devlogModalObj, DevlogModal.getTypeName());
    if (dm) {
      dm.modalRoot          = devlogModalObj;
      dm.versionText        = devlogVerT;
      dm.changelogScrollView = this.findAny("ChangelogScrollView");
      dm.closeButton        = this.buttonProxy(dlCloseBtn);
      if (lc) lc.devlogModal = dm;
      dm.rebindButtons();
      print("[SceneWiring] DevlogModal wired");
    } else {
      print("[SceneWiring] DevlogModal component not found on DevlogModal object");
    }

    // Bind LoginController buttons after devlogModal is wired
    if (lc) lc.rebindButtons();

    // -- TaskListController --------------------------------------------------------
    const tlc = this.getComp<TaskListController>(myTasksPanel, TaskListController.getTypeName());
    if (tlc) {
      tlc.taskScrollView = taskScrollView;
      tlc.statusText     = taskStatusText;
      tlc.itemSpacing    = 5.5;
      print("[SceneWiring] TaskListController wired");
    }

    // -- ActivityBrowseController --------------------------------------------------
    const abc = this.getComp<ActivityBrowseController>(browsePanel, ActivityBrowseController.getTypeName());
    if (abc) {
      // Use browsePanel itself as fallback container if dedicated objects don't exist
      abc.activityScrollView   = browseScroll || browsePanel;
      abc.gridContainer        = browseGrid || browsePanel;
      abc.totalActivitiesCount = 10;
      abc.itemSpacing          = 5.5;
      print("[SceneWiring] ActivityBrowseController wired");
    }

    // -- ConfirmPanelController ----------------------------------------------------
    const cpc = this.getComp<ConfirmPanelController>(confirmPanel, ConfirmPanelController.getTypeName());
    if (cpc) {
      cpc.exerciseTitleText       = confirmTitleT;
      cpc.exerciseDescriptionText = confirmDescT;
      print("[SceneWiring] ConfirmPanelController wired");
    }

    // -- ProfilePanelController ----------------------------------------------------
    const ppc = this.getComp<ProfilePanelController>(profilePanel, ProfilePanelController.getTypeName());
    if (ppc) {
      ppc.nameText        = profileNameT;
      ppc.sessionTypeText = profileSessT;
      ppc.patientIdText   = profileIdT;
      ppc.logoutButton    = this.buttonProxy(logoutBtn);
      print("[SceneWiring] ProfilePanelController wired");
    }

    // -- ExerciseController --------------------------------------------------------
    const ec = exerciseScene
      ? (exerciseScene.getComponent(ExerciseController.getTypeName() as any) as unknown as ExerciseController)
      : null;
    if (ec) {
      (ec as any).stepText          = stepText;
      (ec as any).progressDotsText  = progressDots;
      (ec as any).exitButton        = this.buttonProxy(exitBtn);
      print("[SceneWiring] ExerciseController wired");
    }

    print("[SceneWiring] Wiring complete!");
  }

  // -- Helpers -------------------------------------------------------------------

  private objectMap: Map<string, SceneObject> = new Map();

  private buildObjectMap(): void {
    const scene = global.scene;
    for (let i = 0; i < scene.getRootObjectsCount(); i++) {
      this.indexObj(scene.getRootObject(i));
    }
  }

  private indexObj(obj: SceneObject): void {
    // Only store first occurrence to avoid stale duplicates overwriting correct objects
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

  /** Try multiple name variants. */
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
