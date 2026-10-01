import { SiteHeader } from '../../site/site.header';
import { sitePaths } from '../../site/site.paths';
import { siteText } from '../../site/site.text';

import css from './dommy.header.module.css';

/** The pages of `@reely/dommy`, which has more than one. */
export type DommyPart = 'overview' | 'docs' | 'evolution';

const parts = [
  { part: 'overview', href: sitePaths.dommy },
  { part: 'docs', href: sitePaths.docs },
  { part: 'evolution', href: sitePaths.evolution },
] as const satisfies readonly { part: DommyPart; href: string }[];

/** The site header on dommy's pages, with a strip under it that names them and marks the one shown. */
export const DommyHeader = ({ current }: { current: DommyPart }): Node => (
  <>
    <SiteHeader current='packages' />
    <nav className={css.strip} aria={{ ariaLabel: '@reely/dommy' }}>
      <span className={css.name}>@reely/dommy</span>
      {parts.map(({ part, href }) => (
        <a className={css.link} href={href} aria={part === current ? { ariaCurrent: 'true' } : {}}>
          {() => siteText().dommyNav[part]}
        </a>
      ))}
    </nav>
  </>
);
