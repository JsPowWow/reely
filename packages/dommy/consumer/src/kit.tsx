import { effect } from '@reely/dommy';
import { flip, later, listen, machine, media, persisted, size, throttled } from '@reely/dommy/kit';

// the kit as a consumer types it
export const start = (board: HTMLElement): void => {
  const race = machine({ initial: 'idle', states: { idle: { start: 'running' }, running: { finish: 'idle' } } });
  const phone = media('(max-width: 700px)');
  const tab = persisted('tab', 'race');
  const box = size(board);
  const gap = throttled(() => box.value.width, 500);
  listen(window, 'keydown', (event) => event.key === ' ' && race.send('start'));
  effect(() => {
    board.dataset['layout'] = phone.value ? 'phone' : `${tab.value}:${gap.value}`;
  });
  const cancel = later(0, () => board.focus());
  listen(board, 'pointerdown', cancel);
  flip(board, () => board.append(...Array.from(board.children).reverse()));
};

// what a consumer exports from the kit must have a type its declarations can name
export const theme = persisted('theme', 'light');
export const phoneLayout = media('(max-width: 700px)');
export const calmTheme = throttled(theme, 100);
export const lights = machine({ initial: 'red', states: { red: { go: 'green' }, green: { stop: 'red' } } });
