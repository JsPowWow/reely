import { mount } from '@reely/dommy';
import { isInstanceOf } from '@reely/utils';

/** Clicks the button whose text is `label`; a test fails loudly when there is none. */
export const clickButton = (root: Element, label: string): void => {
  const button = Array.from(root.querySelectorAll('button')).find((item) => item.textContent === label);
  if (!button) {
    throw new Error(`No "${label}" button`);
  }
  button.click();
};

// `root` itself when it is an input, else the first input under it
const firstInput = (root: Element): HTMLInputElement => {
  const input = isInstanceOf(HTMLInputElement, root) ? root : root.querySelector('input');
  if (!input) {
    throw new Error('No input');
  }
  return input;
};

/** Types `value` into `root`, or the first input under it, as a keystroke would report it. */
export const typeInto = (root: Element, value: string): void => {
  const input = firstInput(root);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

/** Ticks `root`, or the first checkbox under it, and reports the change. */
export const tick = (root: Element): void => {
  const box = firstInput(root);
  box.checked = true;
  box.dispatchEvent(new Event('change', { bubbles: true }));
};

/** A view mounted on a detached element, until `dispose`. */
export interface Mounted {
  host: HTMLElement;
  dispose: VoidFunction;
  text: () => string;
}

export const mounted = (view: () => Node): Mounted => {
  const host = document.createElement('div');
  return { host, dispose: mount(host, view), text: () => host.textContent ?? '' };
};

/** Waits for the mutation observers to report what has been written so far. */
export const flushMutations = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));
