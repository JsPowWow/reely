import { signal } from '@reely/dommy';

import css from '../demos.module.css';

// `list` has no settable property, so it is an attribute; `value` is live state, a property.
export const Flavours = (): Node => {
  const choice = signal('');

  return (
    <div className={css.row}>
      <label className={css.field}>
        Choose a flavour
        <input list='flavours' onInput={(event) => (choice.value = event.currentTarget.value)} />
      </label>
      <datalist id='flavours'>
        {['Chocolate', 'Coconut', 'Mint', 'Strawberry', 'Vanilla'].map((flavour) => (
          <option value={flavour} />
        ))}
      </datalist>
      <p className={css.status}>
        You chose: <output>{() => choice.value || 'nothing yet'}</output>
      </p>
    </div>
  );
};
