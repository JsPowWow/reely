import { FilesBrowser } from './files.browser';
import { flushMutations, mounted } from '../../../../testing/dom.testing';

const clickLink = (root: Element, text: string): void => {
  const link = Array.from(root.querySelectorAll('a')).find((each) => each.firstChild?.textContent === text);
  if (!link) {
    throw new Error(`No "${text}" link`);
  }
  link.click();
};

const crumbs = (root: Element): string[] => Array.from(root.querySelectorAll('ol a'), (link) => link.textContent ?? '');

describe('FilesBrowser (router in dommy)', () => {
  it('opens a folder deep in the drive, with the crumbs of the way there', async () => {
    const view = mounted(() => <FilesBrowser />);
    await flushMutations();

    expect(view.host.querySelector('p')?.textContent).toBe('/drive/Photos/Office%20party');
    expect(crumbs(view.host)).toEqual(['Drive', 'Photos', 'Office party']);
    expect(view.host.querySelector('h2')?.textContent).toBe('Office party');
    view.dispose();
  });

  it('goes up by a crumb and down into another folder, to a file', async () => {
    const view = mounted(() => <FilesBrowser />);
    await flushMutations();

    clickLink(view.host, 'Drive');
    await flushMutations();
    clickLink(view.host, 'Q3 plans');
    await flushMutations();
    clickLink(view.host, 'team offsite.docx');
    await flushMutations();

    expect(view.host.querySelector('p')?.textContent).toBe('/drive/Q3%20plans/team%20offsite.docx');
    expect(view.host.querySelector('h2')?.textContent).toBe('team offsite.docx');
    expect(view.text()).toContain('112 kB');
    view.dispose();
  });
});
