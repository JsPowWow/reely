import { EventEmitter } from './emitter';

import type { IEventEmitter } from './types';

interface RaceEvents {
  lap: number;
  finish: { winner: string };
  start: undefined;
}

describe('EventEmitter', () => {
  it('calls the listeners of an event with its data, in the order they were added', () => {
    const race = new EventEmitter<RaceEvents>();
    const calls: string[] = [];
    race.on('lap', (lap) => calls.push(`first ${lap}`));
    race.on('lap', (lap) => calls.push(`second ${lap}`));
    race.on('finish', ({ winner }) => calls.push(winner));

    race.emit('lap', 3);

    expect(calls).toEqual(['first 3', 'second 3']);
  });

  it('emits an event without data with no second argument', () => {
    const race = new EventEmitter<RaceEvents>();
    const start = vi.fn();
    race.on('start', start);

    race.emit('start');

    expect(start).toHaveBeenCalledWith(undefined);
  });

  it('removes a listener with the function `on` returns, and with `off`', () => {
    const race = new EventEmitter<RaceEvents>();
    const first = vi.fn();
    const second = vi.fn();
    const stopFirst = race.on('lap', first);
    race.on('lap', second);

    stopFirst();
    race.off('lap', second);
    race.emit('lap', 1);

    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    expect(race.hasListener('lap')).toBe(false);
  });

  it('adds the same listener once, as `addEventListener` does', () => {
    const race = new EventEmitter<RaceEvents>();
    const lap = vi.fn();
    race.on('lap', lap);
    race.on('lap', lap);

    race.emit('lap', 1);

    expect(lap).toHaveBeenCalledOnce();
  });

  it('calls, during an emit, only the listeners it had when the emit began and still has', () => {
    const race = new EventEmitter<RaceEvents>();
    const calls: string[] = [];
    const late = (): void => {
      calls.push('late');
    };
    const removed = (): void => {
      calls.push('removed');
    };
    race.on('lap', () => {
      calls.push('first');
      race.on('lap', late);
      race.off('lap', removed);
    });
    race.on('lap', removed);

    race.emit('lap', 1);
    race.emit('lap', 2);

    expect(calls).toEqual(['first', 'first', 'late']);
  });

  it('calls every listener even when one throws, then throws its error', () => {
    const race = new EventEmitter<RaceEvents>();
    const after = vi.fn();
    const broken = new Error('broken board');
    race.on('lap', () => {
      throw broken;
    });
    race.on('lap', after);

    expect(() => race.emit('lap', 1)).toThrow(broken);
    expect(after).toHaveBeenCalledOnce();
  });

  it('throws every error together when several listeners throw', () => {
    const race = new EventEmitter<RaceEvents>();
    const board = new Error('broken board');
    const banner = new Error('broken banner');
    race.on('lap', () => {
      throw board;
    });
    race.on('lap', () => {
      throw banner;
    });

    expect(() => race.emit('lap', 1)).toThrow(expect.objectContaining({ errors: [board, banner] }));
    expect(() => race.emit('lap', 1)).toThrow(AggregateError);
  });

  it('stops an emit when a listener clears every listener', () => {
    const race = new EventEmitter<RaceEvents>();
    const after = vi.fn();
    race.on('lap', () => race.clearAllListeners());
    race.on('lap', after);

    race.emit('lap', 1);

    expect(after).not.toHaveBeenCalled();
  });

  it('calls a listener removed and added back during the emit, as it still has it', () => {
    const race = new EventEmitter<RaceEvents>();
    const calls: string[] = [];
    const back = (): void => {
      calls.push('back');
    };
    const first = (): void => {
      calls.push('first');
      race.off('lap', first);
      race.off('lap', back);
      race.on('lap', back);
    };
    race.on('lap', first);
    race.on('lap', back);

    race.emit('lap', 1);

    expect(calls).toEqual(['first', 'back']);
  });

  it('removes with the function `on` returns only the subscription it made', () => {
    const race = new EventEmitter<RaceEvents>();
    const lap = vi.fn();
    const stale = race.on('lap', lap);
    race.clearAllListeners();
    race.on('lap', lap);

    stale();
    stale();
    race.emit('lap', 1);

    expect(lap).toHaveBeenCalledOnce();
  });

  it('takes events named like the members of `Object.prototype`', () => {
    const channel = new EventEmitter<{ constructor: number; toString: number }>();
    const heard = vi.fn();

    expect(channel.hasListener('constructor')).toBe(false);
    channel.emit('toString', 1);
    channel.on('constructor', heard);
    channel.emit('constructor', 2);

    expect(heard).toHaveBeenCalledExactlyOnceWith(2);
  });

  it('removes every listener with `clearAllListeners`', () => {
    const race = new EventEmitter<RaceEvents>();
    const lap = vi.fn();
    race.on('lap', lap);
    race.on('finish', lap);

    race.clearAllListeners();
    race.emit('lap', 1);

    expect([race.hasListener('lap'), race.hasListener('finish')]).toEqual([false, false]);
    expect(lap).not.toHaveBeenCalled();
  });

  it('keeps `on`, `off` and `emit` working when taken off the emitter', () => {
    const race = new EventEmitter<RaceEvents>();
    const { on, emit } = race;
    const lap = vi.fn();
    on('lap', lap);

    emit('lap', 2);

    expect(lap).toHaveBeenCalledWith(2);
  });

  it('rejects a listener that is not a function, as JavaScript can pass one', () => {
    const race = new EventEmitter<RaceEvents>();

    expect(() => race.on('lap', 'alert(1)' as never)).toThrow(TypeError);
  });

  it('types the data of each event', () => {
    const race: IEventEmitter<RaceEvents> = new EventEmitter<RaceEvents>();
    const finish = vi.fn((result: { winner: string }): void => {
      expectTypeOf(result).toEqualTypeOf<{ winner: string }>();
    });
    race.on('finish', finish);

    race.emit('finish', { winner: 'Red' });

    expect(finish).toHaveBeenCalledWith({ winner: 'Red' });
  });
});

// never run: the compiler checks these calls
export function misuses(race: IEventEmitter<RaceEvents>): void {
  // @ts-expect-error `lap` carries a number
  race.emit('lap', 'three');
  // @ts-expect-error `lap` needs its data
  race.emit('lap');
  // @ts-expect-error there is no `pit` event
  race.on('pit', () => undefined);
}
