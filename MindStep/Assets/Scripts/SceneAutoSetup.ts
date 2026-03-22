/**
 * SceneAutoSetup.ts
 * Attach to ONE empty SceneObject in Lens Studio and run the lens.
 * Creates the full 3D world-space UI object hierarchy with Text labels.
 *
 * After it runs, open the Hierarchy panel in Lens Studio and:
 *  1. Attach the correct Script component to each object (see console output)
 *  2. Attach the SIK Interaction Manager + Hand Visuals prefab to the scene root
 *  3. Replace Text button objects with SIK PinchButton prefabs (same names)
 *  4. Run SceneWiring.ts (attach to UIRoot) to auto-connect all @input fields
 *
 * World layout (Spectacles, 80 cm from origin, not headlocked):
 *   Y=10 (eye level)  Z=-80 (in front)
 */

// World-space layout constants (cm)
const Z = -80;   // 80 cm in front of world origin
const Y =  10;   // slight upward offset for comfortable viewing

@component
export class SceneAutoSetup extends BaseScriptComponent {
  @input
  @hint("Set true once to build — auto-resets to false after build")
  buildNow: boolean = true;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      if (!this.buildNow) {
        print("[SceneAutoSetup] buildNow=false — skipping rebuild.");
        return;
      }
      this.build();
      this.buildNow = false;
    });
  }

  // ── Builder ───────────────────────────────────────────────────────────────

  private build(): void {
    print("[SceneAutoSetup] Building world-space hierarchy...");

    // ── Session Manager ───────────────────────────────────────────────────
    const smObj = this.obj("SessionManager");
    // → Attach: SessionManager.ts

    // ── UI Root (world-space anchor, NOT parented to camera) ──────────────
    const uiRoot = this.obj("UIRoot");
    this.worldPos(uiRoot, 0, Y, Z);
    // → Attach: MindStepUIManager.ts + SceneWiring.ts

    // ── Home Screen ───────────────────────────────────────────────────────
    const homeScreen = this.child(uiRoot, "HomeScreen");
    // → Attach: LoginController.ts

    this.text(homeScreen, "LogoText", "MindStep", 32,       0,  9, 0);
    this.text(homeScreen, "WelcomeText", "Welcome!", 20,    0,  4, 0);

    const devlogModal = this.child(homeScreen, "DevlogModal");
    // → Attach: DevlogModal.ts
    devlogModal.enabled = false;
    this.text(devlogModal, "VersionText", "V.0.0.3", 16,   0,  5, 0);
    const dlScroll = this.child(devlogModal, "ChangelogScrollView");
    this.text(dlScroll, "ChangelogContent",
      "0.0.3\n• World-space UI\n• Firebase live data\n• Guest login\n• Task list & browse\n• Exercise framework",
      14, 0, 0, 0);
    this.text(devlogModal, "DevlogCloseButton", "[✕ Close]",   16,  0, -7, 0);
    // ^ Replace with PinchButton named "DevlogCloseButton"

    this.text(homeScreen, "DevlogButton",  "Devlog",           16,  0, -7,  0);
    this.text(homeScreen, "LoginButton",   "Sign In",          18, -7, -11, 0);
    this.text(homeScreen, "GuestButton",   "▶ Start as Guest", 18,  7, -11, 0);
    this.text(homeScreen, "StatusText",    "",                 14,  0, -14, 0);
    // ^ Replace LoginButton + GuestButton with PinchButton prefabs

    // ── Dashboard ─────────────────────────────────────────────────────────
    const dashboard = this.child(uiRoot, "Dashboard");
    dashboard.enabled = false;
    // → Attach: (no top-level script; children have their own scripts)

    // Tab buttons (top strip)
    const sideNav = this.child(dashboard, "SideNav");
    this.localPos(sideNav, 0, 12, 0);
    this.text(sideNav, "MyTasksTab",  "My Tasks",  16, -13, 0, 0);
    this.text(sideNav, "BrowseTab",   "Browse",    16,   0, 0, 0);
    this.text(sideNav, "ProfileTab",  "Profile",   16,  13, 0, 0);
    // ^ Replace all three with RectangleButton prefabs

    this.text(dashboard, "DashBackButton", "← Home", 16, -17, -12, 0);
    // ^ Replace with PinchButton named "DashBackButton"

    // My Tasks panel
    const myTasksPanel = this.child(dashboard, "MyTasksPanel");
    // → Attach: TaskListController.ts
    this.text(myTasksPanel, "TaskStatusText", "Loading tasks...", 16, 0, 5, 0);
    const taskScrollView = this.child(myTasksPanel, "TaskScrollView");
    // ^ Wire taskScrollView @input on TaskListController

    // Browse panel
    const browsePanel = this.child(dashboard, "BrowsePanel");
    // → Attach: ActivityBrowseController.ts
    browsePanel.enabled = false;
    const browseScroll = this.child(browsePanel, "ActivityScrollView");
    const browseGrid   = this.child(browseScroll, "ActivityGrid");
    // ^ Wire activityScrollView + gridContainer @inputs on ActivityBrowseController

    // Profile panel
    const profilePanel = this.child(dashboard, "ProfilePanel");
    // → Attach: ProfilePanelController.ts
    profilePanel.enabled = false;
    this.text(profilePanel, "ProfileNameText",    "Test User",      22,  0,  7, 0);
    this.text(profilePanel, "ProfileSessionText", "Guest Session",  16,  0,  2, 0);
    this.text(profilePanel, "ProfileIdText",      "ID: patient_001",14, 0, -1, 0);
    this.text(profilePanel, "LogoutButton",       "← Home",         16,  0, -9, 0);
    // ^ Replace LogoutButton with PinchButton

    // ── Confirm Panel ─────────────────────────────────────────────────────
    const confirmPanel = this.child(uiRoot, "ConfirmPanel");
    // → Attach: ConfirmPanelController.ts
    confirmPanel.enabled = false;

    const ssPlaceholder = this.child(confirmPanel, "ScreenshotPlaceholder");
    this.text(ssPlaceholder, "SsLabel", "[Exercise Preview]", 16, 0, 0, 0);
    this.localPos(ssPlaceholder, 0, 7, 0);

    this.text(confirmPanel, "ConfirmTitleText",  "Exercise Title",  24, 0,  0, 0);
    this.text(confirmPanel, "ConfirmDescText",   "Description...",  16, 0, -5, 0);
    this.text(confirmPanel, "ConfirmBackButton", "← Browse",        18,-8,-12, 0);
    this.text(confirmPanel, "ConfirmStartButton","▶ Start",          18, 8,-12, 0);
    // ^ Replace Back + Start with PinchButton prefabs

    // ── Exercise Scene (world-space, table-level) ─────────────────────────
    const exerciseScene = this.obj("ExerciseScene");
    this.worldPos(exerciseScene, 0, Y, -60);
    exerciseScene.enabled = false;
    // → Attach: TomatoPrepExercise.ts OR SetTableExercise.ts (one active at a time)

    // HUD (top-left of exercise area, semi-transparent overlay)
    const hud = this.child(exerciseScene, "ExerciseHUD");
    this.localPos(hud, -18, 14, 0);

    this.text(hud, "StepText", "Step 1 of 4:\nGet ready...", 18, 0,  3, 0);
    this.text(hud, "ProgressDotsText", "🔵 ⚪ ⚪ ⚪",         16, 0, -2, 0);
    this.text(hud, "ExitButton", "[✕ Exit]",                  16, 9,  3, 0);
    // ^ Replace ExitButton with PinchButton
    // → ExerciseController.ts will be attached to ExerciseScene

    // Exercise-specific prop containers
    const tomatoScene = this.child(exerciseScene, "Exercise_TomatoPrep");
    tomatoScene.enabled = false;
    // → Place tomato, knife, countertop RenderMeshVisual objects here
    // → Attach: TomatoPrepExercise.ts

    const tableScene = this.child(exerciseScene, "Exercise_SetTheTable");
    tableScene.enabled = false;
    // → Place plate, fork, knife, glass, dining table RenderMeshVisual objects here
    // → Attach: SetTableExercise.ts

    print("[SceneAutoSetup] ✅ Hierarchy built! See Hierarchy panel in Lens Studio.");
    print("[SceneAutoSetup] Script attachment guide:");
    print("  SessionManager    → SessionManager object");
    print("  MindStepUIManager → UIRoot");
    print("  SceneWiring       → UIRoot (run AFTER all scripts attached)");
    print("  LoginController   → HomeScreen");
    print("  DevlogModal       → HomeScreen");
    print("  TaskListController→ MyTasksPanel");
    print("  ActivityBrowseCtrl→ BrowsePanel");
    print("  ConfirmPanelCtrl  → ConfirmPanel");
    print("  ProfilePanelCtrl  → ProfilePanel");
    print("  ExerciseController→ ExerciseScene (use TomatoPrepExercise or SetTableExercise)");
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Create root-level scene object */
  private obj(name: string): SceneObject {
    return global.scene.createSceneObject(name);
  }

  /** Create child scene object */
  private child(parent: SceneObject, name: string): SceneObject {
    const o = global.scene.createSceneObject(name);
    o.setParent(parent);
    return o;
  }

  /** Create child with Text component */
  private text(
    parent: SceneObject, name: string, content: string, size: number,
    lx: number, ly: number, lz: number
  ): SceneObject {
    const o = global.scene.createSceneObject(name);
    o.setParent(parent);
    const t = o.createComponent("Component.Text") as Text;
    t.text = content;
    t.size = size;
    o.getTransform().setLocalPosition(new vec3(lx, ly, lz));
    return o;
  }

  /** Set world position */
  private worldPos(o: SceneObject, x: number, y: number, z: number): void {
    o.getTransform().setWorldPosition(new vec3(x, y, z));
  }

  /** Set local position */
  private localPos(o: SceneObject, x: number, y: number, z: number): void {
    o.getTransform().setLocalPosition(new vec3(x, y, z));
  }
}
