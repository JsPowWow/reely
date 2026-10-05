import css from './memory.diagram.module.css';

import type { Memory, MemoryPhase } from './memory.machine';

type MemoryEvent = keyof Memory['events'];

interface StatePlate {
  readonly name: MemoryPhase;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  /** Drawn as the board draws it: a face, a wrong pair waiting, a result posted. */
  readonly look: 'turning' | 'waiting' | 'posted';
  /** An event the state takes nowhere, said under its plate. */
  readonly refuses?: MemoryEvent;
}

interface Transition {
  readonly event: MemoryEvent;
  readonly from: MemoryPhase | 'any state';
  readonly to: MemoryPhase;
  readonly when?: string;
  readonly path: string;
  readonly label: { x: number; y: number; anchor?: 'middle' | 'end' };
}

const plateHeight = 40;

// a 428 by 280 drawing: the two turning states on the top row, what a turn
// leads to under them, the clock's way back up the left side
const states: readonly StatePlate[] = [
  { name: 'ready', x: 70, y: 50, width: 80, look: 'turning' },
  { name: 'oneUp', x: 290, y: 50, width: 80, look: 'turning' },
  {
    name: 'wrongPair',
    x: 50,
    y: 210,
    width: 120,
    look: 'waiting',
    refuses: 'turn',
  },
  { name: 'won', x: 296, y: 210, width: 68, look: 'posted' },
];

const transitions: readonly Transition[] = [
  {
    event: 'turn',
    from: 'ready',
    to: 'oneUp',
    path: 'M150 60H290',
    label: { x: 220, y: 52, anchor: 'middle' },
  },
  {
    event: 'turn',
    from: 'oneUp',
    to: 'ready',
    when: 'a pair',
    path: 'M290 80H150',
    label: { x: 220, y: 100, anchor: 'middle' },
  },
  {
    event: 'turn',
    from: 'oneUp',
    to: 'wrongPair',
    when: 'no match',
    path: 'M310 90L130 210',
    label: { x: 222, y: 160 },
  },
  {
    event: 'turn',
    from: 'oneUp',
    to: 'won',
    when: 'the last pair',
    path: 'M330 90V210',
    label: { x: 340, y: 146 },
  },
  {
    event: 'turnBack',
    from: 'wrongPair',
    to: 'ready',
    when: 'after a second',
    path: 'M84 210V90',
    label: { x: 94, y: 146 },
  },
  {
    event: 'deal',
    from: 'any state',
    to: 'ready',
    path: 'M110 6V50',
    label: { x: 118, y: 22 },
  },
];

const isQuiet = ({ from }: Transition): boolean => from === 'any state';

const said = ({ from, event, to, when }: Transition): string => {
  const condition = when ? ` (${when})` : '';
  return `${from}, on ${event}, goes to ${to}${condition}`;
};

/** The text alternative: every arrow, then what the diagram says under a plate. */
const description = (): string =>
  [
    ...transitions.map(said),
    ...states
      .filter((state) => state.refuses)
      .map((state) => `${state.name} takes no ${state.refuses}`),
  ].join('; ') + '.';

const headId = 'memory-machine-head';
const descriptionId = 'memory-machine-description';

const ArrowHead = ({ id, quiet }: { id: string; quiet: boolean }): Node => (
  <marker
    id={id}
    markerWidth={8}
    markerHeight={8}
    refX={8}
    refY={4}
    orient='auto'
    markerUnits='userSpaceOnUse'
  >
    <path className={quiet ? css.quietHead : css.head} d='M0 0.5L8 4 0 7.5Z' />
  </marker>
);

const Plate = ({ name, x, y, width, look, refuses }: StatePlate): Node => (
  <g>
    <rect
      className={`${css.plate} ${css[look]}`}
      x={x}
      y={y}
      width={width}
      height={plateHeight}
      rx={4}
    />
    <text className={css.state} x={x + width / 2} y={y + 25}>
      {name}
    </text>
    {refuses && (
      <text
        className={css.when}
        x={x + width / 2}
        y={y + plateHeight + 17}
        text-anchor='middle'
      >
        no <tspan className={css.code}>{refuses}</tspan>
      </text>
    )}
  </g>
);

const Arrow = (transition: Transition): Node => {
  const { event, from, when, path, label } = transition;
  const quiet = isQuiet(transition);
  // the second line of the label: the condition, or where a quiet arrow comes from
  const note = quiet ? `from ${from}` : when;
  const head = quiet ? `${headId}-quiet` : headId;
  return (
    <g className={quiet ? css.quiet : undefined}>
      <path className={css.edge} d={path} marker-end={`url(#${head})`} />
      <text
        className={css.event}
        x={label.x}
        y={label.y}
        text-anchor={label.anchor}
      >
        {event}
      </text>
      {note && (
        <text
          className={css.when}
          x={label.x}
          y={label.y + 16}
          text-anchor={label.anchor}
        >
          {note}
        </text>
      )}
    </g>
  );
};

/**
 * The game's state machine as a figure: its four states drawn as the board
 * draws them, and the event on every arrow between them.
 */
export const MachineDiagram = (): Node => (
  <svg
    className={css.diagram}
    viewBox='12 0 428 280'
    aria={{
      role: 'img',
      ariaLabel:
        'The memory game as a state machine: four states and the events between them',
      ariaDescribedby: descriptionId,
    }}
  >
    <desc id={descriptionId}>{description()}</desc>
    <defs>
      <ArrowHead id={headId} quiet={false} />
      <ArrowHead id={`${headId}-quiet`} quiet={true} />
    </defs>
    {transitions.map((transition) => (
      <Arrow {...transition} />
    ))}
    {states.map((state) => (
      <Plate {...state} />
    ))}
  </svg>
);
