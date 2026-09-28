import { circle, signal, svg } from '@reely/dommy';

const color = signal('red');
export const Icon = () => (
  <svg viewBox="0 0 24 24" className="icon" onClick={(event) => event.currentTarget.viewBox}>
    <circle cx={12} cy={12} r={10} fill={color} stroke-width={2} />
  </svg>
);
export const factoryIcon = svg({ viewBox: '0 0 10 10' }, circle({ r: 4, fill: () => color.value }));
