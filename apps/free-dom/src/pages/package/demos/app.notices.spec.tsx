import { AppNotices } from './app.notices';
import { clickButton, mounted } from '../../../testing/dom.testing';

describe('AppNotices (emitter)', () => {
  it('reaches the toasts and the badge, though the chat widget throws', () => {
    const view = mounted(() => <AppNotices />);

    clickButton(view.host, 'Save the profile');
    clickButton(view.host, 'Lose the connection');

    expect(Array.from(view.host.querySelectorAll('li'), (toast) => toast.textContent)).toEqual([
      'Connection lost, retrying',
      'Profile saved',
    ]);
    expect(view.host.querySelector('[data-unread]')?.textContent).toBe('2');
    expect(view.text()).toContain('The chat widget threw: the others heard it');
    view.dispose();
  });
});
