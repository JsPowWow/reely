import { mount } from '@reely/dommy';

import { CheckboxCounter } from './checkbox.counter';
import { ConditionalBinding } from './conditional.binding';
import { Flavours } from './flavours';
import { Greeting } from './greeting';
import { LabelAfterMount } from './label.after.mount';
import { PreOrSpan } from './pre.or.span';
import { TurnBold } from './turn.bold';

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

describe('TurnBold', () => {
  it('turns both names bold, each in its own node', () => {
    const host = render(TurnBold);

    click(host, 'Turn bold');

    expect(host.querySelectorAll('b')).toHaveLength(2);
    expect(host.querySelector('p')?.textContent).toBe('Welcome to reely. reely is awesome!');
  });
});

describe('Greeting', () => {
  it('keeps the greeting while the name is not empty, and rewrites only the name in it', () => {
    const host = render(Greeting);
    const field = host.querySelector('input');
    type(field, 'A');
    const greeting = host.querySelector('p');

    type(field, 'Ada');

    expect(host.querySelector('p')).toBe(greeting);
    expect(greeting?.textContent).toBe('Hello, Ada');
  });
});

describe('ConditionalBinding', () => {
  it('runs the sum only for the inputs of the chosen formula', () => {
    const host = render(ConditionalBinding);
    const [, , c] = Array.from(host.querySelectorAll('input'));
    const runs = (): string | undefined => host.querySelector('[data-runs]')?.textContent ?? undefined;

    type(c ?? null, '9');
    const afterC = runs();
    type(host.querySelector('select'), 'c + d');

    expect(afterC).toBe('1');
    expect(runs()).toBe('2');
    expect(host.querySelector('output')?.textContent).toBe('13');
  });
});

describe('CheckboxCounter', () => {
  it('counts checks, and a reset does not run the effect that counts', () => {
    const host = render(CheckboxCounter);
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

describe('PreOrSpan', () => {
  it('keeps one branch alive however often it switches', () => {
    const host = render(PreOrSpan);

    click(host, 'Switch');
    click(host, 'Switch');
    click(host, 'Switch');

    expect(host.querySelector('span[data-alive]')?.textContent).toBe('1');
    expect(host.querySelector('span[data-built]')?.textContent).toBe('4');
    expect(host.querySelector('pre')?.textContent).toBe('Prefix - Suffix');
  });
});

describe('LabelAfterMount', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reads the new label from the document once it is in it', () => {
    const host = render(LabelAfterMount);

    click(host, 'Increment');
    vi.advanceTimersByTime(0);

    expect(host.querySelector('[data-message]')?.textContent).toBe('Current label: 1');
  });
});
