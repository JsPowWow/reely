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

const brokenGuard = (_stored: unknown): _stored is string => {
  throw new Error('broken guard');
};

const isNullableString = (stored: unknown): stored is string | null => stored === null || typeof stored === 'string';

const fromAnotherTab = (init: StorageEventInit): void => {
  window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, ...init }));
};

describe('persisted', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

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

  it('writes nothing until the value changes, so a refused stored value survives', () => {
    const storage = memoryStorage({ tab: '42' });
    const setItem = vi.spyOn(storage, 'setItem');

    const tab = persisted('tab', 'garage', { storage });
    const untouched = storage.getItem('tab');
    tab.value = 'race';
    tab.value = 'garage';

    expect(untouched).toBe('42');
    expect(setItem).toHaveBeenCalledTimes(2);
    expect(storage.getItem('tab')).toBe('"garage"');
  });

  it('starts from the initial value when the guard throws', () => {
    const storage = memoryStorage({ lang: '"ru"' });

    expect(persisted('lang', 'en', { storage, is: brokenGuard }).value).toBe('en');
  });

  it('keeps a nullable value, read back through `is`', () => {
    const storage = memoryStorage({ user: '"kenji"' });

    const user = persisted<string | null>('user', null, { storage, is: isNullableString });
    const read = user.value;
    user.value = null;

    expect(read).toBe('kenji');
    expect(storage.getItem('user')).toBe('null');
    // @ts-expect-error a nullable value has no kind to check against: `is` is required
    persisted<string | null>('user', null, { storage });
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

  it('tries the storage again on the next write after it throws', () => {
    const storage = memoryStorage();
    const setItem = vi
      .fn<Storage['setItem']>()
      .mockImplementationOnce(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      })
      .mockImplementation((key, value) => storage.setItem(key, value));
    const garage = persisted('garage', ['Volvo'], { storage: { getItem: (key) => storage.getItem(key), setItem } });

    garage.value = ['Volvo', 'Saab'];
    garage.value = ['Volvo', 'Saab', 'Audi'];

    expect(setItem).toHaveBeenCalledTimes(2);
    expect(storage.getItem('garage')).toBe('["Volvo","Saab","Audi"]');
  });

  it('follows a write from another tab until its render is disposed, without writing it back', () => {
    let lang: { value: string } | undefined;
    const dispose = mount(document.createElement('div'), () => {
      lang = persisted('lang', 'en');
      return null;
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    fromAnotherTab({ key: 'lang', newValue: '"ru"' });
    const followed = lang?.value;
    dispose();
    fromAnotherTab({ key: 'lang', newValue: '"en"' });

    expect(followed).toBe('ru');
    expect(lang?.value).toBe('ru');
    expect(setItem).not.toHaveBeenCalled();
  });

  it('resets to the initial value when another tab clears the storage', () => {
    const lang = persisted('lang', 'en');
    lang.value = 'ru';

    fromAnotherTab({ key: null, newValue: null });

    expect(lang.value).toBe('en');
  });

  it('follows only the storage area it uses', () => {
    const lang = persisted('lang', 'en');
    const tab = persisted('tab', 'race', { storage: memoryStorage() });

    fromAnotherTab({ key: 'lang', newValue: '"ru"', storageArea: sessionStorage });
    fromAnotherTab({ key: null, storageArea: sessionStorage });
    fromAnotherTab({ key: 'tab', newValue: '"garage"' });

    expect(lang.value).toBe('en');
    expect(tab.value).toBe('race');
  });

  it('ignores a write from another tab when the guard throws', () => {
    const errors = vi.fn();
    window.addEventListener('error', errors);
    const lang = persisted('lang', 'en', { is: brokenGuard });

    fromAnotherTab({ key: 'lang', newValue: '"ru"' });
    window.removeEventListener('error', errors);

    expect(lang.value).toBe('en');
    expect(errors).not.toHaveBeenCalled();
  });
});
