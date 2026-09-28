/** Clicks the button whose text is `label`; a test fails loudly when there is none. */
export const clickButton = (root: Element, label: string): void => {
  const button = Array.from(root.querySelectorAll('button')).find((item) => item.textContent === label);
  if (!button) {
    throw new Error(`No "${label}" button`);
  }
  button.click();
};

/** Waits for the mutation observers to report what has been written so far. */
export const flushMutations = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));
