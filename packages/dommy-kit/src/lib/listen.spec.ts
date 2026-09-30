import { mount } from '@reely/dommy';

import { listen } from '../index';

describe('listen', () => {
  it('calls the handler with the typed event until the render that added it is disposed', () => {
    const keys: string[] = [];
    const dispose = mount(document.createElement('div'), () => {
      listen(window, 'keydown', (event) => keys.push(event.key));
      return null;
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    dispose();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));

    expect(keys).toEqual(['a']);
  });

  it('returns the function that removes the listener, and keeps the options it was given', () => {
    const handler = vi.fn();
    const button = document.createElement('button');
    const stop = listen(button, 'click', handler, { once: true });

    button.click();
    button.click();
    stop();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('stops when the signal from the options aborts', () => {
    const handler = vi.fn();
    const controller = new AbortController();
    listen(document, 'click', handler, { signal: controller.signal });

    controller.abort();
    document.dispatchEvent(new Event('click'));

    expect(handler).not.toHaveBeenCalled();
  });
});
