import type { Nullable } from '@reely/utils';

import { Counter as DomCounter } from './steps/step1.dom';
import domSource from './steps/step1.dom.tsx?raw';

/**
 * One step of the lesson: every step builds the same counter with one more reely feature.
 */
export interface TutorialStep {
  slug: string;
  title: string;
  lead: string;
  Demo: () => HTMLElement;
  source: string;
}

export const tutorialSteps: readonly TutorialStep[] = [
  {
    slug: 'dom',
    title: 'Build the DOM by hand',
    lead: 'Tag factories return real DOM nodes, so the counter keeps its number in a variable and redraws the output after every click. Watch the counter below the demo: each click removes one text node and adds another.',
    Demo: DomCounter,
    source: domSource,
  },
];

export const findTutorialStep = (slug: Nullable<string>): number =>
  tutorialSteps.findIndex((step) => step.slug === slug);
