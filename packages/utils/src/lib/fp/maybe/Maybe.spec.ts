import noop from '../noop';
import { Maybe } from './Maybe';

const Null = Maybe.from(null);
const withNone = (): Maybe<null> => Null;
const someObject = Maybe.from(Object.freeze({ just: 'value' }));
const withSome = (): unknown => someObject;
const withOtherSome = (v: object) =>
  Maybe.from({ ...v, ...Maybe.from(Object.freeze({ other: 'otherJustValue' })).getOrElse({ notExpected: true }) });
const notDefined = undefined;

describe('Maybe tests', () => {
  it('inspect available functionality', () => {
    expect(Maybe.from(null).getOrElse('<null>')).toBe('<null>');
    expect(Maybe.from(notDefined).getOrElse('<undefined>')).toBe('<undefined>');
    expect(Maybe.from('something').getOrElse('<not-expected>')).toBe('something');
    expect(Maybe.from(noop).getOrElse('<not-expected>')).toStrictEqual(noop);

    expect(() => Maybe.some(null)).toThrowError();
    expect(() => Maybe.some(notDefined)).toThrowError();
    expect(Maybe.some('phrase').getOrElse('<not-expected>')).toBe('phrase');
    expect(Maybe.some(noop).getOrElse('<not-expected>')).toStrictEqual(noop);
  });

  // TODO AR
  it.skip('"nothing" is a smart nullish value constant tests', () => {
    expect(Object.is(Maybe.from(null), Maybe.from(notDefined))).toBe(true);
    expect(Maybe.from(null)).toStrictEqual(Maybe.none());
    expect(Maybe.from(notDefined)).toStrictEqual(Maybe.none());
    expect(Maybe.from(null)).toStrictEqual(Maybe.from(notDefined));
    expect(Maybe.from(notDefined)).toStrictEqual(Maybe.from(null));

    expect(Null.map(withNone)).toStrictEqual(Maybe.none());
    expect(Maybe.none().map(withNone)).toStrictEqual(Null);

    expect(Null.map(withSome)).toStrictEqual(Maybe.none());
    expect(Maybe.none().map(withSome)).toStrictEqual(Null);

    expect(someObject.map(withNone).map(withOtherSome)).toStrictEqual(Maybe.none()); // TODO AR WTF ?
    expect(Maybe.none().map(withSome).map(withOtherSome)).toStrictEqual(Null);
  });

  describe(`Maybe bind another "Maybe" continuation tests`, () => {
    /**
     * There are four possible combinations of 2 maybes
     * The only combination that leads to a new Maybe.some(_) is when we combine the two Maybe.some(_) paths .
     * - Maybe.none( ).bind(withNone) -> none
     * - Maybe.none( ).bind(withSome) -> none
     * - Maybe.some(x).bind(withNone) -> none
     * - Maybe.some(x).bind(withSome) -> Maybe.some(x')
     */
    it('Maybe.none().fMap(withNone) -> none', () => {
      expect(Null.map(withSome)).toStrictEqual(Maybe.none());
    });
    it('Maybe.none().fMap(withSome) -> none', () => {
      expect(Null.map(withSome)).toStrictEqual(Maybe.none());
    });
    // TODO AR
    it.skip('Maybe.some(x).fMap(withNone) -> none', () => {
      expect(someObject.map(withNone)).toStrictEqual(Maybe.none());
    });

    // TODO AR
    it.skip('Maybe.some(x).fMap(withSome) -> some', () => {
      expect(someObject.map(withOtherSome)).toStrictEqual(
        Maybe.from({
          just: 'value',
          other: 'otherJustValue',
        })
      );
    });
  });
});
