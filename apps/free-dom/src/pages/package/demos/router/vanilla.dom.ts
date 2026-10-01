type Tag = keyof HTMLElementTagNameMap;

/**
 * An element of `tag` with its properties set and its children appended: the one helper the
 * router's vanilla demos build their views with.
 */
export const el = <K extends Tag>(
  tag: K,
  properties: Partial<HTMLElementTagNameMap[K]> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] => {
  const element = Object.assign(document.createElement(tag), properties);
  element.append(...children);
  return element;
};
