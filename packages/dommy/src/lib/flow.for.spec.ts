import { button, dd, div, dt, For, li, mount, signal, ul } from '../index';
import { reelxDebug } from './reactive/reelx/reelx.core';

import type { Signal } from '../index';

interface Racer {
  id: string;
  name: string;
}

const racer = (id: string, name = id.toUpperCase()): Racer => ({ id, name });

/** Renders a board of racers, one `li` per racer with its place and name. */
const renderBoard = (racers: Signal<readonly Racer[]>, lap = signal(1)): { board: HTMLUListElement; dispose: VoidFunction } => {
  const board = ul();
  const dispose = mount(board, () =>
    For({
      each: racers,
      by: (item) => item.id,
      children: (item, index) => li({ id: () => item().id }, () => `${index() + 1}. ${item().name} L${lap.value}`),
    })
  );
  return { board, dispose };
};

const rowsOf = (board: HTMLElement): HTMLLIElement[] => Array.from(board.querySelectorAll('li'));
const textsOf = (board: HTMLElement): string[] => rowsOf(board).map((row) => row.textContent ?? '');

describe('For', () => {
  it('renders one node per item, in order', () => {
    const { board } = renderBoard(signal([racer('a'), racer('b')]));

    expect(textsOf(board)).toEqual(['1. A L1', '2. B L1']);
  });

  it('keeps the node of a key and updates it in place when its item changes', () => {
    const racers = signal<readonly Racer[]>([racer('a'), racer('b')]);
    const { board } = renderBoard(racers);
    const [rowA, rowB] = rowsOf(board);

    racers.value = [racer('a', 'Bolt'), racer('b')];

    expect(rowsOf(board)).toEqual([rowA, rowB]);
    expect(textsOf(board)).toEqual(['1. Bolt L1', '2. B L1']);
  });

  it('inserts new items and removes gone ones, keeping the other nodes', () => {
    const racers = signal<readonly Racer[]>([racer('a'), racer('b'), racer('c')]);
    const { board } = renderBoard(racers);
    const [rowA, , rowC] = rowsOf(board);

    racers.value = [racer('d'), racer('a'), racer('c')];

    expect(textsOf(board)).toEqual(['1. D L1', '2. A L1', '3. C L1']);
    expect(rowsOf(board)[1]).toBe(rowA);
    expect(rowsOf(board)[2]).toBe(rowC);
  });

  it('reorders by moving nodes, and moves only the rows that changed places', () => {
    const racers = signal<readonly Racer[]>(['a', 'b', 'c', 'd'].map((id) => racer(id)));
    const { board } = renderBoard(racers);
    const [rowA, rowB, rowC, rowD] = rowsOf(board);
    const observer = new MutationObserver(() => undefined);
    observer.observe(board, { childList: true });

    racers.value = ['d', 'a', 'b', 'c'].map((id) => racer(id));
    const moved = observer.takeRecords().flatMap((record) => Array.from(record.addedNodes));
    observer.disconnect();

    expect(rowsOf(board)).toEqual([rowD, rowA, rowB, rowC]);
    expect(moved).toEqual([rowD]);
    expect(textsOf(board)).toEqual(['1. D L1', '2. A L1', '3. B L1', '4. C L1']);
  });

  it('keeps the focus in a row that moves', () => {
    const racers = signal<readonly Racer[]>([racer('a'), racer('b')]);
    const board = ul();
    document.body.append(board);
    mount(board, () =>
      For({ each: racers, by: (item) => item.id, children: (item) => li(null, button(null, () => item().name)) })
    );
    const focused = board.querySelectorAll('button')[1];
    focused?.focus();

    racers.value = [racer('b'), racer('a')];

    expect(document.activeElement).toBe(focused);
    board.remove();
  });

  it('releases the bindings of a removed row, and of every row when disposed', () => {
    const lap = signal(1);
    const racers = signal<readonly Racer[]>([racer('a'), racer('b')]);
    const { dispose } = renderBoard(racers, lap);
    const withTwoRows = reelxDebug(lap).subscriberCount();

    racers.value = [racer('a')];
    const withOneRow = reelxDebug(lap).subscriberCount();
    dispose();

    expect(withTwoRows).toBe(2);
    expect(withOneRow).toBe(1);
    expect(reelxDebug(lap).subscriberCount()).toBe(0);
    expect(reelxDebug(racers).subscriberCount()).toBe(0);
  });

  it('moves a row of several nodes as one, and takes all of them away with it', () => {
    const racers = signal<readonly Racer[]>([racer('a'), racer('b')]);
    const board = div();
    mount(board, () =>
      For({
        each: racers,
        by: (item) => item.id,
        children: (item) => [dt(null, () => item().id), dd(null, () => item().name)],
      })
    );

    racers.value = [racer('b'), racer('a')];
    const reordered = board.textContent;
    racers.value = [racer('a')];

    expect(reordered).toBe('bBaA');
    expect(board.textContent).toBe('aA');
  });

  it('renders nothing for an empty list, and rows once there are items', () => {
    const racers = signal<readonly Racer[]>([]);
    const { board } = renderBoard(racers);
    const empty = rowsOf(board).length;

    racers.value = [racer('a')];

    expect(empty).toBe(0);
    expect(textsOf(board)).toEqual(['1. A L1']);
  });
});
