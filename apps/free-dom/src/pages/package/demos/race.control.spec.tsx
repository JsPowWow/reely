import { RaceControl } from './race.control';
import { clickButton, mounted } from '../../../testing/dom.testing';

describe('RaceControl (emitter)', () => {
  it('reaches every screen with a flag, though the team radio throws', () => {
    const view = mounted(() => <RaceControl />);

    clickButton(view.host, 'Yellow flag');

    expect(view.host.querySelector('[data-flag]')?.getAttribute('data-flag')).toBe('yellow');
    expect(view.text()).toContain('Yellow flag in sector 2');
    expect(view.text()).toContain('Team radio is down: the others heard it');
    view.dispose();
  });
});
