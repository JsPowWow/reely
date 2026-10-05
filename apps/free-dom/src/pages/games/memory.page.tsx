import { effect } from '@reely/dommy';

import { gamesText, memoryPackages } from './games.text';
import { MemoryGame } from './memory/memory.game';
import gameSource from './memory/memory.game.tsx?highlight';
import leaderboardSource from './memory/memory.leaderboard.ts?highlight';
import rulesSource from './memory/memory.rules.ts?highlight';
import modalSource from './memory/modal.tsx?highlight';
import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import band from '../../site/band.module.css';
import exampleCss from '../../site/example.module.css';
import { SiteHeader } from '../../site/site.header';
import { packageHref, sitePaths } from '../../site/site.paths';

import css from './games.module.css';

import type { MemoryModule } from './games.text';
import type { SourceLines } from '../../highlight/source.types';
import type { SitePackage } from '../../site/site.packages';

const modules = [
  { id: 'game', file: 'memory.game.tsx', source: gameSource },
  { id: 'rules', file: 'memory.rules.ts', source: rulesSource },
  { id: 'leaderboard', file: 'memory.leaderboard.ts', source: leaderboardSource },
  { id: 'modal', file: 'modal.tsx', source: modalSource },
] as const satisfies readonly { id: MemoryModule; file: string; source: SourceLines }[];

// dommy has pages of its own
const pageOf = (name: SitePackage): string => (name === 'dommy' ? sitePaths.dommy : packageHref(name));

/** The memory game, played on a live write board, then the modules that run it. */
export const MemoryPage = (): Node => {
  effect(() => {
    document.title = gamesText().documentTitle;
  });

  return (
    <>
      <SiteHeader current='games' />
      <main>
        <section className={`${band.start} ${band.startTop} ${css.start}`} aria={{ ariaLabelledby: 'memory-title' }}>
          <div className={band.startCopy}>
            <h1 id='memory-title' className={band.title}>
              {() => gamesText().title}
            </h1>
            <p className={band.pitch}>{() => gamesText().pitch}</p>
            <div className={css.credits}>
              <p className={css.creditsTitle}>{() => gamesText().madeWith}</p>
              <ul className={css.creditList}>
                {memoryPackages.map((name) => (
                  <li>
                    <a href={pageOf(name)}>@reely/{name}</a>
                    {() => `: ${gamesText().parts[name]}`}
                  </li>
                ))}
              </ul>
            </div>
            <p className={band.builtWith}>{() => gamesText().builtWith}</p>
          </div>
          <MutationMeter>
            <MemoryGame />
          </MutationMeter>
        </section>
        {modules.map(({ id, file, source }) => (
          <section id={id} className={exampleCss.example} aria={{ ariaLabelledby: `${id}-title` }}>
            <header className={exampleCss.exampleHeading}>
              <h2 id={`${id}-title`} className={exampleCss.exampleTitle}>
                {() => gamesText().modules[id].title}
              </h2>
              <p className={exampleCss.claim}>{() => gamesText().modules[id].claim}</p>
            </header>
            <SourceView source={source} caption={file} />
          </section>
        ))}
      </main>
    </>
  );
};
