import type { ReelyNode } from '@reely/dommy';

// The lab's `markup`, whole: every `yield` of the builder becomes one child.
const markup = (build: () => Iterable<ReelyNode>): ReelyNode[] => Array.from(build());

const tasks = [
  { title: 'Write the spec', done: false },
  { title: 'Make it pass', done: true },
  { title: 'Ship next.2', done: false },
];

// `for`, `continue` and `if` inside JSX; the builder runs once, like a component.
export const MarkupList = (): Node => (
  <ul>
    {markup(function* () {
      for (const [index, task] of tasks.entries()) {
        if (task.done) {
          continue;
        }
        yield <li>{`${index + 1}. ${task.title}`}</li>;
      }
      const done = tasks.filter((task) => task.done).length;
      if (done > 0) {
        yield <li>Done: {done}</li>;
      }
    })}
  </ul>
);
