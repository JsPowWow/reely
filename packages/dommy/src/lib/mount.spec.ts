import { subscriberCount } from '@reely/signals/testing';

import { div, effect, li, mount, signal, span, ul } from '../index';

describe('mount', () => {
  it('appends the rendered view to the parent', () => {
    const parent = div();

    mount(parent, () => span(null, 'Bolt'));

    expect(parent.innerHTML).toBe('<span>Bolt</span>');
  });

  it('removes the view and releases every binding and effect made while rendering', () => {
    const parent = div();
    const leader = signal('Bolt');
    const lap = signal(1);
    const laps: number[] = [];

    const dispose = mount(parent, () => {
      effect(() => {
        laps.push(lap.value);
      });
      return ul({ title: leader }, li({ styles: { color: () => (lap.value > 1 ? 'red' : 'black') } }, leader));
    });
    dispose();
    lap.value = 2;
    leader.value = 'Flash';

    expect(parent.childNodes).toHaveLength(0);
    expect(subscriberCount(leader)).toBe(0);
    expect(subscriberCount(lap)).toBe(0);
    expect(laps).toEqual([1]);
  });

  it('keeps bindings made outside a mount alive after it is disposed', () => {
    const leader = signal('Bolt');
    const outside = span(null, leader);

    mount(div(), () => span(null, leader))();
    leader.value = 'Flash';

    expect(outside.textContent).toBe('Flash');
  });
});
