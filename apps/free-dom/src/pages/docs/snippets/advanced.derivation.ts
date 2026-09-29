import { effect, signal } from '@reely/dommy';
import { later, persisted, throttled } from '@reely/dommy/kit';

// Kept in localStorage, and synced across tabs.
export const email = persisted('email', 'kenji.watanabe@example.com');

// Several signals from one source.
export const user = signal('');
export const domain = signal('');
effect(() => {
  [user.value = '', domain.value = ''] = email.value.split('@');
});

// Saved a second after typing stops; a new keystroke cancels the pending save.
export const saved = signal('');
effect(() => {
  const address = email.value;
  later(1000, () => (saved.value = address));
});

// At most one change per 300 ms, the latest last: what a lookup as you type should read.
export const lookup = throttled(email, 300);
