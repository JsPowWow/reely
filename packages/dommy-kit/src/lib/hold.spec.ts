import { mount } from '@reely/dommy';

import { hold } from '../index';

// jsdom has no `PointerEvent` and no pointer capture
const pointer = (type: string, pointerId = 1): Event => Object.assign(new Event(type), { pointerId });

const knob = (): HTMLDivElement => {
  const captured = new Set<number>();
  return Object.assign(document.createElement('div'), {
    setPointerCapture: vi.fn((id: number) => void captured.add(id)),
    releasePointerCapture: vi.fn((id: number) => void captured.delete(id)),
    hasPointerCapture: (id: number) => captured.has(id),
  });
};

describe('hold', () => {
  it('captures the pointer it was pressed with, follows its moves, and lets go of it once', () => {
    const element = knob();
    const seen: string[] = [];
    hold(element, (down) => {
      seen.push(`down ${down.pointerId}`);
      return {
        move: (event) => void seen.push(`move ${event.pointerId}`),
        up: (event) => void seen.push(`up ${event.type}`),
      };
    });

    element.dispatchEvent(pointer('pointerdown', 7));
    element.dispatchEvent(pointer('pointermove', 7));
    element.dispatchEvent(pointer('pointerup', 7));
    element.dispatchEvent(pointer('lostpointercapture', 7));
    element.dispatchEvent(pointer('pointermove', 7));

    expect(element.setPointerCapture).toHaveBeenCalledExactlyOnceWith(7);
    expect(seen).toEqual(['down 7', 'move 7', 'up pointerup']);
  });

  it.each(['pointercancel', 'lostpointercapture'])('lets go when the press ends by `%s`', (type) => {
    const element = knob();
    const up = vi.fn();
    hold(element, () => ({ up }));

    element.dispatchEvent(pointer('pointerdown'));
    element.dispatchEvent(pointer(type));

    expect(up).toHaveBeenCalledOnce();
  });

  it('holds one pointer at a time, and leaves alone a press it returns nothing for', () => {
    const element = knob();
    const move = vi.fn();
    const up = vi.fn();
    hold(element, (down) => (down.pointerId === 9 ? undefined : { move, up }));

    element.dispatchEvent(pointer('pointerdown', 9));
    element.dispatchEvent(pointer('pointerup', 9));
    element.dispatchEvent(pointer('pointerdown', 1));
    element.dispatchEvent(pointer('pointerdown', 2));
    element.dispatchEvent(pointer('pointermove', 2));
    element.dispatchEvent(pointer('pointerup', 2));

    expect(element.setPointerCapture).toHaveBeenCalledExactlyOnceWith(1);
    expect(move).not.toHaveBeenCalled();
    expect(up).not.toHaveBeenCalled();
  });

  it('is not stuck when the capture fails', () => {
    const element = knob();
    element.setPointerCapture = (): void => {
      throw new DOMException('No active pointer', 'NotFoundError');
    };
    const press = vi.fn(() => ({}));
    hold(element, press);
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent): void => {
      event.preventDefault();
      errors.push(event.error);
    };
    window.addEventListener('error', onError);

    element.dispatchEvent(pointer('pointerdown', 1));
    element.dispatchEvent(pointer('pointerdown', 2));
    window.removeEventListener('error', onError);

    expect(press).toHaveBeenCalledTimes(2);
    expect(errors).toHaveLength(2);
  });

  it('stops with the render that made it, or by the function it returns, letting go of a press', () => {
    const inRender = knob();
    const alone = knob();
    const up = vi.fn();
    const press = vi.fn(() => ({ up }));
    const dispose = mount(document.createElement('div'), () => {
      hold(inRender, press);
      return null;
    });
    const stop = hold(alone, press);

    alone.dispatchEvent(pointer('pointerdown', 4));
    dispose();
    stop();
    inRender.dispatchEvent(pointer('pointerdown'));
    alone.dispatchEvent(pointer('pointerup', 4));

    expect(press).toHaveBeenCalledOnce();
    expect(alone.hasPointerCapture(4)).toBe(false);
    expect(up).not.toHaveBeenCalled();
  });
});
