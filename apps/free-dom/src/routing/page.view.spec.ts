import { div, onCleanup, span } from '@reely/dommy';

import { createPageView, enterPage } from './page.view';

describe('createPageView', () => {
  it('shows a page in place of the one before, and takes that one down with what it holds', () => {
    const body = document.createElement('div');
    const stopTimer = vi.fn();
    const show = createPageView(body);

    show(() => {
      onCleanup(stopTimer);
      return div(null, 'first');
    });
    show(() => span(null, 'second'));

    expect(stopTimer).toHaveBeenCalledOnce();
    expect(body.innerHTML).toBe('<span>second</span>');
  });
});
describe('enterPage', () => {
  const scrolledInto: string[] = [];
  const scrollTo = vi.fn();

  beforeEach(() => {
    scrolledInto.length = 0;
    scrollTo.mockClear();
    vi.stubGlobal('scrollTo', scrollTo);
    Element.prototype.scrollIntoView = function (this: Element): void {
      scrolledInto.push(this.id);
    };
    document.body.innerHTML = '<h1>reely</h1><section id="packages"><h2>Packages</h2></section>';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
    document.body.replaceChildren();
    history.replaceState(null, '', '/');
  });

  it('starts a page at its top, with focus on its heading', () => {
    enterPage();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(document.activeElement?.textContent).toBe('reely');
  });

  it('starts at the place the link named, with focus on it', () => {
    history.replaceState(null, '', '/#packages');

    enterPage();

    expect(scrolledInto).toEqual(['packages']);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(document.activeElement?.id).toBe('packages');
  });

  it('starts at the top when the named place is not on the page, or cannot be', () => {
    history.replaceState(null, '', '/#%E0%A4');

    enterPage();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(document.activeElement?.textContent).toBe('reely');
  });
});
