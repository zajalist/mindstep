/**
 * LoginController.ts
 * Handles guest login (Phase 1) and optional email/password auth (Phase 4).
 * 3D world-space version – buttons typed as `any` to support both
 * RoundButton (SIK UIStarter) and RectangleButton (SpectaclesUIKit).
 */

import { SessionManager } from "./SessionManager";

@component
export class LoginController extends BaseScriptComponent {
  @ui.group_start("Login UI")
  @input
  guestButton: any = null;

  @input
  loginButton: any = null;

  @input
  statusText: Text | null = null;
  @ui.group_end

  private sessionManager: SessionManager;
  private isLoggingIn: boolean = false;

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[LoginController] Initializing");

    this.sessionManager = SessionManager.getInstance();

    const bindButton = (btn: any, callback: () => void) => {
      if (!btn) return;
      if (btn.onTriggerStart) {
        btn.onTriggerStart.add(callback);
      } else if (btn.onButtonPinched) {
        btn.onButtonPinched.add(callback);
      }
    };

    bindButton(this.guestButton, () => this.startGuestSession());
    bindButton(this.loginButton, () => this.showLoginPrompt());
  }

  private startGuestSession(): void {
    print("[LoginController] Starting guest session");
    this.sessionManager.setGuest("Guest");
    if (this.statusText) {
      this.statusText.text = "Logged in as Guest";
    }
  }

  private showLoginPrompt(): void {
    print("[LoginController] Login not yet implemented (Phase 4)");
    if (this.statusText) {
      this.statusText.text = "Login coming in Phase 4";
    }
  }

  private attemptLogin(email: string, password: string): void {
    if (this.isLoggingIn) return;
    this.isLoggingIn = true;
    if (this.statusText) this.statusText.text = "Logging in...";
    // Phase 4: Firebase Auth REST call
    this.isLoggingIn = false;
  }
}
