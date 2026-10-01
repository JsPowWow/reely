/** Where each part of the site lives; routes and links are built from these. */
export const sitePaths = {
  home: '/',
  packages: '/#packages',
  dommy: '/dommy',
  docs: '/dommy/docs',
  evolution: '/dommy/evolution',
  labs: '/labs',
} as const;

export const docHref = (slug: string): string => `${sitePaths.docs}/${slug}`;

export const stepHref = (slug: string): string => `${sitePaths.evolution}/${slug}`;
