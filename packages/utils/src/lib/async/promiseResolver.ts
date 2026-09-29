import type { PromiseReject, PromiseResolve } from '../types/function.types';

export interface PromiseResolver<R, E extends Error = Error> {
  promise: Promise<R>;
  resolve: PromiseResolve<R>;
  reject: PromiseReject<E>;
}

/** `Promise.withResolvers` with a typed rejection. */
export default function promiseResolver<R, E extends Error = Error>(): PromiseResolver<R, E> {
  const { promise, resolve, reject } = Promise.withResolvers<R>();
  return { promise, resolve, reject };
}
