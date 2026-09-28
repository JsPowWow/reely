import { For, mount, Show, signal } from '../index';

/** The rendered markup without the anchors flows keep their place by. */
const markupOf = (host: Element): string => host.innerHTML.replace(/<!--[^>]*-->/g, '');

interface Racer {
  id: string;
  out: boolean;
}

describe('nested flows', () => {
  it('moves a row whose root is a Show with the branch it shows now', () => {
    const racers = signal<readonly Racer[]>([
      { id: 'a', out: false },
      { id: 'b', out: false },
    ]);
    const host = document.createElement('div');
    mount(host, () => (
      <For each={racers} by={(racer) => racer.id}>
        {(racer) => (
          <Show when={() => !racer().out} fallback={() => <i>{racer().id} out</i>}>
            {() => <b>{racer().id}</b>}
          </Show>
        )}
      </For>
    ));

    racers.value = [
      { id: 'a', out: false },
      { id: 'b', out: true },
    ];
    racers.value = [...racers.value].reverse();

    expect(markupOf(host)).toBe('<i>b out</i><b>a</b>');
  });

  it('removes a row whose root is a Show with the branch it shows now', () => {
    const racers = signal<readonly Racer[]>([{ id: 'a', out: false }]);
    const host = document.createElement('div');
    mount(host, () => (
      <For each={racers} by={(racer) => racer.id}>
        {(racer) => (
          <Show when={() => !racer().out} fallback={() => <i>out</i>}>
            {() => <b>in</b>}
          </Show>
        )}
      </For>
    ));

    racers.value = [{ id: 'a', out: true }];
    racers.value = [];

    expect(markupOf(host)).toBe('');
  });

  it('moves a row whose root is a For with the rows it has now', () => {
    const groups = signal<readonly { id: string; laps: readonly number[] }[]>([
      { id: 'x', laps: [1] },
      { id: 'y', laps: [1] },
    ]);
    const host = document.createElement('div');
    mount(host, () => (
      <For each={groups} by={(group) => group.id}>
        {(group) => (
          <For each={() => group().laps} by={(lap) => lap}>
            {(lap) => (
              <i>
                {() => group().id}
                {lap}
              </i>
            )}
          </For>
        )}
      </For>
    ));

    groups.value = [
      { id: 'x', laps: [1, 2] },
      { id: 'y', laps: [1, 2] },
    ];
    groups.value = [...groups.value].reverse();

    expect(markupOf(host)).toBe('<i>y1</i><i>y2</i><i>x1</i><i>x2</i>');
  });

  it('hides a branch whose root is a For with the rows it has now', () => {
    const shown = signal(true);
    const laps = signal<readonly number[]>([1]);
    const host = document.createElement('div');
    mount(host, () => (
      <Show when={shown}>
        {() => (
          <For each={laps} by={(lap) => lap}>
            {(lap) => <i>{lap}</i>}
          </For>
        )}
      </Show>
    ));

    laps.value = [1, 2];
    shown.value = false;

    expect(markupOf(host)).toBe('');
  });

  it('takes down a mounted Show with the branch it shows now', () => {
    const shown = signal(true);
    const host = document.createElement('div');
    const dispose = mount(host, () => (
      <Show when={shown} fallback={() => <i>B</i>}>
        {() => <b>A</b>}
      </Show>
    ));

    shown.value = false;
    dispose();

    expect(host.innerHTML).toBe('');
  });
});
