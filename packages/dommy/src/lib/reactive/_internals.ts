/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import type { AnyFunction, Nullable } from '@reely/utils';
import { hasSome } from '@reely/utils';

import { updateSetter } from './state';

const protoOf = Object.getPrototypeOf;

let changedStates: Nullable<Set<InternalState>> = undefined;
let derivedStates: Nullable<Set<InternalState>> = undefined;
let curNewDerives: Nullable<Listener[]> = undefined;

const gcCycleInMs = 1000;

const _undefined = void 0;

const addAndScheduleOnFirst = (
  set: Nullable<Set<InternalState>>,
  s: InternalState,
  f: VoidFunction,
  waitMs?: number
): Set<InternalState> => (set ?? (waitMs ? setTimeout(f, waitMs) : queueMicrotask(f), new Set())).add(s);

let curDeps: Nullable<Deps> = undefined;
const runAndCaptureDeps = (f: AnyFunction, deps: Deps, arg: Node): Node => {
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

const keepConnected = <T extends Binding>(l: T[]): T[] => l.filter((b) => b._dom?.isConnected);

let statesToGc: Nullable<Set<InternalState>> = undefined;
const addStatesToGc = (d: InternalState): Set<InternalState> =>
  (statesToGc = addAndScheduleOnFirst(
    statesToGc,
    d,
    () => {
      if (!statesToGc) return;

      for (const s of statesToGc)
        (s._bindings = keepConnected(s._bindings)), (s._listeners = keepConnected(s._listeners));

      statesToGc = _undefined;
    },
    gcCycleInMs
  ));

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
    console.log('v', v);
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

export function state<S>(): State<S>;
export function state<S>(initVal: S): State<S>;
export function state<S>(initVal?: S): State<S | undefined> {
  const result = {
    rawVal: initVal,
    _oldVal: initVal,
    _bindings: [],
    _listeners: [],
  };
  Reflect.setPrototypeOf(result, stateProto);

  // TODO AR some
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return result as unknown as State<S | undefined>;
}

// export type Val<T> = State<T> | T;

// export type PropValue = Primitive | ((e: any) => void) | null;

// export type PropValueOrDerived = PropValue | StateView<PropValue> | (() => PropValue);

// export type Props = Record<string, PropValueOrDerived> & { class?: PropValueOrDerived; is?: string };

// export type PropsWithKnownKeys<ElementType> = Partial<{ [K in keyof ElementType]: PropValueOrDerived }>;

export type TagFunc<Result> = (
  first?: (Props & PropsWithKnownKeys<Result>) | ChildDOM,
  ...rest: readonly ChildDOM[]
) => Result;

export const bind = <E extends Nullable<Node>>(f: AnyFunction, dom: E): E => {
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

export const derive = <T>(f: () => T, s = state<Node>(), dom?: Node): State<T> => {
  const deps: Deps = { _getters: new Set(), _setters: new Set() };
  const listener: Listener = { f, s };
  listener._dom = dom ?? curNewDerives?.push(listener) ?? alwaysConnectedDom;
  s.val = runAndCaptureDeps(f, deps, s.rawVal);
  for (const d of deps._getters) deps._setters.has(d) || (addStatesToGc(d), d._listeners.push(listener));
  return s;
};

export const add = <E extends Element | DocumentFragment>(dom: E, ...children: readonly ChildDOM[]): E => {
  // for (const c of children.flat(Infinity)) { // TODO AR why ?
  for (const c of children.flat()) {
    const protoOfC = protoOf(c ?? 0);
    const child = isStateProto(protoOfC) ? bind(() => c.val) : isFuncProto(protoOfC) ? bind(c) : c;
    hasSome(child) && dom.append(child);
  }
  return dom;
};

type CreateFromTagFn = ((ns: string, name: string, ...args: unknown[]) => Element) & {
  [key: string]: AnyFunction;
};

const tag: CreateFromTagFn = (ns, name, ...args): Element => {
  const [{ is, ...props }, ...children] = isAlwaysConnectedDom(protoOf(args[0] ?? 0)) ? args : [{}, ...args];

  const dom = ns ? document.createElementNS(ns, name, { is }) : document.createElement(name, { is });

  for (const entry of Object.entries(props)) {
    updateSetter(dom, ...entry);
  }

  return add(dom, children);
};

const update = (dom: Element, newDom?: Node): void | false =>
  newDom ? newDom !== dom && dom.replaceWith(newDom) : dom.remove(); // TODO AR return type

const updateDoms = (): void => {
  let iter = 0,
    derivedStatesArray = changedStates ? [...changedStates].filter((s) => s.rawVal !== s._oldVal) : [];
  do {
    derivedStates = new Set();
    for (const l of new Set(derivedStatesArray.flatMap((s) => (s._listeners = keepConnected(s._listeners)))))
      derive(l.f, l.s, l._dom), (l._dom = _undefined);
  } while (++iter < 100 && (derivedStatesArray = [...derivedStates]).length);
  const changedStatesArray = changedStates ? [...changedStates].filter((s) => s.rawVal !== s._oldVal) : [];
  changedStates = _undefined;
  for (const b of new Set(changedStatesArray.flatMap((s) => (s._bindings = keepConnected(s._bindings)))))
    update(b._dom, bind(b.f, b._dom)), (b._dom = _undefined);
  for (const s of changedStatesArray) s._oldVal = s.rawVal;
};

export const handler = (ns: string): ProxyHandler<typeof tag> => ({ get: (_, name) => tag.bind(null, ns, name) });

export const tags: Tags & ((namespaceURI: string) => Readonly<Record<string, TagFunc<Element>>>) = new Proxy(
  (ns) => new Proxy(tag, handler(ns)),
  handler()
);
