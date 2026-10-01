import { IssuesBoard } from './issues.board';
import { clickButton, flushMutations, mounted } from '../../../../testing/dom.testing';

const clickLink = (root: Element, text: string): void => {
  const link = Array.from(root.querySelectorAll('a')).find((each) => each.firstChild?.textContent === text);
  if (!link) {
    throw new Error(`No "${text}" link`);
  }
  link.click();
};

const heading = (root: Element): string | null | undefined => root.querySelector('h2')?.textContent;

describe('IssuesBoard (router in dommy)', () => {
  it('filters the issues from links that keep the other filter', async () => {
    const view = mounted(() => <IssuesBoard />);
    await flushMutations();
    const all = heading(view.host);

    clickLink(view.host, 'bug');
    await flushMutations();
    const bugs = heading(view.host);
    clickLink(view.host, 'closed');
    await flushMutations();

    expect([all, bugs]).toEqual(['4 open issues', '2 open bug issues']);
    expect(heading(view.host)).toBe('1 closed bug issue');
    expect(view.host.querySelector('[aria-current="page"]')?.textContent).toBe('closed');
    view.dispose();
  });

  it('closes an issue, and the open list it goes back to no longer has it', async () => {
    const view = mounted(() => <IssuesBoard />);
    await flushMutations();

    clickLink(view.host, 'Totals round the wrong way');
    await flushMutations();
    clickButton(view.host, 'Close the issue');
    const state = view.host.querySelectorAll('p')[0]?.textContent;
    clickLink(view.host, 'Back to the open ones');
    await flushMutations();

    expect(state).toBe('Closed');
    expect(heading(view.host)).toBe('1 open bug issue');
    view.dispose();
  });
});
