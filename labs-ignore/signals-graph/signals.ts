/**
 * --------------------------------------------------------------------------
 * Core Types & Interfaces
 * --------------------------------------------------------------------------
 */

export interface Signal<T> {
  (): T;
}

export interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(updateFn: (value: T) => T): void;
  mutate(mutateFn: (value: T) => void): void;
  asReadonly(): Signal<T>;
}

export interface EffectRef {
  destroy(): void;
}

export interface CreateSignalOptions<T> {
  equal?: (a: T, b: T) => boolean;
}

// The cleanup callback an effect can register
export type EffectCleanupFn = () => void;
export type EffectFn = (onCleanup: (fn: EffectCleanupFn) => void) => void;

/**
 * --------------------------------------------------------------------------
 * Graph Node Interfaces (Internal)
 * --------------------------------------------------------------------------
 */

// A node that produces values (Signal, Computed)
interface Producer {
  id: symbol; // for debugging and identity in a Set
  consumers: Set<Consumer>;
}

// A node that consumes values (Computed, Effect)
interface Consumer extends Producer {
  producers: Set<Producer>;
  notify(): void; // "your data went stale"
}

/**
 * --------------------------------------------------------------------------
 * Global Context (Engine State)
 * --------------------------------------------------------------------------
 */
function setActiveConsumer(c: Consumer | null): void {
  activeConsumer = c;
}
let activeConsumer: Consumer | null = null;
let batchDepth = 0;
const batchQueue = new Set<Consumer & { execute: () => void }>();

/**
 * --------------------------------------------------------------------------
 * Graph Management
 * --------------------------------------------------------------------------
 */

function subscribe(producer: Producer, consumer: Consumer): void {
  producer.consumers.add(consumer);
  consumer.producers.add(producer);
}

function unsubscribeAll(consumer: Consumer): void {
  for (const producer of consumer.producers) {
    producer.consumers.delete(consumer);
  }
  consumer.producers.clear();
}

/**
 * --------------------------------------------------------------------------
 * 1. Signal (Source of Truth)
 * --------------------------------------------------------------------------
 */

class SignalNode<T> implements Producer {
  public id = Symbol('Signal');
  public consumers = new Set<Consumer>();

  constructor(public value: T, private equal: (a: T, b: T) => boolean) {}

  // Mutates in place (arrays, objects) and notifies
  public mutate(fn: (val: T) => void): void {
    fn(this.value);
    this.propagate();
  }

  public get(): T {
    if (activeConsumer) {
      subscribe(this, activeConsumer);
    }
    return this.value;
  }

  public set(newValue: T): void {
    if (!this.equal(this.value, newValue)) {
      this.value = newValue;
      this.propagate();
    }
  }

  private propagate(): void {
    // a copy: the graph may change while it is notified
    const targets = [...this.consumers];
    for (const consumer of targets) {
      if (consumer === activeConsumer) {
        continue;
      }
      consumer.notify();
    }
  }
}

export function signal<T>(initialValue: T, options: CreateSignalOptions<T> = {}): WritableSignal<T> {
  const node = new SignalNode(initialValue, options.equal || Object.is);

  const getter = (() => node.get()) as WritableSignal<T>;

  getter.set = (val): void => node.set(val);
  getter.update = (fn): void => node.set(fn(node.value));
  getter.mutate = (fn): void => node.mutate(fn);
  getter.asReadonly = () => (): T => node.get();

  return getter;
}

/**
 * --------------------------------------------------------------------------
 * 2. Computed (Lazy, Memoized, Glitch-Free)
 * --------------------------------------------------------------------------
 */

class ComputedNode<T> implements Consumer {
  public id = Symbol('Computed');
  public consumers = new Set<Consumer>();
  public producers = new Set<Producer>();

  private value!: T;
  private dirty = true;
  private computing = false; // guards against cycles

  constructor(private computation: () => T, private equal: (a: T, b: T) => boolean) {}

  public notify(): void {
    // already dirty: nothing new to tell
    if (!this.dirty) {
      this.dirty = true;
      // notify what depends on this, recursively
      for (const consumer of this.consumers) {
        if (consumer === activeConsumer) {
          continue;
        }
        consumer.notify();
      }
    }
  }

  public get(): T {
    // 1. a cycle check (A -> B -> A)
    if (this.computing) {
      throw new Error('Circular dependency detected in computed signal');
    }

    // 2. read inside another effect or computed: subscribe it
    if (activeConsumer) {
      subscribe(this, activeConsumer);
    }

    // 3. compute lazily
    if (this.dirty) {
      const prevConsumer = activeConsumer;
      setActiveConsumer(this);
      this.computing = true;

      // drop the old dependencies before the new run
      unsubscribeAll(this);

      try {
        const newValue = this.computation();
        // Memoization check
        if (this.dirty && !this.equal(this.value, newValue)) {
          this.value = newValue;
        }
      } finally {
        activeConsumer = prevConsumer;
        this.computing = false;
        this.dirty = false;
      }
    }

    return this.value;
  }
}

