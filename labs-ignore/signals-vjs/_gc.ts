import type { Nullable } from '@reely/utils';
import { hasProperty } from '@reely/utils';

import type { Binding, InternalState } from './state';

const gcCycleInMs = 1000;

let statesToGc: Nullable<Set<InternalState>> = undefined;

export const addAndScheduleOnFirst = (
  set: Nullable<Set<InternalState>>,
  s: InternalState,
  f: VoidFunction,
  waitMs?: number
): Set<InternalState> => (set ?? (waitMs ? setTimeout(f, waitMs) : queueMicrotask(f), new Set())).add(s);

export const addStatesToGc = (d: InternalState): Set<InternalState> =>
  (statesToGc = addAndScheduleOnFirst(
    statesToGc,
    d,
    () => {
      if (!statesToGc) return;

      for (const s of statesToGc) {
        s._bindings = keepConnected(s._bindings);
        s._listeners = keepConnected(s._listeners);
      }

      statesToGc = undefined;
    },
    gcCycleInMs
  ));

export const keepConnected = <T extends Binding>(l: T[]): T[] =>
  l.filter((b) => hasProperty('isConnected', b._dom) && b._dom?.isConnected);
