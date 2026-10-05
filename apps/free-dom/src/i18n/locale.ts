import { batch, computed, effect, signal } from '@reely/dommy';
import { persisted } from '@reely/dommy-kit';

/** The languages the site is written in. */
export type Locale = 'en' | 'ru';

const locales: ReadonlySet<unknown> = new Set<Locale>(['en', 'ru']);

const isLocale = (maybeLocale: unknown): maybeLocale is Locale => locales.has(maybeLocale);

// only a language the reader picked is kept; until then the site follows the browser
const choice = persisted<Locale | null>('reely.locale', null, {
  is: (stored): stored is Locale | null => stored === null || isLocale(stored),
});

/** The query param that names the language; the router keeps it from page to page. */
export const localeParam = 'lang';

/** The language a query names (`?lang=ru`), if it names one of the site's. */
export const localeIn = (search: string): Locale | null => {
  const named = new URLSearchParams(search).get(localeParam);
  return isLocale(named) ? named : null;
};

// a link names the language it was shared in: it holds for this visit, and only the switch keeps a choice
const linked = signal(localeIn(location.search));

/**
 * The language the site is shown in: the one the link named, else the reader's choice, else Russian for a
 * Russian browser, else English.
 */
export const locale = computed(
  (): Locale => linked.value ?? choice.value ?? (navigator.language.startsWith('ru') ? 'ru' : 'en')
);

/** Shows the site in `language` from now on, on this visit and the next ones. */
export const chooseLocale = (language: Locale): void => {
  batch(() => {
    linked.value = null;
    choice.value = language;
  });
};

effect(() => {
  document.documentElement.lang = locale.value;
});
