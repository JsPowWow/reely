import { Show, computed, onCleanup, signal } from '@reely/dommy';

import css from '../demos.module.css';

// Each branch makes its own signal and computed; the branch that goes releases them with it.
export const PreOrSpan = (): Node => {
  const renderPre = signal(false);
  const prefix = signal('Prefix');
  const alive = signal(0);
  const built = signal(0);

  const Branch = ({ Tag }: { Tag: 'pre' | 'span' }): Node => {
    const suffix = signal('Suffix');
    const text = computed(() => `${prefix.value} - ${suffix.value}`);
    built.value = built.peek() + 1;
    alive.value = alive.peek() + 1;
    onCleanup(() => (alive.value = alive.peek() - 1));
    return <Tag>{text}</Tag>;
  };

  return (
    <div className={css.row}>
      <button onClick={() => (renderPre.value = !renderPre.value)}>Switch</button>
      <label className={css.field}>
        Prefix
        <input value={prefix} onInput={(event) => (prefix.value = event.currentTarget.value)} />
      </label>
      <Show when={renderPre} fallback={() => <Branch Tag='span' />}>
        {() => <Branch Tag='pre' />}
      </Show>
      <p className={css.status}>
        Branches built: <span data-built>{built}</span>, alive: <span data-alive>{alive}</span>
      </p>
    </div>
  );
};
