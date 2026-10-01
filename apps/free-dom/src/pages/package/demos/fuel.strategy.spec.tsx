import { FuelStrategy } from './fuel.strategy';
import { clickButton, mounted } from '../../../testing/dom.testing';

describe('FuelStrategy (signals)', () => {
  it('radios the driver once per lap, though a lap changes two signals', () => {
    const view = mounted(() => <FuelStrategy />);

    clickButton(view.host, 'Complete a lap');

    expect(view.text()).toContain('Radio call 2: 19 laps, 49.6 l');
    view.dispose();
  });

  it('plans a stop once the fuel falls short, and refuels to the finish', () => {
    const view = mounted(() => <FuelStrategy />);

    clickButton(view.host, 'Push');
    const short = view.host.querySelector('p')?.textContent;
    clickButton(view.host, 'Refuel');

    expect(short).toBe('Box for 2.0 l more');
    expect(view.host.querySelector('p')?.textContent).toBe('Fuel to the finish, 0.0 l spare');
    view.dispose();
  });
});
