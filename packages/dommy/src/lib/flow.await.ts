import { isSomeFunction } from '@reely/basics';
import { toErrorString, toErrorWithMessage } from '@reely/utils';

import { onCleanup } from './reactive/owner';
import { bindValue } from './utils/element.bindings';
import { createFlowSlot } from './utils/flow.slot';

import type { ReactiveValue, ReelyNode } from './types/dommy.types';

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
    // a getter that throws before it returns a promise fails like a rejected one
    bindValue(() => Promise.try(promise), wait);
  } else {
    wait(promise);
  }
  return slot.fragment;
};
