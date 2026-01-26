import { dommy } from '@reely/dommy';
import type { Nullable } from '@reely/utils';

interface ListItemProps {
  text: string;
}
const ListItem = ({ text }: ListItemProps) => {
  const deleted = dommy.state(false);
  return (): Nullable<HTMLLIElement> =>
    deleted.val ? null : dommy.tags.li(text, dommy.tags.a({ onclick: () => (deleted.val = true) }, '❌'));
};

export const EditableList = (): HTMLDivElement => {
  const listDom = dommy.tags.ul();
  const textDom = dommy.tags.input({ type: 'text' });
  return dommy.tags.div(
    textDom,
    ' ',
    dommy.tags.button({ onclick: () => dommy.add(listDom, ListItem({ text: textDom.value })) }, '➕'),
    listDom
  );
};
