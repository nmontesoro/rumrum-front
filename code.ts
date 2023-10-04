type Controller = {
  container: HTMLElement;
  button: HTMLElement;
};

class AppStatus {
  #elementMap: Map<string, Controller> = new Map<string, Controller>();

  constructor() {
    this.#initElementMap();
  }

  #initElementMap(): void {
    let elementNames: Array<string> = ["autopilot", "touchpad", "word"];

    let container: HTMLElement | null;
    let button: HTMLElement | null;

    elementNames.forEach((name) => {
      container = document.getElementById(`${name}-container`);
      button = document.getElementById(`${name}-btn`);

      if (!container || !button) {
        throw new Error(`No se encontró el container o botón para ${name}`);
      } else {
        button.addEventListener("click", () => this.#enableSection(name));
        this.#elementMap.set(name, { container, button });
      }
    });

    this.#enableSection(elementNames[0]);
  }

  #enableSection(name: string): void {
    this.#elementMap.forEach((elemSet, key) => {
      elemSet.container.style.display = key == name ? "initial" : "none";
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let appStatus = new AppStatus();
});
