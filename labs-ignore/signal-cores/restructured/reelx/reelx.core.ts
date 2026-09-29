// Adapted from act by artalar (https://github.com/artalar/act), MIT licence.
import { hasSome } from '@reely/basics';
import type { ConstructorOf, Nullable } from '@reely/utils';
import { isInstanceOf } from '@reely/utils';

// States push, computeds pull. A subscription links itself to every state it reads, directly or
// through computeds, and a write runs the linked subscriptions. A computed links to nothing: read
// again, it re-runs only when one of its dependencies reads otherwise than it did.

type ReactiveNode<T> = StateNode<T> | ComputedNode<T>;

/** What a computed's last run gave: the value, or what it threw. */
type Outcome<T> = { readonly threw: false; readonly value: T } | { readonly threw: true; readonly value: unknown };

/** A read a computed made, with what it gave: the computed re-runs once the node reads otherwise. */
interface Dependency {
  readonly node: ReactiveNode<unknown>;
  readonly threw: boolean;
  readonly value: unknown;
}

/** What a state runs when it changes. */
interface Subscriber {
  /** The states whose `subscribers` hold it. */
  readonly sources: Array<StateNode<unknown>>;
  run(): void;
}

interface Runtime {
  /** The subscription running now: the states it reads, directly or through computeds, link to it. */
  subscriber: Nullable<Subscriber>;
  /** The subscription whose run is in progress, even inside `untracked`: what it writes never runs it again. */
  running: Nullable<Subscriber>;
  /** Where the running computed records what it reads; `null` when nothing records. */
  reads: Nullable<Dependency[]>;
  /** Bumped by every write and every subscription run: a computed checked in this epoch is current. */
  checkEpoch: number;
  /** The subscribers of the states written since the queue was last taken. */
  queue: Array<Set<Subscriber>>;
  /** Bumped when a write starts a new queue: a subscription runs once per wave. */
  wave: number;
  /** Nesting depth of `batch`: the queue runs when the outermost one ends. */
  batchDepth: number;
  /** A flush is running: writes made meanwhile join it. */
  flushing: boolean;
  /** Called with `flushSync` when a write starts a new queue. */
  schedule: Scheduler;
}

/** Decides when the subscriptions a write queued run: it gets `flushSync` to call now or later. */
export type Scheduler = (flush: VoidFunction) => void;

/** Runs the queue at once, unless inside `batch`, whose end runs it. */
const flushUnlessBatching: Scheduler = (flush) => {
  if (runtime.batchDepth === 0) {
    flush();
  }
};

const runtime: Runtime = {
  subscriber: null,
  running: null,
  reads: null,
  checkEpoch: 0,
  queue: [],
  wave: 0,
  batchDepth: 0,
  flushing: false,
  schedule: flushUnlessBatching,
};

/** How many waves of writes one flush runs before it takes them for a cycle of effects. */
const MAX_FLUSH_WAVES = 100;

const withTracking = <T>(subscriber: Nullable<Subscriber>, reads: Nullable<Dependency[]>, fn: () => T): T => {
  const outerSubscriber = runtime.subscriber;
  const outerReads = runtime.reads;
  runtime.subscriber = subscriber;
  runtime.reads = reads;
  try {
    return fn();
  } finally {
    runtime.subscriber = outerSubscriber;
    runtime.reads = outerReads;
  }
};

const removeWhere = <T>(list: T[], matches: (item: T) => boolean): void => {
  let kept = 0;
  for (const item of list) {
    if (!matches(item)) {
      list[kept++] = item;
    }
  }
  list.length = kept;
};

/** Runs the queued subscriptions, wave by wave, until no write queues more. */
export const flushSync = (): void => {
  if (runtime.flushing) {
    return;
  }
  runtime.flushing = true;
  // every subscriber runs even if one throws; the first error is rethrown at the end
  const errors: unknown[] = [];
  let waves = 0;
  try {
    while (runtime.queue.length > 0) {
      if (++waves > MAX_FLUSH_WAVES) {
        runtime.queue = [];
        throw new Error(
          `reelx: a cycle of effects, each writes a signal another one reads (${MAX_FLUSH_WAVES} waves)`,
          { cause: errors[0] }
        );
      }
      const wave = runtime.queue;
      runtime.queue = [];
      for (const subscribers of wave) {
        for (const subscriber of subscribers) {
          try {
            subscriber.run();
          } catch (error) {
            errors.push(error);
          }
        }
      }
    }
  } finally {
    runtime.flushing = false;
  }
  if (errors.length > 0) {
    throw errors[0];
  }
};

