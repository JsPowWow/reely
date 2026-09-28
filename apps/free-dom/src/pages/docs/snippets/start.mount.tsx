import { mount, signal } from '@reely/dommy';

const count = signal(0);

// `mount` appends the view and returns the function that takes it down.
const unmount = mount(document.body, () => (
  <p>
    <button onClick={() => (count.value += 1)}>+1</button>
    <output>{count}</output>
  </p>
));

export { unmount };
