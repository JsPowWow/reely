import { Keyed, signal } from '@reely/dommy';
import { later } from '@reely/dommy/kit';

import css from '../demos.module.css';

// A component runs before its nodes are in the document; `later(0)` runs once they are.
export const SlideCaption = (): Node => {
  const current = signal(1);
  const message = signal('');

  const Caption = ({ slide }: { slide: number }): Node => {
    const caption = <output className={css.value}>Slide {slide}</output>;
    later(0, () => (message.value = `Read from the page: ${caption.isConnected ? caption.textContent : 'not in the document'}`));
    return caption;
  };

  return (
    <div className={css.row}>
      <button onClick={() => (current.value += 1)}>Next slide</button>
      <Keyed value={current}>{(shown) => <Caption slide={shown} />}</Keyed>
      <p className={css.status} data-message>
        {message}
      </p>
    </div>
  );
};
