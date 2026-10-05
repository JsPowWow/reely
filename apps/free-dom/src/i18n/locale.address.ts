import { effect } from '@reely/dommy';
import { navigate } from '@reely/dommy/router';

import { locale, localeParam } from './locale';

/**
 * Keeps the language shown in the address, so a copied link opens the site in the language its sender saw:
 * a switch of language replaces the entry, and is no move, since the router keeps `lang` as a setting.
 */
export const showLocaleInAddress = (): void => {
  effect(() => {
    const address = new URL(location.href);
    address.searchParams.set(localeParam, locale.value);
    navigate(address, { replace: true });
  });
};
