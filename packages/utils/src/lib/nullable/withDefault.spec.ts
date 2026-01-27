import { withDefault } from './withDefault';

const notDefined = undefined;
describe('withDefault tests', () => {
  it('should be curried having one provided argument', () => {
    const result = withDefault('');
    expect(result).toBeInstanceOf(Function);
  });

  it('when given a default value and "null" returns the default value', () => {
    const result = withDefault('<<nil>>', null);
    expect(result).toBe('<<nil>>');
    const resultC = withDefault('<<nil>>')(null);
    expect(resultC).toBe('<<nil>>');
  });

  it('when given a default value and "undefined" returns the default value', () => {
    const result = withDefault('<<nil>>', notDefined);
    expect(result).toBe('<<nil>>');
    const resultC = withDefault('<<nil>>')(notDefined);
    expect(resultC).toBe('<<nil>>');
  });

  describe('when given a default and a concrete values', () => {
    it('returns the concrete value value', () => {
      const result = withDefault<string>('<<nil>>', 'test me');
      expect(result).toBe('test me');
    });
  });
});
