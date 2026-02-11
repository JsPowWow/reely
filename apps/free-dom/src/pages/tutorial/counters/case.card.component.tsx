import styles from './case.card.component.module.css';
import type { ChildDOMElement } from '@reely/dommy';

interface CaseCardProps {
  caption: string;
  children?: ChildDOMElement;
}

export const CaseCard = ({ caption, children }: CaseCardProps) => {
  return (
    children && (
      <section className={styles.caseViewContainer}>
        <h2 styles={{ marginRight: 'auto' }}>{caption}</h2>
        {children}
      </section>
    )
  );
};
