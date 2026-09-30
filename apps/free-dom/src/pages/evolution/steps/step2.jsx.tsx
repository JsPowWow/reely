import arrowIcon from '../../../assets/arrow.svg';
import codeIcon from '../../../assets/code.svg';
import docIcon from '../../../assets/doc.svg';
import flagIcon from '../../../assets/flag.svg';

import css from './links.module.css';

// JSX compiles to the same calls: `<a href='…'>` becomes `jsx('a', { href: '…', children })`.
export const ReelyLinks = (): Node => (
  <section className={css.card}>
    <h2>Where reely lives</h2>
    <a className={css.link} href='https://github.com/JsPowWow/reely'>
      <img src={codeIcon} alt='' />
      <span className={css.text}>
        reely on GitHub
        <span className={css.hint}>Source, tests and issues</span>
      </span>
      <img src={arrowIcon} alt='' />
    </a>
    <a className={css.link} href='https://github.com/JsPowWow/reely/tree/main/packages/dommy'>
      <img src={docIcon} alt='' />
      <span className={css.text}>
        @reely/dommy
        <span className={css.hint}>Tag factories, JSX and signals</span>
      </span>
      <img src={arrowIcon} alt='' />
    </a>
    <a className={css.link} href='https://github.com/JsPowWow/ai-race'>
      <img src={flagIcon} alt='' />
      <span className={css.text}>
        ai-race
        <span className={css.hint}>The first app built on dommy</span>
      </span>
      <img src={arrowIcon} alt='' />
    </a>
  </section>
);
