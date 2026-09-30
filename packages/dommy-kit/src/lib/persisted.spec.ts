import { mount } from '@reely/dommy';

import { persisted } from '../index';

const memoryStorage = (entries: Record<string, string> = {}): Storage => {
  const items = new Map(Object.entries(entries));
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => void items.delete(key),
    setItem: (key, value) => void items.set(key, value),
  };
};

describe('persisted', () => {
  it('starts from the stored value and stores every write', () => {
    const storage = memoryStorage({ theme: '"dark"' });
    const theme = persisted('theme', 'light', { storage });

    const stored = theme.value;
    theme.value = 'contrast';

    expect(stored).toBe('dark');
    expect(storage.getItem('theme')).toBe('"contrast"');
  });

  it('starts from the initial value when nothing, or something of another kind, is stored', () => {
    const storage = memoryStorage({ tab: '42' });

    expect(persisted('lang', 'en', { storage }).value).toBe('en');
    expect(persisted('tab', 'garage', { storage }).value).toBe('garage');
  });

  it('keeps working in memory when the storage throws', () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
    const tab = persisted('tab', 'race', { storage });

    tab.value = 'garage';

    expect(tab.value).toBe('garage');
  });

  it('follows a write from another tab until its render is disposed', () => {
    let lang: { value: string } | undefined;
    const dispose = mount(document.createElement('div'), () => {
      lang = persisted('lang', 'en', { storage: memoryStorage() });
      return null;
    });

    window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: '"ru"' }));
    const followed = lang?.value;
    dispose();
    window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: '"en"' }));

    expect(followed).toBe('ru');
    expect(lang?.value).toBe('ru');
  });
});
