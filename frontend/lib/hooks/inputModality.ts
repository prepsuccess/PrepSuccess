/**
 * Remembers whether the user's last input was a pointer (mouse/touch/pen) or
 * the keyboard. Used to keep focus rings for keyboard users only: after a
 * mouse click closes a menu, focus isn't pushed back onto its trigger, so
 * Chrome doesn't draw a focus ring nobody asked for.
 */
let lastInput: "pointer" | "keyboard" = "pointer";
let listening = false;

function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  // Capture phase, so this runs before any component handles the event.
  window.addEventListener("pointerdown", () => (lastInput = "pointer"), true);
  window.addEventListener("keydown", () => (lastInput = "keyboard"), true);
}

listen();

export function lastInputWasPointer() {
  listen();
  return lastInput === "pointer";
}
