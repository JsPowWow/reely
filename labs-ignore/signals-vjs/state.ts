import type { KeyValueObject } from '@reely/utils';
import { getPropertyDescriptor, isSomeFunction } from '@reely/utils';

import { bind, derive, isStateProto, stateProto } from './_internals';

import type { BindingFunc, ValidChildDOMNode } from '../types/dommy.types';

export interface State<S> {
  val: S;
  readonly oldVal: S;
  readonly rawVal: S;
}

export interface InternalState<S = unknown> extends State<S> {
  rawVal: S;
  _oldVal: S;
  _bindings: Binding[];
  _listeners: Listener[];
}

export type Deps = { _getters: Set<InternalState>; _setters: Set<InternalState> };
export type Listener = Binding & { s: State<unknown> };
export type Binding = {
  f: BindingFunc;
  _dom?: ValidChildDOMNode | { isConnected: number };
};

export const isState = <V>(value: unknown): value is InternalState<V> => {
  return isStateProto(Object.getPrototypeOf(value ?? 0));
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

const propSetterCache: KeyValueObject<CallableFunction | 0> = {};
export const updateSetter = <V>(element: Element, property: string, value: V | State<V>): V | State<V> => {
  const cacheKey = element.tagName + ',' + property;
  const propSetter = (propSetterCache[cacheKey] ??=
    getPropertyDescriptor(property, Object.getPrototypeOf(element))?.set ?? 0);

  const setter = property.startsWith('on')
    ? (newV: EventListener, oldV: EventListener): void => {
        const event = property.slice(2);
        element.removeEventListener(event, oldV);
        element.addEventListener(event, newV);
      }
    : propSetter
    ? propSetter.bind(element)
    : element.setAttribute.bind(element, property);

  if (!property.startsWith('on') && isSomeFunction(value)) {
    value = derive<V>(value);
  }

  isState(value)
    ? bind(() => {
        setter(value.val, value._oldVal);
        return element;
      }, element)
    : setter(value);

  return value;
};
