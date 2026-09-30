import { Keyed } from '@reely/dommy';
import type { ReelyNode } from '@reely/dommy';

/** Renders the markup a localized text holds, and renders it anew when the language changes. */
export const Localized = ({ view }: { view: () => () => ReelyNode }): Node => (
  <Keyed value={view}>{(View) => <View />}</Keyed>
);
