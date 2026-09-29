/**
 * What the site says reely weighs and how fast it runs, written here only. Sizes: minified and
 * gzipped, bundled with esbuild from the packed package; speed: a lap of the 500-row board in
 * headless Chrome, from the write to the finished layout.
 */
export const measured = {
  signalsOnly: '1.3 kB',
  jsxApp: '4.7 kB',
  wholePackage: '6.6 kB',
  lapMedian: '7.7 ms',
  lapP95: '8.7 ms',
} as const;
