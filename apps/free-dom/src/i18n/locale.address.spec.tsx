import { withOwner } from '@reely/signals';

import type * as LocaleModule from './locale';
import type * as AddressModule from './locale.address';

/** Fresh modules, read from the address and the storage as they are now. */
const load = async (): Promise<typeof LocaleModule & typeof AddressModule> => {
  vi.resetModules();
  return { ...(await import('./locale')), ...(await import('./locale.address')) };
};

describe('the language in the address', () => {
  afterEach(() => {
    history.replaceState(null, '', '/');
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('names the language shown, and follows a switch, keeping the rest of the address', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    history.replaceState(null, '', '/games/memory?sort=moves#leaderboard');
    const { chooseLocale, showLocaleInAddress } = await load();

    withOwner(() => showLocaleInAddress());
    expect(location.search).toBe('?sort=moves&lang=en');
    expect(location.hash).toBe('#leaderboard');

    chooseLocale('ru');
    expect(location.search).toBe('?sort=moves&lang=ru');
    expect(location.pathname).toBe('/games/memory');
  });

  it('keeps the language a shared link names', async () => {
    history.replaceState(null, '', '/dommy?lang=ru');
    const { locale, showLocaleInAddress } = await load();

    withOwner(() => showLocaleInAddress());

    expect(locale.value).toBe('ru');
    expect(location.search).toBe('?lang=ru');
  });
});
