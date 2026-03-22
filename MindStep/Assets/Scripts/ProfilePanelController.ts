/**
 * ProfilePanelController.ts
 * Displays user profile info (name, session type) and a logout/close button.
 *
 * NOTE: Inputs wired by SceneWiring at runtime. No @input decorators.
 */

import { SessionManager } from "./SessionManager";
import { MindStepUIManager } from "./MindStepUIManager";

@component
export class ProfilePanelController extends BaseScriptComponent {
  // Wired by SceneWiring
  nameText: Text | null = null;
  sessionTypeText: Text | null = null;
  patientIdText: Text | null = null;
  logoutButton: any = null;

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
    print("[ProfilePanelController] Initializing");

    this.refreshProfile();

    if (this.logoutButton) {
      const btn = this.logoutButton;
      // Try onTriggerUp first (SpectaclesUIKit RectangleButton)
      if (btn.onTriggerUp) {
        btn.onTriggerUp.add(() => this.onLogout());
      } else if (btn.onButtonPinched) {
        btn.onButtonPinched.add(() => this.onLogout());
      } else if (btn.onTriggerStart) {
        btn.onTriggerStart.add(() => this.onLogout());
      }
    }
  }

  refreshProfile(): void {
    const user = SessionManager.getInstance().getCurrentUser();

    if (this.nameText) this.nameText.text = user.displayName;

    if (this.sessionTypeText) {
      this.sessionTypeText.text = user.isGuest ? "Guest Session" : "Signed In";
    }

    if (this.patientIdText) {
      this.patientIdText.text = "ID: " + user.userId;
    }
  }

  private onLogout(): void {
    print("[ProfilePanelController] Logging out");
    SessionManager.getInstance().clearSession();

    const ui = MindStepUIManager.getInstance();
    if (ui) ui.transitionToHome();
  }
}
