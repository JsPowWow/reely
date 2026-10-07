import { mount } from '@reely/dommy';

import { size } from '../index';

class FakeResizeObserver {
  public static readonly observers = new Set<FakeResizeObserver>();
  public constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.observers.add(this);
  }
  public observe(): void {
    // the test resizes by hand
  }
  public disconnect(): void {
    FakeResizeObserver.observers.delete(this);
  }
  public resize(width: number, height: number): void {
    this.callback([{ contentRect: { width, height } } as ResizeObserverEntry], this as unknown as ResizeObserver);
  }
}

describe('size', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    FakeResizeObserver.observers.clear();
    vi.unstubAllGlobals();
  });

  it('follows the size of the element, and disconnects when its render is disposed', () => {
    const canvas = document.createElement('canvas');
    let box: { value: { width: number; height: number } } | undefined;
    const dispose = mount(document.createElement('div'), () => {
      box = size(canvas);
      return canvas;
    });

    const before = box?.value;
    const [observer] = FakeResizeObserver.observers;
    observer?.resize(320, 180);
    const resized = box?.value;
    dispose();

    expect(before).toEqual({ width: 0, height: 0 });
    expect(resized).toEqual({ width: 320, height: 180 });
    expect(FakeResizeObserver.observers.size).toBe(0);
  });

  // jsdom lays out nothing: the element gets its client size by hand
  const layOut = (element: Element, clientWidth: number, clientHeight: number): void => {
    Object.defineProperties(element, { clientWidth: { value: clientWidth }, clientHeight: { value: clientHeight } });
  };

  it('has the content box of an element in the document at once', () => {
    const canvas = document.createElement('canvas');
    canvas.style.padding = '10px 20px';
    document.body.append(canvas);
    layOut(canvas, 340, 200);

    const box = size(canvas);

    expect(box.value).toEqual({ width: 300, height: 180 });
    canvas.remove();
  });

  it('measures an element a render inserts once the render is in, before the observer reports it', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    let box: { value: { width: number; height: number } } | undefined;
    mount(host, () => {
      const canvas = document.createElement('canvas');
      box = size(canvas);
      layOut(canvas, 320, 180);
      return canvas;
    });

    const inRender = box?.value;
    await Promise.resolve();

    expect(inRender).toEqual({ width: 0, height: 0 });
    expect(box?.value).toEqual({ width: 320, height: 180 });
    host.remove();
  });
});
