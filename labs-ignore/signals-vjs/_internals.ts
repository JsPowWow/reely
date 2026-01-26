/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts -nocheck

import type { AnyFunction, Nullable } from '@reely/utils';
import { hasSome, isInstanceOf, isSomeFunction } from '@reely/utils';

import { addAndScheduleOnFirst, addStatesToGc, keepConnected } from './_gc';
import { isState, state, updateSetter } from './state';
import { assignElementRef, isElementFactoryOptionProp } from '../helpers/element.assign.properties';
import { extractChildrenFromProps } from '../utils/element.children';

import type { TagFunc, Tags } from './dommy';
import type { Binding, Deps, InternalState, Listener, State } from './state';
import type { BindingFunc, ChildDOM, DOMElement, HtmlElementTag, ValidChildDOMNode } from '../types/dommy.types';

const protoOf = Object.getPrototypeOf;

let changedStates: Nullable<Set<InternalState>> = undefined;
let derivedStates: Nullable<Set<InternalState>> = undefined;
let curNewDerives: Nullable<Listener[]> = undefined;

const _undefined = void 0;

let curDeps: Nullable<Deps> = undefined;
const runAndCaptureDeps = <E extends Nullable<ValidChildDOMNode>>(f: AnyFunction, deps: Deps, arg: E): E => {
  const prevDeps = curDeps;
  curDeps = deps;
  try {
    return f(arg);
  } catch (e) {
    console.error(e);
    return arg;
  } finally {
    curDeps = prevDeps;
  }
};

export const stateProto: ThisType<InternalState> = {
  get val() {
    curDeps?._getters?.add(this);
    return this.rawVal;
  },

  get oldVal() {
    curDeps?._getters?.add(this);
    return this._oldVal;
  },

  set val(v) {
    curDeps?._setters?.add(this);
    if (v !== this.rawVal) {
      this.rawVal = v;
      this._bindings.length + this._listeners.length
        ? (derivedStates?.add(this), (changedStates = addAndScheduleOnFirst(changedStates, this, updateDoms)))
        : (this._oldVal = v);
    }
  },
};
export const isStateProto = (value: unknown): value is InternalState => {
  return value === stateProto;
};

const funcProto = protoOf(protoOf);
export const isFuncProto = (value: unknown): value is AnyFunction => {
  return value === funcProto;
};
const alwaysConnectedDom = { isConnected: 1 };
const objProto = protoOf(alwaysConnectedDom);

const isAlwaysConnectedDom = (value: unknown): value is typeof alwaysConnectedDom => {
  return value === objProto;
};

export const bind = <E extends Nullable<Node>>(f: BindingFunc, dom?: E): E => {
  const deps = { _getters: new Set<InternalState>(), _setters: new Set<InternalState>() },
    binding: Binding = { f },
    prevNewDerives = curNewDerives;
  curNewDerives = [];
  let newDom = runAndCaptureDeps(f, deps, dom);
  // TODO AR some
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  newDom = (newDom ?? document).nodeType ? newDom : new Text(newDom as unknown as string);
  for (const d of deps._getters) deps._setters.has(d) || (addStatesToGc(d), d._bindings.push(binding));
  for (const l of curNewDerives) l._dom = newDom;
  curNewDerives = prevNewDerives;
  binding._dom = newDom;
  return newDom;
};

const deriveInternal = <E extends Nullable<ValidChildDOMNode>>(
  f: () => E,
  s: State<unknown> = state<E>(),
  dom?: E
): State<E> => {
  const deps: Deps = { _getters: new Set(), _setters: new Set() };
  const listener: Listener = { f, s };
  listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom;
  s.val = runAndCaptureDeps(f, deps, s.rawVal);
  for (const d of deps._getters) deps._setters.has(d) || (addStatesToGc(d), d._listeners.push(listener));
  return s;
};

export const derive = <S>(f: () => S): State<S> => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return deriveInternal(f as () => ValidChildDOMNode) as State<S>;
};

export const add = <E extends Element | DocumentFragment>(dom: E, ...children: readonly ChildDOM[]): E => {
  // for (const c of children.flat(Infinity)) { // TODO AR why ? flatChildren
  for (const c of children.flat()) {
    const child = isState<ValidChildDOMNode>(c) ? bind(() => c.val) : isSomeFunction(c) ? bind(c) : c;
    hasSome(child) && dom.append(isInstanceOf(Node, child) ? child : String(child));
  }
  return dom;
};

// type CreateFromTagFn = ((ns: string, name: string, ...args: unknown[]) => Element) & {
//   [key: string]: AnyFunction;
// };

const tag = (ns: Nullable<string>, tagName: HtmlElementTag, ...args: ChildDOM[]): Element => {
  const [{ is, ...props }, ...children] = isAlwaysConnectedDom(protoOf(args[0] ?? 0))
    ? args
    : [Object.create({}), ...args];

  const dom: DOMElement<HtmlElementTag> | Element = ns
    ? document.createElementNS(ns, tagName, { is })
    : document.createElement<HtmlElementTag>(tagName, { is });

  const [elementProps, elementChildren] = extractChildrenFromProps(props, children);

  isInstanceOf(HTMLElement, dom) && assignElementRef(props)(dom);

  for (const entry of Object.entries(elementProps)) {
    if (isElementFactoryOptionProp(entry[0])) {
      continue;
    }

    updateSetter(dom, ...entry);
  }

  return add(dom, elementChildren);
};

const update = (dom: Element, newDom?: Node): void | false =>
  newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove(); // TODO AR return type

const updateDoms = (): void => {
  let iter = 0,
    derivedStatesArray = changedStates ? [...changedStates].filter((s) => s.rawVal !== s._oldVal) : [];
  do {
    derivedStates = new Set();
    for (const l of new Set(derivedStatesArray.flatMap((s) => (s._listeners = keepConnected(s._listeners)))))
      deriveInternal(l.f, l.s, l._dom), (l._dom = _undefined);
  } while (++iter < 100 && (derivedStatesArray = [...derivedStates]).length);
  const changedStatesArray = changedStates ? [...changedStates].filter((s) => s.rawVal !== s._oldVal) : [];
  changedStates = _undefined;
  for (const b of new Set(changedStatesArray.flatMap((s) => (s._bindings = keepConnected(s._bindings)))))
    update(b._dom, bind(b.f, b._dom)), (b._dom = _undefined);
  for (const s of changedStatesArray) s._oldVal = s.rawVal;
};

// const handler = (ns?: string): ProxyHandler<Tags> => ({
//   get: (_, tagName: HtmlElementTag) => tag.bind(null, ns, tagName),
// });

type BoundNamespaceTagFn = (...args: readonly ChildDOM[]) => Element;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const tags = new Proxy(
  (ns: string) =>
    new Proxy(tag, {
      get: (_, tagName: HtmlElementTag): BoundNamespaceTagFn => tag.bind(null, ns, tagName),
    }),
  {
    get: (_, tagName: HtmlElementTag): BoundNamespaceTagFn => tag.bind(null, undefined, tagName),
  }
) as unknown as Tags & ((namespaceURI: string) => Readonly<Record<string, TagFunc<Element>>>);
