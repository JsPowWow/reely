import { effect } from '@reely/signals';
import { flip, later, listen, media, persisted, size, throttled } from '@reely/dommy-kit';

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
};

// what a consumer's function returns from the kit must have a type its declarations can name
export const settings = () => {
  const theme = persisted('theme', 'light');
  return { theme, phoneLayout: media('(max-width: 700px)'), calmTheme: throttled(theme, 100) };
};
