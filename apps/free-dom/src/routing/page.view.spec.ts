import { div, onCleanup, span } from '@reely/dommy';

import { createPageView } from './page.view';

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
