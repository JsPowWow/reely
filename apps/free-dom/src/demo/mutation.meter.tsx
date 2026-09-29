import type { ReelyNode, Signal } from '@reely/dommy';
import { batch, dd, div, dl, dt, figcaption, figure, onCleanup, p, signal, span } from '@reely/dommy';
import { exhaustiveGuard, isInstanceOf, isNil, isSomeFunction } from '@reely/utils';

import css from './demo.module.css';

type WriteKind = 'text' | 'attribute' | 'move' | 'node';

const writeKinds: readonly WriteKind[] = ['text', 'attribute', 'move', 'node'];

const writeLabels = {
  text: 'Text edits',
  attribute: 'Attribute edits',
  move: 'Nodes moved',
  node: 'Nodes added or removed',
} as const satisfies Record<WriteKind, string>;

/** How the announcement names one write of a kind, and several. */
const writeNouns = {
  text: ['text edit', 'text edits'],
  attribute: ['attribute edit', 'attribute edits'],
  move: ['node moved', 'nodes moved'],
  node: ['node added or removed', 'nodes added or removed'],
} as const satisfies Record<WriteKind, readonly [string, string]>;

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

/**
 * "Last change: 2 nodes added or removed. 4 writes since the first render." The running total
 * keeps the text different on every change, so a live region announces repeated clicks too.
 * Empty when nothing changed.
 */
const describeChange = (delta: Readonly<Record<WriteKind, number>>, total: number): string => {
  const parts = writeKinds
    .filter((kind) => delta[kind] > 0)
    .map((kind) => `${delta[kind]} ${writeNouns[kind][delta[kind] === 1 ? 0 : 1]}`);
  return parts.length === 0
    ? ''
    : `Last change: ${parts.join(', ')}. ${total} ${total === 1 ? 'write' : 'writes'} since the first render.`;
};

/** More records than this in one change are shown by the counts alone: flashing them all would cost the frame. */
const flashLimit = 100;

const prefersReducedMotion = (): boolean =>
  isSomeFunction(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * What a mutation left to see: the nodes it added, so a moved row lights up itself, or the node it
 * edited. A removed node is gone, so only the counts show it.
 */
const touchedBy = (record: MutationRecord): Node[] =>
  record.type === 'childList' ? Array.from(record.addedNodes) : [record.target];

/**
 * Outlines the elements a mutation touched (a text node's element for text), in the page's
 * `--signal-ink` or `--flag` color; with reduced motion the outline shows and hides without fading.
 */
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

/**
 * Wraps a demo: counts the nodes it builds on the first render, then the DOM writes it makes
 * by kind, flashes the nodes a small change touches, and announces what the last change did.
 * The observer is disconnected when the page is taken down.
 */
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
      dt(null, writeLabels[kind]),
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
        div({ className: css.readoutBuilt }, dt(null, 'Built at first render'), dd(null, countNodes(stage))),
        writeKinds.map(readout)
      ),
      p({ className: 'visually-hidden', aria: { ariaLive: 'polite' } }, announcement)
    )
  );
};
