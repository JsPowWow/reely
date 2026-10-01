import { HelpWidget } from './help.widget';
import { clickButton, flushMutations, mounted } from '../../../../testing/dom.testing';

const clickLink = (root: Element, text: string): void => {
  const link = Array.from(root.querySelectorAll('a')).find((each) => each.textContent === text);
  if (!link) {
    throw new Error(`No "${text}" link`);
  }
  link.click();
};

describe('HelpWidget (router in dommy)', () => {
  it('opens a topic, marks it in the menu, and gives each visit a fresh page', async () => {
    const view = mounted(() => <HelpWidget />);
    await flushMutations();

    clickLink(view.host, 'Returns');
    await flushMutations();
    clickButton(view.host, 'This helped');
    const voted = view.text().includes('Thanks for telling us.');
    clickLink(view.host, 'Delivery');
    await flushMutations();
    clickLink(view.host, 'Returns');
    await flushMutations();

    expect(voted).toBe(true);
    expect(view.text()).toContain('This helped');
    expect(view.host.querySelector('[aria-current="page"]')?.textContent).toBe('Returns');
    expect(view.host.querySelector('p')?.textContent).toBe('/help/returns');
    view.dispose();
  });

  it('catches a topic no route answers', async () => {
    const view = mounted(() => <HelpWidget />);
    await flushMutations();

    clickLink(view.host, 'gift cards');
    await flushMutations();

    expect(view.host.querySelector('h2')?.textContent).toBe('No answer yet');
    expect(view.text()).toContain('No route answers /help/gift-cards');
    view.dispose();
  });
});
