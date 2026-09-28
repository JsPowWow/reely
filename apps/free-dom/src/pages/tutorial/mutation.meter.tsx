import type { ChildDOMElement, Signal } from '@reely/dommy';
import { b, batch, div, figcaption, figure, signal, span } from '@reely/dommy';
import { exhaustiveGuard, isInstanceOf, isNil, isSomeFunction } from '@reely/utils';

import css from './tutorial.module.css';

type WriteKind = 'text' | 'attribute' | 'node';

interface DomWrite {
  kind: WriteKind;
  count: number;
}

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

const prefersReducedMotion = (): boolean =>
  isSomeFunction(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Outlines the element a mutation touched, in the page's `--signal` or `--flag` color;
 * with reduced motion the outline shows and hides without fading.
 */
const flash = (record: MutationRecord): void => {
  const element = isInstanceOf(Element, record.target) ? record.target : record.target.parentElement;
  if (isNil(element) || !isSomeFunction(element.animate)) {
    return;
  }
  const token = toDomWrite(record).kind === 'node' ? '--flag' : '--signal';
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
 * Wraps a demo: counts the DOM writes it makes by kind and flashes every node it touches.
 * The observer lives as long as the page: tutorial links navigate with a full reload.
 */
export const MutationMeter = ({ children }: MutationMeterProps): HTMLElement => {
  const writes = {
    text: signal(0),
    attribute: signal(0),
    node: signal(0),
  } satisfies Record<WriteKind, Signal<number>>;

  const stage = div({ className: css.stage }, children);

  new MutationObserver((records) => {
    batch(() => {
      for (const { kind, count } of records.map(toDomWrite)) {
        writes[kind].value += count;
      }
    });
    records.forEach(flash);
  }).observe(stage, { subtree: true, childList: true, attributes: true, characterData: true });

  return figure(
    { className: css.meter },
    stage,
    figcaption(
      { className: css.writes },
      span({ className: css.write }, 'Text edits ', b(null, writes.text)),
      span({ className: css.write }, 'Attribute edits ', b(null, writes.attribute)),
      span({ className: css.writeNode }, 'Nodes added or removed ', b(null, writes.node))
    )
  );
};
