import {
  createObjectReference,
  forEachSettled,
  hasSome,
  isBoolean,
  isPlainObject,
  isSomeFunction,
  isString,
  messageOf,
} from '@reely/basics';

import type { ObjectReference } from '@reely/basics';

const closed: string[] = [];
let failure: unknown;
try {
  forEachSettled(['a', 'b', 'c'], (name) => {
    if (name === 'b') {
      throw new Error('b');
    }
    closed.push(name);
  });
} catch (error) {
  failure = error;
}

const value: unknown = { lap: 1 };
const lap = isPlainObject(value) ? value['lap'] : undefined;
const query: unknown = JSON.parse('{"q":"lap"}').q;
const muted: unknown = JSON.parse('{"muted":false}').muted;
const leader: ObjectReference<string> = createObjectReference();
const before = leader.current;
leader.current = 'Ada';

if (
  closed.join() !== 'a,c' ||
  !(failure instanceof Error) ||
  lap !== 1 ||
  !hasSome(lap) ||
  isSomeFunction(lap) ||
  !isString(query) ||
  !isBoolean(muted) ||
  messageOf({ message: 'quota exceeded' }) !== 'quota exceeded' ||
  before !== null ||
  leader.current !== 'Ada'
) {
  throw new Error(`unexpected basics: ${JSON.stringify({ closed, lap })}`);
}
