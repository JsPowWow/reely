import { localized } from '../i18n/localized';
import { pluralOf } from '../i18n/plural';

import type { WriteKind } from './demo.types';

const plural = pluralOf('en');

const en = {
  meter: {
    built: 'Built at first render',
    labels: {
      text: 'Text edits',
      attribute: 'Attribute edits',
      move: 'Nodes moved',
      node: 'Nodes added or removed',
    } satisfies Record<WriteKind, string>,
    /** How the announcement counts the writes of one kind. */
    count: {
      text: (count: number): string => `${count} ${plural(count, { one: 'text edit', other: 'text edits' })}`,
      attribute: (count: number): string =>
        `${count} ${plural(count, { one: 'attribute edit', other: 'attribute edits' })}`,
      move: (count: number): string => `${count} ${plural(count, { one: 'node moved', other: 'nodes moved' })}`,
      node: (count: number): string =>
        `${count} ${plural(count, { one: 'node added or removed', other: 'nodes added or removed' })}`,
    } satisfies Record<WriteKind, (count: number) => string>,
    change: (writes: readonly string[], total: number): string =>
      `Last change: ${writes.join(', ')}. ${total} ${plural(total, {
        one: 'write',
        other: 'writes',
      })} since the first render.`,
  },
  source: { title: 'Source' },
};

/** The words around a demo: its write counter and its source listing. */
export type DemoText = typeof en;

export const demoText = localized(en, () => import('./demo.text.ru').then((module) => module.ru));
