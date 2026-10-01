import { sitePaths } from './site.paths';
import { siteText } from './site.text';
import { chooseLocale, locale } from '../i18n/locale';

import css from './site.module.css';

import type { SiteText } from './site.text';
import type { Locale } from '../i18n/locale';

/** The parts of the site; the header marks the one the page belongs to. */
export type SiteSection = 'home' | 'packages' | 'labs';

const sections = [
  { section: 'packages', href: sitePaths.packages },
  { section: 'labs', href: sitePaths.labs },
] as const satisfies readonly { section: keyof SiteText['nav'] & SiteSection; href: string }[];

/** Each language named in itself, so a reader finds theirs whichever is shown. */
const languages = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
] as const satisfies readonly { code: Locale; name: string }[];

/** The bar on top of every page: the part of the site the page belongs to, and the language it is shown in. */
export const SiteHeader = ({ current }: { current?: SiteSection }): Node => (
  <header className={css.header}>
    <a className={css.wordmark} href={sitePaths.home} aria={current === 'home' ? { ariaCurrent: 'page' } : {}}>
      reely
    </a>
    <nav className={css.nav} aria={{ ariaLabel: () => siteText().nav.label }}>
      {sections.map(({ section, href }) => (
        <a className={css.link} href={href} aria={section === current ? { ariaCurrent: 'true' } : {}}>
          {() => siteText().nav[section]}
        </a>
      ))}
      <a className={css.link} href='https://github.com/JsPowWow/reely'>
        GitHub
      </a>
    </nav>
    <div className={css.languages} role='group' aria={{ ariaLabel: () => siteText().language.label }}>
      {languages.map(({ code, name }) => (
        <button
          type='button'
          className={css.language}
          lang={code}
          aria={{ ariaLabel: `${code.toUpperCase()}, ${name}`, ariaPressed: () => String(locale.value === code) }}
          onClick={() => chooseLocale(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  </header>
);
