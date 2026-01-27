import type { Nullable } from '@reely/utils';

import type { HtmlElementTag, ChildDOMElement, DOMElementFactoryFunction } from './types/dommy.types';

const alwaysConnectedDom = { isConnected: 1 };
const isAlwaysConnectedDom = (value: unknown): value is typeof alwaysConnectedDom => {
  return value === Object.getPrototypeOf(alwaysConnectedDom);
};

// export type TagFunc<Result> = (
//   first?: (Props & PropsWithKnownKeys<Result>) | ChildDOM,
//   ...rest: readonly ChildDOM[]
// ) => Result;
//
// export type Tags = Readonly<Record<string, TagFunc<Element>>> & {
//   [K in HtmlElementTag]: TagFunc<HTMLElementTagNameMap[K]>;
// };
// interface TagFunction {
//   [key: string]: any;
//   (ns: Nullable<string>, tagName: HtmlElementTag, ...args: ChildDOM[]): Element;
// }

export type Tags = Readonly<Record<string, DOMElementFactoryFunction>> & {
  [K in HtmlElementTag]: DOMElementFactoryFunction;
};
const tagFunction = (ns: Nullable<string>, tagName: HtmlElementTag, ...args: ChildDOMElement[]): Element => {
  //const [{ is, ...props }, ...children] = isAlwaysConnectedDom(protoOf(args[0] ?? 0))
  const [{ is, ...props }, ...children] = isAlwaysConnectedDom(Object.getPrototypeOf(args[0] ?? 0))
    ? args
    : [Object.create({}), ...args];

  const dom: Element = ns ? document.createElementNS(ns, tagName, { is }) : document.createElement(tagName, { is });

  console.log(dom, props, children);
  // const [elementProps, elementChildren] = extractChildrenFromProps(props, children);

  // isInstanceOf(HTMLElement, dom) && assignElementRef(props)(dom);

  // for (const entry of Object.entries(elementProps)) {
  //   if (isElementFactoryOptionProp(entry[0])) {
  //     continue;
  //   }
  //
  //   updateSetter(dom, ...entry);
  // }

  return dom;
  //return add(dom, elementChildren);
};

type BoundNamespaceTagFn = (...args: readonly ChildDOMElement[]) => Element;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const tags = new Proxy(
  (ns: string) =>
    new Proxy(tagFunction, {
      get: (_, tagName: HtmlElementTag): BoundNamespaceTagFn => tagFunction.bind(null, ns, tagName),
    }),
  {
    get: (_, tagName: HtmlElementTag): BoundNamespaceTagFn => tagFunction.bind(null, undefined, tagName),
  }
) as unknown as Tags;
// as unknown as Tags & ((namespaceURI: string) => Readonly<Record<string, TagFunc<Element>>>);

export interface Dommy {
  // readonly state: typeof state;
  // readonly derive: <T>(f: () => T) => State<T>;
  //readonly add: <E extends Element | DocumentFragment>(dom: E, ...children: readonly ChildDOM[]) => E;
  // readonly tags: Tags & ((namespaceURI: string) => Readonly<Record<string, TagFunc<Element>>>);
  readonly tags: Tags;
}

export const dommy: Dommy = {
  tags,
  // add,
  // state,
  // derive,
};
