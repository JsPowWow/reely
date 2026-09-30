import type { ILogger } from '@reely/logger';
import { subscriberCount } from '@reely/signals/testing';

import { For, Show, computed, defineDommyConfig, effect, mount, onCleanup, signal } from '../index';

// The questions that come up once the basics work; README "Advanced topics" explains each one.

const render = (view: () => Node): HTMLElement => {
  const host = document.createElement('div');
  mount(host, view);
  return host;
};

describe('DOM attributes vs. properties', () => {
  it('sets live state as properties and everything else as attributes, a read-only `list` included', () => {
    const field = (<input list='flavours' value='Mint' tabIndex={2} />) as HTMLInputElement;

    expect(field.value).toBe('Mint');
    expect(field.getAttribute('value')).toBeNull();
    expect(field.getAttribute('list')).toBe('flavours');
    expect(field.tabIndex).toBe(2);
  });

  it('reaches a property that is not an attribute through `elementRef`', () => {
    const stream = { id: 'camera' };

    const video = (
      <video
        elementRef={(element) => {
          Reflect.set(element, 'srcObject', stream);
        }}
      />
    );

    expect(Reflect.get(video, 'srcObject')).toBe(stream);
  });
});

describe('A signal cannot hold a DOM node', () => {
  it('renders a bound child as text, and reports a node to the logger', () => {
    const warn = vi.fn();
    const logger = { info: vi.fn(), warn, error: vi.fn(), log: vi.fn(), logWith: vi.fn() } as unknown as ILogger;
    const name = signal<unknown>('reely');
    defineDommyConfig({ useLogger: true, logger });
    try {
      // @ts-expect-error a bound child is text: a signal of a node does not type-check
      const host = render(() => <p>{name}</p>);
      name.value = document.createElement('b');

      expect(host.querySelector('b')).toBeNull();
    } finally {
      defineDommyConfig({ useLogger: false });
    }

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Show'), expect.any(HTMLElement));
  });
});

describe('Signal granularity', () => {
  it('lets a computed pass on only the field it reads', () => {
    const settings = signal({ theme: 'dark', laps: 5 });
    const theme = computed(() => settings.value.theme);
    const writes = vi.fn();
    render(() => <p>{() => (writes(), theme.value)}</p>);

    settings.value = { ...settings.value, laps: 6 };

    expect(writes).toHaveBeenCalledOnce();
  });
});

describe('The scope of DOM updates', () => {
  it('keeps the branch of `Show` while the truthiness stays, and rewrites only the bound text', () => {
    const name = signal('');
    const host = render(() => (
      <Show when={() => name.value.trim() !== ''} fallback={() => <p>Enter your name</p>}>
        {() => (
          <p>
            Hello <b>{name}</b>
          </p>
        )}
      </Show>
    ));
    name.value = 'A';
    const greeting = host.querySelector('p');

    name.value = 'Ada';

    expect(host.querySelector('p')).toBe(greeting);
    expect(host.textContent).toBe('Hello Ada');
  });
});

describe('Conditional bindings', () => {
  it('runs a binding only for the signals its last run read', () => {
    const formula = signal<'a + b' | 'c'>('a + b');
    const a = signal(1);
    const b = signal(2);
    const c = signal(3);
    const runs = vi.fn();
    const host = render(() => <p>{() => (runs(), formula.value === 'a + b' ? a.value + b.value : c.value)}</p>);

    c.value = 4;
    const afterC = runs.mock.calls.length;
    formula.value = 'c';
    a.value = 5;

    expect(afterC).toBe(1);
    expect(runs).toHaveBeenCalledTimes(2);
    expect(host.textContent).toBe('4');
  });
});

describe('Advanced state derivation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('derives several signals in one effect, and delays a save with a timer the next run cancels', () => {
    const fullName = signal('Tao Xin');
    const firstName = signal('');
    const lastName = signal('');
    const saved: string[] = [];
    mount(document.createElement('div'), () => {
      effect(() => {
        [firstName.value = '', lastName.value = ''] = fullName.value.split(' ');
      });
      effect(() => {
        const name = fullName.value;
        const timer = setTimeout(() => saved.push(name), 1000);
        onCleanup(() => clearTimeout(timer));
      });
      return null;
    });

    fullName.value = 'Ada Lovelace';
    const beforeTheDelay = [...saved];
    vi.advanceTimersByTime(1000);

    expect([firstName.value, lastName.value]).toEqual(['Ada', 'Lovelace']);
    expect(beforeTheDelay).toEqual([]);
    expect(saved).toEqual(['Ada Lovelace']);
  });
});

