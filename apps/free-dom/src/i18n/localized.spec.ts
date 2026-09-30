import type * as LocaleModule from './locale';
import type * as LocalizedModule from './localized';

interface Modules {
  chooseLocale: (typeof LocaleModule)['chooseLocale'];
  localized: (typeof LocalizedModule)['localized'];
  textsLoaded: (typeof LocalizedModule)['textsLoaded'];
}

const loadModules = async (): Promise<Modules> => {
  vi.resetModules();
  const { chooseLocale } = await import('./locale');
  const { localized, textsLoaded } = await import('./localized');
  return { chooseLocale, localized, textsLoaded };
};

describe('localized', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('gives the English text until Russian is chosen, then the Russian one once it is loaded', async () => {
    const { chooseLocale, localized, textsLoaded } = await loadModules();
    const greeting = localized('Hello', async () => 'Привет');

    expect(greeting()).toBe('Hello');
    chooseLocale('ru');
    expect(greeting()).toBe('Hello');
    await textsLoaded();
    expect(greeting()).toBe('Привет');
    chooseLocale('en');
    expect(greeting()).toBe('Hello');
  });

  it('loads a Russian text once, however often the language changes', async () => {
    const { chooseLocale, localized, textsLoaded } = await loadModules();
    const loadRussian = vi.fn(async () => 'Привет');
    localized('Hello', loadRussian);

    chooseLocale('ru');
    chooseLocale('en');
    chooseLocale('ru');
    await textsLoaded();

    expect(loadRussian).toHaveBeenCalledOnce();
  });

  it('loads the Russian texts before the first render when Russian was chosen last time', async () => {
    localStorage.setItem('reely.locale', JSON.stringify('ru'));
    const { localized, textsLoaded } = await loadModules();
    const greeting = localized('Hello', async () => 'Привет');

    await textsLoaded();

    expect(greeting()).toBe('Привет');
  });

  it('stays in English when the Russian text fails to load, and tries again on the next choice', async () => {
    const { chooseLocale, localized, textsLoaded } = await loadModules();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const loadRussian = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue('Привет');
    const greeting = localized('Hello', loadRussian);

    chooseLocale('ru');
    await textsLoaded();
    expect(greeting()).toBe('Hello');

    chooseLocale('en');
    chooseLocale('ru');
    await textsLoaded();
    expect(greeting()).toBe('Привет');
  });
});
