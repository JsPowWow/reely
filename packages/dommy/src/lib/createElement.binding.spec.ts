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
});
