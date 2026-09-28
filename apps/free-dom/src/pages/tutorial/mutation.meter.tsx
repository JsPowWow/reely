import type { ChildDOMElement, Signal } from '@reely/dommy';
import { b, batch, div, figcaption, figure, signal, span } from '@reely/dommy';
import { exhaustiveGuard, isInstanceOf, isNil, isSomeFunction } from '@reely/utils';

import css from './tutorial.module.css';

type MutationKind = 'text' | 'attribute' | 'node';

const flashColors = {
  text: '#f5c518',
  attribute: '#f5c518',
  node: '#d64545',
} as const satisfies Record<MutationKind, string>;

const toMutationKind = (record: MutationRecord): MutationKind => {
  switch (record.type) {
    case 'characterData':
      return 'text';
    case 'attributes':
      return 'attribute';
    case 'childList':
      return 'node';
    default:
      return exhaustiveGuard(record.type);
  }
};

const toWriteCount = (record: MutationRecord): number =>
  record.type === 'childList' ? record.addedNodes.length + record.removedNodes.length : 1;

const prefersReducedMotion = (): boolean =>
  isSomeFunction(window.matchMedia) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Outlines the element a mutation touched, so the reader sees which DOM nodes a click rewrote.
 */
const flash = (record: MutationRecord): void => {
  const element = isInstanceOf(Element, record.target) ? record.target : record.target.parentElement;
  if (isNil(element) || prefersReducedMotion() || !isSomeFunction(element.animate)) {
    return;
  }
  const color = flashColors[toMutationKind(record)];
  element.animate(
    [
      { outline: `3px solid ${color}`, outlineOffset: '2px' },
      { outline: '3px solid transparent', outlineOffset: '2px' },
    ],
    { duration: 700, easing: 'ease-out' }
  );
};

interface MutationMeterProps {
  children?: ChildDOMElement;
}

/**
 * Wraps a demo: counts the DOM writes it makes by kind and flashes every node it touches.
 */
export const MutationMeter = ({ children }: MutationMeterProps): HTMLElement => {
  const writes = {
    text: signal(0),
    attribute: signal(0),
    node: signal(0),
  } satisfies Record<MutationKind, Signal<number>>;

  const stage = div({ className: css.stage }, children);

  new MutationObserver((records) => {
    batch(() => {
      for (const record of records) {
        writes[toMutationKind(record)].value += toWriteCount(record);
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
