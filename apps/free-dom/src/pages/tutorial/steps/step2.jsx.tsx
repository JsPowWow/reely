import type { JSX } from '@reely/dommy';

import arrowIcon from '../../../assets/arrow.svg';
import blogIcon from '../../../assets/blog.svg';
import docIcon from '../../../assets/doc.svg';
import youtubeIcon from '../../../assets/youtube.svg';
import css from './links.module.css';

// JSX compiles to the same calls: `<a href='…'>` becomes `jsx('a', { href: '…', children })`.
export const LearningLinks = (): JSX.Element => (
  <section className={css.card}>
    <h2>Learning materials</h2>
    <a className={css.link} href='https://nx.dev/getting-started/intro' target='_blank' rel='noreferrer'>
      <img src={docIcon} alt='' />
      <span className={css.text}>
        Documentation
        <span className={css.hint}>Everything is in there</span>
      </span>
      <img src={arrowIcon} alt='' />
    </a>
    <a className={css.link} href='https://nx.dev/blog' target='_blank' rel='noreferrer'>
      <img src={blogIcon} alt='' />
      <span className={css.text}>
        Blog
        <span className={css.hint}>Changelog, features and events</span>
      </span>
      <img src={arrowIcon} alt='' />
    </a>
    <a className={css.link} href='https://www.youtube.com/@NxDevtools/videos' target='_blank' rel='noreferrer'>
      <img src={youtubeIcon} alt='' />
      <span className={css.text}>
        YouTube channel
        <span className={css.hint}>Nx Show, talks and tutorials</span>
      </span>
      <img src={arrowIcon} alt='' />
    </a>
  </section>
);
