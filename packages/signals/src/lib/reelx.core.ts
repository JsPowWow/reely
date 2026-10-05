// A push-pull signal graph: a write marks what may have changed, a read brings a node up to date.
import { hasSome } from '@reely/basics';
import type { Nullable } from '@reely/utils';
import { isInstanceOf, isNil, noop } from '@reely/utils';

/** A value read reactively: a signal, a computed or any getter of them; an effect or computed that reads it follows it. */
export type ReactiveValue<T> = () => T;

// a method type: its parameters stay bivariant, so a `Signal<T>` is a `Signal<unknown>`
type Equality<T> = { bivarianceHack(previous: T, next: T): boolean }['bivarianceHack'];

/** How a signal tells a write that changes nothing from one that notifies. */
export interface SignalOptions<T> {
  /**
   * Whether a write leaves the value unchanged, so nothing is notified; `Object.is` by default.
   * `false` (or `() => false`) notifies every write, for an object changed in place.
   */
  equals?: Equality<T> | false;
}

interface Source {
  // grows with every change of the value, so an observer can tell whether what it read is still current
  readonly version: number;
  readonly observers: ReadonlySet<Computation<unknown>>;
  refresh(): void;
  observe(observer: Computation<unknown>): void;
  unobserve(observer: Computation<unknown>): void;
}

interface Link {
  version: number;
  readIn: number;
}

// the value, or what the computation threw
type Outcome<T> = { readonly threw: false; readonly value: T } | { readonly threw: true; readonly value: unknown };

const MAX_FLUSH_WAVES = 100;

// grows with every write: an unlinked computed hears no writes, but one checked at this epoch is current;
// a signal's version is the epoch of its last change, so a version is never handed out twice
let epoch = 0;
let tracker: Nullable<Computation<unknown>> = null;
// the computation whose `fn` runs now, tracked or not: its own writes never run it again
let running: Nullable<Computation<unknown>> = null;
let batchDepth = 0;
// the signals written in the batch running now, which remember what they held before it
let batchWrites: Signal<unknown>[] = [];
let queue: Effect[] = [];
let flushing = false;

const setTracker = (observer: Nullable<Computation<unknown>>): Nullable<Computation<unknown>> => {
  const outer = tracker;
  tracker = observer;
  return outer;
};

const setRunning = (computation: Nullable<Computation<unknown>>): Nullable<Computation<unknown>> => {
  const outer = running;
  running = computation;
  return outer;
};

class Signal<T> implements Source {
  public version = 0;
  public readonly observers = new Set<Computation<unknown>>();
  public readonly refresh = noop;
  // the value and version before the first write of the batch running now
  private beforeBatch: Nullable<{ readonly value: T; readonly version: number }> = null;

  constructor(private value: T, private readonly options: SignalOptions<T>) {}

  public readonly read = (): T => {
    tracker?.onRead(this);
    return this.value;
  };

  public observe(observer: Computation<unknown>): void {
    this.observers.add(observer);
  }

  public forgetBatch(): void {
    this.beforeBatch = null;
  }

  public unobserve(observer: Computation<unknown>): void {
    this.observers.delete(observer);
  }

  public write(value: T): void {
    const { equals = Object.is } = this.options;
    if (equals !== false && equals(this.value, value)) {
      return;
    }
    if (batchDepth > 0 && isNil(this.beforeBatch)) {
      this.beforeBatch = { value: this.value, version: this.version };
      batchWrites.push(this);
    }
    const { beforeBatch } = this;
    // a batch that puts the value back changes nothing for what read it before the batch
    const reverted = hasSome(beforeBatch) && equals !== false && equals(beforeBatch.value, value);
    epoch++;
    this.value = reverted ? beforeBatch.value : value;
    this.version = reverted ? beforeBatch.version : epoch;
    running?.onOwnWrite(this);
    const idle = queue.length === 0;
    for (const observer of this.observers) {
      observer.mark(this);
    }
    if (idle && queue.length > 0 && batchDepth === 0 && !flushing) {
      flushSync();
    }
  }
}

// runs `fn` recording what it reads, and reruns it on demand only when one of those sources changed
abstract class Computation<T> {
  public version = 0;
  // a source may have changed; the versions of the sources tell whether one did
  protected needsCheck = false;
  // in the order first read
  protected readonly sources = new Map<Source, Link>();
  protected outcome: Nullable<Outcome<T>> = null;
  private runCount = 0;
  private checkedAt = -1;
  private markedAt = -1;
  private deafTo: Nullable<Set<Source>> = null;
  // checking its sources or computing: a read of it now is a cycle
  private refreshing = false;

