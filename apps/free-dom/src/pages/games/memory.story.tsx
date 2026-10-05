import { Await } from '@reely/dommy';

import { gamesText, memoryChapters } from './games.text';
import { MachineDiagram } from './memory/memory.diagram';
import { SourceView } from '../../demo/source.view';
import { Localized } from '../../i18n/localized.view';

import css from './games.module.css';

import type { Snippet } from './games.text';
import type * as Sources from './memory/memory.sources';

/**
 * How the game is built, told in chapters under it, as an article would: prose
 * on what is done and why, and the code it quotes, cut from the modules that
 * run the game by their region markers.
 */
export const MemoryStory = ({ sources }: { sources: Promise<typeof Sources> }): Node => {
  const Snippet: Snippet = ({ file, region }) => (
    <Await
      promise={sources}
      fallback={() => <p className={css.pending}>{() => gamesText().loadingSource}</p>}
      catch={() => <p className={css.pending}>{() => gamesText().sourceFailed}</p>}
    >
      {({ snippet }) => (
        <div className={css.snippet}>
          <SourceView source={snippet(file, region)} caption={file} />
        </div>
      )}
    </Await>
  );

  return (
    <article className={css.story} aria={{ ariaLabelledby: 'story-title' }}>
      <header className={css.storyHeader}>
        <h2 id='story-title' className={css.storyTitle}>
          {() => gamesText().story.title}
        </h2>
        <p className={css.lede}>
          <Localized view={() => gamesText().story.Lede} />
        </p>
      </header>
      {memoryChapters.map((id) => (
        <section id={id} className={css.chapter} aria={{ ariaLabelledby: `${id}-title` }}>
          <h3 id={`${id}-title`} className={css.chapterTitle}>
            {() => gamesText().story.chapters[id].title}
          </h3>
          <Localized view={() => gamesText().story.chapters[id].Body} props={{ Snippet, Diagram: MachineDiagram }} />
        </section>
      ))}
      <footer className={css.ending}>
        <Localized view={() => gamesText().story.Ending} />
      </footer>
    </article>
  );
};
