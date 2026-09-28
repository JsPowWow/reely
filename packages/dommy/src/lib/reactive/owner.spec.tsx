import { For, mount, onCleanup, Show, signal } from '../../index';

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
});
