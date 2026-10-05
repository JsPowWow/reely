import { Await, effect, signal } from '@reely/dommy';

import { gamesText, memoryPackages } from './games.text';
import { MemoryGame } from './memory/memory.game';
import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import band from '../../site/band.module.css';
import exampleCss from '../../site/example.module.css';
import { describePage } from '../../site/page.description';
import { SiteHeader } from '../../site/site.header';
import { packageHref } from '../../site/site.paths';

import css from './games.module.css';

import type { MemoryFacts, MemoryModule } from './memory/memory.sources';

const modules: readonly MemoryModule[] = ['machine', 'game', 'leaderboard', 'rules', 'moments', 'modal'];

/** The memory game, played on a live write board, then the modules that run it. */
export const MemoryPage = (): Node => {
  // the game plays at once; its highlighted sources, most of the page's weight, follow in a chunk of their own
  const sources = import('./memory/memory.sources');
  const facts = signal<MemoryFacts | undefined>(undefined);
  void sources.then(({ memoryFacts }) => facts.set(memoryFacts));

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
            <dl className={band.facts}>
              <div>
                <dt>
                  <code className={css.keyword}>if</code>
                  {() => gamesText().facts.ifs}
                </dt>
                <dd>{() => facts.value?.ifs ?? '–'}</dd>
              </div>
              <div>
                <dt>{() => gamesText().facts.lines}</dt>
                <dd>{() => facts.value?.lines ?? '–'}</dd>
              </div>
              <div>
                <dt>{() => gamesText().facts.modules}</dt>
                <dd>{() => facts.value?.modules ?? '–'}</dd>
              </div>
            </dl>
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
        {modules.map((id) => (
          <section id={id} className={exampleCss.example} aria={{ ariaLabelledby: `${id}-title` }}>
            <header className={exampleCss.exampleHeading}>
              <h2 id={`${id}-title`} className={exampleCss.exampleTitle}>
                {() => gamesText().modules[id].title}
              </h2>
              <p className={exampleCss.claim}>{() => gamesText().modules[id].claim}</p>
            </header>
            <Await
              promise={sources}
              fallback={() => <p className={exampleCss.claim}>{() => gamesText().loadingSource}</p>}
              catch={() => <p className={exampleCss.claim}>{() => gamesText().sourceFailed}</p>}
            >
              {({ memoryListings }) => (
                <SourceView source={memoryListings[id].source} caption={memoryListings[id].file} />
              )}
            </Await>
          </section>
        ))}
      </main>
    </>
  );
};
