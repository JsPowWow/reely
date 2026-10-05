import { defineRoutes } from '@reely/dommy/router';

import { docsChunk, dommyChunk, evolutionChunk, labsChunk, memoryChunk, packageChunk } from './page.chunks';
import { HomePage } from '../pages/home/home.page';
import { NotFoundPage } from '../site/not-found.page';
import { pagedPackageOf } from '../site/site.packages';
import { sitePaths } from '../site/site.paths';

// the home page comes with the site; every other page is its own chunk, loaded when first opened
export const siteRoutes = defineRoutes({
  [sitePaths.home]: () => HomePage,
  [sitePaths.dommy]: () => dommyChunk(({ DommyPage }) => <DommyPage />),
  [sitePaths.docs]: () => docsChunk(({ DocsPage }) => <DocsPage />),
  [sitePaths.docsTopic]: ({ topic }) => docsChunk(({ DocsPage }) => <DocsPage slug={topic} />),
  [sitePaths.evolution]: () => evolutionChunk(({ EvolutionPage }) => <EvolutionPage />),
  [sitePaths.evolutionStep]: ({ step }) => evolutionChunk(({ EvolutionPage }) => <EvolutionPage slug={step} />),
  [sitePaths.labs]: () => labsChunk(({ LabsPage }) => <LabsPage />),
  [sitePaths.memory]: () => memoryChunk(({ MemoryPage }) => <MemoryPage />),
  // a name that is no package's falls through to the page for unknown paths
  [sitePaths.package]: ({ name }) => {
    const paged = pagedPackageOf(name);
    return paged && packageChunk(({ PackagePage }) => <PackagePage name={paged} />);
  },
  [sitePaths.unknown]:
    ({ rest }) =>
    (): Node =>
      <NotFoundPage pathname={`/${rest}`} />,
});
