// A push-pull signal graph: a write marks what may have changed, a read brings a node up to date.
import { hasSome } from '@reely/basics';
import type { Nullable } from '@reely/utils';
import { isInstanceOf, noop } from '@reely/utils';

/** A function that reads a signal or a computed and subscribes the running effect or computed to it. */
export type Reader<T> = () => T;

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

type Scheduler = (flush: VoidFunction) => void;

const MAX_FLUSH_WAVES = 100;

// grows with every write: an unlinked computed hears no writes, but one checked at this epoch is current
let epoch = 0;
let tracker: Nullable<Computation<unknown>> = null;
// the computation whose `fn` runs now, tracked or not: its own writes never run it again
let running: Nullable<Computation<unknown>> = null;
let batchDepth = 0;
let queue: Effect[] = [];
let flushing = false;
let schedule: Scheduler = (flush) => flush();

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

  constructor(private value: T) {}

  public readonly read = (): T => {
    tracker?.onRead(this);
    return this.value;
  };

  public observe(observer: Computation<unknown>): void {
    this.observers.add(observer);
  }

  public unobserve(observer: Computation<unknown>): void {
    this.observers.delete(observer);
  }

  public write(value: T): void {
    if (Object.is(value, this.value)) {
      return;
    }
    this.value = value;
    this.version++;
    epoch++;
    running?.onOwnWrite(this);
    const idle = queue.length === 0;
    for (const observer of this.observers) {
      observer.mark(this);
    }
    if (idle && queue.length > 0 && batchDepth === 0 && !flushing) {
      schedule(flushSync);
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
      (this.deafTo ??= new Set()).add(written);
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
    const current = this.outcome;
    if (hasSome(current) && !this.needsCheck && (this.linked || this.checkedAt === epoch)) {
      return current;
    }
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
    return (this.outcome = next);
  }

  protected detach(): void {
    for (const source of this.sources.keys()) {
      source.unobserve(this);
    }
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
export const flushSync = (): void => {
  if (flushing) {
    return;
  }
  flushing = true;
  let failure: Nullable<{ readonly error: unknown }> = null;
  try {
    for (let wave = 1; queue.length > 0; wave++) {
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

/**
 * Replaces how a write outside `batch` gets its effects run: `next` is called with `flushSync` once
 * the first effect is queued. By default it runs them at once; `batch` always flushes when it ends.
 * Returns the scheduler it replaced.
 */
export const setScheduler = (next: Scheduler): Scheduler => {
  const previous = schedule;
  schedule = next;
  return previous;
};

// the node behind each reader, for writes and for `reelxDebug`
const nodes = new WeakMap<Reader<unknown>, Signal<unknown> | Computed<unknown>>();

const toReader = <T>(node: Signal<T> | Computed<T>): Reader<T> => {
  nodes.set(node.read, node);
  return node.read;
};

/** A value that effects and computeds re-read when it is written; a function is held as a value too. */
export const signal = <T>(initial: T): Reader<T> => toReader(new Signal(initial));

/** A value derived from what `fn` reads, recomputed on read after one of them changes; what `fn` throws is rethrown until then. */
export const computed = <T>(fn: () => T): Reader<T> => toReader(new Computed(fn));

/** Writes `value` to the signal `read` reads (a computed's reader is ignored); an equal value (by `Object.is`) changes nothing. */
export const write = <T>(read: Reader<T>, value: T): void => {
  const node = nodes.get(read);
  if (isInstanceOf(Signal, node)) {
    node.write(value);
  }
};

/** Runs `fn` now and again after every change of what it read. Returns `dispose`; creation that throws leaves nothing subscribed. */
export const effect = (fn: VoidFunction): VoidFunction => {
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
 * Calls `cb` with every new value of `read` (by `Object.is`, starting from `undefined`) and the one
 * before it, now and after each change. Returns `unsubscribe`.
 */
export const subscribe = <T>(read: Reader<T>, cb: (value: T, prevValue?: T) => void): VoidFunction => {
  let last: T | undefined;
  return effect(() => {
    const value = read();
    if (!Object.is(value, last)) {
      const previous = last;
      last = value;
      untracked(() => cb(value, previous));
    }
  });
};

/** Groups writes: effects run once, when the outermost `batch` ends, even if `fn` throws. */
export const batch = <T>(fn: () => T): T => {
  batchDepth++;
  try {
    return fn();
  } finally {
    if (--batchDepth === 0) {
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

/** Introspection for tests. */
export const reelxDebug = (
  read: Reader<unknown>
): {
  /** How many effects and computeds read it now: tests count them to prove that `dispose` released them. */
  subscriberCount: () => number;
} => ({
  subscriberCount: (): number => nodes.get(read)?.observers.size ?? 0,
});
