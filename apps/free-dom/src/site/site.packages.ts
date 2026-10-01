/** The published packages the site shows, in the order they stack: each uses only those before it. */
export const sitePackages = [
  'basics',
  'signals',
  'dommy',
  'dommy-kit',
  'emitter',
  'queue',
  'state-machine',
  'simple-store',
  'logger',
  'async',
  'colors',
  'strings',
] as const;

export type SitePackage = (typeof sitePackages)[number];
