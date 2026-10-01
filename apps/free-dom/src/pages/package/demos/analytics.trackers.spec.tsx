import { AnalyticsTrackers } from './analytics.trackers';
import { clickButton, mounted } from '../../../testing/dom.testing';

describe('AnalyticsTrackers (basics)', () => {
  it('reports the order to every tracker, then names the one that broke', () => {
    const view = mounted(() => <AnalyticsTrackers />);

    clickButton(view.host, 'Place the order');

    const counts = Array.from(view.host.querySelectorAll('li output'), (count) => count.textContent);
    expect(counts).toEqual(['1 event', 'blocked', '1 event']);
    expect(view.text()).toContain('Reported to the rest. Blocked by an ad blocker.');
    view.dispose();
  });
});
