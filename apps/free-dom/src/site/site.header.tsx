import css from './site.module.css';

/** The parts of the site; the header marks the one the page belongs to. */
export type SiteSection = 'home' | 'docs' | 'evolution';

const sections = [
  { section: 'docs', href: '/docs', label: 'Docs' },
  { section: 'evolution', href: '/evolution', label: 'Evolution' },
] as const satisfies readonly { section: SiteSection; href: string; label: string }[];

/**
 * The bar on top of every page: the reely wordmark home, the two guides, and the source. The part
 * of the site the page belongs to is marked; a page outside them marks nothing.
 */
export const SiteHeader = ({ current }: { current?: SiteSection }): Node => (
  <header className={css.header}>
    <a className={css.wordmark} href='/' aria={current === 'home' ? { ariaCurrent: 'page' } : {}}>
      reely
    </a>
    <nav className={css.nav} aria={{ ariaLabel: 'Site' }}>
      {sections.map(({ section, href, label }) => (
        <a className={css.link} href={href} aria={section === current ? { ariaCurrent: 'true' } : {}}>
          {label}
        </a>
      ))}
      <a className={css.link} href='https://github.com/JsPowWow/reely'>
        GitHub
      </a>
    </nav>
  </header>
);
