import { AccountGuard } from './account.guard';
import { clickButton, flushMutations, mounted } from '../../../../testing/dom.testing';

const clickLink = (root: Element, text: string): void => {
  const link = Array.from(root.querySelectorAll('a')).find((each) => each.textContent === text);
  if (!link) {
    throw new Error(`No "${text}" link`);
  }
  link.click();
};

const shown = (root: Element): (string | null | undefined)[] => [
  root.querySelector('p')?.textContent,
  root.querySelector('h2')?.textContent,
];

describe('AccountGuard (router)', () => {
  it('sends a signed-out reader to sign in, then on to the page they asked for', async () => {
    const view = mounted(AccountGuard);
    await flushMutations();

    clickLink(view.host, 'Orders');
    await flushMutations();
    const sentToSignIn = shown(view.host);
    clickButton(view.host, 'Sign in as Ana');
    await flushMutations();

    expect(sentToSignIn).toEqual(['/login?next=%2Forders', 'Sign in']);
    expect(shown(view.host)).toEqual(['/orders', 'Ana’s orders']);
    expect(view.host.querySelector('[aria-current="page"]')?.textContent).toBe('Orders');
    view.dispose();
  });

  it('lets a signed-in reader through, until they sign out', async () => {
    const view = mounted(AccountGuard);
    await flushMutations();
    clickLink(view.host, 'Account');
    await flushMutations();
    clickButton(view.host, 'Sign in as Ana');
    await flushMutations();

    clickButton(view.host, 'Sign out');
    await flushMutations();
    clickLink(view.host, 'Account');
    await flushMutations();

    expect(shown(view.host)).toEqual(['/login?next=%2Faccount', 'Sign in']);
    view.dispose();
  });
});
