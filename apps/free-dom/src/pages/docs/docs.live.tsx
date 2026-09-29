import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import guide from '../../site/guide.module.css';
import css from './docs.module.css';

import type { SourceLines } from '../../highlight/source.types';

/** A live demo inside prose, with its DOM writes counted beside its source. */
export const Live = ({ Demo, caption, source }: { Demo: () => Node; caption: string; source: SourceLines }): Node => (
  <div className={`${guide.panels} ${css.live}`}>
    <MutationMeter>
      <Demo />
    </MutationMeter>
    <SourceView source={source} caption={caption} />
  </div>
);
