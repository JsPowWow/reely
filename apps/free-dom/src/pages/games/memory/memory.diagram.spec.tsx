import { MachineDiagram } from './memory.diagram';
import { mounted } from '../../../testing/dom.testing';

import type { Mounted } from '../../../testing/dom.testing';

const SVG_NS = 'http://www.w3.org/2000/svg';

const texts = (root: ParentNode, selector: string): (string | null)[] =>
  Array.from(root.querySelectorAll(selector), (node) => node.textContent);

let figure: Mounted;
beforeEach(() => {
  figure = mounted(() => <MachineDiagram />);
});
afterEach(() => figure.dispose());

describe('machine diagram', () => {
  it('is one SVG image with an accessible name', () => {
    const svg = figure.host.querySelector('svg');

    expect(svg?.namespaceURI).toBe(SVG_NS);
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toMatch(/state machine/);
    expect(figure.host.querySelectorAll('svg')).toHaveLength(1);
  });

  it('names the four states on plates drawn as the board draws them', () => {
    expect(texts(figure.host, 'rect + text')).toEqual(['ready', 'oneUp', 'wrongPair', 'won']);
    expect(figure.host.querySelectorAll('rect')).toHaveLength(4);
    expect(figure.host.querySelector('rect + text')?.namespaceURI).toBe(SVG_NS);
  });

  it('labels every arrow with its event, the quiet one being the deal from any state', () => {
    const labels = Array.from(figure.host.querySelectorAll('path[marker-end] + text'), (text) => text.textContent);

    expect(labels).toEqual(['turn', 'turn', 'turn', 'turn', 'turnBack', 'deal']);
    expect(figure.host.querySelectorAll('path[marker-end]')).toHaveLength(6);
    expect(figure.text()).toContain('from any state');
    expect(figure.text()).toContain('after a second');
  });

  it('describes every transition in words, and the turn a waiting pair refuses', () => {
    const svg = figure.host.querySelector('svg');
    const description = figure.host.querySelector('desc');

    expect(description?.id).toBe(svg?.getAttribute('aria-describedby'));
    expect(description?.textContent).toBe(
      'ready, on turn, goes to oneUp; ' +
        'oneUp, on turn, goes to ready (a pair); ' +
        'oneUp, on turn, goes to wrongPair (no match); ' +
        'oneUp, on turn, goes to won (the last pair); ' +
        'wrongPair, on turnBack, goes to ready (after a second); ' +
        'any state, on deal, goes to ready; ' +
        'wrongPair takes no turn.'
    );
    expect(figure.text()).toContain('no turn');
  });
});
