import { href } from '@reely/dommy/router';

import type { SitePackage } from './site.packages';

/** Where each part of the site lives: the patterns of its routes, which links are filled in from, and the packages' place on the home page. */
export const sitePaths = {
  home: '/',
  packages: '/#packages',
  dommy: '/dommy',
  docs: '/dommy/docs',
  docsTopic: '/dommy/docs/:topic',
  evolution: '/dommy/evolution',
  evolutionStep: '/dommy/evolution/:step',
  labs: '/labs',
  package: '/:name',
  unknown: '/*rest',
} as const;

export const docHref = (topic: string): string => href(sitePaths.docsTopic, { topic });

export const stepHref = (step: string): string => href(sitePaths.evolutionStep, { step });

/** A package's page: `/signals`, `/dommy`. */
export const packageHref = (name: SitePackage): string => href(sitePaths.package, { name });