describe('Self-referencing in effects', () => {
  it('does not re-run an effect for a signal it writes, so a counter of checks does not loop', () => {
    const checked = signal(false);
    const timesChecked = signal(0);
    const runs = vi.fn();
    effect(() => {
      runs();
      if (checked.value) {
        timesChecked.value += 1;
      }
    });

    checked.value = true;
    timesChecked.value = 0;

    expect(timesChecked.value).toBe(0);
    expect(runs).toHaveBeenCalledTimes(2);
  });

  it('keeps the effect that writes a signal it read running for the signals it only reads', () => {
    const checked = signal(false);
    const timesChecked = signal(0);
    effect(() => {
      if (checked.value) {
        timesChecked.value += 1;
      }
    });

    checked.value = true;
    checked.value = false;
    checked.value = true;
    timesChecked.value = 10;

    expect(timesChecked.value).toBe(10);
    checked.value = false;
    checked.value = true;
    expect(timesChecked.value).toBe(11);
  });

  it('does not see later writes of a signal it wrote, so a clamp belongs in a computed', () => {
    const laps = signal(12);
    effect(() => {
      if (laps.value > 10) {
        laps.value = 10;
      }
    });
    const clamped = computed(() => Math.min(laps.value, 10));

    laps.value = 20;

    expect(laps.value).toBe(20);
    expect(clamped.value).toBe(10);
  });

  it('stays dependent on a signal it writes first and reads after', () => {
    const lap = signal(1);
    const seen: number[] = [];
    effect(() => {
      lap.value = Math.max(lap.peek(), 1);
      seen.push(lap.value);
    });

    lap.value = 2;

    expect(seen).toEqual([1, 2]);
  });

  it('keeps a binding that writes a signal it read bound to the rest', () => {
    const lap = signal(1);
    const reads = signal(0);
    const host = render(() => <p>{() => ((reads.value += 1), `lap ${lap.value}`)}</p>);

    lap.value = 2;
    lap.value = 3;

    expect(host.textContent).toBe('lap 3');
    expect(reads.value).toBe(3);
  });

  it('throws instead of hanging when two effects write what the other reads', () => {
    const a = signal(0);
    const b = signal(0);
    const runs = vi.fn();
    effect(() => {
      runs();
      b.value = a.value + 1;
    });

    const start = (): void => {
      effect(() => {
        runs();
        if (runs.mock.calls.length > 10_000) {
          throw new Error('the spec stopped the loop');
        }
        a.value = b.value + 1;
      });
    };

    expect(start).toThrow(/cycle/);
    expect(runs.mock.calls.length).toBeLessThan(1_000);
  });

  it('still re-runs an effect for a signal it only reads', () => {
    const laps = signal(1);
    const seen: number[] = [];
    effect(() => {
      seen.push(laps.value);
    });

    laps.value = 2;

    expect(seen).toEqual([1, 2]);
  });
});

describe('Releasing bindings', () => {
  it('keeps the bindings of a view built before it is connected, across an `await` too', async () => {
    const text = signal('a');
    // a host that is never connected
    const host = document.createElement('div');
    const dispose = mount(host, () => <p>{text}</p>);

    text.value = 'b';
    await Promise.resolve();
    text.value = 'c';

    expect(host.textContent).toBe('c');
    dispose();
    expect(subscriberCount(text)).toBe(0);
  });

  it('releases a computed made inside a branch when the branch goes', () => {
    const on = signal(true);
    const prefix = signal('Prefix');
    render(() => (
      <Show when={on}>
        {() => {
          const text = computed(() => `${prefix.value} - Suffix`);
          return <span>{text}</span>;
        }}
      </Show>
    ));
    const whileShown = subscriberCount(prefix);

    on.value = false;

    expect(whileShown).toBe(1);
    expect(subscriberCount(prefix)).toBe(0);
  });

  it('releases what a row of `For` made when its key goes', () => {
    const prefix = signal('Car');
    const cars = signal(['7', '3']);
    render(() => (
      <ol>
        <For each={cars} by={(car) => car}>
          {(car) => {
            const label = computed(() => `${prefix.value} ${car()}`);
            return <li>{label}</li>;
          }}
        </For>
      </ol>
    ));
    const withTwoRows = subscriberCount(prefix);

    cars.value = ['7'];

    expect(withTwoRows).toBe(2);
    expect(subscriberCount(prefix)).toBe(1);
  });

  it('keeps the bindings of a node built outside any owner as long as their signals live', () => {
    const text = signal('a');

    const orphan = <p>{text}</p>;

    expect(orphan.textContent).toBe('a');
    expect(subscriberCount(text)).toBe(1);
  });
});

describe('Lifecycle hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs a component before its nodes are in the document, and a timer after', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const states: boolean[] = [];
    mount(host, () => {
      const field = document.createElement('input');
      states.push(field.isConnected);
      const timer = setTimeout(() => states.push(field.isConnected));
      onCleanup(() => clearTimeout(timer));
      return field;
    });

    vi.advanceTimersByTime(0);
    host.remove();

    expect(states).toEqual([false, true]);
  });

  it('runs effects synchronously: a write in a component is seen at once', () => {
    const lap = signal(1);
    const seen: number[] = [];
    mount(document.createElement('div'), () => {
      effect(() => {
        seen.push(lap.value);
      });
      lap.value = 2;
      seen.push(0);
      return null;
    });

    expect(seen).toEqual([1, 2, 0]);
  });
});
