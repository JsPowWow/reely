import { effect } from '@reely/signals';
import { debounced, flip, hold, later, listen, media, persisted, size, throttled } from '@reely/dommy-kit';

export const start = (board: HTMLElement): void => {
  const phone = media('(max-width: 700px)');
  const tab = persisted('tab', 'race');
  const box = size(board);
  const gap = throttled(() => box.value.width, 500);
  listen(window, 'keydown', (event) => event.key === ' ' && board.focus());
  effect(() => {
    board.dataset['layout'] = phone.value ? 'phone' : `${tab.value}:${gap.value}`;
  });
  const cancel = later(0, () => board.focus());
  listen(board, 'pointerdown', cancel);
  flip(board, () => board.append(...Array.from(board.children).reverse()));
  const save = debounced((width: number) => localStorage.setItem('width', String(width)), 300);
  listen(board, ['pointerup', 'pointercancel'], (event) => save(event.clientX));
  hold(board, (down) => (down.isPrimary ? { move: (event) => save(event.clientX), up: save.flush } : undefined), {
    prevent: true,
  });
};

// what a consumer's function returns from the kit must have a type its declarations can name
export const settings = () => {
  const theme = persisted('theme', 'light');
  return {
    theme,
    phoneLayout: media('(max-width: 700px)'),
    calmTheme: throttled(theme, 100),
    saveTheme: debounced((next: string) => theme.set(next), 100),
  };
};
