import { computed, effect } from '@reely/dommy';
import { persisted } from '@reely/dommy/kit';

/** The languages the site is written in. */
export type Locale = 'en' | 'ru';

const locales: ReadonlySet<unknown> = new Set<Locale>(['en', 'ru']);

const isLocale = (maybeLocale: unknown): maybeLocale is Locale => locales.has(maybeLocale);

// only a language the reader picked is kept; until then the site follows the browser
const choice = persisted<Locale | null>('reely.locale', null, {
  is: (stored): stored is Locale | null => stored === null || isLocale(stored),
});

/** The language the site is shown in: the reader's choice, else Russian for a Russian browser, else English. */
export const locale = computed((): Locale => choice.value ?? (navigator.language.startsWith('ru') ? 'ru' : 'en'));

/** Shows the site in `language` from now on, on this visit and the next ones. */
export const chooseLocale = (language: Locale): void => {
  choice.value = language;
};

effect(() => {
  document.documentElement.lang = locale.value;
});
