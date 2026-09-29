import objectTypeOf from './objectTypeOf';

describe('objectTypeOf', () => {
  it('names the built-in type of a value, apart for arrays, dates and null', () => {
    expect([[], {}, null, new Date(0), 'lap', 7, true, undefined].map(objectTypeOf)).toEqual([
      'Array',
      'Object',
      'Null',
      'Date',
      'String',
      'Number',
      'Boolean',
      'Undefined',
    ]);
  });
});
