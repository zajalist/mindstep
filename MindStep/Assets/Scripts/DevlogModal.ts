/**
 * DevlogModal.ts
 * Displays a modal dialog with version info and changelog.
 * For MVP: hardcoded changelog array.
 *
 * NOTE: Inputs wired by SceneWiring at runtime. No @input decorators.
 */

interface ChangelogEntry {
  version: string;
  items: string[];
}

@component
export class DevlogModal extends BaseScriptComponent {
  // Wired by SceneWiring
  modalRoot: SceneObject | null = null;
  versionText: Text | null = null;
  changelogScrollView: SceneObject | null = null;
  closeButton: any = null;

  private isOpen: boolean = false;
  private changelog: ChangelogEntry[] = [
    {
      version: "0.0.3",
      items: [
        "Added Home Screen",
        "Welcome header with username display",
        "Devlog modal with version history",
        "Logged in as session indicator",
        "Circle play button to navigate forward",
        "Frame resize animation system",
        "UIState machine foundation",
        "BaseButton binding helpers",
        "Initial frame size configuration"
      ]
    }
  ];

  onAwake() {
    this.createEvent("OnStartEvent").bind(() => {
      this.initialize();
    });
  }

  private initialize(): void {
    print("[DevlogModal] Initializing");

    if (this.modalRoot) {
      this.modalRoot.enabled = false;
    }

    this.updateVersionText();
    this.updateChangelog();
  }

  rebindButtons(): void {
    if (!this.closeButton) return;
    const btn = this.closeButton;
    if (btn.onTriggerUp) {
      btn.onTriggerUp.add(() => this.close());
    } else if (btn.onButtonPinched) {
      btn.onButtonPinched.add(() => this.close());
    } else if (btn.onTriggerStart) {
      btn.onTriggerStart.add(() => this.close());
    }
    print("[DevlogModal] Close button bound");
  }

  open(): void {
    print("[DevlogModal] Opening");
    this.isOpen = true;
    if (this.modalRoot) this.modalRoot.enabled = true;
  }

  close(): void {
    print("[DevlogModal] Closing");
    this.isOpen = false;
    if (this.modalRoot) this.modalRoot.enabled = false;
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private updateVersionText(): void {
    if (this.versionText && this.changelog.length > 0) {
      const latestEntry = this.changelog[0];
      const now = new Date();
      const dateStr = now.getFullYear() +
        "/" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "/" +
        String(now.getDate()).padStart(2, "0");

      this.versionText.text =
        "V." + latestEntry.version + " - Last Updated: " + dateStr;
    }
  }

  private updateChangelog(): void {
    if (!this.changelogScrollView) return;

    if (this.changelog.length > 0) {
      const entry = this.changelog[0];
      let content = entry.version + "\n";
      entry.items.forEach((item) => {
        content += "- " + item + "\n";
      });
      print("[DevlogModal] Changelog:\n" + content);
    }
  }

  isModalOpen(): boolean {
    return this.isOpen;
  }
}
