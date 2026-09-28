import { a, h2, img, section, span } from '@reely/dommy';

import arrowIcon from '../../../assets/arrow.svg';
import blogIcon from '../../../assets/blog.svg';
import docIcon from '../../../assets/doc.svg';
import youtubeIcon from '../../../assets/youtube.svg';

import css from './links.module.css';

// Every tag is a function: `a(props, ...children)` returns a real `HTMLAnchorElement`.
export const LearningLinks = (): HTMLElement =>
  section(
    { className: css.card },
    h2('Learning materials'),
    a(
      { className: css.link, href: 'https://nx.dev/getting-started/intro', target: '_blank', rel: 'noreferrer' },
      img({ src: docIcon, alt: '' }),
      span({ className: css.text }, 'Documentation', span({ className: css.hint }, 'Everything is in there')),
      img({ src: arrowIcon, alt: '' })
    ),
    a(
      { className: css.link, href: 'https://nx.dev/blog', target: '_blank', rel: 'noreferrer' },
      img({ src: blogIcon, alt: '' }),
      span({ className: css.text }, 'Blog', span({ className: css.hint }, 'Changelog, features and events')),
      img({ src: arrowIcon, alt: '' })
    ),
    a(
      { className: css.link, href: 'https://www.youtube.com/@NxDevtools/videos', target: '_blank', rel: 'noreferrer' },
      img({ src: youtubeIcon, alt: '' }),
      span({ className: css.text }, 'YouTube channel', span({ className: css.hint }, 'Nx Show, talks and tutorials')),
      img({ src: arrowIcon, alt: '' })
    )
  );
