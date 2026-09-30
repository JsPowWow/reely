import { mount, signal } from '@reely/dommy';

import { textsLoaded, localized } from './localized';
import { locale } from './locale';
import { Localized } from './localized.view';

describe('Localized', () => {
  afterEach(() => {
    locale.value = 'en';
  });

  it('renders the markup of a text and renders it again, in place, when the language changes', async () => {
    const note = localized(
      () => (
        <p>
          Read <a href='/docs'>the docs</a>
        </p>
      ),
      async () => () =>
        (
          <p>
            Читайте <a href='/docs'>документацию</a>
          </p>
        )
    );
    const host = document.createElement('div');
    const unmount = mount(host, () => (
      <section>
        <h2>Before</h2>
        <Localized view={note} />
        <footer>After</footer>
      </section>
    ));

    expect(host.querySelector('section')?.textContent).toBe('BeforeRead the docsAfter');

    locale.value = 'ru';
    await textsLoaded();

    expect(host.querySelector('section')?.textContent).toBe('BeforeЧитайте документациюAfter');
    unmount();
  });

  it('keeps state beside it when the language changes', async () => {
    const likes = signal(0);
    const host = document.createElement('div');
    const unmount = mount(host, () => (
      <div>
        <output>{likes}</output>
        <Localized
          view={localized(
            () => 'Likes',
            async () => () => 'Лайки'
          )}
        />
      </div>
    ));
    const output = host.querySelector('output');
    likes.value = 3;

    locale.value = 'ru';
    await textsLoaded();

    expect(host.querySelector('output')).toBe(output);
    expect(host.textContent).toBe('3Лайки');
    unmount();
  });
});
