import { computed, signal } from '@reely/dommy';

// Granular: a binding of the name never runs for a new avatar.
export const profile = { name: signal('Maria Silva'), avatarUrl: signal('/avatars/maria.png') };

// One signal of an object: read a field through a computed, which passes a change on only when
// its own result differs, so a new avatar does not reach the bindings of `accountName`.
export const account = signal({ name: 'Maria Silva', avatarUrl: '/avatars/maria.png' });
export const accountName = computed(() => account.value.name);
