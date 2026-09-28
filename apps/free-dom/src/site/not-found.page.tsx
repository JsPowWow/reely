import { SiteHeader } from './site.header';
import guide from './guide.module.css';

/** A URL the site has no page for: says which, and offers the ways in. */
export const NotFoundPage = ({ pathname }: { pathname: string }): Node => {
  document.title = 'Not found | reely';
  return (
    <>
      <SiteHeader />
      <main className={guide.main}>
        <header className={guide.missing}>
          <h1 className={guide.title}>There is no page at {pathname}</h1>
          <p className={guide.lead}>The docs answer one question per page; reely evolution builds it all step by step.</p>
          <a className={guide.start} href='/docs'>
            Open the docs
          </a>
        </header>
      </main>
    </>
  );
};
