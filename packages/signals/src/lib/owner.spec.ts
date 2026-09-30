import { effect, getOwner, onCleanup, signal, withOwner } from '../index';
import { subscriberCount } from '../testing';

describe('withOwner', () => {
  it('releases what the work registered on dispose, the last registered first', () => {
    const released: string[] = [];
    const dispose = withOwner((dispose) => {
      onCleanup(() => released.push('timer'));
      onCleanup(() => released.push('socket'));
      return dispose;
    });
    const beforeDispose = [...released];

    dispose();

    expect(beforeDispose).toEqual([]);
    expect(released).toEqual(['socket', 'timer']);
  });

  it('disposes a nested owner with its parent, and a nested owner disposed first leaves the parent', () => {
    const released: string[] = [];
    const lap = signal(1);
    let disposeLeg = (): void => undefined;
    const disposeRace = withOwner((dispose) => {
      withOwner(() => onCleanup(() => released.push('lap board')));
      disposeLeg = withOwner((dispose) => {
        onCleanup(() => released.push('leg'));
        return dispose;
      });
      effect(() => lap.value);
      return dispose;
    });

    disposeLeg();
    disposeRace();

    expect(released).toEqual(['leg', 'lap board']);
    expect(subscriberCount(lap)).toBe(0);
  });

  it('runs every cleanup when one throws, then rethrows the first error', () => {
    const released: string[] = [];
    const dispose = withOwner((dispose) => {
      onCleanup(() => released.push('first'));
      onCleanup(() => {
        throw new Error('storage full');
      });
      onCleanup(() => {
        throw new Error('socket closed');
      });
      return dispose;
    });

    expect(dispose).toThrow('socket closed');
    expect(released).toEqual(['first']);
  });

  it('leaves nothing subscribed when the work throws', () => {
    const lap = signal(1);
    const released = vi.fn();

    expect(() =>
      withOwner(() => {
        effect(() => lap.value);
        onCleanup(released);
        throw new Error('broken board');
      })
    ).toThrow('broken board');
    expect(subscriberCount(lap)).toBe(0);
    expect(released).toHaveBeenCalledOnce();
  });

  it('runs work later under an owner captured with `getOwner`', () => {
    const released: string[] = [];
    let later = (): void => undefined;
    const dispose = withOwner((dispose) => {
      const owner = getOwner();
      later = (): void => withOwner(() => onCleanup(() => released.push('late row')), owner);
      return dispose;
    });

    later();
    dispose();

    expect(released).toEqual(['late row']);
  });

  it('forgets an effect disposed before its owner', () => {
    const held = withOwner(() => {
      effect(() => undefined)();
      return getOwner()?.cleanups.size;
    }, null);

    expect(held).toBe(0);
  });
});

describe('onCleanup', () => {
  it('is held by nothing outside an owner', () => {
    const released = vi.fn();

    onCleanup(released);

    expect(getOwner()).toBeNull();
    expect(released).not.toHaveBeenCalled();
  });
});
