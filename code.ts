type Controller = {
  container: HTMLElement;
  button: HTMLElement;
};

class AppStatus {
  #containers: NodeListOf<HTMLElement>;

  #buttonMap: Map<string, () => void> = new Map<string, () => void>([
    ["autopilot-btn", () => this.#toggleContainer("autopilot")],
    ["touchpad-btn", () => this.#toggleContainer("touchpad")],
    ["word-btn", () => this.#toggleContainer("word")],
  ]);

  constructor() {
    this.#containers = document.querySelectorAll('[id$="-container"]');
    this.#buttonMap.forEach((callbackFn, btnId) => {
      let btn: HTMLElement | null = document.getElementById(btnId);

      if (btn) {
        btn.addEventListener("click", callbackFn);
      } else {
        throw new Error(`No encontré el elemento con id ${btnId}`);
      }
    });
    this.#toggleContainer("touchpad");
  }

  #toggleContainer(containerName: string): void {
    containerName = `${containerName}-container`;
    this.#containers.forEach((value) => {
      value.style.display = value.id == containerName ? "block" : "none";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let appStatus = new AppStatus();
});
