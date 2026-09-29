import { Keyed, mount, signal } from '../index';
import { reelxDebug } from './reactive/reelx/reelx.core';

describe('Keyed', () => {
  it('builds the branch for the value, and anew when the value changes', () => {
    const reviewer = signal('Ada');
    const panel = document.createElement('section');
    mount(panel, () => <Keyed value={reviewer}>{(name) => <p>Review by {name}</p>}</Keyed>);
    const first = panel.querySelector('p');

    reviewer.value = 'Linus';

    expect(first?.textContent).toBe('Review by Ada');
    expect(panel.querySelector('p')).not.toBe(first);
    expect(panel.textContent).toBe('Review by Linus');
  });

  it('keeps the branch while the value stays the same, whatever its getter reads', () => {
    const files = signal([{ name: 'lap.ts', lines: 40 }]);
    const renders = vi.fn((name: string) => <p>{name}</p>);
    const panel = document.createElement('div');
    mount(panel, () => <Keyed value={() => files.value[0]?.name ?? ''}>{renders}</Keyed>);
    const card = panel.querySelector('p');

    files.value = [{ name: 'lap.ts', lines: 41 }];

    expect(renders).toHaveBeenCalledOnce();
    expect(panel.querySelector('p')).toBe(card);
  });

  it('passes `null` to the children like any value, so they decide what no value shows', () => {
    const reviewer = signal<string | null>('Ada');
    const panel = document.createElement('section');
    mount(panel, () => <Keyed value={reviewer}>{(name) => name && <p>Review by {name}</p>}</Keyed>);

    reviewer.value = null;

    expect(panel.querySelectorAll('p')).toHaveLength(0);
  });

  it('follows a getter, and releases the bindings of the branch it replaces', () => {
    const cars = signal([{ id: 7, name: 'Bolt' }]);
    const gap = signal(0.4);
    const panel = document.createElement('section');
    const dispose = mount(panel, () => (
      <Keyed value={() => cars.value[0]?.id}>
        {(id) => (
          <p>
            Car {String(id)}, gap {gap}
          </p>
        )}
      </Keyed>
    ));

    cars.value = [{ id: 3, name: 'Dash' }];
    const afterSwitch = reelxDebug(gap).subscriberCount();
    dispose();

    expect(afterSwitch).toBe(1);
    expect(panel.textContent).toBe('');
    expect(reelxDebug(gap).subscriberCount()).toBe(0);
    expect(reelxDebug(cars).subscriberCount()).toBe(0);
  });

  it('types the value its children receive', () => {
    const lap = signal(3);
    mount(document.createElement('div'), () => (
      <Keyed value={lap}>
        {(value) => {
          expectTypeOf(value).toEqualTypeOf<number>();
          return value;
        }}
      </Keyed>
    ));
  });
});
