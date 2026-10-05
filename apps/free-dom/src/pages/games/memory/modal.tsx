import { dialog, effect } from '@reely/dommy';
import type { ReelyNode, Signal } from '@reely/dommy';

import css from './memory.module.css';

interface ModalProps {
  /** Shows the dialog while true; the dialog sets it false when the reader closes it. */
  open: Signal<boolean>;
  title: ReelyNode;
  children?: ReelyNode;
}

let modals = 0;

/**
 * A modal dialog: while it is open the page behind it is dimmed, inert and still. Escape, a click on the
 * dimmed page, or a button of its own that sets `open` to false closes it.
 */
export const Modal = ({ open, title, children }: ModalProps): HTMLDialogElement => {
  const titleId = `modal-title-${++modals}`;
  const box = dialog(
    {
      className: css.modal,
      aria: { ariaLabelledby: titleId },
      onCancel: (event) => {
        event.preventDefault();
        open.value = false;
      },
      // the dialog has no padding, so a click on the dialog itself landed on its backdrop
      onClick: (event) => {
        if (event.target === event.currentTarget) {
          open.value = false;
        }
      },
    },
    <div className={css.modalBody}>
      <h2 id={titleId} className={css.modalTitle}>
        {title}
      </h2>
      {children}
    </div>
  );
  effect(() => {
    if (open.value && !box.open) {
      box.showModal();
    } else if (!open.value && box.open) {
      box.close();
    }
  });
  return box;
};
