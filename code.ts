class Direccion {
  static #adelante: number = 0;
  static #atras: number = 1;
  static #izquierda: number = 2;
  static #derecha: number = 3;

  public static get ADELANTE(): number {
    return Direccion.#adelante;
  }

  public static get ATRAS(): number {
    return Direccion.#atras;
  }

  public static get IZQUIERDA(): number {
    return Direccion.#izquierda;
  }

  public static get DERECHA(): number {
    return Direccion.#derecha;
  }
}

class Auto {
  #LONGITUD_MAX_PALABRA: number;
  #mostrandoPalabraAutomatica: boolean;
  #displayEncendido: boolean;
  #socket: WebSocket;
  #lastX: number = 0;
  #lastY: number = 0;

  public get longitudMaximaPalabra(): number {
    return this.#LONGITUD_MAX_PALABRA;
  }

  public get mostrandoPalabraAutomatica(): boolean {
    return this.#mostrandoPalabraAutomatica;
  }

  public get displayEncendido(): boolean {
    return this.#displayEncendido;
  }

  constructor(
    onerror?: (arg: Event) => void,
    onclose?: (arg: CloseEvent) => void
  ) {
    this.#LONGITUD_MAX_PALABRA = 4;
    this.#mostrandoPalabraAutomatica = true;
    this.#displayEncendido = true;

    let socketUrl: string = window.location.hostname;

    // Para pruebas
    if (socketUrl.length == 0) {
      socketUrl = "localhost";
    }

    this.#socket = new WebSocket(`ws://${socketUrl}:80/ws`);

    if (onerror != null) {
      this.#socket.onerror = onerror;
    }

    if (onclose != null) {
      this.#socket.onclose = onclose;
    }
  }

  movimientoAutomatico(direccion: number): void {
    this.#socket.send(`${direccion}`);
  }

  desplazar(x: number, y: number): void {
    x = Math.min(Math.round(x * 255), 255);
    y = Math.min(Math.round(y * 255), 255);

    if (this.#enviarMovimiento(x, y)) {
      this.#lastX = x;
      this.#lastY = y;
      let x_string: string = `${x}`.padStart(4, " ");
      let y_string: string = `${y}`.padStart(4, " ");
      this.#socket.send(`5;${x_string};${y_string}`);
    }
  }

  #enviarMovimiento(x: number, y: number): boolean {
    return (
      x >= this.#lastX + 20 ||
      x <= this.#lastX - 20 ||
      y >= this.#lastY + 20 ||
      y <= this.#lastY - 20
    );
  }

  detener(): void {
    this.#socket.send("4");
  }

  mostrarPalabra(palabra: string): void {
    if (palabra.length <= this.#LONGITUD_MAX_PALABRA) {
      this.#socket.send(`6;${palabra}`);
      this.#mostrandoPalabraAutomatica = false;
    } else {
      throw new Error(`'${palabra}' tiene demasiadas letras`);
    }
  }

  mostrarPalabraAutomatica(): void {
    this.#socket.send("7");
    this.#mostrandoPalabraAutomatica = true;
  }

  apagarDisplay(): void {
    this.#socket.send("9");
    this.#displayEncendido = false;
  }

  encenderDisplay(): void {
    this.#socket.send("8");
    this.#displayEncendido = true;
  }
}

type ControlMap = {
  id: string;
  events: Array<string>;
  callbackFn: (event: any) => any;
};

