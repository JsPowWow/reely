import { a } from '@reely/dommy';

import { navigateInPage } from './page.navigation';

describe('navigateInPage', () => {
  let stop: VoidFunction = () => undefined;
  const render = vi.fn<(pathname: string) => void>();

  // clicks a link and says whether the page handled it; jsdom cannot follow links itself
  const clickLink = (props: Parameters<typeof a>[0], init: MouseEventInit = {}): { defaultPrevented: boolean } => {
    const link = a(props, 'link');
    document.body.append(link);
    let defaultPrevented = false;
    window.addEventListener(
      'click',
      (event) => {
        defaultPrevented = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true }
    );
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }));
    link.remove();
    return { defaultPrevented };
  };

  beforeEach(() => {
    history.replaceState(null, '', '/tutorial/factories');
    render.mockClear();
    stop = navigateInPage(render);
  });

  afterEach(() => stop());

  it('renders a same-site link in place and adds it to the history', () => {
    const click = clickLink({ href: '/tutorial/jsx' });

    expect(click.defaultPrevented).toBe(true);
    expect(location.pathname).toBe('/tutorial/jsx');
    expect(render).toHaveBeenCalledExactlyOnceWith('/tutorial/jsx');
  });

  it('renders the page of a history step, back or forward', () => {
    clickLink({ href: '/tutorial/jsx' });
    history.replaceState(null, '', '/tutorial/factories');

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(render).toHaveBeenLastCalledWith('/tutorial/factories');
  });

  it.each<[string, Parameters<typeof a>[0], MouseEventInit]>([
    ['another site', { href: 'https://github.com/JsPowWow/reely' }, {}],
    ['a new tab', { href: '/tutorial/jsx', target: '_blank' }, {}],
    ['a download', { href: '/tutorial/jsx', download: '' }, {}],
    ['a modified click', { href: '/tutorial/jsx' }, { metaKey: true }],
    ['a middle click', { href: '/tutorial/jsx' }, { button: 1 }],
  ])('leaves %s to the browser', (_name, props, init) => {
    const click = clickLink(props, init);

    expect(click.defaultPrevented).toBe(false);
    expect(render).not.toHaveBeenCalled();
  });

  it('stops following links once stopped', () => {
    stop();

    const click = clickLink({ href: '/tutorial/jsx' });

    expect(click.defaultPrevented).toBe(false);
    expect(render).not.toHaveBeenCalled();
  });
});
