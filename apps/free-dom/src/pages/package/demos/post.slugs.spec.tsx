import { PostSlugs } from './post.slugs';
import { mounted, typeInto } from '../../../testing/dom.testing';

describe('PostSlugs (strings)', () => {
  it('capitalises the title and makes its address, a Latin accent dropped', () => {
    const view = mounted(() => <PostSlugs />);

    typeInto(view.host, 'a weekend in łódź');

    expect(view.host.querySelector('h3')?.textContent).toBe('A Weekend In Łódź');
    expect(view.text()).toContain('/blog/a-weekend-in-lodz');
    view.dispose();
  });

  it('keeps Cyrillic in the address as it is', () => {
    const view = mounted(() => <PostSlugs />);

    typeInto(view.host, 'Моя машина');

    expect(view.text()).toContain('/blog/моя-машина');
    view.dispose();
  });
});
