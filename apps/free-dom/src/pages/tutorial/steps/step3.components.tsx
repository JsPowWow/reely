import type { JSX } from '@reely/dommy';

import arrowIcon from '../../../assets/arrow.svg';
import blogIcon from '../../../assets/blog.svg';
import docIcon from '../../../assets/doc.svg';
import youtubeIcon from '../../../assets/youtube.svg';
import css from './links.module.css';

interface LearningLink {
  title: string;
  hint: string;
  href: string;
  icon: string;
}

const links: readonly LearningLink[] = [
  {
    title: 'Documentation',
    hint: 'Everything is in there',
    href: 'https://nx.dev/getting-started/intro',
    icon: docIcon,
  },
  { title: 'Blog', hint: 'Changelog, features and events', href: 'https://nx.dev/blog', icon: blogIcon },
  {
    title: 'YouTube channel',
    hint: 'Nx Show, talks and tutorials',
    href: 'https://www.youtube.com/@NxDevtools/videos',
    icon: youtubeIcon,
  },
];

// A component is a plain function of its props: it runs once and returns DOM nodes.
const LinkItem = ({ title, hint, href, icon }: LearningLink): JSX.Element => (
  <a className={css.link} href={href} target='_blank' rel='noreferrer'>
    <img src={icon} alt='' />
    <span className={css.text}>
      {title}
      <span className={css.hint}>{hint}</span>
    </span>
    <img src={arrowIcon} alt='' />
  </a>
);

export const LearningLinks = (): JSX.Element => (
  <section className={css.card}>
    <h2>Learning materials</h2>
    {links.map((link) => (
      <LinkItem {...link} />
    ))}
  </section>
);
