import type { AnyFunction, KeyValueObject } from '@reely/utils';
import { getPropertyDescriptor, isSomeFunction } from '@reely/utils';

import { bind, derive, isStateProto } from './_internals';

import type { BindingFunc } from '../types/dommy.types';

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

//type Deps = { _getters: Set<InternalState>; _setters: Set<InternalState> };
type Listener = Binding & { s: State<unknown> };
type Binding = { f: BindingFunc; _dom?: Node };

const protoOf = Object.getPrototypeOf;
const propSetterCache: KeyValueObject<CallableFunction | 0> = {};

export const isState = (value: unknown): value is InternalState => {
  return isStateProto(protoOf(value ?? 0));
};

export const updateSetter = <V>(element: Element, property: string, value: V): V => {
  const cacheKey = element.tagName + ',' + property;
  const propSetter = (propSetterCache[cacheKey] ??= getPropertyDescriptor(property, protoOf(element))?.set ?? 0);

  const setter = property.startsWith('on')
    ? (newV: AnyFunction, oldV: AnyFunction): void => {
        const event = property.slice(2);
        element.removeEventListener(event, oldV);
        element.addEventListener(event, newV);
      }
    : propSetter
    ? propSetter.bind(element)
    : element.setAttribute.bind(element, property);

  if (!property.startsWith('on') && isSomeFunction(value)) {
    value = derive(value);
  }

  isState(value)
    ? bind(() => {
        setter(value.val, value._oldVal);
        return element;
      }, element)
    : setter(value);

  return value;
};
