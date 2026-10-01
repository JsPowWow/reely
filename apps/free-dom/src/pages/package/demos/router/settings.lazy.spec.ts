import { LazySettings } from './settings.lazy';
import { mounted } from '../../../../testing/dom.testing';

const clickLink = (root: Element, text: string): void => {
  const link = Array.from(root.querySelectorAll('a')).find((each) => each.textContent === text);
  if (!link) {
    throw new Error(`No "${text}" link`);
  }
  link.click();
};

const heading = (root: Element): string | null | undefined => root.querySelector('h2')?.textContent;

describe('LazySettings (router)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the page shown while the next one loads, and says that one is coming', async () => {
    const view = mounted(LazySettings);
    await vi.advanceTimersByTimeAsync(0);
    const app = view.host.querySelector('[aria-busy]');

    clickLink(view.host, 'billing');
    await vi.advanceTimersByTimeAsync(100);
    const whileLoading = [heading(view.host), app?.getAttribute('aria-busy')];
    await vi.advanceTimersByTimeAsync(1500);

    expect(whileLoading).toEqual(['Profile', 'true']);
    expect([heading(view.host), app?.getAttribute('aria-busy')]).toEqual(['Billing', 'false']);
    expect(view.host.querySelector('[aria-current="page"]')?.textContent).toBe('billing');
    view.dispose();
  });

  it('drops a page a later click overtook, though it loads', async () => {
    const view = mounted(LazySettings);
    await vi.advanceTimersByTimeAsync(0);

    clickLink(view.host, 'billing');
    clickLink(view.host, 'notifications');
    await vi.advanceTimersByTimeAsync(2000);

    expect(heading(view.host)).toBe('Notifications');
    expect(Array.from(view.host.querySelectorAll('li'), (line) => line.textContent)).toEqual([
      '/settings/profile shown',
      'notifications loaded',
      '/settings/notifications shown',
      'billing loaded',
    ]);
    view.dispose();
  });

  it('shows what went wrong with a page that does not load', async () => {
    const view = mounted(LazySettings);
    await vi.advanceTimersByTimeAsync(0);

    clickLink(view.host, 'reports');
    await vi.advanceTimersByTimeAsync(1000);

    expect(heading(view.host)).toBe('Could not open the page');
    expect(view.text()).toContain('The reports chunk did not load.');
    view.dispose();
  });
});
