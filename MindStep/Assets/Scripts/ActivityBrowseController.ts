/**
 * ActivityBrowseController.ts
 * Manages the Browse tab in Dashboard.
 * Finds pre-built activity card buttons in the ScrollWindow GridLayout
 * and wires tap events for real exercises. Skeletons are display-only.
 *
 * Scene structure expected:
 *   BrowsePanel > ActivityScrollView > BrowseScrollWindow > GridLayout > [Button cards]
 *
 * NOTE: All inputs are wired by MindStepUIManager at runtime.
 */

import { ExerciseData, Exercise } from "./ExerciseData";
import { MindStepUIManager } from "./MindStepUIManager";

// Map of button scene object names to exercise IDs
const CARD_EXERCISE_MAP: { [cardName: string]: string } = {
  "Tomato Prep": "exercise_001",
  "Set the Table": "exercise_002"
};

@component
export class ActivityBrowseController extends BaseScriptComponent {
  // Wired by MindStepUIManager
  activityScrollView: SceneObject | null = null;
  activityCardPrefab: ObjectPrefab | null = null;
  gridContainer: SceneObject | null = null;
  totalActivitiesCount: number = 10;
  itemSpacing: number = 5.5;

  private hasInitialized = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
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

  initialize(): void {
    if (this.hasInitialized) return;
    this.hasInitialized = true;
    print("[ActivityBrowseController] Initializing");
    this.wireCardButtons();
  }

  private wireCardButtons(): void {
    // Walk the scene tree under BrowsePanel to find all card buttons
    const root = this.getSceneObject();
    const buttons = this.findAllButtons(root);
    print("[ActivityBrowseController] Found " + buttons.length + " card buttons");

    for (let i = 0; i < buttons.length; i++) {
      const btnObj = buttons[i];
      const name = btnObj.name;
      const exerciseId = CARD_EXERCISE_MAP[name];

      if (exerciseId) {
        // Real exercise - wire tap to navigate to confirm
        this.wireButton(btnObj, exerciseId);
        print("[ActivityBrowseController] Wired card: " + name + " -> " + exerciseId);
      } else {
        print("[ActivityBrowseController] Skeleton card: " + name);
      }
    }
  }

  private wireButton(btnObj: SceneObject, exerciseId: string): void {
    const btn = this.findButtonComp(btnObj);
    if (btn && btn.onTriggerUp) {
      btn.onTriggerUp.add(() => {
        print("[ActivityBrowseController] Card tapped: " + exerciseId);
        const ui = MindStepUIManager.getInstance();
        if (ui) ui.transitionToConfirm(exerciseId);
      });
    } else if (btn && btn.onButtonPinched) {
      btn.onButtonPinched.add(() => {
        print("[ActivityBrowseController] Card pinched: " + exerciseId);
        const ui = MindStepUIManager.getInstance();
        if (ui) ui.transitionToConfirm(exerciseId);
      });
    } else {
      print("[ActivityBrowseController] Warning: no trigger on " + btnObj.name);
    }
  }

  private findButtonComp(obj: SceneObject): any {
    // Try direct component type strings
    const typeStrings = [
      "SpectaclesUIKit.lspkg/Scripts/Components/Button/RectangleButton",
      "RectangleButton"
    ];
    for (const ts of typeStrings) {
      const c = obj.getComponent(ts as any) as any;
      if (c && (c.onTriggerUp || c.onButtonPinched)) return c;
    }
    // Iterate all ScriptComponents to find one with onTriggerUp
    const scripts = obj.getComponents("Component.ScriptComponent");
    for (let i = 0; i < scripts.length; i++) {
      const sc = scripts[i] as any;
      if (sc && (sc.onTriggerUp || sc.onButtonPinched)) return sc;
    }
    return null;
  }

  private findAllButtons(obj: SceneObject): SceneObject[] {
    const results: SceneObject[] = [];
    for (let i = 0; i < obj.getChildrenCount(); i++) {
      const child = obj.getChild(i);
      if (this.findButtonComp(child)) {
        results.push(child);
      }
      const nested = this.findAllButtons(child);
      for (let j = 0; j < nested.length; j++) {
        results.push(nested[j]);
      }
    }
    return results;
  }

  getAllActivities(): Exercise[] {
    return ExerciseData.getAllBrowseItems();
  }
}