/** A value written from outside: a change runs the subscriptions that read it. */
export class StateNode<T> {
  /** The subscriptions that read it since its last change, and those made on it. */
  public subscribers = new Set<Subscriber>();
  #value: T;

  public constructor(value: T) {
    this.#value = value;
  }

  public read(): T {
    this.#link();
    runtime.reads?.push({ node: this, threw: false, value: this.#value });
    return this.#value;
  }

  /** Whether it reads otherwise than `seen` now; checking links the running subscription, as reading does. */
  public changedSince(seen: Dependency): boolean {
    this.#link();
    return seen.threw || !Object.is(seen.value, this.#value);
  }

  public write(value: T): void {
    // an equal value changes nothing, and a write is never a read
    if (Object.is(value, this.#value)) {
      return;
    }
    runtime.checkEpoch++;
    this.#value = value;
    const notified = this.subscribers;
    // a new set before the flush: the subscriptions it runs link to this one
    this.subscribers = new Set();

    // a run does not depend on what it writes, even after reading it: its own write
    // neither runs it again nor unlinks it from the rest of what it read
    const { running, reads } = runtime;
    if (hasSome(running) && notified.delete(running)) {
      removeWhere(running.sources, (source) => source === this);
    }
    if (hasSome(reads)) {
      removeWhere(reads, ({ node }) => node === this);
    }

    if (runtime.queue.push(notified) === 1) {
      runtime.wave++;
      // a flush running now takes the new wave itself
      if (!runtime.flushing) {
        runtime.schedule(flushSync);
      }
    }
  }

  #link(): void {
    const { subscriber } = runtime;
    if (hasSome(subscriber) && !this.subscribers.has(subscriber)) {
      this.subscribers.add(subscriber);
      subscriber.sources.push(this);
    }
  }
}

/**
 * A value derived by `compute`. What it threw is kept like a value and rethrown on every read
 * until a dependency changes; one that read nothing is a constant once it has run.
 */
export class ComputedNode<T> {
  /** The subscriptions made on it; only `reelxDebug` counts them, states run the rest. */
  public readonly subscribers = new Set<Subscriber>();
  readonly #compute: () => T;
  readonly #dependencies: Dependency[] = [];
  #outcome: Nullable<Outcome<T>> = null;
  #checkedIn = -1;
  // a check links the states behind to the subscription it ran for; another reader checks again
  #checkedFor: Nullable<Subscriber> = null;

  public constructor(compute: () => T) {
    this.#compute = compute;
  }

  public read(): T {
    const outcome = this.#current();
    runtime.reads?.push({ node: this, threw: outcome.threw, value: outcome.value });
    if (outcome.threw) {
      throw outcome.value;
    }
    return outcome.value;
  }

  /** Whether it reads otherwise than `seen` now; checking links the running subscription, as reading does. */
  public changedSince(seen: Dependency): boolean {
    const now = this.#current();
    return now.threw !== seen.threw || !Object.is(now.value, seen.value);
  }

  #current(): Outcome<T> {
    const outcome = this.#outcome;
    const checked = this.#checkedIn === runtime.checkEpoch && this.#checkedFor === runtime.subscriber;
    if (hasSome(outcome) && (checked || !this.#dependencyChanged())) {
      this.#markChecked();
      return outcome;
    }
    // swaps `reads` inline, not through `withTracking`: a chain of computeds recurses through
    // here, and one frame less per link lets a longer chain fit in the stack
    const outerReads = runtime.reads;
    runtime.reads = this.#dependencies;
    this.#dependencies.length = 0;
    try {
      return (this.#outcome = { threw: false, value: this.#compute() });
    } catch (error) {
      return (this.#outcome = { threw: true, value: error });
    } finally {
      runtime.reads = outerReads;
      this.#markChecked();
    }
  }

  #markChecked(): void {
    this.#checkedIn = runtime.checkEpoch;
    this.#checkedFor = runtime.subscriber;
  }

  #dependencyChanged(): boolean {
    for (const dependency of this.#dependencies) {
      if (dependency.node.changedSince(dependency)) {
        return true;
      }
    }
    return false;
  }
}

class Subscription<T> implements Subscriber {
  public readonly sources: Array<StateNode<unknown>> = [];
  readonly #node: ReactiveNode<T>;
  readonly #callback: (value: T, prevValue?: T) => void;
  #ranInWave = -1;
  #disposed = false;
  #last: T | undefined = undefined;

  public constructor(node: ReactiveNode<T>, callback: (value: T, prevValue?: T) => void) {
    this.#node = node;
    this.#callback = callback;
  }

  public run(): void {
    // a subscription disposed inside `batch` may still be queued
    if (this.#disposed || this.#ranInWave === runtime.wave) {
      return;
    }
    this.#ranInWave = runtime.wave;
    this.unlink();
    // the computeds it reads check their dependencies again, which links it to the states behind them
    runtime.checkEpoch++;
    const outerRunning = runtime.running;
    runtime.running = this;
    try {
      // a subscription made inside another computation is a new root: it takes nothing from the outer one
      withTracking(this, null, () => {
        const value = this.#node.read();
        if (!Object.is(value, this.#last)) {
          const prevValue = this.#last;
          this.#last = value;
          this.#callback(value, prevValue);
        }
      });
    } finally {
      runtime.running = outerRunning;
    }
  }

  public dispose(): void {
    this.#disposed = true;
    this.#node.subscribers.delete(this);
    this.unlink();
  }

  public unlink(): void {
    for (const source of this.sources.splice(0)) {
      source.subscribers.delete(this);
    }
  }
}

/** Calls `callback` with the value of `node` now and after every change; returns the unsubscribe. */
export const subscribe = <T>(node: ReactiveNode<T>, callback: (value: T, prevValue?: T) => void): VoidFunction => {
  const subscription = new Subscription(node, callback);
  try {
    subscription.run();
  } catch (error) {
    // a first run that throws leaves no subscription behind
    subscription.unlink();
    throw error;
  }
  node.subscribers.add(subscription);
  return (): void => subscription.dispose();
};

/** Groups writes: effects and bindings run once, when the outermost `batch` ends. */
export const batch = <T>(fn: () => T): T => {
  runtime.batchDepth++;
  try {
    return fn();
  } finally {
    if (--runtime.batchDepth === 0) {
      flushSync();
    }
  }
};

/** Replaces how writes schedule the flush; returns the scheduler it replaced. */
export const setScheduler = (schedule: Scheduler): Scheduler => {
  const replaced = runtime.schedule;
  runtime.schedule = schedule;
  return replaced;
};

/** Runs `fn` without subscribing the running effect or computed to the signals it reads. */
export const untracked = <T>(fn: () => T): T => withTracking(null, null, fn);

const nodes = new WeakMap<object, ReactiveNode<unknown>>();

/** The function that reads `node`; `nodeOf` finds the node back from it. */
export const readerOf = <T>(node: ReactiveNode<T>): (() => T) => {
  const read: () => T = node.read.bind(node);
  nodes.set(read, node);
  return read;
};

/** The node of `kind` behind a function made by `readerOf`. */
export const nodeOf = <N>(read: object, kind: ConstructorOf<N>): N => {
  const node = nodes.get(read);
  if (isInstanceOf(kind, node)) {
    return node;
  }
  throw new TypeError('reelx: not a signal of this kind');
};

/** Test hooks for the node behind a signal or computed. */
export const reelxDebug = (
  read: object
): {
  /** How many subscriptions read it now: tests count them to prove that `dispose` released them. */
  subscriberCount: () => number;
} => ({
  subscriberCount: (): number => nodes.get(read)?.subscribers.size ?? 0,
});
