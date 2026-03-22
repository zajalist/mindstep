/**
 * SessionManager.ts
 * Singleton managing the current user session (guest or authenticated).
 * Persists user state throughout the app lifecycle.
 */

interface User {
  userId: string;
  displayName: string;
  isGuest: boolean;
  email?: string;
  token?: string;
}

@component
export class SessionManager extends BaseScriptComponent {
  private static instance: SessionManager | null = null;

  private _currentUser: User = {
    userId: "",
    displayName: "Guest",
    isGuest: true
  };

  /**
   * Get or create the singleton instance.
   */
  static getInstance(): SessionManager {
    if (SessionManager.instance === null) {
      // Create a hidden object to attach the singleton to
      const manager = new SessionManager();
      manager.initialize();
      SessionManager.instance = manager;
    }
    return SessionManager.instance;
  }

  /**
   * Initialize as a singleton (called once).
   */
  private initialize(): void {
    print("[SessionManager] Initialized as singleton");
  }

  onAwake() {
    SessionManager.instance = this;
  }

  /**
   * Get the current user.
   */
  getCurrentUser(): User {
    return this._currentUser;
  }

  /**
   * Set the current user (e.g., after login).
   */
  setCurrentUser(user: User): void {
    this._currentUser = user;
    print("[SessionManager] User set: " + user.displayName);
  }

  /**
   * Set guest session.
   */
  setGuest(displayName: string = "Guest"): void {
    this._currentUser = {
      userId: "guest_" + Math.random().toString(36).substring(7),
      displayName: displayName,
      isGuest: true
    };
    print("[SessionManager] Guest session started: " + displayName);
  }

  /**
   * Clear session (logout).
   */
  clearSession(): void {
    this._currentUser = {
      userId: "",
      displayName: "Guest",
      isGuest: true
    };
    print("[SessionManager] Session cleared");
  }

  /**
   * Check if currently logged in as a real user (not guest).
   */
  isAuthenticated(): boolean {
    return !this._currentUser.isGuest && this._currentUser.userId.length > 0;
  }
}
