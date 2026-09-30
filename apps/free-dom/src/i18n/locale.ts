import { effect } from '@reely/dommy';
import { persisted } from '@reely/dommy/kit';

/** The languages the site is written in. */
export type Locale = 'en' | 'ru';

const locales: ReadonlySet<unknown> = new Set<Locale>(['en', 'ru']);

const isLocale = (maybeLocale: unknown): maybeLocale is Locale => locales.has(maybeLocale);

/** The language the site is shown in: the reader's last choice, else Russian for a Russian browser, else English. */
export const locale = persisted<Locale>('reely.locale', navigator.language.startsWith('ru') ? 'ru' : 'en', {
  is: isLocale,
});

effect(() => {
  document.documentElement.lang = locale.value;
});
