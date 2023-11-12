/**
 * Enumeración que representa las posibles direcciones de movimiento del
 * auto.
 * @enum {number}
 */
enum Direccion {
  Adelante,
  Atras,
  Izquierda,
  Derecha,
}

/**
 * Clase que representa el auto con todas sus funcionalidades.
 */
class Auto {
  #LONGITUD_MAX_PALABRA: number;
  #mostrandoPalabraAutomatica: boolean;
  #displayEncendido: boolean;

  // Instancia de WebSocket para la comunicación con el servidor.
  #socket: WebSocket;

  // Últimas coordenadas enviadas al servidor.
  #lastX: number = 0;
  #lastY: number = 0;

  /**
   * Obtiene la longitud máxima permitida para la palabra en el display.
   * @public
   * @type {number}
   */
  public get longitudMaximaPalabra(): number {
    return this.#LONGITUD_MAX_PALABRA;
  }

  /**
   * Obtiene el estado actual de la visualización automática de palabras
   * en el display.
   * @public
   * @type {boolean}
   */
  public get mostrandoPalabraAutomatica(): boolean {
    return this.#mostrandoPalabraAutomatica;
  }

  /**
   * Obtiene el estado actual del display del auto.
   * @public
   * @type {boolean}
   */
  public get displayEncendido(): boolean {
    return this.#displayEncendido;
  }

  /**
   * Constructor de la clase Auto.
   * @param {function} [onerror] - Callback para eventos de error en el
   * WebSocket.
   * @param {function} [onclose] - Callback para eventos de cierre en el
   * WebSocket.
   */
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

  /**
   * Realiza un movimiento automático enviando la dirección al servidor.
   * @public
   * @param {number} direccion - Dirección del movimiento.
   */
  movimientoAutomatico(direccion: Direccion): void {
    this.#socket.send(`${direccion}`);
  }

  /**
   * Desplaza el auto enviando las coordenadas X e Y al servidor.
   * @public
   * @param {number} x - Coordenada X.
   * @param {number} y - Coordenada Y.
   */
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

  /**
   * Determina si se debe enviar el movimiento basado en las coordenadas
   * actuales y anteriores.
   * @private
   * @param {number} x - Coordenada X actual.
   * @param {number} y - Coordenada Y actual.
   * @returns {boolean} - True si se debe enviar el movimiento, false en
   * caso contrario.
   */
  #enviarMovimiento(x: number, y: number): boolean {
    return (
      x >= this.#lastX + 20 ||
      x <= this.#lastX - 20 ||
      y >= this.#lastY + 20 ||
      y <= this.#lastY - 20
    );
  }

  /**
   * Detiene el movimiento del auto enviando la señal al servidor.
   * @public
   */
  detener(): void {
    this.#socket.send("4");
  }

  /**
   * Muestra una palabra en el display si cumple con la longitud máxima
   * permitida.
   * @public
   * @param {string} palabra - Palabra a mostrar.
   * @throws {Error} - Error si la palabra excede la longitud máxima permitida.
   */
  mostrarPalabra(palabra: string): void {
    if (palabra.length <= this.#LONGITUD_MAX_PALABRA) {
      this.#socket.send(`8;${palabra}`);
      this.#mostrandoPalabraAutomatica = false;
    } else {
      throw new Error(`'${palabra}' tiene demasiadas letras`);
    }
  }

  /**
   * Activa la visualización de palabra automática en el display.
   * @public
   */
  mostrarPalabraAutomatica(): void {
    this.#socket.send("9");
    this.#mostrandoPalabraAutomatica = true;
  }

  /**
   * Apaga el display del auto.
   * @public
   */
  apagarDisplay(): void {
    this.#socket.send("7");
    this.#displayEncendido = false;
  }

  /**
   * Enciende el display del auto.
   * @public
   */
  encenderDisplay(): void {
    this.#socket.send("6");
    this.#displayEncendido = true;
  }
}

/**
 * Tipo que representa la estructura de un mapeo de controles.
 * @typedef {Object} ControlMap
 * @property {string} id - Identificador del control.
 * @property {Array<string>} events - Eventos asociados al control.
 * @property {(event: any) => any} callbackFn - Callback asociado al
 * control.
 */
