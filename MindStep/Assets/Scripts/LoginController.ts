/**
 * LoginController.ts
 * Handles guest login (Phase 1) and optional email/password auth (Phase 4).
 * After guest login, navigates directly to Dashboard via MindStepUIManager.
 *
 * NOTE: Inputs wired by SceneWiring at runtime. No @input decorators.
 */

import { SessionManager } from "./SessionManager";
import { MindStepUIManager } from "./MindStepUIManager";

@component
export class LoginController extends BaseScriptComponent {
  // Wired by SceneWiring
  guestButton: any = null;
  loginButton: any = null;
  statusText: Text | null = null;
  devlogButton: any = null;
  devlogModal: any = null;

  private sessionManager: SessionManager;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[LoginController] Initializing");
    this.sessionManager = SessionManager.getInstance();
  }

  rebindButtons(): void {
    this.bindButton(this.guestButton, () => this.startGuestSession());
    this.bindButton(this.loginButton, () => this.showLoginPrompt());
    this.bindButton(this.devlogButton, () => {
      if (this.devlogModal) (this.devlogModal as any).toggle();
    });
    print("[LoginController] Buttons bound");
  }

  private bindButton(btn: any, callback: () => void): void {
    if (!btn) return;
    if (btn.onTriggerUp) { btn.onTriggerUp.add(callback); return; }
    if (btn.onButtonPinched) { btn.onButtonPinched.add(callback); return; }
    if (btn.onTriggerStart) { btn.onTriggerStart.add(callback); return; }
    print("[LoginController] Warning: no known event on button");
  }

  private startGuestSession(): void {
    print("[LoginController] Starting guest session");
    this.sessionManager.setCurrentUser({
      userId: "patient_001",
      displayName: "Test User",
      isGuest: true
    });
    if (this.statusText) this.statusText.text = "Logged in as Test User";

    const ui = MindStepUIManager.getInstance();
    if (ui) {
      ui.transitionToDashboard();
    } else {
      print("[LoginController] Warning: MindStepUIManager not found");
    }
  }

  private showLoginPrompt(): void {
    print("[LoginController] Login not yet implemented (Phase 4)");
    if (this.statusText) this.statusText.text = "Login coming in Phase 4";
  }
}
