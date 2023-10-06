type ControlMap = {
  id: string;
  events: Array<string>;
  callbackFn: (event?: Event) => void;
};

class AppStatus {
  #containers: NodeListOf<HTMLElement>;
  #word: string = "";

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
      id: "word-btn",
      events: ["click"],
      callbackFn: () => this.#toggleContainer("word"),
    },
    {
      id: "rotate-left-btn",
      events: ["click"],
      callbackFn: () => console.log("left"),
    },
    {
      id: "rotate-right-btn",
      events: ["click"],
      callbackFn: () => console.log("right"),
    },
    {
      id: "straight-btn",
      events: ["click"],
      callbackFn: () => console.log("straight"),
    },
    {
      id: "back-btn",
      events: ["click"],
      callbackFn: () => console.log("back"),
    },
    {
      id: "send-word-btn",
      events: ["click"],
      callbackFn: () => console.log(this.#word),
    },
    {
      id: "chk-palabra",
      events: ["change"],
      callbackFn: () => console.log("palabra"),
    },
    {
      id: "input-palabra",
      events: ["change"],
      callbackFn: (event: InputEvent) => {
        this.#word = (<HTMLInputElement>event.target).value;
      },
    },
  ];

  constructor() {
    this.#containers = document.querySelectorAll('[id$="-container"]');

    this.#controlMap.forEach((controlMap) => {
      let element: HTMLElement | null = document.getElementById(controlMap.id);

      if (element) {
        controlMap.events.forEach((event) => {
          element?.addEventListener(event, controlMap.callbackFn);
        });
      } else {
        throw new Error(`No encontré el elemento con id ${controlMap.id}`);
      }
    });

    this.#toggleContainer("welcome");
  }

  #toggleContainer(containerName: string): void {
    containerName = `${containerName}-container`;
    this.#containers.forEach((value) => {
      value.style.display = value.id == containerName ? "block" : "none";
    });
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
