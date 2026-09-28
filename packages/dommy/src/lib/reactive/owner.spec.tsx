import { effect, For, mount, onCleanup, Show, signal } from '../../index';
import { getOwner, withOwner } from './owner';
import { reelxDebug } from './reelx/reelx.core';

describe('onCleanup', () => {
  it('runs when the mounted view is disposed, not before', () => {
    const stopTimer = vi.fn();
    const dispose = mount(document.createElement('div'), () => {
      onCleanup(stopTimer);
      return <canvas />;
    });
    const beforeDispose = stopTimer.mock.calls.length;

    dispose();

    expect(beforeDispose).toBe(0);
    expect(stopTimer).toHaveBeenCalledOnce();
  });

  it('runs for a row of `For` when its key is gone', () => {
    const released: string[] = [];
    const ids = signal<readonly string[]>(['a', 'b']);
    mount(document.createElement('ol'), () => (
      <For each={ids} by={(id) => id}>
        {(id) => {
          const own = id();
          onCleanup(() => released.push(own));
          return <li>{own}</li>;
        }}
      </For>
    ));

    ids.value = ['b'];

    expect(released).toEqual(['a']);
  });

  it('runs for the branch of `Show` when it is hidden', () => {
    const released = vi.fn();
    const shown = signal(true);
    mount(document.createElement('div'), () => (
      <Show when={shown}>
        {() => {
          onCleanup(released);
          return <p>Finished</p>;
        }}
      </Show>
    ));

    shown.value = false;

    expect(released).toHaveBeenCalledOnce();
  });

  it('runs the other cleanups when one throws, then throws its error', () => {
    const released = vi.fn();
    const dispose = mount(document.createElement('div'), () => {
      onCleanup(released);
      onCleanup(() => {
        throw new Error('stuck timer');
      });
      return <canvas />;
    });

    expect(dispose).toThrow('stuck timer');
    expect(released).toHaveBeenCalledOnce();
  });

  it('releases what a render created when the render throws', () => {
    const lap = signal(1);

    expect(() =>
      mount(document.createElement('div'), () => {
        effect(() => lap.value);
        throw new Error('broken view');
      })
    ).toThrow('broken view');
    expect(reelxDebug(lap).subscriberCount()).toBe(0);
  });

  it('forgets an effect disposed before its owner', () => {
    const held = withOwner(() => {
      effect(() => undefined)();
      return getOwner()?.cleanups.size;
    }, null);

    expect(held).toBe(0);
  });
});
