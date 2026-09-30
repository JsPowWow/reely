import type * as LocaleModule from './locale';

const key = 'reely.locale';

/** A fresh `locale`, read from the storage and the browser as they are now. */
const loadLocale = async (): Promise<typeof LocaleModule> => {
  vi.resetModules();
  return import('./locale');
};

describe('locale', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts in the language chosen last time', async () => {
    localStorage.setItem(key, JSON.stringify('ru'));

    const { locale } = await loadLocale();

    expect(locale.value).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
  });

  it('starts in Russian for a Russian browser and in English for any other', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ru-RU');
    expect((await loadLocale()).locale.value).toBe('ru');

    localStorage.clear();
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('de-DE');
    expect((await loadLocale()).locale.value).toBe('en');
  });

  it('ignores a stored value that is not a language of the site', async () => {
    localStorage.setItem(key, JSON.stringify('fr'));
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');

    expect((await loadLocale()).locale.value).toBe('en');
  });

  it('keeps a new choice for the next visit and marks the document with it', async () => {
    const { chooseLocale, locale } = await loadLocale();

    chooseLocale('ru');

    expect(locale.value).toBe('ru');
    expect(localStorage.getItem(key)).toBe(JSON.stringify('ru'));
    expect(document.documentElement.lang).toBe('ru');
  });

  it('follows the browser from visit to visit until the reader chooses', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ru-RU');
    await loadLocale();
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');

    expect((await loadLocale()).locale.value).toBe('en');
  });
});
