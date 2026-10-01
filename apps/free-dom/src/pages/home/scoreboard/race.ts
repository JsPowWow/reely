/** A car on the scoreboard. */
export interface Car {
  readonly name: string;
  readonly color: string;
}

interface Runner {
  readonly car: Car;
  /** Metres run. */
  readonly distance: number;
  /** Metres a second. */
  readonly speed: number;
}

/** A race at one moment; `advance` makes the next one, so the same seed always runs the same race. */
export interface Race {
  readonly runners: readonly Runner[];
  /** Seconds run. */
  readonly elapsed: number;
  readonly seed: number;
}

/** A car's place: how many seconds it is behind the leader, 0 for the leader. */
export interface Standing {
  readonly car: Car;
  readonly gap: number;
}

const cruise = 60;

// mulberry32: a small seeded generator, so a race is the same on every run of the page
const nextRandom = (seed: number): [number, number] => {
  const next = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(next ^ (next >>> 15), 1 | next);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
};

export const startRace = (cars: readonly Car[], seed: number): Race => ({
  runners: cars.map((car, index) => ({ car, distance: -index * 40, speed: cruise })),
  elapsed: 0,
  seed,
});

/** Runs the race on for `seconds`: each car's speed drifts at random, and a car behind gains in the slipstream. */
export const advance = (race: Race, seconds: number): Race => {
  const leader = Math.max(...race.runners.map(({ distance }) => distance));
  let seed = race.seed;
  const runners = race.runners.map((runner) => {
    const [random, next] = nextRandom(seed);
    seed = next;
    const slipstream = Math.min(1, (leader - runner.distance) * 0.006);
    const speed = cruise + (runner.speed - cruise) * 0.9 + (random - 0.5) * 2.4 + slipstream;
    return { ...runner, speed, distance: runner.distance + speed * seconds };
  });
  return { runners, elapsed: race.elapsed + seconds, seed };
};

export const standingsOf = (race: Race): Standing[] => {
  const ranked = [...race.runners].sort((a, b) => b.distance - a.distance);
  const leader = ranked[0]?.distance ?? 0;
  return ranked.map(({ car, distance }) => ({ car, gap: (leader - distance) / cruise }));
};

/** What the board shows in the time column: the leader's race time, the gap of everyone else. */
export const formatGap = (gap: number, elapsed: number): string => {
  if (gap > 0) {
    return `+${gap.toFixed(3)}`;
  }
  // whole tenths, so that 59.97 s carries into the minutes rather than showing as 0:60.0
  const tenths = Math.round(elapsed * 10);
  const minutes = Math.floor(tenths / 600);
  const seconds = ((tenths % 600) / 10).toFixed(1).padStart(4, '0');
  return `${minutes}:${seconds}`;
};
