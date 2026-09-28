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
    history.replaceState(null, '', '/evolution/factories');
    render.mockClear();
    stop = navigateInPage(render);
  });

  afterEach(() => stop());

  it('renders a same-site link in place and adds it to the history', () => {
    const click = clickLink({ href: '/evolution/jsx' });

    expect(click.defaultPrevented).toBe(true);
    expect(location.pathname).toBe('/evolution/jsx');
    expect(render).toHaveBeenCalledExactlyOnceWith('/evolution/jsx');
  });

  it('renders the page of a history step, back or forward', () => {
    clickLink({ href: '/evolution/jsx' });
    history.replaceState(null, '', '/evolution/factories');

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(render).toHaveBeenLastCalledWith('/evolution/factories');
  });

  it.each<[string, Parameters<typeof a>[0], MouseEventInit]>([
    ['another site', { href: 'https://github.com/JsPowWow/reely' }, {}],
    ['a new tab', { href: '/evolution/jsx', target: '_blank' }, {}],
    ['a download', { href: '/evolution/jsx', download: '' }, {}],
    ['a modified click', { href: '/evolution/jsx' }, { metaKey: true }],
    ['a middle click', { href: '/evolution/jsx' }, { button: 1 }],
    ['a place on the same page', { href: '#sector-2' }, {}],
  ])('leaves %s to the browser', (_name, props, init) => {
    const click = clickLink(props, init);

    expect(click.defaultPrevented).toBe(false);
    expect(render).not.toHaveBeenCalled();
  });

  it('keeps the page when the history moves between places on it', () => {
    history.pushState(null, '', '/evolution/factories#sector-2');

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(render).not.toHaveBeenCalled();
  });

  it('stops following links once stopped', () => {
    stop();

    const click = clickLink({ href: '/evolution/jsx' });

    expect(click.defaultPrevented).toBe(false);
    expect(render).not.toHaveBeenCalled();
  });
});
