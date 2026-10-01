import { HelpWidget } from './help.widget';
import { clickButton, mounted } from '../../../../testing/dom.testing';

const clickLink = (root: Element, text: string): void => {
  const link = Array.from(root.querySelectorAll('a')).find((each) => each.textContent === text);
  if (!link) {
    throw new Error(`No "${text}" link`);
  }
  link.click();
};

const heading = (root: Element): string | null | undefined => root.querySelector('h2')?.textContent;

// long enough for any answer of the help desk to arrive
const answered = async (): Promise<void> => {
  await vi.advanceTimersByTimeAsync(1000);
};

describe('HelpWidget (router in dommy)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the topics shown while an answer is on its way, and says it is coming', async () => {
    const view = mounted(() => <HelpWidget />);
    await vi.advanceTimersByTimeAsync(0);
    const widget = view.host.querySelector('[aria-busy]');

    clickLink(view.host, 'Returns');
    await vi.advanceTimersByTimeAsync(100);
    const whileLoading = [heading(view.host), widget?.getAttribute('aria-busy')];
    await answered();

    expect(whileLoading).toEqual(['How can we help?', 'true']);
    expect([heading(view.host), widget?.getAttribute('aria-busy')]).toEqual(['Returns', 'false']);
    view.dispose();
  });

  it('opens a topic, marks it in the menu, and gives each visit a fresh page', async () => {
    const view = mounted(() => <HelpWidget />);
    await vi.advanceTimersByTimeAsync(0);

    clickLink(view.host, 'Returns');
    await answered();
    clickButton(view.host, 'This helped');
    const voted = view.text().includes('Thanks for telling us.');
    clickLink(view.host, 'Delivery');
    await answered();
    clickLink(view.host, 'Returns');
    await answered();

    expect(voted).toBe(true);
    expect(view.text()).toContain('This helped');
    expect(view.host.querySelector('[aria-current="page"]')?.textContent).toBe('Returns');
    expect(view.host.querySelector('p')?.textContent).toBe('/help/returns');
    view.dispose();
  });

  it('catches a topic no route answers', async () => {
    const view = mounted(() => <HelpWidget />);
    await vi.advanceTimersByTimeAsync(0);

    clickLink(view.host, 'gift cards');
    await answered();

    expect(heading(view.host)).toBe('No answer yet');
    expect(view.text()).toContain('No route answers /help/gift-cards');
    view.dispose();
  });
});
