import { Keyed, signal } from '@reely/dommy';
import { later } from '@reely/dommy/kit';

import css from '../demos.module.css';

// A component runs before its nodes are in the document; `later(0)` runs once they are.
export const LabelAfterMount = (): Node => {
  const counter = signal(0);
  const message = signal('');

  const Label = ({ text }: { text: number }): Node => {
    const label = <output className={css.value}>{text}</output>;
    later(0, () => (message.value = `Current label: ${label.isConnected ? label.textContent : 'not in the document'}`));
    return label;
  };

  return (
    <div className={css.row}>
      <button onClick={() => (counter.value += 1)}>Increment</button>
      <Keyed value={counter}>{(text) => <Label text={text} />}</Keyed>
      <p className={css.status} data-message>
        {message}
      </p>
    </div>
  );
};
