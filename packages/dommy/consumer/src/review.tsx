import { Await, Keyed, signal } from '@reely/dommy';

// what the first consumer writes: React-cased handlers, id attributes, a keyed branch, an async one
const reviewer = signal('Ada');

export const Review = (): Node => (
  <form id="review">
    <input list="reviewers" onKeyDown={(event) => event.key} onPointerMove={(event) => event.pointerId} />
    <datalist id="reviewers" />
    <button form="review">Send</button>
    <iframe sandbox="allow-scripts" />
    <Keyed value={reviewer}>{(name) => <textarea placeholder={`Review by ${name}`} />}</Keyed>
    <Await promise={Promise.resolve(3)} catch={(error) => error.message}>
      {(laps) => `${laps} laps`}
    </Await>
  </form>
);
