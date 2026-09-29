import { effect, signal } from '@reely/dommy';
import { later, persisted, throttled } from '@reely/dommy/kit';

// Kept in localStorage, and synced across tabs.
export const fullName = persisted('fullName', 'Tao Xin');

// Several signals from one source.
export const firstName = signal('');
export const lastName = signal('');
effect(() => {
  [firstName.value = '', lastName.value = ''] = fullName.value.split(' ');
});

// The same value a second later; a new name cancels the pending one.
export const delayed = signal('');
effect(() => {
  const name = fullName.value;
  later(1000, () => (delayed.value = name));
});

// At most one change per 100 ms, the latest last.
export const calm = throttled(fullName, 100);
