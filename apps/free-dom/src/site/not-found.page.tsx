import { effect } from '@reely/dommy';

import { SiteHeader } from './site.header';
import { siteText } from './site.text';

import guide from './guide.module.css';

/** A URL the site has no page for: says which, and offers the ways in. */
export const NotFoundPage = ({ pathname }: { pathname: string }): Node => {
  effect(() => {
    document.title = siteText().notFound.documentTitle;
  });
  return (
    <>
      <SiteHeader />
      <main className={guide.main}>
        <header className={guide.missing}>
          <h1 className={guide.title}>{() => siteText().notFound.title(pathname)}</h1>
          <p className={guide.lead}>{() => siteText().notFound.lead}</p>
          <a className={guide.start} href='/docs'>
            {() => siteText().openDocs}
          </a>
        </header>
      </main>
    </>
  );
};
