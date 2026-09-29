import type { DommyElement } from './dommy.types';
/** Any DOM event a handler prop can receive. */
export type DOMElementEventType = Event;

export type DOMElementEvent<Evt extends DOMElementEventType, Elt extends DommyElement> = Omit<Evt, 'currentTarget'> &
  Readonly<{ currentTarget: Elt }>;

/**
 * Handler props of an element: the DOM name `onkeydown` and its camelCase form `onKeyDown`,
 * a capital letter for every word, as React writes it (`dblclick` is `onDblClick`).
 */
export type DOMElementEvents<T extends DommyElement> = {
  [K in HandlerName as K | CamelCaseHandlerName<K>]?: DOMElementEventHandlerProp<HandlerEvent<K>, T>;
};

type HandlerName = Extract<keyof GlobalEventHandlers, `on${string}`>;

/** The event a handler receives: `PointerEvent` for `onclick`, `KeyboardEvent` for `onkeydown`. */
type HandlerEvent<K extends HandlerName> =
  NonNullable<GlobalEventHandlers[K]> extends (event: infer Evt) => unknown ? Extract<Evt, Event> : never;

type CamelCaseHandlerName<K> = K extends `on${infer EventType}`
  ? `on${EventType extends keyof EventTypeWords ? EventTypeWords[EventType] : Capitalize<EventType>}`
  : never;

/** The words of the DOM event types that have more than one; the others take a capital letter. */
interface EventTypeWords {
  animationcancel: 'AnimationCancel';
  animationend: 'AnimationEnd';
  animationiteration: 'AnimationIteration';
  animationstart: 'AnimationStart';
  auxclick: 'AuxClick';
  beforeinput: 'BeforeInput';
  beforematch: 'BeforeMatch';
  beforetoggle: 'BeforeToggle';
  canplay: 'CanPlay';
  canplaythrough: 'CanPlayThrough';
  contextlost: 'ContextLost';
  contextmenu: 'ContextMenu';
  contextrestored: 'ContextRestored';
  cuechange: 'CueChange';
  dblclick: 'DblClick';
  dragend: 'DragEnd';
  dragenter: 'DragEnter';
  dragleave: 'DragLeave';
  dragover: 'DragOver';
  dragstart: 'DragStart';
  durationchange: 'DurationChange';
  formdata: 'FormData';
  gotpointercapture: 'GotPointerCapture';
  keydown: 'KeyDown';
  keypress: 'KeyPress';
  keyup: 'KeyUp';
  loadeddata: 'LoadedData';
  loadedmetadata: 'LoadedMetadata';
  loadstart: 'LoadStart';
  lostpointercapture: 'LostPointerCapture';
  mousedown: 'MouseDown';
  mouseenter: 'MouseEnter';
  mouseleave: 'MouseLeave';
  mousemove: 'MouseMove';
  mouseout: 'MouseOut';
  mouseover: 'MouseOver';
  mouseup: 'MouseUp';
  pointercancel: 'PointerCancel';
  pointerdown: 'PointerDown';
  pointerenter: 'PointerEnter';
  pointerleave: 'PointerLeave';
  pointermove: 'PointerMove';
  pointerout: 'PointerOut';
  pointerover: 'PointerOver';
  pointerrawupdate: 'PointerRawUpdate';
  pointerup: 'PointerUp';
  ratechange: 'RateChange';
  scrollend: 'ScrollEnd';
  securitypolicyviolation: 'SecurityPolicyViolation';
  selectionchange: 'SelectionChange';
  selectstart: 'SelectStart';
  slotchange: 'SlotChange';
  timeupdate: 'TimeUpdate';
  transitioncancel: 'TransitionCancel';
  transitionend: 'TransitionEnd';
  transitionrun: 'TransitionRun';
  transitionstart: 'TransitionStart';
  volumechange: 'VolumeChange';
}

export type DOMElementEventHandler<Evt extends DOMElementEventType, Elt extends DommyElement> = (
  event: DOMElementEvent<Evt, Elt>
) => void;

export type DOMElementEventHandlerOptions = AddEventListenerOptions & EventListenerOptions;

export type DOMElementEventHandlerDescriptor<Evt extends DOMElementEventType, Elt extends DommyElement> = {
  handleEvent: DOMElementEventHandler<Evt, Elt>;
} & DOMElementEventHandlerOptions;

export type DOMElementEventHandlerProp<Evt extends DOMElementEventType, Elt extends DommyElement> =
  | DOMElementEventHandler<Evt, Elt>
  | DOMElementEventHandlerDescriptor<Evt, Elt>
  | readonly DOMElementEventHandlerProp<Evt, Elt>[];
