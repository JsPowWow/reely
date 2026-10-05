import { subscriberCount } from '@reely/signals/testing';

import { effect, mount, Show, signal } from '../../index';

describe('Show', () => {
  it('gives the children the truthy value of `when`, kept current while the branch is shown', () => {
    interface Try {
      attempt: string;
    }
    const waiting = signal<Try | null>(null);
    const renders = vi.fn();
    const panel = document.createElement('section');
    mount(panel, () => (
      <Show when={waiting}>
        {(current) => {
          renders();
          return <p>{() => current().attempt}</p>;
        }}
      </Show>
    ));

    waiting.value = { attempt: 'lap 3' };
    const first = panel.textContent;
    waiting.value = { attempt: 'lap 4' };

    expect(first).toBe('lap 3');
    expect(panel.textContent).toBe('lap 4');
    expect(renders).toHaveBeenCalledOnce();
  });

  it('types the value children get as `when` without its falsy members', () => {
    interface Try {
      attempt: string;
    }
    const waiting = signal<Try | null>(null);
    const place = signal<'' | 'pole' | 'podium'>('');
    const finished = signal(false);

    const views = [
      <Show when={waiting}>{(current) => expectTypeOf(current).returns.toEqualTypeOf<Try>()}</Show>,
      <Show when={() => waiting.value?.attempt}>
        {(current) => expectTypeOf(current).returns.toEqualTypeOf<string>()}
      </Show>,
      <Show when={place}>{(current) => expectTypeOf(current).returns.toEqualTypeOf<'pole' | 'podium'>()}</Show>,
      <Show when={finished}>{(current) => expectTypeOf(current).returns.toEqualTypeOf<true>()}</Show>,
    ];

    expect(views).toHaveLength(4);
  });

  it('gives a read after the branch is hidden the last truthy value, never a falsy one', () => {
    const winner = signal<string | null>('Ada');
    let readWinner = (): string => '';
    mount(document.createElement('section'), () => (
      <Show when={winner}>
        {(current) => {
          readWinner = current;
          return <p>Winner</p>;
        }}
      </Show>
    ));

    winner.value = null;

    expect(readWinner()).toBe('Ada');
  });

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

  it('hears `when` written by its own branch while it renders, and every write after', () => {
    const open = signal(false);
    let firstRender = true;
    const panel = document.createElement('section');
    mount(panel, () => (
      <Show when={open}>
        {() => {
          if (firstRender) {
            firstRender = false;
            open.value = false;
          }
          return <p>shown</p>;
        }}
      </Show>
    ));

    open.value = true;
    const closedByBranch = panel.textContent;
    open.value = true;
    const openedAgain = panel.textContent;
    open.value = false;

    expect([closedByBranch, openedAgain, panel.textContent]).toEqual(['', 'shown', '']);
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
    const afterSwitch = subscriberCount(lap);
    dispose();

    expect(afterSwitch).toBe(1);
    expect(subscriberCount(lap)).toBe(0);
    expect(subscriberCount(shown)).toBe(0);
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
    expect(subscriberCount(lap)).toBe(0);
  });

  it('does not subscribe the condition to what a branch reads while it is built', () => {
    const shown = signal(true);
    const lap = signal(1);
    const renders = vi.fn(() => <p>Lap {String(lap.value)}</p>);
    mount(document.createElement('div'), () => (
      <Show when={shown} fallback={renders}>
        {() => <p>Finished</p>}
      </Show>
    ));
    shown.value = false;

    lap.value = 2;

    expect(renders).toHaveBeenCalledOnce();
    expect(subscriberCount(lap)).toBe(0);
  });
});
