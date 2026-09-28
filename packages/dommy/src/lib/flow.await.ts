import { hasSome, isSomeFunction, toErrorWithMessage } from '@reely/utils';

import { onCleanup } from './reactive/owner';
import { bindValue } from './utils/element.bindings';
import { createFlowSlot } from './utils/flow.slot';

import type { ReactiveValue, ReelyNode } from './types/dommy.types';

/** @template T - The value the promise resolves to. */
export interface AwaitProps<T> {
  /**
   * The promise, or a signal or getter of it. A getter is tracked: when a signal it reads
   * changes, it is called again, the fallback is shown again, and the result of the promise it
   * replaced is dropped. `promise={loadFinal}` starts the load when the flow renders.
   */
  promise: PromiseLike<T> | ReactiveValue<PromiseLike<T>>;
  /** Renders the branch shown once the promise resolves, with its value. */
  children: (value: T) => ReelyNode;
  /** Renders the branch shown while the promise is pending; nothing by default. */
  fallback?: () => ReelyNode;
  /**
   * Renders the branch shown when the promise rejects, with the reason as an `Error`. Without
   * it the slot is cleared and the rejection goes on unhandled, so the error is never lost.
   */
  catch?: (error: Error) => ReelyNode;
}

/**
 * Shows the fallback while a promise is pending, then its result or its error. Like `Show`,
 * a branch is rendered when it is shown and removed with its subscriptions when it is hidden.
 * Only the latest promise counts: once a newer one is shown, or the render is disposed, an
 * earlier one renders nothing when it settles.
 *
 * @template T - The value the promise resolves to.
 * @param {AwaitProps<T>} props - The promise and the three branches.
 * @returns {DocumentFragment} The shown branch between the two anchors it keeps its place by.
 */
export const Await = <T,>({ promise, children, fallback, catch: renderError }: AwaitProps<T>): DocumentFragment => {
  const slot = createFlowSlot('Await');
  // each wait takes a turn; a settled promise renders only while its turn is still the latest
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
        if (hasSome(renderError)) {
          slot.show(() => renderError(toErrorWithMessage(reason)));
          return;
        }
        slot.show();
        throw reason;
      }
    );
  };

  onCleanup(() => {
    latest += 1;
  });
  if (isSomeFunction(promise)) {
    bindValue(promise, wait);
  } else {
    wait(promise);
  }
  return slot.fragment;
};
