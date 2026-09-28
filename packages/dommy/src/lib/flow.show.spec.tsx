import { effect, mount, Show, signal } from '../index';
import { reelxDebug } from './reactive/reelx/reelx.core';

describe('Show', () => {
  it('renders the children while `when` is truthy and the fallback otherwise', () => {
    const finished = signal(false);
    const panel = document.createElement('section');
    mount(panel, () => (
      <Show when={finished} fallback={() => <p>Racing</p>}>
        {() => <p>Finished</p>}
      </Show>
    ));
    const racing = panel.textContent;

    finished.value = true;

    expect(racing).toBe('Racing');
    expect(panel.textContent).toBe('Finished');
  });

  it('renders nothing without a fallback while `when` is falsy', () => {
    const winner = signal<string | null>(null);
    const panel = document.createElement('section');
    mount(panel, () => <Show when={winner}>{() => <p>Winner</p>}</Show>);

    expect(panel.querySelectorAll('p')).toHaveLength(0);
  });

  it('keeps the shown branch while `when` stays truthy', () => {
    const lap = signal(1);
    const renders = vi.fn(() => <p>{lap}</p>);
    const panel = document.createElement('section');
    mount(panel, () => <Show when={lap}>{renders}</Show>);
    const first = panel.querySelector('p');

    lap.value = 2;

    expect(renders).toHaveBeenCalledOnce();
    expect(panel.querySelector('p')).toBe(first);
    expect(panel.textContent).toBe('2');
  });

  it('releases the bindings of a hidden branch, and of the shown one when disposed', () => {
    const shown = signal(true);
    const lap = signal(1);
    const panel = document.createElement('section');
    const dispose = mount(panel, () => (
      <Show when={shown} fallback={() => <p>{lap}</p>}>
        {() => <p>{lap}</p>}
      </Show>
    ));

    shown.value = false;
    const afterSwitch = reelxDebug(lap).subscriberCount();
    dispose();

    expect(afterSwitch).toBe(1);
    expect(reelxDebug(lap).subscriberCount()).toBe(0);
    expect(reelxDebug(shown).subscriberCount()).toBe(0);
  });

  it('releases what a branch created when its render throws', () => {
    const shown = signal(false);
    const lap = signal(1);
    mount(document.createElement('div'), () => (
      <Show when={shown}>
        {() => {
          effect(() => lap.value);
          throw new Error('broken branch');
        }}
      </Show>
    ));

    expect(() => (shown.value = true)).toThrow('broken branch');
    expect(reelxDebug(lap).subscriberCount()).toBe(0);
  });
});
