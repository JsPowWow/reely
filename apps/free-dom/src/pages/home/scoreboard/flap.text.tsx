import { effect, span } from '@reely/dommy';
import { later, media } from '@reely/dommy-kit';

import css from './flap.text.module.css';

const drum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-:.';
const turnsPerChange = 2;
const turnMs = 55;
// each tile of a word starts a little after the one before it
const waveMs = 18;

const fit = (text: string, width: number, align: 'start' | 'end'): string => {
  const cut = [...text].slice(0, width).join('');
  return align === 'end' ? cut.padStart(width) : cut.padEnd(width);
};

// a drum letter, not a random one: the same change turns the same way every time
const drumLetter = (target: string, turn: number): string =>
  drum[(Math.max(0, drum.indexOf(target.toUpperCase())) + (turn + 1) * 7) % drum.length] ?? target;

/**
 * Text on split-flap tiles: a changed letter turns through two drum letters and settles; under
 * reduced motion it changes in place. The tiles are for the eye; a screen reader gets the text whole.
 */
export const FlapText = ({
  text,
  width,
  align = 'start',
}: {
  text: () => string;
  width: number;
  align?: 'start' | 'end';
}): Node => {
  const calm = media('(prefers-reduced-motion: reduce)');
  const letters = Array.from({ length: width }, () => document.createTextNode(' '));
  const tiles = letters.map((letter) => span({ className: css.tile }, letter));

  const show = (index: number, char: string, turning: boolean): void => {
    const letter = letters[index];
    const tile = tiles[index];
    if (letter && letter.data !== char) {
      letter.data = char;
    }
    if (turning && tile) {
      // two classes in turn restart the same animation
      const odd = tile.classList.toggle(css.turnA);
      tile.classList.toggle(css.turnB, !odd);
    }
  };

  // the first text is shown as it is: tiles turn on a change, not on arrival
  let shown: string | null = null;
  // the turns belong to this run of the effect: new text, or disposal, cancels the ones not yet shown
  effect(() => {
    const next = fit(text(), width, align);
    const before = shown;
    shown = next;
    [...next].forEach((char, index) => {
      if (before === null || before[index] === char || calm.value) {
        show(index, char, false);
        return;
      }
      for (let turn = 0; turn < turnsPerChange; turn++) {
        later(index * waveMs + turn * turnMs, () => show(index, char === ' ' ? ' ' : drumLetter(char, turn), true));
      }
      later(index * waveMs + turnsPerChange * turnMs, () => show(index, char, true));
    });
  });

  return (
    <span className={css.flap}>
      <span className={css.tiles} aria={{ ariaHidden: 'true' }}>
        {tiles}
      </span>
      <span className='visually-hidden'>{() => text().trim()}</span>
    </span>
  );
};
