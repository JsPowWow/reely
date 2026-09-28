import { mount, Show, signal } from '../index';
import { reelxDebug } from './reactive/reelx/reelx.core';

import type { Signal } from '../index';

const subscribersOf = (source: Signal<unknown>): number => reelxDebug(source).subs()?.size ?? 0;

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
    const afterSwitch = subscribersOf(lap);
    dispose();

    expect(afterSwitch).toBe(1);
    expect(subscribersOf(lap)).toBe(0);
    expect(subscribersOf(shown)).toBe(0);
  });
});
