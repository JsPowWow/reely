import type { ReelyNode, Signal } from '@reely/dommy';
import { batch, dd, div, dl, dt, figcaption, figure, onCleanup, p, signal, span } from '@reely/dommy';
import { exhaustiveGuard, isInstanceOf, isNil, isSomeFunction } from '@reely/utils';

import css from './demo.module.css';
import { demoText } from './demo.text';

/** The kinds of DOM writes the meter counts. */
export type WriteKind = 'text' | 'attribute' | 'move' | 'node';

const writeKinds: readonly WriteKind[] = ['text', 'attribute', 'move', 'node'];

const countSignals = (): Record<WriteKind, Signal<number>> => ({
  text: signal(0),
  attribute: signal(0),
  move: signal(0),
  node: signal(0),
});

/** The nodes one change removed, and those it inserted; a node in both was moved. */
interface ChildListChange {
  removed: Set<Node>;
  added: Set<Node>;
}

const toChildListChange = (records: readonly MutationRecord[]): ChildListChange => {
  const change: ChildListChange = { removed: new Set(), added: new Set() };
  for (const record of records) {
    record.removedNodes.forEach((node) => change.removed.add(node));
    record.addedNodes.forEach((node) => change.added.add(node));
  }
  return change;
};

/** Counts one change by kind: a node removed and inserted again within it is one move. */
const countWrites = (records: readonly MutationRecord[]): Record<WriteKind, number> => {
  const counts = { text: 0, attribute: 0, move: 0, node: 0 } satisfies Record<WriteKind, number>;
  for (const record of records) {
    switch (record.type) {
      case 'characterData':
        counts.text += 1;
        break;
      case 'attributes':
        counts.attribute += 1;
        break;
      case 'childList':
        break;
      default:
        exhaustiveGuard(record.type);
    }
  }
  const { removed, added } = toChildListChange(records);
  counts.move = [...added].filter((node) => removed.has(node)).length;
  counts.node = added.size + removed.size - 2 * counts.move;
  return counts;
};

/** Counts the elements and non-blank text nodes inside `root`, without `root` itself. */
const countNodes = (root: Node): number => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, (node) =>
    node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === ''
      ? NodeFilter.FILTER_SKIP
      : NodeFilter.FILTER_ACCEPT
  );
  let count = 0;
  while (walker.nextNode()) {
    count++;
  }
  return count;
};

/** The running total keeps the text different on every change, so a live region announces repeated clicks too. */
const describeChange = (delta: Readonly<Record<WriteKind, number>>, total: number): string => {
  const { count, change } = demoText().meter;
  const writes = writeKinds.filter((kind) => delta[kind] > 0).map((kind) => count[kind](delta[kind]));
  return writes.length === 0 ? '' : change(writes, total);
};

/** More records than this in one change are shown by the counts alone: flashing them all would cost the frame. */
const flashLimit = 100;

const prefersReducedMotion = (): boolean =>
  isSomeFunction(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The added nodes, so a moved row lights up itself, or the edited node; a removed node is gone. */
const touchedBy = (record: MutationRecord): Node[] =>
  record.type === 'childList' ? Array.from(record.addedNodes) : [record.target];

const flash = (record: MutationRecord, moved: ReadonlySet<Node>): void => {
  for (const node of touchedBy(record)) {
    const token = record.type === 'childList' && !moved.has(node) ? '--flag' : '--signal-ink';
    const element = isInstanceOf(Element, node) ? node : node.parentElement;
    if (isNil(element) || !isSomeFunction(element.animate)) {
      continue;
    }
    const outline = `3px solid ${getComputedStyle(element).getPropertyValue(token)}`;
    const fadeOut = prefersReducedMotion() ? outline : '3px solid transparent';
    element.animate(
      [
        { outline, outlineOffset: '2px' },
        { outline: fadeOut, outlineOffset: '2px' },
      ],
      { duration: 700, easing: 'ease-out' }
    );
  }
};

const readoutClass = {
  text: css.readoutEdit,
  attribute: css.readoutEdit,
  move: css.readoutMove,
  node: css.readoutNode,
} satisfies Record<WriteKind, string | undefined>;

interface MutationMeterProps {
  children?: ReelyNode;
}

/** Wraps a demo: counts its first-render nodes and its DOM writes by kind, flashes and announces each change. */
export const MutationMeter = ({ children }: MutationMeterProps): HTMLElement => {
  const totals = countSignals();
  const deltas = countSignals();
  const announcement = signal('');

  const stage = div({ className: css.stage }, children);

  const observer = new MutationObserver((records) => {
    const delta = countWrites(records);
    batch(() => {
      for (const kind of writeKinds) {
        totals[kind].value += delta[kind];
        deltas[kind].value = delta[kind];
      }
      announcement.value = describeChange(
        delta,
        writeKinds.reduce((sum, kind) => sum + totals[kind].value, 0)
      );
    });
    if (records.length <= flashLimit) {
      const { removed, added } = toChildListChange(records);
      const moved = new Set([...added].filter((node) => removed.has(node)));
      records.forEach((record) => flash(record, moved));
    }
  });
  observer.observe(stage, { subtree: true, childList: true, attributes: true, characterData: true });
  onCleanup(() => observer.disconnect());

  const readout = (kind: WriteKind): HTMLElement =>
    div(
      { className: readoutClass[kind] },
      dt(null, () => demoText().meter.labels[kind]),
      dd(
        null,
        totals[kind],
        span({ className: css.delta, aria: { ariaHidden: 'true' } }, () =>
          deltas[kind].value > 0 ? `+${deltas[kind].value}` : ''
        )
      )
    );

  return figure(
    { className: css.meter },
    stage,
    figcaption(
      { className: css.readouts },
      dl(
        { className: css.board },
        div(
          { className: css.readoutBuilt },
          dt(null, () => demoText().meter.built),
          dd(null, countNodes(stage))
        ),
        writeKinds.map(readout)
      ),
      p({ className: 'visually-hidden', aria: { ariaLive: 'polite' } }, announcement)
    )
  );
};
