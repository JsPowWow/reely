import { ObjectStore } from './objectStore';
import { ValueStore } from './valueStore';

import type { ReadableStore } from './store';

interface Race {
  leader: string;
  lap: number;
  cars: string[];
}

const newRace = (): ObjectStore<Race> => new ObjectStore<Race>({ leader: 'Red', lap: 0, cars: ['Red', 'Blue'] });

describe('select', () => {
  it('reads the selected part of the value held now', () => {
    const race = newRace();
    const leader = race.select((value) => value.leader);

    race.set({ leader: 'Blue' });

    expect(leader.value).toBe('Blue');
  });

  it('reads the part of the new value while its store is notifying', () => {
    const race = newRace();
    const leader = race.select((value) => value.leader);
    const seen: string[] = [];
    race.on('changed', () => seen.push(leader.value));
    leader.on('changed', () => undefined);

    race.set({ leader: 'Blue' });

    expect(seen).toStrictEqual(['Blue']);
  });

  it('notifies only when the selected part changes', () => {
    const race = newRace();
    const leaders: string[] = [];
    race.select((value) => value.leader).on('changed', (leader) => leaders.push(leader));

    race.set({ lap: 1 }).set({ leader: 'Blue' }).set({ lap: 2 }).set({ leader: 'Red' });

    expect(leaders).toStrictEqual(['Blue', 'Red']);
  });

  it('compares the selected parts with the given equality', () => {
    const race = newRace();
    const fields: string[][] = [];
    const sameCars = (a: string[], b: string[]): boolean => a.length === b.length && a.every((car, i) => car === b[i]);
    race.select((value) => [...value.cars], sameCars).on('changed', (cars) => fields.push(cars));

    race.set({ lap: 1 }).set({ cars: ['Blue', 'Red'] });

    expect(fields).toStrictEqual([['Blue', 'Red']]);
  });

  it('follows the store only while it has listeners', () => {
    const race = newRace();
    const selector = vi.fn((value: Race) => value.leader);
    const leader = race.select(selector);
    const stop = leader.on('changed', () => undefined);
    race.set({ leader: 'Blue' });
    const callsWhileFollowing = selector.mock.calls.length;

    stop();
    race.set({ leader: 'Green' }).set({ leader: 'Red' });

    expect(callsWhileFollowing).toBeGreaterThan(0);
    expect(selector).toHaveBeenCalledTimes(callsWhileFollowing);
    expect(leader.value).toBe('Red');
  });

  it('follows the store again after its listeners came back', () => {
    const race = newRace();
    const leader = race.select((value) => value.leader);
    const onChanged = vi.fn();
    leader.on('changed', onChanged)();
    race.set({ leader: 'Blue' });

    leader.on('changed', onChanged);
    race.set({ leader: 'Red' });

    expect(onChanged.mock.calls).toStrictEqual([['Red']]);
  });

  it('stops following the store when its last listener is taken off with `off`', () => {
    const race = newRace();
    const selector = vi.fn((value: Race) => value.leader);
    const onChanged = (): void => undefined;
    const leader = race.select(selector);
    leader.on('changed', onChanged);
    leader.off('changed', onChanged);
    selector.mockClear();

    race.set({ leader: 'Blue' });

    expect(selector).not.toHaveBeenCalled();
  });

  it('keeps the part it picked while the store holds the same value, or picks an equal one', () => {
    const race = newRace();
    const selector = vi.fn((value: Race) => ({ leader: value.leader }));
    const top = race.select(selector, (before, after) => before.leader === after.leader);
    const notified: Array<{ leader: string }> = [];
    top.on('changed', (value) => notified.push(value));
    const first = top.value;

    race.set({ lap: 1 });
    const afterLap = top.value;
    race.set({ leader: 'Blue' });

    expect(afterLap).toBe(first);
    expect(notified).toStrictEqual([{ leader: 'Blue' }]);
    expect(notified[0]).toBe(top.value);
    expect(selector).toHaveBeenCalledTimes(3);
  });

  it('selects from a selection', () => {
    const race = newRace();
    const initials: string[] = [];
    race
      .select((value) => value.leader)
      .select((leader) => leader[0])
      .on('changed', (initial) => initials.push(initial ?? ''));

    race.set({ leader: 'Rose' }).set({ leader: 'Blue' });

    expect(initials).toStrictEqual(['B']);
  });

  it('selects from a ValueStore', () => {
    const lap = new ValueStore(0);
    const finals: boolean[] = [];
    const final = lap.select((value) => value >= 3);
    final.on('changed', (isFinal) => finals.push(isFinal));

    lap.value = 1;
    lap.value = 3;
    lap.value = 4;

    expect([final.value, finals]).toStrictEqual([true, [true]]);
  });

  it('reads a selection of a selection afresh, and notifies only a real change of it', () => {
    const race = newRace();
    const initial = race.select((value) => value.leader).select((leader) => leader[0]);
    race.set({ leader: 'Blue' });
    const initials: Array<string | undefined> = [];

    const before = initial.value;
    initial.on('changed', (value) => initials.push(value));
    race.set({ leader: 'Bob' }).set({ leader: 'Green' });

    expect(before).toBe('B');
    expect(initials).toStrictEqual(['G']);
  });

  it('picks nothing until it is read or listened to', () => {
    const race = newRace();
    const selector = vi.fn((value: Race) => value.leader);

    const leader = race.select(selector);

    expect(selector).not.toHaveBeenCalled();
    expect(leader.value).toBe('Red');
  });

  it('keeps no listener when its selector throws as the first one is added', () => {
    const race = newRace();
    let broken = true;
    const leader = race.select((value) => {
      if (broken) {
        throw new Error('broken selector');
      }
      return value.leader;
    });
    const onChanged = vi.fn();

    expect(() => leader.on('changed', onChanged)).toThrow('broken selector');
    race.set({ leader: 'Blue' });
    broken = false;
    leader.on('changed', onChanged);
    race.set({ leader: 'Green' });

    expect(onChanged.mock.calls).toStrictEqual([['Green']]);
  });

  it('lets a listener of a selection change the store', () => {
    const race = newRace();
    const leaders: string[] = [];
    const leader = race.select((value) => value.leader);
    leader.on('changed', (value) => {
      if (value === 'Blue') {
        race.set({ leader: 'Green' });
      }
    });
    leader.on('changed', (value) => leaders.push(value));

    race.set({ leader: 'Blue' });

    expect([leaders, leader.value]).toStrictEqual([['Blue', 'Green'], 'Green']);
  });

  it('stops following the store whichever way its listeners leave', () => {
    const race = newRace();
    const selector = vi.fn((value: Race) => value.leader);
    const onChanged = (): void => undefined;
    const leader = race.select(selector);
    const first = leader.on('changed', onChanged);
    const second = leader.on('changed', onChanged);
    first();
    first();
    second();
    selector.mockClear();

    race.set({ leader: 'Blue' });

    expect(selector).not.toHaveBeenCalled();
  });
});

// never run: the compiler checks these uses
export function misuses(race: ObjectStore<Race>): void {
  const leader: ReadableStore<string> = race.select((value) => value.leader);
  // @ts-expect-error a selection is read only
  leader.value = 'Blue';
  // @ts-expect-error a leader is a string
  race.select((value) => value.leader).on('changed', (lap: number) => lap);
}
