import css from './sectors.module.css';

interface Result {
  place: number;
  name: string;
  time: string;
}

const results: readonly Result[] = [
  { place: 1, name: 'Car 3', time: '1:21.4' },
  { place: 2, name: 'Car 7', time: '+0.8' },
  { place: 3, name: 'Car 1', time: '+2.3' },
];

// A component is a function of props; it runs once and returns real DOM.
const Row = ({ place, name, time }: Result): Node => (
  <li className={css.row}>
    <span className={css.place}>{place}</span>
    <span className={css.name}>{name}</span>
    <span className={css.time}>{time}</span>
  </li>
);

export const Grid = (): Node => <ol className={css.grid}>{results.map((result) => <Row {...result} />)}</ol>;
