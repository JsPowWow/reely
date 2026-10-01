import { sitePaths } from './site.paths';
import { siteText } from './site.text';

/** What is shown when a page fails to load: a bug, since every URL has a route. */
export const FailedPage = (): Node => (
  <p>
    {() => siteText().failed} <a href={sitePaths.packages}>{() => siteText().seePackages}</a>.
  </p>
);
