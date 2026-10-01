import { MailClient } from './mail.client';
import { flushMutations, mounted } from '../../../../testing/dom.testing';

const clickLink = (root: Element, text: string): void => {
  const link = Array.from(root.querySelectorAll('a')).find((each) => each.textContent?.startsWith(text));
  if (!link) {
    throw new Error(`No "${text}" link`);
  }
  link.click();
};

const current = (root: Element): string | null | undefined =>
  root.querySelector('nav [aria-current="page"]')?.textContent;

describe('MailClient (router)', () => {
  it('opens a message from its folder, keeps the folder marked, and goes back to it', async () => {
    const view = mounted(MailClient);
    await flushMutations();
    const inbox = view.text();

    clickLink(view.host, 'Lunch on Friday?');
    await flushMutations();
    const message = [view.host.querySelector('p')?.textContent, current(view.host)];
    clickLink(view.host, 'Back to inbox');
    await flushMutations();

    expect(inbox).toContain('Your parcel is on its way');
    expect(message).toEqual(['/inbox/42', 'inbox']);
    expect(view.host.querySelector('h2')?.textContent).toBe('inbox');
    view.dispose();
  });

  it('shows the page for unknown paths for a folder that is not in the mailbox', async () => {
    const view = mounted(MailClient);
    await flushMutations();

    clickLink(view.host, 'archive');
    await flushMutations();

    expect(view.host.querySelector('h2')?.textContent).toBe('Not found');
    expect(current(view.host)).toBe('archive');
    view.dispose();
  });

  it('leaves the location of the document alone', async () => {
    const before = location.href;
    const view = mounted(MailClient);
    await flushMutations();

    clickLink(view.host, 'sent');
    await flushMutations();

    expect(view.host.querySelector('h2')?.textContent).toBe('sent');
    expect(location.href).toBe(before);
    view.dispose();
  });
});
