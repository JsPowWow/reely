import { Keyed } from '@reely/dommy';
import type { ReelyNode } from '@reely/dommy';

/**
 * Renders the markup a localized text holds, and renders it anew when the language changes. `props` go
 * to every rendering: nodes the page builds once, such as live demos, keep their state across a switch.
 */
export function Localized(props: { view: () => () => ReelyNode }): Node;
export function Localized<P extends object>(props: { view: () => (props: P) => ReelyNode; props: P }): Node;
export function Localized<P extends object>({
  view,
  props,
}: {
  view: () => (props?: P) => ReelyNode;
  props?: P;
}): Node {
  return <Keyed value={view}>{(View) => View(props)}</Keyed>;
}
