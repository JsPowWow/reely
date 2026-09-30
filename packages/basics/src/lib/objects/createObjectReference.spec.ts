import { createObjectReference } from './createObjectReference';

import type { Ref } from './createObjectReference';

describe('createObjectReference', () => {
  it('starts empty and holds what is put into `current`', () => {
    const field = { focus: (): void => undefined };
    const search = createObjectReference<typeof field>();
    const empty = search.current;

    search.current = field;

    expect(empty).toBeNull();
    expect(search.current).toBe(field);
  });

  it('keeps two references apart', () => {
    const search = createObjectReference<string>();
    const filter = createObjectReference<string>();

    search.current = 'lap';

    expect(filter.current).toBeNull();
  });

  it('types a ref as an object reference, a callback of the value or `null`', () => {
    const refs: Ref<HTMLInputElement>[] = [
      createObjectReference<HTMLInputElement>(),
      (input: HTMLInputElement | null) => input?.focus(),
      null,
    ];

    expectTypeOf(refs[0]).toEqualTypeOf<Ref<HTMLInputElement>>();
    expect(refs).toHaveLength(3);
  });
});
