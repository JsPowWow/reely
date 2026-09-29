import { EventEmitter } from '@reely/emitter';
import type { IEventEmitter, Unsubscribe } from '@reely/emitter';

interface RaceEvents {
  start: undefined;
  lap: number;
}

const race: IEventEmitter<RaceEvents> = new EventEmitter<RaceEvents>();
const laps: number[] = [];
const stop: Unsubscribe = race.on('lap', (lap) => laps.push(lap));

race.emit('start');
race.emit('lap', 1);
stop();
race.emit('lap', 2);

if (laps.join() !== '1') {
  throw new Error(`expected laps 1, got ${laps.join()}`);
}
