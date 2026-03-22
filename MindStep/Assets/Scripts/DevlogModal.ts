/**
 * DevlogModal.ts
 * Displays a modal dialog with version info and changelog.
 * For MVP: hardcoded changelog array.
 */

import { PinchButton } from "SpectaclesInteractionKit.lspkg/Components/UI/PinchButton/PinchButton";

interface ChangelogEntry {
  version: string;
  items: string[];
}

@component
export class DevlogModal extends BaseScriptComponent {
  @ui.group_start("Devlog UI")
  @input
  modalRoot: SceneObject;

  @input
  versionText: Text;

  @input
  changelogScrollView: SceneObject;

  @input
  closeButton: any;
  @ui.group_end

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

    // Close button handler
    if (this.closeButton) {
      this.closeButton.onTriggerStart.add(() => {
        this.close();
      });
    }

    // Initially hidden
    if (this.modalRoot) {
      this.modalRoot.enabled = false;
    }

    // Populate version text
    this.updateVersionText();

    // Populate changelog (Phase 2: instantiate items from prefab)
    this.updateChangelog();
  }

  /**
   * Open the devlog modal.
   */
  open(): void {
    print("[DevlogModal] Opening");
    this.isOpen = true;

    if (this.modalRoot) {
      this.modalRoot.enabled = true;
    }
  }

  /**
   * Close the devlog modal.
   */
  close(): void {
    print("[DevlogModal] Closing");
    this.isOpen = false;

    if (this.modalRoot) {
      this.modalRoot.enabled = false;
    }
  }

  /**
   * Toggle devlog visibility.
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Update version text display.
   */
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
        "V." +
        latestEntry.version +
        " — Last Updated: " +
        dateStr;
    }
  }

  /**
   * Update changelog content.
   * Phase 1: display as static text.
   * Phase 2: instantiate items from a ScrollView + prefab.
   */
  private updateChangelog(): void {
    if (!this.changelogScrollView) {
      return;
    }

    // For MVP, just show the first changelog entry as text
    if (this.changelog.length > 0) {
      const entry = this.changelog[0];

      // Create text content (Phase 2: use prefab + instantiation)
      let content = entry.version + "\n";
      entry.items.forEach((item) => {
        content += "• " + item + "\n";
      });

      print("[DevlogModal] Changelog:\n" + content);
    }
  }

  /**
   * Get current status (open/closed).
   */
  isModalOpen(): boolean {
    return this.isOpen;
  }
}
