import { addListener, addListeners, createElement } from '../index';

describe('createElement: events', () => {
  it('calls an `onclick` handler with the event of its element', () => {
    const onclick = vi.fn();
    const button = createElement('button', { onclick });

    button.click();

    expect(onclick).toHaveBeenCalledOnce();
    expect(onclick.mock.calls[0]?.[0]).toMatchObject({ type: 'click', currentTarget: button });
  });

  it('calls every handler of an array', () => {
    const first = vi.fn();
    const second = vi.fn();
    const button = createElement('button', { onclick: [first, second] });

    button.click();

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it('passes listener options of `addListener`', () => {
    const handler = vi.fn();
    const button = createElement('button', { onclick: addListener(handler, { once: true }) });

    button.click();
    button.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('combines handlers with and without options in `addListeners`', () => {
    const always = vi.fn();
    const once = vi.fn();
    const button = createElement('button', { onclick: addListeners(always, [once, { once: true }]) });

    button.click();
    button.click();

    expect(always).toHaveBeenCalledTimes(2);
    expect(once).toHaveBeenCalledOnce();
  });

  it('removes all listeners of the element when `eventsAbortSignal` aborts', () => {
    const controller = new AbortController();
    const plain = vi.fn();
    const described = vi.fn();
    const input = createElement('input', {
      eventsAbortSignal: controller.signal,
      onclick: plain,
      onfocus: addListener(described),
    });

    controller.abort();
    input.click();
    input.dispatchEvent(new FocusEvent('focus'));

    expect(plain).not.toHaveBeenCalled();
    expect(described).not.toHaveBeenCalled();
  });

  it('removes a listener when its own `signal` aborts, keeping the others', () => {
    const controller = new AbortController();
    const own = vi.fn();
    const other = vi.fn();
    const button = createElement('button', {
      onclick: addListeners([own, { signal: controller.signal }], other),
    });

    controller.abort();
    button.click();

    expect(own).not.toHaveBeenCalled();
    expect(other).toHaveBeenCalledOnce();
  });
});