export function computed<T>(computation: () => T, options: CreateSignalOptions<T> = {}): Signal<T> {
  const node = new ComputedNode(computation, options.equal ?? Object.is);
  return () => node.get();
}

/**
 * --------------------------------------------------------------------------
 * 3. Effect (Side Effects)
 * --------------------------------------------------------------------------
 */

class EffectNode implements Consumer {
  public id = Symbol('Effect');
  public consumers = new Set<Consumer>(); // empty: effects are the leaves of the graph
  public producers = new Set<Producer>();

  // the cleanup the user registered
  private cleanupFn?: EffectCleanupFn;

  constructor(private fn: EffectFn) {}

  public notify(): void {
    if (activeConsumer === this) {
      return;
    }
    if (batchDepth > 0) {
      batchQueue.add(this);
    } else {
      this.execute();
    }
  }

  public execute = (): void => {
    // 1. run the cleanup of the previous run, if any
    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        console.error('Error during effect cleanup:', e);
      }
      this.cleanupFn = undefined;
    }

    // 2. unsubscribe from the dependencies
    unsubscribeAll(this);

    // 3. set the context
    const prevConsumer = activeConsumer;
    setActiveConsumer(this);

    // 4. run the user's function
    try {
      this.fn((onCleanup) => {
        this.cleanupFn = onCleanup;
      });
    } catch (e) {
      console.error('Error executing effect:', e);
    } finally {
      activeConsumer = prevConsumer;
    }
  };

  public destroy(): void {
    unsubscribeAll(this);
    if (this.cleanupFn) {
      this.cleanupFn();
    }
  }
}

export function effect(fn: EffectFn): EffectRef {
  const node = new EffectNode(fn);
  node.execute(); // the first run
  return { destroy: () => node.destroy() };
}

/**
 * --------------------------------------------------------------------------
 * 4. Utilities (Batch, Untracked)
 * --------------------------------------------------------------------------
 */

export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
    // run the queue only when the outermost batch ends
    if (batchDepth === 0) {
      flushBatchQueue();
    }
  }
}

function flushBatchQueue(): void {
  // a copy of the queue: effects may queue new effects
  const queue = [...batchQueue];
  batchQueue.clear();

  // no sorting: computeds are lazy and always current
  queue.forEach((node) => node.execute());
}

export function untracked<T>(fn: () => T): T {
  const prevConsumer = activeConsumer;
  activeConsumer = null;
  try {
    return fn();
  } finally {
    activeConsumer = prevConsumer;
  }
}

/**
 * --------------------------------------------------------------------------
 * 4. Watch (Lazy Effect / Reaction)
 * --------------------------------------------------------------------------
 */

export interface WatchOptions<T> {
  equal?: (a: T, b: T) => boolean;
}

class WatchNode<T> implements Consumer {
  public id = Symbol('Watch');
  public consumers = new Set<Consumer>(); // a watch is a leaf consumer
  public producers = new Set<Producer>();

  private value: T;
  private cleanupFn?: EffectCleanupFn;

  constructor(
    private source: () => T,
    private callback: (newValue: T, oldValue: T, onCleanup: (fn: EffectCleanupFn) => void) => void,
    private equal: (a: T, b: T) => boolean
  ) {
    // 1. the first run only collects the dependencies and the initial value;
    // the callback does not run (lazy)
    this.value = this.runSource();
  }

  public notify(): void {
    // inside a batch: queue it
    if (batchDepth > 0) {
      batchQueue.add(this);
    } else {
      this.execute();
    }
  }

  public execute(): void {
    // 1. run the source again to see whether the value changed
    // and to update the dependencies (the source may branch)
    const newValue = this.runSource();

    // 2. the value changed: run the callback
    if (!this.equal(this.value, newValue)) {
      const oldValue = this.value;
      this.value = newValue;

      // clean up after the previous callback run
      if (this.cleanupFn) {
        try {
          this.cleanupFn();
        } catch (e) {
          console.error(e);
        }
        this.cleanupFn = undefined;
      }

      // run the callback
      // untracked, so the signals the callback reads
      // add no dependencies: the watch depends on its source only
      untracked(() => {
        try {
          this.callback(newValue, oldValue, (fn) => (this.cleanupFn = fn));
        } catch (e) {
          console.error('Error in watch callback:', e);
        }
      });
    }
  }

  public destroy(): void {
    unsubscribeAll(this);
    if (this.cleanupFn) this.cleanupFn();
  }

  private runSource(): T {
    // the usual consumer logic that collects dependencies
    unsubscribeAll(this);

    const prevConsumer = activeConsumer;
    setActiveConsumer(this);

    try {
      return this.source();
    } finally {
      activeConsumer = prevConsumer;
    }
  }
}

export function watch<T>(
  source: () => T,
  callback: (newValue: T, oldValue: T, onCleanup: (fn: EffectCleanupFn) => void) => void,
  options: WatchOptions<T> = {}
): EffectRef {
  const node = new WatchNode(source, callback, options.equal || Object.is);
  return { destroy: () => node.destroy() };
}
