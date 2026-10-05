import { isSomeFunction, toErrorWithMessage } from '@reely/basics';
import { onCleanup } from '@reely/signals';
import { toErrorString } from '@reely/utils';

import { createFlowSlot } from './flow.slot';
import { bindValue } from '../utils/element.bindings';

import type { ReactiveValue, ReelyNode } from '../types/dommy.types';

export interface AwaitProps<T> {
  /**
   * The promise, or a signal or getter of it. A getter reruns when what it reads changes: the
   * fallback shows again and the replaced promise is dropped. A getter that throws is a rejection.
   */
  promise: PromiseLike<T> | ReactiveValue<PromiseLike<T>>;
  children: (value: T) => ReelyNode;
  /** Shown while the promise is pending; nothing by default. */
  fallback?: () => ReelyNode;
  /** Required, so a failure always has a view; a JavaScript caller without it gets the error as text. */
  catch: (error: Error) => ReelyNode;
}

// `Promise.try` (ES2025), for runtimes without it: the getter runs now, so the binding tracks what
// it reads, and a getter that throws before it returns a promise fails like a rejected one
function attempt<T>(get: () => PromiseLike<T>): Promise<T> {
  try {
    return Promise.resolve(get());
  } catch (error) {
    return Promise.reject(toErrorWithMessage(error));
  }
}

/**
 * Shows the fallback while a promise is pending, then its result or its error. Only the latest
 * promise counts: an earlier one, or one settling after disposal, renders nothing.
 */
export const Await = <T>({ promise, children, fallback, catch: renderError }: AwaitProps<T>): DocumentFragment => {
  const slot = createFlowSlot('Await');
  let latest = 0;

  const wait = (pending: PromiseLike<T>): void => {
    const turn = ++latest;
    slot.show(fallback);
    pending.then(
      (value) => {
        if (turn === latest) {
          slot.show(() => children(value));
        }
      },
      (reason: unknown) => {
        if (turn !== latest) {
          return;
        }
        slot.show(() =>
          isSomeFunction(renderError) ? renderError(toErrorWithMessage(reason)) : toErrorString(reason)
        );
      }
    );
  };

  onCleanup(() => {
    latest += 1;
  });
  if (isSomeFunction(promise)) {
    bindValue(() => attempt(promise), wait);
  } else {
    wait(promise);
  }
  return slot.fragment;
};
