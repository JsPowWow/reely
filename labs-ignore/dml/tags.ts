import * as dommy from '@reely/dommy';

import type { DOMElementFactoryFunction, HtmlElementTag } from '@reely/dommy';

/** dommy's tag factories, each of which also appends what it builds. */
export type Tags = { readonly [Tag in HtmlElementTag]: DOMElementFactoryFunction<Tag> };

const factories = dommy as unknown as Readonly<Record<string, (...args: unknown[]) => Element>>;

/**
 * Tag factories that append each element to the parent `parentOf` names at that moment, and
 * return it as dommy's own factories do. dommy's factories stay as they are: only these append,
 * so a child built as a prop, or a row `For` renders, never lands anywhere by surprise.
 */
export const appendingTags = (parentOf: () => Element | undefined): Tags =>
  new Proxy({} as Tags, {
    get:
      (_tags, tag: string) =>
      (...args: unknown[]): Element => {
        const element = (
          factories[tag] ??
          ((): never => {
            throw new Error(`no tag factory ${tag}`);
          })
        )(...args);
        parentOf()?.append(element);
        return element;
      },
  });
