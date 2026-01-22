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

// Интерфейс для callback-функции очистки внутри эффекта
export type EffectCleanupFn = () => void;
export type EffectFn = (onCleanup: (fn: EffectCleanupFn) => void) => void;

/**
 * --------------------------------------------------------------------------
 * Graph Node Interfaces (Internal)
 * --------------------------------------------------------------------------
 */

// Узел, который производит значения (Signal, Computed)
interface Producer {
  id: symbol; // Для отладки и уникальности в Set
  consumers: Set<Consumer>;
}

// Узел, который потребляет значения (Computed, Effect)
interface Consumer extends Producer {
  producers: Set<Producer>;
  notify(): void; // "Эй, твои данные протухли!"
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

  // Специальный метод для мутаций (массивы, объекты)
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
    // Копируем, чтобы избежать проблем при изменении графа во время уведомления
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
  private computing = false; // Защита от циклов

  constructor(private computation: () => T, private equal: (a: T, b: T) => boolean) {}

  public notify(): void {
    // Если уже грязный, нет смысла уведомлять снова
    if (!this.dirty) {
      this.dirty = true;
      // Рекурсивно уведомляем тех, кто зависит от нас
      for (const consumer of this.consumers) {
        if (consumer === activeConsumer) {
          continue;
        }
        consumer.notify();
      }
    }
  }

  public get(): T {
    // 1. Проверка на цикл (A -> B -> A)
    if (this.computing) {
      throw new Error('Circular dependency detected in computed signal');
    }

    // 2. Если нас читают внутри другого эффекта/computed — подписываем его
    if (activeConsumer) {
      subscribe(this, activeConsumer);
    }

    // 3. Ленивое вычисление
    if (this.dirty) {
      const prevConsumer = activeConsumer;
      setActiveConsumer(this);
      this.computing = true;

      // Очищаем старые зависимости перед новым прогоном
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
  public consumers = new Set<Consumer>(); // Пусто, эффекты — это листья графа
  public producers = new Set<Producer>();

  // Хранилище для функции очистки, которую может вернуть пользователь
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
    // 1. Запускаем cleanup от предыдущего цикла (если был)
    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        console.error('Error during effect cleanup:', e);
      }
      this.cleanupFn = undefined;
    }

    // 2. Отписываемся от зависимостей (Graph Cleanup)
    unsubscribeAll(this);

    // 3. Устанавливаем контекст
    const prevConsumer = activeConsumer;
    setActiveConsumer(this);

    // 4. Запускаем функцию пользователя
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
  node.execute(); // Первый запуск
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
    // Запускаем очередь только когда вышли из самого внешнего batch
    if (batchDepth === 0) {
      flushBatchQueue();
    }
  }
}

function flushBatchQueue(): void {
  // Копируем очередь для безопасности (если эффекты породят новые эффекты)
  const queue = [...batchQueue];
  batchQueue.clear();

  // Сортировка здесь не нужна, так как Computed ленивые и всегда актуальны
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
  public consumers = new Set<Consumer>(); // Watch — это конечный потребитель
  public producers = new Set<Producer>();

  private value: T;
  private cleanupFn?: EffectCleanupFn;
  private dirty = false;

  constructor(
    private source: () => T,
    private callback: (newValue: T, oldValue: T, onCleanup: (fn: EffectCleanupFn) => void) => void,
    private equal: (a: T, b: T) => boolean
  ) {
    // 1. Первый запуск — ТОЛЬКО сбор зависимостей и получение начального значения
    // Callback НЕ вызывается (ленивость)
    this.value = this.runSource();
  }

  public notify(): void {
    // Если мы внутри батча — добавляем в очередь
    if (batchDepth > 0) {
      batchQueue.add(this);
    } else {
      this.execute();
    }
  }

  public execute(): void {
    // 1. Снова запускаем Source, чтобы проверить, изменилось ли значение
    // и обновить зависимости (если source ветвится)
    const newValue = this.runSource();

    // 2. Если значение изменилось — запускаем эффект (Callback)
    if (!this.equal(this.value, newValue)) {
      const oldValue = this.value;
      this.value = newValue;

      // Очистка предыдущего прогона callback-а
      if (this.cleanupFn) {
        try {
          this.cleanupFn();
        } catch (e) {
          console.error(e);
        }
        this.cleanupFn = undefined;
      }

      // Запуск Callback
      // Мы используем untracked, чтобы чтение сигналов внутри callback
      // НЕ создавало новых зависимостей (мы зависим только от source)
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
    // Стандартная логика Consumer-а для сбора зависимостей
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
