import { forEachSettled, hasSome, isPlainObject, isSomeFunction, isString, messageOf } from '@reely/basics';

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

if (
  closed.join() !== 'a,c' ||
  !(failure instanceof Error) ||
  lap !== 1 ||
  !hasSome(lap) ||
  isSomeFunction(lap) ||
  !isString(query) ||
  messageOf({ message: 'quota exceeded' }) !== 'quota exceeded'
) {
  throw new Error(`unexpected basics: ${JSON.stringify({ closed, lap })}`);
}
