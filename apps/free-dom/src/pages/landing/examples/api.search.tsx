import { Await, signal } from '@reely/dommy';

import css from './examples.module.css';

const api = ['signal', 'computed', 'effect', 'batch', 'untracked', 'For', 'Show', 'Keyed', 'Await', 'mount', 'onCleanup'];

/** A slow server: the shorter the query, the later its answer, so answers arrive out of order. */
export const answerDelay = (query: string): number => Math.max(150, 1000 - query.length * 300);

// `Await` renders only the answer for the latest query; the late answers for earlier ones are dropped.
export const ApiSearch = (): Node => {
  const query = signal('');
  const answers = signal(0);
  const search = (text: string): Promise<string[]> =>
    new Promise((resolve) => {
      setTimeout(() => {
        answers.value += 1;
        resolve(api.filter((name) => name.toLowerCase().includes(text.toLowerCase())));
      }, answerDelay(text));
    });

  return (
    <div className={css.stack}>
      <label className={css.field}>
        Search the API
        <input type='search' placeholder='Type e, ef, eff quickly' onInput={(event) => (query.value = event.currentTarget.value)} />
      </label>
      <Await
        promise={() => search(query.value)}
        fallback={() => <p className={css.note}>Searching…</p>}
        catch={(error) => <p className={css.note}>{error.message}</p>}
      >
        {(found) =>
          found.length === 0 ? (
            <p className={css.note}>Nothing matches</p>
          ) : (
            <ul className={css.results}>
              {found.map((name) => (
                <li>
                  <code>{name}</code>
                </li>
              ))}
            </ul>
          )
        }
      </Await>
      <p className={css.note}>Answers received: {answers}. Shown: the one for the latest query.</p>
    </div>
  );
};
