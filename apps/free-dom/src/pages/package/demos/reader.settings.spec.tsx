import { ReaderSettings } from './reader.settings';
import { clickButton, mounted } from '../../../testing/dom.testing';

import type { Mounted } from '../../../testing/dom.testing';

describe('ReaderSettings (dommy-kit)', () => {
  let view: Mounted;

  afterEach(() => {
    view.dispose();
    localStorage.clear();
  });

  it('sets the text in the size chosen, and keeps it for the next visit', () => {
    view = mounted(() => <ReaderSettings />);
    clickButton(view.host, 'Large');
    view.dispose();

    view = mounted(() => <ReaderSettings />);

    expect(view.host.querySelector('article')?.getAttribute('data-size')).toBe('large');
  });
});
