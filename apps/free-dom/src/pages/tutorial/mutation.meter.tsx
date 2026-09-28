import type { ChildDOMElement, Signal } from '@reely/dommy';
import { batch, dd, div, dl, dt, figcaption, figure, p, signal, span } from '@reely/dommy';
import { exhaustiveGuard, isInstanceOf, isNil, isSomeFunction } from '@reely/utils';

import css from './tutorial.module.css';

type WriteKind = 'text' | 'attribute' | 'node';

interface DomWrite {
  kind: WriteKind;
  count: number;
}

const writeKinds: readonly WriteKind[] = ['text', 'attribute', 'node'];

const writeLabels = {
  text: 'Text edits',
  attribute: 'Attribute edits',
  node: 'Nodes added or removed',
} as const satisfies Record<WriteKind, string>;

/** How the announcement names one write of a kind, and several. */
const writeNouns = {
  text: ['text edit', 'text edits'],
  attribute: ['attribute edit', 'attribute edits'],
  node: ['node added or removed', 'nodes added or removed'],
} as const satisfies Record<WriteKind, readonly [string, string]>;

const countSignals = (): Record<WriteKind, Signal<number>> => ({
  text: signal(0),
  attribute: signal(0),
  node: signal(0),
});

const toDomWrite = (record: MutationRecord): DomWrite => {
  switch (record.type) {
    case 'characterData':
      return { kind: 'text', count: 1 };
    case 'attributes':
      return { kind: 'attribute', count: 1 };
    case 'childList':
      return { kind: 'node', count: record.addedNodes.length + record.removedNodes.length };
    default:
      return exhaustiveGuard(record.type);
  }
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

const prefersReducedMotion = (): boolean =>
  isSomeFunction(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Outlines the element a mutation touched, in the page's `--signal-ink` or `--flag` color;
 * with reduced motion the outline shows and hides without fading.
 */
const flash = (record: MutationRecord): void => {
  const element = isInstanceOf(Element, record.target) ? record.target : record.target.parentElement;
  if (isNil(element) || !isSomeFunction(element.animate)) {
    return;
  }
  const token = toDomWrite(record).kind === 'node' ? '--flag' : '--signal-ink';
  const outline = `3px solid ${getComputedStyle(element).getPropertyValue(token)}`;
  const fadeOut = prefersReducedMotion() ? outline : '3px solid transparent';
  element.animate(
    [
      { outline, outlineOffset: '2px' },
      { outline: fadeOut, outlineOffset: '2px' },
    ],
    { duration: 700, easing: 'ease-out' }
  );
};

interface MutationMeterProps {
  children?: ChildDOMElement;
}

/**
 * Wraps a demo: counts the nodes it builds on the first render, then the DOM writes it makes
 * by kind, flashes every node it touches, and announces what the last change did.
 * The observer lives as long as the page: tutorial links navigate with a full reload.
 */
export const MutationMeter = ({ children }: MutationMeterProps): HTMLElement => {
  const totals = countSignals();
  const deltas = countSignals();
  const announcement = signal('');

  const stage = div({ className: css.stage }, children);

  new MutationObserver((records) => {
    const delta = { text: 0, attribute: 0, node: 0 } satisfies Record<WriteKind, number>;
    for (const { kind, count } of records.map(toDomWrite)) {
      delta[kind] += count;
    }
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
    records.forEach(flash);
  }).observe(stage, { subtree: true, childList: true, attributes: true, characterData: true });

  const readout = (kind: WriteKind): HTMLElement =>
    div(
      { className: kind === 'node' ? css.readoutNode : css.readoutEdit },
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
      p({ className: css.visuallyHidden, aria: { ariaLive: 'polite' } }, announcement)
    )
  );
};
