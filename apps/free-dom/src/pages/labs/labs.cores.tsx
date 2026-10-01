import css from './labs.module.css';

const cores = ['act', 'restructured', 'push-pull'] as const;

const measureOrder = ['size', 'wide', 'deep', 'diamond', 'batch', 'churn'] as const;

type Measure = (typeof measureOrder)[number];

/** What the signal-cores lab measured when dommy chose its core, the same figures as its README. */
const measured = {
  size: ['1509 B', '1720 B', '1825 B'],
  wide: ['5.5 ms', '4.8 ms', '2.9 ms'],
  deep: ['39.2 ms', '34.8 ms', '39.3 ms'],
  diamond: ['49.5 ms', '43.0 ms', '46.0 ms'],
  batch: ['13.4 ms', '18.7 ms', '12.3 ms'],
  churn: ['10.7 ms', '6.9 ms', '5.3 ms'],
} satisfies Record<Measure, readonly [string, string, string]>;

interface CoresTableProps {
  caption: string;
  labels: Record<Measure, string>;
}

/** The three cores side by side, one row per measure, the one that shipped last and marked. */
export const CoresTable = ({ caption, labels }: CoresTableProps): Node => (
  <div className={css.sheet}>
    <table className={css.cores}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <td />
          {cores.map((core) => (
            <th scope='col'>{core}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {measureOrder.map((measure) => (
          <tr>
            <th scope='row'>{labels[measure]}</th>
            {measured[measure].map((figure) => (
              <td>{figure}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
