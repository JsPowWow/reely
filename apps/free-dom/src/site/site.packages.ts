/** The published packages the site shows, in the order they stack: each uses only those before it. */
export const sitePackages = [
  'basics',
  'signals',
  'router',
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

/** The packages with a page of the one kind; dommy has pages of its own. */
export type PagedPackage = Exclude<SitePackage, 'dommy'>;

const hasPackagePage = (name: SitePackage): name is PagedPackage => name !== 'dommy';

export const pagedPackages: readonly PagedPackage[] = sitePackages.filter(hasPackagePage);

/** The package whose page is at `/<name>`, if there is one. */
export const pagedPackageOf = (name: string): PagedPackage | undefined =>
  pagedPackages.find((paged) => paged === name);
