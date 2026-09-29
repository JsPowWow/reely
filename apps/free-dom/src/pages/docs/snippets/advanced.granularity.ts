import { computed, signal } from '@reely/dommy';

// Granular: a binding of `laps` never runs for a new theme.
export const race = { theme: signal('dark'), laps: signal(5) };

// One signal of an object: read a field through a computed, which passes a change on only when
// its own result differs, so a new `laps` does not reach the bindings of `theme`.
export const settings = signal({ theme: 'dark', laps: 5 });
export const theme = computed(() => settings.value.theme);
