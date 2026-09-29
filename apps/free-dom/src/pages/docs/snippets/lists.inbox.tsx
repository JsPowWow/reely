import { For, signal } from '@reely/dommy';

interface Message {
  id: string;
  subject: string;
}

const inbox = signal<readonly Message[]>([]);

// One row per `by` key; `message()` and `index()` follow later updates of that key.
export const Inbox = (): Node => (
  <ol>
    <For each={inbox} by={(message) => message.id}>
      {(message, index) => <li className={() => (index() === 0 ? 'newest' : '')}>{() => message().subject}</li>}
    </For>
  </ol>
);
