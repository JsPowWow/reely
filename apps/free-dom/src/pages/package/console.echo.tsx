import { isString } from '@reely/basics';
import { For, onCleanup, signal } from '@reely/dommy';
import { Either, isInstanceOf } from '@reely/utils';

import { packageText } from './package.text';

import css from './package.module.css';

const levels = ['log', 'info', 'warn', 'error'] as const;

// as the console would print it, and never a throw for whoever logged: a cycle or a BigInt falls back to String
const shown = (part: unknown): string => {
  if (isString(part)) {
    return part;
  }
  if (isInstanceOf(Error, part)) {
    return `${part.name}: ${part.message}`;
  }
  return Either.tryCatch(() => JSON.stringify(part)).getOrElse(String(part));
};

/** Writes to the console as before, and while it is on the page also shows the last lines written. */
export const ConsoleEcho = ({ children }: { children: Node }): Node => {
  const lines = signal<readonly { id: number; text: string }[]>([]);
  let written = 0;
  for (const level of levels) {
    const write = console[level];
    console[level] = (...parts: unknown[]): void => {
      write(...parts);
      written += 1;
      lines.value = [...lines.value, { id: written, text: parts.map(shown).join(' ') }].slice(-4);
    };
    onCleanup(() => {
      console[level] = write;
    });
  }

  return (
    <div className={css.echoed}>
      {children}
      <div className={css.console} data-console=''>
        <p className={css.consoleTitle}>{() => packageText().console}</p>
        <pre>
          <For each={lines} by={(line) => line.id}>
            {(line) => <code>{() => `${line().text}\n`}</code>}
          </For>
        </pre>
      </div>
    </div>
  );
};
