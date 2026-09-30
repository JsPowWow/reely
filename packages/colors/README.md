# @reely/colors

Convert, mix, lighten and darken colours, and check the contrast between two.

```sh
npm i @reely/colors
```

## Shades of a brand colour

```ts
import { darken, getContrastRatio, lighten } from '@reely/colors';

const brand = '#2563eb';

button.style.setProperty('--hover', lighten(brand, 10)); // '#3b73ed'
button.style.setProperty('--active', darken(brand, 10)); // '#2159d4'

getContrastRatio('#ffffff', brand); // 5.17: white text passes WCAG AA (4.5) on it
getContrastRatio('#ffffff', '#facc15'); // 1.53: on yellow it does not
```

## Conversions

```ts
import { hexToRgb, isValidHex, rgbToHex, rgbToHsl } from '@reely/colors';

hexToRgb('#2563eb'); // { r: 37, g: 99, b: 235 }; `#rgb` works too
rgbToHex(37, 99, 235); // '#2563eb'; or rgbToHex({ r, g, b })
rgbToHsl({ r: 37, g: 99, b: 235 }); // { h, s, l }
isValidHex(userInput); // before converting what a colour picker or a URL gave you
```

## Mixing, and colours from CSS

```ts
import { getContrastRatio, mix, parseColor, randomHex, withAlpha } from '@reely/colors';

// a palette read from CSS comes back as `rgb(r g b)`, not hex; every function takes either
const cold = getComputedStyle(board).getPropertyValue('--cold'); // 'rgb(37 99 235)'
const heat = mix(cold, '#d64545', 0.3); // 30% of the way from cold to hot, as '#rrggbb'
board.style.color = getContrastRatio('#000000', heat) > getContrastRatio('#ffffff', heat) ? 'black' : 'white';
canvas.getContext('2d')!.shadowColor = withAlpha(heat, 0.4); // 'rgb(r g b / 0.4)' for a canvas glow

mix('#2563eb', '#facc15'); // halfway by default
parseColor('rgba(37, 99, 235, 0.5)'); // { r: 37, g: 99, b: 235 }: alpha is dropped
randomHex(seeded); // any `() => number` in [0, 1): a seeded one gives the same colour every run
```

`rgbToHex` rounds each channel, so the fractions a mix produces are fine. An invalid hex or colour, an RGB channel outside 0–255, or a weight or alpha outside 0–1 throws an `Error`.
