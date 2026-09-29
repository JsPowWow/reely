import { mount, signal } from '@reely/dommy';

const message = signal('');

// `mount` appends the view and returns the function that takes it down.
const unmount = mount(document.body, () => (
  <label>
    <textarea maxLength={280} onInput={(event) => message.set(event.currentTarget.value)} />
    <output>{() => 280 - message.value.length}</output> characters left
  </label>
));

export { unmount };
