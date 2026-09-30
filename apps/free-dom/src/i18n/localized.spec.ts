import type * as LocaleModule from './locale';
import type * as LocalizedModule from './localized';

interface Modules {
  locale: (typeof LocaleModule)['locale'];
  localized: (typeof LocalizedModule)['localized'];
  textsLoaded: (typeof LocalizedModule)['textsLoaded'];
}

const loadModules = async (): Promise<Modules> => {
  vi.resetModules();
  const { locale } = await import('./locale');
  const { localized, textsLoaded } = await import('./localized');
  return { locale, localized, textsLoaded };
};

describe('localized', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('gives the English text until Russian is chosen, then the Russian one once it is loaded', async () => {
    const { locale, localized, textsLoaded } = await loadModules();
    const greeting = localized('Hello', async () => 'Привет');

    expect(greeting()).toBe('Hello');
    locale.value = 'ru';
    expect(greeting()).toBe('Hello');
    await textsLoaded();
    expect(greeting()).toBe('Привет');
    locale.value = 'en';
    expect(greeting()).toBe('Hello');
  });

  it('loads a Russian text once, however often the language changes', async () => {
    const { locale, localized, textsLoaded } = await loadModules();
    const loadRussian = vi.fn(async () => 'Привет');
    localized('Hello', loadRussian);

    locale.value = 'ru';
    locale.value = 'en';
    locale.value = 'ru';
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
    const { locale, localized, textsLoaded } = await loadModules();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const loadRussian = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue('Привет');
    const greeting = localized('Hello', loadRussian);

    locale.value = 'ru';
    await textsLoaded();
    expect(greeting()).toBe('Hello');

    locale.value = 'en';
    locale.value = 'ru';
    await textsLoaded();
    expect(greeting()).toBe('Привет');
  });
});
