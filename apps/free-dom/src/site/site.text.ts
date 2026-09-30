import { localized } from '../i18n/localized';

const en = {
  nav: { label: 'Site', docs: 'Docs', evolution: 'Evolution', labs: 'Labs' },
  language: { label: 'Language' },
  pager: { previous: 'Previous', next: 'Next' },
  notFound: {
    documentTitle: 'Not found | reely',
    title: (pathname: string): string => `There is no page at ${pathname}`,
    lead: 'The docs answer one question per page; reely evolution builds it all step by step.',
    openDocs: 'Open the docs',
  },
  failed: { text: 'This page failed to load.', openDocs: 'Open the docs' },
};

/** The words of the parts every page shares: the header, the pager, the page that is not there. */
export type SiteText = typeof en;

export const siteText = localized(en, () => import('./site.text.ru').then((module) => module.ru));
