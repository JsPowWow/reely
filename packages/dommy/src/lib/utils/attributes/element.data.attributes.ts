export const isDataAttribute = (attributeName: string): attributeName is `data-${string}` =>
  attributeName.startsWith('data-');
