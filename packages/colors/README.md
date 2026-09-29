# @reely/colors

Convert, lighten and darken hex colours, and check the contrast between two.

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

An invalid hex or an RGB channel outside 0–255 throws an `Error`.
