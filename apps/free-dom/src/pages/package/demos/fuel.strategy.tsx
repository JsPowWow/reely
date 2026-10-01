import { batch, computed, effect, signal } from '@reely/signals';

import css from '../../../demo/examples.module.css';

const raceLaps = 20;

// The plan is computed from the laps left, the burn per lap
// and the fuel in the tank. A lap changes two of them inside
// one `batch`: the effect radios the driver once, not twice.
export const FuelStrategy = (): Node => {
  const lapsLeft = signal(raceLaps);
  const burn = signal(2.4);
  const fuel = signal(52);
  const needed = computed(() => lapsLeft.value * burn.value);
  const spare = computed(() => fuel.value - needed.value);
  const plan = computed(() =>
    spare.value >= 0
      ? `Fuel to the finish, ${spare.value.toFixed(1)} l spare`
      : `Box for ${(-spare.value).toFixed(1)} l more`
  );
  const lastCall = signal('');
  let calls = 0;
  const radio = (message: string): void => {
    calls += 1;
    lastCall.value = `Radio call ${calls}: ${message}`;
  };
  effect(() => radio(`${lapsLeft.value} laps, ${fuel.value.toFixed(1)} l`));

  const completeLap = (): void =>
    batch(() => {
      lapsLeft.value -= 1;
      fuel.value = Math.max(0, fuel.value - burn.value);
    });

  return (
    <div className={css.stack}>
      <p className={css.badge}>{plan}</p>
      <div className={css.row}>
        <button
          type='button'
          disabled={() => lapsLeft.value === 0}
          onClick={completeLap}
        >
          Complete a lap
        </button>
        <button type='button' onClick={() => (burn.value += 0.3)}>
          Push
        </button>
        <button
          type='button'
          onClick={() => (fuel.value = Math.max(fuel.value, needed.value))}
        >
          Refuel
        </button>
      </div>
      <p className={css.note}>{lastCall}</p>
    </div>
  );
};
