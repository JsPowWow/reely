import { mount } from '../../index';
import { size } from '../../kit';

/** A `ResizeObserver` the test drives by hand. */
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
    vi.unstubAllGlobals();
  });

  it('follows the size of the element, and disconnects when its render is disposed', () => {
    const canvas = document.createElement('canvas');
    let box: { value: { width: number; height: number } } | undefined;
    const dispose = mount(document.createElement('div'), () => {
      box = size(canvas);
      return canvas;
    });

    const [observer] = FakeResizeObserver.observers;
    observer?.resize(320, 180);
    const resized = box?.value;
    dispose();

    expect(resized).toEqual({ width: 320, height: 180 });
    expect(FakeResizeObserver.observers.size).toBe(0);
  });
});
