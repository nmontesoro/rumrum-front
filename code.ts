type ControlMap = {
  id: string;
  events: Array<string>;
  callbackFn: (event?: Event) => void;
};

class AppStatus {
  #containers: NodeListOf<HTMLElement>;
  #word: string = "";
  #palabraAutomaticaEnabled: boolean = true;

  public get palabraAutomaticaEnabled(): boolean {
    return this.#palabraAutomaticaEnabled;
  }

  public set palabraAutomaticaEnabled(v: boolean) {
    let checkbox: HTMLInputElement = <HTMLInputElement>(
      this.#getElementById("chk-palabra")
    );
    checkbox.checked = v;
    this.#palabraAutomaticaEnabled = v;
    this.#showPalabraControls(!v);
  }

  #showPalabraControls(v: boolean): void {
    let textbox: HTMLInputElement = <HTMLInputElement>(
      this.#getElementById("input-palabra")
    );
    let button: HTMLInputElement = <HTMLInputElement>(
      this.#getElementById("send-word-btn")
    );

    textbox.style.display = v ? "block" : "none";
    button.style.display = v ? "block" : "none";
  }

  #controlMap: Array<ControlMap> = [
    {
      id: "autopilot-btn",
      events: ["click"],
      callbackFn: () => this.#toggleContainer("autopilot"),
    },
    {
      id: "touchpad-btn",
      events: ["click"],
      callbackFn: () => this.#toggleContainer("touchpad"),
    },
    {
      id: "settings-btn",
      events: ["click"],
      callbackFn: () => this.#toggleContainer("settings"),
    },
    {
      id: "rotate-left-btn",
      events: ["click"],
      callbackFn: () => this.#toggleStopButton(),
    },
    {
      id: "rotate-right-btn",
      events: ["click"],
      callbackFn: () => this.#toggleStopButton(),
    },
    {
      id: "straight-btn",
      events: ["click"],
      callbackFn: () => this.#toggleStopButton(),
    },
    {
      id: "back-btn",
      events: ["click"],
      callbackFn: () => this.#toggleStopButton(),
    },
    {
      id: "send-word-btn",
      events: ["click"],
      callbackFn: () => console.log(this.#word),
    },
    {
      id: "chk-palabra",
      events: ["change"],
      callbackFn: (e: InputEvent) =>
        (this.palabraAutomaticaEnabled = (<HTMLInputElement>e.target).checked),
    },
    {
      id: "input-palabra",
      events: ["change"],
      callbackFn: (event: InputEvent) => {
        this.#word = (<HTMLInputElement>event.target).value;
      },
    },
    {
      id: "stop-btn",
      events: ["click"],
      callbackFn: () => this.#toggleStopButton(),
    },
  ];

  constructor() {
    this.#containers = document.querySelectorAll('[id$="-container"]');

    this.#controlMap.forEach((controlMap) => {
      let element: HTMLElement = this.#getElementById(controlMap.id);
      controlMap.events.forEach((event) => {
        element.addEventListener(event, controlMap.callbackFn);
      });
    });

    this.#toggleContainer("welcome");
    this.palabraAutomaticaEnabled = true;
  }

  #toggleContainer(containerName: string): void {
    containerName = `${containerName}-container`;
    this.#containers.forEach((value) => {
      value.style.display = value.id == containerName ? "block" : "none";
    });
  }

  #toggleStopButton(): void {
    let stopButton: HTMLElement = this.#getElementById("stop-btn");

    let currentStyle: string = stopButton.style.display;
    if (currentStyle == "block") {
      stopButton.style.display = "none";
    } else {
      stopButton.style.display = "block";
    }
  }

  #getElementById(id: string): HTMLElement {
    let element: HTMLElement | null = document.getElementById(id);

    if (element == null) {
      throw new Error(`No encontré el elemento con id='${id}'`);
    }

    return element;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    let appStatus = new AppStatus();
  } catch (err) {
    alert(err.message);
    console.log(err);
  }
});
