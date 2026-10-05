import { localized } from '../i18n/localized';

const en = {
  nav: { label: 'Site', packages: 'Packages', games: 'Games', labs: 'Labs' },
  dommyNav: { overview: 'Overview', docs: 'Docs', evolution: 'Evolution' },
  language: { label: 'Language' },
  pager: { previous: 'Previous', next: 'Next' },
  openDocs: 'Open the docs',
  seePackages: 'See the packages',
  notFound: {
    documentTitle: 'Not found | reely',
    title: (pathname: string): string => `There is no page at ${pathname}`,
    lead: 'reely is a set of small packages, each with its own page; the list is on the home page.',
  },
  failed: 'This page failed to load.',
};

/** The words of the parts pages share: the header, dommy's strip, the pager, the page that is not there. */
export type SiteText = typeof en;

export const siteText = localized(en, () => import('./site.text.ru').then((module) => module.ru));
