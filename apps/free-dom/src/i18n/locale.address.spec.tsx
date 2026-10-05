import { mount } from '@reely/dommy';
import { defineRoutes, navigate, Router } from '@reely/dommy/router';
import { withOwner } from '@reely/signals';

import { chooseLocale, localeParam } from './locale';
import { showLocaleInAddress } from './locale.address';

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

  it('names the language shown again on a page the reader comes back to', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    chooseLocale('en');
    history.replaceState(null, '', '/');
    const routes = defineRoutes({ '/': () => () => 'Home', '/docs': () => () => 'Docs' });
    const host = document.createElement('main');
    const dispose = mount(host, () => {
      showLocaleInAddress();
      return <Router routes={routes} keep={[localeParam]} catch={() => <p>Lost</p>} />;
    });
    navigate('/docs');
    await vi.waitFor(() => expect(host.textContent).toBe('Docs'));
    chooseLocale('ru');

    history.back();
    await vi.waitFor(() => expect(host.textContent).toBe('Home'));

    expect(location.search).toBe('?lang=ru');
    dispose();
  });

  it('keeps the language a shared link names', async () => {
    history.replaceState(null, '', '/dommy?lang=ru');
    const { locale, showLocaleInAddress } = await load();

    withOwner(() => showLocaleInAddress());

    expect(locale.value).toBe('ru');
    expect(location.search).toBe('?lang=ru');
  });
});
