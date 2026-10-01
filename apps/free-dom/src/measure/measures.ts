import { bundles as measuredBundles, packages as measuredPackages } from 'virtual:measures';

import type { DommyBundle } from './measure.cases';
import type { PackageFacts } from './measure.plugin';
import type { SitePackage } from '../site/site.packages';

/** What the build measured of each package the site shows. */
export const packages: Readonly<Record<SitePackage, PackageFacts>> = measuredPackages;

const bundles: Readonly<Record<DommyBundle, number>> = measuredBundles;

/** A size in kilobytes as the site prints it: `1.7 kB`. */
export const kB = (bytes: number): string => `${(bytes / 1000).toFixed(1)} kB`;

/**
 * What the site says dommy weighs: minified and gzipped, bundled with esbuild from the package
 * built in the repo, when the site is built. Speed is not quoted: the docs time it in the reader's browser.
 */
export const measured = {
  signalsOnly: kB(bundles.signalsOnly),
  jsxApp: kB(bundles.jsxApp),
  wholePackage: kB(packages.dommy.gzipBytes),
} as const;
