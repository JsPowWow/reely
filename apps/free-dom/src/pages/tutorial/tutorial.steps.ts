import type { JSX } from '@reely/dommy';

import { LearningLinks as FactoryLinks } from './steps/step1.factories';
import factoriesSource from './steps/step1.factories.ts?raw';
import { LearningLinks as JsxLinks } from './steps/step2.jsx';
import jsxSource from './steps/step2.jsx.tsx?raw';
import { LearningLinks as ComponentLinks } from './steps/step3.components';
import componentsSource from './steps/step3.components.tsx?raw';
import { Counter as DomCounter } from './steps/step4.dom';
import domSource from './steps/step4.dom.tsx?raw';

/**
 * One step of the lesson: the markup steps build the same card three ways, then every step
 * builds the same counter with one more reely feature.
 */
export interface TutorialStep {
  slug: string;
  /** Steps that build the same demo share a track; a step's source is diffed against the previous step on its track. */
  track: 'links' | 'counter';
  title: string;
  lead: string;
  Demo: () => JSX.Element;
  source: string;
}

export const tutorialSteps: readonly TutorialStep[] = [
  {
    slug: 'factories',
    track: 'links',
    title: 'Markup with tag factories',
    lead: 'Every HTML tag is a function that returns a real DOM element: props first, children after. No template language and no virtual DOM, so what you build is what the browser shows. Nothing changes after the first render, so the counters below the demo stay at zero.',
    Demo: FactoryLinks,
    source: factoriesSource,
  },
  {
    slug: 'jsx',
    track: 'links',
    title: 'The same markup in JSX',
    lead: 'JSX reads like HTML and compiles to the same function calls, so the card renders exactly the same nodes. Props are DOM properties, so the class goes in className.',
    Demo: JsxLinks,
    source: jsxSource,
  },
  {
    slug: 'components',
    track: 'links',
    title: 'Components from data',
    lead: 'The three links differ only in their data. A component is a plain function of props, and map turns the data into elements. It runs once: there is no re-render to schedule.',
    Demo: ComponentLinks,
    source: componentsSource,
  },
  {
    slug: 'dom',
    track: 'counter',
    title: 'Interactivity by hand',
    lead: 'An element keeps its listeners, so a click can change the page. Here the counter keeps its number in a variable and redraws the output after every click. Watch the counters below the demo: each click removes one text node and adds another.',
    Demo: DomCounter,
    source: domSource,
  },
];
