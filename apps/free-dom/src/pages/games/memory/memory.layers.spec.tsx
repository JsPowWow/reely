import { LayersDiagram } from './memory.layers';
import { mounted } from '../../../testing/dom.testing';

import type { LayersLabels } from './memory.layers';
import type { Mounted } from '../../../testing/dom.testing';

const SVG_NS = 'http://www.w3.org/2000/svg';

const labels: LayersLabels = {
  name: 'The memory game as layers',
  page: 'the page',
  pageHolds: 'cards, dialogs, CSS',
  time: 'time',
  timeHolds: 'the timer',
  storage: 'storage',
  storageHolds: 'the best ten',
  flow: 'the flow',
  flowDoes: 'what can happen when',
  rules: 'the rules',
  rulesAre: 'plain functions over plain data',
  eventsIn: 'events go in',
  stateOut: 'state is read out',
  afterASecond: 'after a second',
  calls: 'calls',
  inward: 'nothing inside knows what is outside',
  sends: 'sends',
  reads: 'reads',
};

const texts = (root: ParentNode, selector: string): (string | null)[] =>
  Array.from(root.querySelectorAll(selector), (node) => node.textContent);

let figure: Mounted;
beforeEach(() => {
  figure = mounted(() => <LayersDiagram labels={labels} />);
});
afterEach(() => figure.dispose());

describe('layers diagram', () => {
  it('is one SVG image named by its labels', () => {
    const svg = figure.host.querySelector('svg');

    expect(svg?.namespaceURI).toBe(SVG_NS);
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('The memory game as layers');
    expect(figure.host.querySelectorAll('svg')).toHaveLength(1);
  });

  it('draws five plates, each named after its layer with the code it holds', () => {
    expect(texts(figure.host, 'rect + text > tspan:first-child')).toEqual([
      'the flow',
      'the rules',
      'the page',
      'time',
      'storage',
    ]);
    expect(texts(figure.host, 'rect + text > tspan:last-child')).toEqual([
      'what can happen when',
      'plain functions over plain data',
      'cards, dialogs, CSS',
      'the timer',
      'the best ten',
    ]);
    expect(figure.host.querySelector('rect + text')?.namespaceURI).toBe(SVG_NS);
  });

  it('names the states of the flow, the functions of the rules and the helpers at the edges', () => {
    const words = figure.text();

    for (const identifier of [
      'ready',
      'oneUp',
      'wrongPair',
      'won',
      'MemoryTable',
      'turnCard',
      'shuffled',
      'postResult',
      'MemoryCard',
      'Victory',
      'BestTen',
      'effect',
      'later',
      'persisted',
      'localStorage',
    ]) {
      expect(words).toContain(identifier);
    }
  });

  it('sends the events in and reads the state out across every border, and calls inward', () => {
    const arrows = Array.from(figure.host.querySelectorAll('path[marker-end]'), (path) =>
      path.getAttribute('marker-end')
    );

    expect(arrows).toEqual([
      'url(#memory-layers-head)',
      'url(#memory-layers-head)',
      'url(#memory-layers-head-read)',
      'url(#memory-layers-head)',
      'url(#memory-layers-head-read)',
      'url(#memory-layers-head-read)',
    ]);
    expect(texts(figure.host, 'path[marker-end] + text')).toEqual([
      'calls',
      'turndeal',
      'tablebestplace',
      'turnBack',
      'wrongPair',
      'best',
    ]);
    expect(figure.text()).toContain('events go in');
    expect(figure.text()).toContain('state is read out');
    expect(figure.text()).toContain('after a second');
  });

  it('describes every crossing in words, then the call inward and the rule', () => {
    const svg = figure.host.querySelector('svg');
    const description = figure.host.querySelector('desc');

    expect(description?.id).toBe(svg?.getAttribute('aria-describedby'));
    expect(description?.textContent).toBe(
      'the page sends turn, deal; ' +
        'the page reads table, best, place; ' +
        'time sends turnBack; ' +
        'time reads wrongPair; ' +
        'storage reads best; ' +
        'the flow (ready, oneUp, wrongPair, won) calls the rules (MemoryTable, turnCard, shuffled, postResult); ' +
        'nothing inside knows what is outside.'
    );
  });

  it('takes its words from the labels, the code staying as it is', () => {
    const other = mounted(() => (
      <LayersDiagram
        labels={{
          ...labels,
          name: 'Игра слоями',
          rules: 'правила',
          inward: 'внутри никто не знает, что снаружи',
          reads: 'читает',
        }}
      />
    ));

    expect(other.host.querySelector('svg')?.getAttribute('aria-label')).toBe('Игра слоями');
    expect(other.text()).toContain('правила');
    expect(other.text()).toContain('внутри никто не знает, что снаружи');
    expect(other.text()).not.toContain('the rules');
    expect(other.host.querySelector('desc')?.textContent).toContain('storage читает best');
    expect(other.text()).toContain('turnCard');
    other.dispose();
  });
});
