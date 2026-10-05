import { Show, computed, onCleanup, signal } from '@reely/dommy';

import css from '../demos.module.css';

// Each view makes its own signal and computed; the view that goes releases them with it.
export const AddressView = (): Node => {
  const detailed = signal(false);
  const street = signal('Rua Augusta 24');
  const alive = signal(0);
  const built = signal(0);

  const View = ({ Tag }: { Tag: 'pre' | 'span' }): Node => {
    const city = signal('Lisbon');
    const text = computed(() =>
      Tag === 'pre'
        ? `${street.value}\n${city.value}\nPortugal`
        : `${street.value}, ${city.value}`
    );
    built.value = built.peek() + 1;
    alive.value = alive.peek() + 1;
    onCleanup(() => (alive.value = alive.peek() - 1));
    return <Tag>{text}</Tag>;
  };

  return (
    <div className={css.row}>
      <button onClick={() => (detailed.value = !detailed.value)}>
        Switch view
      </button>
      <label className={css.field}>
        Street
        <input
          value={street}
          onInput={(event) => (street.value = event.currentTarget.value)}
        />
      </label>
      <Show when={detailed} fallback={() => <View Tag='span' />}>
        {() => <View Tag='pre' />}
      </Show>
      <p className={css.status}>
        Views built: <span data-built>{built}</span>, alive:{' '}
        <span data-alive>{alive}</span>
      </p>
    </div>
  );
};
