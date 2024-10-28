import { getContext, setContext } from 'svelte';

class ConfirmToastManager {
  cooldown = 1_000;
  timer: ReturnType<typeof setTimeout>;
  showing = $state(false);

  pop() {
    clearTimeout(this.timer);
    this.showing = true;
    this.timer = setTimeout(() => {
      this.showing = false;
    }, this.cooldown);
  }
}

const CONTEXT_KEY = Symbol('CT_CONTEXT');

export function setConfirmToastManager() {
  return setContext(CONTEXT_KEY, new ConfirmToastManager());
}

export function getConfirmToastManager() {
  return getContext<ReturnType<typeof setConfirmToastManager>>(CONTEXT_KEY);
}
