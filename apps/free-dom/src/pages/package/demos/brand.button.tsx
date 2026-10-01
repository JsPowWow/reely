import { darken, getContrastRatio, lighten } from '@reely/colors';
import { signal } from '@reely/dommy';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

// One brand colour gives the whole button: lighter on hover,
// darker when pressed, and black or white text, whichever
// contrasts more. WCAG AA asks for 4.5:1.
export const BrandButton = (): Node => {
  const brand = signal('#2563eb');
  const onBlack = (): number => getContrastRatio('#000000', brand.value);
  const onWhite = (): number => getContrastRatio('#ffffff', brand.value);
  const text = (): 'black' | 'white' =>
    onBlack() > onWhite() ? 'black' : 'white';
  const label = (): string => (text() === 'black' ? 'Black' : 'White');
  const ratio = (): number => Math.max(onBlack(), onWhite());

  return (
    <div className={css.stack}>
      <label className={css.field}>
        Brand colour
        <input
          type='color'
          className={own.swatch}
          value={brand}
          onInput={(event) => (brand.value = event.currentTarget.value)}
        />
      </label>
      <button
        type='button'
        className={own.brand}
        data-text={text}
        styles={{
          '--brand': brand,
          '--hover': () => lighten(brand.value, 10),
          '--active': () => darken(brand.value, 10),
          color: text,
        }}
      >
        Start free trial
      </button>
      <p className={css.note}>
        {() => `${label()} text, ${ratio().toFixed(2)}:1, `}
        {() => (ratio() >= 4.5 ? 'passes WCAG AA' : 'fails WCAG AA')}
      </p>
    </div>
  );
};