type ControlMap = {
  id: string;
  events: Array<string>;
  callbackFn: (event: any) => any;
};

/**
 * Clase que representa el estado de la aplicación.
 */
class AppStatus {
  #containers: NodeListOf<HTMLElement>;
  #word: string = "";
  #palabraAutomaticaEnabled: boolean = true;
  #spinnerElement: HTMLElement;
  #isDragging: boolean = false;

  // Coordenadas iniciales para el arrastre en el touchpad.
  #startX: number = 0;
  #startY: number = 0;

  // Instancia de la clase Auto asociada a la aplicación.
  auto: Auto;

  /**
   * Obtiene el estado actual de la visualización automática de palabras
   * en el display.
   * @public
   * @type {boolean}
   */
  public get palabraAutomaticaEnabled(): boolean {
    return this.#palabraAutomaticaEnabled;
  }

  /**
   * Establece el estado de la visualización automática de palabras en
   * el display.
   * @public
   * @param {boolean} v - Nuevo estado.
   */
  public set palabraAutomaticaEnabled(v: boolean) {
    let checkbox: HTMLInputElement = <HTMLInputElement>(
      this.#getElementById("chk-palabra")
    );
    checkbox.checked = v;
    this.#palabraAutomaticaEnabled = v;
    this.#showPalabraControls(!v);
  }

  /**
   * Muestra u oculta los controles de palabra en función del estado
   * proporcionado.
   * @private
   * @param {boolean} v - Estado para mostrar u ocultar los controles de
   * palabra.
   */
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

  /**
   * Mapa de controles asociados a eventos en la aplicación.
   * @private
   * @type {Array<ControlMap>}
   */
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
        this.auto.movimientoAutomatico(Direccion.Izquierda);
        this.#toggleStopButton();
      },
    },
    {
      id: "rotate-right-btn",
      events: ["click"],
      callbackFn: () => {
        this.auto.movimientoAutomatico(Direccion.Derecha);
        this.#toggleStopButton();
      },
    },
    {
      id: "straight-btn",
      events: ["click"],
      callbackFn: () => {
        this.auto.movimientoAutomatico(Direccion.Adelante);
        this.#toggleStopButton();
      },
    },
    {
      id: "back-btn",
      events: ["click"],
      callbackFn: () => {
        this.auto.movimientoAutomatico(Direccion.Atras);
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
            (2 * (x - this.#startX)) / width,
            (-2 * (y - this.#startY)) / height
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

  /**
   * Constructor de la clase AppStatus.
   */
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

  /**
   * Muestra u oculta un contenedor específico de la aplicación.
   * @private
   * @param {string} containerName - Nombre del contenedor a mostrar u
   * ocultar.
   */
  #toggleContainer(containerName: string): void {
    containerName = `${containerName}-container`;
    this.#containers.forEach((value) => {
      value.style.display = value.id == containerName ? "block" : "none";
    });
  }

  /**
   * Muestra u oculta el botón que detiene el movimiento automático, en
   * función de su estado actual.
   * @private
   */
  #toggleStopButton(): void {
    let stopButton: HTMLElement = this.#getElementById("stop-btn");

    let currentStyle: string = stopButton.style.display;
    if (currentStyle == "block") {
      stopButton.style.display = "none";
    } else {
      stopButton.style.display = "block";
    }
  }

  /**
   * Obtiene un elemento HTML por su identificador.
   * @private
   * @param {string} id - Identificador del elemento.
   * @returns {HTMLElement} - Elemento HTML encontrado.
   * @throws {Error} - Error si no se encuentra el elemento con el
   * identificador proporcionado.
   */
  #getElementById(id: string): HTMLElement {
    let element: HTMLElement | null = document.getElementById(id);

    if (element == null) {
      throw new Error(`No encontré el elemento con id='${id}'`);
    }

    return element;
  }

  /**
   * Actualiza el texto del botón de encendido/apagado del display en
   * función del estado actual.
   * @private
   */
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

  /**
   * Utilizado como callback para mostrar errores en la interfaz.
   * @param {Event} ev - Evento que desencadena la función.
   */
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
