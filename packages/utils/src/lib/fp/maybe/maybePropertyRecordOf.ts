import { Maybe } from './Maybe';
import { hasPropertyRecord } from '../../objects/hasPropertyRecord';

const maybePropertyRecordOf =
  <T extends Record<string | number | symbol, unknown>>(object: T) =>
  (key: unknown): Maybe<keyof T> =>
    hasPropertyRecord(key, object) ? Maybe.from(key) : Maybe.none();

export default maybePropertyRecordOf;