class AppStatus {
  #containers: NodeListOf<HTMLElement>;
  #word: string = "";
  #palabraAutomaticaEnabled: boolean = true;
  #spinnerElement: HTMLElement;
  #isDragging: boolean = false;
  #startX: number = 0;
  #startY: number = 0;
  auto: Auto;

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
      callbackFn: () => {
        this.auto.movimientoAutomatico(Direccion.IZQUIERDA);
        this.#toggleStopButton();
      },
    },
    {
      id: "rotate-right-btn",
      events: ["click"],
      callbackFn: () => {
        this.auto.movimientoAutomatico(Direccion.DERECHA);
        this.#toggleStopButton();
      },
    },
    {
      id: "straight-btn",
      events: ["click"],
      callbackFn: () => {
        this.auto.movimientoAutomatico(Direccion.ADELANTE);
        this.#toggleStopButton();
      },
    },
    {
      id: "back-btn",
      events: ["click"],
      callbackFn: () => {
        this.auto.movimientoAutomatico(Direccion.ATRAS);
        this.#toggleStopButton();
      },
    },
    {
      id: "send-word-btn",
      events: ["click"],
      callbackFn: () => {
        let textbox: HTMLInputElement = <HTMLInputElement>(
          this.#getElementById("input-palabra")
        );
        if (textbox.reportValidity()) {
          this.auto.mostrarPalabra(textbox.value);
        }
      },
    },
    {
      id: "chk-palabra",
      events: ["change"],
      callbackFn: (e: InputEvent) => {
        let checked = (<HTMLInputElement>e.target).checked;
        this.palabraAutomaticaEnabled = checked;
        if (checked) {
          this.auto.mostrarPalabraAutomatica();
        }
      },
    },
    {
      id: "stop-btn",
      events: ["click"],
      callbackFn: () => {
        this.auto.detener();
        this.#toggleStopButton();
      },
    },
    {
      id: "toggle-display-btn",
      events: ["click"],
      callbackFn: () => {
        if (this.auto.displayEncendido) {
          this.auto.apagarDisplay();
        } else {
          this.auto.encenderDisplay();
        }

        this.#actualizarBotonDisplay();
      },
    },
    {
      id: "touchpad",
      events: ["mousedown", "touchstart"],
      callbackFn: (e: MouseEvent | TouchEvent) => {
        this.#isDragging = true;
        if (e instanceof MouseEvent) {
          this.#startX = e.clientX;
          this.#startY = e.clientY;
        } else {
          this.#startX = e.touches[0].clientX;
          this.#startY = e.touches[0].clientY;
        }
      },
    },
    {
      id: "touchpad",
      events: ["mousemove", "touchmove"],
      callbackFn: (e: MouseEvent | TouchEvent) => {
        if (this.#isDragging) {
          let x: number = 0;
          let y: number = 0;
          let width: number = (<HTMLElement>e.target).clientWidth;
          let height: number = (<HTMLElement>e.target).clientHeight;

          if (e instanceof MouseEvent) {
            x = e.clientX;
            y = e.clientY;
          } else {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
          }

          this.auto.desplazar(
            (4 * (x - this.#startX)) / width,
            (-4 * (y - this.#startY)) / height
          );
        }
      },
    },
    {
      id: "touchpad",
      events: ["mouseup", "touchend"],
      callbackFn: () => {
        this.#isDragging = false;
        this.auto.detener();
      },
    },
  ];

  constructor() {
    this.auto = new Auto(this.displayError, this.displayError);
    this.#spinnerElement = this.#getElementById("spinner");

    this.#actualizarBotonDisplay();

    this.#containers = document.querySelectorAll('[id$="-container"]');

    this.#controlMap.forEach((controlMap) => {
      let element: HTMLElement = this.#getElementById(controlMap.id);
      controlMap.events.forEach((event) => {
        element.addEventListener(event, controlMap.callbackFn);
      });
    });

    this.#toggleContainer("welcome");

    this.#showPalabraControls(this.auto.mostrandoPalabraAutomatica);

    (<HTMLInputElement>document.getElementById("chk-palabra")).checked =
      this.auto.mostrandoPalabraAutomatica;
    this.#showPalabraControls(!this.auto.mostrandoPalabraAutomatica);
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

  #actualizarBotonDisplay(): void {
    let boton: HTMLInputElement = <HTMLInputElement>(
      this.#getElementById("toggle-display-btn")
    );
    if (this.auto.displayEncendido) {
      boton.innerText = "Apagar display";
    } else {
      boton.innerText = "Encender display";
    }
  }

  #showSpinner(): void {
    this.#spinnerElement.style.display = "flex";
  }

  #hideSpinner(): void {
    this.#spinnerElement.style.display = "none";
  }

  displayError(ev: Event) {
    let msgDiv: HTMLDivElement = <HTMLDivElement>(
      document.getElementById("error-msg-modal")
    );

    msgDiv.style.display = "flex";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    let appStatus = new AppStatus();
  } catch (err: any) {
    alert(err.message);
    console.log(err);
  }
});
