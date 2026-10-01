import { advance, formatGap, standingsOf, startRace } from './race';

const cars = ['Comet', 'Falcon', 'Lynx', 'Orca'].map((name) => ({ name, color: '#000' }));

const leaders = (seed: number, steps: number): string[] => {
  let race = startRace(cars, seed);
  const seen: string[] = [];
  for (let step = 0; step < steps; step++) {
    race = advance(race, 1.5);
    seen.push(standingsOf(race)[0]?.car.name ?? '');
  }
  return seen;
};

describe('a simulated race', () => {
  it('runs the same race for the same seed, and another for another', () => {
    expect(leaders(7, 40)).toEqual(leaders(7, 40));
    expect(leaders(7, 40)).not.toEqual(leaders(8, 40));
  });

  it('keeps changing its leader instead of letting one car run away', () => {
    const seen = leaders(7, 400);

    expect(new Set(seen.slice(-100)).size).toBeGreaterThan(1);
  });

  it('ranks every car once, the leader with no gap and the others behind it', () => {
    const standings = standingsOf(advance(startRace(cars, 3), 30));

    expect(standings.map(({ car }) => car.name).sort()).toEqual(['Comet', 'Falcon', 'Lynx', 'Orca']);
    expect(standings[0]?.gap).toBe(0);
    expect(standings.slice(1).every(({ gap }) => gap >= 0)).toBe(true);
  });

  it('counts the time it has run', () => {
    expect(advance(advance(startRace(cars, 1), 1.5), 1.5).elapsed).toBe(3);
  });
});

describe('formatGap', () => {
  it('shows the leader its race time, and the others how far behind they are', () => {
    expect(formatGap(0, 83.4)).toBe('1:23.4');
    expect(formatGap(0.512, 83.4)).toBe('+0.512');
    expect(formatGap(12.3456, 83.4)).toBe('+12.346');
  });

  it('carries a time that rounds up to a whole minute into the minutes', () => {
    expect(formatGap(0, 59.97)).toBe('1:00.0');
  });
});
