import { Keyed, effect } from '@reely/dommy';

import { SiteHeader } from '../../site/site.header';
import guide from '../../site/guide.module.css';
import docs from '../docs/docs.module.css';
import css from './labs.module.css';
import { labExamples } from './labs.examples';
import { labsText } from './labs.text';

import type { LabId } from './labs.text';

const labs: readonly LabId[] = ['dml', 'signals-graph'];

export const LabsPage = (): Node => {
  const examples = labExamples();
  effect(() => {
    document.title = labsText().documentTitle;
  });

  return (
    <>
      <SiteHeader current='labs' />
      <main className={css.labs}>
        <header>
          <h1 className={guide.title}>{() => labsText().title}</h1>
          <p className={guide.lead}>{() => labsText().lead}</p>
        </header>
        {labs.map((lab) => (
          <section className={css.lab} aria={{ ariaLabelledby: lab }}>
            <h2 id={lab} className={css.labTitle}>
              {() => labsText().labs[lab].title}
            </h2>
            <div className={docs.details}>
              <Keyed value={() => labsText().labs[lab].Body}>{(Body) => <Body {...examples} />}</Keyed>
            </div>
          </section>
        ))}
      </main>
    </>
  );
};
