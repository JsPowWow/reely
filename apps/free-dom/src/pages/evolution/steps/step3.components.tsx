import arrowIcon from '../../../assets/arrow.svg';
import codeIcon from '../../../assets/code.svg';
import docIcon from '../../../assets/doc.svg';
import flagIcon from '../../../assets/flag.svg';

import css from './links.module.css';

interface ReelyLink {
  title: string;
  hint: string;
  href: string;
  icon: string;
}

const links: readonly ReelyLink[] = [
  {
    title: 'reely on GitHub',
    hint: 'Source, tests and issues',
    href: 'https://github.com/JsPowWow/reely',
    icon: codeIcon,
  },
  {
    title: '@reely/dommy',
    hint: 'Tag factories, JSX and signals',
    href: 'https://github.com/JsPowWow/reely/tree/main/packages/dommy',
    icon: docIcon,
  },
  {
    title: 'ai-race',
    hint: 'The first app built on dommy',
    href: 'https://github.com/JsPowWow/ai-race',
    icon: flagIcon,
  },
];

// A component is a plain function of its props: it runs once and returns DOM nodes.
const LinkItem = ({ title, hint, href, icon }: ReelyLink): Node => (
  <a className={css.link} href={href}>
    <img src={icon} alt='' />
    <span className={css.text}>
      {title}
      <span className={css.hint}>{hint}</span>
    </span>
    <img src={arrowIcon} alt='' />
  </a>
);

export const ReelyLinks = (): Node => (
  <section className={css.card}>
    <h2>Where reely lives</h2>
    {links.map((link) => (
      <LinkItem {...link} />
    ))}
  </section>
);
