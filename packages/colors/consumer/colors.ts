import { darken, getContrastRatio, hexToRgb, lighten } from '@reely/colors';

const hover = lighten('#2563eb', 10);
const active = darken('#2563eb', 10);
const contrast = getContrastRatio('#ffffff', '#2563eb');
const { r, g, b } = hexToRgb('#2563eb');

if (hover !== '#3b73ed' || active !== '#2159d4' || contrast.toFixed(2) !== '5.17' || `${r},${g},${b}` !== '37,99,235') {
  throw new Error(`unexpected colors: ${JSON.stringify({ hover, active, contrast })}`);
}
