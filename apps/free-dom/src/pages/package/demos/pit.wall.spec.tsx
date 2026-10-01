import { PitWall } from './pit.wall';
import { clickButton, mounted } from '../../../testing/dom.testing';

describe('PitWall (basics)', () => {
  it('posts the lap time to every working screen, then names the broken one', () => {
    const view = mounted(() => <PitWall />);

    clickButton(view.host, 'Post lap time');

    const shown = Array.from(view.host.querySelectorAll('li output'), (screen) => screen.textContent);
    expect(shown).toEqual(['Lap 1: 1:31.204', 'offline', 'Lap 1: 1:31.204']);
    expect(view.text()).toContain('Timing tower is offline');
    view.dispose();
  });
});
