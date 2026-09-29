import type { PromiseReject, PromiseResolve } from '../types/function.types';

/**
 * A promise with its `resolve` and `reject`, to settle it from outside its executor.
 *
 * @template R - The value it resolves with.
 * @template E - The error it rejects with.
 */
export interface PromiseResolver<R, E extends Error = Error> {
  promise: Promise<R>;
  resolve: PromiseResolve<R>;
  reject: PromiseReject<E>;
}

/**
 * Creates a promise to settle from outside, as `Promise.withResolvers` does, with a typed rejection.
 *
 * @template R - The value it resolves with.
 * @template E - The error it rejects with.
 * @returns {PromiseResolver<R, E>} The promise and the functions that settle it.
 */
export default function promiseResolver<R, E extends Error = Error>(): PromiseResolver<R, E> {
  const { promise, resolve, reject } = Promise.withResolvers<R>();
  return { promise, resolve, reject };
}
