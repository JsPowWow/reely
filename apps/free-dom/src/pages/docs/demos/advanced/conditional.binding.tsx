import { signal } from '@reely/dommy';

import css from '../demos.module.css';

type Formula = 'a + b' | 'c + d';

const isFormula = (value: string): value is Formula => value === 'a + b' || value === 'c + d';

// The sum depends on what its last run read: a and b, or c and d, never all four.
export const ConditionalBinding = (): Node => {
  const formula = signal<Formula>('a + b');
  const values = { a: signal(1), b: signal(2), c: signal(3), d: signal(4) };
  const runs = document.createTextNode('0');

  const sum = (): number => {
    runs.data = String(Number(runs.data) + 1);
    const { a, b, c, d } = values;
    return formula.value === 'a + b' ? a.value + b.value : c.value + d.value;
  };

  return (
    <div className={css.row}>
      <label className={css.field}>
        Formula
        <select
          onInput={(event) => {
            const { value } = event.currentTarget;
            if (isFormula(value)) {
              formula.value = value;
            }
          }}
        >
          <option>a + b</option>
          <option>c + d</option>
        </select>
      </label>
      {Object.entries(values).map(([name, value]) => (
        <label className={css.field}>
          {name}
          <input
            type='number'
            min='0'
            max='9'
            value={() => String(value.value)}
            onInput={(event) => (value.value = Number(event.currentTarget.value))}
          />
        </label>
      ))}
      <output className={css.value}>{sum}</output>
      <p className={css.status}>
        The sum ran <span data-runs>{runs}</span> time(s)
      </p>
    </div>
  );
};
