class AppStatus {
  #joystickHidden: boolean = true;
  #joystickContainer: HTMLElement;

  constructor() {
    let joystickContainer: HTMLElement | null = <HTMLElement | null>(
      document.getElementsByClassName("touchpad")[0]
    );

    if (joystickContainer != null) {
      this.#joystickContainer = joystickContainer;
    } else {
      alert("Algo falló");
    }
  }

  toggleJoystick() {
    this.#joystickHidden = !this.#joystickHidden;
    this.#joystickContainer.style.display = this.#joystickHidden
      ? "block"
      : "none";
  }
}

document.addEventListener("DOMContentLoaded", (e: Event) => {
  let appStatus = new AppStatus();
  let chkTouchpad: HTMLInputElement = <HTMLInputElement>(
    document.getElementById("chkTouchpad")
  );

  chkTouchpad.click(); // Hack horrible

  chkTouchpad.addEventListener("change", (e: Event) => {
    appStatus.toggleJoystick();
  });
});
