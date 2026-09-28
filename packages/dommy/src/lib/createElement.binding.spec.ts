import { createElement, signal } from '../index';

const recordMutations = (target: Node, update: () => void): MutationRecord[] => {
  const observer = new MutationObserver(() => undefined);
  observer.observe(target, { subtree: true, childList: true, attributes: true, characterData: true });
  update();
  const records = observer.takeRecords();
  observer.disconnect();
  return records;
};

describe('createElement: reactive bindings', () => {
  describe('children', () => {
    it('renders a signal as a text node and updates only its data', () => {
      const place = signal(1);
      const cell = createElement('td', null, 'P', place);
      const text = cell.lastChild;

      const records = recordMutations(cell, () => {
        place.value = 2;
      });

      expect(cell.textContent).toBe('P2');
      expect(cell.lastChild).toBe(text);
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({ type: 'characterData', target: text });
    });
  });

  describe('props', () => {
    it('updates a bound attribute in place', () => {
      const leader = signal('Bolt');
      const row = createElement('li', { title: () => `Leader: ${leader.value}` });

      const records = recordMutations(row, () => {
        leader.value = 'Flash';
      });

      expect(row.getAttribute('title')).toBe('Leader: Flash');
      expect(records).toHaveLength(1);
    });

    it('removes a bound attribute when the value becomes null', () => {
      const hint = signal<string | null>('fast');
      const row = createElement('li', { title: hint, className: () => hint.value });

      hint.value = null;

      expect(row.hasAttribute('title')).toBe(false);
      expect(row.hasAttribute('class')).toBe(false);
    });

    it('toggles a bound boolean attribute', () => {
      const busy = signal(true);
      const button = createElement('button', { disabled: busy });

      busy.value = false;

      expect(button.disabled).toBe(false);
    });

    it('sets a bound live property over the user input', () => {
      const name = signal('Bolt');
      const input = createElement('input', { value: name });
      input.value = 'typed by the user';

      name.value = 'Flash';

      expect(input.value).toBe('Flash');
    });
  });
});
