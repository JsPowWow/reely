import { effect } from '@reely/dommy';

import { gamesText, memoryPackages } from './games.text';
import { MemoryGame } from './memory/memory.game';
import { MemoryStory } from './memory.story';
import { MutationMeter } from '../../demo/mutation.meter';
import band from '../../site/band.module.css';
import { describePage } from '../../site/page.description';
import { SiteHeader } from '../../site/site.header';
import { packageHref } from '../../site/site.paths';

import css from './games.module.css';

/** The memory game, played on a live write board, then the story of how it is built. */
export const MemoryPage = (): Node => {
  // the game plays at once; its highlighted sources, most of the page's weight, follow in a chunk of their own
  const sources = import('./memory/memory.sources');

  effect(() => {
    document.title = gamesText().documentTitle;
  });
  describePage(() => gamesText().description);

  return (
    <>
      <SiteHeader current='games' />
      <main>
        <section className={`${band.start} ${band.startTop} ${css.start}`} aria={{ ariaLabelledby: 'memory-title' }}>
          <div className={`${band.startCopy} ${css.intro}`}>
            <h1 id='memory-title' className={band.title}>
              {() => gamesText().title}
            </h1>
            <p className={band.pitch}>{() => gamesText().pitch}</p>
          </div>
          <div className={css.play}>
            <MutationMeter>
              <MemoryGame />
            </MutationMeter>
          </div>
          <div className={`${band.startCopy} ${css.about}`}>
            <div className={css.credits}>
              <p className={css.creditsTitle}>{() => gamesText().madeWith}</p>
              <ul className={css.creditList}>
                {memoryPackages.map((name) => (
                  <li>
                    <a href={packageHref(name)}>@reely/{name}</a>
                    {() => `: ${gamesText().parts[name]}`}
                  </li>
                ))}
              </ul>
            </div>
            <p className={band.builtWith}>{() => gamesText().builtWith}</p>
          </div>
        </section>
        <MemoryStory sources={sources} />
      </main>
    </>
  );
};
