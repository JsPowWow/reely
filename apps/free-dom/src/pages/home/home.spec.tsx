import { mount } from '@reely/dommy';

import { HomePage } from './home.page';
import { chooseLocale } from '../../i18n/locale';
import { textsLoaded } from '../../i18n/localized';

describe('HomePage', () => {
  let host: HTMLElement;
  let dispose: VoidFunction;

  beforeEach(() => {
    vi.useFakeTimers();
    host = document.createElement('div');
    dispose = mount(host, () => <HomePage />);
  });

  afterEach(() => {
    dispose();
    vi.useRealTimers();
    chooseLocale('en');
  });

  it('says what reely is, beside a live board', () => {
    expect(host.querySelector('h1')?.textContent).toBe('reely — small TypeScript packages, no dependencies');
    expect(host.querySelector('[role="table"]')?.getAttribute('aria-label')).toBe('Standings of a simulated race');
    expect(document.title).toBe('reely: small TypeScript packages, no dependencies');
  });

  it('names the packages that draw the board, each leading to its plate', () => {
    const credits = Array.from(host.querySelectorAll('a[href^="#package-"]'), (link) => link.getAttribute('href'));

    expect(credits).toEqual(['#package-signals', '#package-dommy', '#package-dommy-kit']);
    expect(credits.every((href) => host.querySelector(href ?? '') !== null)).toBe(true);
  });

  it('lists every package on the same plate, in the order they stack, each opening its page', () => {
    const plates = Array.from(host.querySelectorAll<HTMLAnchorElement>('#packages li > a'));

    expect(plates.map((plate) => plate.getAttribute('href'))).toEqual([
      '/basics',
      '/signals',
      '/dommy',
      '/dommy-kit',
      '/emitter',
      '/queue',
      '/state-machine',
      '/simple-store',
      '/logger',
      '/async',
      '/colors',
      '/strings',
    ]);
    expect(plates.every((plate) => (plate.textContent ?? '').includes(' kB'))).toBe(true);
    expect(plates[0]?.textContent).toContain('Stands on its own');
    expect(plates[3]?.textContent).toContain('Built on @reely/basics, @reely/signals');
  });

  it('speaks Russian once it is chosen', async () => {
    chooseLocale('ru');
    await textsLoaded();

    expect(host.querySelector('h1')?.textContent).toBe('reely — небольшие пакеты на TypeScript без зависимостей');
    expect(host.querySelector('#packages h2')?.textContent).toBe('Пакеты');
  });
});
