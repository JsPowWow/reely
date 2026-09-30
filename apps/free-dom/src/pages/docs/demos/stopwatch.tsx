import { mount, onCleanup, signal } from '@reely/dommy';
import { hasSome, noop } from '@reely/utils';

import css from './demos.module.css';

const runningTimers = signal(0);

// A view that owns a timer: `onCleanup` stops it when the view is taken down.
const Stopwatch = (): Node => {
  const tenths = signal(0);
  const timer = setInterval(() => (tenths.value += 1), 100);
  runningTimers.value += 1;
  onCleanup(() => {
    clearInterval(timer);
    runningTimers.value -= 1;
  });
  return <output className={css.value}>{() => (tenths.value / 10).toFixed(1)}</output>;
};

export const StopwatchSlot = (): Node => {
  let slot: HTMLDivElement | undefined;
  const running = signal(false);
  let unmount: VoidFunction = noop;

  const toggle = (): void => {
    if (running.value) {
      unmount();
      running.value = false;
    } else if (hasSome(slot)) {
      unmount = mount(slot, () => <Stopwatch />);
      running.value = true;
    }
  };
  onCleanup(() => unmount());

  return (
    <div className={css.row}>
      <div
        className={css.slot}
        elementRef={(element) => {
          slot = element;
        }}
      />
      <button onClick={toggle}>{() => (running.value ? 'Stop and unmount' : 'Mount a stopwatch')}</button>
      <p className={css.status}>Timers running: {runningTimers}</p>
    </div>
  );
};