  constructor(private readonly fn: () => T) {}

  // whether its sources hold it, so that their writes reach it
  protected abstract get linked(): boolean;

  // `written` is the signal whose write this mark carries
  public mark(written: Source): void {
    // once per write: a node already marked by an earlier write still passes a new one on
    if (this.markedAt === epoch) {
      return;
    }
    this.markedAt = epoch;
    // A run does not depend on a signal it writes, read directly or through a computed: its own
    // write coming back makes it deaf to that signal until it reads it again or runs again.
    if (this === running) {
      this.deafTo ??= new Set();
      this.deafTo.add(written);
    } else if (!this.deafTo?.has(written)) {
      this.onMarked(written);
    }
  }

  // what a run writes itself is not a change it missed
  public onOwnWrite(source: Source): void {
    const link = this.sources.get(source);
    if (hasSome(link)) {
      link.version = source.version;
    }
  }

  public onRead(source: Source): void {
    this.deafTo?.delete(source);
    const link = this.sources.get(source);
    if (hasSome(link)) {
      link.version = source.version;
      link.readIn = this.runCount;
      return;
    }
    this.sources.set(source, { version: source.version, readIn: this.runCount });
    if (this.linked) {
      source.observe(this);
    }
  }

  public refresh(): Outcome<T> {
    if (this.refreshing) {
      throw new Error('reelx: a cycle of computeds, one reads itself through what it reads');
    }
    const current = this.outcome;
    if (hasSome(current) && !this.needsCheck && (this.linked || this.checkedAt === epoch)) {
      return current;
    }
    this.refreshing = true;
    try {
      return this.update(current);
    } catch (error) {
      // a cycle among its sources broke the check off: the next read computes it afresh
      this.outcome = null;
      throw error;
    } finally {
      this.refreshing = false;
    }
  }

  protected detach(): void {
    for (const source of this.sources.keys()) {
      source.unobserve(this);
    }
  }

  private update(current: Nullable<Outcome<T>>): Outcome<T> {
    this.needsCheck = false;
    this.checkedAt = epoch;
    if (hasSome(current) && !this.sourceChanged()) {
      return current;
    }

    const { fn } = this;
    this.runCount++;
    this.deafTo = null;
    const outer = setTracker(this);
    const outerRunning = setRunning(this);
    let next: Outcome<T>;
    try {
      next = { threw: false, value: fn() };
    } catch (error) {
      next = { threw: true, value: error };
    }
    setTracker(outer);
    setRunning(outerRunning);
    this.dropUnread();
    if (!hasSome(current) || current.threw !== next.threw || !Object.is(current.value, next.value)) {
      this.version++;
    }
    this.outcome = next;
    return next;
  }

  private unlink(source: Source): void {
    this.sources.delete(source);
    source.unobserve(this);
  }

  private sourceChanged(): boolean {
    for (const [source, { version }] of this.sources) {
      source.refresh();
      if (source.version !== version) {
        return true;
      }
    }
    return false;
  }

  private dropUnread(): void {
    for (const [source, link] of this.sources) {
      if (link.readIn !== this.runCount) {
        this.unlink(source);
      }
    }
  }

  protected abstract onMarked(written: Source): void;
}

class Computed<T> extends Computation<T> implements Source {
  public readonly observers = new Set<Computation<unknown>>();

  protected get linked(): boolean {
    return this.observers.size > 0;
  }

  public readonly read = (): T => {
    const outcome = this.refresh();
    tracker?.onRead(this);
    if (outcome.threw) {
      throw outcome.value;
    }
    return outcome.value;
  };

  public observe(observer: Computation<unknown>): void {
    if (this.observers.size === 0) {
      for (const source of this.sources.keys()) {
        source.observe(this);
      }
    }
    this.observers.add(observer);
  }

  public unobserve(observer: Computation<unknown>): void {
    if (this.observers.delete(observer) && this.observers.size === 0) {
      this.detach();
    }
  }

  protected onMarked(written: Source): void {
    this.needsCheck = true;
    for (const observer of this.observers) {
      observer.mark(written);
    }
  }
}

// stays linked until disposed; a mark queues it to run
class Effect extends Computation<void> {
  private disposed = false;

  protected get linked(): boolean {
    return !this.disposed;
  }

  public readonly dispose = (): void => {
    this.disposed = true;
    this.detach();
    this.sources.clear();
  };

