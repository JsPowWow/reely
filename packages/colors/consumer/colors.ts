import { darken, getContrastRatio, hexToRgb, lighten, mix, parseColor } from '@reely/colors';

const hover = lighten('#2563eb', 10);
const active = darken('#2563eb', 10);
const contrast = getContrastRatio('#ffffff', '#2563eb');
const { r, g, b } = hexToRgb('#2563eb');
const heat = mix('rgb(37 99 235)', '#d64545', 0.5);
const read = parseColor('rgba(37, 99, 235, 0.5)');

if (hover !== '#3b73ed' || active !== '#2159d4' || contrast.toFixed(2) !== '5.17' || `${r},${g},${b}` !== '37,99,235' || heat !== '#7e5498' || read.b !== 235) {
  throw new Error(`unexpected colors: ${JSON.stringify({ hover, active, contrast, heat, read })}`);
}
