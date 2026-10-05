import { computed } from '@reely/dommy';
import { mapNullable } from '@reely/utils';

import { packageGlyph } from './package.glyphs';
import { sitePackages } from '../../../site/site.packages';

import css from './memory.module.css';

import type { CardSide } from './memory.rules';

const sideLabels: Record<CardSide, (place: number, face: string) => string> = {
  down: (place) => `Card ${place + 1}, face down`,
  up: (place, face) => `Card ${place + 1}, ${face}`,
  found: (place, face) => `Card ${place + 1}, ${face}, found`,
};

interface MemoryCardProps {
  place: number;
  face: string;
  side: () => CardSide;
  onTurn: (place: number) => void;
}

// #region card
/**
 * A card: a button that turns over in place; only its side and its name for a
 * screen reader are bound.
 */
export const MemoryCard = ({
  place,
  face,
  side,
  onTurn,
}: MemoryCardProps): Node => {
  const lies = computed(side);
  const name = sitePackages.find((known) => known === face);
  return (
    <li>
      <button
        type='button'
        className={css.card}
        data-side={lies}
        aria={{
          ariaLabel: () => sideLabels[lies.value](place, face),
          ariaDisabled: () => String(lies.value !== 'down'),
        }}
        onClick={() => onTurn(place)}
      >
        <span className={css.turn}>
          <span className={css.back} aria={{ ariaHidden: 'true' }}>
            r
          </span>
          <span className={css.face} aria={{ ariaHidden: 'true' }}>
            {mapNullable(packageGlyph, name)}
            <span className={css.scope}>@reely/</span>
            <span className={css.name}>{face}</span>
          </span>
        </span>
      </button>
    </li>
  );
};
// #endregion
