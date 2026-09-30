import { hasSome } from '@reely/basics';
import { effect, signal } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { noop } from '@reely/utils';

import { locale } from './locale';

const requests = new Set<Promise<void>>();

/** Settles once every Russian text asked for so far has loaded or failed. */
export const textsLoaded = (): Promise<void> => Promise.allSettled(requests).then(noop);

/**
 * A text in the language the site is shown in. English is at hand; Russian is loaded the first time it is
 * chosen, and until it arrives the English stays. Read it in a binding, and it follows the language.
 */
export const localized = <T>(en: T, loadRu: () => Promise<T>): (() => T) => {
  const ru = signal<T | undefined>(undefined);
  let request: Promise<void> | undefined;

  effect(() => {
    if (locale.value !== 'ru' || hasSome(request)) {
      return;
    }
    request = loadRu().then(
      (text) => {
        ru.value = text;
      },
      (error: unknown) => {
        // offline or a new deploy: stay in English, and try again when Russian is chosen next
        request = undefined;
        scopedLogger('free-dom').warn('A Russian text failed to load', error);
      }
    );
    requests.add(request);
  });

  return () => (locale.value === 'ru' ? ru.value ?? en : en);
};
