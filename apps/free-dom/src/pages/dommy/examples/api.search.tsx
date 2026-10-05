import { Await, Show, signal } from '@reely/dommy';

import css from '../../../demo/examples.module.css';

const api = [
  'signal',
  'computed',
  'effect',
  'batch',
  'untracked',
  'For',
  'Show',
  'Keyed',
  'Await',
  'mount',
  'onCleanup',
];

interface Answer {
  query: string;
  found: string[];
}

/** A slow server: the shorter the query, the later the answer. */
export const answerDelay = (query: string): number =>
  Math.max(150, 1000 - query.length * 300);

// `Await` shows only the answer to the latest query; a late
// answer to an earlier one is dropped, never shown.
export const ApiSearch = (): Node => {
  const query = signal('');
  const late = signal(0);
  const search = (text: string): Promise<Answer> =>
    new Promise((resolve) => {
      setTimeout(() => {
        if (text !== query.peek()) {
          late.value += 1;
        }
        const found = api.filter((name) =>
          name.toLowerCase().includes(text.toLowerCase())
        );
        resolve({ query: text, found });
      }, answerDelay(text));
    });

  return (
    <div className={css.stack}>
      <label className={css.field}>
        Search the API
        <input
          type='search'
          placeholder='Type eff quickly'
          onInput={(event) => (query.value = event.currentTarget.value)}
        />
      </label>
      <Show
        when={query}
        fallback={() => (
          <p className={css.note}>Type to search {api.length} names</p>
        )}
      >
        {() => (
          <Await
            promise={() => search(query.value)}
            fallback={() => <p className={css.note}>Searching…</p>}
            catch={(error) => <p className={css.note}>{error.message}</p>}
          >
            {(answer) => (
              <div className={css.stack}>
                <p className={css.note}>Answer to “{answer.query}”:</p>
                <ul className={css.results}>
                  {answer.found.map((name) => (
                    <li>
                      <code>{name}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Await>
        )}
      </Show>
      <p className={css.note}>Late answers dropped: {late}</p>
    </div>
  );
};
