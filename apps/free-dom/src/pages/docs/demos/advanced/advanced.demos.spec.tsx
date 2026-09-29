import { mount } from '@reely/dommy';

import { AddressView } from './address.view';
import { CouponHint } from './coupon.hint';
import { DeliveryCost } from './delivery.cost';
import { Flavours } from './flavours';
import { PlayCounter } from './play.counter';
import { SalePrice } from './sale.price';
import { SlideCaption } from './slide.caption';

const render = (view: () => Node): HTMLElement => {
  const host = document.createElement('div');
  document.body.append(host);
  mount(host, view);
  return host;
};

const click = (host: Element, text: string): void => {
  Array.from(host.querySelectorAll('button'))
    .find((button) => button.textContent === text)
    ?.click();
};

const type = (field: HTMLInputElement | HTMLSelectElement | null, value: string): void => {
  if (field !== null) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

afterEach(() => {
  document.body.replaceChildren();
});

describe('Flavours', () => {
  it('sets `list` as an attribute and reads the choice from the `value` property', () => {
    const host = render(Flavours);
    const field = host.querySelector('input');

    type(field, 'Mint');

    expect(field?.getAttribute('list')).toBe(host.querySelector('datalist')?.id);
    expect(host.querySelector('output')?.textContent).toBe('Mint');
  });
});

describe('SalePrice', () => {
  it('marks both prices, each in its own node', () => {
    const host = render(SalePrice);

    click(host, 'Start the sale');

    expect(host.querySelectorAll('mark')).toHaveLength(2);
    expect(host.querySelector('p')?.textContent).toBe('Rain jacket, €32. Pay €32 at checkout.');
  });
});

describe('CouponHint', () => {
  it('keeps the hint while the code is not empty, and rewrites only the code in it', () => {
    const host = render(CouponHint);
    const field = host.querySelector('input');
    type(field, 'S');
    const hint = host.querySelector('p');

    type(field, 'SPRING10');

    expect(host.querySelector('p')).toBe(hint);
    expect(hint?.textContent).toBe('SPRING10 will be applied at checkout');
  });
});

describe('DeliveryCost', () => {
  it('runs the cost only for the fees of the chosen delivery', () => {
    const host = render(DeliveryCost);
    const [, , lockerFee] = Array.from(host.querySelectorAll('input'));
    const runs = (): string | undefined => host.querySelector('[data-runs]')?.textContent ?? undefined;

    type(lockerFee ?? null, '9');
    const afterLockerFee = runs();
    type(host.querySelector('select'), 'Pickup');

    expect(afterLockerFee).toBe('1');
    expect(runs()).toBe('2');
    expect(host.querySelector('output')?.textContent).toBe('€12');
  });
});

describe('PlayCounter', () => {
  it('counts plays, and a reset does not run the effect that counts', () => {
    const host = render(PlayCounter);
    const box = host.querySelector('input');

    box?.click();
    box?.click();
    box?.click();
    const counted = host.querySelector('output')?.textContent;
    click(host, 'Reset');

    expect(counted).toBe('2');
    expect(host.querySelector('output')?.textContent).toBe('0');
  });
});

describe('AddressView', () => {
  it('keeps one view alive however often it switches', () => {
    const host = render(AddressView);

    click(host, 'Switch view');
    click(host, 'Switch view');
    click(host, 'Switch view');

    expect(host.querySelector('span[data-alive]')?.textContent).toBe('1');
    expect(host.querySelector('span[data-built]')?.textContent).toBe('4');
    expect(host.querySelector('pre')?.textContent).toBe('Rua Augusta 24\nLisbon\nPortugal');
  });
});

describe('SlideCaption', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the new caption from the document once it is in it', () => {
    const host = render(SlideCaption);

    click(host, 'Next slide');
    vi.advanceTimersByTime(0);

    expect(host.querySelector('[data-message]')?.textContent).toBe('Read from the page: Slide 2');
  });
});