  // runs it if what it read has changed, and throws what that run threw
  public run(): void {
    if (this.disposed) {
      return;
    }
    const before = this.outcome;
    const after = this.refresh();
    if (after !== before && after.threw) {
      throw after.value;
    }
  }

  // taken out of the queue without running: the next write queues it again
  public dequeue(): void {
    this.needsCheck = false;
  }

  protected onMarked(): void {
    if (!this.needsCheck) {
      this.needsCheck = true;
      queue.push(this);
    }
  }
}

/** Runs the queued effects now; what they write joins as the next wave. Every effect runs, the first error is rethrown. */
const flushSync = (): void => {
  if (flushing) {
    return;
  }
  flushing = true;
  let failure: Nullable<{ readonly error: unknown }> = null;
  try {
    let wave = 0;
    while (queue.length > 0) {
      wave++;
      if (wave > MAX_FLUSH_WAVES) {
        const dropped = queue;
        queue = [];
        dropped.forEach((effect) => effect.dequeue());
        throw new Error(
          `reelx: a cycle of effects, each writes a signal another one reads (${MAX_FLUSH_WAVES} waves)`,
          { cause: failure?.error }
        );
      }
      const effects = queue;
      queue = [];
      for (const effect of effects) {
        try {
          effect.run();
        } catch (error) {
          failure ??= { error };
        }
      }
    }
  } finally {
    flushing = false;
  }
  if (hasSome(failure)) {
    throw failure.error;
  }
};

// the node behind each reader, for writes and for `subscriberCount`
const nodes = new WeakMap<ReactiveValue<unknown>, Signal<unknown> | Computed<unknown>>();

const toReactiveValue = <T>(node: Signal<T> | Computed<T>): ReactiveValue<T> => {
  nodes.set(node.read, node);
  return node.read;
};

/** A value that effects and computeds re-read when it is written; a function is held as a value too. */
export const signal = <T>(initial: T, options: SignalOptions<T> = {}): ReactiveValue<T> =>
  toReactiveValue(new Signal(initial, options));

/** A value derived from what `fn` reads, recomputed on read after one of them changes; what `fn` throws is rethrown until then. */
export const computed = <T>(fn: () => T): ReactiveValue<T> => toReactiveValue(new Computed(fn));

/** Writes `value` to the signal `read` reads (a computed's reader is ignored); a value its `equals` finds unchanged changes nothing. */
export const write = <T>(read: ReactiveValue<T>, value: T): void => {
  const node = nodes.get(read);
  if (isInstanceOf(Signal, node)) {
    node.write(value);
  }
};

/** Runs `fn` now and again after every change of what it read. Returns `dispose`; creation that throws leaves nothing subscribed. */
export const effect = (fn: () => void): (() => void) => {
  const node = new Effect(fn);
  try {
    batch(() => {
      try {
        node.run();
      } catch (error) {
        // before the flush that ends the batch, so it never runs an effect whose creation threw
        node.dispose();
        throw error;
      }
    });
  } catch (error) {
    node.dispose();
    throw error;
  }
  return node.dispose;
};

/**
 * Calls `cb` with the value of `read` and the one before it: now, unless it is `undefined`, then
 * after every change `read` notifies. Returns `unsubscribe`.
 */
export const subscribe = <T>(read: ReactiveValue<T>, cb: (value: T, prevValue?: T) => void): (() => void) => {
  let last: T | undefined;
  let started = false;
  return effect(() => {
    const value = read();
    const previous = last;
    last = value;
    if (started || !Object.is(value, undefined)) {
      untracked(() => cb(value, previous));
    }
    started = true;
  });
};

/** Groups writes: effects run once, when the outermost `batch` ends, even if `fn` throws. */
export const batch = <T>(fn: () => T): T => {
  batchDepth++;
  try {
    return fn();
  } finally {
    if (--batchDepth === 0) {
      const written = batchWrites;
      batchWrites = [];
      written.forEach((each) => each.forgetBatch());
      flushSync();
    }
  }
};

/** Runs `fn` without subscribing the running effect or computed to what it reads. */
export const untracked = <T>(fn: () => T): T => {
  const outer = setTracker(null);
  try {
    return fn();
  } finally {
    setTracker(outer);
  }
};

/** How many effects and computeds read `read` now: tests count them to prove that `dispose` released them. */
export const subscriberCount = (read: ReactiveValue<unknown>): number => nodes.get(read)?.observers.size ?? 0;
