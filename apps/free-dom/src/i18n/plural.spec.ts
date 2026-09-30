import { pluralOf } from './plural';

describe('pluralOf', () => {
  it('picks the Russian form for one, few and many', () => {
    const edits = (count: number): string =>
      `${count} ${pluralOf('ru')(count, { one: 'правка', few: 'правки', many: 'правок', other: 'правки' })}`;

    expect([1, 2, 5, 11, 21, 22, 25, 111].map(edits)).toEqual([
      '1 правка',
      '2 правки',
      '5 правок',
      '11 правок',
      '21 правка',
      '22 правки',
      '25 правок',
      '111 правок',
    ]);
  });

  it('falls back to the other form when a form is not given', () => {
    expect(pluralOf('en')(1, { one: 'write', other: 'writes' })).toBe('write');
    expect(pluralOf('en')(0, { one: 'write', other: 'writes' })).toBe('writes');
  });
});
