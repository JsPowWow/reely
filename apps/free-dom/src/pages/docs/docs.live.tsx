import type { ReelyNode } from '@reely/dommy';

import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import guide from '../../site/guide.module.css';
import { docHref } from '../../site/site.paths';

import css from './docs.module.css';

import type { DocSlug } from './docs.topics';
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

/** A listing inside prose: a module, a command or a config file. */
export const Code = ({ caption, source }: { caption: string; source: SourceLines }): Node => (
  <SourceView caption={caption} source={source} />
);

/** Text that is not TypeScript (a command, a config file), shown in the same panel. */
export const plain = (text: string): SourceLines => text.split('\n').map((line) => [{ content: line }]);

/** A link from prose to another topic of the docs; its slug is checked against the topics. */
export const DocLink = ({ slug, children }: { slug: DocSlug; children?: ReelyNode }): Node => (
  <a href={docHref(slug)}>{children}</a>
);
